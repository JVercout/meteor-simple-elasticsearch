console.log('[SERVER] Loading methods.js ...');
var ejs = Meteor.npmRequire('elastic.js');

Meteor.methods({
  searchAssets: function( document, modifier, documentId ) {
    console.log(" === Meteor Method searchAsset called === ");

    console.log("document");
    console.log(document);


    /** search for a string **/
    //var searchableFields = ['title']; //keywords
    var searchableFields = ['title', 'description', 'company.name', 'company.registrationNumber']; //keywords
    
    var qstr;
    if( !_.has(document, 'searchText') || ( _.has(document, 'searchText') && ( document.searchText == '' || document.searchText.length < 3 ) ) ) {
      console.log(" === NO SEARCH TEXT === ");
      qstr = ejs.MatchAllQuery();
    }
    else {
      console.log(" === SEARCH for TEXT === ");
      /*
      qstr = ejs.BoolQuery();
      _.each(searchableFields, function (field) {
        //qstr.should(ejs.MatchQuery(field, document.searchText).fuzziness("AUTO"));
      });
*/
      qstr = ejs.MultiMatchQuery(searchableFields, document.searchText).slop(5).fuzziness("AUTO").operator("or");
    }

    /** filtering behaviour **/

    //filteredFields = ['category', 'markets', 'transactionType', 'minPrice', 'maxPrice'];
    filteredFields = [{key: 'category', type: 'term', schemaKey: 'category'}, 
                      {key: 'transactionType', type: 'term', schemaKey: 'transactionType'},
                      {key: 'markets', type: 'term', schemaKey: 'markets'},
                      {key: 'price', type: 'range', schemaKey: 'price'},
                      {key: 'geofilter', type: 'location', schemaKey: 'location'}
                      ];

    var isFiltered = false;
    var filters = [];

    _.each(filteredFields, function (field) {
      if( _.has(document, field.key) ) {
        isFiltered = true; 

        switch(field.type) {
          case 'term':
            filters.push(ejs.TermsFilter(field.schemaKey, document[field.key]));
            break;

          case 'range': 
            filters.push(ejs.RangeFilter(field.schemaKey).gte(document[field.key].min).lte(document[field.key].max));
            break;

          case 'location':
            var lat =  
            filters.push(ejs.GeoDistanceFilter(field.schemaKey).point(ejs.GeoPoint().string(document[field.key].point)).distance(document[field.key].distance));
          default:
            break;
        }
        
      }
    });

    console.log(' == isFiltered == ');
    console.log(isFiltered);

    //var fCategory = ejs.TermFilter('category', 'wzJ9zSjzJsrxfuAsJ');


    var request;
    if( !isFiltered ) {
      request = ejs.Request().query(qstr);
    }
    else {
      request = ejs.Request().query(ejs.FilteredQuery(qstr, ejs.AndFilter(filters)));
    }

    var size = 10;
    var from = (document.page - 1) * size;

    console.log(JSON.stringify(request, undefined, 2));
    /** Proceed request **/
    var result = EsClient.search({
      index: [Meteor.settings.private.elasticsearch.index], //can go for multiple index
      type: 'asset',
      body: request,
      from: from,
      size: size,
      sort: ["advanced:desc", "_score:desc", "modifiedAt:desc"]
    });
    console.log(JSON.stringify(result, undefined, 2));

    var data = result.hits.hits.map(function (doc) {
      return doc._source;
    });

    var metadata = {
      total: result.hits.total,
      aggregations: result.aggregation
    }

    return { data: data, metadata: metadata };
  }
});