#!/usr/bin/env bash
# ==============================================================================
# RiskGuard AI — Google Cloud Run Automated Deployment Script
# ==============================================================================
set -euo pipefail

PROJECT_ID="${1:-${GCP_PROJECT:-}}"
REGION="${2:-us-central1}"
SERVICE_NAME="riskguard-ai"

if [[ -z "$PROJECT_ID" ]]; then
  echo "Usage: ./deploy-cloudrun.sh <PROJECT_ID> [REGION]"
  echo "Example: ./deploy-cloudrun.sh my-gcp-project-id us-central1"
  exit 1
fi

echo "==> Configuring GCP Project: $PROJECT_ID"
gcloud config set project "$PROJECT_ID"

echo "==> Enabling required GCP APIs..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  pubsub.googleapis.com \
  bigquery.googleapis.com

echo "==> Submitting build to Google Cloud Build..."
gcloud builds submit --config=cloudbuild.yaml --substitutions=_REGION="$REGION" .

echo "==> Deployment Complete! Service URL:"
gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format="value(status.url)"
