(function(Element){

  var body = document.getElementsByTagName('body')[0];

  // Class Message
  // creates a message element that has meta data and content
  function Message(m, parent){
    Element.apply(this)

    this.parent = parent;

    var message = this.create('div', {
      className: "card"
    });

    var photo = parent.url + m.author.photoUrl;
    var meta = new Meta(photo, m.author.name, m.updated);

    message.appendChild(meta.getElem())
    message.appendChild(this.create('p', {
      textContent: m.content
    }));

    this.$elem = message;
    this.setEvents()
  }

  Message.prototype = Object.create(Element.prototype)

  Message.prototype.setEvents = function(){
    this.$elem.addEventListener('touchstart', this.touchStart.bind(this))
    this.$elem.addEventListener('touchmove', this.touchMove.bind(this))
    this.$elem.addEventListener('touchend', this.touchEnd.bind(this))
  },

  Message.prototype.touchStart = function(e){
    this.startTime = e.timeStamp;
    this.firstTouch = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }

    this.removeClass('recover');
  },

  Message.prototype.touchMove = function(e){
    this.endTime = e.timeStamp;
    this.duration = this.endTime - this.startTime;
    this.lastTouch = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }

    this.distance = {
      x: this.lastTouch.x - this.firstTouch.x,
      y: this.lastTouch.y - this.firstTouch.y
    }

    switch(this.gesture){
      case 'scroll': return;
      case 'swipe':
        this.addClass('active');
        this.$elem.style.left = this.distance.x + 'px';
        this.$elem.style.opacity = 1 - (Math.abs(this.distance.x) / window.innerWidth);
        break;
      default:
        this.setGesture();
    }
  },

  Message.prototype.touchEnd = function(e){
    this.removeClass('active');
    this.gesture = null;
    body.className = '';

    if(this.thresholdMet()){
      var direction = this.distance.x > 0 ? 'right' : 'left';
      this.addClass('remove');
      this.addClass(direction);

      this.parent.messageRemoved(this.recover.bind(this))
    }

    this.$elem.setAttribute('style', '');
  }

  Message.prototype.thresholdMet = function(){
    var distance = Math.abs(this.distance.x);
    var velocity = distance / this.duration;
    var x = this.lastTouch.x;

    // close to the left edge
    if(x < 30 && distance > 20) return true;
    // close to the right edge
    if(x > window.innerWidth - 30 && distance > 20) return true;

    if(velocity > .5) return true;

    return false;
  }

  Message.prototype.recover = function(){
    this.$elem.className = "card recover";
  }

  Message.prototype.setGesture = function(){
    if(Math.abs(this.distance.y) > Math.abs(this.distance.x)){
      this.gesture = 'scroll';
    } else {
      this.gesture = 'swipe';
      body.className = 'scroll-disabled';
    }
  }

  window.Message = Message;
})(window.Element)
