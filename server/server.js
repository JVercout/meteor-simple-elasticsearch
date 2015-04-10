console.log('[SERVER] Loading server.js ...');

var environment, settings;

environment = process.env.METEOR_ENV || "development";

settings = {
  development: {
    public: {
      "locale": "fr",
      "unit": "km"
    },
    private: {
      "mail": {
        "url": "",
        "login": "",
        "password": "",
        "port": ""
      },
      "socials": {
        "facebook": "",
        "twitter": "",
        "google": "",
        "linkedin": "",
      },
      "elasticsearch": {
        "host": "http://localhost:9200/",
        "index": "fr"
      }
    }
  },
  staging: {
    public: {},
    private: {}
  },
  production: {
    public: {},
    private: {}
  }
};

console.log(settings);

if (!process.env.METEOR_SETTINGS) {
  console.log("No METEOR_SETTINGS passed in, using locally defined settings.");
  if (environment === "production") {
    Meteor.settings = settings.production;
  } else if (environment === "staging") {
    Meteor.settings = settings.staging;
  } else {
    Meteor.settings = settings.development;
  }
  console.log(" [ " + environment + " ] Meteor.settings");
  console.log("[Object] Settings meteor" , Meteor.settings);
}

/**
 ** Kadira
 **/
Kadira.connect('6Q2o7mramTekCRptE', '2b7d16d5-98e4-4be1-8682-f2435bfbe87f');
/**** End of Kadira ****/


/**
 ** Elasticsearch Client Configuration **
 **/ 
var elasticsearch = Meteor.npmRequire('elasticsearch');
var elasticsearchClient = new elasticsearch.Client({
  host: Meteor.settings.private.elasticsearch.host
});

EsClient = Async.wrap(elasticsearchClient, ['index', 'delete', 'search']);
/**** End of Elasticsearch Client configuration ****/


/**
 ** Collection Observation Hook
 **/

Asset.after.insert(function (userId, doc) {
  console.log(' === Inserted ===');
  console.log(doc);

  EsClient.index({
    index: Meteor.settings.private.elasticsearch.index,
    type: "asset",
    id: doc._id,
    body: doc
  });
});

Asset.after.update(function (userId, doc, fieldNames, modifier, options) {
  console.log(' === Updated === ');
  console.log(doc);

  EsClient.index({
    index: Meteor.settings.private.elasticsearch.index,
    type: "asset",
    id: doc._id,
    body: doc
  });
});

Asset.after.remove(function(userId, doc) {
  console.log(' === Deleted === ');
  console.log(doc);

  EsClient.delete({
    index: Meteor.settings.private.elasticsearch.index,
    type: "asset",
    id: doc._id
  });
});

/**** End of Collection Hooks ****/
/** Note: this should be generic, fixed to any searchable collection **/ 




/**
 ** Faker
 **/

if( Category.find().count() < 1) {
  Category.insert({title: "Patent"});
  Category.insert({title: "Brand"});
  Category.insert({title: "Software"});
}

if( Market.find().count() < 1) {
  Market.insert({title: "Advertising"});
  Market.insert({title: "Construction"});
  Market.insert({title: "Healthcare"});
  Market.insert({title: "Energy"});
  Market.insert({title: "Media and communication"});
}

faker = Meteor.npmRequire('faker');
faker.locale = Meteor.settings.public.locale;

if( Asset.find().count() < 100 ) {
  _.each(_.range(100), function () {
    var rCompanyName = faker.company.companyName();
    var rCompanyRegistrationNumber = faker.random.number({min: 100000, max: 1000000});
    var rTitle = faker.lorem.sentence();
    var rDescription = faker.lorem.paragraphs(4);


    var rKeywords = [];
    _.each(_.range(faker.random.number({ min: 1, max: 10 })), function () {
      rKeywords.push(faker.lorem.words(1));
    });
    console.log(rKeywords);

    var transationKind = ['sell', 'rent', 'echange'];
    var rTransactionType = transationKind[faker.random.number({min:0, max: 2})];
    console.log(rTransactionType);

    var rPrice = faker.random.number({min: 1, max:1000000});

    var categories = Category.find().fetch();
    var rCategory = categories[faker.random.number({ min: 0, max: Category.find().count() - 1 })]._id;

    var markets = Market.find().fetch();
    var rMarkets = [];
    _.each(_.range(faker.random.number({min: 1, max: 5})), function () {
      rMarkets.push(markets[faker.random.number({min: 0, max: Market.find().count() -1})]._id);
    });
    rMarkets = _.uniq(rMarkets);
    console.log(rMarkets);

    var rLon = faker.address.longitude();
    var rLat = faker.address.latitude();
    
    var rCompany = {};
    rCompany.name = rCompanyName;
    rCompany.registrationNumber = rCompanyRegistrationNumber;

    Asset.insert({
      company: rCompany,
      title: rTitle, 
      description: rDescription,
      transactionType: rTransactionType,
      price: rPrice,
      category: rCategory,
      markets: rMarkets,
      location: [rLon, rLat]
    });
    
  });
}
/**** End of Faker ****/

/**
 ** Elastic Mapping
 **
 ** PUT http://localhost:9200/fr/asset/_mapping
 **/

/*
{
  "settings": {
    "analysis": {
      "filter": {
        "ngram_filter": {
          "type": "edgeNGram",
          "min_gram": 3,
          "max_gram": 25,
          "token_chars": [
            "letter",
            "digit",
            "punctuation"
          ]
         }, 
         "fr_stop_filter": {
           "type": "stop",
           "stopwords": ["_french_"]
         },
         "fr_stem_filter": {
           "type": "stemmer",
           "name": "minimal_french"
          }
      },
      "analyzer": {
        "fr_analyzer": {
          "type": "custom",
          "filter": ["icu_normalizer", "elision", "fr_stop_filter", "fr_stem_filter", "icu_folding"],
          "tokenizer": "icu_tokenizer"
        },
        "fr_analyzer_edgengram": {
          "type": "custom",
          "filter": ["icu_normalizer", "elision", "fr_stop_filter", "fr_stem_filter", "icu_folding", "ngram_filter"],
          "tokenizer": "icu_tokenizer"
        }
      }
    }
  },
  "mappings": {
    "asset": {
      "_all": {
        "index_analyzer": "fr_analyzer"
      },
      "properties": {
          "advanced" : {"type": "boolean"},
          "category": {
            "type": "string",
            "index": "not_analyzed"
          },
          "markets": {
            "type": "string", 
            "index": "not_analyzed",
            "index_name": "market"
          },
          "transactionType": {
            "type": "string",
            "index": "not_analyzed"
          },
          "company": {
            "type": "object",
            "properties": {
              "name" : { "type": "string", "boost": 7},
                "registrationNumber": { "type": "string" }
            }
          },
          "title": { 
            "type": "string",
            "boost": 20,
            "analyzer": "fr_analyzer_edgengram"
          },
          "description": { 
            "type": "string",
            "boost": 4
          },
          "keywords": {
            "type": "string", 
            "index_name": "keyword",
            "boost": 7
          },
          "price": { "type": "float" },
          "location": { "type": "geo_point" },
          "modifiedAt": { "type": "date" },
          "status": {"type": "integer"}
      }
    }
  }
}
*/

/**** End of Mapping ElasticSearch ****/


