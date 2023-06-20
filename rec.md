### Install RDI on K8

#### Deploy REC
```bash
kubectl create namespace redis
kubectl config set-context --current --namespace=redis

VERSION=`curl --silent https://api.github.com/repos/RedisLabs/redis-enterprise-k8s-docs/releases/latest | grep tag_name | awk -F'"' '{print $4}'`

kubectl apply -n redis -f https://raw.githubusercontent.com/RedisLabs/redis-enterprise-k8s-docs/$VERSION/bundle.yaml
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

kubectl apply -f rec.yaml -n redis 
```


#### Retrieve the password for REC's user: demo@redislabs.com
```bash
export REC_PWD=$(kubectl get secrets -n redis rec -o jsonpath="{.data.password}" | base64 --decode)
```


#### Open port 8443 & 9443
```bash
kubectl port-forward service/rec-ui -n redis 8443:8443
kubectl port-forward service/rec -n redis 9443:9443
```

          
#### Install Redis Gears
```bash
kubectl exec -it rec-0 -n redis -- curl -s https://redismodules.s3.amazonaws.com/redisgears/redisgears_python.Linux-ubuntu18.04-x86_64.1.2.6.zip -o /tmp/redis-gears.zip

kubectl exec -it rec-0 -n redis -- curl -k -s -u "demo@redislabs.com:${REC_PWD}" -F "module=@/tmp/redis-gears.zip" https://localhost:9443/v2/modules
```


#### Install RDI CLI
```bash
kubectl config set-context --current --namespace=default

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
# kubectl exec -it -n default pod/redis-di-cli -- redis-di create --cluster-host localhost --no-configure

kubectl exec -it -n default pod/redis-di-cli -- redis-di create --cluster-host localhost 
```

    

```
rec.redis.svc.cluster.local
demo@redislabs.com
92wcLdKt

```


#### Create RDI config file
```bash
kubectl exec -n default -it pod/redis-di-cli -- redis-di scaffold --db-type postgresql --preview config.yaml > config.yaml
```


#### Create ConfigMap for Redis Data Integration
```bash
kubectl create configmap redis-di-config --from-file=config.yaml -n default
```


#### Deploy configuraiton
```bash
kubectl exec -n default -it pod/redis-di-cli -- redis-di deploy
```


#### Install the Debezium Server
```bash
kubectl exec -n default -it pod/redis-di-cli -- redis-di scaffold --db-type postgresql --preview debezium/application.properties > application.properties
```


#### Set up example (PostgreSQL DB)
```bash
cat << EOF > /tmp/example-postgres.yml
apiVersion: v1
kind: Pod
metadata:
  name: example-postgres
  labels:
    app: postgres
spec:
  containers:
    - name: example-postgres
      image: docker.io/debezium/example-postgres
      ports:
      - containerPort: 5432
      env:
      - name: POSTGRES_USER
        value: "postgres"
      - name: POSTGRES_PASSWORD
        value: "postgres"

---

apiVersion: v1
kind: Service
metadata:
  name: example-postgres
  labels:
    app: postgres
spec:
  type: NodePort
  ports:
  - port: 5432
  selector:
    app: postgres
EOF
kubectl apply -f /tmp/example-postgres.yml
```


#### Populate PostgreSQL DB
```bash
kubectl exec -it pod/example-postgres bash
```
Get psql prompt:
```bash
psql -h example-postgres.default.svc.cluster.local -U postgres
```    
Password: postgres
```bash
CREATE TABLE emp (
	user_id serial PRIMARY KEY,
	fname VARCHAR ( 50 ) NOT NULL,
	lname VARCHAR ( 50 ) NOT NULL
);

insert into emp (fname, lname) values ('Gilbert', 'Lau');
insert into emp (fname, lname) values ('Robert', 'Lau');
insert into emp (fname, lname) values ('Kai Chung', 'Lau');
insert into emp (fname, lname) values ('Albert', 'Lau');
insert into emp (fname, lname) values ('Abraham', 'Lau');
insert into emp (fname, lname) values ('May', 'Wong');
insert into emp (fname, lname) values ('Henry', 'Ip');
```




#### Create a ConfigMap for Debezium Server
```bash
kubectl create configmap debezium-config --from-file=application.properties
```


#### Create the Debezium Server Pod
```bash
cat << EOF > /tmp/debezium-server-pod.yml
apiVersion: v1
kind: Pod
metadata:
  name: debezium-server
  labels:
    app: debezium-server
spec:
  containers:
    - name: debezium-server
      image: docker.io/debezium/server
      livenessProbe:
        httpGet:
            path: /q/health/live
            port: 8088
      readinessProbe:
        httpGet:
            path: /q/health/ready
            port: 8088
      volumeMounts:
      - name: config-volume
        mountPath: /debezium/conf
  volumes:
    - name: config-volume
      configMap:
        name: debezium-config
EOF
kubectl apply -f /tmp/debezium-server-pod.yml
```

    
