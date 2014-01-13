require('list-view/list_view');

var get = Ember.get, set = Ember.set,
min = Math.min, max = Math.max, floor = Math.floor,
ceil = Math.ceil,
forEach = Ember.ArrayPolyfills.forEach;

Ember.ExpandableListView = Ember.ListView.extend({
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
        var expandedObject = array.findBy('index', changeMeta.index);
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
  },

  positionForIndex: function(index){
    var elementWidth, width, columnCount, rowHeight, y, x;

    elementWidth = get(this, 'elementWidth') || 1;
    width = get(this, 'width') || 1;
    columnCount = get(this, 'columnCount');
    rowHeight = get(this, 'rowHeight');

    var expandedAboveIndex = this.get('expandedIndices').filter(function(item) {
      return item.get('index') < index;
    }).reduce(function(prev, item, _, enumerable ) {
      return prev + item.get('expandedHeight');
    }, 0);

    // rowHeight * floor(index/columnCount) => all previious rowHeights combined
    // y = all previous rowHeights + reduced expanded

    y = (rowHeight * floor(index/columnCount)) + expandedAboveIndex;
    x = (index % columnCount) * elementWidth;

    return {
      y: y,
      x: x
    };
  },

  _reuseChildren: function(){
    var contentLength, childViews, childViewsLength,
        startingIndex, endingIndex, childView, attrs,
        contentIndex, visibleEndingIndex, maxContentIndex,
        contentIndexEnd, scrollTop;

    scrollTop = get(this, 'scrollTop');
    contentLength = get(this, 'content.length');
    maxContentIndex = max(contentLength - 1, 0);
    childViews = this.getReusableChildViews();
    childViewsLength =  childViews.length;

    startingIndex = this._startingIndex();
    visibleEndingIndex = startingIndex + this._numChildViewsForViewport();
    // best case scenario
    var visibleExpanded = this.get('expandedIndices').filter(function(item) {
      var index = item.get('index');
      return index >= startingIndex && index <= visibleEndingIndex;
    }).reduce(function(prev, item, index, enumerable ) {
      return prev + item.get('expandedHeight');
    }, 0);

    var rowHeight = this.get('rowHeight');
    // based on the expandedHeights we can't display more childViews
    var indexesToSubtract = floor(visibleExpanded / rowHeight);

    endingIndex = min(maxContentIndex, visibleEndingIndex - indexesToSubtract);

    contentIndexEnd = min(visibleEndingIndex, startingIndex + childViewsLength);

    for (contentIndex = startingIndex; contentIndex < contentIndexEnd; contentIndex++) {
      childView = childViews[contentIndex % childViewsLength];
      this._reuseChildForContentIndex(childView, contentIndex);
    }
  }

}); 
