# mSearch

This is a simple example about how elasticsearch can work with Meteor.js. This is a development repository. 


## Requirements

###Install Meteor
```
curl https://install.meteor.com/ | sh
```

###Install elasticsearch on your development machine:
Elasticsearch version tested: 1.4.2, 1.5.0.
* On Mac OS X: `brew install elasticsearch`


## Run
1. Be sure elaticsearch is running on port 9200.
2. Execute the following command-line
```
git clone https://github.com/JVercout/meteor-es-simple-example
cd ./meteor-es-simple-example 
meteor
```

This will boot the app and fill the mongo database and elasticsearch index with fixture content. 
