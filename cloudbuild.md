### Cloud Build

#### 1. Create Trigger
```bash
export PROJECT_ID=$(gcloud info --format='value(config.project)')

cat <<EOF > master-branch-build-trigger.json
{
  "triggerTemplate": {
    "projectId": "${PROJECT_ID}",
    "repoName": "gmflau-redis-microservices-cqrs-demo",
    "branchName": "[^(?!.*master)].*"
  },
  "description": "cqrs-master-branch",
  "substitutions": {
    "_PROJECT_ID": "$PROJECT_ID}",
  },
  "filename": "cloudbuild.yaml"
}
EOF
```

#### 2. Deploy Trigger
```bash
curl -X POST \
    https://cloudbuild.googleapis.com/v1/projects/${PROJECT}/triggers \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $(gcloud config config-helper --format='value(credential.access_token)')" \
    --data-binary @master-branch-build-trigger.json
```
