Init
----------------
```
$ ./init.sh
```

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

Managing Modules
----------------
- local node_modules syncs with docker images node_modules
- all node install & uninstalls should be done locally

Deploy to Production
--------------------
```
$ ./deploy-prod.sh
```

Google Storage
--------------

Cloud Cors
```
$ gsutil cors set google-storage-cors.json gs://augmented-music-generation-dev
$ gsutil cors get gs://augmented-music-generation-dev
```


