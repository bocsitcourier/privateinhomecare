#!/bin/bash
# Push current branch AND main to GitHub so Digital Ocean auto-deploys
# Digital Ocean is configured to deploy from: main

if [ -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
  echo "ERROR: GITHUB_PERSONAL_ACCESS_TOKEN is not set"
  exit 1
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
REMOTE_URL="https://${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/bocsitcourier/privateinhomecare"

echo "Pushing '${BRANCH}' to GitHub..."
git push "${REMOTE_URL}" "${BRANCH}" --force

echo "Pushing '${BRANCH}' to 'main' for Digital Ocean deploy..."
git push "${REMOTE_URL}" "${BRANCH}:main" --force

echo "Done — Digital Ocean will auto-deploy from main shortly."
