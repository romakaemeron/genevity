#!/usr/bin/env bash
# Usage: loyalty-prepare-apple-certs.sh <pass-cert.p12> <wwdr.cer>
# Prints the four base64 env values for Apple Wallet pass signing to stdout.
# Nothing is written into the repo; temp files live in a private temp dir that
# is removed on exit.
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <pass-cert.p12> <wwdr.cer>" >&2
  exit 1
fi
P12=$1
WWDR=$2

tmp=$(mktemp -d)
chmod 700 "$tmp"
trap 'rm -rf "$tmp"' EXIT

read -r -s -p "p12 password: " P12_PASS
echo >&2
read -r -s -p "New passphrase for the PEM key (empty = generate one): " KEY_PASS
echo >&2
if [ -z "$KEY_PASS" ]; then
  KEY_PASS=$(openssl rand -hex 16)
fi

export P12_PASS KEY_PASS

openssl pkcs12 -legacy -in "$P12" -passin env:P12_PASS -clcerts -nokeys -out "$tmp/cert.pem"
openssl pkcs12 -legacy -in "$P12" -passin env:P12_PASS -nocerts \
  -passout env:KEY_PASS -out "$tmp/key.pem"
openssl x509 -inform DER -in "$WWDR" -out "$tmp/wwdr.pem"

b64() { base64 < "$1" | tr -d '\n'; }

echo "APPLE_PASS_CERT_PEM=$(b64 "$tmp/cert.pem")"
echo "APPLE_PASS_KEY_PEM=$(b64 "$tmp/key.pem")"
echo "APPLE_PASS_KEY_PASSPHRASE=$KEY_PASS"
echo "APPLE_WWDR_PEM=$(b64 "$tmp/wwdr.pem")"
