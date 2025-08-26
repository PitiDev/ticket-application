#!/bin/bash

IMAGE=172.16.4.62:5000/forntend-ticket-system

if [ -n "$1" ]; then VERSION=$1; else VERSION="latest";fi

echo "Building image $IMAGE:$VERSION"

docker build --platform linux/amd64 -t $IMAGE:$VERSION .
docker push $IMAGE:$VERSION

echo "✅ Successfully pushed $IMAGE:$VERSION"