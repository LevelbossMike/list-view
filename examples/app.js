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
      if (newContext != null) {
        newContext.on('changeExpand', this, this.logHeightAfterRender);
      }
    },

    logHeightAfterRender: function() { 
      // we want to make sure the dom has rerendered before checking the views
      // height after toggling expansion. We could use Ember.run.next but this
      // is not recommended according to the docs so we are using the afterRender
      // queue.
      Ember.run.scheduleOnce('afterRender', this, 'logHeight'); 
    },

    logHeight: function() {
      var expanded = this._parentView.get('expandedIndices');
      var expandedThis = expanded.findBy('index', this.get('contentIndex'));
      var rowHeight = this._parentView.rowHeight;

      if (expandedThis != null) {
        expandedThis.set('expandedHeight', this.$().height() - rowHeight );
      }
      this._parentView._syncChildViews();

    }

  });

  App.ItemsView = Ember.ListView.extend({
    elementId: 'items',
    height: 300,
    width: 500,
    rowHeight: 23,
    itemViewClass: App.ItemView,
    expandedItems: Ember.computed.filterBy('content', 'expanded', true),

    // don't iterate over the whole array when @each.expanded is changed. Only
    // use the element that changed its expanded property to change the
    // expandedIndices array.
    expandedIndices: Ember.arrayComputed('content.@each.expanded', {
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
    }),

    _startingIndex: function() {
      var scrollTop, rowHeight, columnCount, calculatedStartingIndex,
          contentLength, largestStartingIndex;

      contentLength = get(this, 'content.length');
      scrollTop = get(this, 'scrollTop');
      rowHeight = get(this, 'rowHeight');
      columnCount = get(this, 'columnCount');

      // 'best case' scenario. Nothing is expanded and we can take row heights
      // we have to check if anything above the best case startingIndex is
      // expanded accummulate those heights and subtract this from scrollTop
      calculatedStartingIndex = floor(scrollTop / rowHeight) * columnCount;

      var expandedAbove = this.get('expandedIndices')
        .filter(function(item) { 
          return (item.index < calculatedStartingIndex); 
        })
        .reduce(function(prev, item, index, enumerable) {
          return prev + item.get('expandedHeight');
        }, 0);

      var correctedStartingIndex = floor((scrollTop - expandedAbove) / rowHeight) * columnCount;

      largestStartingIndex = max(contentLength - 1, 0);

      return min(correctedStartingIndex, largestStartingIndex);
    }
  }); 
})();
