console.log('[CLIENT] main.* wildcard - app.js  ...');


Meteor.subscribe('markets');
Meteor.subscribe('categories');


Template.registerHelper('activeIfTemplateIs', function (template) {
    var currentRoute = Router.current();
    return currentRoute && template === currentRoute.lookupTemplate() ? 'active' : '';
  }
);


/** UI Helpers **/
Template.registerHelper('getName', function(context, options) {

  if( context.hash.collection == "category" ) {
    return Category.findOne({_id: context.hash.id}).title;
  }
  else if( context.hash.collection == "market" ) {
    return Market.findOne({_id: context.hash.id}).title;
  }

});


Meteor.startup(function() {
  return SEO.config({
    title: 'Meteor app test',
    meta: {
      'description': 'Structure of a Meteor app minimal load '
    },
    og: {
      'image': 'http://www.bebegavroche.com/media/wysiwyg/mickey.jpg' 
    }
  });
});


