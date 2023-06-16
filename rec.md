### Install RDI on K8

#### Deploy REC
```bash
kubectl create namespace redis
kubectl config set-context --current --namespace=redis

VERSION=`curl --silent https://api.github.com/repos/RedisLabs/redis-enterprise-k8s-docs/releases/latest | grep tag_name | awk -F'"' '{print $4}'`

kubectl apply -f https://raw.githubusercontent.com/RedisLabs/redis-enterprise-k8s-docs/$VERSION/bundle.yaml
```
```bash
cat <<EOF > rec.yaml
apiVersion: "app.redislabs.com/v1"
kind: "RedisEnterpriseCluster"
metadata:
  name: rec
spec:
  nodes: 3
EOF

kubectl apply -f my-rec.yaml
```


#### Retrieve the password for REC's user: demo@redislabs.com
```bash
kubectl get secrets -n redis rec -o jsonpath="{.data.password}" | base64 --decode
```


#### Open port 9443
```bash
kubectl port-forward service/rec 9443:9443

      
#### Install Redis Gears
```bash
curl -s https://redismodules.s3.amazonaws.com/redisgears/redisgears.Linux-ubuntu20.04-x86_64.1.2.6.zip -o /tmp/redis-gears.zip

curl -v -k -s -u "demo@redis.com:LpYaXizf" -F "module=@/tmp/redis-gears.zip" https://localhost:9443/v2/modules
```


#### Open port 9443
```bash
kubectl port-forward service/rec 9443:9443
```
   
#### Retrieve the password for REC's user: demo@redislabs.com
```bash
kubectl get secrets -n redis rec -o jsonpath="{.data.password}" | base64 --decode
```
     
    
#### Install RDI CLI
```bash
cat << EOF > /tmp/redis-di-cli-pod.yml
apiVersion: v1
kind: Pod
metadata:
  name: redis-di-cli
  labels:
    app: redis-di-cli
spec:
  containers:
    - name: redis-di-cli
      image: docker.io/redislabs/redis-di-cli
      volumeMounts:
      - name: config-volume
        mountPath: /app
      - name: jobs-volume
        mountPath: /app/jobs
  volumes:
    - name: config-volume
      configMap:
        name: redis-di-config
        optional: true
    - name: jobs-volume
      configMap:
        name: redis-di-jobs
        optional: true
EOF
kubectl apply -f /tmp/redis-di-cli-pod.yml
```


#### Create a new RDI database
```bash
kubectl exec -it -n default pod/redis-di-cli -- redis-di create --cluster-host localhost --no-configure
```
```
rec.redis.svc.cluster.local
```

