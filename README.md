# mSearch

This is a simple example about how elasticsearch can work with Meteor.js. This is a development repository. 


** Requirement **

* Install Meteor
```
curl https://install.meteor.com/ | sh
```

* Install elasticsearch on your development machine:

Version tested: 1.4.2, 1.5.0

On Mac OS X: 
brew install elasticsearch





** Run **

Be sure elaticsearch is running on port 9200.

```
git clone https://github.com/JVercout/meteor-es-simple-example
cd ./meteor-es-simple-example 
meteor
```

This will boot the app, fill the mongo database and elasticsearch index with fixture content. 
