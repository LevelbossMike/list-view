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
      this.get('controller').on('changeExpand', this, this.logHeightAfterRender);
    }.on('didInsertElement'),

    // this does not get called because we are reusing child views!
    removeExpandListener: function() {
      this.get('controller').off('changeExpand');
    }.on('willDestroyElement'),

    // gets called when context is updated for the listItemView
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
      // we want to make sure the dom has rerendered before checking the views
      // height after toggling expansion. We could use Ember.run.next but this
      // is not recommended according to the docs so we are using the afterRender
      // queue.
      Ember.run.scheduleOnce('afterRender', this, 'logHeight'); 
    },

    logHeight: function() {
      debugger;
      var expanded = this._parentView.get('expandedIndices');
      var expandedThis = expanded.findBy('index', this.get('contentIndex'));

      if (expandedThis != null) {
        expandedThis.set('height', this.$().height());
      }
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
          array.pushObject(Ember.Object.create({ index: changeMeta.index }));
        }
        return array;
      },

      removedItem: function(array, item, changeMeta, instanceMeta) {
        if (!item.get('expanded')) { 
          expandedObject = array.findBy('index', changeMeta.index);
          array.removeObject(expandedObject); 
        }
        return array;
      }
    })
  }); 
})();
