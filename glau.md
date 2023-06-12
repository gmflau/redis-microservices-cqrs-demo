#### Prerequisites:    
[Install Kompose](https://kubernetes.io/docs/tasks/configure-pod-container/translate-compose-kubernetes/)
    
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
    
#### Build docker images
```bash
docker compose build

docker compose push
```
    
#### Run Kompose
```bash
pushd k8s 

kompose convert -f ../docker-compose.yml
kubectl apply -f .

kubectl port-forward pod/client-69b446845-gds7k 4200:420

popd
```



