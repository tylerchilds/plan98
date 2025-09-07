if (typeof requestIdleCallback === 'undefined') {
  window.requestIdleCallback = function (cb) {
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      });
    }, 1);
  };
}

if (typeof cancelIdleCallback === 'undefined') {
  window.cancelIdleCallback = function (id) {
    clearTimeout(id);
  };
}
