console.log('[COMMON] Loading routes.js ...');

Router._filters = {
  resetScroll: function () {
    var scrollTo = window.currentScroll || 0;
    $('body').scrollTop(scrollTo);
    $('body').css('min-height', 0);
  }
};
var filters = Router._filters;

Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: 'notfound',
  loadingTemplate: 'loading',
  yieldTemplates: {
    'navbar': {to: 'header'},
    'footer': {to: 'footer'},
  },
  
  onAfterAction: function () {
      document.body.className = this._layout._regions.main._template.trim().toLowerCase();
  }
});

Router.map(function () {
  this.route('home', {
    path: '/',
    controller: 'HomeController'
  });
  
  this.route('search', {
    path: '/search',
    controller: 'SearchController'
  });


});

