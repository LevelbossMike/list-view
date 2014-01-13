(function () {
  App = Ember.Application.create();
  var get = Ember.get, set = Ember.set,
  min = Math.min, max = Math.max, floor = Math.floor,
  ceil = Math.ceil,
  forEach = Ember.ArrayPolyfills.forEach;

  App.PeopleController = Ember.ArrayController.extend({
    itemController: 'person'
  });

  App.IndexRoute = Ember.Route.extend({
    setupController: function(controller) {
      var content = [], people = this.controllerFor('people');
      for (var i = 0; i < 1000; i++) {
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

  App.ItemView = Ember.ExpandableListItemView.extend({
    templateName: 'item'
  });

  App.ItemsView = Ember.ExpandableListView.extend({
    elementId: 'items',
    height: 300,
    width: 500,
    rowHeight: 23,
    itemViewClass: App.ItemView
  });
})();
