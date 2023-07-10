(function(Element){
  function Snackbar(node){
    Element.apply(this)
    this.node = node;
  }

  Snackbar.prototype = Object.create(Element.prototype)

  Snackbar.prototype.show = function(errorText, recourseText, action, passive){
    this.node.innerHTML = "";
    this.node.className = "active";

    this.node.appendChild(this.create('a', {
      href: 'javascript:;',
      textContent: recourseText,
      onclick: function(){
        action()
      }
    }))

    this.node.appendChild(this.create('p', {
      textContent: errorText
    }))

    if(passive)
      setTimeout(this.hide.bind(this), 5000)
  };

  Snackbar.prototype.hide = function(){
    this.node.className = "";
  };

  window.Snackbar = new Snackbar(document.getElementById('snackbar'));
})(window.Element)
