#!/bin/bash

set -euo pipefail

SCRIPT_PATH=$(dirname $(realpath $0))
ROOT_PATH="$SCRIPT_PATH/../"
DOCKER_COMPOSE_HASH=$(sha256sum $ROOT_PATH/docker-compose.yaml | cut -d" " -f1)
VCPUS=1
NILCC_VERSION=0.2.1
NILCC_VERIFIER_VERSION=0.3.0

MEASUREMENT_HASH=$(docker run -v/tmp/nilcc-verifier-cache:/tmp/nilcc-verifier-cache --rm ghcr.io/nillionnetwork/nilcc-verifier:$NILCC_VERIFIER_VERSION measurement-hash $DOCKER_COMPOSE_HASH $NILCC_VERSION --vm-type cpu --cpus $VCPUS)
echo "$MEASUREMENT_HASH"
