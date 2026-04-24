#!/bin/bash
# Push to GitHub and update main so Digital Ocean auto-deploys.
# Digital Ocean app.yaml deploys from: main

if [ -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
  echo "ERROR: GITHUB_PERSONAL_ACCESS_TOKEN is not set"
  exit 1
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
REPO="github.com/bocsitcourier/privateinhomecare"

# Configure credentials securely via credential helper (PAT never in URL/logs)
git config credential.helper '!f() { echo "username=x-token"; echo "password='"$GITHUB_PERSONAL_ACCESS_TOKEN"'"; }; f'
git remote set-url origin "https://${REPO}"

echo "Pushing '${BRANCH}' to GitHub..."
git push origin "${BRANCH}"

echo "Updating 'main' so Digital Ocean auto-deploys..."
git push origin "${BRANCH}:main" --force

echo "Done — Digital Ocean will auto-deploy from main shortly."
