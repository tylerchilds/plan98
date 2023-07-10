(function(){
  function Element() {}

  Element.prototype = {
    create: function(tag, attributes){
      var element = document.createElement(tag);

      for(var attr in attributes){
        element[attr] = attributes[attr];
      }

      return element;
    },

    getElem: function(){
      return this.$elem;
    },

    addClass: function(c){
      this.$elem.classList.add(c);
    },

    removeClass: function(c){
      this.$elem.classList.remove(c)
    }
  }

  window.Element = Element;
})()
