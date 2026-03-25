#!/usr/bin/env bash
set -euo pipefail

if [ ! -f .env ]; then
  echo "Error: .env file not found in project root"
  echo "Copy .env.example to .env and fill in the values"
  exit 1
fi

source .env

echo "==> Building frontend..."
cd frontend && yarn install --frozen-lockfile && yarn build && cd ..

echo "==> Syncing project to server..."
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='data/' \
  --exclude='frontend-dist/' \
  --exclude='.git' \
  --exclude='backend/data/' \
  --exclude='backend/node_modules/' \
  ./ \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"

echo "==> Syncing frontend build..."
rsync -avz --delete \
  frontend/build/ \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/frontend-dist/"

echo "==> Restarting containers..."
ssh "${DEPLOY_USER}@${DEPLOY_HOST}" \
  "cd ${DEPLOY_PATH} && docker-compose up -d --build"

echo "==> Waiting for server to start..."
sleep 10

echo "==> Health check..."
ssh "${DEPLOY_USER}@${DEPLOY_HOST}" \
  "curl -sf http://severbus-backend:3000/api/health || echo 'Health check failed'"

echo "==> Done!"
