### Cloud Build

    
https://cloud.google.com/build/docs/automating-builds/github/build-repos-from-github?generation=2nd-gen
https://github.com/GoogleCloudPlatform/cloud-build-samples
    
#### 1. Create Trigger
```bash
export PROJECT_ID=$(gcloud info --format='value(config.project)')
export GKE_ZONE=us-central1
export GKE_CLUSTER=glau-gke-cluster-us-central1
gcloud alpha builds triggers create github \
  --name=glau-cqrs-trigger \
  --repository=projects/$PROJECT_ID/locations/us-central1/connections/github-gmflau/repositories/gmflau-redis-microservices-cqrs-demo \
  --branch-pattern=^main$ \
  --build-config=cloudbuild.yaml \
  --substitutions=_PROEJCT_ID=$PROJECT_ID,_GKE_CLUSTER=$GKE_CLUSTER,_GKE_ZONE=$GKE_ZONE \
  --region=us-central1
```
