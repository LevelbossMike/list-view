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
      // we want to make sure the dom has rerendered before checking the views
      // height after toggling expansion. We could use Ember.run.next but this
      // is not recommended according to the docs so we are using the afterRender
      // queue.
      // propably this should use a different way to bind the context than this.
      this.get('controller').on('changeExpand', this, this.logHeightAfterRender);
    }.on('didInsertElement'),

    // this does not get called because we are reusing child views!
    removeExpandListener: function() {
      this.get('controller').off('changeExpand');
    }.on('willDestroyElement'),

    updateContext: function(newContext) {
      // clear expandListener and resetup so we are using the right controllers
      // again
      if (this.get('context') != null) {
        this.get('context').off('changeExpand');
      }

      this._super(newContext);
      newContext.on('changeExpand', this, this.logHeightAfterRender);
    },

    logHeightAfterRender: function() { 
      Ember.run.scheduleOnce('afterRender', this, 'logHeight'); 
    },
    // we have to hoock into rerender because we are not creating new views we
    // are only changing the views contexts.
    logHeight: function() {
      var height = this.$().height();

      console.log(height);
    }

  });

  App.ItemsView = Ember.ListView.extend({
    elementId: 'items',
    height: 300,
    width: 500,
    rowHeight: 23,
    itemViewClass: App.ItemView,
    expandedItems: Em.computed.filterBy('content', 'expanded', true),

    expandedIndices: Em.arrayComputed('content.@each.expanded', {
      addedItem: function(array, item, changeMeta, instanceMeta) {
        if (item.get('expanded')) { 
          array.pushObject({ index: changeMeta.index });
        }
      },

      removedItem: function(array, item, changeMeta, instanceMeta) {
        if (!item.get('expanded')) { 
          expandedObject = array.findBy('id', changeMeta.index);
          array.removeObject(expandedObject); 
        }
      }
    })
  }); 
})();
