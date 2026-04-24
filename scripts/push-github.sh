#!/bin/bash
# Auto-push current branch to GitHub using the stored PAT
# Uses --force-with-lease to safely overwrite remote with Replit's version

if [ -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
  echo "ERROR: GITHUB_PERSONAL_ACCESS_TOKEN is not set"
  exit 1
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
REMOTE_URL="https://${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/bocsitcourier/privateinhomecare"

echo "Force-pushing branch '${BRANCH}' to GitHub..."
git push "${REMOTE_URL}" "${BRANCH}" --force
echo "Done — GitHub is up to date. Digital Ocean will auto-deploy shortly."
