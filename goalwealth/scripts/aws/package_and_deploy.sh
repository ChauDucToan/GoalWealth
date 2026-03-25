#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <s3-artifact-bucket> <stack-name> <region> [environment-name]"
  exit 1
fi

S3_BUCKET="$1"
STACK_NAME="$2"
REGION="$3"
ENVIRONMENT_NAME="${4:-dev}"
WORKDIR="$(cd "$(dirname "$0")/../.." && pwd)"
BUILD_DIR="$WORKDIR/.build"
LAMBDA_SRC_DIR="$BUILD_DIR/lambda-src"
BUILD_TEMPLATE="$BUILD_DIR/template-build.yaml"
PACKAGED_TEMPLATE="$BUILD_DIR/packaged-template.yaml"
REQUIREMENTS_FILE="$WORKDIR/src/requirements.txt"
INSTALLER_USED=""

rm -rf "$LAMBDA_SRC_DIR"
mkdir -p "$LAMBDA_SRC_DIR"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required to build the Lambda package"
  exit 1
fi

install_with_pip() {
  if ! python3 -m pip --version >/dev/null 2>&1; then
    echo "python3 -m pip is required to install Lambda dependencies"
    exit 1
  fi

  echo "[build] installing dependencies with pip"
  python3 -m pip install \
    --upgrade \
    -r "$REQUIREMENTS_FILE" \
    -t "$LAMBDA_SRC_DIR"
  INSTALLER_USED="pip"
}

install_with_uv() {
  echo "[build] detected uv, attempting dependency install with uv pip"
  uv pip install \
    --python "$(command -v python3)" \
    --target "$LAMBDA_SRC_DIR" \
    -r "$REQUIREMENTS_FILE"
  INSTALLER_USED="uv"
}

if [[ ! -f "$REQUIREMENTS_FILE" ]]; then
  echo "Missing requirements file: $REQUIREMENTS_FILE"
  exit 1
fi

if command -v uv >/dev/null 2>&1; then
  if install_with_uv; then
    :
  else
    echo "[build] uv install failed, falling back to pip"
    rm -rf "$LAMBDA_SRC_DIR"
    mkdir -p "$LAMBDA_SRC_DIR"
    install_with_pip
  fi
else
  install_with_pip
fi

echo "[build] dependency installer used: $INSTALLER_USED"
cp -R "$WORKDIR/src/." "$LAMBDA_SRC_DIR/"

python3 - <<'PY' "$WORKDIR/infra/sam/template.yaml" "$BUILD_TEMPLATE"
from pathlib import Path
import sys

src = Path(sys.argv[1])
out = Path(sys.argv[2])
text = src.read_text()
text = text.replace('CodeUri: ../../src/', 'CodeUri: lambda-src/')
out.write_text(text)
print(out)
PY

aws cloudformation package \
  --region "$REGION" \
  --template-file "$BUILD_TEMPLATE" \
  --s3-bucket "$S3_BUCKET" \
  --output-template-file "$PACKAGED_TEMPLATE"

aws cloudformation deploy \
  --region "$REGION" \
  --template-file "$PACKAGED_TEMPLATE" \
  --stack-name "$STACK_NAME" \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    EnvironmentName="$ENVIRONMENT_NAME"

echo
aws cloudformation describe-stacks \
  --region "$REGION" \
  --stack-name "$STACK_NAME" \
  --query 'Stacks[0].Outputs' \
  --output table
