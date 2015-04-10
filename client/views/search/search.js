console.log('[CLIENT] Loading search.js ...');

/** BUILD QUERY WITH ARRAY **/

var go = function(query) {
  Router.go(Router.current().route.getName(), Router.current().params, {
    query: query,
    hash: Router.current().params.hash
  });
};

Router.query = {
  _add: function(query, name, value) {
    if (! query[name])
      query[name] = [value];
    else {
      if (! _.isArray(query[name]))
        throw new Meteor.Error("Router.query.add: param `" + name + "` already exists and is not an array");
        // or turn it into an array? (see tests)
        // query[name] = [query[name]];

      if (_.indexOf(query[name], value) === -1)
        query[name].push(value);
    }
    return query;
  },
  _isSet: function(query, name, value) {
    return !! (query[name] && _.indexOf(query[name], value) !== -1);
  },
  _remove: function(query, name, value) {
    if (! _.has(query, name))
      throw new Meteor.Error("Router.query.remove: param `" + name + "` does not exist");
    if (! _.isArray(query[name]))
      throw new Meteor.Error("Router.query.remove: param `" + name + "` already exists and is not an array");

    // remove the property if `value` is the last element in the array
    if (query[name].length === 1 && query[name][0] === value)
      delete query[name];
    else
      query[name] = _.without(query[name], value);

    return query;
  },
  _clear: function() {
    return {};
  },

  add: function(name, value) {
    var query = EJSON.clone(Router.current().params.query);
    var newQuery = this._add(query, name, value);
    go(newQuery);
  },
  remove: function(name, value) {
    var query = EJSON.clone(Router.current().params.query);
    var newQuery = this._remove(query, name, value);
    go(newQuery);
  },
  isSet: function(name, value) {
    var query = Router.current().params.query;
    return this._isSet(query, name, value);
  },
  clear: function() {
    go(this._clear());
  }
};





/** 
 * Search.js

 * TODO :
 *   - category: slug
 *   - initial load call?
 *   - url rewrite for search / advanced search / typology pages
 *   - pagination: load more + page by page + infinite scroll
 *   - custom index by language
 *   - reindex process + update index process

 *   - reactive data source using MongoDB for automatically support update on ticket ? sort ? 
 *   - autocomplete and results suggester on search text field 
 *   - geolocated search + sort by location?
 *   - faceting
 *   - caching client queries
 *   - more like this query for similar item
 *   - pub/sub on elasticsearch ? 

 * DONE
 *   - custom booster by field into mapping! 
 *   - partial word matching : edgeNGram Analyzer on title
 */

Template.search.events({
  'keyup input[type=text]': _.throttle( function (event) {
      var name = event.target.name;
      var value = event.target.value;

      var query = Router.current().params.query;
      if( value == '') { 
        delete query[name]; 
      }
      else {
        query[name] = value;
      }
      Router.go(Router.current().route.getName(), Router.current().params, {query: query, hash: Router.current().params.hash});

  }, 500),
  'change select': _.throttle( function(event){
    var name = event.target.name;
    var value = event.target.value;

    var query = Router.current().params.query;
    if( value == '') { 
      delete query[name]; 
    }
    else {
      query[name] = value;
    }
    Router.go(Router.current().route.getName(), Router.current().params, {query: query, hash: Router.current().params.hash});
  }),
  'click input[type=checkbox]': _.throttle(function (event) {
    var name = event.target.name;
    var value = event.target.value;

    if( $(event.target).is(':checked') ) {
      Router.query.add(name, value);
    }
    else {
      Router.query.remove(name, value);
    }

  })
});


SearchController = AppController.extend({
  // template: 'search',

  // layoutTemplate: 'layout',
  yieldRegions: {
    'navbar': {to: 'header'},
    'footer': {to: 'footer'},
  },

  waitOn: function () {
    console.log(this.url);
    console.log('Method waitOn');
  },

  /**
   * @desc : Called when the route is first run. It is not called again 
   * if the route reruns because of a computation invalidation.
   */
  onRun: function () {
    console.log('Method onRun');
    this.next();
  },

  /**
   * @desc : Called if the route reruns because its computation is invalidated.
   */
  onRerun: function () {
    console.log('Method onRerun');
    this.next();
  },

  load: function () {
    console.log('Method load +-------------------------------');
    this.next();
  },

  /**
   * @desc : Called before the route or "action" function is run. These hooks 
   * behave specially. If you want to continue calling the next function you 
   * must call this.next(). If you don't, downstream onBeforeAction hooks and 
   * your action function will not be called.
   */
  onBeforeAction: function () {
    console.log('Method onBeforeAction');
    this.next();
  },

  before: function () {
    console.log('Method before');
    this.next();
  },

  action: function () {
    console.log('Method action');


    var query = this.params.query;
    console.log(query);

    if( !_.has(query, 'page') ) {
      query['page'] = 1;
    }

    Meteor.call('searchAssets', this.params.query, function(err, result){
      if( err ) throw err;
      
      console.log(" == Async callback searchAssets  === ");
      Session.set('searchResult', result);
    });

    this.render();
  },

  /**
   * @desc : Called after your route/action function has run or had a chance to run. 
   * These hooks behave like normal hooks and you don't need to call this.next() 
   * to move from one to the next.
   */
  onAfterAction: function () {
    console.log('Method onAfterAction');
  },

  after: function () {
    console.log('Method after');
  },

  /**
   * @desc : Access this data from the associated template.
   */
  data: function () {
    console.log('Method data');
    
    //initial state
    //Session.set("searchResult", {metadata: {total: 0}});

    markets = Market.find().fetch();
    categories = Category.find().fetch();
    query = this.params.query;

    return {
      markets: markets,
      categories: categories,
      searchResult: function () { return Session.get("searchResult"); },
      searchContext: function () { return query; } 
    };
  },

  /**
   * @desc : Called when the route is stopped, typically right before a new route is run.
   */
  /*
  stop: function () {
    console.log('Method stop');
    // return false;
    this.next();
  },
  */

  /**
   * @desc : This is called when you navigate to a new route
   */
  unload: function () {
    console.log('Method unload -------------------------------');
    console.log('');
    // this.next();
    return '';
  },

});


AutoForm.hooks({
  searchForm: {
    onError: function(operation, err, template) {
      //if( err ) throw err;
    },
    onSuccess: function(operation, result, template) {
        //console.log(" === searchAsset call success === ");
        Session.set("searchResult", result);
    }
  }
});

