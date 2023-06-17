### Cloud Build

    
https://cloud.google.com/build/docs/automating-builds/github/build-repos-from-github?generation=2nd-gen
https://github.com/GoogleCloudPlatform/cloud-build-samples
    
#### 1. Create Trigger
```bash
export PROJECT_ID=$(gcloud info --format='value(config.project)')
export GKE_ZONE=us-central1
export GKE_CLUSTER=glau-gke-cluster-us-central1
export API_GATEWAY_IP=35.239.155.88
export CLIENT_IP=34.170.243.129
export REDIS_URI=redis://default:xnurcS28JREs9S8HHemx2cKc1jLFi3ua@redis-10996.c279.us-central1-1.gce.cloud.redislabs.com:10996
export REDIS_INSIGHT_PORT=10996

gcloud alpha builds triggers create github \
  --name=glau-cqrs-trigger \
  --repository=projects/$PROJECT_ID/locations/us-central1/connections/github-gmflau/repositories/gmflau-redis-microservices-cqrs-demo \
  --branch-pattern=^main$ \
  --build-config=cloudbuild.yaml \
  --substitutions=_GKE_CLUSTER=$GKE_CLUSTER,_GKE_ZONE=$GKE_ZONE,_API_GATEWAY_IP=$API_GATEWAY_IP,_CLIENT_IP=$CLIENT_IP,_REDIS_URI=$REDIS_URI,_REDIS_INSIGHT_PORT=$REDIS_INSIGHT_PORT \
  --region=us-central1
```
