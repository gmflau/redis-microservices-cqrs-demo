#### Prerequisites:    
[Install Kompose](https://kubernetes.io/docs/tasks/configure-pod-container/translate-compose-kubernetes/) 
On Mac:
```bash
brew install kompose
```

#### 1. Reserve external static IP addresses
Command to create and retrive the static IP:   
```bash
gcloud compute addresses create glau-api-gateway-ip --region us-central1
glau-api-gateway-ip="$(gcloud compute addresses describe glau-api-gateway-ip --region=us-central1 --format='value(address)')"
```
```bash
gcloud compute addresses create glau-cdn-host-ip --region us-central1
glau-cdn-host-ip="$(gcloud compute addresses describe glau-cdn-host-ip --region=us-central1 --format='value(address)')"
```
```bash
gcloud compute addresses create glau-client-host-ip --region us-central1
glau-client-host-ip="$(gcloud compute addresses describe glau-client-host-ip --region=us-central1 --format='value(address)')"
```
     
#### 2. Update .env 
Modify the following lines:
NEXT_PUBLIC_API_GATEWAY_URI=http://<glau-api-gateway-ip>:3000
CDN_HOST=<glau-cdn-host-ip>
      
    
#### Create GKE cluster
```bash
export PROJECT_ID=$(gcloud info --format='value(config.project)')
export CLUSTER_LOCATION=us-central1
export CLUSTER_NAME="glau-gke-cluster-$CLUSTER_LOCATION"
export VPC_NETWORK="glau-vpc-network"
export SUBNETWORK="us-central1-subnet"

gcloud container clusters create $CLUSTER_NAME \
 --region=$CLUSTER_LOCATION --num-nodes=1 \
 --image-type=COS_CONTAINERD \
 --machine-type=e2-standard-8 \
 --network=$VPC_NETWORK \
 --subnetwork=$SUBNETWORK \
 --enable-ip-alias \
 --workload-pool=${PROJECT_ID}.svc.id.goog
```
   
     
#### Build & Push docker images
```bash
docker compose build
docker compose push
```
   
          
#### Run Kompose to generate K8s yamls
```bash
pushd k8s 

kompose convert -f ../docker-compose.yml
kubectl apply -f .

kubectl port-forward pod/client-69b446845-gds7k 4200:420
```

    
#### Edit K8S yamls
Add the following lines to api-gateway-service.yaml below `selector` section:
```bash
  type: LoadBalancer
  loadBalacnerIP: <glau-api-gateway-ip>    
```
Add the following lines to cdn-service.yaml below `selector` section:
```bash
  type: LoadBalancer
  loadBalacnerIP: <glau-cdn-host-ip>
```
Add the following lines to api-gateway-service.yaml below `selector` section:
```bash
  type: LoadBalancer
  loadBalacnerIP: <glau-client-host-ip>
```

    
#### Deploy the app
```bash
kubectl apply -f .
```


#### Access the app
Point your brower at http://<glau-client-host-ip>:4200

    
#### Tear down
```badh
kubectl delete -f .
```


