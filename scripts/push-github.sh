#!/bin/bash
# Push to GitHub — updates both the working branch and main so Digital Ocean deploys.
# Digital Ocean app.yaml is configured to deploy from: main

if [ -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
  echo "ERROR: GITHUB_PERSONAL_ACCESS_TOKEN is not set"
  exit 1
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Credentials are passed via transient -c flag (not written to .git/config)
GIT_PUSH="git -c credential.helper='!f(){ echo username=x-token; echo password=$GITHUB_PERSONAL_ACCESS_TOKEN; }; f'"
ORIGIN="https://github.com/bocsitcourier/privateinhomecare"
git remote set-url origin "$ORIGIN"

echo "Pushing '${BRANCH}' to GitHub..."
eval "$GIT_PUSH push origin ${BRANCH}"

echo "Fast-forwarding 'main' to '${BRANCH}' for Digital Ocean auto-deploy..."
eval "$GIT_PUSH push origin ${BRANCH}:main"

LOCAL_SHA=$(git rev-parse HEAD)
echo "Verified: HEAD = ${LOCAL_SHA}"
echo "Done — Digital Ocean will detect the push to main and auto-deploy."
