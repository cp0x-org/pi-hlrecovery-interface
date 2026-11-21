#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 1 ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 0.1.3"
    exit 1
fi

VERSION="$1"
IMAGE="cp0x/pi-hlrecovery-interface"
# linux/amd64 for Linux servers, linux/arm64 for Apple Silicon Macs.
PLATFORMS="linux/amd64,linux/arm64"

echo "Building $IMAGE:$VERSION for $PLATFORMS..."

docker buildx build \
  --platform "$PLATFORMS" \
  -t "$IMAGE:$VERSION" \
  --push \
  .

echo "✅ Successfully built and pushed $IMAGE:$VERSION"
