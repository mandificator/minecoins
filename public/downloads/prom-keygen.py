#!/usr/bin/env python3
"""
prom-keygen — Promethium chain address generator (standalone, zero-dependency).

Generates a Promethium PoW-chain key locally so you can mine to an address you
fully control. Uses ONLY the Python standard library — no pip, no native build —
so it runs on any machine and can be air-gapped.

  python3 prom-keygen.py                 # mainnet prom1q... address
  python3 prom-keygen.py --net regtest   # regtest promrt1q... (testing)
  python3 prom-keygen.py --out mykey.txt # also save to a file

It prints (and optionally saves):
  - your Promethium address (bech32 P2WPKH, e.g. prom1q...)  -> mine to this
  - the private key in WIF (compressed)                       -> KEEP SECRET

⚠️  The private key is the ONLY way to ever move or bridge (stabilize) the coins
    you mine. Back it up. Never share it. If you lose it, the coins are gone.
    Promethium will NEVER ask you for it.

NOTE: this is NOT the same as your Solana address. The Solana key (ed25519) is
what signs for the mining-difficulty discount and holds the bridged $PROM; this
PROM-chain key (secp256k1) is where the mined coins land on the Promethium chain.
"""
import os, sys, hashlib, argparse

# ---------------------------------------------------------------- secp256k1
_P  = 2**256 - 2**32 - 977
_N  = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
_Gx = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798
_Gy = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8

def _inv(a, n): return pow(a, n - 2, n)

def _add(p, q):
    if p is None: return q
    if q is None: return p
    (x1, y1), (x2, y2) = p, q
    if x1 == x2 and (y1 + y2) % _P == 0: return None
    if p == q:
        l = (3 * x1 * x1) * _inv(2 * y1, _P) % _P
    else:
        l = (y2 - y1) * _inv((x2 - x1) % _P, _P) % _P
    x3 = (l * l - x1 - x2) % _P
    y3 = (l * (x1 - x3) - y1) % _P
    return (x3, y3)

def _mul(k, p):
    r = None
    while k:
        if k & 1: r = _add(r, p)
        p = _add(p, p)
        k >>= 1
    return r

def privkey_to_compressed_pubkey(priv: bytes) -> bytes:
    k = int.from_bytes(priv, "big")
    if not (1 <= k < _N):
        raise ValueError("private key out of range")
    x, y = _mul(k, (_Gx, _Gy))
    return bytes([2 + (y & 1)]) + x.to_bytes(32, "big")

# ---------------------------------------------------------------- hashes
def _ripemd160(b: bytes) -> bytes:
    try:
        h = hashlib.new("ripemd160"); h.update(b); return h.digest()
    except (ValueError, TypeError):
        return _ripemd160_py(b)

def hash160(b: bytes) -> bytes:
    return _ripemd160(hashlib.sha256(b).digest())

# ---------------------------------------------------------------- bech32 (BIP173)
_CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"
def _bech32_polymod(values):
    gen = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
    chk = 1
    for v in values:
        b = chk >> 25
        chk = (chk & 0x1ffffff) << 5 ^ v
        for i in range(5):
            chk ^= gen[i] if ((b >> i) & 1) else 0
    return chk
def _bech32_hrp_expand(hrp):
    return [ord(x) >> 5 for x in hrp] + [0] + [ord(x) & 31 for x in hrp]
def _bech32_create_checksum(hrp, data, spec):
    const = 0x2bc830a3 if spec == "bech32m" else 1
    polymod = _bech32_polymod(_bech32_hrp_expand(hrp) + data + [0] * 6) ^ const
    return [(polymod >> 5 * (5 - i)) & 31 for i in range(6)]
def _bech32_encode(hrp, data, spec):
    combined = data + _bech32_create_checksum(hrp, data, spec)
    return hrp + "1" + "".join([_CHARSET[d] for d in combined])
def _convertbits(data, frombits, tobits, pad=True):
    acc = 0; bits = 0; ret = []; maxv = (1 << tobits) - 1
    for value in data:
        acc = (acc << frombits) | value; bits += frombits
        while bits >= tobits:
            bits -= tobits; ret.append((acc >> bits) & maxv)
    if pad and bits:
        ret.append((acc << (tobits - bits)) & maxv)
    return ret
def segwit_addr(hrp, witver, witprog):
    spec = "bech32" if witver == 0 else "bech32m"
    return _bech32_encode(hrp, [witver] + _convertbits(witprog, 8, 5), spec)

# ---------------------------------------------------------------- base58check (WIF)
_B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
def _b58encode(b: bytes) -> str:
    n = int.from_bytes(b, "big"); out = ""
    while n > 0:
        n, r = divmod(n, 58); out = _B58[r] + out
    pad = len(b) - len(b.lstrip(b"\x00"))
    return "1" * pad + out
def to_wif(priv: bytes, secret_version: int, compressed=True) -> str:
    payload = bytes([secret_version]) + priv + (b"\x01" if compressed else b"")
    chk = hashlib.sha256(hashlib.sha256(payload).digest()).digest()[:4]
    return _b58encode(payload + chk)

# ---------------------------------------------------------------- networks
NETS = {
    # name: (bech32_hrp, wif_secret_version)
    "mainnet": ("prom",   183),
    "regtest": ("promrt", 239),
    "testnet": ("tb",     239),
}

def generate(net="mainnet"):
    hrp, secret_version = NETS[net]
    while True:
        priv = os.urandom(32)
        k = int.from_bytes(priv, "big")
        if 1 <= k < _N:
            break
    pub = privkey_to_compressed_pubkey(priv)
    h160 = hash160(pub)
    address = segwit_addr(hrp, 0, h160)          # P2WPKH (prom1q...)
    wif = to_wif(priv, secret_version)
    return {"network": net, "address": address, "wif": wif,
            "pubkey": pub.hex(), "privhex": priv.hex()}

# ---------------------------------------------------------------- ripemd160 fallback (pure python)
def _ripemd160_py(message: bytes) -> bytes:
    # Minimal pure-python RIPEMD-160 (used only if hashlib lacks ripemd160).
    import struct
    def rol(x, n): return ((x << n) | (x >> (32 - n))) & 0xffffffff
    def f(j, x, y, z):
        if j < 16: return x ^ y ^ z
        if j < 32: return (x & y) | (~x & z)
        if j < 48: return (x | ~y) ^ z
        if j < 64: return (x & z) | (y & ~z)
        return x ^ (y | ~z)
    K  = [0x00000000,0x5a827999,0x6ed9eba1,0x8f1bbcdc,0xa953fd4e]
    KK = [0x50a28be6,0x5c4dd124,0x6d703ef3,0x7a6d76e9,0x00000000]
    r = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,
         7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,
         3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,
         1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,
         4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13]
    rr = [5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,
          6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,
          15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,
          8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,
          12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11]
    s = [11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,
         7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,
         11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,
         11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,
         9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6]
    ss = [8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,
          9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,
          9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,
          15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,
          8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11]
    h0,h1,h2,h3,h4 = 0x67452301,0xefcdab89,0x98badcfe,0x10325476,0xc3d2e1f0
    padlen = (56 - (len(message) + 1) % 64) % 64
    data = message + b"\x80" + b"\x00" * padlen + struct.pack("<Q", len(message) * 8)
    for off in range(0, len(data), 64):
        X = list(struct.unpack("<16I", data[off:off+64]))
        A,B,C,D,E = h0,h1,h2,h3,h4
        Ap,Bp,Cp,Dp,Ep = h0,h1,h2,h3,h4
        for j in range(80):
            T = (rol((A + f(j,B,C,D) + X[r[j]] + K[j//16]) & 0xffffffff, s[j]) + E) & 0xffffffff
            A,E,D,C,B = E,D,rol(C,10),B,T
            T = (rol((Ap + f(79-j,Bp,Cp,Dp) + X[rr[j]] + KK[j//16]) & 0xffffffff, ss[j]) + Ep) & 0xffffffff
            Ap,Ep,Dp,Cp,Bp = Ep,Dp,rol(Cp,10),Bp,T
        T  = (h1 + C + Dp) & 0xffffffff
        h1 = (h2 + D + Ep) & 0xffffffff
        h2 = (h3 + E + Ap) & 0xffffffff
        h3 = (h4 + A + Bp) & 0xffffffff
        h4 = (h0 + B + Cp) & 0xffffffff
        h0 = T
    return struct.pack("<5I", h0,h1,h2,h3,h4)

# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description="Generate a Promethium chain address (local, non-custodial).")
    ap.add_argument("--net", choices=list(NETS), default="mainnet", help="network (default: mainnet)")
    ap.add_argument("--out", metavar="FILE", help="also save address+key to FILE (chmod 600)")
    ap.add_argument("--quiet", action="store_true", help="print only: <address> <wif>")
    args = ap.parse_args()
    k = generate(args.net)
    if args.quiet:
        print(k["address"], k["wif"]); return
    print("=" * 64)
    print(f"  Promethium {args.net} address (mine to this):")
    print(f"    {k['address']}")
    print()
    print("  Private key (WIF) — KEEP SECRET, BACK IT UP:")
    print(f"    {k['wif']}")
    print("=" * 64)
    print("  ⚠  This key is the ONLY way to move/bridge the coins you mine.")
    print("     Back it up offline. Never share it. Promethium never asks for it.")
    if args.out:
        with open(args.out, "w") as f:
            f.write(f"network: {args.net}\naddress: {k['address']}\nwif: {k['wif']}\n")
        os.chmod(args.out, 0o600)
        print(f"  Saved to {args.out} (chmod 600). Move it somewhere safe.")

if __name__ == "__main__":
    main()
