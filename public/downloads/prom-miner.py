#!/usr/bin/env python3
"""
Promethium Miner — CPU stratum miner that connects to the Promethium node by
default and mines to an address you control.

Out of the box it:
  * connects to the official Promethium stratum endpoint (override with STRATUM_URL),
  * generates a local Promethium address for you if you don't supply one
    (non-custodial; private key saved to PROM_KEYFILE — BACK IT UP),
  * if you provide a Solana keypair, proves it to claim your difficulty discount
    (stake + referrals) by signing each block — fully non-custodial,
  * mines continuously and reconnects automatically.

Env:
  STRATUM_URL     host:port of the stratum endpoint
                  (default stratum.promethium.work:3335)
  MINING_ADDRESS  your prom address; auto-generated if unset
  PROM_NET        mainnet | regtest | testnet (for auto-generation; default mainnet)
  PROM_KEYFILE    where the auto-generated key is saved (default ~/.prom-mining-key.txt)
  SOLANA_KEYPAIR  optional: solana-keygen JSON or 64-byte hex, to claim the discount
  WORKER_NAME     optional label (default 'cpu')

Requirements: pip install pynacl   (only if using SOLANA_KEYPAIR for the discount)
"""
import os, sys, socket, json, hashlib, struct, time

STRATUM_URL = os.environ.get("STRATUM_URL", "stratum.promethium.work:3335")
MINING_ADDRESS = os.environ.get("MINING_ADDRESS")
SOLANA_KEYPAIR = os.environ.get("SOLANA_KEYPAIR")
WORKER_NAME = os.environ.get("WORKER_NAME", "cpu")
DIFF1 = 0x00000000ffff0000000000000000000000000000000000000000000000000000


def sha256d(b):
    return hashlib.sha256(hashlib.sha256(b).digest()).digest()


# ---- address: reuse prom-keygen.py shipped alongside this miner ----
def ensure_mining_address():
    global MINING_ADDRESS
    if MINING_ADDRESS:
        return
    net = os.environ.get("PROM_NET", "mainnet")
    keyfile = os.environ.get("PROM_KEYFILE", os.path.expanduser("~/.prom-mining-key.txt"))
    if os.path.isfile(keyfile):
        for line in open(keyfile):
            if line.startswith("address:"):
                MINING_ADDRESS = line.split(":", 1)[1].strip()
        if MINING_ADDRESS:
            print(f"Using saved mining address: {MINING_ADDRESS}")
            return
    import importlib.util
    kg_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "prom-keygen.py")
    spec = importlib.util.spec_from_file_location("prom_keygen", kg_path)
    kg = importlib.util.module_from_spec(spec); spec.loader.exec_module(kg)
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


# ---- optional Solana signer for the discount ----
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


def stratum_to_be(stratum_hex):
    b = bytes.fromhex(stratum_hex)
    le = b"".join(b[i:i+4][::-1] for i in range(0, 32, 4))
    return le[::-1].hex()


class Conn:
    def __init__(self, host, port):
        self.sock = socket.create_connection((host, port), timeout=30)
        self.buf = b""
        self._id = 0
    def send(self, method, params, mid=None):
        if mid is None:
            self._id += 1; mid = self._id
        self.sock.sendall((json.dumps({"id": mid, "method": method, "params": params}) + "\n").encode())
        return mid
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


def mine_once(host, port):
    c = Conn(host, port)
    c.send("mining.subscribe", [f"prom-miner/{WORKER_NAME}"])
    en1 = None; en2_size = 4
    while en1 is None:
        m = c.recv(30)
        if m and m.get("id") and m.get("result") and isinstance(m["result"], list):
            en1 = m["result"][1]; en2_size = m["result"][2]
    c.send("mining.authorize", [MINING_ADDRESS, WORKER_NAME])
    if SOL_ADDR:
        c.send("prom.signer", [SOL_ADDR])
        print(f"Claiming discount for Solana {SOL_ADDR}")
    print(f"Mining to {MINING_ADDRESS} via {host}:{port}")

    difficulty = 1.0
    job = None
    signed_prev = set()
    hashes = 0
    t0 = time.time()
    while True:
        # drain pending messages (non-blocking-ish)
        try:
            m = c.recv(0.05 if job else 30)
        except socket.timeout:
            m = None
        if m is not None:
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
                    continue  # discounted job will arrive
                job = p
            elif m.get("error"):
                pass
            continue
        if job is None:
            continue
        # one grinding batch for the current job
        job_id, prev_s, coinb1, coinb2, branch, ver, bits, ntime = job[:8]
        en2 = os.urandom(en2_size)
        coinb = bytes.fromhex(coinb1) + bytes.fromhex(en1) + en2 + bytes.fromhex(coinb2)
        root = sha256d(coinb)
        for sib in branch:
            root = sha256d(root + bytes.fromhex(sib))
        prev_le = bytes.fromhex(stratum_to_be(prev_s))[::-1]
        vint = int(ver, 16); bint = int(bits, 16); tint = int(ntime, 16)
        share_target = int(DIFF1 / difficulty) if difficulty > 0 else DIFF1
        pre = struct.pack("<I", vint) + prev_le + root + struct.pack("<I", tint) + struct.pack("<I", bint)
        for nonce in range(0, 1 << 20):
            h = int.from_bytes(sha256d(pre + struct.pack("<I", nonce)), "little")
            hashes += 1
            if h < share_target:
                c.send("mining.submit", [MINING_ADDRESS, job_id, en2.hex(), f"{tint:08x}", f"{nonce:08x}"])
                el = time.time() - t0
                print(f"share submitted (job {job_id}, {hashes/max(el,0.1):.0f} H/s)")
                break
        else:
            continue  # exhausted this en2, loop picks a new one


def main():
    ensure_mining_address()
    load_solana()
    if not SOL_ADDR:
        print("NOTE: no SOLANA_KEYPAIR — mining at normal 1x (set it to claim your discount).")
    host, _, port = STRATUM_URL.partition(":")
    port = int(port or "3335")
    while True:
        try:
            mine_once(host, port)
        except KeyboardInterrupt:
            print("\nstopping"); return
        except Exception as e:
            print(f"connection lost ({e}); reconnecting in 5s...")
            time.sleep(5)


if __name__ == "__main__":
    main()
