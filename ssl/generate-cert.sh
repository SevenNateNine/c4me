#!/bin/sh
# Generate the self-signed TLS certificate the c4me API serves over HTTPS.
#
# Run from the repository root:
#   sh ssl/generate-cert.sh
#
# Produces ssl/server.key (private, gitignored) and ssl/server.cert.
# Both are development artifacts — use a real CA-issued certificate in production.
#
# NOTE: the key that previously lived in this directory was committed to a public
# repository and must be considered compromised. Any certificate issued against it
# is untrustworthy. Generate a fresh pair with this script.

set -e

# Git Bash / MSYS rewrites arguments that look like Unix paths, turning the
# "/C=US/ST=..." subject into "C:/Program Files/Git/C=US/ST=...". These disable
# that translation; they are ignored on macOS and Linux.
export MSYS_NO_PATHCONV=1
export MSYS2_ARG_CONV_EXCL='*'

DIR=$(dirname "$0")
DAYS=${DAYS:-365}
SUBJECT=${SUBJECT:-"/C=US/ST=New York/L=Stony Brook/O=c4me/CN=localhost"}

if [ -f "$DIR/server.key" ] && [ -z "$FORCE" ]; then
  echo "ssl/server.key already exists. Re-run with FORCE=1 to replace it." >&2
  exit 1
fi

# Written to temporary names first so a failed run cannot leave a key behind
# that no longer matches the certificate beside it.
openssl req -x509 -newkey rsa:4096 -sha256 -nodes \
  -days "$DAYS" \
  -keyout "$DIR/server.key.tmp" \
  -out "$DIR/server.cert.tmp" \
  -subj "$SUBJECT" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

mv "$DIR/server.key.tmp" "$DIR/server.key"
mv "$DIR/server.cert.tmp" "$DIR/server.cert"
chmod 600 "$DIR/server.key"

echo "Wrote $DIR/server.key and $DIR/server.cert (valid $DAYS days)."
