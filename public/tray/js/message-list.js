(function(InfiniteList, Message, Snackbar){
  function MessageList(options){
    InfiniteList.call(this);

    this.limit = options.limit;
    this.url = options.url;

    this.$elem = document.getElementById('messages');
    this.fetchMessages()
  }

  MessageList.prototype = Object.create(InfiniteList.prototype)

  MessageList.prototype.fetchMessages = async function(){
    var thisList = this;
    thisList.fetchable = false;
    Snackbar.hide();
    const response =await fetch('/api/fastmail/fetchTen', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: state['ls/fastmail/username'],
          apikey: state['ls/fastmail/apikey'],
        })
      }).then(res => {
        if (res.status === 200) {
          thisList.fetchable = true;
        } else {
          Snackbar.show("Can't load messages", "Retry", thisList.fetchMessages.bind(thisList))
        }
        return res.json()
      }).then((body) => {
        body.messages.forEach(function(m){
          var message = new Message(m, thisList);
          thisList.$elem.appendChild(message.getElem());
        })

        thisList.handleVisibility();
      })
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
