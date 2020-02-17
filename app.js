var itemIds = [];
var itemList = [];
var itemLimit = 40;
var offset = 0;
var busy = false;
var scrollThrottle = null;
var ajaxTimeout = null;
var pageType = 'list';
var baseURL = 'https://hacker-news.firebaseio.com/v0';
var newItemsRequest = $.ajax(baseURL + '/newstories.json');
var i = 1;

function getMoreItems(newItems, offset) {
   newItems = newItems.slice(offset, offset + itemLimit);

   var requests = newItems.map(function(item) {
      var itemData = $.ajax(baseURL + '/item/' + item + '.json');
      return itemData;
   });

   $.when.apply($, requests).done(function() {
      var results = Array.prototype.slice.call(arguments, 0).map(function(array) {
         return array[0];
      });
      results.forEach(function(result) {
         itemList.push(result);
         $('#content').append(format(result, i));
         i++;
      });
   });

   this.offset += 20;
   if (this.offset >= 100) {
      $('#scroll_text').hide();
      $(window).unbind('scroll');
   }
   busy = false;
}

function format(data, i) {
   var link = '<span class=item_num>' + i + '.</span> <a class="lead" target="_blank" href="' + data.url + '" >' + data.title + '</a>',
       entryArgs = ['<div class="item_entry">',link,'</div>',];
   var blurb = entryArgs.join('');
   return blurb;
};


$(window).scroll(function() {
   clearTimeout(scrollThrottle);
   scrollThrottle = setTimeout(function() {
      if (pageType === 'list') {
         if (!busy && $(window).scrollTop() + $(window).height() == $(document).height()) {
            busy = true;
            getMoreItems(itemIds, offset);
         }
      }
   }, 300);
});

newItemsRequest.done(function(newItems) {
   itemIds = newItems;
   getMoreItems(newItems, offset);
});


$(document).ajaxComplete(function() {
   clearTimeout(ajaxTimeout);
   ajaxTimeout = setTimeout(function() {
      $('#content').removeClass('hidden');
      $('#scroll_text').removeClass('hidden');
   }, 300);
});
