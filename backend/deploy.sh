#!/bin/bash
set -euo pipefail

IMAGE="172.16.4.62:5000/backend-ticket-system"
VERSION="${1:-latest}"

echo "🚀 Building image: $IMAGE:$VERSION"

docker build --platform linux/amd64 -t "$IMAGE:$VERSION" .
docker push "$IMAGE:$VERSION"

echo "✅ Successfully pushed $IMAGE:$VERSION"
