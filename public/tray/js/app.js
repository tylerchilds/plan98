(function(MessageList){

  new MessageList({
    limit: 10,
    url: 'http://localhost:1989/api/fastmail/fetchTen'
  });

})(window.MessageList)
