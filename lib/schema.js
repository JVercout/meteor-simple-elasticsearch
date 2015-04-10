console.log('[COMMON] Loading schema.js ...');

/** SimpleSchema Messages **/ 
SimpleSchema.messages({
  "maxSmallerThanMin": "Max is smaller than minimum"
});


/** Schema Definitions **/
Schema = {};


Schema.Category = new SimpleSchema({
  title: {type: String },
  modifiedAt: { type: Date, autoValue: function() { return new Date(); }}
});
Category.attachSchema(Schema.Category);


Schema.Market = new SimpleSchema({
  title: {type: String },
  modifiedAt: { type: Date, autoValue: function() { return new Date(); }}
});
Market.attachSchema(Schema.Market);


Schema.Asset = new SimpleSchema({
  advanced: { type: Boolean, defaultValue: false},
  company: { type: Object, optional: true },
  'company.name': {type: String, optional: false},
  'company.registrationNumber': {type: String, optional: true}, 
  title: { type: String },
  description: { type: String },
  keywords: { type: [String], optional: true },
  transactionType: {
    type: String, 
    allowedValues: ['sell', 'rent', 'echange'],
    optional: false,
    autoform: {
      type: "select",
      options: function () {
        return [{label: 'Sell', value: 'sell'}, {label: 'Rent', value: 'rent'}, {label: 'Echange', value:'echange'}];
      }
    }
  },
  price: { type: Number, decimal: true, optional: true },
  currency: { type: String, defaultValue: 'USD', optional: true },
  category: { 
    type: String,
    allowedValues: function () { return _.pluck(Category.find().fetch(), "_id"); }, 
    autoform: {
      type: "select", 
      options : function () { 
        return _.map(Category.find().fetch(), function (cat) { return {label: cat.title, value: cat._id}; }); 
      }
    }
  },
  markets: { 
    type: [String],
    allowedValues: function () { return _.pluck(Market.find().fetch(), "_id"); }, 
    autoform: {
      type: "select-multiple", 
      options : function () { 
        return _.map(Market.find().fetch(), function (ma) { return {label: ma.title, value: ma._id}; }); 
      }
    }
  },
  location: { 
    type: [Number], 
    decimal: true, 
    optional: true
  },
  modifiedAt: { 
    type: Date, 
    autoValue: function () { return new Date();} 
  },
  status: {
    type: Number, 
    defaultValue: 1 
  }
});
Asset.attachSchema(Schema.Asset);


Schema.SearchForm = new SimpleSchema({
  searchText: { type: String, max: 50, optional: true },
  transactionType: {
    type: String, 
    allowedValues: ['sell', 'rent', 'echange'],
    optional: true,
    autoform: {
      type: "select",
      options: function () {
        return [{label: 'Sell', value: 'sell'}, {label: 'Rent', value: 'rent'}, {label: 'Echange', value:'echange'}];
      }
    }
  },
  category: { 
    type: String, 
    optional: true, 
    allowedValues: function () { return _.pluck(Category.find().fetch(), "_id"); },
    autoform: {
      type: "select",
      options: function () {
        return _.map(Category.find().fetch(), function (cat) { return {label: cat.title, value: cat._id}; });
      } 
    }
  },
  markets: { 
    type: [String],
    allowedValues: function () { return _.pluck(Market.find().fetch(), "_id"); },
    optional: true, 
    autoform: {
      type: "select-checkbox", 
      options : function () { 
        return _.map(Market.find().fetch(), function (ma) { return {label: ma.title, value: ma._id}; }); 
      }
    }
  },
  price: {
    type: Object,
    optional: true
  },
  'price.min': {
    type: Number, 
    min: 0
  },
  'price.max': {
    type: Number,
    custom: function () {
      if( this.value <= this.field('price.min').value) {
        return "maxSmallerThanMin";
      }
    }
  },
  /*
  geofilter: {
    type: Object,
    optional: true
  },
  'geofilter.point': {
    type: [Number],
    decimal: true,
    optional: true,
    autoform: {
      type: 'map',
      afFieldInput: {
        type: 'map',
        geolocation: true,
        searchBox: true,
        autolocate: true
      }
    }
  },
  'geofilter.distance': {
    type: Number,
    optional: true,
    allowedValues: function () { return [50, 100, 1000, 10000]; },
    defaultValue: 100,
    autoform: {
      type: "select",
      options: function () { return [{label: '50km', value: 50}, {label: '100km', value: 100}, {label: "1000km", value:1000}, {label:"10000km", value: 10000}]}
    }
  },
  */
  page: {
    type: Number,
    optional: false,
    defaultValue: 1,
    min: 1
  }
});