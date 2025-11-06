# Attestation Verification

This repo and script is to help you attest and compute your measurement hash. 

This is recommended for developers that want to ensure the attestation for themselves.

# Repo Stucture
- `scripts/measurement-hash.sh`: script to compute measurement hash for nilcc verifier
- `docker-compose.yaml`: sample docker compose

# Prerequisites
- Have Docker


# Usage

```
cd scripts
chmod +x measurement-hash.sh
./measurement-hash.sh
```

Expected output should be something like:
`9e22...b84f4`