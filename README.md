Init
----------------
```
$ ./init.sh
```
- install Google Cloud SDK: https://cloud.google.com/sdk/docs/downloads-interactive#mac

Dev
----------------

all
```
$ docker-compose up --build
```

client
```
$ docker-compose up --build client
```

server
```
$ docker-compose up --build server
```

Build
-----
dev
```
$ ./build.sh .env
```

prod
```
$ ./build.sh .env.prod
```

Deploy
------
```
$ ./deploy.sh
```
- uses 'server/app.yml' for Google Apps Engine config
- uses 'server/Dockerfile' for Google Apps Engine container

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
$ gsutil cors set google-storage-cors.json gs://augmented-music-generation-dev
$ gsutil cors get gs://augmented-music-generation-dev
```


