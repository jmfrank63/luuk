#!/usr/bin/env bash
set -ex

# Delete the existing builder instance
docker buildx rm luuk-multiarch-builder || true

# Create a new builder instance
docker buildx create --name luuk-multiarch-builder

# Switch to the new builder instance
docker buildx use luuk-multiarch-builder

# Enable emulation so you can build for different architectures
docker run --rm --privileged tonistiigi/binfmt:latest

# Build the Docker multi arch image for amd64
docker buildx build --platform linux/amd64,linux/arm64 -t ghcr.io/jmfrank63/luuk/luuk:latest .

# Push the Docker multi arch image to the registry
docker buildx build --platform linux/amd64,linux/arm64 -t ghcr.io/jmfrank63/luuk/luuk:latest --push .
