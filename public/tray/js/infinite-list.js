(function(Message, Snackbar){

  var body = document.getElementsByTagName('body')[0];

  var visisbleRegion = 2 * window.innerHeight;
  var bounds = {
    top: -1 * visisbleRegion,
    bottom: visisbleRegion,
  }

  // ES6: class MessagesList{}
  function InfiniteList(options){
    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  InfiniteList.prototype.almostBottom = function(){
    return body.scrollTop > body.offsetHeight - (window.innerHeight * 2)
  }

  InfiniteList.prototype.onScroll = function(e) {
    var list = this;

    if(list.fetchable && this.almostBottom()){
      list.fetchMessages();
    }

    if(! this.throttled){
      list.handleVisibility()
      list.throttled = true;
      setTimeout(function(){ list.throttled = false}, 200)
    }
  }

  InfiniteList.prototype.handleVisibility = function(){
    var children = Array.prototype.slice.call(this.$elem.children);

    children.forEach(function(el){
      var elemTop = el.getBoundingClientRect().top;
      var elemBottom = el.getBoundingClientRect().bottom;

      var isVisible = (elemTop >= bounds.top) && (elemBottom <= bounds.bottom);

      if(isVisible){
        el.style.visibility = "visible";
      } else {
        el.style.visibility = "hidden";
      }
    });
  }

  window.InfiniteList = InfiniteList;
})()
