Init
----------------
```
$ ./init.sh
```
- install Google Cloud SDK: https://cloud.google.com/sdk/docs/downloads-interactive#mac

Dev
----------------
client
```
$ docker-compose up --build client
```

server
```
$ docker-compose up --build server
```

generate sound
```
$ docker-compose up --build generate
```

Build
-----
dev
```
$ ./build.sh .env
```

prod
```
$ ./build.sh
```

Deploy
------
```
$ ./deploy.sh
```
- 'heroku.yml' = heroku config
- env variables are set in heroku

Logs
----
```
$ heroku logs -t -a sound-gen-prod
```

Node Modules
------------
- install & uninstalls should be done locally
- when changing node_modules run the following command:
```
$ docker-compose down
```

Environment Variables
---------------------
- set in root .env files
- changing environment variable names requires updates to:
  - deploy.sh
  - client/webpack.*.js files
  - client/App.js
  - server/server.js

DB Service
----------
https://cloud.mongodb.com


Google Storage
--------------
Cloud Cors
```
$ gsutil cors set google-storage-cors.json gs://[bucket]
$ gsutil cors get gs://[bucket]
```

Service Key Creation
https://cloud.google.com/iam/docs/creating-managing-service-account-keys#iam-service-account-keys-create-console

Python SDK Docs
https://googleapis.github.io/google-cloud-python/latest/storage/blobs.html#google.cloud.storage.blob.Blob.upload_from_file