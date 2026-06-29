#!/usr/bin/env python3
"""
Promethium Miner — multi-core CPU stratum miner. Connects to the Promethium node
by default and mines to an address you control, using ALL your CPU cores.

Out of the box it:
  * connects to the official Promethium stratum endpoint (override STRATUM_URL),
  * generates a local Promethium address if you don't supply one (non-custodial;
    key saved to PROM_KEYFILE — BACK IT UP),
  * if you give it a Solana keypair, claims your difficulty discount by signing
    each block locally (the key never leaves your machine),
  * spreads the hashing across all CPU cores, and reconnects automatically.

Env:
  STRATUM_URL     host:port of the endpoint (default stratum.promethium.work:3335)
  MINING_ADDRESS  your prom address; auto-generated if unset
  PROM_NET        mainnet | regtest | testnet (for auto-generation; default mainnet)
  PROM_KEYFILE    where the auto-generated key is saved (default ~/.prom-mining-key.txt)
  SOLANA_KEYPAIR  optional: solana-keygen JSON or 64-byte hex, to claim the discount
  WORKER_NAME     optional label (default 'cpu')
  PROM_THREADS    number of mining processes (default: all CPU cores)

Requirements: pip install pynacl   (only if using SOLANA_KEYPAIR for the discount)
"""
import os, sys, socket, json, hashlib, struct, time
from multiprocessing import Process, Queue, Manager, cpu_count

STRATUM_URL = os.environ.get("STRATUM_URL", "stratum.promethium.work:3335")
MINING_ADDRESS = os.environ.get("MINING_ADDRESS")
SOLANA_KEYPAIR = os.environ.get("SOLANA_KEYPAIR")
WORKER_NAME = os.environ.get("WORKER_NAME", "cpu")
NPROC = int(os.environ.get("PROM_THREADS") or max(1, cpu_count()))
DIFF1 = 0x00000000ffff0000000000000000000000000000000000000000000000000000


def sha256d(b):
    return hashlib.sha256(hashlib.sha256(b).digest()).digest()


def stratum_to_be(stratum_hex):
    b = bytes.fromhex(stratum_hex)
    le = b"".join(b[i:i + 4][::-1] for i in range(0, 32, 4))
    return le[::-1].hex()


# ---------- address (reuse prom-keygen.py shipped alongside) ----------
def _read_address(path):
    try:
        for line in open(path):
            if line.startswith("address:"):
                return line.split(":", 1)[1].strip()
    except OSError:
        pass
    return None


def ensure_mining_address():
    global MINING_ADDRESS
    if MINING_ADDRESS:
        return
    net = os.environ.get("PROM_NET", "mainnet")
    # Look for an existing key file in order: explicit PROM_KEYFILE, the current
    # folder, then the home default. (A user who generated a key in the folder
    # they run from should NOT get a new address.)
    candidates = []
    if os.environ.get("PROM_KEYFILE"):
        candidates.append(os.environ["PROM_KEYFILE"])
    candidates.append(os.path.join(os.getcwd(), "prom-mining-key.txt"))
    candidates.append(os.path.expanduser("~/.prom-mining-key.txt"))
    for kf in candidates:
        if os.path.isfile(kf):
            addr = _read_address(kf)
            if addr:
                MINING_ADDRESS = addr
                print(f"Using saved mining address from {kf}: {MINING_ADDRESS}")
                return
    # none found -> generate, saving in the current folder (or PROM_KEYFILE)
    keyfile = os.environ.get("PROM_KEYFILE") or os.path.join(os.getcwd(), "prom-mining-key.txt")
    import importlib.util
    kg_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "prom-keygen.py")
    spec = importlib.util.spec_from_file_location("prom_keygen", kg_path)
    kg = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(kg)
    k = kg.generate(net)
    with open(keyfile, "w") as f:
        f.write(f"network: {net}\naddress: {k['address']}\nwif: {k['wif']}\n")
    os.chmod(keyfile, 0o600)
    MINING_ADDRESS = k["address"]
    print("=" * 64)
    print(f"  Generated a new Promethium address: {MINING_ADDRESS}")
    print(f"  Private key saved to {keyfile} (chmod 600).")
    print("  ⚠ BACK THIS FILE UP — it is the ONLY way to move/bridge your coins.")
    print("=" * 64)


# ---------- optional Solana signer for the discount ----------
SIGNER = None
SOL_ADDR = None
def load_solana():
    global SIGNER, SOL_ADDR
    if not SOLANA_KEYPAIR:
        return
    from nacl.signing import SigningKey
    _B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    def b58e(b):
        n = int.from_bytes(b, "big"); o = ""
        while n: n, r = divmod(n, 58); o = _B58[r] + o
        return "1" * (len(b) - len(b.lstrip(b"\x00"))) + o
    kp = bytes(json.load(open(SOLANA_KEYPAIR))) if os.path.isfile(SOLANA_KEYPAIR) else bytes.fromhex(SOLANA_KEYPAIR)
    SIGNER = SigningKey(kp[:32]); SOL_ADDR = b58e(bytes(SIGNER.verify_key))


# ---------- mining worker (one per core) ----------
def worker(idx, shared, solutions):
    seen_gen = -1
    job = None
    while True:
        gen = shared.get("gen", -1)
        if gen != seen_gen:
            seen_gen = gen
            job = shared.get("job")
        if not job:
            time.sleep(0.2)
            continue
        en1 = bytes.fromhex(job["en1"])
        coinb1 = bytes.fromhex(job["coinb1"])
        coinb2 = bytes.fromhex(job["coinb2"])
        prev_le = bytes.fromhex(job["prev_le"])
        branch = [bytes.fromhex(x) for x in job["branch"]]
        vint, bint, tint = job["ver"], job["bits"], job["ntime"]
        target = job["share_target"]
        en2_size = job["en2_size"]
        jid = job["job_id"]
        # fresh random extranonce2 per attempt -> workers don't overlap
        en2 = os.urandom(en2_size)
        root = sha256d(coinb1 + en1 + en2 + coinb2)
        for sib in branch:
            root = sha256d(root + sib)
        pre = struct.pack("<I", vint) + prev_le + root + struct.pack("<I", tint) + struct.pack("<I", bint)
        for nonce in range(0, 1 << 32):
            if (nonce & 0x1ffff) == 0 and shared.get("gen", -1) != seen_gen:
                break  # tip changed — abandon, pick up new job
            if int.from_bytes(sha256d(pre + struct.pack("<I", nonce)), "little") < target:
                solutions.put((jid, en2.hex(), f"{tint:08x}", f"{nonce:08x}"))
                break  # found a share — loop picks a new extranonce2
        # any exit path returns to top (re-check gen, new extranonce2)


# ---------- stratum connection ----------
class Conn:
    def __init__(self, host, port):
        self.sock = socket.create_connection((host, port), timeout=30)
        self.buf = b""
        self._id = 0
    def send(self, method, params, mid=None):
        if mid is None:
            self._id += 1; mid = self._id
        self.sock.sendall((json.dumps({"id": mid, "method": method, "params": params}) + "\n").encode())
    def recv(self, timeout=None):
        self.sock.settimeout(timeout)
        while b"\n" not in self.buf:
            d = self.sock.recv(4096)
            if not d:
                return None
            self.buf += d
        line, self.buf = self.buf.split(b"\n", 1)
        return json.loads(line.decode())
    def close(self):
        try: self.sock.close()
        except Exception: pass


def mine_once(host, port, shared, solutions):
    c = Conn(host, port)
    c.send("mining.subscribe", [f"prom-miner/{WORKER_NAME}"])
    en1 = None; en2_size = 4
    while en1 is None:
        m = c.recv(30)
        if m and m.get("id") and isinstance(m.get("result"), list):
            en1 = m["result"][1]; en2_size = m["result"][2]
    c.send("mining.authorize", [MINING_ADDRESS, WORKER_NAME])
    if SOL_ADDR:
        c.send("prom.signer", [SOL_ADDR])
        print(f"Claiming discount for Solana {SOL_ADDR}")
    print(f"Mining to {MINING_ADDRESS} via {host}:{port} on {NPROC} cores")

    difficulty = 1.0
    signed_prev = set()
    t0 = time.time()
    while True:
        # submit any solutions the workers found
        try:
            while True:
                jid, en2h, ntimeh, nonceh = solutions.get_nowait()
                c.send("mining.submit", [MINING_ADDRESS, jid, en2h, ntimeh, nonceh])
                print(f"share submitted (job {jid}, {time.time()-t0:.0f}s up)")
        except Exception:
            pass
        try:
            m = c.recv(0.3)
        except socket.timeout:
            continue
        if m is None:
            raise ConnectionError("stratum closed")
        method = m.get("method")
        if method == "mining.set_difficulty":
            difficulty = float(m["params"][0])
        elif method == "mining.notify":
            p = m["params"]
            be = stratum_to_be(p[1])
            if SIGNER and be not in signed_prev:
                signed_prev.add(be)
                sig = SIGNER.sign(f"PROM:{be}".encode()).signature.hex()
                c.send("prom.sign", [sig])
                continue  # discounted job will arrive; mine that
            job_id, prev_s, coinb1, coinb2, branch, ver, bits, ntime = p[:8]
            shared["job"] = {
                "job_id": job_id, "en1": en1, "en2_size": en2_size,
                "coinb1": coinb1, "coinb2": coinb2, "branch": branch,
                "prev_le": bytes.fromhex(stratum_to_be(prev_s))[::-1].hex(),
                "ver": int(ver, 16), "bits": int(bits, 16), "ntime": int(ntime, 16),
                "share_target": int(DIFF1 / difficulty) if difficulty > 0 else DIFF1,
            }
            shared["gen"] = shared.get("gen", 0) + 1


def main():
    ensure_mining_address()
    load_solana()
    if not SOL_ADDR:
        print("NOTE: no SOLANA_KEYPAIR — mining at normal 1x (set it to claim your discount).")
    host, _, port = STRATUM_URL.partition(":")
    port = int(port or "3335")

    mgr = Manager()
    shared = mgr.dict()
    shared["gen"] = 0
    solutions = Queue()
    procs = [Process(target=worker, args=(i, shared, solutions), daemon=True) for i in range(NPROC)]
    for p in procs:
        p.start()

    while True:
        try:
            mine_once(host, port, shared, solutions)
        except KeyboardInterrupt:
            print("\nstopping"); break
        except Exception as e:
            print(f"connection lost ({e}); reconnecting in 5s...")
            time.sleep(5)


if __name__ == "__main__":
    main()
