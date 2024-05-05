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

# docker build --platform=linux/amd64 -t ghcr.io/jmfrank63/luuk/luuk:latest-amd64 .
# docker build --platform=linux/arm64 -t ghcr.io/jmfrank63/luuk/luuk:latest-arm64 .

# docker push ghcr.io/jmfrank63/luuk/luuk:latest-amd64
# docker push ghcr.io/jmfrank63/luuk/luuk:latest-arm64

# docker manifest create ghcr.io/jmfrank63/luuk/luuk:latest \
#     ghcr.io/jmfrank63/luuk/luuk:latest-amd64 \
#     ghcr.io/jmfrank63/luuk/luuk:latest-arm64

# docker manifest annotate ghcr.io/jmfrank63/luuk/luuk:latest ghcr.io/jmfrank63/luuk/luuk:latest-amd64 --os linux --arch amd64
# docker manifest annotate ghcr.io/jmfrank63/luuk/luuk:latest ghcr.io/jmfrank63/luuk/luuk:latest-arm64 --os linux --arch arm64

# docker manifest push ghcr.io/jmfrank63/luuk/luuk:latest







# Build the Docker image for amd64
docker buildx build --platform linux/amd64,linux/arm64 -t ghcr.io/jmfrank63/luuk/luuk:latest .

# Push the Docker image to the registry
docker buildx build --platform linux/amd64,linux/arm64 -t ghcr.io/jmfrank63/luuk/luuk:latest --push .

# # Build the Docker image for arm64
# docker buildx build --platform linux/arm64 -t ghcr.io/jmfrank63/luuk/luuk:latest-arm64 .

# # Push the Docker image to the registry
# docker buildx build --platform linux/arm64 -t ghcr.io/jmfrank63/luuk/luuk:latest-arm64 --push .

# # Create the manifest for the latest version
# docker manifest create ghcr.io/jmfrank63/luuk/luuk:latest ghcr.io/jmfrank63/luuk/luuk:latest-amd64 ghcr.io/jmfrank63/luuk/luuk:latest-arm64

# # Annotate the manifest with the platforms
# docker manifest annotate ghcr.io/jmfrank63/luuk/luuk:latest ghcr.io/jmfrank63/luuk/luuk:latest-amd64 --os linux --arch amd64
# docker manifest annotate ghcr.io/jmfrank63/luuk/luuk:latest ghcr.io/jmfrank63/luuk/luuk:latest-arm64 --os linux --arch arm64

# # Push the manifest to the registry
# docker manifest push ghcr.io/jmfrank63/luuk/luuk:latest
