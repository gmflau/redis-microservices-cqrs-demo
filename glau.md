#### Prerequisites:    
[Install Kompose](https://kubernetes.io/docs/tasks/configure-pod-container/translate-compose-kubernetes/) 
On Mac:
```bash
brew install kompose
```

#### 1. Reserve external static IP addresses
```bash
gcloud compute addresses create glau-api-gateway-ip --region us-central1
glau-api-gateway-ip="$(gcloud compute addresses describe glau-api-gateway-ip --region=us-central1 --format='value(address)')"
```
```bash
gcloud compute addresses create glau-client-host-ip --region us-central1
glau-client-host-ip="$(gcloud compute addresses describe glau-client-host-ip --region=us-central1 --format='value(address)')"
```

         
#### 2. Update .env 
Modify the following line in .env file:
```bash
NEXT_PUBLIC_API_GATEWAY_URI=http://<glau-api-gateway-ip>:3000
```
      
    
#### 3. Create GKE cluster
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
   
     
#### 4. Build & Push docker images
```bash
docker compose build
docker compose push
```
   
          
#### 5. Run Kompose to generate K8s yamls
```bash
cd k8s
kompose convert -f ../docker-compose.yml
```

    
#### 6. Edit K8S yamls
Add the following lines to api-gateway-service.yaml below `selector` section:
```bash
  type: LoadBalancer
  loadBalancerIP: <glau-api-gateway-ip>    
```    
Add the following lines to api-gateway-service.yaml below `selector` section:
```bash
  type: LoadBalancer
  loadBalancerIP: <glau-client-host-ip>
```

    
#### 7. Deploy the app
```bash
kubectl apply -f .
```


#### 8. Access the app
Point your brower at http://<glau-client-host-ip>:4200

    
#### 9. Tear down
```badh
kubectl delete -f .
```

