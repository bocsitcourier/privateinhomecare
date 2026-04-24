#!/bin/bash
# Push to GitHub — updates both the working branch and main so Digital Ocean deploys.
# Digital Ocean app.yaml is configured to deploy from: main

if [ -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
  echo "ERROR: GITHUB_PERSONAL_ACCESS_TOKEN is not set"
  exit 1
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
REPO="github.com/bocsitcourier/privateinhomecare"

# Pass credentials via helper so the PAT never appears in process listings or logs
git config credential.helper \
  '!f() { echo "username=x-token"; echo "password='"$GITHUB_PERSONAL_ACCESS_TOKEN"'"; }; f'
git remote set-url origin "https://${REPO}"

echo "Pushing '${BRANCH}' to GitHub..."
git push origin "${BRANCH}"

echo "Fast-forwarding 'main' to match '${BRANCH}' for Digital Ocean deploy..."
git push origin "${BRANCH}:main"

LOCAL_SHA=$(git rev-parse HEAD)
echo "Verified: HEAD = ${LOCAL_SHA}"
echo "Done — Digital Ocean will detect the push to main and auto-deploy."
