Init
----------------
```
$ ./init.sh
```
- install Google Cloud SDK: https://cloud.google.com/sdk/docs/downloads-interactive#mac

Dev
----------------

all (client, server, mongodb)
```
$ docker-compose up --build
```

client
```
$ docker-compose -f docker-compose-client.yml up --build
```

server
```
$ docker-compose -f docker-compose-server.yml up --build
```

Deploy to Production
--------------------
```
$ ./deploy.sh
```
- uses 'app.yml' for Google Apps Engine config

Managing Modules
----------------
- all node install & uninstalls should be done locally
- after install / uninstall restart docker container

Environment Variables
---------------------
- set in root .env files
- changing environment variable names requires updates to:
  - deploy.sh
  - client/webpack.*.js files
  - client/App.js
  - server/server.js

Google Storage
--------------
Cloud Cors
```
$ gsutil cors set google-storage-cors.json gs://augmented-music-generation-dev
$ gsutil cors get gs://augmented-music-generation-dev
```


