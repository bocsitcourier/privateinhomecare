#!/bin/bash
# Push to GitHub — updates both the working branch and main so Digital Ocean deploys.
# Digital Ocean app.yaml is configured to deploy from: main

if [ -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
  echo "ERROR: GITHUB_PERSONAL_ACCESS_TOKEN is not set"
  exit 1
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
REPO="bocsitcourier/privateinhomecare"
REMOTE_WITH_TOKEN="https://x-token:${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/${REPO}"
REMOTE_CLEAN="https://github.com/${REPO}"

# Set token URL only for the duration of the push, then restore clean URL
git remote set-url origin "${REMOTE_WITH_TOKEN}"

echo "Pushing '${BRANCH}' to GitHub..."
git push --force origin "${BRANCH}"

echo "Fast-forwarding 'main' to '${BRANCH}' for Digital Ocean auto-deploy..."
git push --force origin "${BRANCH}:main"

# Restore clean remote URL (no token persisted)
git remote set-url origin "${REMOTE_CLEAN}"

LOCAL_SHA=$(git rev-parse HEAD)
echo "Verified: HEAD = ${LOCAL_SHA}"
echo "Done — Digital Ocean will detect the push to main and auto-deploy."
