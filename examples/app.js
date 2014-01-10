(function () {
  App = Ember.Application.create();

  App.PeopleController = Ember.ArrayController.extend({
    itemController: 'person'
  });

  App.IndexRoute = Ember.Route.extend({
    setupController: function(controller) {
      var content = [], people = this.controllerFor('people');
      for (var i = 0; i < 100; i++) {
        content.push({name: "Item" + i});
      }
      people.set('content', content);
    }
  });

  App.PersonController = Ember.ObjectController.extend(Ember.Evented, {
    expanded: false,
    expand: function () {
      this.toggleProperty('expanded');
      this.trigger('changeExpand');
    }
  });


  App.ItemView = Ember.ListItemView.extend({
    templateName: 'item',

    setupExpandListener: function() {
      logHeight = (function() { Ember.run.next(this, this.logHeight); }).bind(this);
      this.get('controller').on('changeExpand', logHeight);
    }.on('didInsertElement'),

    logHeight: function() {
      console.log(this.$().height());
    }
  });

  App.ItemsView = Ember.ListView.extend({
    height: 300,
    width: 500,
    rowHeight: 43,
    itemViewClass: App.ItemView
  }); 

})();
