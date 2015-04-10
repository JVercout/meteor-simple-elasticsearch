console.log('[SERVER] Loading publish.js ...');

Meteor.publish('markets', function () { return Market.find(); });
Meteor.publish('categories', function () { return Category.find(); });