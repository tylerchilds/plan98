let index = 0;
let lastIndex = 0;
let slideShow = [];
let cleanup;
const eventMap = {
  37: function back() {
    index = Math.max(0, index - 1);
  },
  90: function end() {
    index = slideShow.length - 1;
  },
  39: function next() {
    index = Math.min(slideShow.length - 1, index + 1);
  },
  65: function start() {
    index = 0;
  },
  82: function reload() {
    loadSlide();
  },
  'tap': function tap() {
    index = (index + 1) % slideShow.length;
  }
};
function loadSlide() {
  if (cleanup) {
    cleanup();
  }
  cleanup = slideShow[index]();
}
function slideShowListenter(code) {
  const handler = eventMap[code] || (()=>console.log(code)
  );
  lastIndex = index;
  handler();
  if (lastIndex !== index) {
    loadSlide();
  }
}
function createSlideShow(slides) {
  slideShow = slides;
  loadSlide();
  return slideShowListenter;
}
const SLIDE_SELECTOR = '.content';
const ANIMATION_CLASSES = {
  SLIDE_OUT: 'slide-out',
  SLIDE_IN: 'slide-in',
  SLIDE_OUT_BACK: 'slide-out-back',
  SLIDE_IN_BACK: 'slide-in-back'
};
function initPresentation() {
  const slideNodes = [
    ...document.querySelectorAll(SLIDE_SELECTOR)
  ];
  const slideHandlers = slideNodes.map((node)=>slideChange.bind(null, node)
  );
  const slideShowListenter = createSlideShow(slideHandlers);
  function keydownHandler() {
    slideShowListenter(event.keyCode);
  }
  function touchstartHandler(event) {
    slideShowListenter('tap');
  }
  document.addEventListener('keydown', keydownHandler);
  document.addEventListener('touchstart', touchstartHandler);
  return function cleanupPresentation() {
    document.removeEventListener('keydown', keydownHandler);
    document.removeEventListener('touchstart', touchstartHandler);
    const animationClasses = Object.keys(ANIMATION_CLASSES).map((key)=>ANIMATION_CLASSES[key]
    );
    slideNodes.map((node)=>{
      node.classList.remove(...animationClasses);
    });
  };
}
function slideChange(node) {
  if (node.classList.contains(ANIMATION_CLASSES.SLIDE_OUT)) {
    showNext(node, node.nextElementSibling, true);
  } else {
    showNext(node, node.previousElementSibling);
  }
}
function showNext(node, formerNode, back) {
  const outClass = back ? ANIMATION_CLASSES.SLIDE_OUT_BACK : ANIMATION_CLASSES.SLIDE_OUT;
  const inClass = back ? ANIMATION_CLASSES.SLIDE_IN_BACK : ANIMATION_CLASSES.SLIDE_IN;
  if (formerNode) {
    formerNode.classList.remove(ANIMATION_CLASSES.SLIDE_IN);
    formerNode.classList.remove(ANIMATION_CLASSES.SLIDE_IN_BACK);
    setTimeout(()=>{
      formerNode.classList.add(outClass);
    }, 1);
  }
  node.classList.remove(ANIMATION_CLASSES.SLIDE_OUT);
  node.classList.remove(ANIMATION_CLASSES.SLIDE_OUT_BACK);
  setTimeout(()=>{
    node.classList.add(inClass);
  }, 1);
}
(function() {
  function init() {
    initPresentation();
    const lazyImages = [
      ...document.querySelectorAll('[data-lazysrc]')
    ];
    lazyImages.map((img)=>{
      img.src = img.dataset.lazysrc;
    });
  }
  init();
})();
