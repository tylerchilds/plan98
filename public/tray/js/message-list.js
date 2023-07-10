(function(InfiniteList, Message, Snackbar){
  function MessageList(options){
    InfiniteList.call(this);

    this.limit = options.limit;
    this.url = options.url;

    this.$elem = document.getElementById('messages');
    this.fetchMessages()
  }

  MessageList.prototype = Object.create(InfiniteList.prototype)

  MessageList.prototype.fetchMessages = function(){
    var thisList = this;
    thisList.fetchable = false;
    Snackbar.hide();
    var req = new XMLHttpRequest();

    req.open('GET', this.url + 'messages?pageToken=' + this.pageToken + '&limit=' + this.limit);

    req.onload = function() {
      if (req.status === 200) {
        thisList.fetchable = true;

        var res = JSON.parse(req.responseText);
        thisList.pageToken = res.pageToken;

        res.messages.forEach(function(m){
          var message = new Message(m, thisList);
          thisList.$elem.appendChild(message.getElem());
        })

        thisList.handleVisibility();
      } else {
        Snackbar.show("Can't load messages", "Retry", thisList.fetchMessages.bind(thisList))
      }
    };
    req.send();
  }

  MessageList.prototype.messageRemoved = function(undo){
    Snackbar.show("Message removed", "Undo", function(){
      undo()
      Snackbar.hide();
    })

    this.almostBottom()
      ? this.fetchMessages()
      : this.handleVisibility();
  }

  window.MessageList = MessageList;
})(window.InfiniteList, window.Message, window.Snackbar)
