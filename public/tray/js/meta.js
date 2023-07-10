(function(Element){

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Class Meta
  // creates a meta element with user photo, name and timestamp
  function Meta(photo, name, timestamp){
    Element.apply(this)

    var meta = this.create('div', {
      className: 'meta'
    });

    var $picture = this.create('img', {
      src: photo,
      alt: 'Photo of '+ name,
      className: 'meta-photo'
    });

    var $name = this.create('p', {
      textContent: name,
      className: 'meta-name'
    })

    var $timestamp = this.create('p', {
      textContent: format(timestamp),
      className: 'meta-date'
    });

    meta.appendChild($picture);
    meta.appendChild($name);
    meta.appendChild($timestamp);

    this.$elem = meta;
  }

  // timestamp helper
  function format(timestamp){
    var date = new Date(timestamp);
    return MONTHS[date.getMonth()] +' '+ date.getDate() +', '+ date.getFullYear();
  }

  Meta.prototype = Object.create(Element.prototype)

  window.Meta = Meta;
})(window.Element)
