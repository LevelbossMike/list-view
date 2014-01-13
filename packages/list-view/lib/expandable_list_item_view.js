require('list-view/list_item_view');

Ember.ExpandableListItemView = Ember.ListItemView.extend({
  setupExpandListener: function() {
    this.get('controller').on('changeExpand', this, this.logHeightAfterRender);
  }.on('didInsertElement'),

  removeExpandListener: function() {
    this.get('controller').off('changeExpand');
  }.on('willDestroyElement'),

  // gets called when context is updated for the listItemView
  // we have to clear the changeExpand-listener on the context here because we
  // are changing the views contexts not rerendering the view.
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
