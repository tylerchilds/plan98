(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value2) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value: value2 }) : obj[key] = value2;
  var __publicField = (obj, key, value2) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value2);
    return value2;
  };
  var __accessCheck = (obj, member, msg) => {
    if (!member.has(obj))
      throw TypeError("Cannot " + msg);
  };
  var __privateGet = (obj, member, getter) => {
    __accessCheck(obj, member, "read from private field");
    return getter ? getter.call(obj) : member.get(obj);
  };
  var __privateAdd = (obj, member, value2) => {
    if (member.has(obj))
      throw TypeError("Cannot add the same private member more than once");
    member instanceof WeakSet ? member.add(obj) : member.set(obj, value2);
  };
  var __privateSet = (obj, member, value2, setter) => {
    __accessCheck(obj, member, "write to private field");
    setter ? setter.call(obj, value2) : member.set(obj, value2);
    return value2;
  };
  var __privateMethod = (obj, member, method) => {
    __accessCheck(obj, member, "access private method");
    return method;
  };

  // public/module.js
  var noop = () => null;
  var CREATE_EVENT = "create";
  var observableEvents = [CREATE_EVENT];
  var reactiveFunctions = {};
  function react(selector) {
    (reactiveFunctions[selector] || noop)();
  }
  var store = createStore({}, react);
  function update(target, compositor) {
    const html = compositor(target);
    if (html)
      target.innerHTML = html;
  }
  function render(selector, compositor) {
    listen(CREATE_EVENT, selector, (event) => {
      const draw = update.bind(null, event.target, compositor);
      reactiveFunctions[selector] = draw;
      draw();
    });
  }
  function style(selector, stylesheet) {
    const styles = `
    <style type="text/css" data-module=${selector}>
      ${stylesheet.replaceAll("&", selector)}
    </style>
  `;
    document.body.insertAdjacentHTML("beforeend", styles);
  }
  function read(selector) {
    return store.get(selector) || {};
  }
  function write(selector, payload, handler = (s, p2) => ({ ...s, ...p2 })) {
    store.set(selector, payload, handler);
  }
  function on(selector1, eventName, selector2, callback) {
    listen(eventName, `${selector1} ${selector2}`, callback);
  }
  function module(selector, initialState3 = {}) {
    write(selector, initialState3);
    return {
      selector,
      read: read.bind(null, selector),
      render: render.bind(null, selector),
      style: style.bind(null, selector),
      on: on.bind(null, selector),
      write: write.bind(null, selector)
    };
  }
  function listen(type2, selector, handler = () => null) {
    const callback = (event) => {
      if (event.target && event.target.matches && event.target.matches(selector)) {
        handler.call(null, event);
      }
    };
    document.addEventListener(type2, callback, true);
    if (observableEvents.includes(type2)) {
      observe(selector);
    }
    return function unlisten() {
      if (type2 === CREATE_EVENT) {
        disregard(selector);
      }
      document.removeEventListener(type2, callback, true);
    };
  }
  var selectors = [];
  function observe(selector) {
    selectors = [.../* @__PURE__ */ new Set([...selectors, selector])];
    maybeCreateReactive([...document.querySelectorAll(selector)]);
  }
  function disregard(selector) {
    const index = selectors.indexOf(selector);
    if (index >= 0) {
      selectors = [
        ...selectors.slice(0, index),
        ...selectors.slice(index + 1)
      ];
    }
  }
  function maybeCreateReactive(targets) {
    targets.filter((x) => !x.reactive).forEach(dispatchCreate);
  }
  function getSubscribers({ target }) {
    if (selectors.length > 0)
      return [...target.querySelectorAll(selectors.join(", "))];
    else
      return [];
  }
  function dispatchCreate(target) {
    if (!target.id)
      target.id = sufficientlyUniqueId();
    target.dispatchEvent(new Event(CREATE_EVENT));
    target.reactive = true;
  }
  new MutationObserver((mutationsList) => {
    const targets = [...mutationsList].map(getSubscribers).flatMap((x) => x);
    maybeCreateReactive(targets);
  }).observe(document.body, { childList: true, subtree: true });
  function sufficientlyUniqueId() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c4) {
      const r = Math.random() * 16 | 0, v = c4 == "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  function createStore(initialState3 = {}, notify = () => null) {
    let state = {
      ...initialState3
    };
    const context2 = {
      set: function(selector, payload, mergeHandler) {
        const newResource = mergeHandler(state[selector] || {}, payload);
        state = {
          ...state,
          [selector]: newResource
        };
        notify(selector);
      },
      get: function(selector) {
        return state[selector];
      }
    };
    return context2;
  }

  // node_modules/tabbable/dist/index.esm.js
  var candidateSelectors = ["input", "select", "textarea", "a[href]", "button", "[tabindex]:not(slot)", "audio[controls]", "video[controls]", '[contenteditable]:not([contenteditable="false"])', "details>summary:first-of-type", "details"];
  var candidateSelector = /* @__PURE__ */ candidateSelectors.join(",");
  var NoElement = typeof Element === "undefined";
  var matches = NoElement ? function() {
  } : Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
  var getRootNode = !NoElement && Element.prototype.getRootNode ? function(element) {
    return element.getRootNode();
  } : function(element) {
    return element.ownerDocument;
  };
  var getCandidates = function getCandidates2(el, includeContainer, filter) {
    var candidates = Array.prototype.slice.apply(el.querySelectorAll(candidateSelector));
    if (includeContainer && matches.call(el, candidateSelector)) {
      candidates.unshift(el);
    }
    candidates = candidates.filter(filter);
    return candidates;
  };
  var getCandidatesIteratively = function getCandidatesIteratively2(elements, includeContainer, options) {
    var candidates = [];
    var elementsToCheck = Array.from(elements);
    while (elementsToCheck.length) {
      var element = elementsToCheck.shift();
      if (element.tagName === "SLOT") {
        var assigned = element.assignedElements();
        var content2 = assigned.length ? assigned : element.children;
        var nestedCandidates = getCandidatesIteratively2(content2, true, options);
        if (options.flatten) {
          candidates.push.apply(candidates, nestedCandidates);
        } else {
          candidates.push({
            scopeParent: element,
            candidates: nestedCandidates
          });
        }
      } else {
        var validCandidate = matches.call(element, candidateSelector);
        if (validCandidate && options.filter(element) && (includeContainer || !elements.includes(element))) {
          candidates.push(element);
        }
        var shadowRoot = element.shadowRoot || typeof options.getShadowRoot === "function" && options.getShadowRoot(element);
        var validShadowRoot = !options.shadowRootFilter || options.shadowRootFilter(element);
        if (shadowRoot && validShadowRoot) {
          var _nestedCandidates = getCandidatesIteratively2(shadowRoot === true ? element.children : shadowRoot.children, true, options);
          if (options.flatten) {
            candidates.push.apply(candidates, _nestedCandidates);
          } else {
            candidates.push({
              scopeParent: element,
              candidates: _nestedCandidates
            });
          }
        } else {
          elementsToCheck.unshift.apply(elementsToCheck, element.children);
        }
      }
    }
    return candidates;
  };
  var getTabindex = function getTabindex2(node, isScope) {
    if (node.tabIndex < 0) {
      if ((isScope || /^(AUDIO|VIDEO|DETAILS)$/.test(node.tagName) || node.isContentEditable) && isNaN(parseInt(node.getAttribute("tabindex"), 10))) {
        return 0;
      }
    }
    return node.tabIndex;
  };
  var sortOrderedTabbables = function sortOrderedTabbables2(a2, b2) {
    return a2.tabIndex === b2.tabIndex ? a2.documentOrder - b2.documentOrder : a2.tabIndex - b2.tabIndex;
  };
  var isInput = function isInput2(node) {
    return node.tagName === "INPUT";
  };
  var isHiddenInput = function isHiddenInput2(node) {
    return isInput(node) && node.type === "hidden";
  };
  var isDetailsWithSummary = function isDetailsWithSummary2(node) {
    var r = node.tagName === "DETAILS" && Array.prototype.slice.apply(node.children).some(function(child) {
      return child.tagName === "SUMMARY";
    });
    return r;
  };
  var getCheckedRadio = function getCheckedRadio2(nodes, form) {
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].checked && nodes[i].form === form) {
        return nodes[i];
      }
    }
  };
  var isTabbableRadio = function isTabbableRadio2(node) {
    if (!node.name) {
      return true;
    }
    var radioScope = node.form || getRootNode(node);
    var queryRadios = function queryRadios2(name2) {
      return radioScope.querySelectorAll('input[type="radio"][name="' + name2 + '"]');
    };
    var radioSet;
    if (typeof window !== "undefined" && typeof window.CSS !== "undefined" && typeof window.CSS.escape === "function") {
      radioSet = queryRadios(window.CSS.escape(node.name));
    } else {
      try {
        radioSet = queryRadios(node.name);
      } catch (err) {
        console.error("Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s", err.message);
        return false;
      }
    }
    var checked = getCheckedRadio(radioSet, node.form);
    return !checked || checked === node;
  };
  var isRadio = function isRadio2(node) {
    return isInput(node) && node.type === "radio";
  };
  var isNonTabbableRadio = function isNonTabbableRadio2(node) {
    return isRadio(node) && !isTabbableRadio(node);
  };
  var isNodeAttached = function isNodeAttached2(node) {
    var _nodeRootHost;
    var nodeRootHost = getRootNode(node).host;
    var attached = !!((_nodeRootHost = nodeRootHost) !== null && _nodeRootHost !== void 0 && _nodeRootHost.ownerDocument.contains(nodeRootHost) || node.ownerDocument.contains(node));
    while (!attached && nodeRootHost) {
      var _nodeRootHost2;
      nodeRootHost = getRootNode(nodeRootHost).host;
      attached = !!((_nodeRootHost2 = nodeRootHost) !== null && _nodeRootHost2 !== void 0 && _nodeRootHost2.ownerDocument.contains(nodeRootHost));
    }
    return attached;
  };
  var isZeroArea = function isZeroArea2(node) {
    var _node$getBoundingClie = node.getBoundingClientRect(), width = _node$getBoundingClie.width, height = _node$getBoundingClie.height;
    return width === 0 && height === 0;
  };
  var isHidden = function isHidden2(node, _ref) {
    var displayCheck = _ref.displayCheck, getShadowRoot = _ref.getShadowRoot;
    if (getComputedStyle(node).visibility === "hidden") {
      return true;
    }
    var isDirectSummary = matches.call(node, "details>summary:first-of-type");
    var nodeUnderDetails = isDirectSummary ? node.parentElement : node;
    if (matches.call(nodeUnderDetails, "details:not([open]) *")) {
      return true;
    }
    if (!displayCheck || displayCheck === "full" || displayCheck === "legacy-full") {
      if (typeof getShadowRoot === "function") {
        var originalNode = node;
        while (node) {
          var parentElement = node.parentElement;
          var rootNode = getRootNode(node);
          if (parentElement && !parentElement.shadowRoot && getShadowRoot(parentElement) === true) {
            return isZeroArea(node);
          } else if (node.assignedSlot) {
            node = node.assignedSlot;
          } else if (!parentElement && rootNode !== node.ownerDocument) {
            node = rootNode.host;
          } else {
            node = parentElement;
          }
        }
        node = originalNode;
      }
      if (isNodeAttached(node)) {
        return !node.getClientRects().length;
      }
      if (displayCheck !== "legacy-full") {
        return true;
      }
    } else if (displayCheck === "non-zero-area") {
      return isZeroArea(node);
    }
    return false;
  };
  var isDisabledFromFieldset = function isDisabledFromFieldset2(node) {
    if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(node.tagName)) {
      var parentNode = node.parentElement;
      while (parentNode) {
        if (parentNode.tagName === "FIELDSET" && parentNode.disabled) {
          for (var i = 0; i < parentNode.children.length; i++) {
            var child = parentNode.children.item(i);
            if (child.tagName === "LEGEND") {
              return matches.call(parentNode, "fieldset[disabled] *") ? true : !child.contains(node);
            }
          }
          return true;
        }
        parentNode = parentNode.parentElement;
      }
    }
    return false;
  };
  var isNodeMatchingSelectorFocusable = function isNodeMatchingSelectorFocusable2(options, node) {
    if (node.disabled || isHiddenInput(node) || isHidden(node, options) || isDetailsWithSummary(node) || isDisabledFromFieldset(node)) {
      return false;
    }
    return true;
  };
  var isNodeMatchingSelectorTabbable = function isNodeMatchingSelectorTabbable2(options, node) {
    if (isNonTabbableRadio(node) || getTabindex(node) < 0 || !isNodeMatchingSelectorFocusable(options, node)) {
      return false;
    }
    return true;
  };
  var isValidShadowRootTabbable = function isValidShadowRootTabbable2(shadowHostNode) {
    var tabIndex = parseInt(shadowHostNode.getAttribute("tabindex"), 10);
    if (isNaN(tabIndex) || tabIndex >= 0) {
      return true;
    }
    return false;
  };
  var sortByOrder = function sortByOrder2(candidates) {
    var regularTabbables = [];
    var orderedTabbables = [];
    candidates.forEach(function(item, i) {
      var isScope = !!item.scopeParent;
      var element = isScope ? item.scopeParent : item;
      var candidateTabindex = getTabindex(element, isScope);
      var elements = isScope ? sortByOrder2(item.candidates) : element;
      if (candidateTabindex === 0) {
        isScope ? regularTabbables.push.apply(regularTabbables, elements) : regularTabbables.push(element);
      } else {
        orderedTabbables.push({
          documentOrder: i,
          tabIndex: candidateTabindex,
          item,
          isScope,
          content: elements
        });
      }
    });
    return orderedTabbables.sort(sortOrderedTabbables).reduce(function(acc, sortable) {
      sortable.isScope ? acc.push.apply(acc, sortable.content) : acc.push(sortable.content);
      return acc;
    }, []).concat(regularTabbables);
  };
  var tabbable = function tabbable2(el, options) {
    options = options || {};
    var candidates;
    if (options.getShadowRoot) {
      candidates = getCandidatesIteratively([el], options.includeContainer, {
        filter: isNodeMatchingSelectorTabbable.bind(null, options),
        flatten: false,
        getShadowRoot: options.getShadowRoot,
        shadowRootFilter: isValidShadowRootTabbable
      });
    } else {
      candidates = getCandidates(el, options.includeContainer, isNodeMatchingSelectorTabbable.bind(null, options));
    }
    return sortByOrder(candidates);
  };
  var focusable = function focusable2(el, options) {
    options = options || {};
    var candidates;
    if (options.getShadowRoot) {
      candidates = getCandidatesIteratively([el], options.includeContainer, {
        filter: isNodeMatchingSelectorFocusable.bind(null, options),
        flatten: true,
        getShadowRoot: options.getShadowRoot
      });
    } else {
      candidates = getCandidates(el, options.includeContainer, isNodeMatchingSelectorFocusable.bind(null, options));
    }
    return candidates;
  };
  var isTabbable = function isTabbable2(node, options) {
    options = options || {};
    if (!node) {
      throw new Error("No node provided");
    }
    if (matches.call(node, candidateSelector) === false) {
      return false;
    }
    return isNodeMatchingSelectorTabbable(options, node);
  };
  var focusableCandidateSelector = /* @__PURE__ */ candidateSelectors.concat("iframe").join(",");
  var isFocusable = function isFocusable2(node, options) {
    options = options || {};
    if (!node) {
      throw new Error("No node provided");
    }
    if (matches.call(node, focusableCandidateSelector) === false) {
      return false;
    }
    return isNodeMatchingSelectorFocusable(options, node);
  };

  // node_modules/focus-trap/dist/focus-trap.esm.js
  function ownKeys(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _defineProperty(obj, key, value2) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value2,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value2;
    }
    return obj;
  }
  var activeFocusTraps = function() {
    var trapQueue = [];
    return {
      activateTrap: function activateTrap(trap) {
        if (trapQueue.length > 0) {
          var activeTrap = trapQueue[trapQueue.length - 1];
          if (activeTrap !== trap) {
            activeTrap.pause();
          }
        }
        var trapIndex = trapQueue.indexOf(trap);
        if (trapIndex === -1) {
          trapQueue.push(trap);
        } else {
          trapQueue.splice(trapIndex, 1);
          trapQueue.push(trap);
        }
      },
      deactivateTrap: function deactivateTrap(trap) {
        var trapIndex = trapQueue.indexOf(trap);
        if (trapIndex !== -1) {
          trapQueue.splice(trapIndex, 1);
        }
        if (trapQueue.length > 0) {
          trapQueue[trapQueue.length - 1].unpause();
        }
      }
    };
  }();
  var isSelectableInput = function isSelectableInput2(node) {
    return node.tagName && node.tagName.toLowerCase() === "input" && typeof node.select === "function";
  };
  var isEscapeEvent = function isEscapeEvent2(e) {
    return e.key === "Escape" || e.key === "Esc" || e.keyCode === 27;
  };
  var isTabEvent = function isTabEvent2(e) {
    return e.key === "Tab" || e.keyCode === 9;
  };
  var delay = function delay2(fn) {
    return setTimeout(fn, 0);
  };
  var findIndex = function findIndex2(arr, fn) {
    var idx = -1;
    arr.every(function(value2, i) {
      if (fn(value2)) {
        idx = i;
        return false;
      }
      return true;
    });
    return idx;
  };
  var valueOrHandler = function valueOrHandler2(value2) {
    for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      params[_key - 1] = arguments[_key];
    }
    return typeof value2 === "function" ? value2.apply(void 0, params) : value2;
  };
  var getActualTarget = function getActualTarget2(event) {
    return event.target.shadowRoot && typeof event.composedPath === "function" ? event.composedPath()[0] : event.target;
  };
  var createFocusTrap = function createFocusTrap2(elements, userOptions) {
    var doc2 = (userOptions === null || userOptions === void 0 ? void 0 : userOptions.document) || document;
    var config2 = _objectSpread2({
      returnFocusOnDeactivate: true,
      escapeDeactivates: true,
      delayInitialFocus: true
    }, userOptions);
    var state = {
      containers: [],
      containerGroups: [],
      tabbableGroups: [],
      nodeFocusedBeforeActivation: null,
      mostRecentlyFocusedNode: null,
      active: false,
      paused: false,
      delayInitialFocusTimer: void 0
    };
    var trap;
    var getOption = function getOption2(configOverrideOptions, optionName, configOptionName) {
      return configOverrideOptions && configOverrideOptions[optionName] !== void 0 ? configOverrideOptions[optionName] : config2[configOptionName || optionName];
    };
    var findContainerIndex = function findContainerIndex2(element) {
      return state.containerGroups.findIndex(function(_ref) {
        var container = _ref.container, tabbableNodes = _ref.tabbableNodes;
        return container.contains(element) || tabbableNodes.find(function(node) {
          return node === element;
        });
      });
    };
    var getNodeForOption = function getNodeForOption2(optionName) {
      var optionValue = config2[optionName];
      if (typeof optionValue === "function") {
        for (var _len2 = arguments.length, params = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          params[_key2 - 1] = arguments[_key2];
        }
        optionValue = optionValue.apply(void 0, params);
      }
      if (optionValue === true) {
        optionValue = void 0;
      }
      if (!optionValue) {
        if (optionValue === void 0 || optionValue === false) {
          return optionValue;
        }
        throw new Error("`".concat(optionName, "` was specified but was not a node, or did not return a node"));
      }
      var node = optionValue;
      if (typeof optionValue === "string") {
        node = doc2.querySelector(optionValue);
        if (!node) {
          throw new Error("`".concat(optionName, "` as selector refers to no known node"));
        }
      }
      return node;
    };
    var getInitialFocusNode = function getInitialFocusNode2() {
      var node = getNodeForOption("initialFocus");
      if (node === false) {
        return false;
      }
      if (node === void 0) {
        if (findContainerIndex(doc2.activeElement) >= 0) {
          node = doc2.activeElement;
        } else {
          var firstTabbableGroup = state.tabbableGroups[0];
          var firstTabbableNode = firstTabbableGroup && firstTabbableGroup.firstTabbableNode;
          node = firstTabbableNode || getNodeForOption("fallbackFocus");
        }
      }
      if (!node) {
        throw new Error("Your focus-trap needs to have at least one focusable element");
      }
      return node;
    };
    var updateTabbableNodes = function updateTabbableNodes2() {
      state.containerGroups = state.containers.map(function(container) {
        var tabbableNodes = tabbable(container, config2.tabbableOptions);
        var focusableNodes = focusable(container, config2.tabbableOptions);
        return {
          container,
          tabbableNodes,
          focusableNodes,
          firstTabbableNode: tabbableNodes.length > 0 ? tabbableNodes[0] : null,
          lastTabbableNode: tabbableNodes.length > 0 ? tabbableNodes[tabbableNodes.length - 1] : null,
          nextTabbableNode: function nextTabbableNode(node) {
            var forward = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
            var nodeIdx = focusableNodes.findIndex(function(n2) {
              return n2 === node;
            });
            if (nodeIdx < 0) {
              return void 0;
            }
            if (forward) {
              return focusableNodes.slice(nodeIdx + 1).find(function(n2) {
                return isTabbable(n2, config2.tabbableOptions);
              });
            }
            return focusableNodes.slice(0, nodeIdx).reverse().find(function(n2) {
              return isTabbable(n2, config2.tabbableOptions);
            });
          }
        };
      });
      state.tabbableGroups = state.containerGroups.filter(function(group) {
        return group.tabbableNodes.length > 0;
      });
      if (state.tabbableGroups.length <= 0 && !getNodeForOption("fallbackFocus")) {
        throw new Error("Your focus-trap must have at least one container with at least one tabbable node in it at all times");
      }
    };
    var tryFocus = function tryFocus2(node) {
      if (node === false) {
        return;
      }
      if (node === doc2.activeElement) {
        return;
      }
      if (!node || !node.focus) {
        tryFocus2(getInitialFocusNode());
        return;
      }
      node.focus({
        preventScroll: !!config2.preventScroll
      });
      state.mostRecentlyFocusedNode = node;
      if (isSelectableInput(node)) {
        node.select();
      }
    };
    var getReturnFocusNode = function getReturnFocusNode2(previousActiveElement) {
      var node = getNodeForOption("setReturnFocus", previousActiveElement);
      return node ? node : node === false ? false : previousActiveElement;
    };
    var checkPointerDown = function checkPointerDown2(e) {
      var target = getActualTarget(e);
      if (findContainerIndex(target) >= 0) {
        return;
      }
      if (valueOrHandler(config2.clickOutsideDeactivates, e)) {
        trap.deactivate({
          returnFocus: config2.returnFocusOnDeactivate && !isFocusable(target, config2.tabbableOptions)
        });
        return;
      }
      if (valueOrHandler(config2.allowOutsideClick, e)) {
        return;
      }
      e.preventDefault();
    };
    var checkFocusIn = function checkFocusIn2(e) {
      var target = getActualTarget(e);
      var targetContained = findContainerIndex(target) >= 0;
      if (targetContained || target instanceof Document) {
        if (targetContained) {
          state.mostRecentlyFocusedNode = target;
        }
      } else {
        e.stopImmediatePropagation();
        tryFocus(state.mostRecentlyFocusedNode || getInitialFocusNode());
      }
    };
    var checkTab = function checkTab2(e) {
      var target = getActualTarget(e);
      updateTabbableNodes();
      var destinationNode = null;
      if (state.tabbableGroups.length > 0) {
        var containerIndex = findContainerIndex(target);
        var containerGroup = containerIndex >= 0 ? state.containerGroups[containerIndex] : void 0;
        if (containerIndex < 0) {
          if (e.shiftKey) {
            destinationNode = state.tabbableGroups[state.tabbableGroups.length - 1].lastTabbableNode;
          } else {
            destinationNode = state.tabbableGroups[0].firstTabbableNode;
          }
        } else if (e.shiftKey) {
          var startOfGroupIndex = findIndex(state.tabbableGroups, function(_ref2) {
            var firstTabbableNode = _ref2.firstTabbableNode;
            return target === firstTabbableNode;
          });
          if (startOfGroupIndex < 0 && (containerGroup.container === target || isFocusable(target, config2.tabbableOptions) && !isTabbable(target, config2.tabbableOptions) && !containerGroup.nextTabbableNode(target, false))) {
            startOfGroupIndex = containerIndex;
          }
          if (startOfGroupIndex >= 0) {
            var destinationGroupIndex = startOfGroupIndex === 0 ? state.tabbableGroups.length - 1 : startOfGroupIndex - 1;
            var destinationGroup = state.tabbableGroups[destinationGroupIndex];
            destinationNode = destinationGroup.lastTabbableNode;
          }
        } else {
          var lastOfGroupIndex = findIndex(state.tabbableGroups, function(_ref3) {
            var lastTabbableNode = _ref3.lastTabbableNode;
            return target === lastTabbableNode;
          });
          if (lastOfGroupIndex < 0 && (containerGroup.container === target || isFocusable(target, config2.tabbableOptions) && !isTabbable(target, config2.tabbableOptions) && !containerGroup.nextTabbableNode(target))) {
            lastOfGroupIndex = containerIndex;
          }
          if (lastOfGroupIndex >= 0) {
            var _destinationGroupIndex = lastOfGroupIndex === state.tabbableGroups.length - 1 ? 0 : lastOfGroupIndex + 1;
            var _destinationGroup = state.tabbableGroups[_destinationGroupIndex];
            destinationNode = _destinationGroup.firstTabbableNode;
          }
        }
      } else {
        destinationNode = getNodeForOption("fallbackFocus");
      }
      if (destinationNode) {
        e.preventDefault();
        tryFocus(destinationNode);
      }
    };
    var checkKey = function checkKey2(e) {
      if (isEscapeEvent(e) && valueOrHandler(config2.escapeDeactivates, e) !== false) {
        e.preventDefault();
        trap.deactivate();
        return;
      }
      if (isTabEvent(e)) {
        checkTab(e);
        return;
      }
    };
    var checkClick = function checkClick2(e) {
      var target = getActualTarget(e);
      if (findContainerIndex(target) >= 0) {
        return;
      }
      if (valueOrHandler(config2.clickOutsideDeactivates, e)) {
        return;
      }
      if (valueOrHandler(config2.allowOutsideClick, e)) {
        return;
      }
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    var addListeners = function addListeners2() {
      if (!state.active) {
        return;
      }
      activeFocusTraps.activateTrap(trap);
      state.delayInitialFocusTimer = config2.delayInitialFocus ? delay(function() {
        tryFocus(getInitialFocusNode());
      }) : tryFocus(getInitialFocusNode());
      doc2.addEventListener("focusin", checkFocusIn, true);
      doc2.addEventListener("mousedown", checkPointerDown, {
        capture: true,
        passive: false
      });
      doc2.addEventListener("touchstart", checkPointerDown, {
        capture: true,
        passive: false
      });
      doc2.addEventListener("click", checkClick, {
        capture: true,
        passive: false
      });
      doc2.addEventListener("keydown", checkKey, {
        capture: true,
        passive: false
      });
      return trap;
    };
    var removeListeners = function removeListeners2() {
      if (!state.active) {
        return;
      }
      doc2.removeEventListener("focusin", checkFocusIn, true);
      doc2.removeEventListener("mousedown", checkPointerDown, true);
      doc2.removeEventListener("touchstart", checkPointerDown, true);
      doc2.removeEventListener("click", checkClick, true);
      doc2.removeEventListener("keydown", checkKey, true);
      return trap;
    };
    trap = {
      get active() {
        return state.active;
      },
      get paused() {
        return state.paused;
      },
      activate: function activate(activateOptions) {
        if (state.active) {
          return this;
        }
        var onActivate2 = getOption(activateOptions, "onActivate");
        var onPostActivate = getOption(activateOptions, "onPostActivate");
        var checkCanFocusTrap = getOption(activateOptions, "checkCanFocusTrap");
        if (!checkCanFocusTrap) {
          updateTabbableNodes();
        }
        state.active = true;
        state.paused = false;
        state.nodeFocusedBeforeActivation = doc2.activeElement;
        if (onActivate2) {
          onActivate2();
        }
        var finishActivation = function finishActivation2() {
          if (checkCanFocusTrap) {
            updateTabbableNodes();
          }
          addListeners();
          if (onPostActivate) {
            onPostActivate();
          }
        };
        if (checkCanFocusTrap) {
          checkCanFocusTrap(state.containers.concat()).then(finishActivation, finishActivation);
          return this;
        }
        finishActivation();
        return this;
      },
      deactivate: function deactivate(deactivateOptions) {
        if (!state.active) {
          return this;
        }
        var options = _objectSpread2({
          onDeactivate: config2.onDeactivate,
          onPostDeactivate: config2.onPostDeactivate,
          checkCanReturnFocus: config2.checkCanReturnFocus
        }, deactivateOptions);
        clearTimeout(state.delayInitialFocusTimer);
        state.delayInitialFocusTimer = void 0;
        removeListeners();
        state.active = false;
        state.paused = false;
        activeFocusTraps.deactivateTrap(trap);
        var onDeactivate2 = getOption(options, "onDeactivate");
        var onPostDeactivate = getOption(options, "onPostDeactivate");
        var checkCanReturnFocus = getOption(options, "checkCanReturnFocus");
        var returnFocus = getOption(options, "returnFocus", "returnFocusOnDeactivate");
        if (onDeactivate2) {
          onDeactivate2();
        }
        var finishDeactivation = function finishDeactivation2() {
          delay(function() {
            if (returnFocus) {
              tryFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation));
            }
            if (onPostDeactivate) {
              onPostDeactivate();
            }
          });
        };
        if (returnFocus && checkCanReturnFocus) {
          checkCanReturnFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation)).then(finishDeactivation, finishDeactivation);
          return this;
        }
        finishDeactivation();
        return this;
      },
      pause: function pause() {
        if (state.paused || !state.active) {
          return this;
        }
        state.paused = true;
        removeListeners();
        return this;
      },
      unpause: function unpause() {
        if (!state.paused || !state.active) {
          return this;
        }
        state.paused = false;
        updateTabbableNodes();
        addListeners();
        return this;
      },
      updateContainerElements: function updateContainerElements(containerElements) {
        var elementsAsArray = [].concat(containerElements).filter(Boolean);
        state.containers = elementsAsArray.map(function(element) {
          return typeof element === "string" ? doc2.querySelector(element) : element;
        });
        if (state.active) {
          updateTabbableNodes();
        }
        return this;
      }
    };
    trap.updateContainerElements(elements);
    return trap;
  };

  // public/packages/console-module.js
  var ENUMS = [
    { command: "escape" },
    { command: "download" },
    { command: "upload" }
  ];
  function execute(command2) {
    alert(`executed ${command2}`);
  }
  var $ = module("console-module", {
    filter: ""
  });
  $.on("click", ".item", function update2(event) {
    event.preventDefault();
    const args = attributes(event.target, $);
    const { command: command2 } = event.target.dataset;
    execute(command2);
    args.root.trap.deactivate();
  });
  $.on("click", ".bar", toggleActive);
  $.on("keyup", '[name="filter"]', setFilter);
  $.render((target) => {
    if (!target.trap) {
      target.trap = createFocusTrap(target, {
        onActivate: onActivate(target),
        onDeactivate: onDeactivate(target),
        clickOutsideDeactivates: true
      });
    }
    const { filter } = $.read();
    const choices = [];
    const list = ENUMS.filter((x) => x.command.toLowerCase().indexOf(filter.toLowerCase()) > -1).map((x) => `
      <button class="item" data-command="${x.command}">
        ${x.command}
      </button>
    `).join("");
    const customOption = `
    <button class="item" data-id="${filter}">
      ${filter}
    </button>
  `;
    return `
    <button class="bar">
      'run: ' ${choices.map((x) => x.command).join(", ")}
    </button>

    <div class="filterable-list">
      <div class="filter-area">
        <input type="text" name="filter" placeholder="Search" value="${filter}" />
      </div>
      <div class="list">
        ${list}
        ${customOption}
      </div>
    </div>
  `;
  });
  function attributes(node, $7) {
    const root = node.closest($7.selector);
    return { root };
  }
  function toggleActive(event) {
    const args = attributes(event.target, $);
    if (isActive(args.root)) {
      args.root.trap.deactivate();
    } else {
      args.root.trap.activate();
    }
  }
  function setFilter(event) {
    const { value: value2 } = event.target;
    $.write({ filter: value2 });
  }
  function onActivate(target) {
    return () => {
      target.classList.add("is-active");
      target.querySelector('[name="filter"]').focus();
    };
  }
  function onDeactivate(target) {
    return () => {
      target.classList.remove("is-active");
      $.write({ filter: "" });
    };
  }
  function isActive(target) {
    return target.matches(".is-active");
  }
  $.style(`
	& {
		display: block;
		position: relative;
		z-index: 3;
    width: 100%;
	}

	& .filter-area {
    margin: .5rem;
	}

	& .bar {
		white-space: nowrap;
		background: rgba(255,255,255,.85);
    width: 100%;
	}

	&.is-active .bar {
	}
	& .bar:hover,
	& .bar:focus {
	}

	& [name="filter"] {
		background: white;
		border: none;
		width: 100%;
    display: block;
	}

	& .filterable-list {
    background: white;
		display: none;
		position: absolute;
    width: 100%;
	}

	&.is-active .filterable-list {
		display: flex;
    flex-direction: column;
	}

  & .filterable-list.above {
    top: 0;
    transform: translateY(-100%);
    flex-direction: column-reverse;
  }

	& .item {
		background: transparent;
		border: none;
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		min-height: 40px;
		margin: 0;
		text-align: left;
		width: 100%;
	}

	& .item * {
		pointer-events: none;
	}

	& .list {
		max-height: 80vh;
		overflow-y: auto;
	}

	& .item:hover,
	& .item:focus {
		background: linear-gradient(rgba(0,0,0,0) 75%, rgba(0,0,0,.25));
	}
`);

  // node_modules/@codemirror/state/dist/index.js
  var Text = class {
    constructor() {
    }
    lineAt(pos) {
      if (pos < 0 || pos > this.length)
        throw new RangeError(`Invalid position ${pos} in document of length ${this.length}`);
      return this.lineInner(pos, false, 1, 0);
    }
    line(n2) {
      if (n2 < 1 || n2 > this.lines)
        throw new RangeError(`Invalid line number ${n2} in ${this.lines}-line document`);
      return this.lineInner(n2, true, 1, 0);
    }
    replace(from, to2, text) {
      let parts = [];
      this.decompose(0, from, parts, 2);
      if (text.length)
        text.decompose(0, text.length, parts, 1 | 2);
      this.decompose(to2, this.length, parts, 1);
      return TextNode.from(parts, this.length - (to2 - from) + text.length);
    }
    append(other) {
      return this.replace(this.length, this.length, other);
    }
    slice(from, to2 = this.length) {
      let parts = [];
      this.decompose(from, to2, parts, 0);
      return TextNode.from(parts, to2 - from);
    }
    eq(other) {
      if (other == this)
        return true;
      if (other.length != this.length || other.lines != this.lines)
        return false;
      let start = this.scanIdentical(other, 1), end = this.length - this.scanIdentical(other, -1);
      let a2 = new RawTextCursor(this), b2 = new RawTextCursor(other);
      for (let skip = start, pos = start; ; ) {
        a2.next(skip);
        b2.next(skip);
        skip = 0;
        if (a2.lineBreak != b2.lineBreak || a2.done != b2.done || a2.value != b2.value)
          return false;
        pos += a2.value.length;
        if (a2.done || pos >= end)
          return true;
      }
    }
    iter(dir = 1) {
      return new RawTextCursor(this, dir);
    }
    iterRange(from, to2 = this.length) {
      return new PartialTextCursor(this, from, to2);
    }
    iterLines(from, to2) {
      let inner;
      if (from == null) {
        inner = this.iter();
      } else {
        if (to2 == null)
          to2 = this.lines + 1;
        let start = this.line(from).from;
        inner = this.iterRange(start, Math.max(start, to2 == this.lines + 1 ? this.length : to2 <= 1 ? 0 : this.line(to2 - 1).to));
      }
      return new LineCursor(inner);
    }
    toString() {
      return this.sliceString(0);
    }
    toJSON() {
      let lines = [];
      this.flatten(lines);
      return lines;
    }
    static of(text) {
      if (text.length == 0)
        throw new RangeError("A document must have at least one line");
      if (text.length == 1 && !text[0])
        return Text.empty;
      return text.length <= 32 ? new TextLeaf(text) : TextNode.from(TextLeaf.split(text, []));
    }
  };
  var TextLeaf = class extends Text {
    constructor(text, length = textLength(text)) {
      super();
      this.text = text;
      this.length = length;
    }
    get lines() {
      return this.text.length;
    }
    get children() {
      return null;
    }
    lineInner(target, isLine, line, offset) {
      for (let i = 0; ; i++) {
        let string2 = this.text[i], end = offset + string2.length;
        if ((isLine ? line : end) >= target)
          return new Line(offset, end, line, string2);
        offset = end + 1;
        line++;
      }
    }
    decompose(from, to2, target, open) {
      let text = from <= 0 && to2 >= this.length ? this : new TextLeaf(sliceText(this.text, from, to2), Math.min(to2, this.length) - Math.max(0, from));
      if (open & 1) {
        let prev = target.pop();
        let joined = appendText(text.text, prev.text.slice(), 0, text.length);
        if (joined.length <= 32) {
          target.push(new TextLeaf(joined, prev.length + text.length));
        } else {
          let mid = joined.length >> 1;
          target.push(new TextLeaf(joined.slice(0, mid)), new TextLeaf(joined.slice(mid)));
        }
      } else {
        target.push(text);
      }
    }
    replace(from, to2, text) {
      if (!(text instanceof TextLeaf))
        return super.replace(from, to2, text);
      let lines = appendText(this.text, appendText(text.text, sliceText(this.text, 0, from)), to2);
      let newLen = this.length + text.length - (to2 - from);
      if (lines.length <= 32)
        return new TextLeaf(lines, newLen);
      return TextNode.from(TextLeaf.split(lines, []), newLen);
    }
    sliceString(from, to2 = this.length, lineSep = "\n") {
      let result = "";
      for (let pos = 0, i = 0; pos <= to2 && i < this.text.length; i++) {
        let line = this.text[i], end = pos + line.length;
        if (pos > from && i)
          result += lineSep;
        if (from < end && to2 > pos)
          result += line.slice(Math.max(0, from - pos), to2 - pos);
        pos = end + 1;
      }
      return result;
    }
    flatten(target) {
      for (let line of this.text)
        target.push(line);
    }
    scanIdentical() {
      return 0;
    }
    static split(text, target) {
      let part = [], len = -1;
      for (let line of text) {
        part.push(line);
        len += line.length + 1;
        if (part.length == 32) {
          target.push(new TextLeaf(part, len));
          part = [];
          len = -1;
        }
      }
      if (len > -1)
        target.push(new TextLeaf(part, len));
      return target;
    }
  };
  var TextNode = class extends Text {
    constructor(children, length) {
      super();
      this.children = children;
      this.length = length;
      this.lines = 0;
      for (let child of children)
        this.lines += child.lines;
    }
    lineInner(target, isLine, line, offset) {
      for (let i = 0; ; i++) {
        let child = this.children[i], end = offset + child.length, endLine = line + child.lines - 1;
        if ((isLine ? endLine : end) >= target)
          return child.lineInner(target, isLine, line, offset);
        offset = end + 1;
        line = endLine + 1;
      }
    }
    decompose(from, to2, target, open) {
      for (let i = 0, pos = 0; pos <= to2 && i < this.children.length; i++) {
        let child = this.children[i], end = pos + child.length;
        if (from <= end && to2 >= pos) {
          let childOpen = open & ((pos <= from ? 1 : 0) | (end >= to2 ? 2 : 0));
          if (pos >= from && end <= to2 && !childOpen)
            target.push(child);
          else
            child.decompose(from - pos, to2 - pos, target, childOpen);
        }
        pos = end + 1;
      }
    }
    replace(from, to2, text) {
      if (text.lines < this.lines)
        for (let i = 0, pos = 0; i < this.children.length; i++) {
          let child = this.children[i], end = pos + child.length;
          if (from >= pos && to2 <= end) {
            let updated = child.replace(from - pos, to2 - pos, text);
            let totalLines = this.lines - child.lines + updated.lines;
            if (updated.lines < totalLines >> 5 - 1 && updated.lines > totalLines >> 5 + 1) {
              let copy = this.children.slice();
              copy[i] = updated;
              return new TextNode(copy, this.length - (to2 - from) + text.length);
            }
            return super.replace(pos, end, updated);
          }
          pos = end + 1;
        }
      return super.replace(from, to2, text);
    }
    sliceString(from, to2 = this.length, lineSep = "\n") {
      let result = "";
      for (let i = 0, pos = 0; i < this.children.length && pos <= to2; i++) {
        let child = this.children[i], end = pos + child.length;
        if (pos > from && i)
          result += lineSep;
        if (from < end && to2 > pos)
          result += child.sliceString(from - pos, to2 - pos, lineSep);
        pos = end + 1;
      }
      return result;
    }
    flatten(target) {
      for (let child of this.children)
        child.flatten(target);
    }
    scanIdentical(other, dir) {
      if (!(other instanceof TextNode))
        return 0;
      let length = 0;
      let [iA, iB, eA, eB] = dir > 0 ? [0, 0, this.children.length, other.children.length] : [this.children.length - 1, other.children.length - 1, -1, -1];
      for (; ; iA += dir, iB += dir) {
        if (iA == eA || iB == eB)
          return length;
        let chA = this.children[iA], chB = other.children[iB];
        if (chA != chB)
          return length + chA.scanIdentical(chB, dir);
        length += chA.length + 1;
      }
    }
    static from(children, length = children.reduce((l, ch) => l + ch.length + 1, -1)) {
      let lines = 0;
      for (let ch of children)
        lines += ch.lines;
      if (lines < 32) {
        let flat = [];
        for (let ch of children)
          ch.flatten(flat);
        return new TextLeaf(flat, length);
      }
      let chunk = Math.max(32, lines >> 5), maxChunk = chunk << 1, minChunk = chunk >> 1;
      let chunked = [], currentLines = 0, currentLen = -1, currentChunk = [];
      function add2(child) {
        let last2;
        if (child.lines > maxChunk && child instanceof TextNode) {
          for (let node of child.children)
            add2(node);
        } else if (child.lines > minChunk && (currentLines > minChunk || !currentLines)) {
          flush();
          chunked.push(child);
        } else if (child instanceof TextLeaf && currentLines && (last2 = currentChunk[currentChunk.length - 1]) instanceof TextLeaf && child.lines + last2.lines <= 32) {
          currentLines += child.lines;
          currentLen += child.length + 1;
          currentChunk[currentChunk.length - 1] = new TextLeaf(last2.text.concat(child.text), last2.length + 1 + child.length);
        } else {
          if (currentLines + child.lines > chunk)
            flush();
          currentLines += child.lines;
          currentLen += child.length + 1;
          currentChunk.push(child);
        }
      }
      function flush() {
        if (currentLines == 0)
          return;
        chunked.push(currentChunk.length == 1 ? currentChunk[0] : TextNode.from(currentChunk, currentLen));
        currentLen = -1;
        currentLines = currentChunk.length = 0;
      }
      for (let child of children)
        add2(child);
      flush();
      return chunked.length == 1 ? chunked[0] : new TextNode(chunked, length);
    }
  };
  Text.empty = /* @__PURE__ */ new TextLeaf([""], 0);
  function textLength(text) {
    let length = -1;
    for (let line of text)
      length += line.length + 1;
    return length;
  }
  function appendText(text, target, from = 0, to2 = 1e9) {
    for (let pos = 0, i = 0, first = true; i < text.length && pos <= to2; i++) {
      let line = text[i], end = pos + line.length;
      if (end >= from) {
        if (end > to2)
          line = line.slice(0, to2 - pos);
        if (pos < from)
          line = line.slice(from - pos);
        if (first) {
          target[target.length - 1] += line;
          first = false;
        } else
          target.push(line);
      }
      pos = end + 1;
    }
    return target;
  }
  function sliceText(text, from, to2) {
    return appendText(text, [""], from, to2);
  }
  var RawTextCursor = class {
    constructor(text, dir = 1) {
      this.dir = dir;
      this.done = false;
      this.lineBreak = false;
      this.value = "";
      this.nodes = [text];
      this.offsets = [dir > 0 ? 1 : (text instanceof TextLeaf ? text.text.length : text.children.length) << 1];
    }
    nextInner(skip, dir) {
      this.done = this.lineBreak = false;
      for (; ; ) {
        let last2 = this.nodes.length - 1;
        let top2 = this.nodes[last2], offsetValue = this.offsets[last2], offset = offsetValue >> 1;
        let size = top2 instanceof TextLeaf ? top2.text.length : top2.children.length;
        if (offset == (dir > 0 ? size : 0)) {
          if (last2 == 0) {
            this.done = true;
            this.value = "";
            return this;
          }
          if (dir > 0)
            this.offsets[last2 - 1]++;
          this.nodes.pop();
          this.offsets.pop();
        } else if ((offsetValue & 1) == (dir > 0 ? 0 : 1)) {
          this.offsets[last2] += dir;
          if (skip == 0) {
            this.lineBreak = true;
            this.value = "\n";
            return this;
          }
          skip--;
        } else if (top2 instanceof TextLeaf) {
          let next = top2.text[offset + (dir < 0 ? -1 : 0)];
          this.offsets[last2] += dir;
          if (next.length > Math.max(0, skip)) {
            this.value = skip == 0 ? next : dir > 0 ? next.slice(skip) : next.slice(0, next.length - skip);
            return this;
          }
          skip -= next.length;
        } else {
          let next = top2.children[offset + (dir < 0 ? -1 : 0)];
          if (skip > next.length) {
            skip -= next.length;
            this.offsets[last2] += dir;
          } else {
            if (dir < 0)
              this.offsets[last2]--;
            this.nodes.push(next);
            this.offsets.push(dir > 0 ? 1 : (next instanceof TextLeaf ? next.text.length : next.children.length) << 1);
          }
        }
      }
    }
    next(skip = 0) {
      if (skip < 0) {
        this.nextInner(-skip, -this.dir);
        skip = this.value.length;
      }
      return this.nextInner(skip, this.dir);
    }
  };
  var PartialTextCursor = class {
    constructor(text, start, end) {
      this.value = "";
      this.done = false;
      this.cursor = new RawTextCursor(text, start > end ? -1 : 1);
      this.pos = start > end ? text.length : 0;
      this.from = Math.min(start, end);
      this.to = Math.max(start, end);
    }
    nextInner(skip, dir) {
      if (dir < 0 ? this.pos <= this.from : this.pos >= this.to) {
        this.value = "";
        this.done = true;
        return this;
      }
      skip += Math.max(0, dir < 0 ? this.pos - this.to : this.from - this.pos);
      let limit = dir < 0 ? this.pos - this.from : this.to - this.pos;
      if (skip > limit)
        skip = limit;
      limit -= skip;
      let { value: value2 } = this.cursor.next(skip);
      this.pos += (value2.length + skip) * dir;
      this.value = value2.length <= limit ? value2 : dir < 0 ? value2.slice(value2.length - limit) : value2.slice(0, limit);
      this.done = !this.value;
      return this;
    }
    next(skip = 0) {
      if (skip < 0)
        skip = Math.max(skip, this.from - this.pos);
      else if (skip > 0)
        skip = Math.min(skip, this.to - this.pos);
      return this.nextInner(skip, this.cursor.dir);
    }
    get lineBreak() {
      return this.cursor.lineBreak && this.value != "";
    }
  };
  var LineCursor = class {
    constructor(inner) {
      this.inner = inner;
      this.afterBreak = true;
      this.value = "";
      this.done = false;
    }
    next(skip = 0) {
      let { done, lineBreak, value: value2 } = this.inner.next(skip);
      if (done) {
        this.done = true;
        this.value = "";
      } else if (lineBreak) {
        if (this.afterBreak) {
          this.value = "";
        } else {
          this.afterBreak = true;
          this.next();
        }
      } else {
        this.value = value2;
        this.afterBreak = false;
      }
      return this;
    }
    get lineBreak() {
      return false;
    }
  };
  if (typeof Symbol != "undefined") {
    Text.prototype[Symbol.iterator] = function() {
      return this.iter();
    };
    RawTextCursor.prototype[Symbol.iterator] = PartialTextCursor.prototype[Symbol.iterator] = LineCursor.prototype[Symbol.iterator] = function() {
      return this;
    };
  }
  var Line = class {
    constructor(from, to2, number2, text) {
      this.from = from;
      this.to = to2;
      this.number = number2;
      this.text = text;
    }
    get length() {
      return this.to - this.from;
    }
  };
  var extend = /* @__PURE__ */ "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,3b,f,,w,1j,,,,4,8,4,,3,7,a,2,t,,1m,,,,2,4,8,,9,,a,2,q,,2,2,1l,,4,2,4,2,2,3,3,,u,2,3,,b,2,1l,,4,5,,2,4,,k,2,m,6,,,1m,,,2,,4,8,,7,3,a,2,u,,1n,,,,c,,9,,14,,3,,1l,3,5,3,,4,7,2,b,2,t,,1m,,2,,2,,3,,5,2,7,2,b,2,s,2,1l,2,,,2,4,8,,9,,a,2,t,,20,,4,,2,3,,,8,,29,,2,7,c,8,2q,,2,9,b,6,22,2,r,,,,,,1j,e,,5,,2,5,b,,10,9,,2u,4,,6,,2,2,2,p,2,4,3,g,4,d,,2,2,6,,f,,jj,3,qa,3,t,3,t,2,u,2,1s,2,,7,8,,2,b,9,,19,3,3b,2,y,,3a,3,4,2,9,,6,3,63,2,2,,1m,,,7,,,,,2,8,6,a,2,,1c,h,1r,4,1c,7,,,5,,14,9,c,2,w,4,2,2,,3,1k,,,2,3,,,3,1m,8,2,2,48,3,,d,,7,4,,6,,3,2,5i,1m,,5,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,p,2,5,,47,2,q,i,d,,12,8,p,b,1a,3,1c,,2,4,2,2,13,,1v,6,2,2,2,2,c,,8,,1b,,1f,,,3,2,2,5,2,,,16,2,8,,6m,,2,,4,,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,ar,2,49,b,4w,,1i,f,1k,3,1d,4,2,2,1x,3,10,5,,8,1q,,c,2,1g,9,a,4,2,,2n,3,2,,,2,6,,4g,,3,8,l,2,1l,2,,,,,m,,e,7,3,5,5f,8,2,3,,,n,,29,,2,6,,,2,,,2,,2,6j,,2,4,6,2,,2,r,2,2d,8,2,,,2,2y,,,,2,6,,,2t,3,2,4,,5,77,9,,2,6t,,a,2,,,4,,40,4,2,2,4,,w,a,14,6,2,4,8,,9,6,2,3,1a,d,,2,ba,7,,6,,,2a,m,2,7,,2,,2,3e,6,3,,,2,,7,,,20,2,3,,,,9n,2,f0b,5,1n,7,t4,,1r,4,29,,f5k,2,43q,,,3,4,5,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,79,7,c5,4,15s,7,31,7,240,5,gx7k,2o,3k,6o".split(",").map((s) => s ? parseInt(s, 36) : 1);
  for (let i = 1; i < extend.length; i++)
    extend[i] += extend[i - 1];
  function isExtendingChar(code) {
    for (let i = 1; i < extend.length; i += 2)
      if (extend[i] > code)
        return extend[i - 1] <= code;
    return false;
  }
  function isRegionalIndicator(code) {
    return code >= 127462 && code <= 127487;
  }
  var ZWJ = 8205;
  function findClusterBreak(str, pos, forward = true, includeExtending = true) {
    return (forward ? nextClusterBreak : prevClusterBreak)(str, pos, includeExtending);
  }
  function nextClusterBreak(str, pos, includeExtending) {
    if (pos == str.length)
      return pos;
    if (pos && surrogateLow(str.charCodeAt(pos)) && surrogateHigh(str.charCodeAt(pos - 1)))
      pos--;
    let prev = codePointAt(str, pos);
    pos += codePointSize(prev);
    while (pos < str.length) {
      let next = codePointAt(str, pos);
      if (prev == ZWJ || next == ZWJ || includeExtending && isExtendingChar(next)) {
        pos += codePointSize(next);
        prev = next;
      } else if (isRegionalIndicator(next)) {
        let countBefore = 0, i = pos - 2;
        while (i >= 0 && isRegionalIndicator(codePointAt(str, i))) {
          countBefore++;
          i -= 2;
        }
        if (countBefore % 2 == 0)
          break;
        else
          pos += 2;
      } else {
        break;
      }
    }
    return pos;
  }
  function prevClusterBreak(str, pos, includeExtending) {
    while (pos > 0) {
      let found = nextClusterBreak(str, pos - 2, includeExtending);
      if (found < pos)
        return found;
      pos--;
    }
    return 0;
  }
  function surrogateLow(ch) {
    return ch >= 56320 && ch < 57344;
  }
  function surrogateHigh(ch) {
    return ch >= 55296 && ch < 56320;
  }
  function codePointAt(str, pos) {
    let code0 = str.charCodeAt(pos);
    if (!surrogateHigh(code0) || pos + 1 == str.length)
      return code0;
    let code1 = str.charCodeAt(pos + 1);
    if (!surrogateLow(code1))
      return code0;
    return (code0 - 55296 << 10) + (code1 - 56320) + 65536;
  }
  function fromCodePoint(code) {
    if (code <= 65535)
      return String.fromCharCode(code);
    code -= 65536;
    return String.fromCharCode((code >> 10) + 55296, (code & 1023) + 56320);
  }
  function codePointSize(code) {
    return code < 65536 ? 1 : 2;
  }
  var DefaultSplit = /\r\n?|\n/;
  var MapMode = /* @__PURE__ */ function(MapMode2) {
    MapMode2[MapMode2["Simple"] = 0] = "Simple";
    MapMode2[MapMode2["TrackDel"] = 1] = "TrackDel";
    MapMode2[MapMode2["TrackBefore"] = 2] = "TrackBefore";
    MapMode2[MapMode2["TrackAfter"] = 3] = "TrackAfter";
    return MapMode2;
  }(MapMode || (MapMode = {}));
  var ChangeDesc = class {
    constructor(sections) {
      this.sections = sections;
    }
    get length() {
      let result = 0;
      for (let i = 0; i < this.sections.length; i += 2)
        result += this.sections[i];
      return result;
    }
    get newLength() {
      let result = 0;
      for (let i = 0; i < this.sections.length; i += 2) {
        let ins = this.sections[i + 1];
        result += ins < 0 ? this.sections[i] : ins;
      }
      return result;
    }
    get empty() {
      return this.sections.length == 0 || this.sections.length == 2 && this.sections[1] < 0;
    }
    iterGaps(f) {
      for (let i = 0, posA = 0, posB = 0; i < this.sections.length; ) {
        let len = this.sections[i++], ins = this.sections[i++];
        if (ins < 0) {
          f(posA, posB, len);
          posB += len;
        } else {
          posB += ins;
        }
        posA += len;
      }
    }
    iterChangedRanges(f, individual = false) {
      iterChanges(this, f, individual);
    }
    get invertedDesc() {
      let sections = [];
      for (let i = 0; i < this.sections.length; ) {
        let len = this.sections[i++], ins = this.sections[i++];
        if (ins < 0)
          sections.push(len, ins);
        else
          sections.push(ins, len);
      }
      return new ChangeDesc(sections);
    }
    composeDesc(other) {
      return this.empty ? other : other.empty ? this : composeSets(this, other);
    }
    mapDesc(other, before = false) {
      return other.empty ? this : mapSet(this, other, before);
    }
    mapPos(pos, assoc = -1, mode = MapMode.Simple) {
      let posA = 0, posB = 0;
      for (let i = 0; i < this.sections.length; ) {
        let len = this.sections[i++], ins = this.sections[i++], endA = posA + len;
        if (ins < 0) {
          if (endA > pos)
            return posB + (pos - posA);
          posB += len;
        } else {
          if (mode != MapMode.Simple && endA >= pos && (mode == MapMode.TrackDel && posA < pos && endA > pos || mode == MapMode.TrackBefore && posA < pos || mode == MapMode.TrackAfter && endA > pos))
            return null;
          if (endA > pos || endA == pos && assoc < 0 && !len)
            return pos == posA || assoc < 0 ? posB : posB + ins;
          posB += ins;
        }
        posA = endA;
      }
      if (pos > posA)
        throw new RangeError(`Position ${pos} is out of range for changeset of length ${posA}`);
      return posB;
    }
    touchesRange(from, to2 = from) {
      for (let i = 0, pos = 0; i < this.sections.length && pos <= to2; ) {
        let len = this.sections[i++], ins = this.sections[i++], end = pos + len;
        if (ins >= 0 && pos <= to2 && end >= from)
          return pos < from && end > to2 ? "cover" : true;
        pos = end;
      }
      return false;
    }
    toString() {
      let result = "";
      for (let i = 0; i < this.sections.length; ) {
        let len = this.sections[i++], ins = this.sections[i++];
        result += (result ? " " : "") + len + (ins >= 0 ? ":" + ins : "");
      }
      return result;
    }
    toJSON() {
      return this.sections;
    }
    static fromJSON(json) {
      if (!Array.isArray(json) || json.length % 2 || json.some((a2) => typeof a2 != "number"))
        throw new RangeError("Invalid JSON representation of ChangeDesc");
      return new ChangeDesc(json);
    }
    static create(sections) {
      return new ChangeDesc(sections);
    }
  };
  var ChangeSet = class extends ChangeDesc {
    constructor(sections, inserted) {
      super(sections);
      this.inserted = inserted;
    }
    apply(doc2) {
      if (this.length != doc2.length)
        throw new RangeError("Applying change set to a document with the wrong length");
      iterChanges(this, (fromA, toA, fromB, _toB, text) => doc2 = doc2.replace(fromB, fromB + (toA - fromA), text), false);
      return doc2;
    }
    mapDesc(other, before = false) {
      return mapSet(this, other, before, true);
    }
    invert(doc2) {
      let sections = this.sections.slice(), inserted = [];
      for (let i = 0, pos = 0; i < sections.length; i += 2) {
        let len = sections[i], ins = sections[i + 1];
        if (ins >= 0) {
          sections[i] = ins;
          sections[i + 1] = len;
          let index = i >> 1;
          while (inserted.length < index)
            inserted.push(Text.empty);
          inserted.push(len ? doc2.slice(pos, pos + len) : Text.empty);
        }
        pos += len;
      }
      return new ChangeSet(sections, inserted);
    }
    compose(other) {
      return this.empty ? other : other.empty ? this : composeSets(this, other, true);
    }
    map(other, before = false) {
      return other.empty ? this : mapSet(this, other, before, true);
    }
    iterChanges(f, individual = false) {
      iterChanges(this, f, individual);
    }
    get desc() {
      return ChangeDesc.create(this.sections);
    }
    filter(ranges) {
      let resultSections = [], resultInserted = [], filteredSections = [];
      let iter = new SectionIter(this);
      done:
        for (let i = 0, pos = 0; ; ) {
          let next = i == ranges.length ? 1e9 : ranges[i++];
          while (pos < next || pos == next && iter.len == 0) {
            if (iter.done)
              break done;
            let len = Math.min(iter.len, next - pos);
            addSection(filteredSections, len, -1);
            let ins = iter.ins == -1 ? -1 : iter.off == 0 ? iter.ins : 0;
            addSection(resultSections, len, ins);
            if (ins > 0)
              addInsert(resultInserted, resultSections, iter.text);
            iter.forward(len);
            pos += len;
          }
          let end = ranges[i++];
          while (pos < end) {
            if (iter.done)
              break done;
            let len = Math.min(iter.len, end - pos);
            addSection(resultSections, len, -1);
            addSection(filteredSections, len, iter.ins == -1 ? -1 : iter.off == 0 ? iter.ins : 0);
            iter.forward(len);
            pos += len;
          }
        }
      return {
        changes: new ChangeSet(resultSections, resultInserted),
        filtered: ChangeDesc.create(filteredSections)
      };
    }
    toJSON() {
      let parts = [];
      for (let i = 0; i < this.sections.length; i += 2) {
        let len = this.sections[i], ins = this.sections[i + 1];
        if (ins < 0)
          parts.push(len);
        else if (ins == 0)
          parts.push([len]);
        else
          parts.push([len].concat(this.inserted[i >> 1].toJSON()));
      }
      return parts;
    }
    static of(changes, length, lineSep) {
      let sections = [], inserted = [], pos = 0;
      let total = null;
      function flush(force = false) {
        if (!force && !sections.length)
          return;
        if (pos < length)
          addSection(sections, length - pos, -1);
        let set2 = new ChangeSet(sections, inserted);
        total = total ? total.compose(set2.map(total)) : set2;
        sections = [];
        inserted = [];
        pos = 0;
      }
      function process(spec) {
        if (Array.isArray(spec)) {
          for (let sub of spec)
            process(sub);
        } else if (spec instanceof ChangeSet) {
          if (spec.length != length)
            throw new RangeError(`Mismatched change set length (got ${spec.length}, expected ${length})`);
          flush();
          total = total ? total.compose(spec.map(total)) : spec;
        } else {
          let { from, to: to2 = from, insert: insert2 } = spec;
          if (from > to2 || from < 0 || to2 > length)
            throw new RangeError(`Invalid change range ${from} to ${to2} (in doc of length ${length})`);
          let insText = !insert2 ? Text.empty : typeof insert2 == "string" ? Text.of(insert2.split(lineSep || DefaultSplit)) : insert2;
          let insLen = insText.length;
          if (from == to2 && insLen == 0)
            return;
          if (from < pos)
            flush();
          if (from > pos)
            addSection(sections, from - pos, -1);
          addSection(sections, to2 - from, insLen);
          addInsert(inserted, sections, insText);
          pos = to2;
        }
      }
      process(changes);
      flush(!total);
      return total;
    }
    static empty(length) {
      return new ChangeSet(length ? [length, -1] : [], []);
    }
    static fromJSON(json) {
      if (!Array.isArray(json))
        throw new RangeError("Invalid JSON representation of ChangeSet");
      let sections = [], inserted = [];
      for (let i = 0; i < json.length; i++) {
        let part = json[i];
        if (typeof part == "number") {
          sections.push(part, -1);
        } else if (!Array.isArray(part) || typeof part[0] != "number" || part.some((e, i2) => i2 && typeof e != "string")) {
          throw new RangeError("Invalid JSON representation of ChangeSet");
        } else if (part.length == 1) {
          sections.push(part[0], 0);
        } else {
          while (inserted.length < i)
            inserted.push(Text.empty);
          inserted[i] = Text.of(part.slice(1));
          sections.push(part[0], inserted[i].length);
        }
      }
      return new ChangeSet(sections, inserted);
    }
    static createSet(sections, inserted) {
      return new ChangeSet(sections, inserted);
    }
  };
  function addSection(sections, len, ins, forceJoin = false) {
    if (len == 0 && ins <= 0)
      return;
    let last2 = sections.length - 2;
    if (last2 >= 0 && ins <= 0 && ins == sections[last2 + 1])
      sections[last2] += len;
    else if (len == 0 && sections[last2] == 0)
      sections[last2 + 1] += ins;
    else if (forceJoin) {
      sections[last2] += len;
      sections[last2 + 1] += ins;
    } else
      sections.push(len, ins);
  }
  function addInsert(values, sections, value2) {
    if (value2.length == 0)
      return;
    let index = sections.length - 2 >> 1;
    if (index < values.length) {
      values[values.length - 1] = values[values.length - 1].append(value2);
    } else {
      while (values.length < index)
        values.push(Text.empty);
      values.push(value2);
    }
  }
  function iterChanges(desc, f, individual) {
    let inserted = desc.inserted;
    for (let posA = 0, posB = 0, i = 0; i < desc.sections.length; ) {
      let len = desc.sections[i++], ins = desc.sections[i++];
      if (ins < 0) {
        posA += len;
        posB += len;
      } else {
        let endA = posA, endB = posB, text = Text.empty;
        for (; ; ) {
          endA += len;
          endB += ins;
          if (ins && inserted)
            text = text.append(inserted[i - 2 >> 1]);
          if (individual || i == desc.sections.length || desc.sections[i + 1] < 0)
            break;
          len = desc.sections[i++];
          ins = desc.sections[i++];
        }
        f(posA, endA, posB, endB, text);
        posA = endA;
        posB = endB;
      }
    }
  }
  function mapSet(setA, setB, before, mkSet = false) {
    let sections = [], insert2 = mkSet ? [] : null;
    let a2 = new SectionIter(setA), b2 = new SectionIter(setB);
    for (let posA = 0, posB = 0; ; ) {
      if (a2.ins == -1) {
        posA += a2.len;
        a2.next();
      } else if (b2.ins == -1 && posB < posA) {
        let skip = Math.min(b2.len, posA - posB);
        b2.forward(skip);
        addSection(sections, skip, -1);
        posB += skip;
      } else if (b2.ins >= 0 && (a2.done || posB < posA || posB == posA && (b2.len < a2.len || b2.len == a2.len && !before))) {
        addSection(sections, b2.ins, -1);
        while (posA > posB && !a2.done && posA + a2.len < posB + b2.len) {
          posA += a2.len;
          a2.next();
        }
        posB += b2.len;
        b2.next();
      } else if (a2.ins >= 0) {
        let len = 0, end = posA + a2.len;
        for (; ; ) {
          if (b2.ins >= 0 && posB > posA && posB + b2.len < end) {
            len += b2.ins;
            posB += b2.len;
            b2.next();
          } else if (b2.ins == -1 && posB < end) {
            let skip = Math.min(b2.len, end - posB);
            len += skip;
            b2.forward(skip);
            posB += skip;
          } else {
            break;
          }
        }
        addSection(sections, len, a2.ins);
        if (insert2)
          addInsert(insert2, sections, a2.text);
        posA = end;
        a2.next();
      } else if (a2.done && b2.done) {
        return insert2 ? ChangeSet.createSet(sections, insert2) : ChangeDesc.create(sections);
      } else {
        throw new Error("Mismatched change set lengths");
      }
    }
  }
  function composeSets(setA, setB, mkSet = false) {
    let sections = [];
    let insert2 = mkSet ? [] : null;
    let a2 = new SectionIter(setA), b2 = new SectionIter(setB);
    for (let open = false; ; ) {
      if (a2.done && b2.done) {
        return insert2 ? ChangeSet.createSet(sections, insert2) : ChangeDesc.create(sections);
      } else if (a2.ins == 0) {
        addSection(sections, a2.len, 0, open);
        a2.next();
      } else if (b2.len == 0 && !b2.done) {
        addSection(sections, 0, b2.ins, open);
        if (insert2)
          addInsert(insert2, sections, b2.text);
        b2.next();
      } else if (a2.done || b2.done) {
        throw new Error("Mismatched change set lengths");
      } else {
        let len = Math.min(a2.len2, b2.len), sectionLen = sections.length;
        if (a2.ins == -1) {
          let insB = b2.ins == -1 ? -1 : b2.off ? 0 : b2.ins;
          addSection(sections, len, insB, open);
          if (insert2 && insB)
            addInsert(insert2, sections, b2.text);
        } else if (b2.ins == -1) {
          addSection(sections, a2.off ? 0 : a2.len, len, open);
          if (insert2)
            addInsert(insert2, sections, a2.textBit(len));
        } else {
          addSection(sections, a2.off ? 0 : a2.len, b2.off ? 0 : b2.ins, open);
          if (insert2 && !b2.off)
            addInsert(insert2, sections, b2.text);
        }
        open = (a2.ins > len || b2.ins >= 0 && b2.len > len) && (open || sections.length > sectionLen);
        a2.forward2(len);
        b2.forward(len);
      }
    }
  }
  var SectionIter = class {
    constructor(set2) {
      this.set = set2;
      this.i = 0;
      this.next();
    }
    next() {
      let { sections } = this.set;
      if (this.i < sections.length) {
        this.len = sections[this.i++];
        this.ins = sections[this.i++];
      } else {
        this.len = 0;
        this.ins = -2;
      }
      this.off = 0;
    }
    get done() {
      return this.ins == -2;
    }
    get len2() {
      return this.ins < 0 ? this.len : this.ins;
    }
    get text() {
      let { inserted } = this.set, index = this.i - 2 >> 1;
      return index >= inserted.length ? Text.empty : inserted[index];
    }
    textBit(len) {
      let { inserted } = this.set, index = this.i - 2 >> 1;
      return index >= inserted.length && !len ? Text.empty : inserted[index].slice(this.off, len == null ? void 0 : this.off + len);
    }
    forward(len) {
      if (len == this.len)
        this.next();
      else {
        this.len -= len;
        this.off += len;
      }
    }
    forward2(len) {
      if (this.ins == -1)
        this.forward(len);
      else if (len == this.ins)
        this.next();
      else {
        this.ins -= len;
        this.off += len;
      }
    }
  };
  var SelectionRange = class {
    constructor(from, to2, flags) {
      this.from = from;
      this.to = to2;
      this.flags = flags;
    }
    get anchor() {
      return this.flags & 16 ? this.to : this.from;
    }
    get head() {
      return this.flags & 16 ? this.from : this.to;
    }
    get empty() {
      return this.from == this.to;
    }
    get assoc() {
      return this.flags & 4 ? -1 : this.flags & 8 ? 1 : 0;
    }
    get bidiLevel() {
      let level = this.flags & 3;
      return level == 3 ? null : level;
    }
    get goalColumn() {
      let value2 = this.flags >> 5;
      return value2 == 33554431 ? void 0 : value2;
    }
    map(change, assoc = -1) {
      let from, to2;
      if (this.empty) {
        from = to2 = change.mapPos(this.from, assoc);
      } else {
        from = change.mapPos(this.from, 1);
        to2 = change.mapPos(this.to, -1);
      }
      return from == this.from && to2 == this.to ? this : new SelectionRange(from, to2, this.flags);
    }
    extend(from, to2 = from) {
      if (from <= this.anchor && to2 >= this.anchor)
        return EditorSelection.range(from, to2);
      let head = Math.abs(from - this.anchor) > Math.abs(to2 - this.anchor) ? from : to2;
      return EditorSelection.range(this.anchor, head);
    }
    eq(other) {
      return this.anchor == other.anchor && this.head == other.head;
    }
    toJSON() {
      return { anchor: this.anchor, head: this.head };
    }
    static fromJSON(json) {
      if (!json || typeof json.anchor != "number" || typeof json.head != "number")
        throw new RangeError("Invalid JSON representation for SelectionRange");
      return EditorSelection.range(json.anchor, json.head);
    }
    static create(from, to2, flags) {
      return new SelectionRange(from, to2, flags);
    }
  };
  var EditorSelection = class {
    constructor(ranges, mainIndex) {
      this.ranges = ranges;
      this.mainIndex = mainIndex;
    }
    map(change, assoc = -1) {
      if (change.empty)
        return this;
      return EditorSelection.create(this.ranges.map((r) => r.map(change, assoc)), this.mainIndex);
    }
    eq(other) {
      if (this.ranges.length != other.ranges.length || this.mainIndex != other.mainIndex)
        return false;
      for (let i = 0; i < this.ranges.length; i++)
        if (!this.ranges[i].eq(other.ranges[i]))
          return false;
      return true;
    }
    get main() {
      return this.ranges[this.mainIndex];
    }
    asSingle() {
      return this.ranges.length == 1 ? this : new EditorSelection([this.main], 0);
    }
    addRange(range2, main = true) {
      return EditorSelection.create([range2].concat(this.ranges), main ? 0 : this.mainIndex + 1);
    }
    replaceRange(range2, which = this.mainIndex) {
      let ranges = this.ranges.slice();
      ranges[which] = range2;
      return EditorSelection.create(ranges, this.mainIndex);
    }
    toJSON() {
      return { ranges: this.ranges.map((r) => r.toJSON()), main: this.mainIndex };
    }
    static fromJSON(json) {
      if (!json || !Array.isArray(json.ranges) || typeof json.main != "number" || json.main >= json.ranges.length)
        throw new RangeError("Invalid JSON representation for EditorSelection");
      return new EditorSelection(json.ranges.map((r) => SelectionRange.fromJSON(r)), json.main);
    }
    static single(anchor, head = anchor) {
      return new EditorSelection([EditorSelection.range(anchor, head)], 0);
    }
    static create(ranges, mainIndex = 0) {
      if (ranges.length == 0)
        throw new RangeError("A selection needs at least one range");
      for (let pos = 0, i = 0; i < ranges.length; i++) {
        let range2 = ranges[i];
        if (range2.empty ? range2.from <= pos : range2.from < pos)
          return EditorSelection.normalized(ranges.slice(), mainIndex);
        pos = range2.to;
      }
      return new EditorSelection(ranges, mainIndex);
    }
    static cursor(pos, assoc = 0, bidiLevel, goalColumn) {
      return SelectionRange.create(pos, pos, (assoc == 0 ? 0 : assoc < 0 ? 4 : 8) | (bidiLevel == null ? 3 : Math.min(2, bidiLevel)) | (goalColumn !== null && goalColumn !== void 0 ? goalColumn : 33554431) << 5);
    }
    static range(anchor, head, goalColumn) {
      let goal = (goalColumn !== null && goalColumn !== void 0 ? goalColumn : 33554431) << 5;
      return head < anchor ? SelectionRange.create(head, anchor, 16 | goal | 8) : SelectionRange.create(anchor, head, goal | (head > anchor ? 4 : 0));
    }
    static normalized(ranges, mainIndex = 0) {
      let main = ranges[mainIndex];
      ranges.sort((a2, b2) => a2.from - b2.from);
      mainIndex = ranges.indexOf(main);
      for (let i = 1; i < ranges.length; i++) {
        let range2 = ranges[i], prev = ranges[i - 1];
        if (range2.empty ? range2.from <= prev.to : range2.from < prev.to) {
          let from = prev.from, to2 = Math.max(range2.to, prev.to);
          if (i <= mainIndex)
            mainIndex--;
          ranges.splice(--i, 2, range2.anchor > range2.head ? EditorSelection.range(to2, from) : EditorSelection.range(from, to2));
        }
      }
      return new EditorSelection(ranges, mainIndex);
    }
  };
  function checkSelection(selection, docLength) {
    for (let range2 of selection.ranges)
      if (range2.to > docLength)
        throw new RangeError("Selection points outside of document");
  }
  var nextID = 0;
  var Facet = class {
    constructor(combine, compareInput, compare2, isStatic, extensions) {
      this.combine = combine;
      this.compareInput = compareInput;
      this.compare = compare2;
      this.isStatic = isStatic;
      this.extensions = extensions;
      this.id = nextID++;
      this.default = combine([]);
    }
    static define(config2 = {}) {
      return new Facet(config2.combine || ((a2) => a2), config2.compareInput || ((a2, b2) => a2 === b2), config2.compare || (!config2.combine ? sameArray : (a2, b2) => a2 === b2), !!config2.static, config2.enables);
    }
    of(value2) {
      return new FacetProvider([], this, 0, value2);
    }
    compute(deps, get2) {
      if (this.isStatic)
        throw new Error("Can't compute a static facet");
      return new FacetProvider(deps, this, 1, get2);
    }
    computeN(deps, get2) {
      if (this.isStatic)
        throw new Error("Can't compute a static facet");
      return new FacetProvider(deps, this, 2, get2);
    }
    from(field, get2) {
      if (!get2)
        get2 = (x) => x;
      return this.compute([field], (state) => get2(state.field(field)));
    }
  };
  function sameArray(a2, b2) {
    return a2 == b2 || a2.length == b2.length && a2.every((e, i) => e === b2[i]);
  }
  var FacetProvider = class {
    constructor(dependencies, facet, type2, value2) {
      this.dependencies = dependencies;
      this.facet = facet;
      this.type = type2;
      this.value = value2;
      this.id = nextID++;
    }
    dynamicSlot(addresses) {
      var _a2;
      let getter = this.value;
      let compare2 = this.facet.compareInput;
      let id = this.id, idx = addresses[id] >> 1, multi = this.type == 2;
      let depDoc = false, depSel = false, depAddrs = [];
      for (let dep of this.dependencies) {
        if (dep == "doc")
          depDoc = true;
        else if (dep == "selection")
          depSel = true;
        else if ((((_a2 = addresses[dep.id]) !== null && _a2 !== void 0 ? _a2 : 1) & 1) == 0)
          depAddrs.push(addresses[dep.id]);
      }
      return {
        create(state) {
          state.values[idx] = getter(state);
          return 1;
        },
        update(state, tr) {
          if (depDoc && tr.docChanged || depSel && (tr.docChanged || tr.selection) || ensureAll(state, depAddrs)) {
            let newVal = getter(state);
            if (multi ? !compareArray(newVal, state.values[idx], compare2) : !compare2(newVal, state.values[idx])) {
              state.values[idx] = newVal;
              return 1;
            }
          }
          return 0;
        },
        reconfigure: (state, oldState) => {
          let newVal = getter(state);
          let oldAddr = oldState.config.address[id];
          if (oldAddr != null) {
            let oldVal = getAddr(oldState, oldAddr);
            if (this.dependencies.every((dep) => {
              return dep instanceof Facet ? oldState.facet(dep) === state.facet(dep) : dep instanceof StateField ? oldState.field(dep, false) == state.field(dep, false) : true;
            }) || (multi ? compareArray(newVal, oldVal, compare2) : compare2(newVal, oldVal))) {
              state.values[idx] = oldVal;
              return 0;
            }
          }
          state.values[idx] = newVal;
          return 1;
        }
      };
    }
  };
  function compareArray(a2, b2, compare2) {
    if (a2.length != b2.length)
      return false;
    for (let i = 0; i < a2.length; i++)
      if (!compare2(a2[i], b2[i]))
        return false;
    return true;
  }
  function ensureAll(state, addrs) {
    let changed = false;
    for (let addr of addrs)
      if (ensureAddr(state, addr) & 1)
        changed = true;
    return changed;
  }
  function dynamicFacetSlot(addresses, facet, providers) {
    let providerAddrs = providers.map((p2) => addresses[p2.id]);
    let providerTypes = providers.map((p2) => p2.type);
    let dynamic = providerAddrs.filter((p2) => !(p2 & 1));
    let idx = addresses[facet.id] >> 1;
    function get2(state) {
      let values = [];
      for (let i = 0; i < providerAddrs.length; i++) {
        let value2 = getAddr(state, providerAddrs[i]);
        if (providerTypes[i] == 2)
          for (let val of value2)
            values.push(val);
        else
          values.push(value2);
      }
      return facet.combine(values);
    }
    return {
      create(state) {
        for (let addr of providerAddrs)
          ensureAddr(state, addr);
        state.values[idx] = get2(state);
        return 1;
      },
      update(state, tr) {
        if (!ensureAll(state, dynamic))
          return 0;
        let value2 = get2(state);
        if (facet.compare(value2, state.values[idx]))
          return 0;
        state.values[idx] = value2;
        return 1;
      },
      reconfigure(state, oldState) {
        let depChanged = ensureAll(state, providerAddrs);
        let oldProviders = oldState.config.facets[facet.id], oldValue = oldState.facet(facet);
        if (oldProviders && !depChanged && sameArray(providers, oldProviders)) {
          state.values[idx] = oldValue;
          return 0;
        }
        let value2 = get2(state);
        if (facet.compare(value2, oldValue)) {
          state.values[idx] = oldValue;
          return 0;
        }
        state.values[idx] = value2;
        return 1;
      }
    };
  }
  var initField = /* @__PURE__ */ Facet.define({ static: true });
  var StateField = class {
    constructor(id, createF, updateF, compareF, spec) {
      this.id = id;
      this.createF = createF;
      this.updateF = updateF;
      this.compareF = compareF;
      this.spec = spec;
      this.provides = void 0;
    }
    static define(config2) {
      let field = new StateField(nextID++, config2.create, config2.update, config2.compare || ((a2, b2) => a2 === b2), config2);
      if (config2.provide)
        field.provides = config2.provide(field);
      return field;
    }
    create(state) {
      let init = state.facet(initField).find((i) => i.field == this);
      return ((init === null || init === void 0 ? void 0 : init.create) || this.createF)(state);
    }
    slot(addresses) {
      let idx = addresses[this.id] >> 1;
      return {
        create: (state) => {
          state.values[idx] = this.create(state);
          return 1;
        },
        update: (state, tr) => {
          let oldVal = state.values[idx];
          let value2 = this.updateF(oldVal, tr);
          if (this.compareF(oldVal, value2))
            return 0;
          state.values[idx] = value2;
          return 1;
        },
        reconfigure: (state, oldState) => {
          if (oldState.config.address[this.id] != null) {
            state.values[idx] = oldState.field(this);
            return 0;
          }
          state.values[idx] = this.create(state);
          return 1;
        }
      };
    }
    init(create) {
      return [this, initField.of({ field: this, create })];
    }
    get extension() {
      return this;
    }
  };
  var Prec_ = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
  function prec(value2) {
    return (ext) => new PrecExtension(ext, value2);
  }
  var Prec = {
    highest: /* @__PURE__ */ prec(Prec_.highest),
    high: /* @__PURE__ */ prec(Prec_.high),
    default: /* @__PURE__ */ prec(Prec_.default),
    low: /* @__PURE__ */ prec(Prec_.low),
    lowest: /* @__PURE__ */ prec(Prec_.lowest)
  };
  var PrecExtension = class {
    constructor(inner, prec2) {
      this.inner = inner;
      this.prec = prec2;
    }
  };
  var Compartment = class {
    of(ext) {
      return new CompartmentInstance(this, ext);
    }
    reconfigure(content2) {
      return Compartment.reconfigure.of({ compartment: this, extension: content2 });
    }
    get(state) {
      return state.config.compartments.get(this);
    }
  };
  var CompartmentInstance = class {
    constructor(compartment, inner) {
      this.compartment = compartment;
      this.inner = inner;
    }
  };
  var Configuration = class {
    constructor(base2, compartments, dynamicSlots, address, staticValues, facets) {
      this.base = base2;
      this.compartments = compartments;
      this.dynamicSlots = dynamicSlots;
      this.address = address;
      this.staticValues = staticValues;
      this.facets = facets;
      this.statusTemplate = [];
      while (this.statusTemplate.length < dynamicSlots.length)
        this.statusTemplate.push(0);
    }
    staticFacet(facet) {
      let addr = this.address[facet.id];
      return addr == null ? facet.default : this.staticValues[addr >> 1];
    }
    static resolve(base2, compartments, oldState) {
      let fields = [];
      let facets = /* @__PURE__ */ Object.create(null);
      let newCompartments = /* @__PURE__ */ new Map();
      for (let ext of flatten(base2, compartments, newCompartments)) {
        if (ext instanceof StateField)
          fields.push(ext);
        else
          (facets[ext.facet.id] || (facets[ext.facet.id] = [])).push(ext);
      }
      let address = /* @__PURE__ */ Object.create(null);
      let staticValues = [];
      let dynamicSlots = [];
      for (let field of fields) {
        address[field.id] = dynamicSlots.length << 1;
        dynamicSlots.push((a2) => field.slot(a2));
      }
      let oldFacets = oldState === null || oldState === void 0 ? void 0 : oldState.config.facets;
      for (let id in facets) {
        let providers = facets[id], facet = providers[0].facet;
        let oldProviders = oldFacets && oldFacets[id] || [];
        if (providers.every((p2) => p2.type == 0)) {
          address[facet.id] = staticValues.length << 1 | 1;
          if (sameArray(oldProviders, providers)) {
            staticValues.push(oldState.facet(facet));
          } else {
            let value2 = facet.combine(providers.map((p2) => p2.value));
            staticValues.push(oldState && facet.compare(value2, oldState.facet(facet)) ? oldState.facet(facet) : value2);
          }
        } else {
          for (let p2 of providers) {
            if (p2.type == 0) {
              address[p2.id] = staticValues.length << 1 | 1;
              staticValues.push(p2.value);
            } else {
              address[p2.id] = dynamicSlots.length << 1;
              dynamicSlots.push((a2) => p2.dynamicSlot(a2));
            }
          }
          address[facet.id] = dynamicSlots.length << 1;
          dynamicSlots.push((a2) => dynamicFacetSlot(a2, facet, providers));
        }
      }
      let dynamic = dynamicSlots.map((f) => f(address));
      return new Configuration(base2, newCompartments, dynamic, address, staticValues, facets);
    }
  };
  function flatten(extension, compartments, newCompartments) {
    let result = [[], [], [], [], []];
    let seen = /* @__PURE__ */ new Map();
    function inner(ext, prec2) {
      let known = seen.get(ext);
      if (known != null) {
        if (known <= prec2)
          return;
        let found = result[known].indexOf(ext);
        if (found > -1)
          result[known].splice(found, 1);
        if (ext instanceof CompartmentInstance)
          newCompartments.delete(ext.compartment);
      }
      seen.set(ext, prec2);
      if (Array.isArray(ext)) {
        for (let e of ext)
          inner(e, prec2);
      } else if (ext instanceof CompartmentInstance) {
        if (newCompartments.has(ext.compartment))
          throw new RangeError(`Duplicate use of compartment in extensions`);
        let content2 = compartments.get(ext.compartment) || ext.inner;
        newCompartments.set(ext.compartment, content2);
        inner(content2, prec2);
      } else if (ext instanceof PrecExtension) {
        inner(ext.inner, ext.prec);
      } else if (ext instanceof StateField) {
        result[prec2].push(ext);
        if (ext.provides)
          inner(ext.provides, prec2);
      } else if (ext instanceof FacetProvider) {
        result[prec2].push(ext);
        if (ext.facet.extensions)
          inner(ext.facet.extensions, prec2);
      } else {
        let content2 = ext.extension;
        if (!content2)
          throw new Error(`Unrecognized extension value in extension set (${ext}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
        inner(content2, prec2);
      }
    }
    inner(extension, Prec_.default);
    return result.reduce((a2, b2) => a2.concat(b2));
  }
  function ensureAddr(state, addr) {
    if (addr & 1)
      return 2;
    let idx = addr >> 1;
    let status = state.status[idx];
    if (status == 4)
      throw new Error("Cyclic dependency between fields and/or facets");
    if (status & 2)
      return status;
    state.status[idx] = 4;
    let changed = state.computeSlot(state, state.config.dynamicSlots[idx]);
    return state.status[idx] = 2 | changed;
  }
  function getAddr(state, addr) {
    return addr & 1 ? state.config.staticValues[addr >> 1] : state.values[addr >> 1];
  }
  var languageData = /* @__PURE__ */ Facet.define();
  var allowMultipleSelections = /* @__PURE__ */ Facet.define({
    combine: (values) => values.some((v) => v),
    static: true
  });
  var lineSeparator = /* @__PURE__ */ Facet.define({
    combine: (values) => values.length ? values[0] : void 0,
    static: true
  });
  var changeFilter = /* @__PURE__ */ Facet.define();
  var transactionFilter = /* @__PURE__ */ Facet.define();
  var transactionExtender = /* @__PURE__ */ Facet.define();
  var readOnly = /* @__PURE__ */ Facet.define({
    combine: (values) => values.length ? values[0] : false
  });
  var Annotation = class {
    constructor(type2, value2) {
      this.type = type2;
      this.value = value2;
    }
    static define() {
      return new AnnotationType();
    }
  };
  var AnnotationType = class {
    of(value2) {
      return new Annotation(this, value2);
    }
  };
  var StateEffectType = class {
    constructor(map) {
      this.map = map;
    }
    of(value2) {
      return new StateEffect(this, value2);
    }
  };
  var StateEffect = class {
    constructor(type2, value2) {
      this.type = type2;
      this.value = value2;
    }
    map(mapping) {
      let mapped = this.type.map(this.value, mapping);
      return mapped === void 0 ? void 0 : mapped == this.value ? this : new StateEffect(this.type, mapped);
    }
    is(type2) {
      return this.type == type2;
    }
    static define(spec = {}) {
      return new StateEffectType(spec.map || ((v) => v));
    }
    static mapEffects(effects, mapping) {
      if (!effects.length)
        return effects;
      let result = [];
      for (let effect of effects) {
        let mapped = effect.map(mapping);
        if (mapped)
          result.push(mapped);
      }
      return result;
    }
  };
  StateEffect.reconfigure = /* @__PURE__ */ StateEffect.define();
  StateEffect.appendConfig = /* @__PURE__ */ StateEffect.define();
  var Transaction = class {
    constructor(startState, changes, selection, effects, annotations, scrollIntoView3) {
      this.startState = startState;
      this.changes = changes;
      this.selection = selection;
      this.effects = effects;
      this.annotations = annotations;
      this.scrollIntoView = scrollIntoView3;
      this._doc = null;
      this._state = null;
      if (selection)
        checkSelection(selection, changes.newLength);
      if (!annotations.some((a2) => a2.type == Transaction.time))
        this.annotations = annotations.concat(Transaction.time.of(Date.now()));
    }
    static create(startState, changes, selection, effects, annotations, scrollIntoView3) {
      return new Transaction(startState, changes, selection, effects, annotations, scrollIntoView3);
    }
    get newDoc() {
      return this._doc || (this._doc = this.changes.apply(this.startState.doc));
    }
    get newSelection() {
      return this.selection || this.startState.selection.map(this.changes);
    }
    get state() {
      if (!this._state)
        this.startState.applyTransaction(this);
      return this._state;
    }
    annotation(type2) {
      for (let ann of this.annotations)
        if (ann.type == type2)
          return ann.value;
      return void 0;
    }
    get docChanged() {
      return !this.changes.empty;
    }
    get reconfigured() {
      return this.startState.config != this.state.config;
    }
    isUserEvent(event) {
      let e = this.annotation(Transaction.userEvent);
      return !!(e && (e == event || e.length > event.length && e.slice(0, event.length) == event && e[event.length] == "."));
    }
  };
  Transaction.time = /* @__PURE__ */ Annotation.define();
  Transaction.userEvent = /* @__PURE__ */ Annotation.define();
  Transaction.addToHistory = /* @__PURE__ */ Annotation.define();
  Transaction.remote = /* @__PURE__ */ Annotation.define();
  function joinRanges(a2, b2) {
    let result = [];
    for (let iA = 0, iB = 0; ; ) {
      let from, to2;
      if (iA < a2.length && (iB == b2.length || b2[iB] >= a2[iA])) {
        from = a2[iA++];
        to2 = a2[iA++];
      } else if (iB < b2.length) {
        from = b2[iB++];
        to2 = b2[iB++];
      } else
        return result;
      if (!result.length || result[result.length - 1] < from)
        result.push(from, to2);
      else if (result[result.length - 1] < to2)
        result[result.length - 1] = to2;
    }
  }
  function mergeTransaction(a2, b2, sequential) {
    var _a2;
    let mapForA, mapForB, changes;
    if (sequential) {
      mapForA = b2.changes;
      mapForB = ChangeSet.empty(b2.changes.length);
      changes = a2.changes.compose(b2.changes);
    } else {
      mapForA = b2.changes.map(a2.changes);
      mapForB = a2.changes.mapDesc(b2.changes, true);
      changes = a2.changes.compose(mapForA);
    }
    return {
      changes,
      selection: b2.selection ? b2.selection.map(mapForB) : (_a2 = a2.selection) === null || _a2 === void 0 ? void 0 : _a2.map(mapForA),
      effects: StateEffect.mapEffects(a2.effects, mapForA).concat(StateEffect.mapEffects(b2.effects, mapForB)),
      annotations: a2.annotations.length ? a2.annotations.concat(b2.annotations) : b2.annotations,
      scrollIntoView: a2.scrollIntoView || b2.scrollIntoView
    };
  }
  function resolveTransactionInner(state, spec, docSize) {
    let sel = spec.selection, annotations = asArray(spec.annotations);
    if (spec.userEvent)
      annotations = annotations.concat(Transaction.userEvent.of(spec.userEvent));
    return {
      changes: spec.changes instanceof ChangeSet ? spec.changes : ChangeSet.of(spec.changes || [], docSize, state.facet(lineSeparator)),
      selection: sel && (sel instanceof EditorSelection ? sel : EditorSelection.single(sel.anchor, sel.head)),
      effects: asArray(spec.effects),
      annotations,
      scrollIntoView: !!spec.scrollIntoView
    };
  }
  function resolveTransaction(state, specs, filter) {
    let s = resolveTransactionInner(state, specs.length ? specs[0] : {}, state.doc.length);
    if (specs.length && specs[0].filter === false)
      filter = false;
    for (let i = 1; i < specs.length; i++) {
      if (specs[i].filter === false)
        filter = false;
      let seq = !!specs[i].sequential;
      s = mergeTransaction(s, resolveTransactionInner(state, specs[i], seq ? s.changes.newLength : state.doc.length), seq);
    }
    let tr = Transaction.create(state, s.changes, s.selection, s.effects, s.annotations, s.scrollIntoView);
    return extendTransaction(filter ? filterTransaction(tr) : tr);
  }
  function filterTransaction(tr) {
    let state = tr.startState;
    let result = true;
    for (let filter of state.facet(changeFilter)) {
      let value2 = filter(tr);
      if (value2 === false) {
        result = false;
        break;
      }
      if (Array.isArray(value2))
        result = result === true ? value2 : joinRanges(result, value2);
    }
    if (result !== true) {
      let changes, back;
      if (result === false) {
        back = tr.changes.invertedDesc;
        changes = ChangeSet.empty(state.doc.length);
      } else {
        let filtered = tr.changes.filter(result);
        changes = filtered.changes;
        back = filtered.filtered.invertedDesc;
      }
      tr = Transaction.create(state, changes, tr.selection && tr.selection.map(back), StateEffect.mapEffects(tr.effects, back), tr.annotations, tr.scrollIntoView);
    }
    let filters = state.facet(transactionFilter);
    for (let i = filters.length - 1; i >= 0; i--) {
      let filtered = filters[i](tr);
      if (filtered instanceof Transaction)
        tr = filtered;
      else if (Array.isArray(filtered) && filtered.length == 1 && filtered[0] instanceof Transaction)
        tr = filtered[0];
      else
        tr = resolveTransaction(state, asArray(filtered), false);
    }
    return tr;
  }
  function extendTransaction(tr) {
    let state = tr.startState, extenders = state.facet(transactionExtender), spec = tr;
    for (let i = extenders.length - 1; i >= 0; i--) {
      let extension = extenders[i](tr);
      if (extension && Object.keys(extension).length)
        spec = mergeTransaction(tr, resolveTransactionInner(state, extension, tr.changes.newLength), true);
    }
    return spec == tr ? tr : Transaction.create(state, tr.changes, tr.selection, spec.effects, spec.annotations, spec.scrollIntoView);
  }
  var none = [];
  function asArray(value2) {
    return value2 == null ? none : Array.isArray(value2) ? value2 : [value2];
  }
  var CharCategory = /* @__PURE__ */ function(CharCategory2) {
    CharCategory2[CharCategory2["Word"] = 0] = "Word";
    CharCategory2[CharCategory2["Space"] = 1] = "Space";
    CharCategory2[CharCategory2["Other"] = 2] = "Other";
    return CharCategory2;
  }(CharCategory || (CharCategory = {}));
  var nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
  var wordChar;
  try {
    wordChar = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
  } catch (_) {
  }
  function hasWordChar(str) {
    if (wordChar)
      return wordChar.test(str);
    for (let i = 0; i < str.length; i++) {
      let ch = str[i];
      if (/\w/.test(ch) || ch > "\x80" && (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch)))
        return true;
    }
    return false;
  }
  function makeCategorizer(wordChars) {
    return (char) => {
      if (!/\S/.test(char))
        return CharCategory.Space;
      if (hasWordChar(char))
        return CharCategory.Word;
      for (let i = 0; i < wordChars.length; i++)
        if (char.indexOf(wordChars[i]) > -1)
          return CharCategory.Word;
      return CharCategory.Other;
    };
  }
  var EditorState = class {
    constructor(config2, doc2, selection, values, computeSlot, tr) {
      this.config = config2;
      this.doc = doc2;
      this.selection = selection;
      this.values = values;
      this.status = config2.statusTemplate.slice();
      this.computeSlot = computeSlot;
      if (tr)
        tr._state = this;
      for (let i = 0; i < this.config.dynamicSlots.length; i++)
        ensureAddr(this, i << 1);
      this.computeSlot = null;
    }
    field(field, require2 = true) {
      let addr = this.config.address[field.id];
      if (addr == null) {
        if (require2)
          throw new RangeError("Field is not present in this state");
        return void 0;
      }
      ensureAddr(this, addr);
      return getAddr(this, addr);
    }
    update(...specs) {
      return resolveTransaction(this, specs, true);
    }
    applyTransaction(tr) {
      let conf = this.config, { base: base2, compartments } = conf;
      for (let effect of tr.effects) {
        if (effect.is(Compartment.reconfigure)) {
          if (conf) {
            compartments = /* @__PURE__ */ new Map();
            conf.compartments.forEach((val, key) => compartments.set(key, val));
            conf = null;
          }
          compartments.set(effect.value.compartment, effect.value.extension);
        } else if (effect.is(StateEffect.reconfigure)) {
          conf = null;
          base2 = effect.value;
        } else if (effect.is(StateEffect.appendConfig)) {
          conf = null;
          base2 = asArray(base2).concat(effect.value);
        }
      }
      let startValues;
      if (!conf) {
        conf = Configuration.resolve(base2, compartments, this);
        let intermediateState = new EditorState(conf, this.doc, this.selection, conf.dynamicSlots.map(() => null), (state, slot) => slot.reconfigure(state, this), null);
        startValues = intermediateState.values;
      } else {
        startValues = tr.startState.values.slice();
      }
      new EditorState(conf, tr.newDoc, tr.newSelection, startValues, (state, slot) => slot.update(state, tr), tr);
    }
    replaceSelection(text) {
      if (typeof text == "string")
        text = this.toText(text);
      return this.changeByRange((range2) => ({
        changes: { from: range2.from, to: range2.to, insert: text },
        range: EditorSelection.cursor(range2.from + text.length)
      }));
    }
    changeByRange(f) {
      let sel = this.selection;
      let result1 = f(sel.ranges[0]);
      let changes = this.changes(result1.changes), ranges = [result1.range];
      let effects = asArray(result1.effects);
      for (let i = 1; i < sel.ranges.length; i++) {
        let result = f(sel.ranges[i]);
        let newChanges = this.changes(result.changes), newMapped = newChanges.map(changes);
        for (let j = 0; j < i; j++)
          ranges[j] = ranges[j].map(newMapped);
        let mapBy = changes.mapDesc(newChanges, true);
        ranges.push(result.range.map(mapBy));
        changes = changes.compose(newMapped);
        effects = StateEffect.mapEffects(effects, newMapped).concat(StateEffect.mapEffects(asArray(result.effects), mapBy));
      }
      return {
        changes,
        selection: EditorSelection.create(ranges, sel.mainIndex),
        effects
      };
    }
    changes(spec = []) {
      if (spec instanceof ChangeSet)
        return spec;
      return ChangeSet.of(spec, this.doc.length, this.facet(EditorState.lineSeparator));
    }
    toText(string2) {
      return Text.of(string2.split(this.facet(EditorState.lineSeparator) || DefaultSplit));
    }
    sliceDoc(from = 0, to2 = this.doc.length) {
      return this.doc.sliceString(from, to2, this.lineBreak);
    }
    facet(facet) {
      let addr = this.config.address[facet.id];
      if (addr == null)
        return facet.default;
      ensureAddr(this, addr);
      return getAddr(this, addr);
    }
    toJSON(fields) {
      let result = {
        doc: this.sliceDoc(),
        selection: this.selection.toJSON()
      };
      if (fields)
        for (let prop in fields) {
          let value2 = fields[prop];
          if (value2 instanceof StateField)
            result[prop] = value2.spec.toJSON(this.field(fields[prop]), this);
        }
      return result;
    }
    static fromJSON(json, config2 = {}, fields) {
      if (!json || typeof json.doc != "string")
        throw new RangeError("Invalid JSON representation for EditorState");
      let fieldInit = [];
      if (fields)
        for (let prop in fields) {
          let field = fields[prop], value2 = json[prop];
          fieldInit.push(field.init((state) => field.spec.fromJSON(value2, state)));
        }
      return EditorState.create({
        doc: json.doc,
        selection: EditorSelection.fromJSON(json.selection),
        extensions: config2.extensions ? fieldInit.concat([config2.extensions]) : fieldInit
      });
    }
    static create(config2 = {}) {
      let configuration = Configuration.resolve(config2.extensions || [], /* @__PURE__ */ new Map());
      let doc2 = config2.doc instanceof Text ? config2.doc : Text.of((config2.doc || "").split(configuration.staticFacet(EditorState.lineSeparator) || DefaultSplit));
      let selection = !config2.selection ? EditorSelection.single(0) : config2.selection instanceof EditorSelection ? config2.selection : EditorSelection.single(config2.selection.anchor, config2.selection.head);
      checkSelection(selection, doc2.length);
      if (!configuration.staticFacet(allowMultipleSelections))
        selection = selection.asSingle();
      return new EditorState(configuration, doc2, selection, configuration.dynamicSlots.map(() => null), (state, slot) => slot.create(state), null);
    }
    get tabSize() {
      return this.facet(EditorState.tabSize);
    }
    get lineBreak() {
      return this.facet(EditorState.lineSeparator) || "\n";
    }
    get readOnly() {
      return this.facet(readOnly);
    }
    phrase(phrase2, ...insert2) {
      for (let map of this.facet(EditorState.phrases))
        if (Object.prototype.hasOwnProperty.call(map, phrase2)) {
          phrase2 = map[phrase2];
          break;
        }
      if (insert2.length)
        phrase2 = phrase2.replace(/\$(\$|\d*)/g, (m3, i) => {
          if (i == "$")
            return "$";
          let n2 = +(i || 1);
          return n2 > insert2.length ? m3 : insert2[n2 - 1];
        });
      return phrase2;
    }
    languageDataAt(name2, pos, side = -1) {
      let values = [];
      for (let provider of this.facet(languageData)) {
        for (let result of provider(this, pos, side)) {
          if (Object.prototype.hasOwnProperty.call(result, name2))
            values.push(result[name2]);
        }
      }
      return values;
    }
    charCategorizer(at) {
      return makeCategorizer(this.languageDataAt("wordChars", at).join(""));
    }
    wordAt(pos) {
      let { text, from, length } = this.doc.lineAt(pos);
      let cat = this.charCategorizer(pos);
      let start = pos - from, end = pos - from;
      while (start > 0) {
        let prev = findClusterBreak(text, start, false);
        if (cat(text.slice(prev, start)) != CharCategory.Word)
          break;
        start = prev;
      }
      while (end < length) {
        let next = findClusterBreak(text, end);
        if (cat(text.slice(end, next)) != CharCategory.Word)
          break;
        end = next;
      }
      return start == end ? null : EditorSelection.range(start + from, end + from);
    }
  };
  EditorState.allowMultipleSelections = allowMultipleSelections;
  EditorState.tabSize = /* @__PURE__ */ Facet.define({
    combine: (values) => values.length ? values[0] : 4
  });
  EditorState.lineSeparator = lineSeparator;
  EditorState.readOnly = readOnly;
  EditorState.phrases = /* @__PURE__ */ Facet.define({
    compare(a2, b2) {
      let kA = Object.keys(a2), kB = Object.keys(b2);
      return kA.length == kB.length && kA.every((k) => a2[k] == b2[k]);
    }
  });
  EditorState.languageData = languageData;
  EditorState.changeFilter = changeFilter;
  EditorState.transactionFilter = transactionFilter;
  EditorState.transactionExtender = transactionExtender;
  Compartment.reconfigure = /* @__PURE__ */ StateEffect.define();
  function combineConfig(configs, defaults4, combine = {}) {
    let result = {};
    for (let config2 of configs)
      for (let key of Object.keys(config2)) {
        let value2 = config2[key], current = result[key];
        if (current === void 0)
          result[key] = value2;
        else if (current === value2 || value2 === void 0)
          ;
        else if (Object.hasOwnProperty.call(combine, key))
          result[key] = combine[key](current, value2);
        else
          throw new Error("Config merge conflict for field " + key);
      }
    for (let key in defaults4)
      if (result[key] === void 0)
        result[key] = defaults4[key];
    return result;
  }
  var RangeValue = class {
    eq(other) {
      return this == other;
    }
    range(from, to2 = from) {
      return Range.create(from, to2, this);
    }
  };
  RangeValue.prototype.startSide = RangeValue.prototype.endSide = 0;
  RangeValue.prototype.point = false;
  RangeValue.prototype.mapMode = MapMode.TrackDel;
  var Range = class {
    constructor(from, to2, value2) {
      this.from = from;
      this.to = to2;
      this.value = value2;
    }
    static create(from, to2, value2) {
      return new Range(from, to2, value2);
    }
  };
  function cmpRange(a2, b2) {
    return a2.from - b2.from || a2.value.startSide - b2.value.startSide;
  }
  var Chunk = class {
    constructor(from, to2, value2, maxPoint) {
      this.from = from;
      this.to = to2;
      this.value = value2;
      this.maxPoint = maxPoint;
    }
    get length() {
      return this.to[this.to.length - 1];
    }
    findIndex(pos, side, end, startAt = 0) {
      let arr = end ? this.to : this.from;
      for (let lo = startAt, hi = arr.length; ; ) {
        if (lo == hi)
          return lo;
        let mid = lo + hi >> 1;
        let diff = arr[mid] - pos || (end ? this.value[mid].endSide : this.value[mid].startSide) - side;
        if (mid == lo)
          return diff >= 0 ? lo : hi;
        if (diff >= 0)
          hi = mid;
        else
          lo = mid + 1;
      }
    }
    between(offset, from, to2, f) {
      for (let i = this.findIndex(from, -1e9, true), e = this.findIndex(to2, 1e9, false, i); i < e; i++)
        if (f(this.from[i] + offset, this.to[i] + offset, this.value[i]) === false)
          return false;
    }
    map(offset, changes) {
      let value2 = [], from = [], to2 = [], newPos = -1, maxPoint = -1;
      for (let i = 0; i < this.value.length; i++) {
        let val = this.value[i], curFrom = this.from[i] + offset, curTo = this.to[i] + offset, newFrom, newTo;
        if (curFrom == curTo) {
          let mapped = changes.mapPos(curFrom, val.startSide, val.mapMode);
          if (mapped == null)
            continue;
          newFrom = newTo = mapped;
          if (val.startSide != val.endSide) {
            newTo = changes.mapPos(curFrom, val.endSide);
            if (newTo < newFrom)
              continue;
          }
        } else {
          newFrom = changes.mapPos(curFrom, val.startSide);
          newTo = changes.mapPos(curTo, val.endSide);
          if (newFrom > newTo || newFrom == newTo && val.startSide > 0 && val.endSide <= 0)
            continue;
        }
        if ((newTo - newFrom || val.endSide - val.startSide) < 0)
          continue;
        if (newPos < 0)
          newPos = newFrom;
        if (val.point)
          maxPoint = Math.max(maxPoint, newTo - newFrom);
        value2.push(val);
        from.push(newFrom - newPos);
        to2.push(newTo - newPos);
      }
      return { mapped: value2.length ? new Chunk(from, to2, value2, maxPoint) : null, pos: newPos };
    }
  };
  var RangeSet = class {
    constructor(chunkPos, chunk, nextLayer, maxPoint) {
      this.chunkPos = chunkPos;
      this.chunk = chunk;
      this.nextLayer = nextLayer;
      this.maxPoint = maxPoint;
    }
    static create(chunkPos, chunk, nextLayer, maxPoint) {
      return new RangeSet(chunkPos, chunk, nextLayer, maxPoint);
    }
    get length() {
      let last2 = this.chunk.length - 1;
      return last2 < 0 ? 0 : Math.max(this.chunkEnd(last2), this.nextLayer.length);
    }
    get size() {
      if (this.isEmpty)
        return 0;
      let size = this.nextLayer.size;
      for (let chunk of this.chunk)
        size += chunk.value.length;
      return size;
    }
    chunkEnd(index) {
      return this.chunkPos[index] + this.chunk[index].length;
    }
    update(updateSpec) {
      let { add: add2 = [], sort = false, filterFrom = 0, filterTo = this.length } = updateSpec;
      let filter = updateSpec.filter;
      if (add2.length == 0 && !filter)
        return this;
      if (sort)
        add2 = add2.slice().sort(cmpRange);
      if (this.isEmpty)
        return add2.length ? RangeSet.of(add2) : this;
      let cur2 = new LayerCursor(this, null, -1).goto(0), i = 0, spill = [];
      let builder = new RangeSetBuilder();
      while (cur2.value || i < add2.length) {
        if (i < add2.length && (cur2.from - add2[i].from || cur2.startSide - add2[i].value.startSide) >= 0) {
          let range2 = add2[i++];
          if (!builder.addInner(range2.from, range2.to, range2.value))
            spill.push(range2);
        } else if (cur2.rangeIndex == 1 && cur2.chunkIndex < this.chunk.length && (i == add2.length || this.chunkEnd(cur2.chunkIndex) < add2[i].from) && (!filter || filterFrom > this.chunkEnd(cur2.chunkIndex) || filterTo < this.chunkPos[cur2.chunkIndex]) && builder.addChunk(this.chunkPos[cur2.chunkIndex], this.chunk[cur2.chunkIndex])) {
          cur2.nextChunk();
        } else {
          if (!filter || filterFrom > cur2.to || filterTo < cur2.from || filter(cur2.from, cur2.to, cur2.value)) {
            if (!builder.addInner(cur2.from, cur2.to, cur2.value))
              spill.push(Range.create(cur2.from, cur2.to, cur2.value));
          }
          cur2.next();
        }
      }
      return builder.finishInner(this.nextLayer.isEmpty && !spill.length ? RangeSet.empty : this.nextLayer.update({ add: spill, filter, filterFrom, filterTo }));
    }
    map(changes) {
      if (changes.empty || this.isEmpty)
        return this;
      let chunks = [], chunkPos = [], maxPoint = -1;
      for (let i = 0; i < this.chunk.length; i++) {
        let start = this.chunkPos[i], chunk = this.chunk[i];
        let touch = changes.touchesRange(start, start + chunk.length);
        if (touch === false) {
          maxPoint = Math.max(maxPoint, chunk.maxPoint);
          chunks.push(chunk);
          chunkPos.push(changes.mapPos(start));
        } else if (touch === true) {
          let { mapped, pos } = chunk.map(start, changes);
          if (mapped) {
            maxPoint = Math.max(maxPoint, mapped.maxPoint);
            chunks.push(mapped);
            chunkPos.push(pos);
          }
        }
      }
      let next = this.nextLayer.map(changes);
      return chunks.length == 0 ? next : new RangeSet(chunkPos, chunks, next || RangeSet.empty, maxPoint);
    }
    between(from, to2, f) {
      if (this.isEmpty)
        return;
      for (let i = 0; i < this.chunk.length; i++) {
        let start = this.chunkPos[i], chunk = this.chunk[i];
        if (to2 >= start && from <= start + chunk.length && chunk.between(start, from - start, to2 - start, f) === false)
          return;
      }
      this.nextLayer.between(from, to2, f);
    }
    iter(from = 0) {
      return HeapCursor.from([this]).goto(from);
    }
    get isEmpty() {
      return this.nextLayer == this;
    }
    static iter(sets, from = 0) {
      return HeapCursor.from(sets).goto(from);
    }
    static compare(oldSets, newSets, textDiff, comparator, minPointSize = -1) {
      let a2 = oldSets.filter((set2) => set2.maxPoint > 0 || !set2.isEmpty && set2.maxPoint >= minPointSize);
      let b2 = newSets.filter((set2) => set2.maxPoint > 0 || !set2.isEmpty && set2.maxPoint >= minPointSize);
      let sharedChunks = findSharedChunks(a2, b2, textDiff);
      let sideA = new SpanCursor(a2, sharedChunks, minPointSize);
      let sideB = new SpanCursor(b2, sharedChunks, minPointSize);
      textDiff.iterGaps((fromA, fromB, length) => compare(sideA, fromA, sideB, fromB, length, comparator));
      if (textDiff.empty && textDiff.length == 0)
        compare(sideA, 0, sideB, 0, 0, comparator);
    }
    static eq(oldSets, newSets, from = 0, to2) {
      if (to2 == null)
        to2 = 1e9;
      let a2 = oldSets.filter((set2) => !set2.isEmpty && newSets.indexOf(set2) < 0);
      let b2 = newSets.filter((set2) => !set2.isEmpty && oldSets.indexOf(set2) < 0);
      if (a2.length != b2.length)
        return false;
      if (!a2.length)
        return true;
      let sharedChunks = findSharedChunks(a2, b2);
      let sideA = new SpanCursor(a2, sharedChunks, 0).goto(from), sideB = new SpanCursor(b2, sharedChunks, 0).goto(from);
      for (; ; ) {
        if (sideA.to != sideB.to || !sameValues(sideA.active, sideB.active) || sideA.point && (!sideB.point || !sideA.point.eq(sideB.point)))
          return false;
        if (sideA.to > to2)
          return true;
        sideA.next();
        sideB.next();
      }
    }
    static spans(sets, from, to2, iterator, minPointSize = -1) {
      let cursor = new SpanCursor(sets, null, minPointSize).goto(from), pos = from;
      let open = cursor.openStart;
      for (; ; ) {
        let curTo = Math.min(cursor.to, to2);
        if (cursor.point) {
          iterator.point(pos, curTo, cursor.point, cursor.activeForPoint(cursor.to), open, cursor.pointRank);
          open = cursor.openEnd(curTo) + (cursor.to > curTo ? 1 : 0);
        } else if (curTo > pos) {
          iterator.span(pos, curTo, cursor.active, open);
          open = cursor.openEnd(curTo);
        }
        if (cursor.to > to2)
          break;
        pos = cursor.to;
        cursor.next();
      }
      return open;
    }
    static of(ranges, sort = false) {
      let build = new RangeSetBuilder();
      for (let range2 of ranges instanceof Range ? [ranges] : sort ? lazySort(ranges) : ranges)
        build.add(range2.from, range2.to, range2.value);
      return build.finish();
    }
  };
  RangeSet.empty = /* @__PURE__ */ new RangeSet([], [], null, -1);
  function lazySort(ranges) {
    if (ranges.length > 1)
      for (let prev = ranges[0], i = 1; i < ranges.length; i++) {
        let cur2 = ranges[i];
        if (cmpRange(prev, cur2) > 0)
          return ranges.slice().sort(cmpRange);
        prev = cur2;
      }
    return ranges;
  }
  RangeSet.empty.nextLayer = RangeSet.empty;
  var RangeSetBuilder = class {
    constructor() {
      this.chunks = [];
      this.chunkPos = [];
      this.chunkStart = -1;
      this.last = null;
      this.lastFrom = -1e9;
      this.lastTo = -1e9;
      this.from = [];
      this.to = [];
      this.value = [];
      this.maxPoint = -1;
      this.setMaxPoint = -1;
      this.nextLayer = null;
    }
    finishChunk(newArrays) {
      this.chunks.push(new Chunk(this.from, this.to, this.value, this.maxPoint));
      this.chunkPos.push(this.chunkStart);
      this.chunkStart = -1;
      this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint);
      this.maxPoint = -1;
      if (newArrays) {
        this.from = [];
        this.to = [];
        this.value = [];
      }
    }
    add(from, to2, value2) {
      if (!this.addInner(from, to2, value2))
        (this.nextLayer || (this.nextLayer = new RangeSetBuilder())).add(from, to2, value2);
    }
    addInner(from, to2, value2) {
      let diff = from - this.lastTo || value2.startSide - this.last.endSide;
      if (diff <= 0 && (from - this.lastFrom || value2.startSide - this.last.startSide) < 0)
        throw new Error("Ranges must be added sorted by `from` position and `startSide`");
      if (diff < 0)
        return false;
      if (this.from.length == 250)
        this.finishChunk(true);
      if (this.chunkStart < 0)
        this.chunkStart = from;
      this.from.push(from - this.chunkStart);
      this.to.push(to2 - this.chunkStart);
      this.last = value2;
      this.lastFrom = from;
      this.lastTo = to2;
      this.value.push(value2);
      if (value2.point)
        this.maxPoint = Math.max(this.maxPoint, to2 - from);
      return true;
    }
    addChunk(from, chunk) {
      if ((from - this.lastTo || chunk.value[0].startSide - this.last.endSide) < 0)
        return false;
      if (this.from.length)
        this.finishChunk(true);
      this.setMaxPoint = Math.max(this.setMaxPoint, chunk.maxPoint);
      this.chunks.push(chunk);
      this.chunkPos.push(from);
      let last2 = chunk.value.length - 1;
      this.last = chunk.value[last2];
      this.lastFrom = chunk.from[last2] + from;
      this.lastTo = chunk.to[last2] + from;
      return true;
    }
    finish() {
      return this.finishInner(RangeSet.empty);
    }
    finishInner(next) {
      if (this.from.length)
        this.finishChunk(false);
      if (this.chunks.length == 0)
        return next;
      let result = RangeSet.create(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(next) : next, this.setMaxPoint);
      this.from = null;
      return result;
    }
  };
  function findSharedChunks(a2, b2, textDiff) {
    let inA = /* @__PURE__ */ new Map();
    for (let set2 of a2)
      for (let i = 0; i < set2.chunk.length; i++)
        if (set2.chunk[i].maxPoint <= 0)
          inA.set(set2.chunk[i], set2.chunkPos[i]);
    let shared = /* @__PURE__ */ new Set();
    for (let set2 of b2)
      for (let i = 0; i < set2.chunk.length; i++) {
        let known = inA.get(set2.chunk[i]);
        if (known != null && (textDiff ? textDiff.mapPos(known) : known) == set2.chunkPos[i] && !(textDiff === null || textDiff === void 0 ? void 0 : textDiff.touchesRange(known, known + set2.chunk[i].length)))
          shared.add(set2.chunk[i]);
      }
    return shared;
  }
  var LayerCursor = class {
    constructor(layer, skip, minPoint, rank = 0) {
      this.layer = layer;
      this.skip = skip;
      this.minPoint = minPoint;
      this.rank = rank;
    }
    get startSide() {
      return this.value ? this.value.startSide : 0;
    }
    get endSide() {
      return this.value ? this.value.endSide : 0;
    }
    goto(pos, side = -1e9) {
      this.chunkIndex = this.rangeIndex = 0;
      this.gotoInner(pos, side, false);
      return this;
    }
    gotoInner(pos, side, forward) {
      while (this.chunkIndex < this.layer.chunk.length) {
        let next = this.layer.chunk[this.chunkIndex];
        if (!(this.skip && this.skip.has(next) || this.layer.chunkEnd(this.chunkIndex) < pos || next.maxPoint < this.minPoint))
          break;
        this.chunkIndex++;
        forward = false;
      }
      if (this.chunkIndex < this.layer.chunk.length) {
        let rangeIndex = this.layer.chunk[this.chunkIndex].findIndex(pos - this.layer.chunkPos[this.chunkIndex], side, true);
        if (!forward || this.rangeIndex < rangeIndex)
          this.setRangeIndex(rangeIndex);
      }
      this.next();
    }
    forward(pos, side) {
      if ((this.to - pos || this.endSide - side) < 0)
        this.gotoInner(pos, side, true);
    }
    next() {
      for (; ; ) {
        if (this.chunkIndex == this.layer.chunk.length) {
          this.from = this.to = 1e9;
          this.value = null;
          break;
        } else {
          let chunkPos = this.layer.chunkPos[this.chunkIndex], chunk = this.layer.chunk[this.chunkIndex];
          let from = chunkPos + chunk.from[this.rangeIndex];
          this.from = from;
          this.to = chunkPos + chunk.to[this.rangeIndex];
          this.value = chunk.value[this.rangeIndex];
          this.setRangeIndex(this.rangeIndex + 1);
          if (this.minPoint < 0 || this.value.point && this.to - this.from >= this.minPoint)
            break;
        }
      }
    }
    setRangeIndex(index) {
      if (index == this.layer.chunk[this.chunkIndex].value.length) {
        this.chunkIndex++;
        if (this.skip) {
          while (this.chunkIndex < this.layer.chunk.length && this.skip.has(this.layer.chunk[this.chunkIndex]))
            this.chunkIndex++;
        }
        this.rangeIndex = 0;
      } else {
        this.rangeIndex = index;
      }
    }
    nextChunk() {
      this.chunkIndex++;
      this.rangeIndex = 0;
      this.next();
    }
    compare(other) {
      return this.from - other.from || this.startSide - other.startSide || this.rank - other.rank || this.to - other.to || this.endSide - other.endSide;
    }
  };
  var HeapCursor = class {
    constructor(heap) {
      this.heap = heap;
    }
    static from(sets, skip = null, minPoint = -1) {
      let heap = [];
      for (let i = 0; i < sets.length; i++) {
        for (let cur2 = sets[i]; !cur2.isEmpty; cur2 = cur2.nextLayer) {
          if (cur2.maxPoint >= minPoint)
            heap.push(new LayerCursor(cur2, skip, minPoint, i));
        }
      }
      return heap.length == 1 ? heap[0] : new HeapCursor(heap);
    }
    get startSide() {
      return this.value ? this.value.startSide : 0;
    }
    goto(pos, side = -1e9) {
      for (let cur2 of this.heap)
        cur2.goto(pos, side);
      for (let i = this.heap.length >> 1; i >= 0; i--)
        heapBubble(this.heap, i);
      this.next();
      return this;
    }
    forward(pos, side) {
      for (let cur2 of this.heap)
        cur2.forward(pos, side);
      for (let i = this.heap.length >> 1; i >= 0; i--)
        heapBubble(this.heap, i);
      if ((this.to - pos || this.value.endSide - side) < 0)
        this.next();
    }
    next() {
      if (this.heap.length == 0) {
        this.from = this.to = 1e9;
        this.value = null;
        this.rank = -1;
      } else {
        let top2 = this.heap[0];
        this.from = top2.from;
        this.to = top2.to;
        this.value = top2.value;
        this.rank = top2.rank;
        if (top2.value)
          top2.next();
        heapBubble(this.heap, 0);
      }
    }
  };
  function heapBubble(heap, index) {
    for (let cur2 = heap[index]; ; ) {
      let childIndex = (index << 1) + 1;
      if (childIndex >= heap.length)
        break;
      let child = heap[childIndex];
      if (childIndex + 1 < heap.length && child.compare(heap[childIndex + 1]) >= 0) {
        child = heap[childIndex + 1];
        childIndex++;
      }
      if (cur2.compare(child) < 0)
        break;
      heap[childIndex] = cur2;
      heap[index] = child;
      index = childIndex;
    }
  }
  var SpanCursor = class {
    constructor(sets, skip, minPoint) {
      this.minPoint = minPoint;
      this.active = [];
      this.activeTo = [];
      this.activeRank = [];
      this.minActive = -1;
      this.point = null;
      this.pointFrom = 0;
      this.pointRank = 0;
      this.to = -1e9;
      this.endSide = 0;
      this.openStart = -1;
      this.cursor = HeapCursor.from(sets, skip, minPoint);
    }
    goto(pos, side = -1e9) {
      this.cursor.goto(pos, side);
      this.active.length = this.activeTo.length = this.activeRank.length = 0;
      this.minActive = -1;
      this.to = pos;
      this.endSide = side;
      this.openStart = -1;
      this.next();
      return this;
    }
    forward(pos, side) {
      while (this.minActive > -1 && (this.activeTo[this.minActive] - pos || this.active[this.minActive].endSide - side) < 0)
        this.removeActive(this.minActive);
      this.cursor.forward(pos, side);
    }
    removeActive(index) {
      remove(this.active, index);
      remove(this.activeTo, index);
      remove(this.activeRank, index);
      this.minActive = findMinIndex(this.active, this.activeTo);
    }
    addActive(trackOpen) {
      let i = 0, { value: value2, to: to2, rank } = this.cursor;
      while (i < this.activeRank.length && this.activeRank[i] <= rank)
        i++;
      insert(this.active, i, value2);
      insert(this.activeTo, i, to2);
      insert(this.activeRank, i, rank);
      if (trackOpen)
        insert(trackOpen, i, this.cursor.from);
      this.minActive = findMinIndex(this.active, this.activeTo);
    }
    next() {
      let from = this.to, wasPoint = this.point;
      this.point = null;
      let trackOpen = this.openStart < 0 ? [] : null, trackExtra = 0;
      for (; ; ) {
        let a2 = this.minActive;
        if (a2 > -1 && (this.activeTo[a2] - this.cursor.from || this.active[a2].endSide - this.cursor.startSide) < 0) {
          if (this.activeTo[a2] > from) {
            this.to = this.activeTo[a2];
            this.endSide = this.active[a2].endSide;
            break;
          }
          this.removeActive(a2);
          if (trackOpen)
            remove(trackOpen, a2);
        } else if (!this.cursor.value) {
          this.to = this.endSide = 1e9;
          break;
        } else if (this.cursor.from > from) {
          this.to = this.cursor.from;
          this.endSide = this.cursor.startSide;
          break;
        } else {
          let nextVal = this.cursor.value;
          if (!nextVal.point) {
            this.addActive(trackOpen);
            this.cursor.next();
          } else if (wasPoint && this.cursor.to == this.to && this.cursor.from < this.cursor.to) {
            this.cursor.next();
          } else {
            this.point = nextVal;
            this.pointFrom = this.cursor.from;
            this.pointRank = this.cursor.rank;
            this.to = this.cursor.to;
            this.endSide = nextVal.endSide;
            if (this.cursor.from < from)
              trackExtra = 1;
            this.cursor.next();
            this.forward(this.to, this.endSide);
            break;
          }
        }
      }
      if (trackOpen) {
        let openStart = 0;
        while (openStart < trackOpen.length && trackOpen[openStart] < from)
          openStart++;
        this.openStart = openStart + trackExtra;
      }
    }
    activeForPoint(to2) {
      if (!this.active.length)
        return this.active;
      let active = [];
      for (let i = this.active.length - 1; i >= 0; i--) {
        if (this.activeRank[i] < this.pointRank)
          break;
        if (this.activeTo[i] > to2 || this.activeTo[i] == to2 && this.active[i].endSide >= this.point.endSide)
          active.push(this.active[i]);
      }
      return active.reverse();
    }
    openEnd(to2) {
      let open = 0;
      for (let i = this.activeTo.length - 1; i >= 0 && this.activeTo[i] > to2; i--)
        open++;
      return open;
    }
  };
  function compare(a2, startA, b2, startB, length, comparator) {
    a2.goto(startA);
    b2.goto(startB);
    let endB = startB + length;
    let pos = startB, dPos = startB - startA;
    for (; ; ) {
      let diff = a2.to + dPos - b2.to || a2.endSide - b2.endSide;
      let end = diff < 0 ? a2.to + dPos : b2.to, clipEnd = Math.min(end, endB);
      if (a2.point || b2.point) {
        if (!(a2.point && b2.point && (a2.point == b2.point || a2.point.eq(b2.point)) && sameValues(a2.activeForPoint(a2.to + dPos), b2.activeForPoint(b2.to))))
          comparator.comparePoint(pos, clipEnd, a2.point, b2.point);
      } else {
        if (clipEnd > pos && !sameValues(a2.active, b2.active))
          comparator.compareRange(pos, clipEnd, a2.active, b2.active);
      }
      if (end > endB)
        break;
      pos = end;
      if (diff <= 0)
        a2.next();
      if (diff >= 0)
        b2.next();
    }
  }
  function sameValues(a2, b2) {
    if (a2.length != b2.length)
      return false;
    for (let i = 0; i < a2.length; i++)
      if (a2[i] != b2[i] && !a2[i].eq(b2[i]))
        return false;
    return true;
  }
  function remove(array, index) {
    for (let i = index, e = array.length - 1; i < e; i++)
      array[i] = array[i + 1];
    array.pop();
  }
  function insert(array, index, value2) {
    for (let i = array.length - 1; i >= index; i--)
      array[i + 1] = array[i];
    array[index] = value2;
  }
  function findMinIndex(value2, array) {
    let found = -1, foundPos = 1e9;
    for (let i = 0; i < array.length; i++)
      if ((array[i] - foundPos || value2[i].endSide - value2[found].endSide) < 0) {
        found = i;
        foundPos = array[i];
      }
    return found;
  }
  function countColumn(string2, tabSize, to2 = string2.length) {
    let n2 = 0;
    for (let i = 0; i < to2; ) {
      if (string2.charCodeAt(i) == 9) {
        n2 += tabSize - n2 % tabSize;
        i++;
      } else {
        n2++;
        i = findClusterBreak(string2, i);
      }
    }
    return n2;
  }
  function findColumn(string2, col, tabSize, strict) {
    for (let i = 0, n2 = 0; ; ) {
      if (n2 >= col)
        return i;
      if (i == string2.length)
        break;
      n2 += string2.charCodeAt(i) == 9 ? tabSize - n2 % tabSize : 1;
      i = findClusterBreak(string2, i);
    }
    return strict === true ? -1 : string2.length;
  }

  // node_modules/style-mod/src/style-mod.js
  var C = "\u037C";
  var COUNT = typeof Symbol == "undefined" ? "__" + C : Symbol.for(C);
  var SET = typeof Symbol == "undefined" ? "__styleSet" + Math.floor(Math.random() * 1e8) : Symbol("styleSet");
  var top = typeof globalThis != "undefined" ? globalThis : typeof window != "undefined" ? window : {};
  var StyleModule = class {
    constructor(spec, options) {
      this.rules = [];
      let { finish } = options || {};
      function splitSelector(selector) {
        return /^@/.test(selector) ? [selector] : selector.split(/,\s*/);
      }
      function render2(selectors2, spec2, target, isKeyframes) {
        let local = [], isAt = /^@(\w+)\b/.exec(selectors2[0]), keyframes = isAt && isAt[1] == "keyframes";
        if (isAt && spec2 == null)
          return target.push(selectors2[0] + ";");
        for (let prop in spec2) {
          let value2 = spec2[prop];
          if (/&/.test(prop)) {
            render2(
              prop.split(/,\s*/).map((part) => selectors2.map((sel) => part.replace(/&/, sel))).reduce((a2, b2) => a2.concat(b2)),
              value2,
              target
            );
          } else if (value2 && typeof value2 == "object") {
            if (!isAt)
              throw new RangeError("The value of a property (" + prop + ") should be a primitive value.");
            render2(splitSelector(prop), value2, local, keyframes);
          } else if (value2 != null) {
            local.push(prop.replace(/_.*/, "").replace(/[A-Z]/g, (l) => "-" + l.toLowerCase()) + ": " + value2 + ";");
          }
        }
        if (local.length || keyframes) {
          target.push((finish && !isAt && !isKeyframes ? selectors2.map(finish) : selectors2).join(", ") + " {" + local.join(" ") + "}");
        }
      }
      for (let prop in spec)
        render2(splitSelector(prop), spec[prop], this.rules);
    }
    getRules() {
      return this.rules.join("\n");
    }
    static newName() {
      let id = top[COUNT] || 1;
      top[COUNT] = id + 1;
      return C + id.toString(36);
    }
    static mount(root, modules) {
      (root[SET] || new StyleSet(root)).mount(Array.isArray(modules) ? modules : [modules]);
    }
  };
  var adoptedSet = null;
  var StyleSet = class {
    constructor(root) {
      if (!root.head && root.adoptedStyleSheets && typeof CSSStyleSheet != "undefined") {
        if (adoptedSet) {
          root.adoptedStyleSheets = [adoptedSet.sheet].concat(root.adoptedStyleSheets);
          return root[SET] = adoptedSet;
        }
        this.sheet = new CSSStyleSheet();
        root.adoptedStyleSheets = [this.sheet].concat(root.adoptedStyleSheets);
        adoptedSet = this;
      } else {
        this.styleTag = (root.ownerDocument || root).createElement("style");
        let target = root.head || root;
        target.insertBefore(this.styleTag, target.firstChild);
      }
      this.modules = [];
      root[SET] = this;
    }
    mount(modules) {
      let sheet = this.sheet;
      let pos = 0, j = 0;
      for (let i = 0; i < modules.length; i++) {
        let mod2 = modules[i], index = this.modules.indexOf(mod2);
        if (index < j && index > -1) {
          this.modules.splice(index, 1);
          j--;
          index = -1;
        }
        if (index == -1) {
          this.modules.splice(j++, 0, mod2);
          if (sheet)
            for (let k = 0; k < mod2.rules.length; k++)
              sheet.insertRule(mod2.rules[k], pos++);
        } else {
          while (j < index)
            pos += this.modules[j++].rules.length;
          pos += mod2.rules.length;
          j++;
        }
      }
      if (!sheet) {
        let text = "";
        for (let i = 0; i < this.modules.length; i++)
          text += this.modules[i].getRules() + "\n";
        this.styleTag.textContent = text;
      }
    }
  };

  // node_modules/w3c-keyname/index.es.js
  var base = {
    8: "Backspace",
    9: "Tab",
    10: "Enter",
    12: "NumLock",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    44: "PrintScreen",
    45: "Insert",
    46: "Delete",
    59: ";",
    61: "=",
    91: "Meta",
    92: "Meta",
    106: "*",
    107: "+",
    108: ",",
    109: "-",
    110: ".",
    111: "/",
    144: "NumLock",
    145: "ScrollLock",
    160: "Shift",
    161: "Shift",
    162: "Control",
    163: "Control",
    164: "Alt",
    165: "Alt",
    173: "-",
    186: ";",
    187: "=",
    188: ",",
    189: "-",
    190: ".",
    191: "/",
    192: "`",
    219: "[",
    220: "\\",
    221: "]",
    222: "'"
  };
  var shift = {
    48: ")",
    49: "!",
    50: "@",
    51: "#",
    52: "$",
    53: "%",
    54: "^",
    55: "&",
    56: "*",
    57: "(",
    59: ":",
    61: "+",
    173: "_",
    186: ":",
    187: "+",
    188: "<",
    189: "_",
    190: ">",
    191: "?",
    192: "~",
    219: "{",
    220: "|",
    221: "}",
    222: '"'
  };
  var chrome = typeof navigator != "undefined" && /Chrome\/(\d+)/.exec(navigator.userAgent);
  var gecko = typeof navigator != "undefined" && /Gecko\/\d+/.test(navigator.userAgent);
  var mac = typeof navigator != "undefined" && /Mac/.test(navigator.platform);
  var ie = typeof navigator != "undefined" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
  var brokenModifierNames = mac || chrome && +chrome[1] < 57;
  for (i = 0; i < 10; i++)
    base[48 + i] = base[96 + i] = String(i);
  var i;
  for (i = 1; i <= 24; i++)
    base[i + 111] = "F" + i;
  var i;
  for (i = 65; i <= 90; i++) {
    base[i] = String.fromCharCode(i + 32);
    shift[i] = String.fromCharCode(i);
  }
  var i;
  for (code in base)
    if (!shift.hasOwnProperty(code))
      shift[code] = base[code];
  var code;
  function keyName(event) {
    var ignoreKey = brokenModifierNames && (event.ctrlKey || event.altKey || event.metaKey) || ie && event.shiftKey && event.key && event.key.length == 1 || event.key == "Unidentified";
    var name2 = !ignoreKey && event.key || (event.shiftKey ? shift : base)[event.keyCode] || event.key || "Unidentified";
    if (name2 == "Esc")
      name2 = "Escape";
    if (name2 == "Del")
      name2 = "Delete";
    if (name2 == "Left")
      name2 = "ArrowLeft";
    if (name2 == "Up")
      name2 = "ArrowUp";
    if (name2 == "Right")
      name2 = "ArrowRight";
    if (name2 == "Down")
      name2 = "ArrowDown";
    return name2;
  }

  // node_modules/@codemirror/view/dist/index.js
  function getSelection(root) {
    let target;
    if (root.nodeType == 11) {
      target = root.getSelection ? root : root.ownerDocument;
    } else {
      target = root;
    }
    return target.getSelection();
  }
  function contains(dom, node) {
    return node ? dom == node || dom.contains(node.nodeType != 1 ? node.parentNode : node) : false;
  }
  function deepActiveElement() {
    let elt = document.activeElement;
    while (elt && elt.shadowRoot)
      elt = elt.shadowRoot.activeElement;
    return elt;
  }
  function hasSelection(dom, selection) {
    if (!selection.anchorNode)
      return false;
    try {
      return contains(dom, selection.anchorNode);
    } catch (_) {
      return false;
    }
  }
  function clientRectsFor(dom) {
    if (dom.nodeType == 3)
      return textRange(dom, 0, dom.nodeValue.length).getClientRects();
    else if (dom.nodeType == 1)
      return dom.getClientRects();
    else
      return [];
  }
  function isEquivalentPosition(node, off, targetNode, targetOff) {
    return targetNode ? scanFor(node, off, targetNode, targetOff, -1) || scanFor(node, off, targetNode, targetOff, 1) : false;
  }
  function domIndex(node) {
    for (var index = 0; ; index++) {
      node = node.previousSibling;
      if (!node)
        return index;
    }
  }
  function scanFor(node, off, targetNode, targetOff, dir) {
    for (; ; ) {
      if (node == targetNode && off == targetOff)
        return true;
      if (off == (dir < 0 ? 0 : maxOffset(node))) {
        if (node.nodeName == "DIV")
          return false;
        let parent = node.parentNode;
        if (!parent || parent.nodeType != 1)
          return false;
        off = domIndex(node) + (dir < 0 ? 0 : 1);
        node = parent;
      } else if (node.nodeType == 1) {
        node = node.childNodes[off + (dir < 0 ? -1 : 0)];
        if (node.nodeType == 1 && node.contentEditable == "false")
          return false;
        off = dir < 0 ? maxOffset(node) : 0;
      } else {
        return false;
      }
    }
  }
  function maxOffset(node) {
    return node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length;
  }
  var Rect0 = { left: 0, right: 0, top: 0, bottom: 0 };
  function flattenRect(rect, left) {
    let x = left ? rect.left : rect.right;
    return { left: x, right: x, top: rect.top, bottom: rect.bottom };
  }
  function windowRect(win) {
    return {
      left: 0,
      right: win.innerWidth,
      top: 0,
      bottom: win.innerHeight
    };
  }
  function scrollRectIntoView(dom, rect, side, x, y, xMargin, yMargin, ltr) {
    let doc2 = dom.ownerDocument, win = doc2.defaultView;
    for (let cur2 = dom; cur2; ) {
      if (cur2.nodeType == 1) {
        let bounding, top2 = cur2 == doc2.body;
        if (top2) {
          bounding = windowRect(win);
        } else {
          if (cur2.scrollHeight <= cur2.clientHeight && cur2.scrollWidth <= cur2.clientWidth) {
            cur2 = cur2.parentNode;
            continue;
          }
          let rect2 = cur2.getBoundingClientRect();
          bounding = {
            left: rect2.left,
            right: rect2.left + cur2.clientWidth,
            top: rect2.top,
            bottom: rect2.top + cur2.clientHeight
          };
        }
        let moveX = 0, moveY = 0;
        if (y == "nearest") {
          if (rect.top < bounding.top) {
            moveY = -(bounding.top - rect.top + yMargin);
            if (side > 0 && rect.bottom > bounding.bottom + moveY)
              moveY = rect.bottom - bounding.bottom + moveY + yMargin;
          } else if (rect.bottom > bounding.bottom) {
            moveY = rect.bottom - bounding.bottom + yMargin;
            if (side < 0 && rect.top - moveY < bounding.top)
              moveY = -(bounding.top + moveY - rect.top + yMargin);
          }
        } else {
          let rectHeight = rect.bottom - rect.top, boundingHeight = bounding.bottom - bounding.top;
          let targetTop = y == "center" && rectHeight <= boundingHeight ? rect.top + rectHeight / 2 - boundingHeight / 2 : y == "start" || y == "center" && side < 0 ? rect.top - yMargin : rect.bottom - boundingHeight + yMargin;
          moveY = targetTop - bounding.top;
        }
        if (x == "nearest") {
          if (rect.left < bounding.left) {
            moveX = -(bounding.left - rect.left + xMargin);
            if (side > 0 && rect.right > bounding.right + moveX)
              moveX = rect.right - bounding.right + moveX + xMargin;
          } else if (rect.right > bounding.right) {
            moveX = rect.right - bounding.right + xMargin;
            if (side < 0 && rect.left < bounding.left + moveX)
              moveX = -(bounding.left + moveX - rect.left + xMargin);
          }
        } else {
          let targetLeft = x == "center" ? rect.left + (rect.right - rect.left) / 2 - (bounding.right - bounding.left) / 2 : x == "start" == ltr ? rect.left - xMargin : rect.right - (bounding.right - bounding.left) + xMargin;
          moveX = targetLeft - bounding.left;
        }
        if (moveX || moveY) {
          if (top2) {
            win.scrollBy(moveX, moveY);
          } else {
            if (moveY) {
              let start = cur2.scrollTop;
              cur2.scrollTop += moveY;
              moveY = cur2.scrollTop - start;
            }
            if (moveX) {
              let start = cur2.scrollLeft;
              cur2.scrollLeft += moveX;
              moveX = cur2.scrollLeft - start;
            }
            rect = {
              left: rect.left - moveX,
              top: rect.top - moveY,
              right: rect.right - moveX,
              bottom: rect.bottom - moveY
            };
          }
        }
        if (top2)
          break;
        cur2 = cur2.assignedSlot || cur2.parentNode;
        x = y = "nearest";
      } else if (cur2.nodeType == 11) {
        cur2 = cur2.host;
      } else {
        break;
      }
    }
  }
  var DOMSelectionState = class {
    constructor() {
      this.anchorNode = null;
      this.anchorOffset = 0;
      this.focusNode = null;
      this.focusOffset = 0;
    }
    eq(domSel) {
      return this.anchorNode == domSel.anchorNode && this.anchorOffset == domSel.anchorOffset && this.focusNode == domSel.focusNode && this.focusOffset == domSel.focusOffset;
    }
    setRange(range2) {
      this.set(range2.anchorNode, range2.anchorOffset, range2.focusNode, range2.focusOffset);
    }
    set(anchorNode, anchorOffset, focusNode, focusOffset) {
      this.anchorNode = anchorNode;
      this.anchorOffset = anchorOffset;
      this.focusNode = focusNode;
      this.focusOffset = focusOffset;
    }
  };
  var preventScrollSupported = null;
  function focusPreventScroll(dom) {
    if (dom.setActive)
      return dom.setActive();
    if (preventScrollSupported)
      return dom.focus(preventScrollSupported);
    let stack = [];
    for (let cur2 = dom; cur2; cur2 = cur2.parentNode) {
      stack.push(cur2, cur2.scrollTop, cur2.scrollLeft);
      if (cur2 == cur2.ownerDocument)
        break;
    }
    dom.focus(preventScrollSupported == null ? {
      get preventScroll() {
        preventScrollSupported = { preventScroll: true };
        return true;
      }
    } : void 0);
    if (!preventScrollSupported) {
      preventScrollSupported = false;
      for (let i = 0; i < stack.length; ) {
        let elt = stack[i++], top2 = stack[i++], left = stack[i++];
        if (elt.scrollTop != top2)
          elt.scrollTop = top2;
        if (elt.scrollLeft != left)
          elt.scrollLeft = left;
      }
    }
  }
  var scratchRange;
  function textRange(node, from, to2 = from) {
    let range2 = scratchRange || (scratchRange = document.createRange());
    range2.setEnd(node, to2);
    range2.setStart(node, from);
    return range2;
  }
  function dispatchKey(elt, name2, code) {
    let options = { key: name2, code: name2, keyCode: code, which: code, cancelable: true };
    let down = new KeyboardEvent("keydown", options);
    down.synthetic = true;
    elt.dispatchEvent(down);
    let up = new KeyboardEvent("keyup", options);
    up.synthetic = true;
    elt.dispatchEvent(up);
    return down.defaultPrevented || up.defaultPrevented;
  }
  function getRoot(node) {
    while (node) {
      if (node && (node.nodeType == 9 || node.nodeType == 11 && node.host))
        return node;
      node = node.assignedSlot || node.parentNode;
    }
    return null;
  }
  function clearAttributes(node) {
    while (node.attributes.length)
      node.removeAttributeNode(node.attributes[0]);
  }
  var DOMPos = class {
    constructor(node, offset, precise = true) {
      this.node = node;
      this.offset = offset;
      this.precise = precise;
    }
    static before(dom, precise) {
      return new DOMPos(dom.parentNode, domIndex(dom), precise);
    }
    static after(dom, precise) {
      return new DOMPos(dom.parentNode, domIndex(dom) + 1, precise);
    }
  };
  var noChildren = [];
  var ContentView = class {
    constructor() {
      this.parent = null;
      this.dom = null;
      this.dirty = 2;
    }
    get editorView() {
      if (!this.parent)
        throw new Error("Accessing view in orphan content view");
      return this.parent.editorView;
    }
    get overrideDOMText() {
      return null;
    }
    get posAtStart() {
      return this.parent ? this.parent.posBefore(this) : 0;
    }
    get posAtEnd() {
      return this.posAtStart + this.length;
    }
    posBefore(view) {
      let pos = this.posAtStart;
      for (let child of this.children) {
        if (child == view)
          return pos;
        pos += child.length + child.breakAfter;
      }
      throw new RangeError("Invalid child in posBefore");
    }
    posAfter(view) {
      return this.posBefore(view) + view.length;
    }
    coordsAt(_pos, _side) {
      return null;
    }
    sync(track) {
      if (this.dirty & 2) {
        let parent = this.dom;
        let prev = null, next;
        for (let child of this.children) {
          if (child.dirty) {
            if (!child.dom && (next = prev ? prev.nextSibling : parent.firstChild)) {
              let contentView = ContentView.get(next);
              if (!contentView || !contentView.parent && contentView.constructor == child.constructor)
                child.reuseDOM(next);
            }
            child.sync(track);
            child.dirty = 0;
          }
          next = prev ? prev.nextSibling : parent.firstChild;
          if (track && !track.written && track.node == parent && next != child.dom)
            track.written = true;
          if (child.dom.parentNode == parent) {
            while (next && next != child.dom)
              next = rm$1(next);
          } else {
            parent.insertBefore(child.dom, next);
          }
          prev = child.dom;
        }
        next = prev ? prev.nextSibling : parent.firstChild;
        if (next && track && track.node == parent)
          track.written = true;
        while (next)
          next = rm$1(next);
      } else if (this.dirty & 1) {
        for (let child of this.children)
          if (child.dirty) {
            child.sync(track);
            child.dirty = 0;
          }
      }
    }
    reuseDOM(_dom) {
    }
    localPosFromDOM(node, offset) {
      let after;
      if (node == this.dom) {
        after = this.dom.childNodes[offset];
      } else {
        let bias = maxOffset(node) == 0 ? 0 : offset == 0 ? -1 : 1;
        for (; ; ) {
          let parent = node.parentNode;
          if (parent == this.dom)
            break;
          if (bias == 0 && parent.firstChild != parent.lastChild) {
            if (node == parent.firstChild)
              bias = -1;
            else
              bias = 1;
          }
          node = parent;
        }
        if (bias < 0)
          after = node;
        else
          after = node.nextSibling;
      }
      if (after == this.dom.firstChild)
        return 0;
      while (after && !ContentView.get(after))
        after = after.nextSibling;
      if (!after)
        return this.length;
      for (let i = 0, pos = 0; ; i++) {
        let child = this.children[i];
        if (child.dom == after)
          return pos;
        pos += child.length + child.breakAfter;
      }
    }
    domBoundsAround(from, to2, offset = 0) {
      let fromI = -1, fromStart = -1, toI = -1, toEnd = -1;
      for (let i = 0, pos = offset, prevEnd = offset; i < this.children.length; i++) {
        let child = this.children[i], end = pos + child.length;
        if (pos < from && end > to2)
          return child.domBoundsAround(from, to2, pos);
        if (end >= from && fromI == -1) {
          fromI = i;
          fromStart = pos;
        }
        if (pos > to2 && child.dom.parentNode == this.dom) {
          toI = i;
          toEnd = prevEnd;
          break;
        }
        prevEnd = end;
        pos = end + child.breakAfter;
      }
      return {
        from: fromStart,
        to: toEnd < 0 ? offset + this.length : toEnd,
        startDOM: (fromI ? this.children[fromI - 1].dom.nextSibling : null) || this.dom.firstChild,
        endDOM: toI < this.children.length && toI >= 0 ? this.children[toI].dom : null
      };
    }
    markDirty(andParent = false) {
      this.dirty |= 2;
      this.markParentsDirty(andParent);
    }
    markParentsDirty(childList) {
      for (let parent = this.parent; parent; parent = parent.parent) {
        if (childList)
          parent.dirty |= 2;
        if (parent.dirty & 1)
          return;
        parent.dirty |= 1;
        childList = false;
      }
    }
    setParent(parent) {
      if (this.parent != parent) {
        this.parent = parent;
        if (this.dirty)
          this.markParentsDirty(true);
      }
    }
    setDOM(dom) {
      if (this.dom)
        this.dom.cmView = null;
      this.dom = dom;
      dom.cmView = this;
    }
    get rootView() {
      for (let v = this; ; ) {
        let parent = v.parent;
        if (!parent)
          return v;
        v = parent;
      }
    }
    replaceChildren(from, to2, children = noChildren) {
      this.markDirty();
      for (let i = from; i < to2; i++) {
        let child = this.children[i];
        if (child.parent == this)
          child.destroy();
      }
      this.children.splice(from, to2 - from, ...children);
      for (let i = 0; i < children.length; i++)
        children[i].setParent(this);
    }
    ignoreMutation(_rec) {
      return false;
    }
    ignoreEvent(_event) {
      return false;
    }
    childCursor(pos = this.length) {
      return new ChildCursor(this.children, pos, this.children.length);
    }
    childPos(pos, bias = 1) {
      return this.childCursor().findPos(pos, bias);
    }
    toString() {
      let name2 = this.constructor.name.replace("View", "");
      return name2 + (this.children.length ? "(" + this.children.join() + ")" : this.length ? "[" + (name2 == "Text" ? this.text : this.length) + "]" : "") + (this.breakAfter ? "#" : "");
    }
    static get(node) {
      return node.cmView;
    }
    get isEditable() {
      return true;
    }
    merge(from, to2, source, hasStart, openStart, openEnd) {
      return false;
    }
    become(other) {
      return false;
    }
    getSide() {
      return 0;
    }
    destroy() {
      this.parent = null;
    }
  };
  ContentView.prototype.breakAfter = 0;
  function rm$1(dom) {
    let next = dom.nextSibling;
    dom.parentNode.removeChild(dom);
    return next;
  }
  var ChildCursor = class {
    constructor(children, pos, i) {
      this.children = children;
      this.pos = pos;
      this.i = i;
      this.off = 0;
    }
    findPos(pos, bias = 1) {
      for (; ; ) {
        if (pos > this.pos || pos == this.pos && (bias > 0 || this.i == 0 || this.children[this.i - 1].breakAfter)) {
          this.off = pos - this.pos;
          return this;
        }
        let next = this.children[--this.i];
        this.pos -= next.length + next.breakAfter;
      }
    }
  };
  function replaceRange(parent, fromI, fromOff, toI, toOff, insert2, breakAtStart, openStart, openEnd) {
    let { children } = parent;
    let before = children.length ? children[fromI] : null;
    let last2 = insert2.length ? insert2[insert2.length - 1] : null;
    let breakAtEnd = last2 ? last2.breakAfter : breakAtStart;
    if (fromI == toI && before && !breakAtStart && !breakAtEnd && insert2.length < 2 && before.merge(fromOff, toOff, insert2.length ? last2 : null, fromOff == 0, openStart, openEnd))
      return;
    if (toI < children.length) {
      let after = children[toI];
      if (after && toOff < after.length) {
        if (fromI == toI) {
          after = after.split(toOff);
          toOff = 0;
        }
        if (!breakAtEnd && last2 && after.merge(0, toOff, last2, true, 0, openEnd)) {
          insert2[insert2.length - 1] = after;
        } else {
          if (toOff)
            after.merge(0, toOff, null, false, 0, openEnd);
          insert2.push(after);
        }
      } else if (after === null || after === void 0 ? void 0 : after.breakAfter) {
        if (last2)
          last2.breakAfter = 1;
        else
          breakAtStart = 1;
      }
      toI++;
    }
    if (before) {
      before.breakAfter = breakAtStart;
      if (fromOff > 0) {
        if (!breakAtStart && insert2.length && before.merge(fromOff, before.length, insert2[0], false, openStart, 0)) {
          before.breakAfter = insert2.shift().breakAfter;
        } else if (fromOff < before.length || before.children.length && before.children[before.children.length - 1].length == 0) {
          before.merge(fromOff, before.length, null, false, openStart, 0);
        }
        fromI++;
      }
    }
    while (fromI < toI && insert2.length) {
      if (children[toI - 1].become(insert2[insert2.length - 1])) {
        toI--;
        insert2.pop();
        openEnd = insert2.length ? 0 : openStart;
      } else if (children[fromI].become(insert2[0])) {
        fromI++;
        insert2.shift();
        openStart = insert2.length ? 0 : openEnd;
      } else {
        break;
      }
    }
    if (!insert2.length && fromI && toI < children.length && !children[fromI - 1].breakAfter && children[toI].merge(0, 0, children[fromI - 1], false, openStart, openEnd))
      fromI--;
    if (fromI < toI || insert2.length)
      parent.replaceChildren(fromI, toI, insert2);
  }
  function mergeChildrenInto(parent, from, to2, insert2, openStart, openEnd) {
    let cur2 = parent.childCursor();
    let { i: toI, off: toOff } = cur2.findPos(to2, 1);
    let { i: fromI, off: fromOff } = cur2.findPos(from, -1);
    let dLen = from - to2;
    for (let view of insert2)
      dLen += view.length;
    parent.length += dLen;
    replaceRange(parent, fromI, fromOff, toI, toOff, insert2, 0, openStart, openEnd);
  }
  var nav = typeof navigator != "undefined" ? navigator : { userAgent: "", vendor: "", platform: "" };
  var doc = typeof document != "undefined" ? document : { documentElement: { style: {} } };
  var ie_edge = /* @__PURE__ */ /Edge\/(\d+)/.exec(nav.userAgent);
  var ie_upto10 = /* @__PURE__ */ /MSIE \d/.test(nav.userAgent);
  var ie_11up = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(nav.userAgent);
  var ie2 = !!(ie_upto10 || ie_11up || ie_edge);
  var gecko2 = !ie2 && /* @__PURE__ */ /gecko\/(\d+)/i.test(nav.userAgent);
  var chrome2 = !ie2 && /* @__PURE__ */ /Chrome\/(\d+)/.exec(nav.userAgent);
  var webkit = "webkitFontSmoothing" in doc.documentElement.style;
  var safari = !ie2 && /* @__PURE__ */ /Apple Computer/.test(nav.vendor);
  var ios = safari && (/* @__PURE__ */ /Mobile\/\w+/.test(nav.userAgent) || nav.maxTouchPoints > 2);
  var browser = {
    mac: ios || /* @__PURE__ */ /Mac/.test(nav.platform),
    windows: /* @__PURE__ */ /Win/.test(nav.platform),
    linux: /* @__PURE__ */ /Linux|X11/.test(nav.platform),
    ie: ie2,
    ie_version: ie_upto10 ? doc.documentMode || 6 : ie_11up ? +ie_11up[1] : ie_edge ? +ie_edge[1] : 0,
    gecko: gecko2,
    gecko_version: gecko2 ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec(nav.userAgent) || [0, 0])[1] : 0,
    chrome: !!chrome2,
    chrome_version: chrome2 ? +chrome2[1] : 0,
    ios,
    android: /* @__PURE__ */ /Android\b/.test(nav.userAgent),
    webkit,
    safari,
    webkit_version: webkit ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0,
    tabSize: doc.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
  };
  var MaxJoinLen = 256;
  var TextView = class extends ContentView {
    constructor(text) {
      super();
      this.text = text;
    }
    get length() {
      return this.text.length;
    }
    createDOM(textDOM) {
      this.setDOM(textDOM || document.createTextNode(this.text));
    }
    sync(track) {
      if (!this.dom)
        this.createDOM();
      if (this.dom.nodeValue != this.text) {
        if (track && track.node == this.dom)
          track.written = true;
        this.dom.nodeValue = this.text;
      }
    }
    reuseDOM(dom) {
      if (dom.nodeType == 3)
        this.createDOM(dom);
    }
    merge(from, to2, source) {
      if (source && (!(source instanceof TextView) || this.length - (to2 - from) + source.length > MaxJoinLen))
        return false;
      this.text = this.text.slice(0, from) + (source ? source.text : "") + this.text.slice(to2);
      this.markDirty();
      return true;
    }
    split(from) {
      let result = new TextView(this.text.slice(from));
      this.text = this.text.slice(0, from);
      this.markDirty();
      return result;
    }
    localPosFromDOM(node, offset) {
      return node == this.dom ? offset : offset ? this.text.length : 0;
    }
    domAtPos(pos) {
      return new DOMPos(this.dom, pos);
    }
    domBoundsAround(_from, _to, offset) {
      return { from: offset, to: offset + this.length, startDOM: this.dom, endDOM: this.dom.nextSibling };
    }
    coordsAt(pos, side) {
      return textCoords(this.dom, pos, side);
    }
  };
  var MarkView = class extends ContentView {
    constructor(mark, children = [], length = 0) {
      super();
      this.mark = mark;
      this.children = children;
      this.length = length;
      for (let ch of children)
        ch.setParent(this);
    }
    setAttrs(dom) {
      clearAttributes(dom);
      if (this.mark.class)
        dom.className = this.mark.class;
      if (this.mark.attrs)
        for (let name2 in this.mark.attrs)
          dom.setAttribute(name2, this.mark.attrs[name2]);
      return dom;
    }
    reuseDOM(node) {
      if (node.nodeName == this.mark.tagName.toUpperCase()) {
        this.setDOM(node);
        this.dirty |= 4 | 2;
      }
    }
    sync(track) {
      if (!this.dom)
        this.setDOM(this.setAttrs(document.createElement(this.mark.tagName)));
      else if (this.dirty & 4)
        this.setAttrs(this.dom);
      super.sync(track);
    }
    merge(from, to2, source, _hasStart, openStart, openEnd) {
      if (source && (!(source instanceof MarkView && source.mark.eq(this.mark)) || from && openStart <= 0 || to2 < this.length && openEnd <= 0))
        return false;
      mergeChildrenInto(this, from, to2, source ? source.children : [], openStart - 1, openEnd - 1);
      this.markDirty();
      return true;
    }
    split(from) {
      let result = [], off = 0, detachFrom = -1, i = 0;
      for (let elt of this.children) {
        let end = off + elt.length;
        if (end > from)
          result.push(off < from ? elt.split(from - off) : elt);
        if (detachFrom < 0 && off >= from)
          detachFrom = i;
        off = end;
        i++;
      }
      let length = this.length - from;
      this.length = from;
      if (detachFrom > -1) {
        this.children.length = detachFrom;
        this.markDirty();
      }
      return new MarkView(this.mark, result, length);
    }
    domAtPos(pos) {
      return inlineDOMAtPos(this.dom, this.children, pos);
    }
    coordsAt(pos, side) {
      return coordsInChildren(this, pos, side);
    }
  };
  function textCoords(text, pos, side) {
    let length = text.nodeValue.length;
    if (pos > length)
      pos = length;
    let from = pos, to2 = pos, flatten2 = 0;
    if (pos == 0 && side < 0 || pos == length && side >= 0) {
      if (!(browser.chrome || browser.gecko)) {
        if (pos) {
          from--;
          flatten2 = 1;
        } else if (to2 < length) {
          to2++;
          flatten2 = -1;
        }
      }
    } else {
      if (side < 0)
        from--;
      else if (to2 < length)
        to2++;
    }
    let rects = textRange(text, from, to2).getClientRects();
    if (!rects.length)
      return Rect0;
    let rect = rects[(flatten2 ? flatten2 < 0 : side >= 0) ? 0 : rects.length - 1];
    if (browser.safari && !flatten2 && rect.width == 0)
      rect = Array.prototype.find.call(rects, (r) => r.width) || rect;
    return flatten2 ? flattenRect(rect, flatten2 < 0) : rect || null;
  }
  var WidgetView = class extends ContentView {
    constructor(widget, length, side) {
      super();
      this.widget = widget;
      this.length = length;
      this.side = side;
      this.prevWidget = null;
    }
    static create(widget, length, side) {
      return new (widget.customView || WidgetView)(widget, length, side);
    }
    split(from) {
      let result = WidgetView.create(this.widget, this.length - from, this.side);
      this.length -= from;
      return result;
    }
    sync() {
      if (!this.dom || !this.widget.updateDOM(this.dom)) {
        if (this.dom && this.prevWidget)
          this.prevWidget.destroy(this.dom);
        this.prevWidget = null;
        this.setDOM(this.widget.toDOM(this.editorView));
        this.dom.contentEditable = "false";
      }
    }
    getSide() {
      return this.side;
    }
    merge(from, to2, source, hasStart, openStart, openEnd) {
      if (source && (!(source instanceof WidgetView) || !this.widget.compare(source.widget) || from > 0 && openStart <= 0 || to2 < this.length && openEnd <= 0))
        return false;
      this.length = from + (source ? source.length : 0) + (this.length - to2);
      return true;
    }
    become(other) {
      if (other.length == this.length && other instanceof WidgetView && other.side == this.side) {
        if (this.widget.constructor == other.widget.constructor) {
          if (!this.widget.eq(other.widget))
            this.markDirty(true);
          if (this.dom && !this.prevWidget)
            this.prevWidget = this.widget;
          this.widget = other.widget;
          return true;
        }
      }
      return false;
    }
    ignoreMutation() {
      return true;
    }
    ignoreEvent(event) {
      return this.widget.ignoreEvent(event);
    }
    get overrideDOMText() {
      if (this.length == 0)
        return Text.empty;
      let top2 = this;
      while (top2.parent)
        top2 = top2.parent;
      let view = top2.editorView, text = view && view.state.doc, start = this.posAtStart;
      return text ? text.slice(start, start + this.length) : Text.empty;
    }
    domAtPos(pos) {
      return pos == 0 ? DOMPos.before(this.dom) : DOMPos.after(this.dom, pos == this.length);
    }
    domBoundsAround() {
      return null;
    }
    coordsAt(pos, side) {
      let rects = this.dom.getClientRects(), rect = null;
      if (!rects.length)
        return Rect0;
      for (let i = pos > 0 ? rects.length - 1 : 0; ; i += pos > 0 ? -1 : 1) {
        rect = rects[i];
        if (pos > 0 ? i == 0 : i == rects.length - 1 || rect.top < rect.bottom)
          break;
      }
      return pos == 0 && side > 0 || pos == this.length && side <= 0 ? rect : flattenRect(rect, pos == 0);
    }
    get isEditable() {
      return false;
    }
    destroy() {
      super.destroy();
      if (this.dom)
        this.widget.destroy(this.dom);
    }
  };
  var CompositionView = class extends WidgetView {
    domAtPos(pos) {
      let { topView, text } = this.widget;
      if (!topView)
        return new DOMPos(text, Math.min(pos, text.nodeValue.length));
      return scanCompositionTree(pos, 0, topView, text, (v, p2) => v.domAtPos(p2), (p2) => new DOMPos(text, Math.min(p2, text.nodeValue.length)));
    }
    sync() {
      this.setDOM(this.widget.toDOM());
    }
    localPosFromDOM(node, offset) {
      let { topView, text } = this.widget;
      if (!topView)
        return Math.min(offset, this.length);
      return posFromDOMInCompositionTree(node, offset, topView, text);
    }
    ignoreMutation() {
      return false;
    }
    get overrideDOMText() {
      return null;
    }
    coordsAt(pos, side) {
      let { topView, text } = this.widget;
      if (!topView)
        return textCoords(text, pos, side);
      return scanCompositionTree(pos, side, topView, text, (v, pos2, side2) => v.coordsAt(pos2, side2), (pos2, side2) => textCoords(text, pos2, side2));
    }
    destroy() {
      var _a2;
      super.destroy();
      (_a2 = this.widget.topView) === null || _a2 === void 0 ? void 0 : _a2.destroy();
    }
    get isEditable() {
      return true;
    }
  };
  function scanCompositionTree(pos, side, view, text, enterView, fromText) {
    if (view instanceof MarkView) {
      for (let child of view.children) {
        let hasComp = contains(child.dom, text);
        let len = hasComp ? text.nodeValue.length : child.length;
        if (pos < len || pos == len && child.getSide() <= 0)
          return hasComp ? scanCompositionTree(pos, side, child, text, enterView, fromText) : enterView(child, pos, side);
        pos -= len;
      }
      return enterView(view, view.length, -1);
    } else if (view.dom == text) {
      return fromText(pos, side);
    } else {
      return enterView(view, pos, side);
    }
  }
  function posFromDOMInCompositionTree(node, offset, view, text) {
    if (view instanceof MarkView) {
      for (let child of view.children) {
        let pos = 0, hasComp = contains(child.dom, text);
        if (contains(child.dom, node))
          return pos + (hasComp ? posFromDOMInCompositionTree(node, offset, child, text) : child.localPosFromDOM(node, offset));
        pos += hasComp ? text.nodeValue.length : child.length;
      }
    } else if (view.dom == text) {
      return Math.min(offset, text.nodeValue.length);
    }
    return view.localPosFromDOM(node, offset);
  }
  var WidgetBufferView = class extends ContentView {
    constructor(side) {
      super();
      this.side = side;
    }
    get length() {
      return 0;
    }
    merge() {
      return false;
    }
    become(other) {
      return other instanceof WidgetBufferView && other.side == this.side;
    }
    split() {
      return new WidgetBufferView(this.side);
    }
    sync() {
      if (!this.dom) {
        let dom = document.createElement("img");
        dom.className = "cm-widgetBuffer";
        dom.setAttribute("aria-hidden", "true");
        this.setDOM(dom);
      }
    }
    getSide() {
      return this.side;
    }
    domAtPos(pos) {
      return DOMPos.before(this.dom);
    }
    localPosFromDOM() {
      return 0;
    }
    domBoundsAround() {
      return null;
    }
    coordsAt(pos) {
      let imgRect = this.dom.getBoundingClientRect();
      let siblingRect = inlineSiblingRect(this, this.side > 0 ? -1 : 1);
      return siblingRect && siblingRect.top < imgRect.bottom && siblingRect.bottom > imgRect.top ? { left: imgRect.left, right: imgRect.right, top: siblingRect.top, bottom: siblingRect.bottom } : imgRect;
    }
    get overrideDOMText() {
      return Text.empty;
    }
  };
  TextView.prototype.children = WidgetView.prototype.children = WidgetBufferView.prototype.children = noChildren;
  function inlineSiblingRect(view, side) {
    let parent = view.parent, index = parent ? parent.children.indexOf(view) : -1;
    while (parent && index >= 0) {
      if (side < 0 ? index > 0 : index < parent.children.length) {
        let next = parent.children[index + side];
        if (next instanceof TextView) {
          let nextRect = next.coordsAt(side < 0 ? next.length : 0, side);
          if (nextRect)
            return nextRect;
        }
        index += side;
      } else if (parent instanceof MarkView && parent.parent) {
        index = parent.parent.children.indexOf(parent) + (side < 0 ? 0 : 1);
        parent = parent.parent;
      } else {
        let last2 = parent.dom.lastChild;
        if (last2 && last2.nodeName == "BR")
          return last2.getClientRects()[0];
        break;
      }
    }
    return void 0;
  }
  function inlineDOMAtPos(dom, children, pos) {
    let i = 0;
    for (let off = 0; i < children.length; i++) {
      let child = children[i], end = off + child.length;
      if (end == off && child.getSide() <= 0)
        continue;
      if (pos > off && pos < end && child.dom.parentNode == dom)
        return child.domAtPos(pos - off);
      if (pos <= off)
        break;
      off = end;
    }
    for (; i > 0; i--) {
      let before = children[i - 1].dom;
      if (before.parentNode == dom)
        return DOMPos.after(before);
    }
    return new DOMPos(dom, 0);
  }
  function joinInlineInto(parent, view, open) {
    let last2, { children } = parent;
    if (open > 0 && view instanceof MarkView && children.length && (last2 = children[children.length - 1]) instanceof MarkView && last2.mark.eq(view.mark)) {
      joinInlineInto(last2, view.children[0], open - 1);
    } else {
      children.push(view);
      view.setParent(parent);
    }
    parent.length += view.length;
  }
  function coordsInChildren(view, pos, side) {
    for (let off = 0, i = 0; i < view.children.length; i++) {
      let child = view.children[i], end = off + child.length, next;
      if ((side <= 0 || end == view.length || child.getSide() > 0 ? end >= pos : end > pos) && (pos < end || i + 1 == view.children.length || (next = view.children[i + 1]).length || next.getSide() > 0)) {
        let flatten2 = 0;
        if (end == off) {
          if (child.getSide() <= 0)
            continue;
          flatten2 = side = -child.getSide();
        }
        let rect = child.coordsAt(Math.max(0, pos - off), side);
        return flatten2 && rect ? flattenRect(rect, side < 0) : rect;
      }
      off = end;
    }
    let last2 = view.dom.lastChild;
    if (!last2)
      return view.dom.getBoundingClientRect();
    let rects = clientRectsFor(last2);
    return rects[rects.length - 1] || null;
  }
  function combineAttrs(source, target) {
    for (let name2 in source) {
      if (name2 == "class" && target.class)
        target.class += " " + source.class;
      else if (name2 == "style" && target.style)
        target.style += ";" + source.style;
      else
        target[name2] = source[name2];
    }
    return target;
  }
  function attrsEq(a2, b2) {
    if (a2 == b2)
      return true;
    if (!a2 || !b2)
      return false;
    let keysA = Object.keys(a2), keysB = Object.keys(b2);
    if (keysA.length != keysB.length)
      return false;
    for (let key of keysA) {
      if (keysB.indexOf(key) == -1 || a2[key] !== b2[key])
        return false;
    }
    return true;
  }
  function updateAttrs(dom, prev, attrs) {
    let changed = null;
    if (prev) {
      for (let name2 in prev)
        if (!(attrs && name2 in attrs))
          dom.removeAttribute(changed = name2);
    }
    if (attrs) {
      for (let name2 in attrs)
        if (!(prev && prev[name2] == attrs[name2]))
          dom.setAttribute(changed = name2, attrs[name2]);
    }
    return !!changed;
  }
  var WidgetType = class {
    eq(widget) {
      return false;
    }
    updateDOM(dom) {
      return false;
    }
    compare(other) {
      return this == other || this.constructor == other.constructor && this.eq(other);
    }
    get estimatedHeight() {
      return -1;
    }
    ignoreEvent(event) {
      return true;
    }
    get customView() {
      return null;
    }
    destroy(dom) {
    }
  };
  var BlockType = /* @__PURE__ */ function(BlockType2) {
    BlockType2[BlockType2["Text"] = 0] = "Text";
    BlockType2[BlockType2["WidgetBefore"] = 1] = "WidgetBefore";
    BlockType2[BlockType2["WidgetAfter"] = 2] = "WidgetAfter";
    BlockType2[BlockType2["WidgetRange"] = 3] = "WidgetRange";
    return BlockType2;
  }(BlockType || (BlockType = {}));
  var Decoration = class extends RangeValue {
    constructor(startSide, endSide, widget, spec) {
      super();
      this.startSide = startSide;
      this.endSide = endSide;
      this.widget = widget;
      this.spec = spec;
    }
    get heightRelevant() {
      return false;
    }
    static mark(spec) {
      return new MarkDecoration(spec);
    }
    static widget(spec) {
      let side = spec.side || 0, block = !!spec.block;
      side += block ? side > 0 ? 3e8 : -4e8 : side > 0 ? 1e8 : -1e8;
      return new PointDecoration(spec, side, side, block, spec.widget || null, false);
    }
    static replace(spec) {
      let block = !!spec.block, startSide, endSide;
      if (spec.isBlockGap) {
        startSide = -5e8;
        endSide = 4e8;
      } else {
        let { start, end } = getInclusive(spec, block);
        startSide = (start ? block ? -3e8 : -1 : 5e8) - 1;
        endSide = (end ? block ? 2e8 : 1 : -6e8) + 1;
      }
      return new PointDecoration(spec, startSide, endSide, block, spec.widget || null, true);
    }
    static line(spec) {
      return new LineDecoration(spec);
    }
    static set(of, sort = false) {
      return RangeSet.of(of, sort);
    }
    hasHeight() {
      return this.widget ? this.widget.estimatedHeight > -1 : false;
    }
  };
  Decoration.none = RangeSet.empty;
  var MarkDecoration = class extends Decoration {
    constructor(spec) {
      let { start, end } = getInclusive(spec);
      super(start ? -1 : 5e8, end ? 1 : -6e8, null, spec);
      this.tagName = spec.tagName || "span";
      this.class = spec.class || "";
      this.attrs = spec.attributes || null;
    }
    eq(other) {
      return this == other || other instanceof MarkDecoration && this.tagName == other.tagName && this.class == other.class && attrsEq(this.attrs, other.attrs);
    }
    range(from, to2 = from) {
      if (from >= to2)
        throw new RangeError("Mark decorations may not be empty");
      return super.range(from, to2);
    }
  };
  MarkDecoration.prototype.point = false;
  var LineDecoration = class extends Decoration {
    constructor(spec) {
      super(-2e8, -2e8, null, spec);
    }
    eq(other) {
      return other instanceof LineDecoration && attrsEq(this.spec.attributes, other.spec.attributes);
    }
    range(from, to2 = from) {
      if (to2 != from)
        throw new RangeError("Line decoration ranges must be zero-length");
      return super.range(from, to2);
    }
  };
  LineDecoration.prototype.mapMode = MapMode.TrackBefore;
  LineDecoration.prototype.point = true;
  var PointDecoration = class extends Decoration {
    constructor(spec, startSide, endSide, block, widget, isReplace) {
      super(startSide, endSide, widget, spec);
      this.block = block;
      this.isReplace = isReplace;
      this.mapMode = !block ? MapMode.TrackDel : startSide <= 0 ? MapMode.TrackBefore : MapMode.TrackAfter;
    }
    get type() {
      return this.startSide < this.endSide ? BlockType.WidgetRange : this.startSide <= 0 ? BlockType.WidgetBefore : BlockType.WidgetAfter;
    }
    get heightRelevant() {
      return this.block || !!this.widget && this.widget.estimatedHeight >= 5;
    }
    eq(other) {
      return other instanceof PointDecoration && widgetsEq(this.widget, other.widget) && this.block == other.block && this.startSide == other.startSide && this.endSide == other.endSide;
    }
    range(from, to2 = from) {
      if (this.isReplace && (from > to2 || from == to2 && this.startSide > 0 && this.endSide <= 0))
        throw new RangeError("Invalid range for replacement decoration");
      if (!this.isReplace && to2 != from)
        throw new RangeError("Widget decorations can only have zero-length ranges");
      return super.range(from, to2);
    }
  };
  PointDecoration.prototype.point = true;
  function getInclusive(spec, block = false) {
    let { inclusiveStart: start, inclusiveEnd: end } = spec;
    if (start == null)
      start = spec.inclusive;
    if (end == null)
      end = spec.inclusive;
    return { start: start !== null && start !== void 0 ? start : block, end: end !== null && end !== void 0 ? end : block };
  }
  function widgetsEq(a2, b2) {
    return a2 == b2 || !!(a2 && b2 && a2.compare(b2));
  }
  function addRange(from, to2, ranges, margin = 0) {
    let last2 = ranges.length - 1;
    if (last2 >= 0 && ranges[last2] + margin >= from)
      ranges[last2] = Math.max(ranges[last2], to2);
    else
      ranges.push(from, to2);
  }
  var LineView = class extends ContentView {
    constructor() {
      super(...arguments);
      this.children = [];
      this.length = 0;
      this.prevAttrs = void 0;
      this.attrs = null;
      this.breakAfter = 0;
    }
    merge(from, to2, source, hasStart, openStart, openEnd) {
      if (source) {
        if (!(source instanceof LineView))
          return false;
        if (!this.dom)
          source.transferDOM(this);
      }
      if (hasStart)
        this.setDeco(source ? source.attrs : null);
      mergeChildrenInto(this, from, to2, source ? source.children : [], openStart, openEnd);
      return true;
    }
    split(at) {
      let end = new LineView();
      end.breakAfter = this.breakAfter;
      if (this.length == 0)
        return end;
      let { i, off } = this.childPos(at);
      if (off) {
        end.append(this.children[i].split(off), 0);
        this.children[i].merge(off, this.children[i].length, null, false, 0, 0);
        i++;
      }
      for (let j = i; j < this.children.length; j++)
        end.append(this.children[j], 0);
      while (i > 0 && this.children[i - 1].length == 0)
        this.children[--i].destroy();
      this.children.length = i;
      this.markDirty();
      this.length = at;
      return end;
    }
    transferDOM(other) {
      if (!this.dom)
        return;
      this.markDirty();
      other.setDOM(this.dom);
      other.prevAttrs = this.prevAttrs === void 0 ? this.attrs : this.prevAttrs;
      this.prevAttrs = void 0;
      this.dom = null;
    }
    setDeco(attrs) {
      if (!attrsEq(this.attrs, attrs)) {
        if (this.dom) {
          this.prevAttrs = this.attrs;
          this.markDirty();
        }
        this.attrs = attrs;
      }
    }
    append(child, openStart) {
      joinInlineInto(this, child, openStart);
    }
    addLineDeco(deco) {
      let attrs = deco.spec.attributes, cls = deco.spec.class;
      if (attrs)
        this.attrs = combineAttrs(attrs, this.attrs || {});
      if (cls)
        this.attrs = combineAttrs({ class: cls }, this.attrs || {});
    }
    domAtPos(pos) {
      return inlineDOMAtPos(this.dom, this.children, pos);
    }
    reuseDOM(node) {
      if (node.nodeName == "DIV") {
        this.setDOM(node);
        this.dirty |= 4 | 2;
      }
    }
    sync(track) {
      var _a2;
      if (!this.dom) {
        this.setDOM(document.createElement("div"));
        this.dom.className = "cm-line";
        this.prevAttrs = this.attrs ? null : void 0;
      } else if (this.dirty & 4) {
        clearAttributes(this.dom);
        this.dom.className = "cm-line";
        this.prevAttrs = this.attrs ? null : void 0;
      }
      if (this.prevAttrs !== void 0) {
        updateAttrs(this.dom, this.prevAttrs, this.attrs);
        this.dom.classList.add("cm-line");
        this.prevAttrs = void 0;
      }
      super.sync(track);
      let last2 = this.dom.lastChild;
      while (last2 && ContentView.get(last2) instanceof MarkView)
        last2 = last2.lastChild;
      if (!last2 || !this.length || last2.nodeName != "BR" && ((_a2 = ContentView.get(last2)) === null || _a2 === void 0 ? void 0 : _a2.isEditable) == false && (!browser.ios || !this.children.some((ch) => ch instanceof TextView))) {
        let hack = document.createElement("BR");
        hack.cmIgnore = true;
        this.dom.appendChild(hack);
      }
    }
    measureTextSize() {
      if (this.children.length == 0 || this.length > 20)
        return null;
      let totalWidth = 0;
      for (let child of this.children) {
        if (!(child instanceof TextView))
          return null;
        let rects = clientRectsFor(child.dom);
        if (rects.length != 1)
          return null;
        totalWidth += rects[0].width;
      }
      return {
        lineHeight: this.dom.getBoundingClientRect().height,
        charWidth: totalWidth / this.length
      };
    }
    coordsAt(pos, side) {
      return coordsInChildren(this, pos, side);
    }
    become(_other) {
      return false;
    }
    get type() {
      return BlockType.Text;
    }
    static find(docView, pos) {
      for (let i = 0, off = 0; i < docView.children.length; i++) {
        let block = docView.children[i], end = off + block.length;
        if (end >= pos) {
          if (block instanceof LineView)
            return block;
          if (end > pos)
            break;
        }
        off = end + block.breakAfter;
      }
      return null;
    }
  };
  var BlockWidgetView = class extends ContentView {
    constructor(widget, length, type2) {
      super();
      this.widget = widget;
      this.length = length;
      this.type = type2;
      this.breakAfter = 0;
      this.prevWidget = null;
    }
    merge(from, to2, source, _takeDeco, openStart, openEnd) {
      if (source && (!(source instanceof BlockWidgetView) || !this.widget.compare(source.widget) || from > 0 && openStart <= 0 || to2 < this.length && openEnd <= 0))
        return false;
      this.length = from + (source ? source.length : 0) + (this.length - to2);
      return true;
    }
    domAtPos(pos) {
      return pos == 0 ? DOMPos.before(this.dom) : DOMPos.after(this.dom, pos == this.length);
    }
    split(at) {
      let len = this.length - at;
      this.length = at;
      let end = new BlockWidgetView(this.widget, len, this.type);
      end.breakAfter = this.breakAfter;
      return end;
    }
    get children() {
      return noChildren;
    }
    sync() {
      if (!this.dom || !this.widget.updateDOM(this.dom)) {
        if (this.dom && this.prevWidget)
          this.prevWidget.destroy(this.dom);
        this.prevWidget = null;
        this.setDOM(this.widget.toDOM(this.editorView));
        this.dom.contentEditable = "false";
      }
    }
    get overrideDOMText() {
      return this.parent ? this.parent.view.state.doc.slice(this.posAtStart, this.posAtEnd) : Text.empty;
    }
    domBoundsAround() {
      return null;
    }
    become(other) {
      if (other instanceof BlockWidgetView && other.type == this.type && other.widget.constructor == this.widget.constructor) {
        if (!other.widget.eq(this.widget))
          this.markDirty(true);
        if (this.dom && !this.prevWidget)
          this.prevWidget = this.widget;
        this.widget = other.widget;
        this.length = other.length;
        this.breakAfter = other.breakAfter;
        return true;
      }
      return false;
    }
    ignoreMutation() {
      return true;
    }
    ignoreEvent(event) {
      return this.widget.ignoreEvent(event);
    }
    destroy() {
      super.destroy();
      if (this.dom)
        this.widget.destroy(this.dom);
    }
  };
  var ContentBuilder = class {
    constructor(doc2, pos, end, disallowBlockEffectsFor) {
      this.doc = doc2;
      this.pos = pos;
      this.end = end;
      this.disallowBlockEffectsFor = disallowBlockEffectsFor;
      this.content = [];
      this.curLine = null;
      this.breakAtStart = 0;
      this.pendingBuffer = 0;
      this.atCursorPos = true;
      this.openStart = -1;
      this.openEnd = -1;
      this.text = "";
      this.textOff = 0;
      this.cursor = doc2.iter();
      this.skip = pos;
    }
    posCovered() {
      if (this.content.length == 0)
        return !this.breakAtStart && this.doc.lineAt(this.pos).from != this.pos;
      let last2 = this.content[this.content.length - 1];
      return !last2.breakAfter && !(last2 instanceof BlockWidgetView && last2.type == BlockType.WidgetBefore);
    }
    getLine() {
      if (!this.curLine) {
        this.content.push(this.curLine = new LineView());
        this.atCursorPos = true;
      }
      return this.curLine;
    }
    flushBuffer(active) {
      if (this.pendingBuffer) {
        this.curLine.append(wrapMarks(new WidgetBufferView(-1), active), active.length);
        this.pendingBuffer = 0;
      }
    }
    addBlockWidget(view) {
      this.flushBuffer([]);
      this.curLine = null;
      this.content.push(view);
    }
    finish(openEnd) {
      if (!openEnd)
        this.flushBuffer([]);
      else
        this.pendingBuffer = 0;
      if (!this.posCovered())
        this.getLine();
    }
    buildText(length, active, openStart) {
      while (length > 0) {
        if (this.textOff == this.text.length) {
          let { value: value2, lineBreak, done } = this.cursor.next(this.skip);
          this.skip = 0;
          if (done)
            throw new Error("Ran out of text content when drawing inline views");
          if (lineBreak) {
            if (!this.posCovered())
              this.getLine();
            if (this.content.length)
              this.content[this.content.length - 1].breakAfter = 1;
            else
              this.breakAtStart = 1;
            this.flushBuffer([]);
            this.curLine = null;
            length--;
            continue;
          } else {
            this.text = value2;
            this.textOff = 0;
          }
        }
        let take = Math.min(this.text.length - this.textOff, length, 512);
        this.flushBuffer(active.slice(0, openStart));
        this.getLine().append(wrapMarks(new TextView(this.text.slice(this.textOff, this.textOff + take)), active), openStart);
        this.atCursorPos = true;
        this.textOff += take;
        length -= take;
        openStart = 0;
      }
    }
    span(from, to2, active, openStart) {
      this.buildText(to2 - from, active, openStart);
      this.pos = to2;
      if (this.openStart < 0)
        this.openStart = openStart;
    }
    point(from, to2, deco, active, openStart, index) {
      if (this.disallowBlockEffectsFor[index] && deco instanceof PointDecoration) {
        if (deco.block)
          throw new RangeError("Block decorations may not be specified via plugins");
        if (to2 > this.doc.lineAt(this.pos).to)
          throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
      }
      let len = to2 - from;
      if (deco instanceof PointDecoration) {
        if (deco.block) {
          let { type: type2 } = deco;
          if (type2 == BlockType.WidgetAfter && !this.posCovered())
            this.getLine();
          this.addBlockWidget(new BlockWidgetView(deco.widget || new NullWidget("div"), len, type2));
        } else {
          let view = WidgetView.create(deco.widget || new NullWidget("span"), len, deco.startSide);
          let cursorBefore = this.atCursorPos && !view.isEditable && openStart <= active.length && (from < to2 || deco.startSide > 0);
          let cursorAfter = !view.isEditable && (from < to2 || deco.startSide <= 0);
          let line = this.getLine();
          if (this.pendingBuffer == 2 && !cursorBefore)
            this.pendingBuffer = 0;
          this.flushBuffer(active);
          if (cursorBefore) {
            line.append(wrapMarks(new WidgetBufferView(1), active), openStart);
            openStart = active.length + Math.max(0, openStart - active.length);
          }
          line.append(wrapMarks(view, active), openStart);
          this.atCursorPos = cursorAfter;
          this.pendingBuffer = !cursorAfter ? 0 : from < to2 ? 1 : 2;
        }
      } else if (this.doc.lineAt(this.pos).from == this.pos) {
        this.getLine().addLineDeco(deco);
      }
      if (len) {
        if (this.textOff + len <= this.text.length) {
          this.textOff += len;
        } else {
          this.skip += len - (this.text.length - this.textOff);
          this.text = "";
          this.textOff = 0;
        }
        this.pos = to2;
      }
      if (this.openStart < 0)
        this.openStart = openStart;
    }
    static build(text, from, to2, decorations2, dynamicDecorationMap) {
      let builder = new ContentBuilder(text, from, to2, dynamicDecorationMap);
      builder.openEnd = RangeSet.spans(decorations2, from, to2, builder);
      if (builder.openStart < 0)
        builder.openStart = builder.openEnd;
      builder.finish(builder.openEnd);
      return builder;
    }
  };
  function wrapMarks(view, active) {
    for (let mark of active)
      view = new MarkView(mark, [view], view.length);
    return view;
  }
  var NullWidget = class extends WidgetType {
    constructor(tag) {
      super();
      this.tag = tag;
    }
    eq(other) {
      return other.tag == this.tag;
    }
    toDOM() {
      return document.createElement(this.tag);
    }
    updateDOM(elt) {
      return elt.nodeName.toLowerCase() == this.tag;
    }
  };
  var clickAddsSelectionRange = /* @__PURE__ */ Facet.define();
  var dragMovesSelection$1 = /* @__PURE__ */ Facet.define();
  var mouseSelectionStyle = /* @__PURE__ */ Facet.define();
  var exceptionSink = /* @__PURE__ */ Facet.define();
  var updateListener = /* @__PURE__ */ Facet.define();
  var inputHandler = /* @__PURE__ */ Facet.define();
  var perLineTextDirection = /* @__PURE__ */ Facet.define({
    combine: (values) => values.some((x) => x)
  });
  var ScrollTarget = class {
    constructor(range2, y = "nearest", x = "nearest", yMargin = 5, xMargin = 5) {
      this.range = range2;
      this.y = y;
      this.x = x;
      this.yMargin = yMargin;
      this.xMargin = xMargin;
    }
    map(changes) {
      return changes.empty ? this : new ScrollTarget(this.range.map(changes), this.y, this.x, this.yMargin, this.xMargin);
    }
  };
  var scrollIntoView = /* @__PURE__ */ StateEffect.define({ map: (t2, ch) => t2.map(ch) });
  function logException(state, exception, context2) {
    let handler = state.facet(exceptionSink);
    if (handler.length)
      handler[0](exception);
    else if (window.onerror)
      window.onerror(String(exception), context2, void 0, void 0, exception);
    else if (context2)
      console.error(context2 + ":", exception);
    else
      console.error(exception);
  }
  var editable = /* @__PURE__ */ Facet.define({ combine: (values) => values.length ? values[0] : true });
  var nextPluginID = 0;
  var viewPlugin = /* @__PURE__ */ Facet.define();
  var ViewPlugin = class {
    constructor(id, create, domEventHandlers, buildExtensions) {
      this.id = id;
      this.create = create;
      this.domEventHandlers = domEventHandlers;
      this.extension = buildExtensions(this);
    }
    static define(create, spec) {
      const { eventHandlers, provide, decorations: deco } = spec || {};
      return new ViewPlugin(nextPluginID++, create, eventHandlers, (plugin) => {
        let ext = [viewPlugin.of(plugin)];
        if (deco)
          ext.push(decorations.of((view) => {
            let pluginInst = view.plugin(plugin);
            return pluginInst ? deco(pluginInst) : Decoration.none;
          }));
        if (provide)
          ext.push(provide(plugin));
        return ext;
      });
    }
    static fromClass(cls, spec) {
      return ViewPlugin.define((view) => new cls(view), spec);
    }
  };
  var PluginInstance = class {
    constructor(spec) {
      this.spec = spec;
      this.mustUpdate = null;
      this.value = null;
    }
    update(view) {
      if (!this.value) {
        if (this.spec) {
          try {
            this.value = this.spec.create(view);
          } catch (e) {
            logException(view.state, e, "CodeMirror plugin crashed");
            this.deactivate();
          }
        }
      } else if (this.mustUpdate) {
        let update3 = this.mustUpdate;
        this.mustUpdate = null;
        if (this.value.update) {
          try {
            this.value.update(update3);
          } catch (e) {
            logException(update3.state, e, "CodeMirror plugin crashed");
            if (this.value.destroy)
              try {
                this.value.destroy();
              } catch (_) {
              }
            this.deactivate();
          }
        }
      }
      return this;
    }
    destroy(view) {
      var _a2;
      if ((_a2 = this.value) === null || _a2 === void 0 ? void 0 : _a2.destroy) {
        try {
          this.value.destroy();
        } catch (e) {
          logException(view.state, e, "CodeMirror plugin crashed");
        }
      }
    }
    deactivate() {
      this.spec = this.value = null;
    }
  };
  var editorAttributes = /* @__PURE__ */ Facet.define();
  var contentAttributes = /* @__PURE__ */ Facet.define();
  var decorations = /* @__PURE__ */ Facet.define();
  var atomicRanges = /* @__PURE__ */ Facet.define();
  var scrollMargins = /* @__PURE__ */ Facet.define();
  var styleModule = /* @__PURE__ */ Facet.define();
  var ChangedRange = class {
    constructor(fromA, toA, fromB, toB) {
      this.fromA = fromA;
      this.toA = toA;
      this.fromB = fromB;
      this.toB = toB;
    }
    join(other) {
      return new ChangedRange(Math.min(this.fromA, other.fromA), Math.max(this.toA, other.toA), Math.min(this.fromB, other.fromB), Math.max(this.toB, other.toB));
    }
    addToSet(set2) {
      let i = set2.length, me = this;
      for (; i > 0; i--) {
        let range2 = set2[i - 1];
        if (range2.fromA > me.toA)
          continue;
        if (range2.toA < me.fromA)
          break;
        me = me.join(range2);
        set2.splice(i - 1, 1);
      }
      set2.splice(i, 0, me);
      return set2;
    }
    static extendWithRanges(diff, ranges) {
      if (ranges.length == 0)
        return diff;
      let result = [];
      for (let dI = 0, rI = 0, posA = 0, posB = 0; ; dI++) {
        let next = dI == diff.length ? null : diff[dI], off = posA - posB;
        let end = next ? next.fromB : 1e9;
        while (rI < ranges.length && ranges[rI] < end) {
          let from = ranges[rI], to2 = ranges[rI + 1];
          let fromB = Math.max(posB, from), toB = Math.min(end, to2);
          if (fromB <= toB)
            new ChangedRange(fromB + off, toB + off, fromB, toB).addToSet(result);
          if (to2 > end)
            break;
          else
            rI += 2;
        }
        if (!next)
          return result;
        new ChangedRange(next.fromA, next.toA, next.fromB, next.toB).addToSet(result);
        posA = next.toA;
        posB = next.toB;
      }
    }
  };
  var ViewUpdate = class {
    constructor(view, state, transactions) {
      this.view = view;
      this.state = state;
      this.transactions = transactions;
      this.flags = 0;
      this.startState = view.state;
      this.changes = ChangeSet.empty(this.startState.doc.length);
      for (let tr of transactions)
        this.changes = this.changes.compose(tr.changes);
      let changedRanges = [];
      this.changes.iterChangedRanges((fromA, toA, fromB, toB) => changedRanges.push(new ChangedRange(fromA, toA, fromB, toB)));
      this.changedRanges = changedRanges;
      let focus = view.hasFocus;
      if (focus != view.inputState.notifiedFocused) {
        view.inputState.notifiedFocused = focus;
        this.flags |= 1;
      }
    }
    static create(view, state, transactions) {
      return new ViewUpdate(view, state, transactions);
    }
    get viewportChanged() {
      return (this.flags & 4) > 0;
    }
    get heightChanged() {
      return (this.flags & 2) > 0;
    }
    get geometryChanged() {
      return this.docChanged || (this.flags & (8 | 2)) > 0;
    }
    get focusChanged() {
      return (this.flags & 1) > 0;
    }
    get docChanged() {
      return !this.changes.empty;
    }
    get selectionSet() {
      return this.transactions.some((tr) => tr.selection);
    }
    get empty() {
      return this.flags == 0 && this.transactions.length == 0;
    }
  };
  var Direction = /* @__PURE__ */ function(Direction2) {
    Direction2[Direction2["LTR"] = 0] = "LTR";
    Direction2[Direction2["RTL"] = 1] = "RTL";
    return Direction2;
  }(Direction || (Direction = {}));
  var LTR = Direction.LTR;
  var RTL = Direction.RTL;
  function dec(str) {
    let result = [];
    for (let i = 0; i < str.length; i++)
      result.push(1 << +str[i]);
    return result;
  }
  var LowTypes = /* @__PURE__ */ dec("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008");
  var ArabicTypes = /* @__PURE__ */ dec("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333");
  var Brackets = /* @__PURE__ */ Object.create(null);
  var BracketStack = [];
  for (let p2 of ["()", "[]", "{}"]) {
    let l = /* @__PURE__ */ p2.charCodeAt(0), r = /* @__PURE__ */ p2.charCodeAt(1);
    Brackets[l] = r;
    Brackets[r] = -l;
  }
  function charType(ch) {
    return ch <= 247 ? LowTypes[ch] : 1424 <= ch && ch <= 1524 ? 2 : 1536 <= ch && ch <= 1785 ? ArabicTypes[ch - 1536] : 1774 <= ch && ch <= 2220 ? 4 : 8192 <= ch && ch <= 8203 ? 256 : ch == 8204 ? 256 : 1;
  }
  var BidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
  var BidiSpan = class {
    constructor(from, to2, level) {
      this.from = from;
      this.to = to2;
      this.level = level;
    }
    get dir() {
      return this.level % 2 ? RTL : LTR;
    }
    side(end, dir) {
      return this.dir == dir == end ? this.to : this.from;
    }
    static find(order, index, level, assoc) {
      let maybe = -1;
      for (let i = 0; i < order.length; i++) {
        let span = order[i];
        if (span.from <= index && span.to >= index) {
          if (span.level == level)
            return i;
          if (maybe < 0 || (assoc != 0 ? assoc < 0 ? span.from < index : span.to > index : order[maybe].level > span.level))
            maybe = i;
        }
      }
      if (maybe < 0)
        throw new RangeError("Index out of range");
      return maybe;
    }
  };
  var types = [];
  function computeOrder(line, direction) {
    let len = line.length, outerType = direction == LTR ? 1 : 2, oppositeType = direction == LTR ? 2 : 1;
    if (!line || outerType == 1 && !BidiRE.test(line))
      return trivialOrder(len);
    for (let i = 0, prev = outerType, prevStrong = outerType; i < len; i++) {
      let type2 = charType(line.charCodeAt(i));
      if (type2 == 512)
        type2 = prev;
      else if (type2 == 8 && prevStrong == 4)
        type2 = 16;
      types[i] = type2 == 4 ? 2 : type2;
      if (type2 & 7)
        prevStrong = type2;
      prev = type2;
    }
    for (let i = 0, prev = outerType, prevStrong = outerType; i < len; i++) {
      let type2 = types[i];
      if (type2 == 128) {
        if (i < len - 1 && prev == types[i + 1] && prev & 24)
          type2 = types[i] = prev;
        else
          types[i] = 256;
      } else if (type2 == 64) {
        let end = i + 1;
        while (end < len && types[end] == 64)
          end++;
        let replace = i && prev == 8 || end < len && types[end] == 8 ? prevStrong == 1 ? 1 : 8 : 256;
        for (let j = i; j < end; j++)
          types[j] = replace;
        i = end - 1;
      } else if (type2 == 8 && prevStrong == 1) {
        types[i] = 1;
      }
      prev = type2;
      if (type2 & 7)
        prevStrong = type2;
    }
    for (let i = 0, sI = 0, context2 = 0, ch, br, type2; i < len; i++) {
      if (br = Brackets[ch = line.charCodeAt(i)]) {
        if (br < 0) {
          for (let sJ = sI - 3; sJ >= 0; sJ -= 3) {
            if (BracketStack[sJ + 1] == -br) {
              let flags = BracketStack[sJ + 2];
              let type3 = flags & 2 ? outerType : !(flags & 4) ? 0 : flags & 1 ? oppositeType : outerType;
              if (type3)
                types[i] = types[BracketStack[sJ]] = type3;
              sI = sJ;
              break;
            }
          }
        } else if (BracketStack.length == 189) {
          break;
        } else {
          BracketStack[sI++] = i;
          BracketStack[sI++] = ch;
          BracketStack[sI++] = context2;
        }
      } else if ((type2 = types[i]) == 2 || type2 == 1) {
        let embed = type2 == outerType;
        context2 = embed ? 0 : 1;
        for (let sJ = sI - 3; sJ >= 0; sJ -= 3) {
          let cur2 = BracketStack[sJ + 2];
          if (cur2 & 2)
            break;
          if (embed) {
            BracketStack[sJ + 2] |= 2;
          } else {
            if (cur2 & 4)
              break;
            BracketStack[sJ + 2] |= 4;
          }
        }
      }
    }
    for (let i = 0; i < len; i++) {
      if (types[i] == 256) {
        let end = i + 1;
        while (end < len && types[end] == 256)
          end++;
        let beforeL = (i ? types[i - 1] : outerType) == 1;
        let afterL = (end < len ? types[end] : outerType) == 1;
        let replace = beforeL == afterL ? beforeL ? 1 : 2 : outerType;
        for (let j = i; j < end; j++)
          types[j] = replace;
        i = end - 1;
      }
    }
    let order = [];
    if (outerType == 1) {
      for (let i = 0; i < len; ) {
        let start = i, rtl = types[i++] != 1;
        while (i < len && rtl == (types[i] != 1))
          i++;
        if (rtl) {
          for (let j = i; j > start; ) {
            let end = j, l = types[--j] != 2;
            while (j > start && l == (types[j - 1] != 2))
              j--;
            order.push(new BidiSpan(j, end, l ? 2 : 1));
          }
        } else {
          order.push(new BidiSpan(start, i, 0));
        }
      }
    } else {
      for (let i = 0; i < len; ) {
        let start = i, rtl = types[i++] == 2;
        while (i < len && rtl == (types[i] == 2))
          i++;
        order.push(new BidiSpan(start, i, rtl ? 1 : 2));
      }
    }
    return order;
  }
  function trivialOrder(length) {
    return [new BidiSpan(0, length, 0)];
  }
  var movedOver = "";
  function moveVisually(line, order, dir, start, forward) {
    var _a2;
    let startIndex = start.head - line.from, spanI = -1;
    if (startIndex == 0) {
      if (!forward || !line.length)
        return null;
      if (order[0].level != dir) {
        startIndex = order[0].side(false, dir);
        spanI = 0;
      }
    } else if (startIndex == line.length) {
      if (forward)
        return null;
      let last2 = order[order.length - 1];
      if (last2.level != dir) {
        startIndex = last2.side(true, dir);
        spanI = order.length - 1;
      }
    }
    if (spanI < 0)
      spanI = BidiSpan.find(order, startIndex, (_a2 = start.bidiLevel) !== null && _a2 !== void 0 ? _a2 : -1, start.assoc);
    let span = order[spanI];
    if (startIndex == span.side(forward, dir)) {
      span = order[spanI += forward ? 1 : -1];
      startIndex = span.side(!forward, dir);
    }
    let indexForward = forward == (span.dir == dir);
    let nextIndex = findClusterBreak(line.text, startIndex, indexForward);
    movedOver = line.text.slice(Math.min(startIndex, nextIndex), Math.max(startIndex, nextIndex));
    if (nextIndex != span.side(forward, dir))
      return EditorSelection.cursor(nextIndex + line.from, indexForward ? -1 : 1, span.level);
    let nextSpan = spanI == (forward ? order.length - 1 : 0) ? null : order[spanI + (forward ? 1 : -1)];
    if (!nextSpan && span.level != dir)
      return EditorSelection.cursor(forward ? line.to : line.from, forward ? -1 : 1, dir);
    if (nextSpan && nextSpan.level < span.level)
      return EditorSelection.cursor(nextSpan.side(!forward, dir) + line.from, forward ? 1 : -1, nextSpan.level);
    return EditorSelection.cursor(nextIndex + line.from, forward ? -1 : 1, span.level);
  }
  var LineBreakPlaceholder = "\uFFFF";
  var DOMReader = class {
    constructor(points, state) {
      this.points = points;
      this.text = "";
      this.lineSeparator = state.facet(EditorState.lineSeparator);
    }
    append(text) {
      this.text += text;
    }
    lineBreak() {
      this.text += LineBreakPlaceholder;
    }
    readRange(start, end) {
      if (!start)
        return this;
      let parent = start.parentNode;
      for (let cur2 = start; ; ) {
        this.findPointBefore(parent, cur2);
        this.readNode(cur2);
        let next = cur2.nextSibling;
        if (next == end)
          break;
        let view = ContentView.get(cur2), nextView = ContentView.get(next);
        if (view && nextView ? view.breakAfter : (view ? view.breakAfter : isBlockElement(cur2)) || isBlockElement(next) && (cur2.nodeName != "BR" || cur2.cmIgnore))
          this.lineBreak();
        cur2 = next;
      }
      this.findPointBefore(parent, end);
      return this;
    }
    readTextNode(node) {
      let text = node.nodeValue;
      for (let point of this.points)
        if (point.node == node)
          point.pos = this.text.length + Math.min(point.offset, text.length);
      for (let off = 0, re = this.lineSeparator ? null : /\r\n?|\n/g; ; ) {
        let nextBreak = -1, breakSize = 1, m3;
        if (this.lineSeparator) {
          nextBreak = text.indexOf(this.lineSeparator, off);
          breakSize = this.lineSeparator.length;
        } else if (m3 = re.exec(text)) {
          nextBreak = m3.index;
          breakSize = m3[0].length;
        }
        this.append(text.slice(off, nextBreak < 0 ? text.length : nextBreak));
        if (nextBreak < 0)
          break;
        this.lineBreak();
        if (breakSize > 1) {
          for (let point of this.points)
            if (point.node == node && point.pos > this.text.length)
              point.pos -= breakSize - 1;
        }
        off = nextBreak + breakSize;
      }
    }
    readNode(node) {
      if (node.cmIgnore)
        return;
      let view = ContentView.get(node);
      let fromView = view && view.overrideDOMText;
      if (fromView != null) {
        this.findPointInside(node, fromView.length);
        for (let i = fromView.iter(); !i.next().done; ) {
          if (i.lineBreak)
            this.lineBreak();
          else
            this.append(i.value);
        }
      } else if (node.nodeType == 3) {
        this.readTextNode(node);
      } else if (node.nodeName == "BR") {
        if (node.nextSibling)
          this.lineBreak();
      } else if (node.nodeType == 1) {
        this.readRange(node.firstChild, null);
      }
    }
    findPointBefore(node, next) {
      for (let point of this.points)
        if (point.node == node && node.childNodes[point.offset] == next)
          point.pos = this.text.length;
    }
    findPointInside(node, maxLen) {
      for (let point of this.points)
        if (node.nodeType == 3 ? point.node == node : node.contains(point.node))
          point.pos = this.text.length + Math.min(maxLen, point.offset);
    }
  };
  function isBlockElement(node) {
    return node.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(node.nodeName);
  }
  var DOMPoint = class {
    constructor(node, offset) {
      this.node = node;
      this.offset = offset;
      this.pos = -1;
    }
  };
  var DocView = class extends ContentView {
    constructor(view) {
      super();
      this.view = view;
      this.compositionDeco = Decoration.none;
      this.decorations = [];
      this.dynamicDecorationMap = [];
      this.minWidth = 0;
      this.minWidthFrom = 0;
      this.minWidthTo = 0;
      this.impreciseAnchor = null;
      this.impreciseHead = null;
      this.forceSelection = false;
      this.lastUpdate = Date.now();
      this.setDOM(view.contentDOM);
      this.children = [new LineView()];
      this.children[0].setParent(this);
      this.updateDeco();
      this.updateInner([new ChangedRange(0, 0, 0, view.state.doc.length)], 0);
    }
    get root() {
      return this.view.root;
    }
    get editorView() {
      return this.view;
    }
    get length() {
      return this.view.state.doc.length;
    }
    update(update3) {
      let changedRanges = update3.changedRanges;
      if (this.minWidth > 0 && changedRanges.length) {
        if (!changedRanges.every(({ fromA, toA }) => toA < this.minWidthFrom || fromA > this.minWidthTo)) {
          this.minWidth = this.minWidthFrom = this.minWidthTo = 0;
        } else {
          this.minWidthFrom = update3.changes.mapPos(this.minWidthFrom, 1);
          this.minWidthTo = update3.changes.mapPos(this.minWidthTo, 1);
        }
      }
      if (this.view.inputState.composing < 0)
        this.compositionDeco = Decoration.none;
      else if (update3.transactions.length || this.dirty)
        this.compositionDeco = computeCompositionDeco(this.view, update3.changes);
      if ((browser.ie || browser.chrome) && !this.compositionDeco.size && update3 && update3.state.doc.lines != update3.startState.doc.lines)
        this.forceSelection = true;
      let prevDeco = this.decorations, deco = this.updateDeco();
      let decoDiff = findChangedDeco(prevDeco, deco, update3.changes);
      changedRanges = ChangedRange.extendWithRanges(changedRanges, decoDiff);
      if (this.dirty == 0 && changedRanges.length == 0) {
        return false;
      } else {
        this.updateInner(changedRanges, update3.startState.doc.length);
        if (update3.transactions.length)
          this.lastUpdate = Date.now();
        return true;
      }
    }
    updateInner(changes, oldLength) {
      this.view.viewState.mustMeasureContent = true;
      this.updateChildren(changes, oldLength);
      let { observer } = this.view;
      observer.ignore(() => {
        this.dom.style.height = this.view.viewState.contentHeight + "px";
        this.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
        let track = browser.chrome || browser.ios ? { node: observer.selectionRange.focusNode, written: false } : void 0;
        this.sync(track);
        this.dirty = 0;
        if (track && (track.written || observer.selectionRange.focusNode != track.node))
          this.forceSelection = true;
        this.dom.style.height = "";
      });
      let gaps = [];
      if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length) {
        for (let child of this.children)
          if (child instanceof BlockWidgetView && child.widget instanceof BlockGapWidget)
            gaps.push(child.dom);
      }
      observer.updateGaps(gaps);
    }
    updateChildren(changes, oldLength) {
      let cursor = this.childCursor(oldLength);
      for (let i = changes.length - 1; ; i--) {
        let next = i >= 0 ? changes[i] : null;
        if (!next)
          break;
        let { fromA, toA, fromB, toB } = next;
        let { content: content2, breakAtStart, openStart, openEnd } = ContentBuilder.build(this.view.state.doc, fromB, toB, this.decorations, this.dynamicDecorationMap);
        let { i: toI, off: toOff } = cursor.findPos(toA, 1);
        let { i: fromI, off: fromOff } = cursor.findPos(fromA, -1);
        replaceRange(this, fromI, fromOff, toI, toOff, content2, breakAtStart, openStart, openEnd);
      }
    }
    updateSelection(mustRead = false, fromPointer = false) {
      if (mustRead)
        this.view.observer.readSelectionRange();
      if (!(fromPointer || this.mayControlSelection()) || browser.ios && this.view.inputState.rapidCompositionStart)
        return;
      let force = this.forceSelection;
      this.forceSelection = false;
      let main = this.view.state.selection.main;
      let anchor = this.domAtPos(main.anchor);
      let head = main.empty ? anchor : this.domAtPos(main.head);
      if (browser.gecko && main.empty && betweenUneditable(anchor)) {
        let dummy = document.createTextNode("");
        this.view.observer.ignore(() => anchor.node.insertBefore(dummy, anchor.node.childNodes[anchor.offset] || null));
        anchor = head = new DOMPos(dummy, 0);
        force = true;
      }
      let domSel = this.view.observer.selectionRange;
      if (force || !domSel.focusNode || !isEquivalentPosition(anchor.node, anchor.offset, domSel.anchorNode, domSel.anchorOffset) || !isEquivalentPosition(head.node, head.offset, domSel.focusNode, domSel.focusOffset)) {
        this.view.observer.ignore(() => {
          if (browser.android && browser.chrome && this.dom.contains(domSel.focusNode) && inUneditable(domSel.focusNode, this.dom)) {
            this.dom.blur();
            this.dom.focus({ preventScroll: true });
          }
          let rawSel = getSelection(this.root);
          if (main.empty) {
            if (browser.gecko) {
              let nextTo = nextToUneditable(anchor.node, anchor.offset);
              if (nextTo && nextTo != (1 | 2)) {
                let text = nearbyTextNode(anchor.node, anchor.offset, nextTo == 1 ? 1 : -1);
                if (text)
                  anchor = new DOMPos(text, nextTo == 1 ? 0 : text.nodeValue.length);
              }
            }
            rawSel.collapse(anchor.node, anchor.offset);
            if (main.bidiLevel != null && domSel.cursorBidiLevel != null)
              domSel.cursorBidiLevel = main.bidiLevel;
          } else if (rawSel.extend) {
            rawSel.collapse(anchor.node, anchor.offset);
            rawSel.extend(head.node, head.offset);
          } else {
            let range2 = document.createRange();
            if (main.anchor > main.head)
              [anchor, head] = [head, anchor];
            range2.setEnd(head.node, head.offset);
            range2.setStart(anchor.node, anchor.offset);
            rawSel.removeAllRanges();
            rawSel.addRange(range2);
          }
        });
        this.view.observer.setSelectionRange(anchor, head);
      }
      this.impreciseAnchor = anchor.precise ? null : new DOMPos(domSel.anchorNode, domSel.anchorOffset);
      this.impreciseHead = head.precise ? null : new DOMPos(domSel.focusNode, domSel.focusOffset);
    }
    enforceCursorAssoc() {
      if (this.compositionDeco.size)
        return;
      let cursor = this.view.state.selection.main;
      let sel = getSelection(this.root);
      if (!cursor.empty || !cursor.assoc || !sel.modify)
        return;
      let line = LineView.find(this, cursor.head);
      if (!line)
        return;
      let lineStart = line.posAtStart;
      if (cursor.head == lineStart || cursor.head == lineStart + line.length)
        return;
      let before = this.coordsAt(cursor.head, -1), after = this.coordsAt(cursor.head, 1);
      if (!before || !after || before.bottom > after.top)
        return;
      let dom = this.domAtPos(cursor.head + cursor.assoc);
      sel.collapse(dom.node, dom.offset);
      sel.modify("move", cursor.assoc < 0 ? "forward" : "backward", "lineboundary");
    }
    mayControlSelection() {
      return this.view.state.facet(editable) ? this.root.activeElement == this.dom : hasSelection(this.dom, this.view.observer.selectionRange);
    }
    nearest(dom) {
      for (let cur2 = dom; cur2; ) {
        let domView = ContentView.get(cur2);
        if (domView && domView.rootView == this)
          return domView;
        cur2 = cur2.parentNode;
      }
      return null;
    }
    posFromDOM(node, offset) {
      let view = this.nearest(node);
      if (!view)
        throw new RangeError("Trying to find position for a DOM position outside of the document");
      return view.localPosFromDOM(node, offset) + view.posAtStart;
    }
    domAtPos(pos) {
      let { i, off } = this.childCursor().findPos(pos, -1);
      for (; i < this.children.length - 1; ) {
        let child = this.children[i];
        if (off < child.length || child instanceof LineView)
          break;
        i++;
        off = 0;
      }
      return this.children[i].domAtPos(off);
    }
    coordsAt(pos, side) {
      for (let off = this.length, i = this.children.length - 1; ; i--) {
        let child = this.children[i], start = off - child.breakAfter - child.length;
        if (pos > start || pos == start && child.type != BlockType.WidgetBefore && child.type != BlockType.WidgetAfter && (!i || side == 2 || this.children[i - 1].breakAfter || this.children[i - 1].type == BlockType.WidgetBefore && side > -2))
          return child.coordsAt(pos - start, side);
        off = start;
      }
    }
    measureVisibleLineHeights(viewport) {
      let result = [], { from, to: to2 } = viewport;
      let contentWidth = this.view.contentDOM.clientWidth;
      let isWider = contentWidth > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1;
      let widest = -1, ltr = this.view.textDirection == Direction.LTR;
      for (let pos = 0, i = 0; i < this.children.length; i++) {
        let child = this.children[i], end = pos + child.length;
        if (end > to2)
          break;
        if (pos >= from) {
          let childRect = child.dom.getBoundingClientRect();
          result.push(childRect.height);
          if (isWider) {
            let last2 = child.dom.lastChild;
            let rects = last2 ? clientRectsFor(last2) : [];
            if (rects.length) {
              let rect = rects[rects.length - 1];
              let width = ltr ? rect.right - childRect.left : childRect.right - rect.left;
              if (width > widest) {
                widest = width;
                this.minWidth = contentWidth;
                this.minWidthFrom = pos;
                this.minWidthTo = end;
              }
            }
          }
        }
        pos = end + child.breakAfter;
      }
      return result;
    }
    textDirectionAt(pos) {
      let { i } = this.childPos(pos, 1);
      return getComputedStyle(this.children[i].dom).direction == "rtl" ? Direction.RTL : Direction.LTR;
    }
    measureTextSize() {
      for (let child of this.children) {
        if (child instanceof LineView) {
          let measure = child.measureTextSize();
          if (measure)
            return measure;
        }
      }
      let dummy = document.createElement("div"), lineHeight, charWidth;
      dummy.className = "cm-line";
      dummy.textContent = "abc def ghi jkl mno pqr stu";
      this.view.observer.ignore(() => {
        this.dom.appendChild(dummy);
        let rect = clientRectsFor(dummy.firstChild)[0];
        lineHeight = dummy.getBoundingClientRect().height;
        charWidth = rect ? rect.width / 27 : 7;
        dummy.remove();
      });
      return { lineHeight, charWidth };
    }
    childCursor(pos = this.length) {
      let i = this.children.length;
      if (i)
        pos -= this.children[--i].length;
      return new ChildCursor(this.children, pos, i);
    }
    computeBlockGapDeco() {
      let deco = [], vs = this.view.viewState;
      for (let pos = 0, i = 0; ; i++) {
        let next = i == vs.viewports.length ? null : vs.viewports[i];
        let end = next ? next.from - 1 : this.length;
        if (end > pos) {
          let height = vs.lineBlockAt(end).bottom - vs.lineBlockAt(pos).top;
          deco.push(Decoration.replace({
            widget: new BlockGapWidget(height),
            block: true,
            inclusive: true,
            isBlockGap: true
          }).range(pos, end));
        }
        if (!next)
          break;
        pos = next.to + 1;
      }
      return Decoration.set(deco);
    }
    updateDeco() {
      let allDeco = this.view.state.facet(decorations).map((d2, i) => {
        let dynamic = this.dynamicDecorationMap[i] = typeof d2 == "function";
        return dynamic ? d2(this.view) : d2;
      });
      for (let i = allDeco.length; i < allDeco.length + 3; i++)
        this.dynamicDecorationMap[i] = false;
      return this.decorations = [
        ...allDeco,
        this.compositionDeco,
        this.computeBlockGapDeco(),
        this.view.viewState.lineGapDeco
      ];
    }
    scrollIntoView(target) {
      let { range: range2 } = target;
      let rect = this.coordsAt(range2.head, range2.empty ? range2.assoc : range2.head > range2.anchor ? -1 : 1), other;
      if (!rect)
        return;
      if (!range2.empty && (other = this.coordsAt(range2.anchor, range2.anchor > range2.head ? -1 : 1)))
        rect = {
          left: Math.min(rect.left, other.left),
          top: Math.min(rect.top, other.top),
          right: Math.max(rect.right, other.right),
          bottom: Math.max(rect.bottom, other.bottom)
        };
      let mLeft = 0, mRight = 0, mTop = 0, mBottom = 0;
      for (let margins of this.view.state.facet(scrollMargins).map((f) => f(this.view)))
        if (margins) {
          let { left, right, top: top2, bottom } = margins;
          if (left != null)
            mLeft = Math.max(mLeft, left);
          if (right != null)
            mRight = Math.max(mRight, right);
          if (top2 != null)
            mTop = Math.max(mTop, top2);
          if (bottom != null)
            mBottom = Math.max(mBottom, bottom);
        }
      let targetRect = {
        left: rect.left - mLeft,
        top: rect.top - mTop,
        right: rect.right + mRight,
        bottom: rect.bottom + mBottom
      };
      scrollRectIntoView(this.view.scrollDOM, targetRect, range2.head < range2.anchor ? -1 : 1, target.x, target.y, target.xMargin, target.yMargin, this.view.textDirection == Direction.LTR);
    }
  };
  function betweenUneditable(pos) {
    return pos.node.nodeType == 1 && pos.node.firstChild && (pos.offset == 0 || pos.node.childNodes[pos.offset - 1].contentEditable == "false") && (pos.offset == pos.node.childNodes.length || pos.node.childNodes[pos.offset].contentEditable == "false");
  }
  var BlockGapWidget = class extends WidgetType {
    constructor(height) {
      super();
      this.height = height;
    }
    toDOM() {
      let elt = document.createElement("div");
      this.updateDOM(elt);
      return elt;
    }
    eq(other) {
      return other.height == this.height;
    }
    updateDOM(elt) {
      elt.style.height = this.height + "px";
      return true;
    }
    get estimatedHeight() {
      return this.height;
    }
  };
  function compositionSurroundingNode(view) {
    let sel = view.observer.selectionRange;
    let textNode = sel.focusNode && nearbyTextNode(sel.focusNode, sel.focusOffset, 0);
    if (!textNode)
      return null;
    let cView = view.docView.nearest(textNode);
    if (!cView)
      return null;
    if (cView instanceof LineView) {
      let topNode = textNode;
      while (topNode.parentNode != cView.dom)
        topNode = topNode.parentNode;
      let prev = topNode.previousSibling;
      while (prev && !ContentView.get(prev))
        prev = prev.previousSibling;
      let pos = prev ? ContentView.get(prev).posAtEnd : cView.posAtStart;
      return { from: pos, to: pos, node: topNode, text: textNode };
    } else {
      for (; ; ) {
        let { parent } = cView;
        if (!parent)
          return null;
        if (parent instanceof LineView)
          break;
        cView = parent;
      }
      let from = cView.posAtStart;
      return { from, to: from + cView.length, node: cView.dom, text: textNode };
    }
  }
  function computeCompositionDeco(view, changes) {
    let surrounding = compositionSurroundingNode(view);
    if (!surrounding)
      return Decoration.none;
    let { from, to: to2, node, text: textNode } = surrounding;
    let newFrom = changes.mapPos(from, 1), newTo = Math.max(newFrom, changes.mapPos(to2, -1));
    let { state } = view, text = node.nodeType == 3 ? node.nodeValue : new DOMReader([], state).readRange(node.firstChild, null).text;
    if (newTo - newFrom < text.length) {
      if (state.doc.sliceString(newFrom, Math.min(state.doc.length, newFrom + text.length), LineBreakPlaceholder) == text)
        newTo = newFrom + text.length;
      else if (state.doc.sliceString(Math.max(0, newTo - text.length), newTo, LineBreakPlaceholder) == text)
        newFrom = newTo - text.length;
      else
        return Decoration.none;
    } else if (state.doc.sliceString(newFrom, newTo, LineBreakPlaceholder) != text) {
      return Decoration.none;
    }
    let topView = ContentView.get(node);
    if (topView instanceof CompositionView)
      topView = topView.widget.topView;
    else if (topView)
      topView.parent = null;
    return Decoration.set(Decoration.replace({ widget: new CompositionWidget(node, textNode, topView), inclusive: true }).range(newFrom, newTo));
  }
  var CompositionWidget = class extends WidgetType {
    constructor(top2, text, topView) {
      super();
      this.top = top2;
      this.text = text;
      this.topView = topView;
    }
    eq(other) {
      return this.top == other.top && this.text == other.text;
    }
    toDOM() {
      return this.top;
    }
    ignoreEvent() {
      return false;
    }
    get customView() {
      return CompositionView;
    }
  };
  function nearbyTextNode(node, offset, side) {
    for (; ; ) {
      if (node.nodeType == 3)
        return node;
      if (node.nodeType == 1 && offset > 0 && side <= 0) {
        node = node.childNodes[offset - 1];
        offset = maxOffset(node);
      } else if (node.nodeType == 1 && offset < node.childNodes.length && side >= 0) {
        node = node.childNodes[offset];
        offset = 0;
      } else {
        return null;
      }
    }
  }
  function nextToUneditable(node, offset) {
    if (node.nodeType != 1)
      return 0;
    return (offset && node.childNodes[offset - 1].contentEditable == "false" ? 1 : 0) | (offset < node.childNodes.length && node.childNodes[offset].contentEditable == "false" ? 2 : 0);
  }
  var DecorationComparator$1 = class {
    constructor() {
      this.changes = [];
    }
    compareRange(from, to2) {
      addRange(from, to2, this.changes);
    }
    comparePoint(from, to2) {
      addRange(from, to2, this.changes);
    }
  };
  function findChangedDeco(a2, b2, diff) {
    let comp = new DecorationComparator$1();
    RangeSet.compare(a2, b2, diff, comp);
    return comp.changes;
  }
  function inUneditable(node, inside2) {
    for (let cur2 = node; cur2 && cur2 != inside2; cur2 = cur2.assignedSlot || cur2.parentNode) {
      if (cur2.nodeType == 1 && cur2.contentEditable == "false") {
        return true;
      }
    }
    return false;
  }
  function groupAt(state, pos, bias = 1) {
    let categorize = state.charCategorizer(pos);
    let line = state.doc.lineAt(pos), linePos = pos - line.from;
    if (line.length == 0)
      return EditorSelection.cursor(pos);
    if (linePos == 0)
      bias = 1;
    else if (linePos == line.length)
      bias = -1;
    let from = linePos, to2 = linePos;
    if (bias < 0)
      from = findClusterBreak(line.text, linePos, false);
    else
      to2 = findClusterBreak(line.text, linePos);
    let cat = categorize(line.text.slice(from, to2));
    while (from > 0) {
      let prev = findClusterBreak(line.text, from, false);
      if (categorize(line.text.slice(prev, from)) != cat)
        break;
      from = prev;
    }
    while (to2 < line.length) {
      let next = findClusterBreak(line.text, to2);
      if (categorize(line.text.slice(to2, next)) != cat)
        break;
      to2 = next;
    }
    return EditorSelection.range(from + line.from, to2 + line.from);
  }
  function getdx(x, rect) {
    return rect.left > x ? rect.left - x : Math.max(0, x - rect.right);
  }
  function getdy(y, rect) {
    return rect.top > y ? rect.top - y : Math.max(0, y - rect.bottom);
  }
  function yOverlap(a2, b2) {
    return a2.top < b2.bottom - 1 && a2.bottom > b2.top + 1;
  }
  function upTop(rect, top2) {
    return top2 < rect.top ? { top: top2, left: rect.left, right: rect.right, bottom: rect.bottom } : rect;
  }
  function upBot(rect, bottom) {
    return bottom > rect.bottom ? { top: rect.top, left: rect.left, right: rect.right, bottom } : rect;
  }
  function domPosAtCoords(parent, x, y) {
    let closest, closestRect, closestX, closestY;
    let above, below, aboveRect, belowRect;
    for (let child = parent.firstChild; child; child = child.nextSibling) {
      let rects = clientRectsFor(child);
      for (let i = 0; i < rects.length; i++) {
        let rect = rects[i];
        if (closestRect && yOverlap(closestRect, rect))
          rect = upTop(upBot(rect, closestRect.bottom), closestRect.top);
        let dx = getdx(x, rect), dy = getdy(y, rect);
        if (dx == 0 && dy == 0)
          return child.nodeType == 3 ? domPosInText(child, x, y) : domPosAtCoords(child, x, y);
        if (!closest || closestY > dy || closestY == dy && closestX > dx) {
          closest = child;
          closestRect = rect;
          closestX = dx;
          closestY = dy;
        }
        if (dx == 0) {
          if (y > rect.bottom && (!aboveRect || aboveRect.bottom < rect.bottom)) {
            above = child;
            aboveRect = rect;
          } else if (y < rect.top && (!belowRect || belowRect.top > rect.top)) {
            below = child;
            belowRect = rect;
          }
        } else if (aboveRect && yOverlap(aboveRect, rect)) {
          aboveRect = upBot(aboveRect, rect.bottom);
        } else if (belowRect && yOverlap(belowRect, rect)) {
          belowRect = upTop(belowRect, rect.top);
        }
      }
    }
    if (aboveRect && aboveRect.bottom >= y) {
      closest = above;
      closestRect = aboveRect;
    } else if (belowRect && belowRect.top <= y) {
      closest = below;
      closestRect = belowRect;
    }
    if (!closest)
      return { node: parent, offset: 0 };
    let clipX = Math.max(closestRect.left, Math.min(closestRect.right, x));
    if (closest.nodeType == 3)
      return domPosInText(closest, clipX, y);
    if (!closestX && closest.contentEditable == "true")
      return domPosAtCoords(closest, clipX, y);
    let offset = Array.prototype.indexOf.call(parent.childNodes, closest) + (x >= (closestRect.left + closestRect.right) / 2 ? 1 : 0);
    return { node: parent, offset };
  }
  function domPosInText(node, x, y) {
    let len = node.nodeValue.length;
    let closestOffset = -1, closestDY = 1e9, generalSide = 0;
    for (let i = 0; i < len; i++) {
      let rects = textRange(node, i, i + 1).getClientRects();
      for (let j = 0; j < rects.length; j++) {
        let rect = rects[j];
        if (rect.top == rect.bottom)
          continue;
        if (!generalSide)
          generalSide = x - rect.left;
        let dy = (rect.top > y ? rect.top - y : y - rect.bottom) - 1;
        if (rect.left - 1 <= x && rect.right + 1 >= x && dy < closestDY) {
          let right = x >= (rect.left + rect.right) / 2, after = right;
          if (browser.chrome || browser.gecko) {
            let rectBefore = textRange(node, i).getBoundingClientRect();
            if (rectBefore.left == rect.right)
              after = !right;
          }
          if (dy <= 0)
            return { node, offset: i + (after ? 1 : 0) };
          closestOffset = i + (after ? 1 : 0);
          closestDY = dy;
        }
      }
    }
    return { node, offset: closestOffset > -1 ? closestOffset : generalSide > 0 ? node.nodeValue.length : 0 };
  }
  function posAtCoords(view, { x, y }, precise, bias = -1) {
    var _a2;
    let content2 = view.contentDOM.getBoundingClientRect(), docTop = content2.top + view.viewState.paddingTop;
    let block, { docHeight } = view.viewState;
    let yOffset = y - docTop;
    if (yOffset < 0)
      return 0;
    if (yOffset > docHeight)
      return view.state.doc.length;
    for (let halfLine = view.defaultLineHeight / 2, bounced = false; ; ) {
      block = view.elementAtHeight(yOffset);
      if (block.type == BlockType.Text)
        break;
      for (; ; ) {
        yOffset = bias > 0 ? block.bottom + halfLine : block.top - halfLine;
        if (yOffset >= 0 && yOffset <= docHeight)
          break;
        if (bounced)
          return precise ? null : 0;
        bounced = true;
        bias = -bias;
      }
    }
    y = docTop + yOffset;
    let lineStart = block.from;
    if (lineStart < view.viewport.from)
      return view.viewport.from == 0 ? 0 : precise ? null : posAtCoordsImprecise(view, content2, block, x, y);
    if (lineStart > view.viewport.to)
      return view.viewport.to == view.state.doc.length ? view.state.doc.length : precise ? null : posAtCoordsImprecise(view, content2, block, x, y);
    let doc2 = view.dom.ownerDocument;
    let root = view.root.elementFromPoint ? view.root : doc2;
    let element = root.elementFromPoint(x, y);
    if (element && !view.contentDOM.contains(element))
      element = null;
    if (!element) {
      x = Math.max(content2.left + 1, Math.min(content2.right - 1, x));
      element = root.elementFromPoint(x, y);
      if (element && !view.contentDOM.contains(element))
        element = null;
    }
    let node, offset = -1;
    if (element && ((_a2 = view.docView.nearest(element)) === null || _a2 === void 0 ? void 0 : _a2.isEditable) != false) {
      if (doc2.caretPositionFromPoint) {
        let pos = doc2.caretPositionFromPoint(x, y);
        if (pos)
          ({ offsetNode: node, offset } = pos);
      } else if (doc2.caretRangeFromPoint) {
        let range2 = doc2.caretRangeFromPoint(x, y);
        if (range2) {
          ({ startContainer: node, startOffset: offset } = range2);
          if (browser.safari && isSuspiciousCaretResult(node, offset, x))
            node = void 0;
        }
      }
    }
    if (!node || !view.docView.dom.contains(node)) {
      let line = LineView.find(view.docView, lineStart);
      if (!line)
        return yOffset > block.top + block.height / 2 ? block.to : block.from;
      ({ node, offset } = domPosAtCoords(line.dom, x, y));
    }
    return view.docView.posFromDOM(node, offset);
  }
  function posAtCoordsImprecise(view, contentRect, block, x, y) {
    let into = Math.round((x - contentRect.left) * view.defaultCharacterWidth);
    if (view.lineWrapping && block.height > view.defaultLineHeight * 1.5) {
      let line = Math.floor((y - block.top) / view.defaultLineHeight);
      into += line * view.viewState.heightOracle.lineLength;
    }
    let content2 = view.state.sliceDoc(block.from, block.to);
    return block.from + findColumn(content2, into, view.state.tabSize);
  }
  function isSuspiciousCaretResult(node, offset, x) {
    let len;
    if (node.nodeType != 3 || offset != (len = node.nodeValue.length))
      return false;
    for (let next = node.nextSibling; next; next = next.nextSibling)
      if (next.nodeType != 1 || next.nodeName != "BR")
        return false;
    return textRange(node, len - 1, len).getBoundingClientRect().left > x;
  }
  function moveToLineBoundary(view, start, forward, includeWrap) {
    let line = view.state.doc.lineAt(start.head);
    let coords = !includeWrap || !view.lineWrapping ? null : view.coordsAtPos(start.assoc < 0 && start.head > line.from ? start.head - 1 : start.head);
    if (coords) {
      let editorRect = view.dom.getBoundingClientRect();
      let direction = view.textDirectionAt(line.from);
      let pos = view.posAtCoords({
        x: forward == (direction == Direction.LTR) ? editorRect.right - 1 : editorRect.left + 1,
        y: (coords.top + coords.bottom) / 2
      });
      if (pos != null)
        return EditorSelection.cursor(pos, forward ? -1 : 1);
    }
    let lineView = LineView.find(view.docView, start.head);
    let end = lineView ? forward ? lineView.posAtEnd : lineView.posAtStart : forward ? line.to : line.from;
    return EditorSelection.cursor(end, forward ? -1 : 1);
  }
  function moveByChar(view, start, forward, by) {
    let line = view.state.doc.lineAt(start.head), spans = view.bidiSpans(line);
    let direction = view.textDirectionAt(line.from);
    for (let cur2 = start, check = null; ; ) {
      let next = moveVisually(line, spans, direction, cur2, forward), char = movedOver;
      if (!next) {
        if (line.number == (forward ? view.state.doc.lines : 1))
          return cur2;
        char = "\n";
        line = view.state.doc.line(line.number + (forward ? 1 : -1));
        spans = view.bidiSpans(line);
        next = EditorSelection.cursor(forward ? line.from : line.to);
      }
      if (!check) {
        if (!by)
          return next;
        check = by(char);
      } else if (!check(char)) {
        return cur2;
      }
      cur2 = next;
    }
  }
  function byGroup(view, pos, start) {
    let categorize = view.state.charCategorizer(pos);
    let cat = categorize(start);
    return (next) => {
      let nextCat = categorize(next);
      if (cat == CharCategory.Space)
        cat = nextCat;
      return cat == nextCat;
    };
  }
  function moveVertically(view, start, forward, distance2) {
    let startPos = start.head, dir = forward ? 1 : -1;
    if (startPos == (forward ? view.state.doc.length : 0))
      return EditorSelection.cursor(startPos, start.assoc);
    let goal = start.goalColumn, startY;
    let rect = view.contentDOM.getBoundingClientRect();
    let startCoords = view.coordsAtPos(startPos), docTop = view.documentTop;
    if (startCoords) {
      if (goal == null)
        goal = startCoords.left - rect.left;
      startY = dir < 0 ? startCoords.top : startCoords.bottom;
    } else {
      let line = view.viewState.lineBlockAt(startPos);
      if (goal == null)
        goal = Math.min(rect.right - rect.left, view.defaultCharacterWidth * (startPos - line.from));
      startY = (dir < 0 ? line.top : line.bottom) + docTop;
    }
    let resolvedGoal = rect.left + goal;
    let dist = distance2 !== null && distance2 !== void 0 ? distance2 : view.defaultLineHeight >> 1;
    for (let extra = 0; ; extra += 10) {
      let curY = startY + (dist + extra) * dir;
      let pos = posAtCoords(view, { x: resolvedGoal, y: curY }, false, dir);
      if (curY < rect.top || curY > rect.bottom || (dir < 0 ? pos < startPos : pos > startPos))
        return EditorSelection.cursor(pos, start.assoc, void 0, goal);
    }
  }
  function skipAtoms(view, oldPos, pos) {
    let atoms = view.state.facet(atomicRanges).map((f) => f(view));
    for (; ; ) {
      let moved = false;
      for (let set2 of atoms) {
        set2.between(pos.from - 1, pos.from + 1, (from, to2, value2) => {
          if (pos.from > from && pos.from < to2) {
            pos = oldPos.from > pos.from ? EditorSelection.cursor(from, 1) : EditorSelection.cursor(to2, -1);
            moved = true;
          }
        });
      }
      if (!moved)
        return pos;
    }
  }
  var InputState = class {
    constructor(view) {
      this.lastKeyCode = 0;
      this.lastKeyTime = 0;
      this.chromeScrollHack = -1;
      this.pendingIOSKey = void 0;
      this.lastSelectionOrigin = null;
      this.lastSelectionTime = 0;
      this.lastEscPress = 0;
      this.lastContextMenu = 0;
      this.scrollHandlers = [];
      this.registeredEvents = [];
      this.customHandlers = [];
      this.composing = -1;
      this.compositionFirstChange = null;
      this.compositionEndedAt = 0;
      this.rapidCompositionStart = false;
      this.mouseSelection = null;
      for (let type2 in handlers) {
        let handler = handlers[type2];
        view.contentDOM.addEventListener(type2, (event) => {
          if (!eventBelongsToEditor(view, event) || this.ignoreDuringComposition(event))
            return;
          if (type2 == "keydown" && this.keydown(view, event))
            return;
          if (this.mustFlushObserver(event))
            view.observer.forceFlush();
          if (this.runCustomHandlers(type2, view, event))
            event.preventDefault();
          else
            handler(view, event);
        });
        this.registeredEvents.push(type2);
      }
      if (browser.chrome && browser.chrome_version >= 102) {
        view.scrollDOM.addEventListener("wheel", () => {
          if (this.chromeScrollHack < 0)
            view.contentDOM.style.pointerEvents = "none";
          else
            window.clearTimeout(this.chromeScrollHack);
          this.chromeScrollHack = setTimeout(() => {
            this.chromeScrollHack = -1;
            view.contentDOM.style.pointerEvents = "";
          }, 100);
        }, { passive: true });
      }
      this.notifiedFocused = view.hasFocus;
      if (browser.safari)
        view.contentDOM.addEventListener("input", () => null);
    }
    setSelectionOrigin(origin) {
      this.lastSelectionOrigin = origin;
      this.lastSelectionTime = Date.now();
    }
    ensureHandlers(view, plugins) {
      var _a2;
      let handlers2;
      this.customHandlers = [];
      for (let plugin of plugins)
        if (handlers2 = (_a2 = plugin.update(view).spec) === null || _a2 === void 0 ? void 0 : _a2.domEventHandlers) {
          this.customHandlers.push({ plugin: plugin.value, handlers: handlers2 });
          for (let type2 in handlers2)
            if (this.registeredEvents.indexOf(type2) < 0 && type2 != "scroll") {
              this.registeredEvents.push(type2);
              view.contentDOM.addEventListener(type2, (event) => {
                if (!eventBelongsToEditor(view, event))
                  return;
                if (this.runCustomHandlers(type2, view, event))
                  event.preventDefault();
              });
            }
        }
    }
    runCustomHandlers(type2, view, event) {
      for (let set2 of this.customHandlers) {
        let handler = set2.handlers[type2];
        if (handler) {
          try {
            if (handler.call(set2.plugin, event, view) || event.defaultPrevented)
              return true;
          } catch (e) {
            logException(view.state, e);
          }
        }
      }
      return false;
    }
    runScrollHandlers(view, event) {
      for (let set2 of this.customHandlers) {
        let handler = set2.handlers.scroll;
        if (handler) {
          try {
            handler.call(set2.plugin, event, view);
          } catch (e) {
            logException(view.state, e);
          }
        }
      }
    }
    keydown(view, event) {
      this.lastKeyCode = event.keyCode;
      this.lastKeyTime = Date.now();
      if (event.keyCode == 9 && Date.now() < this.lastEscPress + 2e3)
        return true;
      if (browser.android && browser.chrome && !event.synthetic && (event.keyCode == 13 || event.keyCode == 8)) {
        view.observer.delayAndroidKey(event.key, event.keyCode);
        return true;
      }
      let pending;
      if (browser.ios && (pending = PendingKeys.find((key) => key.keyCode == event.keyCode)) && !(event.ctrlKey || event.altKey || event.metaKey) && !event.synthetic) {
        this.pendingIOSKey = pending;
        setTimeout(() => this.flushIOSKey(view), 250);
        return true;
      }
      return false;
    }
    flushIOSKey(view) {
      let key = this.pendingIOSKey;
      if (!key)
        return false;
      this.pendingIOSKey = void 0;
      return dispatchKey(view.contentDOM, key.key, key.keyCode);
    }
    ignoreDuringComposition(event) {
      if (!/^key/.test(event.type))
        return false;
      if (this.composing > 0)
        return true;
      if (browser.safari && Date.now() - this.compositionEndedAt < 100) {
        this.compositionEndedAt = 0;
        return true;
      }
      return false;
    }
    mustFlushObserver(event) {
      return event.type == "keydown" && event.keyCode != 229 || event.type == "compositionend" && !browser.ios;
    }
    startMouseSelection(mouseSelection) {
      if (this.mouseSelection)
        this.mouseSelection.destroy();
      this.mouseSelection = mouseSelection;
    }
    update(update3) {
      if (this.mouseSelection)
        this.mouseSelection.update(update3);
      if (update3.transactions.length)
        this.lastKeyCode = this.lastSelectionTime = 0;
    }
    destroy() {
      if (this.mouseSelection)
        this.mouseSelection.destroy();
    }
  };
  var PendingKeys = [
    { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
    { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
    { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
  ];
  var modifierCodes = [16, 17, 18, 20, 91, 92, 224, 225];
  var MouseSelection = class {
    constructor(view, startEvent, style2, mustSelect) {
      this.view = view;
      this.style = style2;
      this.mustSelect = mustSelect;
      this.lastEvent = startEvent;
      let doc2 = view.contentDOM.ownerDocument;
      doc2.addEventListener("mousemove", this.move = this.move.bind(this));
      doc2.addEventListener("mouseup", this.up = this.up.bind(this));
      this.extend = startEvent.shiftKey;
      this.multiple = view.state.facet(EditorState.allowMultipleSelections) && addsSelectionRange(view, startEvent);
      this.dragMove = dragMovesSelection(view, startEvent);
      this.dragging = isInPrimarySelection(view, startEvent) && getClickType(startEvent) == 1 ? null : false;
      if (this.dragging === false) {
        startEvent.preventDefault();
        this.select(startEvent);
      }
    }
    move(event) {
      if (event.buttons == 0)
        return this.destroy();
      if (this.dragging !== false)
        return;
      this.select(this.lastEvent = event);
    }
    up(event) {
      if (this.dragging == null)
        this.select(this.lastEvent);
      if (!this.dragging)
        event.preventDefault();
      this.destroy();
    }
    destroy() {
      let doc2 = this.view.contentDOM.ownerDocument;
      doc2.removeEventListener("mousemove", this.move);
      doc2.removeEventListener("mouseup", this.up);
      this.view.inputState.mouseSelection = null;
    }
    select(event) {
      let selection = this.style.get(event, this.extend, this.multiple);
      if (this.mustSelect || !selection.eq(this.view.state.selection) || selection.main.assoc != this.view.state.selection.main.assoc)
        this.view.dispatch({
          selection,
          userEvent: "select.pointer",
          scrollIntoView: true
        });
      this.mustSelect = false;
    }
    update(update3) {
      if (update3.docChanged && this.dragging)
        this.dragging = this.dragging.map(update3.changes);
      if (this.style.update(update3))
        setTimeout(() => this.select(this.lastEvent), 20);
    }
  };
  function addsSelectionRange(view, event) {
    let facet = view.state.facet(clickAddsSelectionRange);
    return facet.length ? facet[0](event) : browser.mac ? event.metaKey : event.ctrlKey;
  }
  function dragMovesSelection(view, event) {
    let facet = view.state.facet(dragMovesSelection$1);
    return facet.length ? facet[0](event) : browser.mac ? !event.altKey : !event.ctrlKey;
  }
  function isInPrimarySelection(view, event) {
    let { main } = view.state.selection;
    if (main.empty)
      return false;
    let sel = getSelection(view.root);
    if (sel.rangeCount == 0)
      return true;
    let rects = sel.getRangeAt(0).getClientRects();
    for (let i = 0; i < rects.length; i++) {
      let rect = rects[i];
      if (rect.left <= event.clientX && rect.right >= event.clientX && rect.top <= event.clientY && rect.bottom >= event.clientY)
        return true;
    }
    return false;
  }
  function eventBelongsToEditor(view, event) {
    if (!event.bubbles)
      return true;
    if (event.defaultPrevented)
      return false;
    for (let node = event.target, cView; node != view.contentDOM; node = node.parentNode)
      if (!node || node.nodeType == 11 || (cView = ContentView.get(node)) && cView.ignoreEvent(event))
        return false;
    return true;
  }
  var handlers = /* @__PURE__ */ Object.create(null);
  var brokenClipboardAPI = browser.ie && browser.ie_version < 15 || browser.ios && browser.webkit_version < 604;
  function capturePaste(view) {
    let parent = view.dom.parentNode;
    if (!parent)
      return;
    let target = parent.appendChild(document.createElement("textarea"));
    target.style.cssText = "position: fixed; left: -10000px; top: 10px";
    target.focus();
    setTimeout(() => {
      view.focus();
      target.remove();
      doPaste(view, target.value);
    }, 50);
  }
  function doPaste(view, input) {
    let { state } = view, changes, i = 1, text = state.toText(input);
    let byLine = text.lines == state.selection.ranges.length;
    let linewise = lastLinewiseCopy != null && state.selection.ranges.every((r) => r.empty) && lastLinewiseCopy == text.toString();
    if (linewise) {
      let lastLine = -1;
      changes = state.changeByRange((range2) => {
        let line = state.doc.lineAt(range2.from);
        if (line.from == lastLine)
          return { range: range2 };
        lastLine = line.from;
        let insert2 = state.toText((byLine ? text.line(i++).text : input) + state.lineBreak);
        return {
          changes: { from: line.from, insert: insert2 },
          range: EditorSelection.cursor(range2.from + insert2.length)
        };
      });
    } else if (byLine) {
      changes = state.changeByRange((range2) => {
        let line = text.line(i++);
        return {
          changes: { from: range2.from, to: range2.to, insert: line.text },
          range: EditorSelection.cursor(range2.from + line.length)
        };
      });
    } else {
      changes = state.replaceSelection(text);
    }
    view.dispatch(changes, {
      userEvent: "input.paste",
      scrollIntoView: true
    });
  }
  handlers.keydown = (view, event) => {
    view.inputState.setSelectionOrigin("select");
    if (event.keyCode == 27)
      view.inputState.lastEscPress = Date.now();
    else if (modifierCodes.indexOf(event.keyCode) < 0)
      view.inputState.lastEscPress = 0;
  };
  var lastTouch = 0;
  handlers.touchstart = (view, e) => {
    lastTouch = Date.now();
    view.inputState.setSelectionOrigin("select.pointer");
  };
  handlers.touchmove = (view) => {
    view.inputState.setSelectionOrigin("select.pointer");
  };
  handlers.mousedown = (view, event) => {
    view.observer.flush();
    if (lastTouch > Date.now() - 2e3 && getClickType(event) == 1)
      return;
    let style2 = null;
    for (let makeStyle of view.state.facet(mouseSelectionStyle)) {
      style2 = makeStyle(view, event);
      if (style2)
        break;
    }
    if (!style2 && event.button == 0)
      style2 = basicMouseSelection(view, event);
    if (style2) {
      let mustFocus = view.root.activeElement != view.contentDOM;
      if (mustFocus)
        view.observer.ignore(() => focusPreventScroll(view.contentDOM));
      view.inputState.startMouseSelection(new MouseSelection(view, event, style2, mustFocus));
    }
  };
  function rangeForClick(view, pos, bias, type2) {
    if (type2 == 1) {
      return EditorSelection.cursor(pos, bias);
    } else if (type2 == 2) {
      return groupAt(view.state, pos, bias);
    } else {
      let visual = LineView.find(view.docView, pos), line = view.state.doc.lineAt(visual ? visual.posAtEnd : pos);
      let from = visual ? visual.posAtStart : line.from, to2 = visual ? visual.posAtEnd : line.to;
      if (to2 < view.state.doc.length && to2 == line.to)
        to2++;
      return EditorSelection.range(from, to2);
    }
  }
  var insideY = (y, rect) => y >= rect.top && y <= rect.bottom;
  var inside = (x, y, rect) => insideY(y, rect) && x >= rect.left && x <= rect.right;
  function findPositionSide(view, pos, x, y) {
    let line = LineView.find(view.docView, pos);
    if (!line)
      return 1;
    let off = pos - line.posAtStart;
    if (off == 0)
      return 1;
    if (off == line.length)
      return -1;
    let before = line.coordsAt(off, -1);
    if (before && inside(x, y, before))
      return -1;
    let after = line.coordsAt(off, 1);
    if (after && inside(x, y, after))
      return 1;
    return before && insideY(y, before) ? -1 : 1;
  }
  function queryPos(view, event) {
    let pos = view.posAtCoords({ x: event.clientX, y: event.clientY }, false);
    return { pos, bias: findPositionSide(view, pos, event.clientX, event.clientY) };
  }
  var BadMouseDetail = browser.ie && browser.ie_version <= 11;
  var lastMouseDown = null;
  var lastMouseDownCount = 0;
  var lastMouseDownTime = 0;
  function getClickType(event) {
    if (!BadMouseDetail)
      return event.detail;
    let last2 = lastMouseDown, lastTime = lastMouseDownTime;
    lastMouseDown = event;
    lastMouseDownTime = Date.now();
    return lastMouseDownCount = !last2 || lastTime > Date.now() - 400 && Math.abs(last2.clientX - event.clientX) < 2 && Math.abs(last2.clientY - event.clientY) < 2 ? (lastMouseDownCount + 1) % 3 : 1;
  }
  function basicMouseSelection(view, event) {
    let start = queryPos(view, event), type2 = getClickType(event);
    let startSel = view.state.selection;
    let last2 = start, lastEvent = event;
    return {
      update(update3) {
        if (update3.docChanged) {
          if (start)
            start.pos = update3.changes.mapPos(start.pos);
          startSel = startSel.map(update3.changes);
          lastEvent = null;
        }
      },
      get(event2, extend2, multiple) {
        let cur2;
        if (lastEvent && event2.clientX == lastEvent.clientX && event2.clientY == lastEvent.clientY)
          cur2 = last2;
        else {
          cur2 = last2 = queryPos(view, event2);
          lastEvent = event2;
        }
        if (!cur2 || !start)
          return startSel;
        let range2 = rangeForClick(view, cur2.pos, cur2.bias, type2);
        if (start.pos != cur2.pos && !extend2) {
          let startRange = rangeForClick(view, start.pos, start.bias, type2);
          let from = Math.min(startRange.from, range2.from), to2 = Math.max(startRange.to, range2.to);
          range2 = from < range2.from ? EditorSelection.range(from, to2) : EditorSelection.range(to2, from);
        }
        if (extend2)
          return startSel.replaceRange(startSel.main.extend(range2.from, range2.to));
        else if (multiple)
          return startSel.addRange(range2);
        else
          return EditorSelection.create([range2]);
      }
    };
  }
  handlers.dragstart = (view, event) => {
    let { selection: { main } } = view.state;
    let { mouseSelection } = view.inputState;
    if (mouseSelection)
      mouseSelection.dragging = main;
    if (event.dataTransfer) {
      event.dataTransfer.setData("Text", view.state.sliceDoc(main.from, main.to));
      event.dataTransfer.effectAllowed = "copyMove";
    }
  };
  function dropText(view, event, text, direct) {
    if (!text)
      return;
    let dropPos = view.posAtCoords({ x: event.clientX, y: event.clientY }, false);
    event.preventDefault();
    let { mouseSelection } = view.inputState;
    let del = direct && mouseSelection && mouseSelection.dragging && mouseSelection.dragMove ? { from: mouseSelection.dragging.from, to: mouseSelection.dragging.to } : null;
    let ins = { from: dropPos, insert: text };
    let changes = view.state.changes(del ? [del, ins] : ins);
    view.focus();
    view.dispatch({
      changes,
      selection: { anchor: changes.mapPos(dropPos, -1), head: changes.mapPos(dropPos, 1) },
      userEvent: del ? "move.drop" : "input.drop"
    });
  }
  handlers.drop = (view, event) => {
    if (!event.dataTransfer)
      return;
    if (view.state.readOnly)
      return event.preventDefault();
    let files = event.dataTransfer.files;
    if (files && files.length) {
      event.preventDefault();
      let text = Array(files.length), read2 = 0;
      let finishFile = () => {
        if (++read2 == files.length)
          dropText(view, event, text.filter((s) => s != null).join(view.state.lineBreak), false);
      };
      for (let i = 0; i < files.length; i++) {
        let reader = new FileReader();
        reader.onerror = finishFile;
        reader.onload = () => {
          if (!/[\x00-\x08\x0e-\x1f]{2}/.test(reader.result))
            text[i] = reader.result;
          finishFile();
        };
        reader.readAsText(files[i]);
      }
    } else {
      dropText(view, event, event.dataTransfer.getData("Text"), true);
    }
  };
  handlers.paste = (view, event) => {
    if (view.state.readOnly)
      return event.preventDefault();
    view.observer.flush();
    let data = brokenClipboardAPI ? null : event.clipboardData;
    if (data) {
      doPaste(view, data.getData("text/plain"));
      event.preventDefault();
    } else {
      capturePaste(view);
    }
  };
  function captureCopy(view, text) {
    let parent = view.dom.parentNode;
    if (!parent)
      return;
    let target = parent.appendChild(document.createElement("textarea"));
    target.style.cssText = "position: fixed; left: -10000px; top: 10px";
    target.value = text;
    target.focus();
    target.selectionEnd = text.length;
    target.selectionStart = 0;
    setTimeout(() => {
      target.remove();
      view.focus();
    }, 50);
  }
  function copiedRange(state) {
    let content2 = [], ranges = [], linewise = false;
    for (let range2 of state.selection.ranges)
      if (!range2.empty) {
        content2.push(state.sliceDoc(range2.from, range2.to));
        ranges.push(range2);
      }
    if (!content2.length) {
      let upto = -1;
      for (let { from } of state.selection.ranges) {
        let line = state.doc.lineAt(from);
        if (line.number > upto) {
          content2.push(line.text);
          ranges.push({ from: line.from, to: Math.min(state.doc.length, line.to + 1) });
        }
        upto = line.number;
      }
      linewise = true;
    }
    return { text: content2.join(state.lineBreak), ranges, linewise };
  }
  var lastLinewiseCopy = null;
  handlers.copy = handlers.cut = (view, event) => {
    let { text, ranges, linewise } = copiedRange(view.state);
    if (!text && !linewise)
      return;
    lastLinewiseCopy = linewise ? text : null;
    let data = brokenClipboardAPI ? null : event.clipboardData;
    if (data) {
      event.preventDefault();
      data.clearData();
      data.setData("text/plain", text);
    } else {
      captureCopy(view, text);
    }
    if (event.type == "cut" && !view.state.readOnly)
      view.dispatch({
        changes: ranges,
        scrollIntoView: true,
        userEvent: "delete.cut"
      });
  };
  function updateForFocusChange(view) {
    setTimeout(() => {
      if (view.hasFocus != view.inputState.notifiedFocused)
        view.update([]);
    }, 10);
  }
  handlers.focus = updateForFocusChange;
  handlers.blur = (view) => {
    view.observer.clearSelectionRange();
    updateForFocusChange(view);
  };
  function forceClearComposition(view, rapid) {
    if (view.docView.compositionDeco.size) {
      view.inputState.rapidCompositionStart = rapid;
      try {
        view.update([]);
      } finally {
        view.inputState.rapidCompositionStart = false;
      }
    }
  }
  handlers.compositionstart = handlers.compositionupdate = (view) => {
    if (view.inputState.compositionFirstChange == null)
      view.inputState.compositionFirstChange = true;
    if (view.inputState.composing < 0) {
      view.inputState.composing = 0;
      if (view.docView.compositionDeco.size) {
        view.observer.flush();
        forceClearComposition(view, true);
      }
    }
  };
  handlers.compositionend = (view) => {
    view.inputState.composing = -1;
    view.inputState.compositionEndedAt = Date.now();
    view.inputState.compositionFirstChange = null;
    setTimeout(() => {
      if (view.inputState.composing < 0)
        forceClearComposition(view, false);
    }, 50);
  };
  handlers.contextmenu = (view) => {
    view.inputState.lastContextMenu = Date.now();
  };
  handlers.beforeinput = (view, event) => {
    var _a2;
    let pending;
    if (browser.chrome && browser.android && (pending = PendingKeys.find((key) => key.inputType == event.inputType))) {
      view.observer.delayAndroidKey(pending.key, pending.keyCode);
      if (pending.key == "Backspace" || pending.key == "Delete") {
        let startViewHeight = ((_a2 = window.visualViewport) === null || _a2 === void 0 ? void 0 : _a2.height) || 0;
        setTimeout(() => {
          var _a3;
          if ((((_a3 = window.visualViewport) === null || _a3 === void 0 ? void 0 : _a3.height) || 0) > startViewHeight + 10 && view.hasFocus) {
            view.contentDOM.blur();
            view.focus();
          }
        }, 100);
      }
    }
  };
  var wrappingWhiteSpace = ["pre-wrap", "normal", "pre-line", "break-spaces"];
  var HeightOracle = class {
    constructor() {
      this.doc = Text.empty;
      this.lineWrapping = false;
      this.heightSamples = {};
      this.lineHeight = 14;
      this.charWidth = 7;
      this.lineLength = 30;
      this.heightChanged = false;
    }
    heightForGap(from, to2) {
      let lines = this.doc.lineAt(to2).number - this.doc.lineAt(from).number + 1;
      if (this.lineWrapping)
        lines += Math.ceil((to2 - from - lines * this.lineLength * 0.5) / this.lineLength);
      return this.lineHeight * lines;
    }
    heightForLine(length) {
      if (!this.lineWrapping)
        return this.lineHeight;
      let lines = 1 + Math.max(0, Math.ceil((length - this.lineLength) / (this.lineLength - 5)));
      return lines * this.lineHeight;
    }
    setDoc(doc2) {
      this.doc = doc2;
      return this;
    }
    mustRefreshForWrapping(whiteSpace) {
      return wrappingWhiteSpace.indexOf(whiteSpace) > -1 != this.lineWrapping;
    }
    mustRefreshForHeights(lineHeights) {
      let newHeight = false;
      for (let i = 0; i < lineHeights.length; i++) {
        let h = lineHeights[i];
        if (h < 0) {
          i++;
        } else if (!this.heightSamples[Math.floor(h * 10)]) {
          newHeight = true;
          this.heightSamples[Math.floor(h * 10)] = true;
        }
      }
      return newHeight;
    }
    refresh(whiteSpace, lineHeight, charWidth, lineLength, knownHeights) {
      let lineWrapping = wrappingWhiteSpace.indexOf(whiteSpace) > -1;
      let changed = Math.round(lineHeight) != Math.round(this.lineHeight) || this.lineWrapping != lineWrapping;
      this.lineWrapping = lineWrapping;
      this.lineHeight = lineHeight;
      this.charWidth = charWidth;
      this.lineLength = lineLength;
      if (changed) {
        this.heightSamples = {};
        for (let i = 0; i < knownHeights.length; i++) {
          let h = knownHeights[i];
          if (h < 0)
            i++;
          else
            this.heightSamples[Math.floor(h * 10)] = true;
        }
      }
      return changed;
    }
  };
  var MeasuredHeights = class {
    constructor(from, heights) {
      this.from = from;
      this.heights = heights;
      this.index = 0;
    }
    get more() {
      return this.index < this.heights.length;
    }
  };
  var BlockInfo = class {
    constructor(from, length, top2, height, type2) {
      this.from = from;
      this.length = length;
      this.top = top2;
      this.height = height;
      this.type = type2;
    }
    get to() {
      return this.from + this.length;
    }
    get bottom() {
      return this.top + this.height;
    }
    join(other) {
      let detail = (Array.isArray(this.type) ? this.type : [this]).concat(Array.isArray(other.type) ? other.type : [other]);
      return new BlockInfo(this.from, this.length + other.length, this.top, this.height + other.height, detail);
    }
  };
  var QueryType = /* @__PURE__ */ function(QueryType3) {
    QueryType3[QueryType3["ByPos"] = 0] = "ByPos";
    QueryType3[QueryType3["ByHeight"] = 1] = "ByHeight";
    QueryType3[QueryType3["ByPosNoHeight"] = 2] = "ByPosNoHeight";
    return QueryType3;
  }(QueryType || (QueryType = {}));
  var Epsilon = 1e-3;
  var HeightMap = class {
    constructor(length, height, flags = 2) {
      this.length = length;
      this.height = height;
      this.flags = flags;
    }
    get outdated() {
      return (this.flags & 2) > 0;
    }
    set outdated(value2) {
      this.flags = (value2 ? 2 : 0) | this.flags & ~2;
    }
    setHeight(oracle, height) {
      if (this.height != height) {
        if (Math.abs(this.height - height) > Epsilon)
          oracle.heightChanged = true;
        this.height = height;
      }
    }
    replace(_from, _to, nodes) {
      return HeightMap.of(nodes);
    }
    decomposeLeft(_to, result) {
      result.push(this);
    }
    decomposeRight(_from, result) {
      result.push(this);
    }
    applyChanges(decorations2, oldDoc, oracle, changes) {
      let me = this;
      for (let i = changes.length - 1; i >= 0; i--) {
        let { fromA, toA, fromB, toB } = changes[i];
        let start = me.lineAt(fromA, QueryType.ByPosNoHeight, oldDoc, 0, 0);
        let end = start.to >= toA ? start : me.lineAt(toA, QueryType.ByPosNoHeight, oldDoc, 0, 0);
        toB += end.to - toA;
        toA = end.to;
        while (i > 0 && start.from <= changes[i - 1].toA) {
          fromA = changes[i - 1].fromA;
          fromB = changes[i - 1].fromB;
          i--;
          if (fromA < start.from)
            start = me.lineAt(fromA, QueryType.ByPosNoHeight, oldDoc, 0, 0);
        }
        fromB += start.from - fromA;
        fromA = start.from;
        let nodes = NodeBuilder.build(oracle, decorations2, fromB, toB);
        me = me.replace(fromA, toA, nodes);
      }
      return me.updateHeight(oracle, 0);
    }
    static empty() {
      return new HeightMapText(0, 0);
    }
    static of(nodes) {
      if (nodes.length == 1)
        return nodes[0];
      let i = 0, j = nodes.length, before = 0, after = 0;
      for (; ; ) {
        if (i == j) {
          if (before > after * 2) {
            let split = nodes[i - 1];
            if (split.break)
              nodes.splice(--i, 1, split.left, null, split.right);
            else
              nodes.splice(--i, 1, split.left, split.right);
            j += 1 + split.break;
            before -= split.size;
          } else if (after > before * 2) {
            let split = nodes[j];
            if (split.break)
              nodes.splice(j, 1, split.left, null, split.right);
            else
              nodes.splice(j, 1, split.left, split.right);
            j += 2 + split.break;
            after -= split.size;
          } else {
            break;
          }
        } else if (before < after) {
          let next = nodes[i++];
          if (next)
            before += next.size;
        } else {
          let next = nodes[--j];
          if (next)
            after += next.size;
        }
      }
      let brk = 0;
      if (nodes[i - 1] == null) {
        brk = 1;
        i--;
      } else if (nodes[i] == null) {
        brk = 1;
        j++;
      }
      return new HeightMapBranch(HeightMap.of(nodes.slice(0, i)), brk, HeightMap.of(nodes.slice(j)));
    }
  };
  HeightMap.prototype.size = 1;
  var HeightMapBlock = class extends HeightMap {
    constructor(length, height, type2) {
      super(length, height);
      this.type = type2;
    }
    blockAt(_height, _doc, top2, offset) {
      return new BlockInfo(offset, this.length, top2, this.height, this.type);
    }
    lineAt(_value, _type, doc2, top2, offset) {
      return this.blockAt(0, doc2, top2, offset);
    }
    forEachLine(from, to2, doc2, top2, offset, f) {
      if (from <= offset + this.length && to2 >= offset)
        f(this.blockAt(0, doc2, top2, offset));
    }
    updateHeight(oracle, offset = 0, _force = false, measured) {
      if (measured && measured.from <= offset && measured.more)
        this.setHeight(oracle, measured.heights[measured.index++]);
      this.outdated = false;
      return this;
    }
    toString() {
      return `block(${this.length})`;
    }
  };
  var HeightMapText = class extends HeightMapBlock {
    constructor(length, height) {
      super(length, height, BlockType.Text);
      this.collapsed = 0;
      this.widgetHeight = 0;
    }
    replace(_from, _to, nodes) {
      let node = nodes[0];
      if (nodes.length == 1 && (node instanceof HeightMapText || node instanceof HeightMapGap && node.flags & 4) && Math.abs(this.length - node.length) < 10) {
        if (node instanceof HeightMapGap)
          node = new HeightMapText(node.length, this.height);
        else
          node.height = this.height;
        if (!this.outdated)
          node.outdated = false;
        return node;
      } else {
        return HeightMap.of(nodes);
      }
    }
    updateHeight(oracle, offset = 0, force = false, measured) {
      if (measured && measured.from <= offset && measured.more)
        this.setHeight(oracle, measured.heights[measured.index++]);
      else if (force || this.outdated)
        this.setHeight(oracle, Math.max(this.widgetHeight, oracle.heightForLine(this.length - this.collapsed)));
      this.outdated = false;
      return this;
    }
    toString() {
      return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
    }
  };
  var HeightMapGap = class extends HeightMap {
    constructor(length) {
      super(length, 0);
    }
    lines(doc2, offset) {
      let firstLine = doc2.lineAt(offset).number, lastLine = doc2.lineAt(offset + this.length).number;
      return { firstLine, lastLine, lineHeight: this.height / (lastLine - firstLine + 1) };
    }
    blockAt(height, doc2, top2, offset) {
      let { firstLine, lastLine, lineHeight } = this.lines(doc2, offset);
      let line = Math.max(0, Math.min(lastLine - firstLine, Math.floor((height - top2) / lineHeight)));
      let { from, length } = doc2.line(firstLine + line);
      return new BlockInfo(from, length, top2 + lineHeight * line, lineHeight, BlockType.Text);
    }
    lineAt(value2, type2, doc2, top2, offset) {
      if (type2 == QueryType.ByHeight)
        return this.blockAt(value2, doc2, top2, offset);
      if (type2 == QueryType.ByPosNoHeight) {
        let { from: from2, to: to2 } = doc2.lineAt(value2);
        return new BlockInfo(from2, to2 - from2, 0, 0, BlockType.Text);
      }
      let { firstLine, lineHeight } = this.lines(doc2, offset);
      let { from, length, number: number2 } = doc2.lineAt(value2);
      return new BlockInfo(from, length, top2 + lineHeight * (number2 - firstLine), lineHeight, BlockType.Text);
    }
    forEachLine(from, to2, doc2, top2, offset, f) {
      let { firstLine, lineHeight } = this.lines(doc2, offset);
      for (let pos = Math.max(from, offset), end = Math.min(offset + this.length, to2); pos <= end; ) {
        let line = doc2.lineAt(pos);
        if (pos == from)
          top2 += lineHeight * (line.number - firstLine);
        f(new BlockInfo(line.from, line.length, top2, lineHeight, BlockType.Text));
        top2 += lineHeight;
        pos = line.to + 1;
      }
    }
    replace(from, to2, nodes) {
      let after = this.length - to2;
      if (after > 0) {
        let last2 = nodes[nodes.length - 1];
        if (last2 instanceof HeightMapGap)
          nodes[nodes.length - 1] = new HeightMapGap(last2.length + after);
        else
          nodes.push(null, new HeightMapGap(after - 1));
      }
      if (from > 0) {
        let first = nodes[0];
        if (first instanceof HeightMapGap)
          nodes[0] = new HeightMapGap(from + first.length);
        else
          nodes.unshift(new HeightMapGap(from - 1), null);
      }
      return HeightMap.of(nodes);
    }
    decomposeLeft(to2, result) {
      result.push(new HeightMapGap(to2 - 1), null);
    }
    decomposeRight(from, result) {
      result.push(null, new HeightMapGap(this.length - from - 1));
    }
    updateHeight(oracle, offset = 0, force = false, measured) {
      let end = offset + this.length;
      if (measured && measured.from <= offset + this.length && measured.more) {
        let nodes = [], pos = Math.max(offset, measured.from), singleHeight = -1;
        let wasChanged = oracle.heightChanged;
        if (measured.from > offset)
          nodes.push(new HeightMapGap(measured.from - offset - 1).updateHeight(oracle, offset));
        while (pos <= end && measured.more) {
          let len = oracle.doc.lineAt(pos).length;
          if (nodes.length)
            nodes.push(null);
          let height = measured.heights[measured.index++];
          if (singleHeight == -1)
            singleHeight = height;
          else if (Math.abs(height - singleHeight) >= Epsilon)
            singleHeight = -2;
          let line = new HeightMapText(len, height);
          line.outdated = false;
          nodes.push(line);
          pos += len + 1;
        }
        if (pos <= end)
          nodes.push(null, new HeightMapGap(end - pos).updateHeight(oracle, pos));
        let result = HeightMap.of(nodes);
        oracle.heightChanged = wasChanged || singleHeight < 0 || Math.abs(result.height - this.height) >= Epsilon || Math.abs(singleHeight - this.lines(oracle.doc, offset).lineHeight) >= Epsilon;
        return result;
      } else if (force || this.outdated) {
        this.setHeight(oracle, oracle.heightForGap(offset, offset + this.length));
        this.outdated = false;
      }
      return this;
    }
    toString() {
      return `gap(${this.length})`;
    }
  };
  var HeightMapBranch = class extends HeightMap {
    constructor(left, brk, right) {
      super(left.length + brk + right.length, left.height + right.height, brk | (left.outdated || right.outdated ? 2 : 0));
      this.left = left;
      this.right = right;
      this.size = left.size + right.size;
    }
    get break() {
      return this.flags & 1;
    }
    blockAt(height, doc2, top2, offset) {
      let mid = top2 + this.left.height;
      return height < mid ? this.left.blockAt(height, doc2, top2, offset) : this.right.blockAt(height, doc2, mid, offset + this.left.length + this.break);
    }
    lineAt(value2, type2, doc2, top2, offset) {
      let rightTop = top2 + this.left.height, rightOffset = offset + this.left.length + this.break;
      let left = type2 == QueryType.ByHeight ? value2 < rightTop : value2 < rightOffset;
      let base2 = left ? this.left.lineAt(value2, type2, doc2, top2, offset) : this.right.lineAt(value2, type2, doc2, rightTop, rightOffset);
      if (this.break || (left ? base2.to < rightOffset : base2.from > rightOffset))
        return base2;
      let subQuery = type2 == QueryType.ByPosNoHeight ? QueryType.ByPosNoHeight : QueryType.ByPos;
      if (left)
        return base2.join(this.right.lineAt(rightOffset, subQuery, doc2, rightTop, rightOffset));
      else
        return this.left.lineAt(rightOffset, subQuery, doc2, top2, offset).join(base2);
    }
    forEachLine(from, to2, doc2, top2, offset, f) {
      let rightTop = top2 + this.left.height, rightOffset = offset + this.left.length + this.break;
      if (this.break) {
        if (from < rightOffset)
          this.left.forEachLine(from, to2, doc2, top2, offset, f);
        if (to2 >= rightOffset)
          this.right.forEachLine(from, to2, doc2, rightTop, rightOffset, f);
      } else {
        let mid = this.lineAt(rightOffset, QueryType.ByPos, doc2, top2, offset);
        if (from < mid.from)
          this.left.forEachLine(from, mid.from - 1, doc2, top2, offset, f);
        if (mid.to >= from && mid.from <= to2)
          f(mid);
        if (to2 > mid.to)
          this.right.forEachLine(mid.to + 1, to2, doc2, rightTop, rightOffset, f);
      }
    }
    replace(from, to2, nodes) {
      let rightStart = this.left.length + this.break;
      if (to2 < rightStart)
        return this.balanced(this.left.replace(from, to2, nodes), this.right);
      if (from > this.left.length)
        return this.balanced(this.left, this.right.replace(from - rightStart, to2 - rightStart, nodes));
      let result = [];
      if (from > 0)
        this.decomposeLeft(from, result);
      let left = result.length;
      for (let node of nodes)
        result.push(node);
      if (from > 0)
        mergeGaps(result, left - 1);
      if (to2 < this.length) {
        let right = result.length;
        this.decomposeRight(to2, result);
        mergeGaps(result, right);
      }
      return HeightMap.of(result);
    }
    decomposeLeft(to2, result) {
      let left = this.left.length;
      if (to2 <= left)
        return this.left.decomposeLeft(to2, result);
      result.push(this.left);
      if (this.break) {
        left++;
        if (to2 >= left)
          result.push(null);
      }
      if (to2 > left)
        this.right.decomposeLeft(to2 - left, result);
    }
    decomposeRight(from, result) {
      let left = this.left.length, right = left + this.break;
      if (from >= right)
        return this.right.decomposeRight(from - right, result);
      if (from < left)
        this.left.decomposeRight(from, result);
      if (this.break && from < right)
        result.push(null);
      result.push(this.right);
    }
    balanced(left, right) {
      if (left.size > 2 * right.size || right.size > 2 * left.size)
        return HeightMap.of(this.break ? [left, null, right] : [left, right]);
      this.left = left;
      this.right = right;
      this.height = left.height + right.height;
      this.outdated = left.outdated || right.outdated;
      this.size = left.size + right.size;
      this.length = left.length + this.break + right.length;
      return this;
    }
    updateHeight(oracle, offset = 0, force = false, measured) {
      let { left, right } = this, rightStart = offset + left.length + this.break, rebalance = null;
      if (measured && measured.from <= offset + left.length && measured.more)
        rebalance = left = left.updateHeight(oracle, offset, force, measured);
      else
        left.updateHeight(oracle, offset, force);
      if (measured && measured.from <= rightStart + right.length && measured.more)
        rebalance = right = right.updateHeight(oracle, rightStart, force, measured);
      else
        right.updateHeight(oracle, rightStart, force);
      if (rebalance)
        return this.balanced(left, right);
      this.height = this.left.height + this.right.height;
      this.outdated = false;
      return this;
    }
    toString() {
      return this.left + (this.break ? " " : "-") + this.right;
    }
  };
  function mergeGaps(nodes, around) {
    let before, after;
    if (nodes[around] == null && (before = nodes[around - 1]) instanceof HeightMapGap && (after = nodes[around + 1]) instanceof HeightMapGap)
      nodes.splice(around - 1, 3, new HeightMapGap(before.length + 1 + after.length));
  }
  var relevantWidgetHeight = 5;
  var NodeBuilder = class {
    constructor(pos, oracle) {
      this.pos = pos;
      this.oracle = oracle;
      this.nodes = [];
      this.lineStart = -1;
      this.lineEnd = -1;
      this.covering = null;
      this.writtenTo = pos;
    }
    get isCovered() {
      return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
    }
    span(_from, to2) {
      if (this.lineStart > -1) {
        let end = Math.min(to2, this.lineEnd), last2 = this.nodes[this.nodes.length - 1];
        if (last2 instanceof HeightMapText)
          last2.length += end - this.pos;
        else if (end > this.pos || !this.isCovered)
          this.nodes.push(new HeightMapText(end - this.pos, -1));
        this.writtenTo = end;
        if (to2 > end) {
          this.nodes.push(null);
          this.writtenTo++;
          this.lineStart = -1;
        }
      }
      this.pos = to2;
    }
    point(from, to2, deco) {
      if (from < to2 || deco.heightRelevant) {
        let height = deco.widget ? deco.widget.estimatedHeight : 0;
        if (height < 0)
          height = this.oracle.lineHeight;
        let len = to2 - from;
        if (deco.block) {
          this.addBlock(new HeightMapBlock(len, height, deco.type));
        } else if (len || height >= relevantWidgetHeight) {
          this.addLineDeco(height, len);
        }
      } else if (to2 > from) {
        this.span(from, to2);
      }
      if (this.lineEnd > -1 && this.lineEnd < this.pos)
        this.lineEnd = this.oracle.doc.lineAt(this.pos).to;
    }
    enterLine() {
      if (this.lineStart > -1)
        return;
      let { from, to: to2 } = this.oracle.doc.lineAt(this.pos);
      this.lineStart = from;
      this.lineEnd = to2;
      if (this.writtenTo < from) {
        if (this.writtenTo < from - 1 || this.nodes[this.nodes.length - 1] == null)
          this.nodes.push(this.blankContent(this.writtenTo, from - 1));
        this.nodes.push(null);
      }
      if (this.pos > from)
        this.nodes.push(new HeightMapText(this.pos - from, -1));
      this.writtenTo = this.pos;
    }
    blankContent(from, to2) {
      let gap = new HeightMapGap(to2 - from);
      if (this.oracle.doc.lineAt(from).to == to2)
        gap.flags |= 4;
      return gap;
    }
    ensureLine() {
      this.enterLine();
      let last2 = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
      if (last2 instanceof HeightMapText)
        return last2;
      let line = new HeightMapText(0, -1);
      this.nodes.push(line);
      return line;
    }
    addBlock(block) {
      this.enterLine();
      if (block.type == BlockType.WidgetAfter && !this.isCovered)
        this.ensureLine();
      this.nodes.push(block);
      this.writtenTo = this.pos = this.pos + block.length;
      if (block.type != BlockType.WidgetBefore)
        this.covering = block;
    }
    addLineDeco(height, length) {
      let line = this.ensureLine();
      line.length += length;
      line.collapsed += length;
      line.widgetHeight = Math.max(line.widgetHeight, height);
      this.writtenTo = this.pos = this.pos + length;
    }
    finish(from) {
      let last2 = this.nodes.length == 0 ? null : this.nodes[this.nodes.length - 1];
      if (this.lineStart > -1 && !(last2 instanceof HeightMapText) && !this.isCovered)
        this.nodes.push(new HeightMapText(0, -1));
      else if (this.writtenTo < this.pos || last2 == null)
        this.nodes.push(this.blankContent(this.writtenTo, this.pos));
      let pos = from;
      for (let node of this.nodes) {
        if (node instanceof HeightMapText)
          node.updateHeight(this.oracle, pos);
        pos += node ? node.length : 1;
      }
      return this.nodes;
    }
    static build(oracle, decorations2, from, to2) {
      let builder = new NodeBuilder(from, oracle);
      RangeSet.spans(decorations2, from, to2, builder, 0);
      return builder.finish(from);
    }
  };
  function heightRelevantDecoChanges(a2, b2, diff) {
    let comp = new DecorationComparator();
    RangeSet.compare(a2, b2, diff, comp, 0);
    return comp.changes;
  }
  var DecorationComparator = class {
    constructor() {
      this.changes = [];
    }
    compareRange() {
    }
    comparePoint(from, to2, a2, b2) {
      if (from < to2 || a2 && a2.heightRelevant || b2 && b2.heightRelevant)
        addRange(from, to2, this.changes, 5);
    }
  };
  function visiblePixelRange(dom, paddingTop) {
    let rect = dom.getBoundingClientRect();
    let left = Math.max(0, rect.left), right = Math.min(innerWidth, rect.right);
    let top2 = Math.max(0, rect.top), bottom = Math.min(innerHeight, rect.bottom);
    let body = dom.ownerDocument.body;
    for (let parent = dom.parentNode; parent && parent != body; ) {
      if (parent.nodeType == 1) {
        let elt = parent;
        let style2 = window.getComputedStyle(elt);
        if ((elt.scrollHeight > elt.clientHeight || elt.scrollWidth > elt.clientWidth) && style2.overflow != "visible") {
          let parentRect = elt.getBoundingClientRect();
          left = Math.max(left, parentRect.left);
          right = Math.min(right, parentRect.right);
          top2 = Math.max(top2, parentRect.top);
          bottom = Math.min(bottom, parentRect.bottom);
        }
        parent = style2.position == "absolute" || style2.position == "fixed" ? elt.offsetParent : elt.parentNode;
      } else if (parent.nodeType == 11) {
        parent = parent.host;
      } else {
        break;
      }
    }
    return {
      left: left - rect.left,
      right: Math.max(left, right) - rect.left,
      top: top2 - (rect.top + paddingTop),
      bottom: Math.max(top2, bottom) - (rect.top + paddingTop)
    };
  }
  function fullPixelRange(dom, paddingTop) {
    let rect = dom.getBoundingClientRect();
    return {
      left: 0,
      right: rect.right - rect.left,
      top: paddingTop,
      bottom: rect.bottom - (rect.top + paddingTop)
    };
  }
  var LineGap = class {
    constructor(from, to2, size) {
      this.from = from;
      this.to = to2;
      this.size = size;
    }
    static same(a2, b2) {
      if (a2.length != b2.length)
        return false;
      for (let i = 0; i < a2.length; i++) {
        let gA = a2[i], gB = b2[i];
        if (gA.from != gB.from || gA.to != gB.to || gA.size != gB.size)
          return false;
      }
      return true;
    }
    draw(wrapping) {
      return Decoration.replace({ widget: new LineGapWidget(this.size, wrapping) }).range(this.from, this.to);
    }
  };
  var LineGapWidget = class extends WidgetType {
    constructor(size, vertical) {
      super();
      this.size = size;
      this.vertical = vertical;
    }
    eq(other) {
      return other.size == this.size && other.vertical == this.vertical;
    }
    toDOM() {
      let elt = document.createElement("div");
      if (this.vertical) {
        elt.style.height = this.size + "px";
      } else {
        elt.style.width = this.size + "px";
        elt.style.height = "2px";
        elt.style.display = "inline-block";
      }
      return elt;
    }
    get estimatedHeight() {
      return this.vertical ? this.size : -1;
    }
  };
  var ViewState = class {
    constructor(state) {
      this.state = state;
      this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 };
      this.inView = true;
      this.paddingTop = 0;
      this.paddingBottom = 0;
      this.contentDOMWidth = 0;
      this.contentDOMHeight = 0;
      this.editorHeight = 0;
      this.editorWidth = 0;
      this.heightOracle = new HeightOracle();
      this.scaler = IdScaler;
      this.scrollTarget = null;
      this.printing = false;
      this.mustMeasureContent = true;
      this.defaultTextDirection = Direction.RTL;
      this.visibleRanges = [];
      this.mustEnforceCursorAssoc = false;
      this.stateDeco = state.facet(decorations).filter((d2) => typeof d2 != "function");
      this.heightMap = HeightMap.empty().applyChanges(this.stateDeco, Text.empty, this.heightOracle.setDoc(state.doc), [new ChangedRange(0, 0, 0, state.doc.length)]);
      this.viewport = this.getViewport(0, null);
      this.updateViewportLines();
      this.updateForViewport();
      this.lineGaps = this.ensureLineGaps([]);
      this.lineGapDeco = Decoration.set(this.lineGaps.map((gap) => gap.draw(false)));
      this.computeVisibleRanges();
    }
    updateForViewport() {
      let viewports = [this.viewport], { main } = this.state.selection;
      for (let i = 0; i <= 1; i++) {
        let pos = i ? main.head : main.anchor;
        if (!viewports.some(({ from, to: to2 }) => pos >= from && pos <= to2)) {
          let { from, to: to2 } = this.lineBlockAt(pos);
          viewports.push(new Viewport(from, to2));
        }
      }
      this.viewports = viewports.sort((a2, b2) => a2.from - b2.from);
      this.scaler = this.heightMap.height <= 7e6 ? IdScaler : new BigScaler(this.heightOracle.doc, this.heightMap, this.viewports);
    }
    updateViewportLines() {
      this.viewportLines = [];
      this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.state.doc, 0, 0, (block) => {
        this.viewportLines.push(this.scaler.scale == 1 ? block : scaleBlock(block, this.scaler));
      });
    }
    update(update3, scrollTarget = null) {
      this.state = update3.state;
      let prevDeco = this.stateDeco;
      this.stateDeco = this.state.facet(decorations).filter((d2) => typeof d2 != "function");
      let contentChanges = update3.changedRanges;
      let heightChanges = ChangedRange.extendWithRanges(contentChanges, heightRelevantDecoChanges(prevDeco, this.stateDeco, update3 ? update3.changes : ChangeSet.empty(this.state.doc.length)));
      let prevHeight = this.heightMap.height;
      this.heightMap = this.heightMap.applyChanges(this.stateDeco, update3.startState.doc, this.heightOracle.setDoc(this.state.doc), heightChanges);
      if (this.heightMap.height != prevHeight)
        update3.flags |= 2;
      let viewport = heightChanges.length ? this.mapViewport(this.viewport, update3.changes) : this.viewport;
      if (scrollTarget && (scrollTarget.range.head < viewport.from || scrollTarget.range.head > viewport.to) || !this.viewportIsAppropriate(viewport))
        viewport = this.getViewport(0, scrollTarget);
      let updateLines = !update3.changes.empty || update3.flags & 2 || viewport.from != this.viewport.from || viewport.to != this.viewport.to;
      this.viewport = viewport;
      this.updateForViewport();
      if (updateLines)
        this.updateViewportLines();
      if (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3)
        this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, update3.changes)));
      update3.flags |= this.computeVisibleRanges();
      if (scrollTarget)
        this.scrollTarget = scrollTarget;
      if (!this.mustEnforceCursorAssoc && update3.selectionSet && update3.view.lineWrapping && update3.state.selection.main.empty && update3.state.selection.main.assoc)
        this.mustEnforceCursorAssoc = true;
    }
    measure(view) {
      let dom = view.contentDOM, style2 = window.getComputedStyle(dom);
      let oracle = this.heightOracle;
      let whiteSpace = style2.whiteSpace;
      this.defaultTextDirection = style2.direction == "rtl" ? Direction.RTL : Direction.LTR;
      let refresh = this.heightOracle.mustRefreshForWrapping(whiteSpace);
      let measureContent = refresh || this.mustMeasureContent || this.contentDOMHeight != dom.clientHeight;
      this.contentDOMHeight = dom.clientHeight;
      this.mustMeasureContent = false;
      let result = 0, bias = 0;
      let paddingTop = parseInt(style2.paddingTop) || 0, paddingBottom = parseInt(style2.paddingBottom) || 0;
      if (this.paddingTop != paddingTop || this.paddingBottom != paddingBottom) {
        this.paddingTop = paddingTop;
        this.paddingBottom = paddingBottom;
        result |= 8 | 2;
      }
      if (this.editorWidth != view.scrollDOM.clientWidth) {
        if (oracle.lineWrapping)
          measureContent = true;
        this.editorWidth = view.scrollDOM.clientWidth;
        result |= 8;
      }
      let pixelViewport = (this.printing ? fullPixelRange : visiblePixelRange)(dom, this.paddingTop);
      let dTop = pixelViewport.top - this.pixelViewport.top, dBottom = pixelViewport.bottom - this.pixelViewport.bottom;
      this.pixelViewport = pixelViewport;
      let inView = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
      if (inView != this.inView) {
        this.inView = inView;
        if (inView)
          measureContent = true;
      }
      if (!this.inView)
        return 0;
      let contentWidth = dom.clientWidth;
      if (this.contentDOMWidth != contentWidth || this.editorHeight != view.scrollDOM.clientHeight) {
        this.contentDOMWidth = contentWidth;
        this.editorHeight = view.scrollDOM.clientHeight;
        result |= 8;
      }
      if (measureContent) {
        let lineHeights = view.docView.measureVisibleLineHeights(this.viewport);
        if (oracle.mustRefreshForHeights(lineHeights))
          refresh = true;
        if (refresh || oracle.lineWrapping && Math.abs(contentWidth - this.contentDOMWidth) > oracle.charWidth) {
          let { lineHeight, charWidth } = view.docView.measureTextSize();
          refresh = oracle.refresh(whiteSpace, lineHeight, charWidth, contentWidth / charWidth, lineHeights);
          if (refresh) {
            view.docView.minWidth = 0;
            result |= 8;
          }
        }
        if (dTop > 0 && dBottom > 0)
          bias = Math.max(dTop, dBottom);
        else if (dTop < 0 && dBottom < 0)
          bias = Math.min(dTop, dBottom);
        oracle.heightChanged = false;
        for (let vp of this.viewports) {
          let heights = vp.from == this.viewport.from ? lineHeights : view.docView.measureVisibleLineHeights(vp);
          this.heightMap = this.heightMap.updateHeight(oracle, 0, refresh, new MeasuredHeights(vp.from, heights));
        }
        if (oracle.heightChanged)
          result |= 2;
      }
      let viewportChange = !this.viewportIsAppropriate(this.viewport, bias) || this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to);
      if (viewportChange)
        this.viewport = this.getViewport(bias, this.scrollTarget);
      this.updateForViewport();
      if (result & 2 || viewportChange)
        this.updateViewportLines();
      if (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3)
        this.updateLineGaps(this.ensureLineGaps(refresh ? [] : this.lineGaps));
      result |= this.computeVisibleRanges();
      if (this.mustEnforceCursorAssoc) {
        this.mustEnforceCursorAssoc = false;
        view.docView.enforceCursorAssoc();
      }
      return result;
    }
    get visibleTop() {
      return this.scaler.fromDOM(this.pixelViewport.top);
    }
    get visibleBottom() {
      return this.scaler.fromDOM(this.pixelViewport.bottom);
    }
    getViewport(bias, scrollTarget) {
      let marginTop = 0.5 - Math.max(-0.5, Math.min(0.5, bias / 1e3 / 2));
      let map = this.heightMap, doc2 = this.state.doc, { visibleTop, visibleBottom } = this;
      let viewport = new Viewport(map.lineAt(visibleTop - marginTop * 1e3, QueryType.ByHeight, doc2, 0, 0).from, map.lineAt(visibleBottom + (1 - marginTop) * 1e3, QueryType.ByHeight, doc2, 0, 0).to);
      if (scrollTarget) {
        let { head } = scrollTarget.range;
        if (head < viewport.from || head > viewport.to) {
          let viewHeight = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top);
          let block = map.lineAt(head, QueryType.ByPos, doc2, 0, 0), topPos;
          if (scrollTarget.y == "center")
            topPos = (block.top + block.bottom) / 2 - viewHeight / 2;
          else if (scrollTarget.y == "start" || scrollTarget.y == "nearest" && head < viewport.from)
            topPos = block.top;
          else
            topPos = block.bottom - viewHeight;
          viewport = new Viewport(map.lineAt(topPos - 1e3 / 2, QueryType.ByHeight, doc2, 0, 0).from, map.lineAt(topPos + viewHeight + 1e3 / 2, QueryType.ByHeight, doc2, 0, 0).to);
        }
      }
      return viewport;
    }
    mapViewport(viewport, changes) {
      let from = changes.mapPos(viewport.from, -1), to2 = changes.mapPos(viewport.to, 1);
      return new Viewport(this.heightMap.lineAt(from, QueryType.ByPos, this.state.doc, 0, 0).from, this.heightMap.lineAt(to2, QueryType.ByPos, this.state.doc, 0, 0).to);
    }
    viewportIsAppropriate({ from, to: to2 }, bias = 0) {
      if (!this.inView)
        return true;
      let { top: top2 } = this.heightMap.lineAt(from, QueryType.ByPos, this.state.doc, 0, 0);
      let { bottom } = this.heightMap.lineAt(to2, QueryType.ByPos, this.state.doc, 0, 0);
      let { visibleTop, visibleBottom } = this;
      return (from == 0 || top2 <= visibleTop - Math.max(10, Math.min(-bias, 250))) && (to2 == this.state.doc.length || bottom >= visibleBottom + Math.max(10, Math.min(bias, 250))) && (top2 > visibleTop - 2 * 1e3 && bottom < visibleBottom + 2 * 1e3);
    }
    mapLineGaps(gaps, changes) {
      if (!gaps.length || changes.empty)
        return gaps;
      let mapped = [];
      for (let gap of gaps)
        if (!changes.touchesRange(gap.from, gap.to))
          mapped.push(new LineGap(changes.mapPos(gap.from), changes.mapPos(gap.to), gap.size));
      return mapped;
    }
    ensureLineGaps(current) {
      let gaps = [];
      if (this.defaultTextDirection != Direction.LTR)
        return gaps;
      for (let line of this.viewportLines) {
        if (line.length < 4e3)
          continue;
        let structure = lineStructure(line.from, line.to, this.stateDeco);
        if (structure.total < 4e3)
          continue;
        let viewFrom, viewTo;
        if (this.heightOracle.lineWrapping) {
          let marginHeight = 2e3 / this.heightOracle.lineLength * this.heightOracle.lineHeight;
          viewFrom = findPosition(structure, (this.visibleTop - line.top - marginHeight) / line.height);
          viewTo = findPosition(structure, (this.visibleBottom - line.top + marginHeight) / line.height);
        } else {
          let totalWidth = structure.total * this.heightOracle.charWidth;
          let marginWidth = 2e3 * this.heightOracle.charWidth;
          viewFrom = findPosition(structure, (this.pixelViewport.left - marginWidth) / totalWidth);
          viewTo = findPosition(structure, (this.pixelViewport.right + marginWidth) / totalWidth);
        }
        let outside = [];
        if (viewFrom > line.from)
          outside.push({ from: line.from, to: viewFrom });
        if (viewTo < line.to)
          outside.push({ from: viewTo, to: line.to });
        let sel = this.state.selection.main;
        if (sel.from >= line.from && sel.from <= line.to)
          cutRange(outside, sel.from - 10, sel.from + 10);
        if (!sel.empty && sel.to >= line.from && sel.to <= line.to)
          cutRange(outside, sel.to - 10, sel.to + 10);
        for (let { from, to: to2 } of outside)
          if (to2 - from > 1e3) {
            gaps.push(find(current, (gap) => gap.from >= line.from && gap.to <= line.to && Math.abs(gap.from - from) < 1e3 && Math.abs(gap.to - to2) < 1e3) || new LineGap(from, to2, this.gapSize(line, from, to2, structure)));
          }
      }
      return gaps;
    }
    gapSize(line, from, to2, structure) {
      let fraction = findFraction(structure, to2) - findFraction(structure, from);
      if (this.heightOracle.lineWrapping) {
        return line.height * fraction;
      } else {
        return structure.total * this.heightOracle.charWidth * fraction;
      }
    }
    updateLineGaps(gaps) {
      if (!LineGap.same(gaps, this.lineGaps)) {
        this.lineGaps = gaps;
        this.lineGapDeco = Decoration.set(gaps.map((gap) => gap.draw(this.heightOracle.lineWrapping)));
      }
    }
    computeVisibleRanges() {
      let deco = this.stateDeco;
      if (this.lineGaps.length)
        deco = deco.concat(this.lineGapDeco);
      let ranges = [];
      RangeSet.spans(deco, this.viewport.from, this.viewport.to, {
        span(from, to2) {
          ranges.push({ from, to: to2 });
        },
        point() {
        }
      }, 20);
      let changed = ranges.length != this.visibleRanges.length || this.visibleRanges.some((r, i) => r.from != ranges[i].from || r.to != ranges[i].to);
      this.visibleRanges = ranges;
      return changed ? 4 : 0;
    }
    lineBlockAt(pos) {
      return pos >= this.viewport.from && pos <= this.viewport.to && this.viewportLines.find((b2) => b2.from <= pos && b2.to >= pos) || scaleBlock(this.heightMap.lineAt(pos, QueryType.ByPos, this.state.doc, 0, 0), this.scaler);
    }
    lineBlockAtHeight(height) {
      return scaleBlock(this.heightMap.lineAt(this.scaler.fromDOM(height), QueryType.ByHeight, this.state.doc, 0, 0), this.scaler);
    }
    elementAtHeight(height) {
      return scaleBlock(this.heightMap.blockAt(this.scaler.fromDOM(height), this.state.doc, 0, 0), this.scaler);
    }
    get docHeight() {
      return this.scaler.toDOM(this.heightMap.height);
    }
    get contentHeight() {
      return this.docHeight + this.paddingTop + this.paddingBottom;
    }
  };
  var Viewport = class {
    constructor(from, to2) {
      this.from = from;
      this.to = to2;
    }
  };
  function lineStructure(from, to2, stateDeco) {
    let ranges = [], pos = from, total = 0;
    RangeSet.spans(stateDeco, from, to2, {
      span() {
      },
      point(from2, to3) {
        if (from2 > pos) {
          ranges.push({ from: pos, to: from2 });
          total += from2 - pos;
        }
        pos = to3;
      }
    }, 20);
    if (pos < to2) {
      ranges.push({ from: pos, to: to2 });
      total += to2 - pos;
    }
    return { total, ranges };
  }
  function findPosition({ total, ranges }, ratio) {
    if (ratio <= 0)
      return ranges[0].from;
    if (ratio >= 1)
      return ranges[ranges.length - 1].to;
    let dist = Math.floor(total * ratio);
    for (let i = 0; ; i++) {
      let { from, to: to2 } = ranges[i], size = to2 - from;
      if (dist <= size)
        return from + dist;
      dist -= size;
    }
  }
  function findFraction(structure, pos) {
    let counted = 0;
    for (let { from, to: to2 } of structure.ranges) {
      if (pos <= to2) {
        counted += pos - from;
        break;
      }
      counted += to2 - from;
    }
    return counted / structure.total;
  }
  function cutRange(ranges, from, to2) {
    for (let i = 0; i < ranges.length; i++) {
      let r = ranges[i];
      if (r.from < to2 && r.to > from) {
        let pieces = [];
        if (r.from < from)
          pieces.push({ from: r.from, to: from });
        if (r.to > to2)
          pieces.push({ from: to2, to: r.to });
        ranges.splice(i, 1, ...pieces);
        i += pieces.length - 1;
      }
    }
  }
  function find(array, f) {
    for (let val of array)
      if (f(val))
        return val;
    return void 0;
  }
  var IdScaler = {
    toDOM(n2) {
      return n2;
    },
    fromDOM(n2) {
      return n2;
    },
    scale: 1
  };
  var BigScaler = class {
    constructor(doc2, heightMap, viewports) {
      let vpHeight = 0, base2 = 0, domBase = 0;
      this.viewports = viewports.map(({ from, to: to2 }) => {
        let top2 = heightMap.lineAt(from, QueryType.ByPos, doc2, 0, 0).top;
        let bottom = heightMap.lineAt(to2, QueryType.ByPos, doc2, 0, 0).bottom;
        vpHeight += bottom - top2;
        return { from, to: to2, top: top2, bottom, domTop: 0, domBottom: 0 };
      });
      this.scale = (7e6 - vpHeight) / (heightMap.height - vpHeight);
      for (let obj of this.viewports) {
        obj.domTop = domBase + (obj.top - base2) * this.scale;
        domBase = obj.domBottom = obj.domTop + (obj.bottom - obj.top);
        base2 = obj.bottom;
      }
    }
    toDOM(n2) {
      for (let i = 0, base2 = 0, domBase = 0; ; i++) {
        let vp = i < this.viewports.length ? this.viewports[i] : null;
        if (!vp || n2 < vp.top)
          return domBase + (n2 - base2) * this.scale;
        if (n2 <= vp.bottom)
          return vp.domTop + (n2 - vp.top);
        base2 = vp.bottom;
        domBase = vp.domBottom;
      }
    }
    fromDOM(n2) {
      for (let i = 0, base2 = 0, domBase = 0; ; i++) {
        let vp = i < this.viewports.length ? this.viewports[i] : null;
        if (!vp || n2 < vp.domTop)
          return base2 + (n2 - domBase) / this.scale;
        if (n2 <= vp.domBottom)
          return vp.top + (n2 - vp.domTop);
        base2 = vp.bottom;
        domBase = vp.domBottom;
      }
    }
  };
  function scaleBlock(block, scaler) {
    if (scaler.scale == 1)
      return block;
    let bTop = scaler.toDOM(block.top), bBottom = scaler.toDOM(block.bottom);
    return new BlockInfo(block.from, block.length, bTop, bBottom - bTop, Array.isArray(block.type) ? block.type.map((b2) => scaleBlock(b2, scaler)) : block.type);
  }
  var theme = /* @__PURE__ */ Facet.define({ combine: (strs) => strs.join(" ") });
  var darkTheme = /* @__PURE__ */ Facet.define({ combine: (values) => values.indexOf(true) > -1 });
  var baseThemeID = /* @__PURE__ */ StyleModule.newName();
  var baseLightID = /* @__PURE__ */ StyleModule.newName();
  var baseDarkID = /* @__PURE__ */ StyleModule.newName();
  var lightDarkIDs = { "&light": "." + baseLightID, "&dark": "." + baseDarkID };
  function buildTheme(main, spec, scopes) {
    return new StyleModule(spec, {
      finish(sel) {
        return /&/.test(sel) ? sel.replace(/&\w*/, (m3) => {
          if (m3 == "&")
            return main;
          if (!scopes || !scopes[m3])
            throw new RangeError(`Unsupported selector: ${m3}`);
          return scopes[m3];
        }) : main + " " + sel;
      }
    });
  }
  var baseTheme$1 = /* @__PURE__ */ buildTheme("." + baseThemeID, {
    "&.cm-editor": {
      position: "relative !important",
      boxSizing: "border-box",
      "&.cm-focused": {
        outline: "1px dotted #212121"
      },
      display: "flex !important",
      flexDirection: "column"
    },
    ".cm-scroller": {
      display: "flex !important",
      alignItems: "flex-start !important",
      fontFamily: "monospace",
      lineHeight: 1.4,
      height: "100%",
      overflowX: "auto",
      position: "relative",
      zIndex: 0
    },
    ".cm-content": {
      margin: 0,
      flexGrow: 2,
      minHeight: "100%",
      display: "block",
      whiteSpace: "pre",
      wordWrap: "normal",
      boxSizing: "border-box",
      padding: "4px 0",
      outline: "none",
      "&[contenteditable=true]": {
        WebkitUserModify: "read-write-plaintext-only"
      }
    },
    ".cm-lineWrapping": {
      whiteSpace_fallback: "pre-wrap",
      whiteSpace: "break-spaces",
      wordBreak: "break-word",
      overflowWrap: "anywhere"
    },
    "&light .cm-content": { caretColor: "black" },
    "&dark .cm-content": { caretColor: "white" },
    ".cm-line": {
      display: "block",
      padding: "0 2px 0 4px"
    },
    ".cm-selectionLayer": {
      zIndex: -1,
      contain: "size style"
    },
    ".cm-selectionBackground": {
      position: "absolute"
    },
    "&light .cm-selectionBackground": {
      background: "#d9d9d9"
    },
    "&dark .cm-selectionBackground": {
      background: "#222"
    },
    "&light.cm-focused .cm-selectionBackground": {
      background: "#d7d4f0"
    },
    "&dark.cm-focused .cm-selectionBackground": {
      background: "#233"
    },
    ".cm-cursorLayer": {
      zIndex: 100,
      contain: "size style",
      pointerEvents: "none"
    },
    "&.cm-focused .cm-cursorLayer": {
      animation: "steps(1) cm-blink 1.2s infinite"
    },
    "@keyframes cm-blink": { "0%": {}, "50%": { visibility: "hidden" }, "100%": {} },
    "@keyframes cm-blink2": { "0%": {}, "50%": { visibility: "hidden" }, "100%": {} },
    ".cm-cursor, .cm-dropCursor": {
      position: "absolute",
      borderLeft: "1.2px solid black",
      marginLeft: "-0.6px",
      pointerEvents: "none"
    },
    ".cm-cursor": {
      display: "none"
    },
    "&dark .cm-cursor": {
      borderLeftColor: "#444"
    },
    "&.cm-focused .cm-cursor": {
      display: "block"
    },
    "&light .cm-activeLine": { backgroundColor: "#f3f9ff" },
    "&dark .cm-activeLine": { backgroundColor: "#223039" },
    "&light .cm-specialChar": { color: "red" },
    "&dark .cm-specialChar": { color: "#f78" },
    ".cm-gutters": {
      display: "flex",
      height: "100%",
      boxSizing: "border-box",
      left: 0,
      zIndex: 200
    },
    "&light .cm-gutters": {
      backgroundColor: "#f5f5f5",
      color: "#6c6c6c",
      borderRight: "1px solid #ddd"
    },
    "&dark .cm-gutters": {
      backgroundColor: "#333338",
      color: "#ccc"
    },
    ".cm-gutter": {
      display: "flex !important",
      flexDirection: "column",
      flexShrink: 0,
      boxSizing: "border-box",
      minHeight: "100%",
      overflow: "hidden"
    },
    ".cm-gutterElement": {
      boxSizing: "border-box"
    },
    ".cm-lineNumbers .cm-gutterElement": {
      padding: "0 3px 0 5px",
      minWidth: "20px",
      textAlign: "right",
      whiteSpace: "nowrap"
    },
    "&light .cm-activeLineGutter": {
      backgroundColor: "#e2f2ff"
    },
    "&dark .cm-activeLineGutter": {
      backgroundColor: "#222227"
    },
    ".cm-panels": {
      boxSizing: "border-box",
      position: "sticky",
      left: 0,
      right: 0
    },
    "&light .cm-panels": {
      backgroundColor: "#f5f5f5",
      color: "black"
    },
    "&light .cm-panels-top": {
      borderBottom: "1px solid #ddd"
    },
    "&light .cm-panels-bottom": {
      borderTop: "1px solid #ddd"
    },
    "&dark .cm-panels": {
      backgroundColor: "#333338",
      color: "white"
    },
    ".cm-tab": {
      display: "inline-block",
      overflow: "hidden",
      verticalAlign: "bottom"
    },
    ".cm-widgetBuffer": {
      verticalAlign: "text-top",
      height: "1em",
      display: "inline"
    },
    ".cm-placeholder": {
      color: "#888",
      display: "inline-block",
      verticalAlign: "top"
    },
    ".cm-button": {
      verticalAlign: "middle",
      color: "inherit",
      fontSize: "70%",
      padding: ".2em 1em",
      borderRadius: "1px"
    },
    "&light .cm-button": {
      backgroundImage: "linear-gradient(#eff1f5, #d9d9df)",
      border: "1px solid #888",
      "&:active": {
        backgroundImage: "linear-gradient(#b4b4b4, #d0d3d6)"
      }
    },
    "&dark .cm-button": {
      backgroundImage: "linear-gradient(#393939, #111)",
      border: "1px solid #888",
      "&:active": {
        backgroundImage: "linear-gradient(#111, #333)"
      }
    },
    ".cm-textfield": {
      verticalAlign: "middle",
      color: "inherit",
      fontSize: "70%",
      border: "1px solid silver",
      padding: ".2em .5em"
    },
    "&light .cm-textfield": {
      backgroundColor: "white"
    },
    "&dark .cm-textfield": {
      border: "1px solid #555",
      backgroundColor: "inherit"
    }
  }, lightDarkIDs);
  var observeOptions = {
    childList: true,
    characterData: true,
    subtree: true,
    attributes: true,
    characterDataOldValue: true
  };
  var useCharData = browser.ie && browser.ie_version <= 11;
  var DOMObserver = class {
    constructor(view, onChange, onScrollChanged) {
      this.view = view;
      this.onChange = onChange;
      this.onScrollChanged = onScrollChanged;
      this.active = false;
      this.selectionRange = new DOMSelectionState();
      this.selectionChanged = false;
      this.delayedFlush = -1;
      this.resizeTimeout = -1;
      this.queue = [];
      this.delayedAndroidKey = null;
      this.scrollTargets = [];
      this.intersection = null;
      this.resize = null;
      this.intersecting = false;
      this.gapIntersection = null;
      this.gaps = [];
      this.parentCheck = -1;
      this.dom = view.contentDOM;
      this.observer = new MutationObserver((mutations) => {
        for (let mut of mutations)
          this.queue.push(mut);
        if ((browser.ie && browser.ie_version <= 11 || browser.ios && view.composing) && mutations.some((m3) => m3.type == "childList" && m3.removedNodes.length || m3.type == "characterData" && m3.oldValue.length > m3.target.nodeValue.length))
          this.flushSoon();
        else
          this.flush();
      });
      if (useCharData)
        this.onCharData = (event) => {
          this.queue.push({
            target: event.target,
            type: "characterData",
            oldValue: event.prevValue
          });
          this.flushSoon();
        };
      this.onSelectionChange = this.onSelectionChange.bind(this);
      window.addEventListener("resize", this.onResize = this.onResize.bind(this));
      if (typeof ResizeObserver == "function") {
        this.resize = new ResizeObserver(() => {
          if (this.view.docView.lastUpdate < Date.now() - 75)
            this.onResize();
        });
        this.resize.observe(view.scrollDOM);
      }
      window.addEventListener("beforeprint", this.onPrint = this.onPrint.bind(this));
      this.start();
      window.addEventListener("scroll", this.onScroll = this.onScroll.bind(this));
      if (typeof IntersectionObserver == "function") {
        this.intersection = new IntersectionObserver((entries) => {
          if (this.parentCheck < 0)
            this.parentCheck = setTimeout(this.listenForScroll.bind(this), 1e3);
          if (entries.length > 0 && entries[entries.length - 1].intersectionRatio > 0 != this.intersecting) {
            this.intersecting = !this.intersecting;
            if (this.intersecting != this.view.inView)
              this.onScrollChanged(document.createEvent("Event"));
          }
        }, {});
        this.intersection.observe(this.dom);
        this.gapIntersection = new IntersectionObserver((entries) => {
          if (entries.length > 0 && entries[entries.length - 1].intersectionRatio > 0)
            this.onScrollChanged(document.createEvent("Event"));
        }, {});
      }
      this.listenForScroll();
      this.readSelectionRange();
      this.dom.ownerDocument.addEventListener("selectionchange", this.onSelectionChange);
    }
    onScroll(e) {
      if (this.intersecting)
        this.flush(false);
      this.onScrollChanged(e);
    }
    onResize() {
      if (this.resizeTimeout < 0)
        this.resizeTimeout = setTimeout(() => {
          this.resizeTimeout = -1;
          this.view.requestMeasure();
        }, 50);
    }
    onPrint() {
      this.view.viewState.printing = true;
      this.view.measure();
      setTimeout(() => {
        this.view.viewState.printing = false;
        this.view.requestMeasure();
      }, 500);
    }
    updateGaps(gaps) {
      if (this.gapIntersection && (gaps.length != this.gaps.length || this.gaps.some((g2, i) => g2 != gaps[i]))) {
        this.gapIntersection.disconnect();
        for (let gap of gaps)
          this.gapIntersection.observe(gap);
        this.gaps = gaps;
      }
    }
    onSelectionChange(event) {
      if (!this.readSelectionRange() || this.delayedAndroidKey)
        return;
      let { view } = this, sel = this.selectionRange;
      if (view.state.facet(editable) ? view.root.activeElement != this.dom : !hasSelection(view.dom, sel))
        return;
      let context2 = sel.anchorNode && view.docView.nearest(sel.anchorNode);
      if (context2 && context2.ignoreEvent(event))
        return;
      if ((browser.ie && browser.ie_version <= 11 || browser.android && browser.chrome) && !view.state.selection.main.empty && sel.focusNode && isEquivalentPosition(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset))
        this.flushSoon();
      else
        this.flush(false);
    }
    readSelectionRange() {
      let { root } = this.view, domSel = getSelection(root);
      let range2 = browser.safari && root.nodeType == 11 && deepActiveElement() == this.view.contentDOM && safariSelectionRangeHack(this.view) || domSel;
      if (this.selectionRange.eq(range2))
        return false;
      this.selectionRange.setRange(range2);
      return this.selectionChanged = true;
    }
    setSelectionRange(anchor, head) {
      this.selectionRange.set(anchor.node, anchor.offset, head.node, head.offset);
      this.selectionChanged = false;
    }
    clearSelectionRange() {
      this.selectionRange.set(null, 0, null, 0);
    }
    listenForScroll() {
      this.parentCheck = -1;
      let i = 0, changed = null;
      for (let dom = this.dom; dom; ) {
        if (dom.nodeType == 1) {
          if (!changed && i < this.scrollTargets.length && this.scrollTargets[i] == dom)
            i++;
          else if (!changed)
            changed = this.scrollTargets.slice(0, i);
          if (changed)
            changed.push(dom);
          dom = dom.assignedSlot || dom.parentNode;
        } else if (dom.nodeType == 11) {
          dom = dom.host;
        } else {
          break;
        }
      }
      if (i < this.scrollTargets.length && !changed)
        changed = this.scrollTargets.slice(0, i);
      if (changed) {
        for (let dom of this.scrollTargets)
          dom.removeEventListener("scroll", this.onScroll);
        for (let dom of this.scrollTargets = changed)
          dom.addEventListener("scroll", this.onScroll);
      }
    }
    ignore(f) {
      if (!this.active)
        return f();
      try {
        this.stop();
        return f();
      } finally {
        this.start();
        this.clear();
      }
    }
    start() {
      if (this.active)
        return;
      this.observer.observe(this.dom, observeOptions);
      if (useCharData)
        this.dom.addEventListener("DOMCharacterDataModified", this.onCharData);
      this.active = true;
    }
    stop() {
      if (!this.active)
        return;
      this.active = false;
      this.observer.disconnect();
      if (useCharData)
        this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData);
    }
    clear() {
      this.processRecords();
      this.queue.length = 0;
      this.selectionChanged = false;
    }
    delayAndroidKey(key, keyCode) {
      if (!this.delayedAndroidKey)
        requestAnimationFrame(() => {
          let key2 = this.delayedAndroidKey;
          this.delayedAndroidKey = null;
          this.delayedFlush = -1;
          if (!this.flush())
            dispatchKey(this.view.contentDOM, key2.key, key2.keyCode);
        });
      if (!this.delayedAndroidKey || key == "Enter")
        this.delayedAndroidKey = { key, keyCode };
    }
    flushSoon() {
      if (this.delayedFlush < 0)
        this.delayedFlush = window.setTimeout(() => {
          this.delayedFlush = -1;
          this.flush();
        }, 20);
    }
    forceFlush() {
      if (this.delayedFlush >= 0) {
        window.clearTimeout(this.delayedFlush);
        this.delayedFlush = -1;
        this.flush();
      }
    }
    processRecords() {
      let records = this.queue;
      for (let mut of this.observer.takeRecords())
        records.push(mut);
      if (records.length)
        this.queue = [];
      let from = -1, to2 = -1, typeOver = false;
      for (let record of records) {
        let range2 = this.readMutation(record);
        if (!range2)
          continue;
        if (range2.typeOver)
          typeOver = true;
        if (from == -1) {
          ({ from, to: to2 } = range2);
        } else {
          from = Math.min(range2.from, from);
          to2 = Math.max(range2.to, to2);
        }
      }
      return { from, to: to2, typeOver };
    }
    flush(readSelection = true) {
      if (this.delayedFlush >= 0 || this.delayedAndroidKey)
        return;
      if (readSelection)
        this.readSelectionRange();
      let { from, to: to2, typeOver } = this.processRecords();
      let newSel = this.selectionChanged && hasSelection(this.dom, this.selectionRange);
      if (from < 0 && !newSel)
        return;
      this.selectionChanged = false;
      let startState = this.view.state;
      let handled = this.onChange(from, to2, typeOver);
      if (this.view.state == startState)
        this.view.update([]);
      return handled;
    }
    readMutation(rec) {
      let cView = this.view.docView.nearest(rec.target);
      if (!cView || cView.ignoreMutation(rec))
        return null;
      cView.markDirty(rec.type == "attributes");
      if (rec.type == "attributes")
        cView.dirty |= 4;
      if (rec.type == "childList") {
        let childBefore = findChild(cView, rec.previousSibling || rec.target.previousSibling, -1);
        let childAfter = findChild(cView, rec.nextSibling || rec.target.nextSibling, 1);
        return {
          from: childBefore ? cView.posAfter(childBefore) : cView.posAtStart,
          to: childAfter ? cView.posBefore(childAfter) : cView.posAtEnd,
          typeOver: false
        };
      } else if (rec.type == "characterData") {
        return { from: cView.posAtStart, to: cView.posAtEnd, typeOver: rec.target.nodeValue == rec.oldValue };
      } else {
        return null;
      }
    }
    destroy() {
      var _a2, _b, _c;
      this.stop();
      (_a2 = this.intersection) === null || _a2 === void 0 ? void 0 : _a2.disconnect();
      (_b = this.gapIntersection) === null || _b === void 0 ? void 0 : _b.disconnect();
      (_c = this.resize) === null || _c === void 0 ? void 0 : _c.disconnect();
      for (let dom of this.scrollTargets)
        dom.removeEventListener("scroll", this.onScroll);
      window.removeEventListener("scroll", this.onScroll);
      window.removeEventListener("resize", this.onResize);
      window.removeEventListener("beforeprint", this.onPrint);
      this.dom.ownerDocument.removeEventListener("selectionchange", this.onSelectionChange);
      clearTimeout(this.parentCheck);
      clearTimeout(this.resizeTimeout);
    }
  };
  function findChild(cView, dom, dir) {
    while (dom) {
      let curView = ContentView.get(dom);
      if (curView && curView.parent == cView)
        return curView;
      let parent = dom.parentNode;
      dom = parent != cView.dom ? parent : dir > 0 ? dom.nextSibling : dom.previousSibling;
    }
    return null;
  }
  function safariSelectionRangeHack(view) {
    let found = null;
    function read2(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      found = event.getTargetRanges()[0];
    }
    view.contentDOM.addEventListener("beforeinput", read2, true);
    document.execCommand("indent");
    view.contentDOM.removeEventListener("beforeinput", read2, true);
    if (!found)
      return null;
    let anchorNode = found.startContainer, anchorOffset = found.startOffset;
    let focusNode = found.endContainer, focusOffset = found.endOffset;
    let curAnchor = view.docView.domAtPos(view.state.selection.main.anchor);
    if (isEquivalentPosition(curAnchor.node, curAnchor.offset, focusNode, focusOffset))
      [anchorNode, anchorOffset, focusNode, focusOffset] = [focusNode, focusOffset, anchorNode, anchorOffset];
    return { anchorNode, anchorOffset, focusNode, focusOffset };
  }
  function applyDOMChange(view, start, end, typeOver) {
    let change, newSel;
    let sel = view.state.selection.main;
    if (start > -1) {
      let bounds = view.docView.domBoundsAround(start, end, 0);
      if (!bounds || view.state.readOnly)
        return false;
      let { from, to: to2 } = bounds;
      let selPoints = view.docView.impreciseHead || view.docView.impreciseAnchor ? [] : selectionPoints(view);
      let reader = new DOMReader(selPoints, view.state);
      reader.readRange(bounds.startDOM, bounds.endDOM);
      let preferredPos = sel.from, preferredSide = null;
      if (view.inputState.lastKeyCode === 8 && view.inputState.lastKeyTime > Date.now() - 100 || browser.android && reader.text.length < to2 - from) {
        preferredPos = sel.to;
        preferredSide = "end";
      }
      let diff = findDiff(view.state.doc.sliceString(from, to2, LineBreakPlaceholder), reader.text, preferredPos - from, preferredSide);
      if (diff) {
        if (browser.chrome && view.inputState.lastKeyCode == 13 && diff.toB == diff.from + 2 && reader.text.slice(diff.from, diff.toB) == LineBreakPlaceholder + LineBreakPlaceholder)
          diff.toB--;
        change = {
          from: from + diff.from,
          to: from + diff.toA,
          insert: Text.of(reader.text.slice(diff.from, diff.toB).split(LineBreakPlaceholder))
        };
      }
      newSel = selectionFromPoints(selPoints, from);
    } else if (view.hasFocus || !view.state.facet(editable)) {
      let domSel = view.observer.selectionRange;
      let { impreciseHead: iHead, impreciseAnchor: iAnchor } = view.docView;
      let head = iHead && iHead.node == domSel.focusNode && iHead.offset == domSel.focusOffset || !contains(view.contentDOM, domSel.focusNode) ? view.state.selection.main.head : view.docView.posFromDOM(domSel.focusNode, domSel.focusOffset);
      let anchor = iAnchor && iAnchor.node == domSel.anchorNode && iAnchor.offset == domSel.anchorOffset || !contains(view.contentDOM, domSel.anchorNode) ? view.state.selection.main.anchor : view.docView.posFromDOM(domSel.anchorNode, domSel.anchorOffset);
      if (head != sel.head || anchor != sel.anchor)
        newSel = EditorSelection.single(anchor, head);
    }
    if (!change && !newSel)
      return false;
    if (!change && typeOver && !sel.empty && newSel && newSel.main.empty)
      change = { from: sel.from, to: sel.to, insert: view.state.doc.slice(sel.from, sel.to) };
    else if (change && change.from >= sel.from && change.to <= sel.to && (change.from != sel.from || change.to != sel.to) && sel.to - sel.from - (change.to - change.from) <= 4)
      change = {
        from: sel.from,
        to: sel.to,
        insert: view.state.doc.slice(sel.from, change.from).append(change.insert).append(view.state.doc.slice(change.to, sel.to))
      };
    else if ((browser.mac || browser.android) && change && change.from == change.to && change.from == sel.head - 1 && change.insert.toString() == ".")
      change = { from: sel.from, to: sel.to, insert: Text.of([" "]) };
    if (change) {
      let startState = view.state;
      if (browser.ios && view.inputState.flushIOSKey(view))
        return true;
      if (browser.android && (change.from == sel.from && change.to == sel.to && change.insert.length == 1 && change.insert.lines == 2 && dispatchKey(view.contentDOM, "Enter", 13) || change.from == sel.from - 1 && change.to == sel.to && change.insert.length == 0 && dispatchKey(view.contentDOM, "Backspace", 8) || change.from == sel.from && change.to == sel.to + 1 && change.insert.length == 0 && dispatchKey(view.contentDOM, "Delete", 46)))
        return true;
      let text = change.insert.toString();
      if (view.state.facet(inputHandler).some((h) => h(view, change.from, change.to, text)))
        return true;
      if (view.inputState.composing >= 0)
        view.inputState.composing++;
      let tr;
      if (change.from >= sel.from && change.to <= sel.to && change.to - change.from >= (sel.to - sel.from) / 3 && (!newSel || newSel.main.empty && newSel.main.from == change.from + change.insert.length) && view.inputState.composing < 0) {
        let before = sel.from < change.from ? startState.sliceDoc(sel.from, change.from) : "";
        let after = sel.to > change.to ? startState.sliceDoc(change.to, sel.to) : "";
        tr = startState.replaceSelection(view.state.toText(before + change.insert.sliceString(0, void 0, view.state.lineBreak) + after));
      } else {
        let changes = startState.changes(change);
        let mainSel = newSel && !startState.selection.main.eq(newSel.main) && newSel.main.to <= changes.newLength ? newSel.main : void 0;
        if (startState.selection.ranges.length > 1 && view.inputState.composing >= 0 && change.to <= sel.to && change.to >= sel.to - 10) {
          let replaced = view.state.sliceDoc(change.from, change.to);
          let compositionRange = compositionSurroundingNode(view) || view.state.doc.lineAt(sel.head);
          let offset = sel.to - change.to, size = sel.to - sel.from;
          tr = startState.changeByRange((range2) => {
            if (range2.from == sel.from && range2.to == sel.to)
              return { changes, range: mainSel || range2.map(changes) };
            let to2 = range2.to - offset, from = to2 - replaced.length;
            if (range2.to - range2.from != size || view.state.sliceDoc(from, to2) != replaced || compositionRange && range2.to >= compositionRange.from && range2.from <= compositionRange.to)
              return { range: range2 };
            let rangeChanges = startState.changes({ from, to: to2, insert: change.insert }), selOff = range2.to - sel.to;
            return {
              changes: rangeChanges,
              range: !mainSel ? range2.map(rangeChanges) : EditorSelection.range(Math.max(0, mainSel.anchor + selOff), Math.max(0, mainSel.head + selOff))
            };
          });
        } else {
          tr = {
            changes,
            selection: mainSel && startState.selection.replaceRange(mainSel)
          };
        }
      }
      let userEvent = "input.type";
      if (view.composing) {
        userEvent += ".compose";
        if (view.inputState.compositionFirstChange) {
          userEvent += ".start";
          view.inputState.compositionFirstChange = false;
        }
      }
      view.dispatch(tr, { scrollIntoView: true, userEvent });
      return true;
    } else if (newSel && !newSel.main.eq(sel)) {
      let scrollIntoView3 = false, userEvent = "select";
      if (view.inputState.lastSelectionTime > Date.now() - 50) {
        if (view.inputState.lastSelectionOrigin == "select")
          scrollIntoView3 = true;
        userEvent = view.inputState.lastSelectionOrigin;
      }
      view.dispatch({ selection: newSel, scrollIntoView: scrollIntoView3, userEvent });
      return true;
    } else {
      return false;
    }
  }
  function findDiff(a2, b2, preferredPos, preferredSide) {
    let minLen = Math.min(a2.length, b2.length);
    let from = 0;
    while (from < minLen && a2.charCodeAt(from) == b2.charCodeAt(from))
      from++;
    if (from == minLen && a2.length == b2.length)
      return null;
    let toA = a2.length, toB = b2.length;
    while (toA > 0 && toB > 0 && a2.charCodeAt(toA - 1) == b2.charCodeAt(toB - 1)) {
      toA--;
      toB--;
    }
    if (preferredSide == "end") {
      let adjust2 = Math.max(0, from - Math.min(toA, toB));
      preferredPos -= toA + adjust2 - from;
    }
    if (toA < from && a2.length < b2.length) {
      let move = preferredPos <= from && preferredPos >= toA ? from - preferredPos : 0;
      from -= move;
      toB = from + (toB - toA);
      toA = from;
    } else if (toB < from) {
      let move = preferredPos <= from && preferredPos >= toB ? from - preferredPos : 0;
      from -= move;
      toA = from + (toA - toB);
      toB = from;
    }
    return { from, toA, toB };
  }
  function selectionPoints(view) {
    let result = [];
    if (view.root.activeElement != view.contentDOM)
      return result;
    let { anchorNode, anchorOffset, focusNode, focusOffset } = view.observer.selectionRange;
    if (anchorNode) {
      result.push(new DOMPoint(anchorNode, anchorOffset));
      if (focusNode != anchorNode || focusOffset != anchorOffset)
        result.push(new DOMPoint(focusNode, focusOffset));
    }
    return result;
  }
  function selectionFromPoints(points, base2) {
    if (points.length == 0)
      return null;
    let anchor = points[0].pos, head = points.length == 2 ? points[1].pos : anchor;
    return anchor > -1 && head > -1 ? EditorSelection.single(anchor + base2, head + base2) : null;
  }
  var EditorView = class {
    constructor(config2 = {}) {
      this.plugins = [];
      this.pluginMap = /* @__PURE__ */ new Map();
      this.editorAttrs = {};
      this.contentAttrs = {};
      this.bidiCache = [];
      this.destroyed = false;
      this.updateState = 2;
      this.measureScheduled = -1;
      this.measureRequests = [];
      this.contentDOM = document.createElement("div");
      this.scrollDOM = document.createElement("div");
      this.scrollDOM.tabIndex = -1;
      this.scrollDOM.className = "cm-scroller";
      this.scrollDOM.appendChild(this.contentDOM);
      this.announceDOM = document.createElement("div");
      this.announceDOM.style.cssText = "position: absolute; top: -10000px";
      this.announceDOM.setAttribute("aria-live", "polite");
      this.dom = document.createElement("div");
      this.dom.appendChild(this.announceDOM);
      this.dom.appendChild(this.scrollDOM);
      this._dispatch = config2.dispatch || ((tr) => this.update([tr]));
      this.dispatch = this.dispatch.bind(this);
      this.root = config2.root || getRoot(config2.parent) || document;
      this.viewState = new ViewState(config2.state || EditorState.create());
      this.plugins = this.state.facet(viewPlugin).map((spec) => new PluginInstance(spec));
      for (let plugin of this.plugins)
        plugin.update(this);
      this.observer = new DOMObserver(this, (from, to2, typeOver) => {
        return applyDOMChange(this, from, to2, typeOver);
      }, (event) => {
        this.inputState.runScrollHandlers(this, event);
        if (this.observer.intersecting)
          this.measure();
      });
      this.inputState = new InputState(this);
      this.inputState.ensureHandlers(this, this.plugins);
      this.docView = new DocView(this);
      this.mountStyles();
      this.updateAttrs();
      this.updateState = 0;
      this.requestMeasure();
      if (config2.parent)
        config2.parent.appendChild(this.dom);
    }
    get state() {
      return this.viewState.state;
    }
    get viewport() {
      return this.viewState.viewport;
    }
    get visibleRanges() {
      return this.viewState.visibleRanges;
    }
    get inView() {
      return this.viewState.inView;
    }
    get composing() {
      return this.inputState.composing > 0;
    }
    get compositionStarted() {
      return this.inputState.composing >= 0;
    }
    dispatch(...input) {
      this._dispatch(input.length == 1 && input[0] instanceof Transaction ? input[0] : this.state.update(...input));
    }
    update(transactions) {
      if (this.updateState != 0)
        throw new Error("Calls to EditorView.update are not allowed while an update is in progress");
      let redrawn = false, attrsChanged = false, update3;
      let state = this.state;
      for (let tr of transactions) {
        if (tr.startState != state)
          throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");
        state = tr.state;
      }
      if (this.destroyed) {
        this.viewState.state = state;
        return;
      }
      this.observer.clear();
      if (state.facet(EditorState.phrases) != this.state.facet(EditorState.phrases))
        return this.setState(state);
      update3 = ViewUpdate.create(this, state, transactions);
      let scrollTarget = this.viewState.scrollTarget;
      try {
        this.updateState = 2;
        for (let tr of transactions) {
          if (scrollTarget)
            scrollTarget = scrollTarget.map(tr.changes);
          if (tr.scrollIntoView) {
            let { main } = tr.state.selection;
            scrollTarget = new ScrollTarget(main.empty ? main : EditorSelection.cursor(main.head, main.head > main.anchor ? -1 : 1));
          }
          for (let e of tr.effects)
            if (e.is(scrollIntoView))
              scrollTarget = e.value;
        }
        this.viewState.update(update3, scrollTarget);
        this.bidiCache = CachedOrder.update(this.bidiCache, update3.changes);
        if (!update3.empty) {
          this.updatePlugins(update3);
          this.inputState.update(update3);
        }
        redrawn = this.docView.update(update3);
        if (this.state.facet(styleModule) != this.styleModules)
          this.mountStyles();
        attrsChanged = this.updateAttrs();
        this.showAnnouncements(transactions);
        this.docView.updateSelection(redrawn, transactions.some((tr) => tr.isUserEvent("select.pointer")));
      } finally {
        this.updateState = 0;
      }
      if (update3.startState.facet(theme) != update3.state.facet(theme))
        this.viewState.mustMeasureContent = true;
      if (redrawn || attrsChanged || scrollTarget || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent)
        this.requestMeasure();
      if (!update3.empty)
        for (let listener of this.state.facet(updateListener))
          listener(update3);
    }
    setState(newState) {
      if (this.updateState != 0)
        throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");
      if (this.destroyed) {
        this.viewState.state = newState;
        return;
      }
      this.updateState = 2;
      let hadFocus = this.hasFocus;
      try {
        for (let plugin of this.plugins)
          plugin.destroy(this);
        this.viewState = new ViewState(newState);
        this.plugins = newState.facet(viewPlugin).map((spec) => new PluginInstance(spec));
        this.pluginMap.clear();
        for (let plugin of this.plugins)
          plugin.update(this);
        this.docView = new DocView(this);
        this.inputState.ensureHandlers(this, this.plugins);
        this.mountStyles();
        this.updateAttrs();
        this.bidiCache = [];
      } finally {
        this.updateState = 0;
      }
      if (hadFocus)
        this.focus();
      this.requestMeasure();
    }
    updatePlugins(update3) {
      let prevSpecs = update3.startState.facet(viewPlugin), specs = update3.state.facet(viewPlugin);
      if (prevSpecs != specs) {
        let newPlugins = [];
        for (let spec of specs) {
          let found = prevSpecs.indexOf(spec);
          if (found < 0) {
            newPlugins.push(new PluginInstance(spec));
          } else {
            let plugin = this.plugins[found];
            plugin.mustUpdate = update3;
            newPlugins.push(plugin);
          }
        }
        for (let plugin of this.plugins)
          if (plugin.mustUpdate != update3)
            plugin.destroy(this);
        this.plugins = newPlugins;
        this.pluginMap.clear();
        this.inputState.ensureHandlers(this, this.plugins);
      } else {
        for (let p2 of this.plugins)
          p2.mustUpdate = update3;
      }
      for (let i = 0; i < this.plugins.length; i++)
        this.plugins[i].update(this);
    }
    measure(flush = true) {
      if (this.destroyed)
        return;
      if (this.measureScheduled > -1)
        cancelAnimationFrame(this.measureScheduled);
      this.measureScheduled = 0;
      if (flush)
        this.observer.flush();
      let updated = null;
      try {
        for (let i = 0; ; i++) {
          this.updateState = 1;
          let oldViewport = this.viewport;
          let changed = this.viewState.measure(this);
          if (!changed && !this.measureRequests.length && this.viewState.scrollTarget == null)
            break;
          if (i > 5) {
            console.warn(this.measureRequests.length ? "Measure loop restarted more than 5 times" : "Viewport failed to stabilize");
            break;
          }
          let measuring = [];
          if (!(changed & 4))
            [this.measureRequests, measuring] = [measuring, this.measureRequests];
          let measured = measuring.map((m3) => {
            try {
              return m3.read(this);
            } catch (e) {
              logException(this.state, e);
              return BadMeasure;
            }
          });
          let update3 = ViewUpdate.create(this, this.state, []), redrawn = false, scrolled = false;
          update3.flags |= changed;
          if (!updated)
            updated = update3;
          else
            updated.flags |= changed;
          this.updateState = 2;
          if (!update3.empty) {
            this.updatePlugins(update3);
            this.inputState.update(update3);
            this.updateAttrs();
            redrawn = this.docView.update(update3);
          }
          for (let i2 = 0; i2 < measuring.length; i2++)
            if (measured[i2] != BadMeasure) {
              try {
                let m3 = measuring[i2];
                if (m3.write)
                  m3.write(measured[i2], this);
              } catch (e) {
                logException(this.state, e);
              }
            }
          if (this.viewState.scrollTarget) {
            this.docView.scrollIntoView(this.viewState.scrollTarget);
            this.viewState.scrollTarget = null;
            scrolled = true;
          }
          if (redrawn)
            this.docView.updateSelection(true);
          if (this.viewport.from == oldViewport.from && this.viewport.to == oldViewport.to && !scrolled && this.measureRequests.length == 0)
            break;
        }
      } finally {
        this.updateState = 0;
        this.measureScheduled = -1;
      }
      if (updated && !updated.empty)
        for (let listener of this.state.facet(updateListener))
          listener(updated);
    }
    get themeClasses() {
      return baseThemeID + " " + (this.state.facet(darkTheme) ? baseDarkID : baseLightID) + " " + this.state.facet(theme);
    }
    updateAttrs() {
      let editorAttrs = attrsFromFacet(this, editorAttributes, {
        class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
      });
      let contentAttrs = {
        spellcheck: "false",
        autocorrect: "off",
        autocapitalize: "off",
        translate: "no",
        contenteditable: !this.state.facet(editable) ? "false" : "true",
        class: "cm-content",
        style: `${browser.tabSize}: ${this.state.tabSize}`,
        role: "textbox",
        "aria-multiline": "true"
      };
      if (this.state.readOnly)
        contentAttrs["aria-readonly"] = "true";
      attrsFromFacet(this, contentAttributes, contentAttrs);
      let changed = this.observer.ignore(() => {
        let changedContent = updateAttrs(this.contentDOM, this.contentAttrs, contentAttrs);
        let changedEditor = updateAttrs(this.dom, this.editorAttrs, editorAttrs);
        return changedContent || changedEditor;
      });
      this.editorAttrs = editorAttrs;
      this.contentAttrs = contentAttrs;
      return changed;
    }
    showAnnouncements(trs) {
      let first = true;
      for (let tr of trs)
        for (let effect of tr.effects)
          if (effect.is(EditorView.announce)) {
            if (first)
              this.announceDOM.textContent = "";
            first = false;
            let div = this.announceDOM.appendChild(document.createElement("div"));
            div.textContent = effect.value;
          }
    }
    mountStyles() {
      this.styleModules = this.state.facet(styleModule);
      StyleModule.mount(this.root, this.styleModules.concat(baseTheme$1).reverse());
    }
    readMeasured() {
      if (this.updateState == 2)
        throw new Error("Reading the editor layout isn't allowed during an update");
      if (this.updateState == 0 && this.measureScheduled > -1)
        this.measure(false);
    }
    requestMeasure(request) {
      if (this.measureScheduled < 0)
        this.measureScheduled = requestAnimationFrame(() => this.measure());
      if (request) {
        if (request.key != null)
          for (let i = 0; i < this.measureRequests.length; i++) {
            if (this.measureRequests[i].key === request.key) {
              this.measureRequests[i] = request;
              return;
            }
          }
        this.measureRequests.push(request);
      }
    }
    plugin(plugin) {
      let known = this.pluginMap.get(plugin);
      if (known === void 0 || known && known.spec != plugin)
        this.pluginMap.set(plugin, known = this.plugins.find((p2) => p2.spec == plugin) || null);
      return known && known.update(this).value;
    }
    get documentTop() {
      return this.contentDOM.getBoundingClientRect().top + this.viewState.paddingTop;
    }
    get documentPadding() {
      return { top: this.viewState.paddingTop, bottom: this.viewState.paddingBottom };
    }
    elementAtHeight(height) {
      this.readMeasured();
      return this.viewState.elementAtHeight(height);
    }
    lineBlockAtHeight(height) {
      this.readMeasured();
      return this.viewState.lineBlockAtHeight(height);
    }
    get viewportLineBlocks() {
      return this.viewState.viewportLines;
    }
    lineBlockAt(pos) {
      return this.viewState.lineBlockAt(pos);
    }
    get contentHeight() {
      return this.viewState.contentHeight;
    }
    moveByChar(start, forward, by) {
      return skipAtoms(this, start, moveByChar(this, start, forward, by));
    }
    moveByGroup(start, forward) {
      return skipAtoms(this, start, moveByChar(this, start, forward, (initial) => byGroup(this, start.head, initial)));
    }
    moveToLineBoundary(start, forward, includeWrap = true) {
      return moveToLineBoundary(this, start, forward, includeWrap);
    }
    moveVertically(start, forward, distance2) {
      return skipAtoms(this, start, moveVertically(this, start, forward, distance2));
    }
    domAtPos(pos) {
      return this.docView.domAtPos(pos);
    }
    posAtDOM(node, offset = 0) {
      return this.docView.posFromDOM(node, offset);
    }
    posAtCoords(coords, precise = true) {
      this.readMeasured();
      return posAtCoords(this, coords, precise);
    }
    coordsAtPos(pos, side = 1) {
      this.readMeasured();
      let rect = this.docView.coordsAt(pos, side);
      if (!rect || rect.left == rect.right)
        return rect;
      let line = this.state.doc.lineAt(pos), order = this.bidiSpans(line);
      let span = order[BidiSpan.find(order, pos - line.from, -1, side)];
      return flattenRect(rect, span.dir == Direction.LTR == side > 0);
    }
    get defaultCharacterWidth() {
      return this.viewState.heightOracle.charWidth;
    }
    get defaultLineHeight() {
      return this.viewState.heightOracle.lineHeight;
    }
    get textDirection() {
      return this.viewState.defaultTextDirection;
    }
    textDirectionAt(pos) {
      let perLine = this.state.facet(perLineTextDirection);
      if (!perLine || pos < this.viewport.from || pos > this.viewport.to)
        return this.textDirection;
      this.readMeasured();
      return this.docView.textDirectionAt(pos);
    }
    get lineWrapping() {
      return this.viewState.heightOracle.lineWrapping;
    }
    bidiSpans(line) {
      if (line.length > MaxBidiLine)
        return trivialOrder(line.length);
      let dir = this.textDirectionAt(line.from);
      for (let entry of this.bidiCache)
        if (entry.from == line.from && entry.dir == dir)
          return entry.order;
      let order = computeOrder(line.text, dir);
      this.bidiCache.push(new CachedOrder(line.from, line.to, dir, order));
      return order;
    }
    get hasFocus() {
      var _a2;
      return (document.hasFocus() || browser.safari && ((_a2 = this.inputState) === null || _a2 === void 0 ? void 0 : _a2.lastContextMenu) > Date.now() - 3e4) && this.root.activeElement == this.contentDOM;
    }
    focus() {
      this.observer.ignore(() => {
        focusPreventScroll(this.contentDOM);
        this.docView.updateSelection();
      });
    }
    destroy() {
      for (let plugin of this.plugins)
        plugin.destroy(this);
      this.plugins = [];
      this.inputState.destroy();
      this.dom.remove();
      this.observer.destroy();
      if (this.measureScheduled > -1)
        cancelAnimationFrame(this.measureScheduled);
      this.destroyed = true;
    }
    static scrollIntoView(pos, options = {}) {
      return scrollIntoView.of(new ScrollTarget(typeof pos == "number" ? EditorSelection.cursor(pos) : pos, options.y, options.x, options.yMargin, options.xMargin));
    }
    static domEventHandlers(handlers2) {
      return ViewPlugin.define(() => ({}), { eventHandlers: handlers2 });
    }
    static theme(spec, options) {
      let prefix = StyleModule.newName();
      let result = [theme.of(prefix), styleModule.of(buildTheme(`.${prefix}`, spec))];
      if (options && options.dark)
        result.push(darkTheme.of(true));
      return result;
    }
    static baseTheme(spec) {
      return Prec.lowest(styleModule.of(buildTheme("." + baseThemeID, spec, lightDarkIDs)));
    }
  };
  EditorView.styleModule = styleModule;
  EditorView.inputHandler = inputHandler;
  EditorView.perLineTextDirection = perLineTextDirection;
  EditorView.exceptionSink = exceptionSink;
  EditorView.updateListener = updateListener;
  EditorView.editable = editable;
  EditorView.mouseSelectionStyle = mouseSelectionStyle;
  EditorView.dragMovesSelection = dragMovesSelection$1;
  EditorView.clickAddsSelectionRange = clickAddsSelectionRange;
  EditorView.decorations = decorations;
  EditorView.atomicRanges = atomicRanges;
  EditorView.scrollMargins = scrollMargins;
  EditorView.darkTheme = darkTheme;
  EditorView.contentAttributes = contentAttributes;
  EditorView.editorAttributes = editorAttributes;
  EditorView.lineWrapping = /* @__PURE__ */ EditorView.contentAttributes.of({ "class": "cm-lineWrapping" });
  EditorView.announce = /* @__PURE__ */ StateEffect.define();
  var MaxBidiLine = 4096;
  var BadMeasure = {};
  var CachedOrder = class {
    constructor(from, to2, dir, order) {
      this.from = from;
      this.to = to2;
      this.dir = dir;
      this.order = order;
    }
    static update(cache, changes) {
      if (changes.empty)
        return cache;
      let result = [], lastDir = cache.length ? cache[cache.length - 1].dir : Direction.LTR;
      for (let i = Math.max(0, cache.length - 10); i < cache.length; i++) {
        let entry = cache[i];
        if (entry.dir == lastDir && !changes.touchesRange(entry.from, entry.to))
          result.push(new CachedOrder(changes.mapPos(entry.from, 1), changes.mapPos(entry.to, -1), entry.dir, entry.order));
      }
      return result;
    }
  };
  function attrsFromFacet(view, facet, base2) {
    for (let sources = view.state.facet(facet), i = sources.length - 1; i >= 0; i--) {
      let source = sources[i], value2 = typeof source == "function" ? source(view) : source;
      if (value2)
        combineAttrs(value2, base2);
    }
    return base2;
  }
  var currentPlatform = browser.mac ? "mac" : browser.windows ? "win" : browser.linux ? "linux" : "key";
  function normalizeKeyName(name2, platform) {
    const parts = name2.split(/-(?!$)/);
    let result = parts[parts.length - 1];
    if (result == "Space")
      result = " ";
    let alt, ctrl, shift2, meta2;
    for (let i = 0; i < parts.length - 1; ++i) {
      const mod2 = parts[i];
      if (/^(cmd|meta|m)$/i.test(mod2))
        meta2 = true;
      else if (/^a(lt)?$/i.test(mod2))
        alt = true;
      else if (/^(c|ctrl|control)$/i.test(mod2))
        ctrl = true;
      else if (/^s(hift)?$/i.test(mod2))
        shift2 = true;
      else if (/^mod$/i.test(mod2)) {
        if (platform == "mac")
          meta2 = true;
        else
          ctrl = true;
      } else
        throw new Error("Unrecognized modifier name: " + mod2);
    }
    if (alt)
      result = "Alt-" + result;
    if (ctrl)
      result = "Ctrl-" + result;
    if (meta2)
      result = "Meta-" + result;
    if (shift2)
      result = "Shift-" + result;
    return result;
  }
  function modifiers(name2, event, shift2) {
    if (event.altKey)
      name2 = "Alt-" + name2;
    if (event.ctrlKey)
      name2 = "Ctrl-" + name2;
    if (event.metaKey)
      name2 = "Meta-" + name2;
    if (shift2 !== false && event.shiftKey)
      name2 = "Shift-" + name2;
    return name2;
  }
  var handleKeyEvents = /* @__PURE__ */ EditorView.domEventHandlers({
    keydown(event, view) {
      return runHandlers(getKeymap(view.state), event, view, "editor");
    }
  });
  var keymap = /* @__PURE__ */ Facet.define({ enables: handleKeyEvents });
  var Keymaps = /* @__PURE__ */ new WeakMap();
  function getKeymap(state) {
    let bindings = state.facet(keymap);
    let map = Keymaps.get(bindings);
    if (!map)
      Keymaps.set(bindings, map = buildKeymap(bindings.reduce((a2, b2) => a2.concat(b2), [])));
    return map;
  }
  function runScopeHandlers(view, event, scope) {
    return runHandlers(getKeymap(view.state), event, view, scope);
  }
  var storedPrefix = null;
  var PrefixTimeout = 4e3;
  function buildKeymap(bindings, platform = currentPlatform) {
    let bound = /* @__PURE__ */ Object.create(null);
    let isPrefix = /* @__PURE__ */ Object.create(null);
    let checkPrefix = (name2, is) => {
      let current = isPrefix[name2];
      if (current == null)
        isPrefix[name2] = is;
      else if (current != is)
        throw new Error("Key binding " + name2 + " is used both as a regular binding and as a multi-stroke prefix");
    };
    let add2 = (scope, key, command2, preventDefault) => {
      let scopeObj = bound[scope] || (bound[scope] = /* @__PURE__ */ Object.create(null));
      let parts = key.split(/ (?!$)/).map((k) => normalizeKeyName(k, platform));
      for (let i = 1; i < parts.length; i++) {
        let prefix = parts.slice(0, i).join(" ");
        checkPrefix(prefix, true);
        if (!scopeObj[prefix])
          scopeObj[prefix] = {
            preventDefault: true,
            commands: [(view) => {
              let ourObj = storedPrefix = { view, prefix, scope };
              setTimeout(() => {
                if (storedPrefix == ourObj)
                  storedPrefix = null;
              }, PrefixTimeout);
              return true;
            }]
          };
      }
      let full = parts.join(" ");
      checkPrefix(full, false);
      let binding = scopeObj[full] || (scopeObj[full] = { preventDefault: false, commands: [] });
      binding.commands.push(command2);
      if (preventDefault)
        binding.preventDefault = true;
    };
    for (let b2 of bindings) {
      let name2 = b2[platform] || b2.key;
      if (!name2)
        continue;
      for (let scope of b2.scope ? b2.scope.split(" ") : ["editor"]) {
        add2(scope, name2, b2.run, b2.preventDefault);
        if (b2.shift)
          add2(scope, "Shift-" + name2, b2.shift, b2.preventDefault);
      }
    }
    return bound;
  }
  function runHandlers(map, event, view, scope) {
    let name2 = keyName(event), isChar = name2.length == 1 && name2 != " ";
    let prefix = "", fallthrough = false;
    if (storedPrefix && storedPrefix.view == view && storedPrefix.scope == scope) {
      prefix = storedPrefix.prefix + " ";
      if (fallthrough = modifierCodes.indexOf(event.keyCode) < 0)
        storedPrefix = null;
    }
    let runFor = (binding) => {
      if (binding) {
        for (let cmd2 of binding.commands)
          if (cmd2(view))
            return true;
        if (binding.preventDefault)
          fallthrough = true;
      }
      return false;
    };
    let scopeObj = map[scope], baseName;
    if (scopeObj) {
      if (runFor(scopeObj[prefix + modifiers(name2, event, !isChar)]))
        return true;
      if (isChar && (event.shiftKey || event.altKey || event.metaKey) && (baseName = base[event.keyCode]) && baseName != name2) {
        if (runFor(scopeObj[prefix + modifiers(baseName, event, true)]))
          return true;
      } else if (isChar && event.shiftKey) {
        if (runFor(scopeObj[prefix + modifiers(name2, event, true)]))
          return true;
      }
    }
    return fallthrough;
  }
  var CanHidePrimary = !browser.ios;
  var selectionConfig = /* @__PURE__ */ Facet.define({
    combine(configs) {
      return combineConfig(configs, {
        cursorBlinkRate: 1200,
        drawRangeCursor: true
      }, {
        cursorBlinkRate: (a2, b2) => Math.min(a2, b2),
        drawRangeCursor: (a2, b2) => a2 || b2
      });
    }
  });
  function drawSelection(config2 = {}) {
    return [
      selectionConfig.of(config2),
      drawSelectionPlugin,
      hideNativeSelection
    ];
  }
  var Piece = class {
    constructor(left, top2, width, height, className) {
      this.left = left;
      this.top = top2;
      this.width = width;
      this.height = height;
      this.className = className;
    }
    draw() {
      let elt = document.createElement("div");
      elt.className = this.className;
      this.adjust(elt);
      return elt;
    }
    adjust(elt) {
      elt.style.left = this.left + "px";
      elt.style.top = this.top + "px";
      if (this.width >= 0)
        elt.style.width = this.width + "px";
      elt.style.height = this.height + "px";
    }
    eq(p2) {
      return this.left == p2.left && this.top == p2.top && this.width == p2.width && this.height == p2.height && this.className == p2.className;
    }
  };
  var drawSelectionPlugin = /* @__PURE__ */ ViewPlugin.fromClass(class {
    constructor(view) {
      this.view = view;
      this.rangePieces = [];
      this.cursors = [];
      this.measureReq = { read: this.readPos.bind(this), write: this.drawSel.bind(this) };
      this.selectionLayer = view.scrollDOM.appendChild(document.createElement("div"));
      this.selectionLayer.className = "cm-selectionLayer";
      this.selectionLayer.setAttribute("aria-hidden", "true");
      this.cursorLayer = view.scrollDOM.appendChild(document.createElement("div"));
      this.cursorLayer.className = "cm-cursorLayer";
      this.cursorLayer.setAttribute("aria-hidden", "true");
      view.requestMeasure(this.measureReq);
      this.setBlinkRate();
    }
    setBlinkRate() {
      this.cursorLayer.style.animationDuration = this.view.state.facet(selectionConfig).cursorBlinkRate + "ms";
    }
    update(update3) {
      let confChanged = update3.startState.facet(selectionConfig) != update3.state.facet(selectionConfig);
      if (confChanged || update3.selectionSet || update3.geometryChanged || update3.viewportChanged)
        this.view.requestMeasure(this.measureReq);
      if (update3.transactions.some((tr) => tr.scrollIntoView))
        this.cursorLayer.style.animationName = this.cursorLayer.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink";
      if (confChanged)
        this.setBlinkRate();
    }
    readPos() {
      let { state } = this.view, conf = state.facet(selectionConfig);
      let rangePieces = state.selection.ranges.map((r) => r.empty ? [] : measureRange(this.view, r)).reduce((a2, b2) => a2.concat(b2));
      let cursors = [];
      for (let r of state.selection.ranges) {
        let prim = r == state.selection.main;
        if (r.empty ? !prim || CanHidePrimary : conf.drawRangeCursor) {
          let piece = measureCursor(this.view, r, prim);
          if (piece)
            cursors.push(piece);
        }
      }
      return { rangePieces, cursors };
    }
    drawSel({ rangePieces, cursors }) {
      if (rangePieces.length != this.rangePieces.length || rangePieces.some((p2, i) => !p2.eq(this.rangePieces[i]))) {
        this.selectionLayer.textContent = "";
        for (let p2 of rangePieces)
          this.selectionLayer.appendChild(p2.draw());
        this.rangePieces = rangePieces;
      }
      if (cursors.length != this.cursors.length || cursors.some((c4, i) => !c4.eq(this.cursors[i]))) {
        let oldCursors = this.cursorLayer.children;
        if (oldCursors.length !== cursors.length) {
          this.cursorLayer.textContent = "";
          for (const c4 of cursors)
            this.cursorLayer.appendChild(c4.draw());
        } else {
          cursors.forEach((c4, idx) => c4.adjust(oldCursors[idx]));
        }
        this.cursors = cursors;
      }
    }
    destroy() {
      this.selectionLayer.remove();
      this.cursorLayer.remove();
    }
  });
  var themeSpec = {
    ".cm-line": {
      "& ::selection": { backgroundColor: "transparent !important" },
      "&::selection": { backgroundColor: "transparent !important" }
    }
  };
  if (CanHidePrimary)
    themeSpec[".cm-line"].caretColor = "transparent !important";
  var hideNativeSelection = /* @__PURE__ */ Prec.highest(/* @__PURE__ */ EditorView.theme(themeSpec));
  function getBase(view) {
    let rect = view.scrollDOM.getBoundingClientRect();
    let left = view.textDirection == Direction.LTR ? rect.left : rect.right - view.scrollDOM.clientWidth;
    return { left: left - view.scrollDOM.scrollLeft, top: rect.top - view.scrollDOM.scrollTop };
  }
  function wrappedLine(view, pos, inside2) {
    let range2 = EditorSelection.cursor(pos);
    return {
      from: Math.max(inside2.from, view.moveToLineBoundary(range2, false, true).from),
      to: Math.min(inside2.to, view.moveToLineBoundary(range2, true, true).from),
      type: BlockType.Text
    };
  }
  function blockAt(view, pos) {
    let line = view.lineBlockAt(pos);
    if (Array.isArray(line.type))
      for (let l of line.type) {
        if (l.to > pos || l.to == pos && (l.to == line.to || l.type == BlockType.Text))
          return l;
      }
    return line;
  }
  function measureRange(view, range2) {
    if (range2.to <= view.viewport.from || range2.from >= view.viewport.to)
      return [];
    let from = Math.max(range2.from, view.viewport.from), to2 = Math.min(range2.to, view.viewport.to);
    let ltr = view.textDirection == Direction.LTR;
    let content2 = view.contentDOM, contentRect = content2.getBoundingClientRect(), base2 = getBase(view);
    let lineStyle = window.getComputedStyle(content2.firstChild);
    let leftSide = contentRect.left + parseInt(lineStyle.paddingLeft) + Math.min(0, parseInt(lineStyle.textIndent));
    let rightSide = contentRect.right - parseInt(lineStyle.paddingRight);
    let startBlock = blockAt(view, from), endBlock = blockAt(view, to2);
    let visualStart = startBlock.type == BlockType.Text ? startBlock : null;
    let visualEnd = endBlock.type == BlockType.Text ? endBlock : null;
    if (view.lineWrapping) {
      if (visualStart)
        visualStart = wrappedLine(view, from, visualStart);
      if (visualEnd)
        visualEnd = wrappedLine(view, to2, visualEnd);
    }
    if (visualStart && visualEnd && visualStart.from == visualEnd.from) {
      return pieces(drawForLine(range2.from, range2.to, visualStart));
    } else {
      let top2 = visualStart ? drawForLine(range2.from, null, visualStart) : drawForWidget(startBlock, false);
      let bottom = visualEnd ? drawForLine(null, range2.to, visualEnd) : drawForWidget(endBlock, true);
      let between = [];
      if ((visualStart || startBlock).to < (visualEnd || endBlock).from - 1)
        between.push(piece(leftSide, top2.bottom, rightSide, bottom.top));
      else if (top2.bottom < bottom.top && view.elementAtHeight((top2.bottom + bottom.top) / 2).type == BlockType.Text)
        top2.bottom = bottom.top = (top2.bottom + bottom.top) / 2;
      return pieces(top2).concat(between).concat(pieces(bottom));
    }
    function piece(left, top2, right, bottom) {
      return new Piece(left - base2.left, top2 - base2.top - 0.01, right - left, bottom - top2 + 0.01, "cm-selectionBackground");
    }
    function pieces({ top: top2, bottom, horizontal }) {
      let pieces2 = [];
      for (let i = 0; i < horizontal.length; i += 2)
        pieces2.push(piece(horizontal[i], top2, horizontal[i + 1], bottom));
      return pieces2;
    }
    function drawForLine(from2, to3, line) {
      let top2 = 1e9, bottom = -1e9, horizontal = [];
      function addSpan(from3, fromOpen, to4, toOpen, dir) {
        let fromCoords = view.coordsAtPos(from3, from3 == line.to ? -2 : 2);
        let toCoords = view.coordsAtPos(to4, to4 == line.from ? 2 : -2);
        top2 = Math.min(fromCoords.top, toCoords.top, top2);
        bottom = Math.max(fromCoords.bottom, toCoords.bottom, bottom);
        if (dir == Direction.LTR)
          horizontal.push(ltr && fromOpen ? leftSide : fromCoords.left, ltr && toOpen ? rightSide : toCoords.right);
        else
          horizontal.push(!ltr && toOpen ? leftSide : toCoords.left, !ltr && fromOpen ? rightSide : fromCoords.right);
      }
      let start = from2 !== null && from2 !== void 0 ? from2 : line.from, end = to3 !== null && to3 !== void 0 ? to3 : line.to;
      for (let r of view.visibleRanges)
        if (r.to > start && r.from < end) {
          for (let pos = Math.max(r.from, start), endPos = Math.min(r.to, end); ; ) {
            let docLine = view.state.doc.lineAt(pos);
            for (let span of view.bidiSpans(docLine)) {
              let spanFrom = span.from + docLine.from, spanTo = span.to + docLine.from;
              if (spanFrom >= endPos)
                break;
              if (spanTo > pos)
                addSpan(Math.max(spanFrom, pos), from2 == null && spanFrom <= start, Math.min(spanTo, endPos), to3 == null && spanTo >= end, span.dir);
            }
            pos = docLine.to + 1;
            if (pos >= endPos)
              break;
          }
        }
      if (horizontal.length == 0)
        addSpan(start, from2 == null, end, to3 == null, view.textDirection);
      return { top: top2, bottom, horizontal };
    }
    function drawForWidget(block, top2) {
      let y = contentRect.top + (top2 ? block.top : block.bottom);
      return { top: y, bottom: y, horizontal: [] };
    }
  }
  function measureCursor(view, cursor, primary) {
    let pos = view.coordsAtPos(cursor.head, cursor.assoc || 1);
    if (!pos)
      return null;
    let base2 = getBase(view);
    return new Piece(pos.left - base2.left, pos.top - base2.top, -1, pos.bottom - pos.top, primary ? "cm-cursor cm-cursor-primary" : "cm-cursor cm-cursor-secondary");
  }
  var setDropCursorPos = /* @__PURE__ */ StateEffect.define({
    map(pos, mapping) {
      return pos == null ? null : mapping.mapPos(pos);
    }
  });
  var dropCursorPos = /* @__PURE__ */ StateField.define({
    create() {
      return null;
    },
    update(pos, tr) {
      if (pos != null)
        pos = tr.changes.mapPos(pos);
      return tr.effects.reduce((pos2, e) => e.is(setDropCursorPos) ? e.value : pos2, pos);
    }
  });
  var drawDropCursor = /* @__PURE__ */ ViewPlugin.fromClass(class {
    constructor(view) {
      this.view = view;
      this.cursor = null;
      this.measureReq = { read: this.readPos.bind(this), write: this.drawCursor.bind(this) };
    }
    update(update3) {
      var _a2;
      let cursorPos = update3.state.field(dropCursorPos);
      if (cursorPos == null) {
        if (this.cursor != null) {
          (_a2 = this.cursor) === null || _a2 === void 0 ? void 0 : _a2.remove();
          this.cursor = null;
        }
      } else {
        if (!this.cursor) {
          this.cursor = this.view.scrollDOM.appendChild(document.createElement("div"));
          this.cursor.className = "cm-dropCursor";
        }
        if (update3.startState.field(dropCursorPos) != cursorPos || update3.docChanged || update3.geometryChanged)
          this.view.requestMeasure(this.measureReq);
      }
    }
    readPos() {
      let pos = this.view.state.field(dropCursorPos);
      let rect = pos != null && this.view.coordsAtPos(pos);
      if (!rect)
        return null;
      let outer = this.view.scrollDOM.getBoundingClientRect();
      return {
        left: rect.left - outer.left + this.view.scrollDOM.scrollLeft,
        top: rect.top - outer.top + this.view.scrollDOM.scrollTop,
        height: rect.bottom - rect.top
      };
    }
    drawCursor(pos) {
      if (this.cursor) {
        if (pos) {
          this.cursor.style.left = pos.left + "px";
          this.cursor.style.top = pos.top + "px";
          this.cursor.style.height = pos.height + "px";
        } else {
          this.cursor.style.left = "-100000px";
        }
      }
    }
    destroy() {
      if (this.cursor)
        this.cursor.remove();
    }
    setDropPos(pos) {
      if (this.view.state.field(dropCursorPos) != pos)
        this.view.dispatch({ effects: setDropCursorPos.of(pos) });
    }
  }, {
    eventHandlers: {
      dragover(event) {
        this.setDropPos(this.view.posAtCoords({ x: event.clientX, y: event.clientY }));
      },
      dragleave(event) {
        if (event.target == this.view.contentDOM || !this.view.contentDOM.contains(event.relatedTarget))
          this.setDropPos(null);
      },
      dragend() {
        this.setDropPos(null);
      },
      drop() {
        this.setDropPos(null);
      }
    }
  });
  function dropCursor() {
    return [dropCursorPos, drawDropCursor];
  }
  function iterMatches(doc2, re, from, to2, f) {
    re.lastIndex = 0;
    for (let cursor = doc2.iterRange(from, to2), pos = from, m3; !cursor.next().done; pos += cursor.value.length) {
      if (!cursor.lineBreak)
        while (m3 = re.exec(cursor.value))
          f(pos + m3.index, pos + m3.index + m3[0].length, m3);
    }
  }
  function matchRanges(view, maxLength) {
    let visible = view.visibleRanges;
    if (visible.length == 1 && visible[0].from == view.viewport.from && visible[0].to == view.viewport.to)
      return visible;
    let result = [];
    for (let { from, to: to2 } of visible) {
      from = Math.max(view.state.doc.lineAt(from).from, from - maxLength);
      to2 = Math.min(view.state.doc.lineAt(to2).to, to2 + maxLength);
      if (result.length && result[result.length - 1].to >= from)
        result[result.length - 1].to = to2;
      else
        result.push({ from, to: to2 });
    }
    return result;
  }
  var MatchDecorator = class {
    constructor(config2) {
      let { regexp, decoration, boundary, maxLength = 1e3 } = config2;
      if (!regexp.global)
        throw new RangeError("The regular expression given to MatchDecorator should have its 'g' flag set");
      this.regexp = regexp;
      this.getDeco = typeof decoration == "function" ? decoration : () => decoration;
      this.boundary = boundary;
      this.maxLength = maxLength;
    }
    createDeco(view) {
      let build = new RangeSetBuilder();
      for (let { from, to: to2 } of matchRanges(view, this.maxLength))
        iterMatches(view.state.doc, this.regexp, from, to2, (a2, b2, m3) => build.add(a2, b2, this.getDeco(m3, view, a2)));
      return build.finish();
    }
    updateDeco(update3, deco) {
      let changeFrom = 1e9, changeTo = -1;
      if (update3.docChanged)
        update3.changes.iterChanges((_f, _t, from, to2) => {
          if (to2 > update3.view.viewport.from && from < update3.view.viewport.to) {
            changeFrom = Math.min(from, changeFrom);
            changeTo = Math.max(to2, changeTo);
          }
        });
      if (update3.viewportChanged || changeTo - changeFrom > 1e3)
        return this.createDeco(update3.view);
      if (changeTo > -1)
        return this.updateRange(update3.view, deco.map(update3.changes), changeFrom, changeTo);
      return deco;
    }
    updateRange(view, deco, updateFrom, updateTo) {
      for (let r of view.visibleRanges) {
        let from = Math.max(r.from, updateFrom), to2 = Math.min(r.to, updateTo);
        if (to2 > from) {
          let fromLine = view.state.doc.lineAt(from), toLine = fromLine.to < to2 ? view.state.doc.lineAt(to2) : fromLine;
          let start = Math.max(r.from, fromLine.from), end = Math.min(r.to, toLine.to);
          if (this.boundary) {
            for (; from > fromLine.from; from--)
              if (this.boundary.test(fromLine.text[from - 1 - fromLine.from])) {
                start = from;
                break;
              }
            for (; to2 < toLine.to; to2++)
              if (this.boundary.test(toLine.text[to2 - toLine.from])) {
                end = to2;
                break;
              }
          }
          let ranges = [], m3;
          if (fromLine == toLine) {
            this.regexp.lastIndex = start - fromLine.from;
            while ((m3 = this.regexp.exec(fromLine.text)) && m3.index < end - fromLine.from) {
              let pos = m3.index + fromLine.from;
              ranges.push(this.getDeco(m3, view, pos).range(pos, pos + m3[0].length));
            }
          } else {
            iterMatches(view.state.doc, this.regexp, start, end, (from2, to3, m4) => ranges.push(this.getDeco(m4, view, from2).range(from2, to3)));
          }
          deco = deco.update({ filterFrom: start, filterTo: end, filter: (from2, to3) => from2 < start || to3 > end, add: ranges });
        }
      }
      return deco;
    }
  };
  var UnicodeRegexpSupport = /x/.unicode != null ? "gu" : "g";
  var Specials = /* @__PURE__ */ new RegExp("[\0-\b\n-\x7F-\x9F\xAD\u061C\u200B\u200E\u200F\u2028\u2029\u202D\u202E\uFEFF\uFFF9-\uFFFC]", UnicodeRegexpSupport);
  var Names = {
    0: "null",
    7: "bell",
    8: "backspace",
    10: "newline",
    11: "vertical tab",
    13: "carriage return",
    27: "escape",
    8203: "zero width space",
    8204: "zero width non-joiner",
    8205: "zero width joiner",
    8206: "left-to-right mark",
    8207: "right-to-left mark",
    8232: "line separator",
    8237: "left-to-right override",
    8238: "right-to-left override",
    8233: "paragraph separator",
    65279: "zero width no-break space",
    65532: "object replacement"
  };
  var _supportsTabSize = null;
  function supportsTabSize() {
    var _a2;
    if (_supportsTabSize == null && typeof document != "undefined" && document.body) {
      let styles = document.body.style;
      _supportsTabSize = ((_a2 = styles.tabSize) !== null && _a2 !== void 0 ? _a2 : styles.MozTabSize) != null;
    }
    return _supportsTabSize || false;
  }
  var specialCharConfig = /* @__PURE__ */ Facet.define({
    combine(configs) {
      let config2 = combineConfig(configs, {
        render: null,
        specialChars: Specials,
        addSpecialChars: null
      });
      if (config2.replaceTabs = !supportsTabSize())
        config2.specialChars = new RegExp("	|" + config2.specialChars.source, UnicodeRegexpSupport);
      if (config2.addSpecialChars)
        config2.specialChars = new RegExp(config2.specialChars.source + "|" + config2.addSpecialChars.source, UnicodeRegexpSupport);
      return config2;
    }
  });
  function highlightSpecialChars(config2 = {}) {
    return [specialCharConfig.of(config2), specialCharPlugin()];
  }
  var _plugin = null;
  function specialCharPlugin() {
    return _plugin || (_plugin = ViewPlugin.fromClass(class {
      constructor(view) {
        this.view = view;
        this.decorations = Decoration.none;
        this.decorationCache = /* @__PURE__ */ Object.create(null);
        this.decorator = this.makeDecorator(view.state.facet(specialCharConfig));
        this.decorations = this.decorator.createDeco(view);
      }
      makeDecorator(conf) {
        return new MatchDecorator({
          regexp: conf.specialChars,
          decoration: (m3, view, pos) => {
            let { doc: doc2 } = view.state;
            let code = codePointAt(m3[0], 0);
            if (code == 9) {
              let line = doc2.lineAt(pos);
              let size = view.state.tabSize, col = countColumn(line.text, size, pos - line.from);
              return Decoration.replace({ widget: new TabWidget((size - col % size) * this.view.defaultCharacterWidth) });
            }
            return this.decorationCache[code] || (this.decorationCache[code] = Decoration.replace({ widget: new SpecialCharWidget(conf, code) }));
          },
          boundary: conf.replaceTabs ? void 0 : /[^]/
        });
      }
      update(update3) {
        let conf = update3.state.facet(specialCharConfig);
        if (update3.startState.facet(specialCharConfig) != conf) {
          this.decorator = this.makeDecorator(conf);
          this.decorations = this.decorator.createDeco(update3.view);
        } else {
          this.decorations = this.decorator.updateDeco(update3, this.decorations);
        }
      }
    }, {
      decorations: (v) => v.decorations
    }));
  }
  var DefaultPlaceholder = "\u2022";
  function placeholder$1(code) {
    if (code >= 32)
      return DefaultPlaceholder;
    if (code == 10)
      return "\u2424";
    return String.fromCharCode(9216 + code);
  }
  var SpecialCharWidget = class extends WidgetType {
    constructor(options, code) {
      super();
      this.options = options;
      this.code = code;
    }
    eq(other) {
      return other.code == this.code;
    }
    toDOM(view) {
      let ph = placeholder$1(this.code);
      let desc = view.state.phrase("Control character") + " " + (Names[this.code] || "0x" + this.code.toString(16));
      let custom = this.options.render && this.options.render(this.code, desc, ph);
      if (custom)
        return custom;
      let span = document.createElement("span");
      span.textContent = ph;
      span.title = desc;
      span.setAttribute("aria-label", desc);
      span.className = "cm-specialChar";
      return span;
    }
    ignoreEvent() {
      return false;
    }
  };
  var TabWidget = class extends WidgetType {
    constructor(width) {
      super();
      this.width = width;
    }
    eq(other) {
      return other.width == this.width;
    }
    toDOM() {
      let span = document.createElement("span");
      span.textContent = "	";
      span.className = "cm-tab";
      span.style.width = this.width + "px";
      return span;
    }
    ignoreEvent() {
      return false;
    }
  };
  function highlightActiveLine() {
    return activeLineHighlighter;
  }
  var lineDeco = /* @__PURE__ */ Decoration.line({ class: "cm-activeLine" });
  var activeLineHighlighter = /* @__PURE__ */ ViewPlugin.fromClass(class {
    constructor(view) {
      this.decorations = this.getDeco(view);
    }
    update(update3) {
      if (update3.docChanged || update3.selectionSet)
        this.decorations = this.getDeco(update3.view);
    }
    getDeco(view) {
      let lastLineStart = -1, deco = [];
      for (let r of view.state.selection.ranges) {
        if (!r.empty)
          return Decoration.none;
        let line = view.lineBlockAt(r.head);
        if (line.from > lastLineStart) {
          deco.push(lineDeco.range(line.from));
          lastLineStart = line.from;
        }
      }
      return Decoration.set(deco);
    }
  }, {
    decorations: (v) => v.decorations
  });
  var MaxOff = 2e3;
  function rectangleFor(state, a2, b2) {
    let startLine = Math.min(a2.line, b2.line), endLine = Math.max(a2.line, b2.line);
    let ranges = [];
    if (a2.off > MaxOff || b2.off > MaxOff || a2.col < 0 || b2.col < 0) {
      let startOff = Math.min(a2.off, b2.off), endOff = Math.max(a2.off, b2.off);
      for (let i = startLine; i <= endLine; i++) {
        let line = state.doc.line(i);
        if (line.length <= endOff)
          ranges.push(EditorSelection.range(line.from + startOff, line.to + endOff));
      }
    } else {
      let startCol = Math.min(a2.col, b2.col), endCol = Math.max(a2.col, b2.col);
      for (let i = startLine; i <= endLine; i++) {
        let line = state.doc.line(i);
        let start = findColumn(line.text, startCol, state.tabSize, true);
        if (start > -1) {
          let end = findColumn(line.text, endCol, state.tabSize);
          ranges.push(EditorSelection.range(line.from + start, line.from + end));
        }
      }
    }
    return ranges;
  }
  function absoluteColumn(view, x) {
    let ref = view.coordsAtPos(view.viewport.from);
    return ref ? Math.round(Math.abs((ref.left - x) / view.defaultCharacterWidth)) : -1;
  }
  function getPos(view, event) {
    let offset = view.posAtCoords({ x: event.clientX, y: event.clientY }, false);
    let line = view.state.doc.lineAt(offset), off = offset - line.from;
    let col = off > MaxOff ? -1 : off == line.length ? absoluteColumn(view, event.clientX) : countColumn(line.text, view.state.tabSize, offset - line.from);
    return { line: line.number, col, off };
  }
  function rectangleSelectionStyle(view, event) {
    let start = getPos(view, event), startSel = view.state.selection;
    if (!start)
      return null;
    return {
      update(update3) {
        if (update3.docChanged) {
          let newStart = update3.changes.mapPos(update3.startState.doc.line(start.line).from);
          let newLine = update3.state.doc.lineAt(newStart);
          start = { line: newLine.number, col: start.col, off: Math.min(start.off, newLine.length) };
          startSel = startSel.map(update3.changes);
        }
      },
      get(event2, _extend, multiple) {
        let cur2 = getPos(view, event2);
        if (!cur2)
          return startSel;
        let ranges = rectangleFor(view.state, start, cur2);
        if (!ranges.length)
          return startSel;
        if (multiple)
          return EditorSelection.create(ranges.concat(startSel.ranges));
        else
          return EditorSelection.create(ranges);
      }
    };
  }
  function rectangularSelection(options) {
    let filter = (options === null || options === void 0 ? void 0 : options.eventFilter) || ((e) => e.altKey && e.button == 0);
    return EditorView.mouseSelectionStyle.of((view, event) => filter(event) ? rectangleSelectionStyle(view, event) : null);
  }
  var keys = {
    Alt: [18, (e) => e.altKey],
    Control: [17, (e) => e.ctrlKey],
    Shift: [16, (e) => e.shiftKey],
    Meta: [91, (e) => e.metaKey]
  };
  var showCrosshair = { style: "cursor: crosshair" };
  function crosshairCursor(options = {}) {
    let [code, getter] = keys[options.key || "Alt"];
    let plugin = ViewPlugin.fromClass(class {
      constructor(view) {
        this.view = view;
        this.isDown = false;
      }
      set(isDown) {
        if (this.isDown != isDown) {
          this.isDown = isDown;
          this.view.update([]);
        }
      }
    }, {
      eventHandlers: {
        keydown(e) {
          this.set(e.keyCode == code || getter(e));
        },
        keyup(e) {
          if (e.keyCode == code || !getter(e))
            this.set(false);
        }
      }
    });
    return [
      plugin,
      EditorView.contentAttributes.of((view) => {
        var _a2;
        return ((_a2 = view.plugin(plugin)) === null || _a2 === void 0 ? void 0 : _a2.isDown) ? showCrosshair : null;
      })
    ];
  }
  var Outside = "-10000px";
  var TooltipViewManager = class {
    constructor(view, facet, createTooltipView) {
      this.facet = facet;
      this.createTooltipView = createTooltipView;
      this.input = view.state.facet(facet);
      this.tooltips = this.input.filter((t2) => t2);
      this.tooltipViews = this.tooltips.map(createTooltipView);
    }
    update(update3) {
      let input = update3.state.facet(this.facet);
      let tooltips = input.filter((x) => x);
      if (input === this.input) {
        for (let t2 of this.tooltipViews)
          if (t2.update)
            t2.update(update3);
        return false;
      }
      let tooltipViews = [];
      for (let i = 0; i < tooltips.length; i++) {
        let tip = tooltips[i], known = -1;
        if (!tip)
          continue;
        for (let i2 = 0; i2 < this.tooltips.length; i2++) {
          let other = this.tooltips[i2];
          if (other && other.create == tip.create)
            known = i2;
        }
        if (known < 0) {
          tooltipViews[i] = this.createTooltipView(tip);
        } else {
          let tooltipView = tooltipViews[i] = this.tooltipViews[known];
          if (tooltipView.update)
            tooltipView.update(update3);
        }
      }
      for (let t2 of this.tooltipViews)
        if (tooltipViews.indexOf(t2) < 0)
          t2.dom.remove();
      this.input = input;
      this.tooltips = tooltips;
      this.tooltipViews = tooltipViews;
      return true;
    }
  };
  function windowSpace() {
    return { top: 0, left: 0, bottom: innerHeight, right: innerWidth };
  }
  var tooltipConfig = /* @__PURE__ */ Facet.define({
    combine: (values) => {
      var _a2, _b, _c;
      return {
        position: browser.ios ? "absolute" : ((_a2 = values.find((conf) => conf.position)) === null || _a2 === void 0 ? void 0 : _a2.position) || "fixed",
        parent: ((_b = values.find((conf) => conf.parent)) === null || _b === void 0 ? void 0 : _b.parent) || null,
        tooltipSpace: ((_c = values.find((conf) => conf.tooltipSpace)) === null || _c === void 0 ? void 0 : _c.tooltipSpace) || windowSpace
      };
    }
  });
  var tooltipPlugin = /* @__PURE__ */ ViewPlugin.fromClass(class {
    constructor(view) {
      var _a2;
      this.view = view;
      this.inView = true;
      this.lastTransaction = 0;
      this.measureTimeout = -1;
      let config2 = view.state.facet(tooltipConfig);
      this.position = config2.position;
      this.parent = config2.parent;
      this.classes = view.themeClasses;
      this.createContainer();
      this.measureReq = { read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this };
      this.manager = new TooltipViewManager(view, showTooltip, (t2) => this.createTooltip(t2));
      this.intersectionObserver = typeof IntersectionObserver == "function" ? new IntersectionObserver((entries) => {
        if (Date.now() > this.lastTransaction - 50 && entries.length > 0 && entries[entries.length - 1].intersectionRatio < 1)
          this.measureSoon();
      }, { threshold: [1] }) : null;
      this.observeIntersection();
      (_a2 = view.dom.ownerDocument.defaultView) === null || _a2 === void 0 ? void 0 : _a2.addEventListener("resize", this.measureSoon = this.measureSoon.bind(this));
      this.maybeMeasure();
    }
    createContainer() {
      if (this.parent) {
        this.container = document.createElement("div");
        this.container.style.position = "relative";
        this.container.className = this.view.themeClasses;
        this.parent.appendChild(this.container);
      } else {
        this.container = this.view.dom;
      }
    }
    observeIntersection() {
      if (this.intersectionObserver) {
        this.intersectionObserver.disconnect();
        for (let tooltip of this.manager.tooltipViews)
          this.intersectionObserver.observe(tooltip.dom);
      }
    }
    measureSoon() {
      if (this.measureTimeout < 0)
        this.measureTimeout = setTimeout(() => {
          this.measureTimeout = -1;
          this.maybeMeasure();
        }, 50);
    }
    update(update3) {
      if (update3.transactions.length)
        this.lastTransaction = Date.now();
      let updated = this.manager.update(update3);
      if (updated)
        this.observeIntersection();
      let shouldMeasure = updated || update3.geometryChanged;
      let newConfig = update3.state.facet(tooltipConfig);
      if (newConfig.position != this.position) {
        this.position = newConfig.position;
        for (let t2 of this.manager.tooltipViews)
          t2.dom.style.position = this.position;
        shouldMeasure = true;
      }
      if (newConfig.parent != this.parent) {
        if (this.parent)
          this.container.remove();
        this.parent = newConfig.parent;
        this.createContainer();
        for (let t2 of this.manager.tooltipViews)
          this.container.appendChild(t2.dom);
        shouldMeasure = true;
      } else if (this.parent && this.view.themeClasses != this.classes) {
        this.classes = this.container.className = this.view.themeClasses;
      }
      if (shouldMeasure)
        this.maybeMeasure();
    }
    createTooltip(tooltip) {
      let tooltipView = tooltip.create(this.view);
      tooltipView.dom.classList.add("cm-tooltip");
      if (tooltip.arrow && !tooltipView.dom.querySelector(".cm-tooltip > .cm-tooltip-arrow")) {
        let arrow = document.createElement("div");
        arrow.className = "cm-tooltip-arrow";
        tooltipView.dom.appendChild(arrow);
      }
      tooltipView.dom.style.position = this.position;
      tooltipView.dom.style.top = Outside;
      this.container.appendChild(tooltipView.dom);
      if (tooltipView.mount)
        tooltipView.mount(this.view);
      return tooltipView;
    }
    destroy() {
      var _a2, _b;
      (_a2 = this.view.dom.ownerDocument.defaultView) === null || _a2 === void 0 ? void 0 : _a2.removeEventListener("resize", this.measureSoon);
      for (let { dom } of this.manager.tooltipViews)
        dom.remove();
      (_b = this.intersectionObserver) === null || _b === void 0 ? void 0 : _b.disconnect();
      clearTimeout(this.measureTimeout);
    }
    readMeasure() {
      let editor = this.view.dom.getBoundingClientRect();
      return {
        editor,
        parent: this.parent ? this.container.getBoundingClientRect() : editor,
        pos: this.manager.tooltips.map((t2, i) => {
          let tv = this.manager.tooltipViews[i];
          return tv.getCoords ? tv.getCoords(t2.pos) : this.view.coordsAtPos(t2.pos);
        }),
        size: this.manager.tooltipViews.map(({ dom }) => dom.getBoundingClientRect()),
        space: this.view.state.facet(tooltipConfig).tooltipSpace(this.view)
      };
    }
    writeMeasure(measured) {
      let { editor, space } = measured;
      let others = [];
      for (let i = 0; i < this.manager.tooltips.length; i++) {
        let tooltip = this.manager.tooltips[i], tView = this.manager.tooltipViews[i], { dom } = tView;
        let pos = measured.pos[i], size = measured.size[i];
        if (!pos || pos.bottom <= Math.max(editor.top, space.top) || pos.top >= Math.min(editor.bottom, space.bottom) || pos.right < Math.max(editor.left, space.left) - 0.1 || pos.left > Math.min(editor.right, space.right) + 0.1) {
          dom.style.top = Outside;
          continue;
        }
        let arrow = tooltip.arrow ? tView.dom.querySelector(".cm-tooltip-arrow") : null;
        let arrowHeight = arrow ? 7 : 0;
        let width = size.right - size.left, height = size.bottom - size.top;
        let offset = tView.offset || noOffset, ltr = this.view.textDirection == Direction.LTR;
        let left = size.width > space.right - space.left ? ltr ? space.left : space.right - size.width : ltr ? Math.min(pos.left - (arrow ? 14 : 0) + offset.x, space.right - width) : Math.max(space.left, pos.left - width + (arrow ? 14 : 0) - offset.x);
        let above = !!tooltip.above;
        if (!tooltip.strictSide && (above ? pos.top - (size.bottom - size.top) - offset.y < space.top : pos.bottom + (size.bottom - size.top) + offset.y > space.bottom) && above == space.bottom - pos.bottom > pos.top - space.top)
          above = !above;
        let top2 = above ? pos.top - height - arrowHeight - offset.y : pos.bottom + arrowHeight + offset.y;
        let right = left + width;
        if (tView.overlap !== true) {
          for (let r of others)
            if (r.left < right && r.right > left && r.top < top2 + height && r.bottom > top2)
              top2 = above ? r.top - height - 2 - arrowHeight : r.bottom + arrowHeight + 2;
        }
        if (this.position == "absolute") {
          dom.style.top = top2 - measured.parent.top + "px";
          dom.style.left = left - measured.parent.left + "px";
        } else {
          dom.style.top = top2 + "px";
          dom.style.left = left + "px";
        }
        if (arrow)
          arrow.style.left = `${pos.left + (ltr ? offset.x : -offset.x) - (left + 14 - 7)}px`;
        if (tView.overlap !== true)
          others.push({ left, top: top2, right, bottom: top2 + height });
        dom.classList.toggle("cm-tooltip-above", above);
        dom.classList.toggle("cm-tooltip-below", !above);
        if (tView.positioned)
          tView.positioned();
      }
    }
    maybeMeasure() {
      if (this.manager.tooltips.length) {
        if (this.view.inView)
          this.view.requestMeasure(this.measureReq);
        if (this.inView != this.view.inView) {
          this.inView = this.view.inView;
          if (!this.inView)
            for (let tv of this.manager.tooltipViews)
              tv.dom.style.top = Outside;
        }
      }
    }
  }, {
    eventHandlers: {
      scroll() {
        this.maybeMeasure();
      }
    }
  });
  var baseTheme = /* @__PURE__ */ EditorView.baseTheme({
    ".cm-tooltip": {
      zIndex: 100
    },
    "&light .cm-tooltip": {
      border: "1px solid #bbb",
      backgroundColor: "#f5f5f5"
    },
    "&light .cm-tooltip-section:not(:first-child)": {
      borderTop: "1px solid #bbb"
    },
    "&dark .cm-tooltip": {
      backgroundColor: "#333338",
      color: "white"
    },
    ".cm-tooltip-arrow": {
      height: `${7}px`,
      width: `${7 * 2}px`,
      position: "absolute",
      zIndex: -1,
      overflow: "hidden",
      "&:before, &:after": {
        content: "''",
        position: "absolute",
        width: 0,
        height: 0,
        borderLeft: `${7}px solid transparent`,
        borderRight: `${7}px solid transparent`
      },
      ".cm-tooltip-above &": {
        bottom: `-${7}px`,
        "&:before": {
          borderTop: `${7}px solid #bbb`
        },
        "&:after": {
          borderTop: `${7}px solid #f5f5f5`,
          bottom: "1px"
        }
      },
      ".cm-tooltip-below &": {
        top: `-${7}px`,
        "&:before": {
          borderBottom: `${7}px solid #bbb`
        },
        "&:after": {
          borderBottom: `${7}px solid #f5f5f5`,
          top: "1px"
        }
      }
    },
    "&dark .cm-tooltip .cm-tooltip-arrow": {
      "&:before": {
        borderTopColor: "#333338",
        borderBottomColor: "#333338"
      },
      "&:after": {
        borderTopColor: "transparent",
        borderBottomColor: "transparent"
      }
    }
  });
  var noOffset = { x: 0, y: 0 };
  var showTooltip = /* @__PURE__ */ Facet.define({
    enables: [tooltipPlugin, baseTheme]
  });
  var showHoverTooltip = /* @__PURE__ */ Facet.define();
  var HoverTooltipHost = class {
    constructor(view) {
      this.view = view;
      this.mounted = false;
      this.dom = document.createElement("div");
      this.dom.classList.add("cm-tooltip-hover");
      this.manager = new TooltipViewManager(view, showHoverTooltip, (t2) => this.createHostedView(t2));
    }
    static create(view) {
      return new HoverTooltipHost(view);
    }
    createHostedView(tooltip) {
      let hostedView = tooltip.create(this.view);
      hostedView.dom.classList.add("cm-tooltip-section");
      this.dom.appendChild(hostedView.dom);
      if (this.mounted && hostedView.mount)
        hostedView.mount(this.view);
      return hostedView;
    }
    mount(view) {
      for (let hostedView of this.manager.tooltipViews) {
        if (hostedView.mount)
          hostedView.mount(view);
      }
      this.mounted = true;
    }
    positioned() {
      for (let hostedView of this.manager.tooltipViews) {
        if (hostedView.positioned)
          hostedView.positioned();
      }
    }
    update(update3) {
      this.manager.update(update3);
    }
  };
  var showHoverTooltipHost = /* @__PURE__ */ showTooltip.compute([showHoverTooltip], (state) => {
    let tooltips = state.facet(showHoverTooltip).filter((t2) => t2);
    if (tooltips.length === 0)
      return null;
    return {
      pos: Math.min(...tooltips.map((t2) => t2.pos)),
      end: Math.max(...tooltips.filter((t2) => t2.end != null).map((t2) => t2.end)),
      create: HoverTooltipHost.create,
      above: tooltips[0].above,
      arrow: tooltips.some((t2) => t2.arrow)
    };
  });
  var HoverPlugin = class {
    constructor(view, source, field, setHover, hoverTime) {
      this.view = view;
      this.source = source;
      this.field = field;
      this.setHover = setHover;
      this.hoverTime = hoverTime;
      this.hoverTimeout = -1;
      this.restartTimeout = -1;
      this.pending = null;
      this.lastMove = { x: 0, y: 0, target: view.dom, time: 0 };
      this.checkHover = this.checkHover.bind(this);
      view.dom.addEventListener("mouseleave", this.mouseleave = this.mouseleave.bind(this));
      view.dom.addEventListener("mousemove", this.mousemove = this.mousemove.bind(this));
    }
    update() {
      if (this.pending) {
        this.pending = null;
        clearTimeout(this.restartTimeout);
        this.restartTimeout = setTimeout(() => this.startHover(), 20);
      }
    }
    get active() {
      return this.view.state.field(this.field);
    }
    checkHover() {
      this.hoverTimeout = -1;
      if (this.active)
        return;
      let hovered = Date.now() - this.lastMove.time;
      if (hovered < this.hoverTime)
        this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime - hovered);
      else
        this.startHover();
    }
    startHover() {
      clearTimeout(this.restartTimeout);
      let { lastMove } = this;
      let pos = this.view.contentDOM.contains(lastMove.target) ? this.view.posAtCoords(lastMove) : null;
      if (pos == null)
        return;
      let posCoords = this.view.coordsAtPos(pos);
      if (posCoords == null || lastMove.y < posCoords.top || lastMove.y > posCoords.bottom || lastMove.x < posCoords.left - this.view.defaultCharacterWidth || lastMove.x > posCoords.right + this.view.defaultCharacterWidth)
        return;
      let bidi = this.view.bidiSpans(this.view.state.doc.lineAt(pos)).find((s) => s.from <= pos && s.to >= pos);
      let rtl = bidi && bidi.dir == Direction.RTL ? -1 : 1;
      let open = this.source(this.view, pos, lastMove.x < posCoords.left ? -rtl : rtl);
      if (open === null || open === void 0 ? void 0 : open.then) {
        let pending = this.pending = { pos };
        open.then((result) => {
          if (this.pending == pending) {
            this.pending = null;
            if (result)
              this.view.dispatch({ effects: this.setHover.of(result) });
          }
        }, (e) => logException(this.view.state, e, "hover tooltip"));
      } else if (open) {
        this.view.dispatch({ effects: this.setHover.of(open) });
      }
    }
    mousemove(event) {
      var _a2;
      this.lastMove = { x: event.clientX, y: event.clientY, target: event.target, time: Date.now() };
      if (this.hoverTimeout < 0)
        this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime);
      let tooltip = this.active;
      if (tooltip && !isInTooltip(this.lastMove.target) || this.pending) {
        let { pos } = tooltip || this.pending, end = (_a2 = tooltip === null || tooltip === void 0 ? void 0 : tooltip.end) !== null && _a2 !== void 0 ? _a2 : pos;
        if (pos == end ? this.view.posAtCoords(this.lastMove) != pos : !isOverRange(this.view, pos, end, event.clientX, event.clientY, 6)) {
          this.view.dispatch({ effects: this.setHover.of(null) });
          this.pending = null;
        }
      }
    }
    mouseleave() {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = -1;
      if (this.active)
        this.view.dispatch({ effects: this.setHover.of(null) });
    }
    destroy() {
      clearTimeout(this.hoverTimeout);
      this.view.dom.removeEventListener("mouseleave", this.mouseleave);
      this.view.dom.removeEventListener("mousemove", this.mousemove);
    }
  };
  function isInTooltip(elt) {
    for (let cur2 = elt; cur2; cur2 = cur2.parentNode)
      if (cur2.nodeType == 1 && cur2.classList.contains("cm-tooltip"))
        return true;
    return false;
  }
  function isOverRange(view, from, to2, x, y, margin) {
    let range2 = document.createRange();
    let fromDOM = view.domAtPos(from), toDOM = view.domAtPos(to2);
    range2.setEnd(toDOM.node, toDOM.offset);
    range2.setStart(fromDOM.node, fromDOM.offset);
    let rects = range2.getClientRects();
    range2.detach();
    for (let i = 0; i < rects.length; i++) {
      let rect = rects[i];
      let dist = Math.max(rect.top - y, y - rect.bottom, rect.left - x, x - rect.right);
      if (dist <= margin)
        return true;
    }
    return false;
  }
  function hoverTooltip(source, options = {}) {
    let setHover = StateEffect.define();
    let hoverState = StateField.define({
      create() {
        return null;
      },
      update(value2, tr) {
        if (value2 && (options.hideOnChange && (tr.docChanged || tr.selection) || options.hideOn && options.hideOn(tr, value2)))
          return null;
        if (value2 && tr.docChanged) {
          let newPos = tr.changes.mapPos(value2.pos, -1, MapMode.TrackDel);
          if (newPos == null)
            return null;
          let copy = Object.assign(/* @__PURE__ */ Object.create(null), value2);
          copy.pos = newPos;
          if (value2.end != null)
            copy.end = tr.changes.mapPos(value2.end);
          value2 = copy;
        }
        for (let effect of tr.effects) {
          if (effect.is(setHover))
            value2 = effect.value;
          if (effect.is(closeHoverTooltipEffect))
            value2 = null;
        }
        return value2;
      },
      provide: (f) => showHoverTooltip.from(f)
    });
    return [
      hoverState,
      ViewPlugin.define((view) => new HoverPlugin(view, source, hoverState, setHover, options.hoverTime || 300)),
      showHoverTooltipHost
    ];
  }
  function getTooltip(view, tooltip) {
    let plugin = view.plugin(tooltipPlugin);
    if (!plugin)
      return null;
    let found = plugin.manager.tooltips.indexOf(tooltip);
    return found < 0 ? null : plugin.manager.tooltipViews[found];
  }
  var closeHoverTooltipEffect = /* @__PURE__ */ StateEffect.define();
  var panelConfig = /* @__PURE__ */ Facet.define({
    combine(configs) {
      let topContainer, bottomContainer;
      for (let c4 of configs) {
        topContainer = topContainer || c4.topContainer;
        bottomContainer = bottomContainer || c4.bottomContainer;
      }
      return { topContainer, bottomContainer };
    }
  });
  function getPanel(view, panel) {
    let plugin = view.plugin(panelPlugin);
    let index = plugin ? plugin.specs.indexOf(panel) : -1;
    return index > -1 ? plugin.panels[index] : null;
  }
  var panelPlugin = /* @__PURE__ */ ViewPlugin.fromClass(class {
    constructor(view) {
      this.input = view.state.facet(showPanel);
      this.specs = this.input.filter((s) => s);
      this.panels = this.specs.map((spec) => spec(view));
      let conf = view.state.facet(panelConfig);
      this.top = new PanelGroup(view, true, conf.topContainer);
      this.bottom = new PanelGroup(view, false, conf.bottomContainer);
      this.top.sync(this.panels.filter((p2) => p2.top));
      this.bottom.sync(this.panels.filter((p2) => !p2.top));
      for (let p2 of this.panels) {
        p2.dom.classList.add("cm-panel");
        if (p2.mount)
          p2.mount();
      }
    }
    update(update3) {
      let conf = update3.state.facet(panelConfig);
      if (this.top.container != conf.topContainer) {
        this.top.sync([]);
        this.top = new PanelGroup(update3.view, true, conf.topContainer);
      }
      if (this.bottom.container != conf.bottomContainer) {
        this.bottom.sync([]);
        this.bottom = new PanelGroup(update3.view, false, conf.bottomContainer);
      }
      this.top.syncClasses();
      this.bottom.syncClasses();
      let input = update3.state.facet(showPanel);
      if (input != this.input) {
        let specs = input.filter((x) => x);
        let panels = [], top2 = [], bottom = [], mount = [];
        for (let spec of specs) {
          let known = this.specs.indexOf(spec), panel;
          if (known < 0) {
            panel = spec(update3.view);
            mount.push(panel);
          } else {
            panel = this.panels[known];
            if (panel.update)
              panel.update(update3);
          }
          panels.push(panel);
          (panel.top ? top2 : bottom).push(panel);
        }
        this.specs = specs;
        this.panels = panels;
        this.top.sync(top2);
        this.bottom.sync(bottom);
        for (let p2 of mount) {
          p2.dom.classList.add("cm-panel");
          if (p2.mount)
            p2.mount();
        }
      } else {
        for (let p2 of this.panels)
          if (p2.update)
            p2.update(update3);
      }
    }
    destroy() {
      this.top.sync([]);
      this.bottom.sync([]);
    }
  }, {
    provide: (plugin) => EditorView.scrollMargins.of((view) => {
      let value2 = view.plugin(plugin);
      return value2 && { top: value2.top.scrollMargin(), bottom: value2.bottom.scrollMargin() };
    })
  });
  var PanelGroup = class {
    constructor(view, top2, container) {
      this.view = view;
      this.top = top2;
      this.container = container;
      this.dom = void 0;
      this.classes = "";
      this.panels = [];
      this.syncClasses();
    }
    sync(panels) {
      for (let p2 of this.panels)
        if (p2.destroy && panels.indexOf(p2) < 0)
          p2.destroy();
      this.panels = panels;
      this.syncDOM();
    }
    syncDOM() {
      if (this.panels.length == 0) {
        if (this.dom) {
          this.dom.remove();
          this.dom = void 0;
        }
        return;
      }
      if (!this.dom) {
        this.dom = document.createElement("div");
        this.dom.className = this.top ? "cm-panels cm-panels-top" : "cm-panels cm-panels-bottom";
        this.dom.style[this.top ? "top" : "bottom"] = "0";
        let parent = this.container || this.view.dom;
        parent.insertBefore(this.dom, this.top ? parent.firstChild : null);
      }
      let curDOM = this.dom.firstChild;
      for (let panel of this.panels) {
        if (panel.dom.parentNode == this.dom) {
          while (curDOM != panel.dom)
            curDOM = rm(curDOM);
          curDOM = curDOM.nextSibling;
        } else {
          this.dom.insertBefore(panel.dom, curDOM);
        }
      }
      while (curDOM)
        curDOM = rm(curDOM);
    }
    scrollMargin() {
      return !this.dom || this.container ? 0 : Math.max(0, this.top ? this.dom.getBoundingClientRect().bottom - Math.max(0, this.view.scrollDOM.getBoundingClientRect().top) : Math.min(innerHeight, this.view.scrollDOM.getBoundingClientRect().bottom) - this.dom.getBoundingClientRect().top);
    }
    syncClasses() {
      if (!this.container || this.classes == this.view.themeClasses)
        return;
      for (let cls of this.classes.split(" "))
        if (cls)
          this.container.classList.remove(cls);
      for (let cls of (this.classes = this.view.themeClasses).split(" "))
        if (cls)
          this.container.classList.add(cls);
    }
  };
  function rm(node) {
    let next = node.nextSibling;
    node.remove();
    return next;
  }
  var showPanel = /* @__PURE__ */ Facet.define({
    enables: panelPlugin
  });
  var GutterMarker = class extends RangeValue {
    compare(other) {
      return this == other || this.constructor == other.constructor && this.eq(other);
    }
    eq(other) {
      return false;
    }
    destroy(dom) {
    }
  };
  GutterMarker.prototype.elementClass = "";
  GutterMarker.prototype.toDOM = void 0;
  GutterMarker.prototype.mapMode = MapMode.TrackBefore;
  GutterMarker.prototype.startSide = GutterMarker.prototype.endSide = -1;
  GutterMarker.prototype.point = true;
  var gutterLineClass = /* @__PURE__ */ Facet.define();
  var defaults = {
    class: "",
    renderEmptyElements: false,
    elementStyle: "",
    markers: () => RangeSet.empty,
    lineMarker: () => null,
    lineMarkerChange: null,
    initialSpacer: null,
    updateSpacer: null,
    domEventHandlers: {}
  };
  var activeGutters = /* @__PURE__ */ Facet.define();
  function gutter(config2) {
    return [gutters(), activeGutters.of(Object.assign(Object.assign({}, defaults), config2))];
  }
  var unfixGutters = /* @__PURE__ */ Facet.define({
    combine: (values) => values.some((x) => x)
  });
  function gutters(config2) {
    let result = [
      gutterView
    ];
    if (config2 && config2.fixed === false)
      result.push(unfixGutters.of(true));
    return result;
  }
  var gutterView = /* @__PURE__ */ ViewPlugin.fromClass(class {
    constructor(view) {
      this.view = view;
      this.prevViewport = view.viewport;
      this.dom = document.createElement("div");
      this.dom.className = "cm-gutters";
      this.dom.setAttribute("aria-hidden", "true");
      this.dom.style.minHeight = this.view.contentHeight + "px";
      this.gutters = view.state.facet(activeGutters).map((conf) => new SingleGutterView(view, conf));
      for (let gutter2 of this.gutters)
        this.dom.appendChild(gutter2.dom);
      this.fixed = !view.state.facet(unfixGutters);
      if (this.fixed) {
        this.dom.style.position = "sticky";
      }
      this.syncGutters(false);
      view.scrollDOM.insertBefore(this.dom, view.contentDOM);
    }
    update(update3) {
      if (this.updateGutters(update3)) {
        let vpA = this.prevViewport, vpB = update3.view.viewport;
        let vpOverlap = Math.min(vpA.to, vpB.to) - Math.max(vpA.from, vpB.from);
        this.syncGutters(vpOverlap < (vpB.to - vpB.from) * 0.8);
      }
      if (update3.geometryChanged)
        this.dom.style.minHeight = this.view.contentHeight + "px";
      if (this.view.state.facet(unfixGutters) != !this.fixed) {
        this.fixed = !this.fixed;
        this.dom.style.position = this.fixed ? "sticky" : "";
      }
      this.prevViewport = update3.view.viewport;
    }
    syncGutters(detach) {
      let after = this.dom.nextSibling;
      if (detach)
        this.dom.remove();
      let lineClasses = RangeSet.iter(this.view.state.facet(gutterLineClass), this.view.viewport.from);
      let classSet = [];
      let contexts = this.gutters.map((gutter2) => new UpdateContext(gutter2, this.view.viewport, -this.view.documentPadding.top));
      for (let line of this.view.viewportLineBlocks) {
        let text;
        if (Array.isArray(line.type)) {
          for (let b2 of line.type)
            if (b2.type == BlockType.Text) {
              text = b2;
              break;
            }
        } else {
          text = line.type == BlockType.Text ? line : void 0;
        }
        if (!text)
          continue;
        if (classSet.length)
          classSet = [];
        advanceCursor(lineClasses, classSet, line.from);
        for (let cx of contexts)
          cx.line(this.view, text, classSet);
      }
      for (let cx of contexts)
        cx.finish();
      if (detach)
        this.view.scrollDOM.insertBefore(this.dom, after);
    }
    updateGutters(update3) {
      let prev = update3.startState.facet(activeGutters), cur2 = update3.state.facet(activeGutters);
      let change = update3.docChanged || update3.heightChanged || update3.viewportChanged || !RangeSet.eq(update3.startState.facet(gutterLineClass), update3.state.facet(gutterLineClass), update3.view.viewport.from, update3.view.viewport.to);
      if (prev == cur2) {
        for (let gutter2 of this.gutters)
          if (gutter2.update(update3))
            change = true;
      } else {
        change = true;
        let gutters2 = [];
        for (let conf of cur2) {
          let known = prev.indexOf(conf);
          if (known < 0) {
            gutters2.push(new SingleGutterView(this.view, conf));
          } else {
            this.gutters[known].update(update3);
            gutters2.push(this.gutters[known]);
          }
        }
        for (let g2 of this.gutters) {
          g2.dom.remove();
          if (gutters2.indexOf(g2) < 0)
            g2.destroy();
        }
        for (let g2 of gutters2)
          this.dom.appendChild(g2.dom);
        this.gutters = gutters2;
      }
      return change;
    }
    destroy() {
      for (let view of this.gutters)
        view.destroy();
      this.dom.remove();
    }
  }, {
    provide: (plugin) => EditorView.scrollMargins.of((view) => {
      let value2 = view.plugin(plugin);
      if (!value2 || value2.gutters.length == 0 || !value2.fixed)
        return null;
      return view.textDirection == Direction.LTR ? { left: value2.dom.offsetWidth } : { right: value2.dom.offsetWidth };
    })
  });
  function asArray2(val) {
    return Array.isArray(val) ? val : [val];
  }
  function advanceCursor(cursor, collect, pos) {
    while (cursor.value && cursor.from <= pos) {
      if (cursor.from == pos)
        collect.push(cursor.value);
      cursor.next();
    }
  }
  var UpdateContext = class {
    constructor(gutter2, viewport, height) {
      this.gutter = gutter2;
      this.height = height;
      this.localMarkers = [];
      this.i = 0;
      this.cursor = RangeSet.iter(gutter2.markers, viewport.from);
    }
    line(view, line, extraMarkers) {
      if (this.localMarkers.length)
        this.localMarkers = [];
      advanceCursor(this.cursor, this.localMarkers, line.from);
      let localMarkers = extraMarkers.length ? this.localMarkers.concat(extraMarkers) : this.localMarkers;
      let forLine = this.gutter.config.lineMarker(view, line, localMarkers);
      if (forLine)
        localMarkers.unshift(forLine);
      let gutter2 = this.gutter;
      if (localMarkers.length == 0 && !gutter2.config.renderEmptyElements)
        return;
      let above = line.top - this.height;
      if (this.i == gutter2.elements.length) {
        let newElt = new GutterElement(view, line.height, above, localMarkers);
        gutter2.elements.push(newElt);
        gutter2.dom.appendChild(newElt.dom);
      } else {
        gutter2.elements[this.i].update(view, line.height, above, localMarkers);
      }
      this.height = line.bottom;
      this.i++;
    }
    finish() {
      let gutter2 = this.gutter;
      while (gutter2.elements.length > this.i) {
        let last2 = gutter2.elements.pop();
        gutter2.dom.removeChild(last2.dom);
        last2.destroy();
      }
    }
  };
  var SingleGutterView = class {
    constructor(view, config2) {
      this.view = view;
      this.config = config2;
      this.elements = [];
      this.spacer = null;
      this.dom = document.createElement("div");
      this.dom.className = "cm-gutter" + (this.config.class ? " " + this.config.class : "");
      for (let prop in config2.domEventHandlers) {
        this.dom.addEventListener(prop, (event) => {
          let line = view.lineBlockAtHeight(event.clientY - view.documentTop);
          if (config2.domEventHandlers[prop](view, line, event))
            event.preventDefault();
        });
      }
      this.markers = asArray2(config2.markers(view));
      if (config2.initialSpacer) {
        this.spacer = new GutterElement(view, 0, 0, [config2.initialSpacer(view)]);
        this.dom.appendChild(this.spacer.dom);
        this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none";
      }
    }
    update(update3) {
      let prevMarkers = this.markers;
      this.markers = asArray2(this.config.markers(update3.view));
      if (this.spacer && this.config.updateSpacer) {
        let updated = this.config.updateSpacer(this.spacer.markers[0], update3);
        if (updated != this.spacer.markers[0])
          this.spacer.update(update3.view, 0, 0, [updated]);
      }
      let vp = update3.view.viewport;
      return !RangeSet.eq(this.markers, prevMarkers, vp.from, vp.to) || (this.config.lineMarkerChange ? this.config.lineMarkerChange(update3) : false);
    }
    destroy() {
      for (let elt of this.elements)
        elt.destroy();
    }
  };
  var GutterElement = class {
    constructor(view, height, above, markers) {
      this.height = -1;
      this.above = 0;
      this.markers = [];
      this.dom = document.createElement("div");
      this.dom.className = "cm-gutterElement";
      this.update(view, height, above, markers);
    }
    update(view, height, above, markers) {
      if (this.height != height)
        this.dom.style.height = (this.height = height) + "px";
      if (this.above != above)
        this.dom.style.marginTop = (this.above = above) ? above + "px" : "";
      if (!sameMarkers(this.markers, markers))
        this.setMarkers(view, markers);
    }
    setMarkers(view, markers) {
      let cls = "cm-gutterElement", domPos = this.dom.firstChild;
      for (let iNew = 0, iOld = 0; ; ) {
        let skipTo = iOld, marker = iNew < markers.length ? markers[iNew++] : null, matched = false;
        if (marker) {
          let c4 = marker.elementClass;
          if (c4)
            cls += " " + c4;
          for (let i = iOld; i < this.markers.length; i++)
            if (this.markers[i].compare(marker)) {
              skipTo = i;
              matched = true;
              break;
            }
        } else {
          skipTo = this.markers.length;
        }
        while (iOld < skipTo) {
          let next = this.markers[iOld++];
          if (next.toDOM) {
            next.destroy(domPos);
            let after = domPos.nextSibling;
            domPos.remove();
            domPos = after;
          }
        }
        if (!marker)
          break;
        if (marker.toDOM) {
          if (matched)
            domPos = domPos.nextSibling;
          else
            this.dom.insertBefore(marker.toDOM(view), domPos);
        }
        if (matched)
          iOld++;
      }
      this.dom.className = cls;
      this.markers = markers;
    }
    destroy() {
      this.setMarkers(null, []);
    }
  };
  function sameMarkers(a2, b2) {
    if (a2.length != b2.length)
      return false;
    for (let i = 0; i < a2.length; i++)
      if (!a2[i].compare(b2[i]))
        return false;
    return true;
  }
  var lineNumberMarkers = /* @__PURE__ */ Facet.define();
  var lineNumberConfig = /* @__PURE__ */ Facet.define({
    combine(values) {
      return combineConfig(values, { formatNumber: String, domEventHandlers: {} }, {
        domEventHandlers(a2, b2) {
          let result = Object.assign({}, a2);
          for (let event in b2) {
            let exists = result[event], add2 = b2[event];
            result[event] = exists ? (view, line, event2) => exists(view, line, event2) || add2(view, line, event2) : add2;
          }
          return result;
        }
      });
    }
  });
  var NumberMarker = class extends GutterMarker {
    constructor(number2) {
      super();
      this.number = number2;
    }
    eq(other) {
      return this.number == other.number;
    }
    toDOM() {
      return document.createTextNode(this.number);
    }
  };
  function formatNumber(view, number2) {
    return view.state.facet(lineNumberConfig).formatNumber(number2, view.state);
  }
  var lineNumberGutter = /* @__PURE__ */ activeGutters.compute([lineNumberConfig], (state) => ({
    class: "cm-lineNumbers",
    renderEmptyElements: false,
    markers(view) {
      return view.state.facet(lineNumberMarkers);
    },
    lineMarker(view, line, others) {
      if (others.some((m3) => m3.toDOM))
        return null;
      return new NumberMarker(formatNumber(view, view.state.doc.lineAt(line.from).number));
    },
    lineMarkerChange: (update3) => update3.startState.facet(lineNumberConfig) != update3.state.facet(lineNumberConfig),
    initialSpacer(view) {
      return new NumberMarker(formatNumber(view, maxLineNumber(view.state.doc.lines)));
    },
    updateSpacer(spacer, update3) {
      let max2 = formatNumber(update3.view, maxLineNumber(update3.view.state.doc.lines));
      return max2 == spacer.number ? spacer : new NumberMarker(max2);
    },
    domEventHandlers: state.facet(lineNumberConfig).domEventHandlers
  }));
  function lineNumbers(config2 = {}) {
    return [
      lineNumberConfig.of(config2),
      gutters(),
      lineNumberGutter
    ];
  }
  function maxLineNumber(lines) {
    let last2 = 9;
    while (last2 < lines)
      last2 = last2 * 10 + 9;
    return last2;
  }
  var activeLineGutterMarker = /* @__PURE__ */ new class extends GutterMarker {
    constructor() {
      super(...arguments);
      this.elementClass = "cm-activeLineGutter";
    }
  }();
  var activeLineGutterHighlighter = /* @__PURE__ */ gutterLineClass.compute(["selection"], (state) => {
    let marks = [], last2 = -1;
    for (let range2 of state.selection.ranges)
      if (range2.empty) {
        let linePos = state.doc.lineAt(range2.head).from;
        if (linePos > last2) {
          last2 = linePos;
          marks.push(activeLineGutterMarker.range(linePos));
        }
      }
    return RangeSet.of(marks);
  });
  function highlightActiveLineGutter() {
    return activeLineGutterHighlighter;
  }

  // node_modules/@lezer/common/dist/index.js
  var DefaultBufferLength = 1024;
  var nextPropID = 0;
  var Range2 = class {
    constructor(from, to2) {
      this.from = from;
      this.to = to2;
    }
  };
  var NodeProp = class {
    constructor(config2 = {}) {
      this.id = nextPropID++;
      this.perNode = !!config2.perNode;
      this.deserialize = config2.deserialize || (() => {
        throw new Error("This node type doesn't define a deserialize function");
      });
    }
    add(match) {
      if (this.perNode)
        throw new RangeError("Can't add per-node props to node types");
      if (typeof match != "function")
        match = NodeType.match(match);
      return (type2) => {
        let result = match(type2);
        return result === void 0 ? null : [this, result];
      };
    }
  };
  NodeProp.closedBy = new NodeProp({ deserialize: (str) => str.split(" ") });
  NodeProp.openedBy = new NodeProp({ deserialize: (str) => str.split(" ") });
  NodeProp.group = new NodeProp({ deserialize: (str) => str.split(" ") });
  NodeProp.contextHash = new NodeProp({ perNode: true });
  NodeProp.lookAhead = new NodeProp({ perNode: true });
  NodeProp.mounted = new NodeProp({ perNode: true });
  var noProps = /* @__PURE__ */ Object.create(null);
  var NodeType = class {
    constructor(name2, props, id, flags = 0) {
      this.name = name2;
      this.props = props;
      this.id = id;
      this.flags = flags;
    }
    static define(spec) {
      let props = spec.props && spec.props.length ? /* @__PURE__ */ Object.create(null) : noProps;
      let flags = (spec.top ? 1 : 0) | (spec.skipped ? 2 : 0) | (spec.error ? 4 : 0) | (spec.name == null ? 8 : 0);
      let type2 = new NodeType(spec.name || "", props, spec.id, flags);
      if (spec.props)
        for (let src of spec.props) {
          if (!Array.isArray(src))
            src = src(type2);
          if (src) {
            if (src[0].perNode)
              throw new RangeError("Can't store a per-node prop on a node type");
            props[src[0].id] = src[1];
          }
        }
      return type2;
    }
    prop(prop) {
      return this.props[prop.id];
    }
    get isTop() {
      return (this.flags & 1) > 0;
    }
    get isSkipped() {
      return (this.flags & 2) > 0;
    }
    get isError() {
      return (this.flags & 4) > 0;
    }
    get isAnonymous() {
      return (this.flags & 8) > 0;
    }
    is(name2) {
      if (typeof name2 == "string") {
        if (this.name == name2)
          return true;
        let group = this.prop(NodeProp.group);
        return group ? group.indexOf(name2) > -1 : false;
      }
      return this.id == name2;
    }
    static match(map) {
      let direct = /* @__PURE__ */ Object.create(null);
      for (let prop in map)
        for (let name2 of prop.split(" "))
          direct[name2] = map[prop];
      return (node) => {
        for (let groups = node.prop(NodeProp.group), i = -1; i < (groups ? groups.length : 0); i++) {
          let found = direct[i < 0 ? node.name : groups[i]];
          if (found)
            return found;
        }
      };
    }
  };
  NodeType.none = new NodeType("", /* @__PURE__ */ Object.create(null), 0, 8);
  var CachedNode = /* @__PURE__ */ new WeakMap();
  var CachedInnerNode = /* @__PURE__ */ new WeakMap();
  var IterMode;
  (function(IterMode2) {
    IterMode2[IterMode2["ExcludeBuffers"] = 1] = "ExcludeBuffers";
    IterMode2[IterMode2["IncludeAnonymous"] = 2] = "IncludeAnonymous";
    IterMode2[IterMode2["IgnoreMounts"] = 4] = "IgnoreMounts";
    IterMode2[IterMode2["IgnoreOverlays"] = 8] = "IgnoreOverlays";
  })(IterMode || (IterMode = {}));
  var Tree = class {
    constructor(type2, children, positions, length, props) {
      this.type = type2;
      this.children = children;
      this.positions = positions;
      this.length = length;
      this.props = null;
      if (props && props.length) {
        this.props = /* @__PURE__ */ Object.create(null);
        for (let [prop, value2] of props)
          this.props[typeof prop == "number" ? prop : prop.id] = value2;
      }
    }
    toString() {
      let mounted = this.prop(NodeProp.mounted);
      if (mounted && !mounted.overlay)
        return mounted.tree.toString();
      let children = "";
      for (let ch of this.children) {
        let str = ch.toString();
        if (str) {
          if (children)
            children += ",";
          children += str;
        }
      }
      return !this.type.name ? children : (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) + (children.length ? "(" + children + ")" : "");
    }
    cursor(mode = 0) {
      return new TreeCursor(this.topNode, mode);
    }
    cursorAt(pos, side = 0, mode = 0) {
      let scope = CachedNode.get(this) || this.topNode;
      let cursor = new TreeCursor(scope);
      cursor.moveTo(pos, side);
      CachedNode.set(this, cursor._tree);
      return cursor;
    }
    get topNode() {
      return new TreeNode(this, 0, 0, null);
    }
    resolve(pos, side = 0) {
      let node = resolveNode(CachedNode.get(this) || this.topNode, pos, side, false);
      CachedNode.set(this, node);
      return node;
    }
    resolveInner(pos, side = 0) {
      let node = resolveNode(CachedInnerNode.get(this) || this.topNode, pos, side, true);
      CachedInnerNode.set(this, node);
      return node;
    }
    iterate(spec) {
      let { enter, leave, from = 0, to: to2 = this.length } = spec;
      for (let c4 = this.cursor((spec.mode || 0) | IterMode.IncludeAnonymous); ; ) {
        let entered = false;
        if (c4.from <= to2 && c4.to >= from && (c4.type.isAnonymous || enter(c4) !== false)) {
          if (c4.firstChild())
            continue;
          entered = true;
        }
        for (; ; ) {
          if (entered && leave && !c4.type.isAnonymous)
            leave(c4);
          if (c4.nextSibling())
            break;
          if (!c4.parent())
            return;
          entered = true;
        }
      }
    }
    prop(prop) {
      return !prop.perNode ? this.type.prop(prop) : this.props ? this.props[prop.id] : void 0;
    }
    get propValues() {
      let result = [];
      if (this.props)
        for (let id in this.props)
          result.push([+id, this.props[id]]);
      return result;
    }
    balance(config2 = {}) {
      return this.children.length <= 8 ? this : balanceRange(NodeType.none, this.children, this.positions, 0, this.children.length, 0, this.length, (children, positions, length) => new Tree(this.type, children, positions, length, this.propValues), config2.makeTree || ((children, positions, length) => new Tree(NodeType.none, children, positions, length)));
    }
    static build(data) {
      return buildTree(data);
    }
  };
  Tree.empty = new Tree(NodeType.none, [], [], 0);
  var FlatBufferCursor = class {
    constructor(buffer, index) {
      this.buffer = buffer;
      this.index = index;
    }
    get id() {
      return this.buffer[this.index - 4];
    }
    get start() {
      return this.buffer[this.index - 3];
    }
    get end() {
      return this.buffer[this.index - 2];
    }
    get size() {
      return this.buffer[this.index - 1];
    }
    get pos() {
      return this.index;
    }
    next() {
      this.index -= 4;
    }
    fork() {
      return new FlatBufferCursor(this.buffer, this.index);
    }
  };
  var TreeBuffer = class {
    constructor(buffer, length, set2) {
      this.buffer = buffer;
      this.length = length;
      this.set = set2;
    }
    get type() {
      return NodeType.none;
    }
    toString() {
      let result = [];
      for (let index = 0; index < this.buffer.length; ) {
        result.push(this.childString(index));
        index = this.buffer[index + 3];
      }
      return result.join(",");
    }
    childString(index) {
      let id = this.buffer[index], endIndex = this.buffer[index + 3];
      let type2 = this.set.types[id], result = type2.name;
      if (/\W/.test(result) && !type2.isError)
        result = JSON.stringify(result);
      index += 4;
      if (endIndex == index)
        return result;
      let children = [];
      while (index < endIndex) {
        children.push(this.childString(index));
        index = this.buffer[index + 3];
      }
      return result + "(" + children.join(",") + ")";
    }
    findChild(startIndex, endIndex, dir, pos, side) {
      let { buffer } = this, pick = -1;
      for (let i = startIndex; i != endIndex; i = buffer[i + 3]) {
        if (checkSide(side, pos, buffer[i + 1], buffer[i + 2])) {
          pick = i;
          if (dir > 0)
            break;
        }
      }
      return pick;
    }
    slice(startI, endI, from, to2) {
      let b2 = this.buffer;
      let copy = new Uint16Array(endI - startI);
      for (let i = startI, j = 0; i < endI; ) {
        copy[j++] = b2[i++];
        copy[j++] = b2[i++] - from;
        copy[j++] = b2[i++] - from;
        copy[j++] = b2[i++] - startI;
      }
      return new TreeBuffer(copy, to2 - from, this.set);
    }
  };
  function checkSide(side, pos, from, to2) {
    switch (side) {
      case -2:
        return from < pos;
      case -1:
        return to2 >= pos && from < pos;
      case 0:
        return from < pos && to2 > pos;
      case 1:
        return from <= pos && to2 > pos;
      case 2:
        return to2 > pos;
      case 4:
        return true;
    }
  }
  function enterUnfinishedNodesBefore(node, pos) {
    let scan = node.childBefore(pos);
    while (scan) {
      let last2 = scan.lastChild;
      if (!last2 || last2.to != scan.to)
        break;
      if (last2.type.isError && last2.from == last2.to) {
        node = scan;
        scan = last2.prevSibling;
      } else {
        scan = last2;
      }
    }
    return node;
  }
  function resolveNode(node, pos, side, overlays) {
    var _a2;
    while (node.from == node.to || (side < 1 ? node.from >= pos : node.from > pos) || (side > -1 ? node.to <= pos : node.to < pos)) {
      let parent = !overlays && node instanceof TreeNode && node.index < 0 ? null : node.parent;
      if (!parent)
        return node;
      node = parent;
    }
    let mode = overlays ? 0 : IterMode.IgnoreOverlays;
    if (overlays)
      for (let scan = node, parent = scan.parent; parent; scan = parent, parent = scan.parent) {
        if (scan instanceof TreeNode && scan.index < 0 && ((_a2 = parent.enter(pos, side, mode)) === null || _a2 === void 0 ? void 0 : _a2.from) != scan.from)
          node = parent;
      }
    for (; ; ) {
      let inner = node.enter(pos, side, mode);
      if (!inner)
        return node;
      node = inner;
    }
  }
  var TreeNode = class {
    constructor(_tree, from, index, _parent) {
      this._tree = _tree;
      this.from = from;
      this.index = index;
      this._parent = _parent;
    }
    get type() {
      return this._tree.type;
    }
    get name() {
      return this._tree.type.name;
    }
    get to() {
      return this.from + this._tree.length;
    }
    nextChild(i, dir, pos, side, mode = 0) {
      for (let parent = this; ; ) {
        for (let { children, positions } = parent._tree, e = dir > 0 ? children.length : -1; i != e; i += dir) {
          let next = children[i], start = positions[i] + parent.from;
          if (!checkSide(side, pos, start, start + next.length))
            continue;
          if (next instanceof TreeBuffer) {
            if (mode & IterMode.ExcludeBuffers)
              continue;
            let index = next.findChild(0, next.buffer.length, dir, pos - start, side);
            if (index > -1)
              return new BufferNode(new BufferContext(parent, next, i, start), null, index);
          } else if (mode & IterMode.IncludeAnonymous || (!next.type.isAnonymous || hasChild(next))) {
            let mounted;
            if (!(mode & IterMode.IgnoreMounts) && next.props && (mounted = next.prop(NodeProp.mounted)) && !mounted.overlay)
              return new TreeNode(mounted.tree, start, i, parent);
            let inner = new TreeNode(next, start, i, parent);
            return mode & IterMode.IncludeAnonymous || !inner.type.isAnonymous ? inner : inner.nextChild(dir < 0 ? next.children.length - 1 : 0, dir, pos, side);
          }
        }
        if (mode & IterMode.IncludeAnonymous || !parent.type.isAnonymous)
          return null;
        if (parent.index >= 0)
          i = parent.index + dir;
        else
          i = dir < 0 ? -1 : parent._parent._tree.children.length;
        parent = parent._parent;
        if (!parent)
          return null;
      }
    }
    get firstChild() {
      return this.nextChild(0, 1, 0, 4);
    }
    get lastChild() {
      return this.nextChild(this._tree.children.length - 1, -1, 0, 4);
    }
    childAfter(pos) {
      return this.nextChild(0, 1, pos, 2);
    }
    childBefore(pos) {
      return this.nextChild(this._tree.children.length - 1, -1, pos, -2);
    }
    enter(pos, side, mode = 0) {
      let mounted;
      if (!(mode & IterMode.IgnoreOverlays) && (mounted = this._tree.prop(NodeProp.mounted)) && mounted.overlay) {
        let rPos = pos - this.from;
        for (let { from, to: to2 } of mounted.overlay) {
          if ((side > 0 ? from <= rPos : from < rPos) && (side < 0 ? to2 >= rPos : to2 > rPos))
            return new TreeNode(mounted.tree, mounted.overlay[0].from + this.from, -1, this);
        }
      }
      return this.nextChild(0, 1, pos, side, mode);
    }
    nextSignificantParent() {
      let val = this;
      while (val.type.isAnonymous && val._parent)
        val = val._parent;
      return val;
    }
    get parent() {
      return this._parent ? this._parent.nextSignificantParent() : null;
    }
    get nextSibling() {
      return this._parent && this.index >= 0 ? this._parent.nextChild(this.index + 1, 1, 0, 4) : null;
    }
    get prevSibling() {
      return this._parent && this.index >= 0 ? this._parent.nextChild(this.index - 1, -1, 0, 4) : null;
    }
    cursor(mode = 0) {
      return new TreeCursor(this, mode);
    }
    get tree() {
      return this._tree;
    }
    toTree() {
      return this._tree;
    }
    resolve(pos, side = 0) {
      return resolveNode(this, pos, side, false);
    }
    resolveInner(pos, side = 0) {
      return resolveNode(this, pos, side, true);
    }
    enterUnfinishedNodesBefore(pos) {
      return enterUnfinishedNodesBefore(this, pos);
    }
    getChild(type2, before = null, after = null) {
      let r = getChildren(this, type2, before, after);
      return r.length ? r[0] : null;
    }
    getChildren(type2, before = null, after = null) {
      return getChildren(this, type2, before, after);
    }
    toString() {
      return this._tree.toString();
    }
    get node() {
      return this;
    }
    matchContext(context2) {
      return matchNodeContext(this, context2);
    }
  };
  function getChildren(node, type2, before, after) {
    let cur2 = node.cursor(), result = [];
    if (!cur2.firstChild())
      return result;
    if (before != null) {
      while (!cur2.type.is(before))
        if (!cur2.nextSibling())
          return result;
    }
    for (; ; ) {
      if (after != null && cur2.type.is(after))
        return result;
      if (cur2.type.is(type2))
        result.push(cur2.node);
      if (!cur2.nextSibling())
        return after == null ? result : [];
    }
  }
  function matchNodeContext(node, context2, i = context2.length - 1) {
    for (let p2 = node.parent; i >= 0; p2 = p2.parent) {
      if (!p2)
        return false;
      if (!p2.type.isAnonymous) {
        if (context2[i] && context2[i] != p2.name)
          return false;
        i--;
      }
    }
    return true;
  }
  var BufferContext = class {
    constructor(parent, buffer, index, start) {
      this.parent = parent;
      this.buffer = buffer;
      this.index = index;
      this.start = start;
    }
  };
  var BufferNode = class {
    constructor(context2, _parent, index) {
      this.context = context2;
      this._parent = _parent;
      this.index = index;
      this.type = context2.buffer.set.types[context2.buffer.buffer[index]];
    }
    get name() {
      return this.type.name;
    }
    get from() {
      return this.context.start + this.context.buffer.buffer[this.index + 1];
    }
    get to() {
      return this.context.start + this.context.buffer.buffer[this.index + 2];
    }
    child(dir, pos, side) {
      let { buffer } = this.context;
      let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, pos - this.context.start, side);
      return index < 0 ? null : new BufferNode(this.context, this, index);
    }
    get firstChild() {
      return this.child(1, 0, 4);
    }
    get lastChild() {
      return this.child(-1, 0, 4);
    }
    childAfter(pos) {
      return this.child(1, pos, 2);
    }
    childBefore(pos) {
      return this.child(-1, pos, -2);
    }
    enter(pos, side, mode = 0) {
      if (mode & IterMode.ExcludeBuffers)
        return null;
      let { buffer } = this.context;
      let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], side > 0 ? 1 : -1, pos - this.context.start, side);
      return index < 0 ? null : new BufferNode(this.context, this, index);
    }
    get parent() {
      return this._parent || this.context.parent.nextSignificantParent();
    }
    externalSibling(dir) {
      return this._parent ? null : this.context.parent.nextChild(this.context.index + dir, dir, 0, 4);
    }
    get nextSibling() {
      let { buffer } = this.context;
      let after = buffer.buffer[this.index + 3];
      if (after < (this._parent ? buffer.buffer[this._parent.index + 3] : buffer.buffer.length))
        return new BufferNode(this.context, this._parent, after);
      return this.externalSibling(1);
    }
    get prevSibling() {
      let { buffer } = this.context;
      let parentStart = this._parent ? this._parent.index + 4 : 0;
      if (this.index == parentStart)
        return this.externalSibling(-1);
      return new BufferNode(this.context, this._parent, buffer.findChild(parentStart, this.index, -1, 0, 4));
    }
    cursor(mode = 0) {
      return new TreeCursor(this, mode);
    }
    get tree() {
      return null;
    }
    toTree() {
      let children = [], positions = [];
      let { buffer } = this.context;
      let startI = this.index + 4, endI = buffer.buffer[this.index + 3];
      if (endI > startI) {
        let from = buffer.buffer[this.index + 1], to2 = buffer.buffer[this.index + 2];
        children.push(buffer.slice(startI, endI, from, to2));
        positions.push(0);
      }
      return new Tree(this.type, children, positions, this.to - this.from);
    }
    resolve(pos, side = 0) {
      return resolveNode(this, pos, side, false);
    }
    resolveInner(pos, side = 0) {
      return resolveNode(this, pos, side, true);
    }
    enterUnfinishedNodesBefore(pos) {
      return enterUnfinishedNodesBefore(this, pos);
    }
    toString() {
      return this.context.buffer.childString(this.index);
    }
    getChild(type2, before = null, after = null) {
      let r = getChildren(this, type2, before, after);
      return r.length ? r[0] : null;
    }
    getChildren(type2, before = null, after = null) {
      return getChildren(this, type2, before, after);
    }
    get node() {
      return this;
    }
    matchContext(context2) {
      return matchNodeContext(this, context2);
    }
  };
  var TreeCursor = class {
    constructor(node, mode = 0) {
      this.mode = mode;
      this.buffer = null;
      this.stack = [];
      this.index = 0;
      this.bufferNode = null;
      if (node instanceof TreeNode) {
        this.yieldNode(node);
      } else {
        this._tree = node.context.parent;
        this.buffer = node.context;
        for (let n2 = node._parent; n2; n2 = n2._parent)
          this.stack.unshift(n2.index);
        this.bufferNode = node;
        this.yieldBuf(node.index);
      }
    }
    get name() {
      return this.type.name;
    }
    yieldNode(node) {
      if (!node)
        return false;
      this._tree = node;
      this.type = node.type;
      this.from = node.from;
      this.to = node.to;
      return true;
    }
    yieldBuf(index, type2) {
      this.index = index;
      let { start, buffer } = this.buffer;
      this.type = type2 || buffer.set.types[buffer.buffer[index]];
      this.from = start + buffer.buffer[index + 1];
      this.to = start + buffer.buffer[index + 2];
      return true;
    }
    yield(node) {
      if (!node)
        return false;
      if (node instanceof TreeNode) {
        this.buffer = null;
        return this.yieldNode(node);
      }
      this.buffer = node.context;
      return this.yieldBuf(node.index, node.type);
    }
    toString() {
      return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
    }
    enterChild(dir, pos, side) {
      if (!this.buffer)
        return this.yield(this._tree.nextChild(dir < 0 ? this._tree._tree.children.length - 1 : 0, dir, pos, side, this.mode));
      let { buffer } = this.buffer;
      let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, pos - this.buffer.start, side);
      if (index < 0)
        return false;
      this.stack.push(this.index);
      return this.yieldBuf(index);
    }
    firstChild() {
      return this.enterChild(1, 0, 4);
    }
    lastChild() {
      return this.enterChild(-1, 0, 4);
    }
    childAfter(pos) {
      return this.enterChild(1, pos, 2);
    }
    childBefore(pos) {
      return this.enterChild(-1, pos, -2);
    }
    enter(pos, side, mode = this.mode) {
      if (!this.buffer)
        return this.yield(this._tree.enter(pos, side, mode));
      return mode & IterMode.ExcludeBuffers ? false : this.enterChild(1, pos, side);
    }
    parent() {
      if (!this.buffer)
        return this.yieldNode(this.mode & IterMode.IncludeAnonymous ? this._tree._parent : this._tree.parent);
      if (this.stack.length)
        return this.yieldBuf(this.stack.pop());
      let parent = this.mode & IterMode.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
      this.buffer = null;
      return this.yieldNode(parent);
    }
    sibling(dir) {
      if (!this.buffer)
        return !this._tree._parent ? false : this.yield(this._tree.index < 0 ? null : this._tree._parent.nextChild(this._tree.index + dir, dir, 0, 4, this.mode));
      let { buffer } = this.buffer, d2 = this.stack.length - 1;
      if (dir < 0) {
        let parentStart = d2 < 0 ? 0 : this.stack[d2] + 4;
        if (this.index != parentStart)
          return this.yieldBuf(buffer.findChild(parentStart, this.index, -1, 0, 4));
      } else {
        let after = buffer.buffer[this.index + 3];
        if (after < (d2 < 0 ? buffer.buffer.length : buffer.buffer[this.stack[d2] + 3]))
          return this.yieldBuf(after);
      }
      return d2 < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + dir, dir, 0, 4, this.mode)) : false;
    }
    nextSibling() {
      return this.sibling(1);
    }
    prevSibling() {
      return this.sibling(-1);
    }
    atLastNode(dir) {
      let index, parent, { buffer } = this;
      if (buffer) {
        if (dir > 0) {
          if (this.index < buffer.buffer.buffer.length)
            return false;
        } else {
          for (let i = 0; i < this.index; i++)
            if (buffer.buffer.buffer[i + 3] < this.index)
              return false;
        }
        ({ index, parent } = buffer);
      } else {
        ({ index, _parent: parent } = this._tree);
      }
      for (; parent; { index, _parent: parent } = parent) {
        if (index > -1)
          for (let i = index + dir, e = dir < 0 ? -1 : parent._tree.children.length; i != e; i += dir) {
            let child = parent._tree.children[i];
            if (this.mode & IterMode.IncludeAnonymous || child instanceof TreeBuffer || !child.type.isAnonymous || hasChild(child))
              return false;
          }
      }
      return true;
    }
    move(dir, enter) {
      if (enter && this.enterChild(dir, 0, 4))
        return true;
      for (; ; ) {
        if (this.sibling(dir))
          return true;
        if (this.atLastNode(dir) || !this.parent())
          return false;
      }
    }
    next(enter = true) {
      return this.move(1, enter);
    }
    prev(enter = true) {
      return this.move(-1, enter);
    }
    moveTo(pos, side = 0) {
      while (this.from == this.to || (side < 1 ? this.from >= pos : this.from > pos) || (side > -1 ? this.to <= pos : this.to < pos))
        if (!this.parent())
          break;
      while (this.enterChild(1, pos, side)) {
      }
      return this;
    }
    get node() {
      if (!this.buffer)
        return this._tree;
      let cache = this.bufferNode, result = null, depth = 0;
      if (cache && cache.context == this.buffer) {
        scan:
          for (let index = this.index, d2 = this.stack.length; d2 >= 0; ) {
            for (let c4 = cache; c4; c4 = c4._parent)
              if (c4.index == index) {
                if (index == this.index)
                  return c4;
                result = c4;
                depth = d2 + 1;
                break scan;
              }
            index = this.stack[--d2];
          }
      }
      for (let i = depth; i < this.stack.length; i++)
        result = new BufferNode(this.buffer, result, this.stack[i]);
      return this.bufferNode = new BufferNode(this.buffer, result, this.index);
    }
    get tree() {
      return this.buffer ? null : this._tree._tree;
    }
    iterate(enter, leave) {
      for (let depth = 0; ; ) {
        let mustLeave = false;
        if (this.type.isAnonymous || enter(this) !== false) {
          if (this.firstChild()) {
            depth++;
            continue;
          }
          if (!this.type.isAnonymous)
            mustLeave = true;
        }
        for (; ; ) {
          if (mustLeave && leave)
            leave(this);
          mustLeave = this.type.isAnonymous;
          if (this.nextSibling())
            break;
          if (!depth)
            return;
          this.parent();
          depth--;
          mustLeave = true;
        }
      }
    }
    matchContext(context2) {
      if (!this.buffer)
        return matchNodeContext(this.node, context2);
      let { buffer } = this.buffer, { types: types2 } = buffer.set;
      for (let i = context2.length - 1, d2 = this.stack.length - 1; i >= 0; d2--) {
        if (d2 < 0)
          return matchNodeContext(this.node, context2, i);
        let type2 = types2[buffer.buffer[this.stack[d2]]];
        if (!type2.isAnonymous) {
          if (context2[i] && context2[i] != type2.name)
            return false;
          i--;
        }
      }
      return true;
    }
  };
  function hasChild(tree) {
    return tree.children.some((ch) => ch instanceof TreeBuffer || !ch.type.isAnonymous || hasChild(ch));
  }
  function buildTree(data) {
    var _a2;
    let { buffer, nodeSet, maxBufferLength = DefaultBufferLength, reused = [], minRepeatType = nodeSet.types.length } = data;
    let cursor = Array.isArray(buffer) ? new FlatBufferCursor(buffer, buffer.length) : buffer;
    let types2 = nodeSet.types;
    let contextHash = 0, lookAhead = 0;
    function takeNode(parentStart, minPos, children2, positions2, inRepeat) {
      let { id, start, end, size } = cursor;
      let lookAheadAtStart = lookAhead;
      while (size < 0) {
        cursor.next();
        if (size == -1) {
          let node2 = reused[id];
          children2.push(node2);
          positions2.push(start - parentStart);
          return;
        } else if (size == -3) {
          contextHash = id;
          return;
        } else if (size == -4) {
          lookAhead = id;
          return;
        } else {
          throw new RangeError(`Unrecognized record size: ${size}`);
        }
      }
      let type2 = types2[id], node, buffer2;
      let startPos = start - parentStart;
      if (end - start <= maxBufferLength && (buffer2 = findBufferSize(cursor.pos - minPos, inRepeat))) {
        let data2 = new Uint16Array(buffer2.size - buffer2.skip);
        let endPos = cursor.pos - buffer2.size, index = data2.length;
        while (cursor.pos > endPos)
          index = copyToBuffer(buffer2.start, data2, index);
        node = new TreeBuffer(data2, end - buffer2.start, nodeSet);
        startPos = buffer2.start - parentStart;
      } else {
        let endPos = cursor.pos - size;
        cursor.next();
        let localChildren = [], localPositions = [];
        let localInRepeat = id >= minRepeatType ? id : -1;
        let lastGroup = 0, lastEnd = end;
        while (cursor.pos > endPos) {
          if (localInRepeat >= 0 && cursor.id == localInRepeat && cursor.size >= 0) {
            if (cursor.end <= lastEnd - maxBufferLength) {
              makeRepeatLeaf(localChildren, localPositions, start, lastGroup, cursor.end, lastEnd, localInRepeat, lookAheadAtStart);
              lastGroup = localChildren.length;
              lastEnd = cursor.end;
            }
            cursor.next();
          } else {
            takeNode(start, endPos, localChildren, localPositions, localInRepeat);
          }
        }
        if (localInRepeat >= 0 && lastGroup > 0 && lastGroup < localChildren.length)
          makeRepeatLeaf(localChildren, localPositions, start, lastGroup, start, lastEnd, localInRepeat, lookAheadAtStart);
        localChildren.reverse();
        localPositions.reverse();
        if (localInRepeat > -1 && lastGroup > 0) {
          let make = makeBalanced(type2);
          node = balanceRange(type2, localChildren, localPositions, 0, localChildren.length, 0, end - start, make, make);
        } else {
          node = makeTree(type2, localChildren, localPositions, end - start, lookAheadAtStart - end);
        }
      }
      children2.push(node);
      positions2.push(startPos);
    }
    function makeBalanced(type2) {
      return (children2, positions2, length2) => {
        let lookAhead2 = 0, lastI = children2.length - 1, last2, lookAheadProp;
        if (lastI >= 0 && (last2 = children2[lastI]) instanceof Tree) {
          if (!lastI && last2.type == type2 && last2.length == length2)
            return last2;
          if (lookAheadProp = last2.prop(NodeProp.lookAhead))
            lookAhead2 = positions2[lastI] + last2.length + lookAheadProp;
        }
        return makeTree(type2, children2, positions2, length2, lookAhead2);
      };
    }
    function makeRepeatLeaf(children2, positions2, base2, i, from, to2, type2, lookAhead2) {
      let localChildren = [], localPositions = [];
      while (children2.length > i) {
        localChildren.push(children2.pop());
        localPositions.push(positions2.pop() + base2 - from);
      }
      children2.push(makeTree(nodeSet.types[type2], localChildren, localPositions, to2 - from, lookAhead2 - to2));
      positions2.push(from - base2);
    }
    function makeTree(type2, children2, positions2, length2, lookAhead2 = 0, props) {
      if (contextHash) {
        let pair = [NodeProp.contextHash, contextHash];
        props = props ? [pair].concat(props) : [pair];
      }
      if (lookAhead2 > 25) {
        let pair = [NodeProp.lookAhead, lookAhead2];
        props = props ? [pair].concat(props) : [pair];
      }
      return new Tree(type2, children2, positions2, length2, props);
    }
    function findBufferSize(maxSize, inRepeat) {
      let fork = cursor.fork();
      let size = 0, start = 0, skip = 0, minStart = fork.end - maxBufferLength;
      let result = { size: 0, start: 0, skip: 0 };
      scan:
        for (let minPos = fork.pos - maxSize; fork.pos > minPos; ) {
          let nodeSize2 = fork.size;
          if (fork.id == inRepeat && nodeSize2 >= 0) {
            result.size = size;
            result.start = start;
            result.skip = skip;
            skip += 4;
            size += 4;
            fork.next();
            continue;
          }
          let startPos = fork.pos - nodeSize2;
          if (nodeSize2 < 0 || startPos < minPos || fork.start < minStart)
            break;
          let localSkipped = fork.id >= minRepeatType ? 4 : 0;
          let nodeStart2 = fork.start;
          fork.next();
          while (fork.pos > startPos) {
            if (fork.size < 0) {
              if (fork.size == -3)
                localSkipped += 4;
              else
                break scan;
            } else if (fork.id >= minRepeatType) {
              localSkipped += 4;
            }
            fork.next();
          }
          start = nodeStart2;
          size += nodeSize2;
          skip += localSkipped;
        }
      if (inRepeat < 0 || size == maxSize) {
        result.size = size;
        result.start = start;
        result.skip = skip;
      }
      return result.size > 4 ? result : void 0;
    }
    function copyToBuffer(bufferStart, buffer2, index) {
      let { id, start, end, size } = cursor;
      cursor.next();
      if (size >= 0 && id < minRepeatType) {
        let startIndex = index;
        if (size > 4) {
          let endPos = cursor.pos - (size - 4);
          while (cursor.pos > endPos)
            index = copyToBuffer(bufferStart, buffer2, index);
        }
        buffer2[--index] = startIndex;
        buffer2[--index] = end - bufferStart;
        buffer2[--index] = start - bufferStart;
        buffer2[--index] = id;
      } else if (size == -3) {
        contextHash = id;
      } else if (size == -4) {
        lookAhead = id;
      }
      return index;
    }
    let children = [], positions = [];
    while (cursor.pos > 0)
      takeNode(data.start || 0, data.bufferStart || 0, children, positions, -1);
    let length = (_a2 = data.length) !== null && _a2 !== void 0 ? _a2 : children.length ? positions[0] + children[0].length : 0;
    return new Tree(types2[data.topID], children.reverse(), positions.reverse(), length);
  }
  var nodeSizeCache = /* @__PURE__ */ new WeakMap();
  function nodeSize(balanceType, node) {
    if (!balanceType.isAnonymous || node instanceof TreeBuffer || node.type != balanceType)
      return 1;
    let size = nodeSizeCache.get(node);
    if (size == null) {
      size = 1;
      for (let child of node.children) {
        if (child.type != balanceType || !(child instanceof Tree)) {
          size = 1;
          break;
        }
        size += nodeSize(balanceType, child);
      }
      nodeSizeCache.set(node, size);
    }
    return size;
  }
  function balanceRange(balanceType, children, positions, from, to2, start, length, mkTop, mkTree) {
    let total = 0;
    for (let i = from; i < to2; i++)
      total += nodeSize(balanceType, children[i]);
    let maxChild = Math.ceil(total * 1.5 / 8);
    let localChildren = [], localPositions = [];
    function divide(children2, positions2, from2, to3, offset) {
      for (let i = from2; i < to3; ) {
        let groupFrom = i, groupStart = positions2[i], groupSize = nodeSize(balanceType, children2[i]);
        i++;
        for (; i < to3; i++) {
          let nextSize = nodeSize(balanceType, children2[i]);
          if (groupSize + nextSize >= maxChild)
            break;
          groupSize += nextSize;
        }
        if (i == groupFrom + 1) {
          if (groupSize > maxChild) {
            let only = children2[groupFrom];
            divide(only.children, only.positions, 0, only.children.length, positions2[groupFrom] + offset);
            continue;
          }
          localChildren.push(children2[groupFrom]);
        } else {
          let length2 = positions2[i - 1] + children2[i - 1].length - groupStart;
          localChildren.push(balanceRange(balanceType, children2, positions2, groupFrom, i, groupStart, length2, null, mkTree));
        }
        localPositions.push(groupStart + offset - start);
      }
    }
    divide(children, positions, from, to2, 0);
    return (mkTop || mkTree)(localChildren, localPositions, length);
  }
  var TreeFragment = class {
    constructor(from, to2, tree, offset, openStart = false, openEnd = false) {
      this.from = from;
      this.to = to2;
      this.tree = tree;
      this.offset = offset;
      this.open = (openStart ? 1 : 0) | (openEnd ? 2 : 0);
    }
    get openStart() {
      return (this.open & 1) > 0;
    }
    get openEnd() {
      return (this.open & 2) > 0;
    }
    static addTree(tree, fragments = [], partial = false) {
      let result = [new TreeFragment(0, tree.length, tree, 0, false, partial)];
      for (let f of fragments)
        if (f.to > tree.length)
          result.push(f);
      return result;
    }
    static applyChanges(fragments, changes, minGap = 128) {
      if (!changes.length)
        return fragments;
      let result = [];
      let fI = 1, nextF = fragments.length ? fragments[0] : null;
      for (let cI = 0, pos = 0, off = 0; ; cI++) {
        let nextC = cI < changes.length ? changes[cI] : null;
        let nextPos = nextC ? nextC.fromA : 1e9;
        if (nextPos - pos >= minGap)
          while (nextF && nextF.from < nextPos) {
            let cut = nextF;
            if (pos >= cut.from || nextPos <= cut.to || off) {
              let fFrom = Math.max(cut.from, pos) - off, fTo = Math.min(cut.to, nextPos) - off;
              cut = fFrom >= fTo ? null : new TreeFragment(fFrom, fTo, cut.tree, cut.offset + off, cI > 0, !!nextC);
            }
            if (cut)
              result.push(cut);
            if (nextF.to > nextPos)
              break;
            nextF = fI < fragments.length ? fragments[fI++] : null;
          }
        if (!nextC)
          break;
        pos = nextC.toA;
        off = nextC.toA - nextC.toB;
      }
      return result;
    }
  };
  var Parser = class {
    startParse(input, fragments, ranges) {
      if (typeof input == "string")
        input = new StringInput(input);
      ranges = !ranges ? [new Range2(0, input.length)] : ranges.length ? ranges.map((r) => new Range2(r.from, r.to)) : [new Range2(0, 0)];
      return this.createParse(input, fragments || [], ranges);
    }
    parse(input, fragments, ranges) {
      let parse2 = this.startParse(input, fragments, ranges);
      for (; ; ) {
        let done = parse2.advance();
        if (done)
          return done;
      }
    }
  };
  var StringInput = class {
    constructor(string2) {
      this.string = string2;
    }
    get length() {
      return this.string.length;
    }
    chunk(from) {
      return this.string.slice(from);
    }
    get lineChunks() {
      return false;
    }
    read(from, to2) {
      return this.string.slice(from, to2);
    }
  };
  var stoppedInner = new NodeProp({ perNode: true });

  // node_modules/@lezer/highlight/dist/index.js
  var nextTagID = 0;
  var Tag = class {
    constructor(set2, base2, modified) {
      this.set = set2;
      this.base = base2;
      this.modified = modified;
      this.id = nextTagID++;
    }
    static define(parent) {
      if (parent === null || parent === void 0 ? void 0 : parent.base)
        throw new Error("Can not derive from a modified tag");
      let tag = new Tag([], null, []);
      tag.set.push(tag);
      if (parent)
        for (let t2 of parent.set)
          tag.set.push(t2);
      return tag;
    }
    static defineModifier() {
      let mod2 = new Modifier();
      return (tag) => {
        if (tag.modified.indexOf(mod2) > -1)
          return tag;
        return Modifier.get(tag.base || tag, tag.modified.concat(mod2).sort((a2, b2) => a2.id - b2.id));
      };
    }
  };
  var nextModifierID = 0;
  var Modifier = class {
    constructor() {
      this.instances = [];
      this.id = nextModifierID++;
    }
    static get(base2, mods) {
      if (!mods.length)
        return base2;
      let exists = mods[0].instances.find((t2) => t2.base == base2 && sameArray2(mods, t2.modified));
      if (exists)
        return exists;
      let set2 = [], tag = new Tag(set2, base2, mods);
      for (let m3 of mods)
        m3.instances.push(tag);
      let configs = permute(mods);
      for (let parent of base2.set)
        for (let config2 of configs)
          set2.push(Modifier.get(parent, config2));
      return tag;
    }
  };
  function sameArray2(a2, b2) {
    return a2.length == b2.length && a2.every((x, i) => x == b2[i]);
  }
  function permute(array) {
    let result = [array];
    for (let i = 0; i < array.length; i++) {
      for (let a2 of permute(array.slice(0, i).concat(array.slice(i + 1))))
        result.push(a2);
    }
    return result;
  }
  function styleTags(spec) {
    let byName = /* @__PURE__ */ Object.create(null);
    for (let prop in spec) {
      let tags2 = spec[prop];
      if (!Array.isArray(tags2))
        tags2 = [tags2];
      for (let part of prop.split(" "))
        if (part) {
          let pieces = [], mode = 2, rest = part;
          for (let pos = 0; ; ) {
            if (rest == "..." && pos > 0 && pos + 3 == part.length) {
              mode = 1;
              break;
            }
            let m3 = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(rest);
            if (!m3)
              throw new RangeError("Invalid path: " + part);
            pieces.push(m3[0] == "*" ? "" : m3[0][0] == '"' ? JSON.parse(m3[0]) : m3[0]);
            pos += m3[0].length;
            if (pos == part.length)
              break;
            let next = part[pos++];
            if (pos == part.length && next == "!") {
              mode = 0;
              break;
            }
            if (next != "/")
              throw new RangeError("Invalid path: " + part);
            rest = part.slice(pos);
          }
          let last2 = pieces.length - 1, inner = pieces[last2];
          if (!inner)
            throw new RangeError("Invalid path: " + part);
          let rule = new Rule(tags2, mode, last2 > 0 ? pieces.slice(0, last2) : null);
          byName[inner] = rule.sort(byName[inner]);
        }
    }
    return ruleNodeProp.add(byName);
  }
  var ruleNodeProp = new NodeProp();
  var Rule = class {
    constructor(tags2, mode, context2, next) {
      this.tags = tags2;
      this.mode = mode;
      this.context = context2;
      this.next = next;
    }
    sort(other) {
      if (!other || other.depth < this.depth) {
        this.next = other;
        return this;
      }
      other.next = this.sort(other.next);
      return other;
    }
    get depth() {
      return this.context ? this.context.length : 0;
    }
  };
  function tagHighlighter(tags2, options) {
    let map = /* @__PURE__ */ Object.create(null);
    for (let style2 of tags2) {
      if (!Array.isArray(style2.tag))
        map[style2.tag.id] = style2.class;
      else
        for (let tag of style2.tag)
          map[tag.id] = style2.class;
    }
    let { scope, all = null } = options || {};
    return {
      style: (tags3) => {
        let cls = all;
        for (let tag of tags3) {
          for (let sub of tag.set) {
            let tagClass = map[sub.id];
            if (tagClass) {
              cls = cls ? cls + " " + tagClass : tagClass;
              break;
            }
          }
        }
        return cls;
      },
      scope
    };
  }
  function highlightTags(highlighters, tags2) {
    let result = null;
    for (let highlighter of highlighters) {
      let value2 = highlighter.style(tags2);
      if (value2)
        result = result ? result + " " + value2 : value2;
    }
    return result;
  }
  function highlightTree(tree, highlighter, putStyle, from = 0, to2 = tree.length) {
    let builder = new HighlightBuilder(from, Array.isArray(highlighter) ? highlighter : [highlighter], putStyle);
    builder.highlightRange(tree.cursor(), from, to2, "", builder.highlighters);
    builder.flush(to2);
  }
  var HighlightBuilder = class {
    constructor(at, highlighters, span) {
      this.at = at;
      this.highlighters = highlighters;
      this.span = span;
      this.class = "";
    }
    startSpan(at, cls) {
      if (cls != this.class) {
        this.flush(at);
        if (at > this.at)
          this.at = at;
        this.class = cls;
      }
    }
    flush(to2) {
      if (to2 > this.at && this.class)
        this.span(this.at, to2, this.class);
    }
    highlightRange(cursor, from, to2, inheritedClass, highlighters) {
      let { type: type2, from: start, to: end } = cursor;
      if (start >= to2 || end <= from)
        return;
      if (type2.isTop)
        highlighters = this.highlighters.filter((h) => !h.scope || h.scope(type2));
      let cls = inheritedClass;
      let rule = type2.prop(ruleNodeProp), opaque = false;
      while (rule) {
        if (!rule.context || cursor.matchContext(rule.context)) {
          let tagCls = highlightTags(highlighters, rule.tags);
          if (tagCls) {
            if (cls)
              cls += " ";
            cls += tagCls;
            if (rule.mode == 1)
              inheritedClass += (inheritedClass ? " " : "") + tagCls;
            else if (rule.mode == 0)
              opaque = true;
          }
          break;
        }
        rule = rule.next;
      }
      this.startSpan(cursor.from, cls);
      if (opaque)
        return;
      let mounted = cursor.tree && cursor.tree.prop(NodeProp.mounted);
      if (mounted && mounted.overlay) {
        let inner = cursor.node.enter(mounted.overlay[0].from + start, 1);
        let innerHighlighters = this.highlighters.filter((h) => !h.scope || h.scope(mounted.tree.type));
        let hasChild2 = cursor.firstChild();
        for (let i = 0, pos = start; ; i++) {
          let next = i < mounted.overlay.length ? mounted.overlay[i] : null;
          let nextPos = next ? next.from + start : end;
          let rangeFrom = Math.max(from, pos), rangeTo = Math.min(to2, nextPos);
          if (rangeFrom < rangeTo && hasChild2) {
            while (cursor.from < rangeTo) {
              this.highlightRange(cursor, rangeFrom, rangeTo, inheritedClass, highlighters);
              this.startSpan(Math.min(to2, cursor.to), cls);
              if (cursor.to >= nextPos || !cursor.nextSibling())
                break;
            }
          }
          if (!next || nextPos > to2)
            break;
          pos = next.to + start;
          if (pos > from) {
            this.highlightRange(inner.cursor(), Math.max(from, next.from + start), Math.min(to2, pos), inheritedClass, innerHighlighters);
            this.startSpan(pos, cls);
          }
        }
        if (hasChild2)
          cursor.parent();
      } else if (cursor.firstChild()) {
        do {
          if (cursor.to <= from)
            continue;
          if (cursor.from >= to2)
            break;
          this.highlightRange(cursor, from, to2, inheritedClass, highlighters);
          this.startSpan(Math.min(to2, cursor.to), cls);
        } while (cursor.nextSibling());
        cursor.parent();
      }
    }
  };
  var t = Tag.define;
  var comment = t();
  var name = t();
  var typeName = t(name);
  var propertyName = t(name);
  var literal = t();
  var string = t(literal);
  var number = t(literal);
  var content = t();
  var heading = t(content);
  var keyword = t();
  var operator = t();
  var punctuation = t();
  var bracket = t(punctuation);
  var meta = t();
  var tags = {
    comment,
    lineComment: t(comment),
    blockComment: t(comment),
    docComment: t(comment),
    name,
    variableName: t(name),
    typeName,
    tagName: t(typeName),
    propertyName,
    attributeName: t(propertyName),
    className: t(name),
    labelName: t(name),
    namespace: t(name),
    macroName: t(name),
    literal,
    string,
    docString: t(string),
    character: t(string),
    attributeValue: t(string),
    number,
    integer: t(number),
    float: t(number),
    bool: t(literal),
    regexp: t(literal),
    escape: t(literal),
    color: t(literal),
    url: t(literal),
    keyword,
    self: t(keyword),
    null: t(keyword),
    atom: t(keyword),
    unit: t(keyword),
    modifier: t(keyword),
    operatorKeyword: t(keyword),
    controlKeyword: t(keyword),
    definitionKeyword: t(keyword),
    moduleKeyword: t(keyword),
    operator,
    derefOperator: t(operator),
    arithmeticOperator: t(operator),
    logicOperator: t(operator),
    bitwiseOperator: t(operator),
    compareOperator: t(operator),
    updateOperator: t(operator),
    definitionOperator: t(operator),
    typeOperator: t(operator),
    controlOperator: t(operator),
    punctuation,
    separator: t(punctuation),
    bracket,
    angleBracket: t(bracket),
    squareBracket: t(bracket),
    paren: t(bracket),
    brace: t(bracket),
    content,
    heading,
    heading1: t(heading),
    heading2: t(heading),
    heading3: t(heading),
    heading4: t(heading),
    heading5: t(heading),
    heading6: t(heading),
    contentSeparator: t(content),
    list: t(content),
    quote: t(content),
    emphasis: t(content),
    strong: t(content),
    link: t(content),
    monospace: t(content),
    strikethrough: t(content),
    inserted: t(),
    deleted: t(),
    changed: t(),
    invalid: t(),
    meta,
    documentMeta: t(meta),
    annotation: t(meta),
    processingInstruction: t(meta),
    definition: Tag.defineModifier(),
    constant: Tag.defineModifier(),
    function: Tag.defineModifier(),
    standard: Tag.defineModifier(),
    local: Tag.defineModifier(),
    special: Tag.defineModifier()
  };
  var classHighlighter = tagHighlighter([
    { tag: tags.link, class: "tok-link" },
    { tag: tags.heading, class: "tok-heading" },
    { tag: tags.emphasis, class: "tok-emphasis" },
    { tag: tags.strong, class: "tok-strong" },
    { tag: tags.keyword, class: "tok-keyword" },
    { tag: tags.atom, class: "tok-atom" },
    { tag: tags.bool, class: "tok-bool" },
    { tag: tags.url, class: "tok-url" },
    { tag: tags.labelName, class: "tok-labelName" },
    { tag: tags.inserted, class: "tok-inserted" },
    { tag: tags.deleted, class: "tok-deleted" },
    { tag: tags.literal, class: "tok-literal" },
    { tag: tags.string, class: "tok-string" },
    { tag: tags.number, class: "tok-number" },
    { tag: [tags.regexp, tags.escape, tags.special(tags.string)], class: "tok-string2" },
    { tag: tags.variableName, class: "tok-variableName" },
    { tag: tags.local(tags.variableName), class: "tok-variableName tok-local" },
    { tag: tags.definition(tags.variableName), class: "tok-variableName tok-definition" },
    { tag: tags.special(tags.variableName), class: "tok-variableName2" },
    { tag: tags.definition(tags.propertyName), class: "tok-propertyName tok-definition" },
    { tag: tags.typeName, class: "tok-typeName" },
    { tag: tags.namespace, class: "tok-namespace" },
    { tag: tags.className, class: "tok-className" },
    { tag: tags.macroName, class: "tok-macroName" },
    { tag: tags.propertyName, class: "tok-propertyName" },
    { tag: tags.operator, class: "tok-operator" },
    { tag: tags.comment, class: "tok-comment" },
    { tag: tags.meta, class: "tok-meta" },
    { tag: tags.invalid, class: "tok-invalid" },
    { tag: tags.punctuation, class: "tok-punctuation" }
  ]);

  // node_modules/@codemirror/language/dist/index.js
  var _a;
  var languageDataProp = /* @__PURE__ */ new NodeProp();
  var Language = class {
    constructor(data, parser, extraExtensions = []) {
      this.data = data;
      if (!EditorState.prototype.hasOwnProperty("tree"))
        Object.defineProperty(EditorState.prototype, "tree", { get() {
          return syntaxTree(this);
        } });
      this.parser = parser;
      this.extension = [
        language.of(this),
        EditorState.languageData.of((state, pos, side) => state.facet(languageDataFacetAt(state, pos, side)))
      ].concat(extraExtensions);
    }
    isActiveAt(state, pos, side = -1) {
      return languageDataFacetAt(state, pos, side) == this.data;
    }
    findRegions(state) {
      let lang = state.facet(language);
      if ((lang === null || lang === void 0 ? void 0 : lang.data) == this.data)
        return [{ from: 0, to: state.doc.length }];
      if (!lang || !lang.allowsNesting)
        return [];
      let result = [];
      let explore = (tree, from) => {
        if (tree.prop(languageDataProp) == this.data) {
          result.push({ from, to: from + tree.length });
          return;
        }
        let mount = tree.prop(NodeProp.mounted);
        if (mount) {
          if (mount.tree.prop(languageDataProp) == this.data) {
            if (mount.overlay)
              for (let r of mount.overlay)
                result.push({ from: r.from + from, to: r.to + from });
            else
              result.push({ from, to: from + tree.length });
            return;
          } else if (mount.overlay) {
            let size = result.length;
            explore(mount.tree, mount.overlay[0].from + from);
            if (result.length > size)
              return;
          }
        }
        for (let i = 0; i < tree.children.length; i++) {
          let ch = tree.children[i];
          if (ch instanceof Tree)
            explore(ch, tree.positions[i] + from);
        }
      };
      explore(syntaxTree(state), 0);
      return result;
    }
    get allowsNesting() {
      return true;
    }
  };
  Language.setState = /* @__PURE__ */ StateEffect.define();
  function languageDataFacetAt(state, pos, side) {
    let topLang = state.facet(language);
    if (!topLang)
      return null;
    let facet = topLang.data;
    if (topLang.allowsNesting) {
      for (let node = syntaxTree(state).topNode; node; node = node.enter(pos, side, IterMode.ExcludeBuffers))
        facet = node.type.prop(languageDataProp) || facet;
    }
    return facet;
  }
  function syntaxTree(state) {
    let field = state.field(Language.state, false);
    return field ? field.tree : Tree.empty;
  }
  var DocInput = class {
    constructor(doc2, length = doc2.length) {
      this.doc = doc2;
      this.length = length;
      this.cursorPos = 0;
      this.string = "";
      this.cursor = doc2.iter();
    }
    syncTo(pos) {
      this.string = this.cursor.next(pos - this.cursorPos).value;
      this.cursorPos = pos + this.string.length;
      return this.cursorPos - this.string.length;
    }
    chunk(pos) {
      this.syncTo(pos);
      return this.string;
    }
    get lineChunks() {
      return true;
    }
    read(from, to2) {
      let stringStart = this.cursorPos - this.string.length;
      if (from < stringStart || to2 >= this.cursorPos)
        return this.doc.sliceString(from, to2);
      else
        return this.string.slice(from - stringStart, to2 - stringStart);
    }
  };
  var currentContext = null;
  var ParseContext = class {
    constructor(parser, state, fragments = [], tree, treeLen, viewport, skipped, scheduleOn) {
      this.parser = parser;
      this.state = state;
      this.fragments = fragments;
      this.tree = tree;
      this.treeLen = treeLen;
      this.viewport = viewport;
      this.skipped = skipped;
      this.scheduleOn = scheduleOn;
      this.parse = null;
      this.tempSkipped = [];
    }
    static create(parser, state, viewport) {
      return new ParseContext(parser, state, [], Tree.empty, 0, viewport, [], null);
    }
    startParse() {
      return this.parser.startParse(new DocInput(this.state.doc), this.fragments);
    }
    work(until, upto) {
      if (upto != null && upto >= this.state.doc.length)
        upto = void 0;
      if (this.tree != Tree.empty && this.isDone(upto !== null && upto !== void 0 ? upto : this.state.doc.length)) {
        this.takeTree();
        return true;
      }
      return this.withContext(() => {
        var _a2;
        if (typeof until == "number") {
          let endTime = Date.now() + until;
          until = () => Date.now() > endTime;
        }
        if (!this.parse)
          this.parse = this.startParse();
        if (upto != null && (this.parse.stoppedAt == null || this.parse.stoppedAt > upto) && upto < this.state.doc.length)
          this.parse.stopAt(upto);
        for (; ; ) {
          let done = this.parse.advance();
          if (done) {
            this.fragments = this.withoutTempSkipped(TreeFragment.addTree(done, this.fragments, this.parse.stoppedAt != null));
            this.treeLen = (_a2 = this.parse.stoppedAt) !== null && _a2 !== void 0 ? _a2 : this.state.doc.length;
            this.tree = done;
            this.parse = null;
            if (this.treeLen < (upto !== null && upto !== void 0 ? upto : this.state.doc.length))
              this.parse = this.startParse();
            else
              return true;
          }
          if (until())
            return false;
        }
      });
    }
    takeTree() {
      let pos, tree;
      if (this.parse && (pos = this.parse.parsedPos) >= this.treeLen) {
        if (this.parse.stoppedAt == null || this.parse.stoppedAt > pos)
          this.parse.stopAt(pos);
        this.withContext(() => {
          while (!(tree = this.parse.advance())) {
          }
        });
        this.treeLen = pos;
        this.tree = tree;
        this.fragments = this.withoutTempSkipped(TreeFragment.addTree(this.tree, this.fragments, true));
        this.parse = null;
      }
    }
    withContext(f) {
      let prev = currentContext;
      currentContext = this;
      try {
        return f();
      } finally {
        currentContext = prev;
      }
    }
    withoutTempSkipped(fragments) {
      for (let r; r = this.tempSkipped.pop(); )
        fragments = cutFragments(fragments, r.from, r.to);
      return fragments;
    }
    changes(changes, newState) {
      let { fragments, tree, treeLen, viewport, skipped } = this;
      this.takeTree();
      if (!changes.empty) {
        let ranges = [];
        changes.iterChangedRanges((fromA, toA, fromB, toB) => ranges.push({ fromA, toA, fromB, toB }));
        fragments = TreeFragment.applyChanges(fragments, ranges);
        tree = Tree.empty;
        treeLen = 0;
        viewport = { from: changes.mapPos(viewport.from, -1), to: changes.mapPos(viewport.to, 1) };
        if (this.skipped.length) {
          skipped = [];
          for (let r of this.skipped) {
            let from = changes.mapPos(r.from, 1), to2 = changes.mapPos(r.to, -1);
            if (from < to2)
              skipped.push({ from, to: to2 });
          }
        }
      }
      return new ParseContext(this.parser, newState, fragments, tree, treeLen, viewport, skipped, this.scheduleOn);
    }
    updateViewport(viewport) {
      if (this.viewport.from == viewport.from && this.viewport.to == viewport.to)
        return false;
      this.viewport = viewport;
      let startLen = this.skipped.length;
      for (let i = 0; i < this.skipped.length; i++) {
        let { from, to: to2 } = this.skipped[i];
        if (from < viewport.to && to2 > viewport.from) {
          this.fragments = cutFragments(this.fragments, from, to2);
          this.skipped.splice(i--, 1);
        }
      }
      if (this.skipped.length >= startLen)
        return false;
      this.reset();
      return true;
    }
    reset() {
      if (this.parse) {
        this.takeTree();
        this.parse = null;
      }
    }
    skipUntilInView(from, to2) {
      this.skipped.push({ from, to: to2 });
    }
    static getSkippingParser(until) {
      return new class extends Parser {
        createParse(input, fragments, ranges) {
          let from = ranges[0].from, to2 = ranges[ranges.length - 1].to;
          let parser = {
            parsedPos: from,
            advance() {
              let cx = currentContext;
              if (cx) {
                for (let r of ranges)
                  cx.tempSkipped.push(r);
                if (until)
                  cx.scheduleOn = cx.scheduleOn ? Promise.all([cx.scheduleOn, until]) : until;
              }
              this.parsedPos = to2;
              return new Tree(NodeType.none, [], [], to2 - from);
            },
            stoppedAt: null,
            stopAt() {
            }
          };
          return parser;
        }
      }();
    }
    isDone(upto) {
      upto = Math.min(upto, this.state.doc.length);
      let frags = this.fragments;
      return this.treeLen >= upto && frags.length && frags[0].from == 0 && frags[0].to >= upto;
    }
    static get() {
      return currentContext;
    }
  };
  function cutFragments(fragments, from, to2) {
    return TreeFragment.applyChanges(fragments, [{ fromA: from, toA: to2, fromB: from, toB: to2 }]);
  }
  var LanguageState = class {
    constructor(context2) {
      this.context = context2;
      this.tree = context2.tree;
    }
    apply(tr) {
      if (!tr.docChanged && this.tree == this.context.tree)
        return this;
      let newCx = this.context.changes(tr.changes, tr.state);
      let upto = this.context.treeLen == tr.startState.doc.length ? void 0 : Math.max(tr.changes.mapPos(this.context.treeLen), newCx.viewport.to);
      if (!newCx.work(20, upto))
        newCx.takeTree();
      return new LanguageState(newCx);
    }
    static init(state) {
      let vpTo = Math.min(3e3, state.doc.length);
      let parseState = ParseContext.create(state.facet(language).parser, state, { from: 0, to: vpTo });
      if (!parseState.work(20, vpTo))
        parseState.takeTree();
      return new LanguageState(parseState);
    }
  };
  Language.state = /* @__PURE__ */ StateField.define({
    create: LanguageState.init,
    update(value2, tr) {
      for (let e of tr.effects)
        if (e.is(Language.setState))
          return e.value;
      if (tr.startState.facet(language) != tr.state.facet(language))
        return LanguageState.init(tr.state);
      return value2.apply(tr);
    }
  });
  var requestIdle = (callback) => {
    let timeout = setTimeout(() => callback(), 500);
    return () => clearTimeout(timeout);
  };
  if (typeof requestIdleCallback != "undefined")
    requestIdle = (callback) => {
      let idle = -1, timeout = setTimeout(() => {
        idle = requestIdleCallback(callback, { timeout: 500 - 100 });
      }, 100);
      return () => idle < 0 ? clearTimeout(timeout) : cancelIdleCallback(idle);
    };
  var isInputPending = typeof navigator != "undefined" && ((_a = navigator.scheduling) === null || _a === void 0 ? void 0 : _a.isInputPending) ? () => navigator.scheduling.isInputPending() : null;
  var parseWorker = /* @__PURE__ */ ViewPlugin.fromClass(class ParseWorker {
    constructor(view) {
      this.view = view;
      this.working = null;
      this.workScheduled = 0;
      this.chunkEnd = -1;
      this.chunkBudget = -1;
      this.work = this.work.bind(this);
      this.scheduleWork();
    }
    update(update3) {
      let cx = this.view.state.field(Language.state).context;
      if (cx.updateViewport(update3.view.viewport) || this.view.viewport.to > cx.treeLen)
        this.scheduleWork();
      if (update3.docChanged) {
        if (this.view.hasFocus)
          this.chunkBudget += 50;
        this.scheduleWork();
      }
      this.checkAsyncSchedule(cx);
    }
    scheduleWork() {
      if (this.working)
        return;
      let { state } = this.view, field = state.field(Language.state);
      if (field.tree != field.context.tree || !field.context.isDone(state.doc.length))
        this.working = requestIdle(this.work);
    }
    work(deadline) {
      this.working = null;
      let now = Date.now();
      if (this.chunkEnd < now && (this.chunkEnd < 0 || this.view.hasFocus)) {
        this.chunkEnd = now + 3e4;
        this.chunkBudget = 3e3;
      }
      if (this.chunkBudget <= 0)
        return;
      let { state, viewport: { to: vpTo } } = this.view, field = state.field(Language.state);
      if (field.tree == field.context.tree && field.context.isDone(vpTo + 1e5))
        return;
      let endTime = Date.now() + Math.min(this.chunkBudget, 100, deadline && !isInputPending ? Math.max(25, deadline.timeRemaining() - 5) : 1e9);
      let viewportFirst = field.context.treeLen < vpTo && state.doc.length > vpTo + 1e3;
      let done = field.context.work(() => {
        return isInputPending && isInputPending() || Date.now() > endTime;
      }, vpTo + (viewportFirst ? 0 : 1e5));
      this.chunkBudget -= Date.now() - now;
      if (done || this.chunkBudget <= 0) {
        field.context.takeTree();
        this.view.dispatch({ effects: Language.setState.of(new LanguageState(field.context)) });
      }
      if (this.chunkBudget > 0 && !(done && !viewportFirst))
        this.scheduleWork();
      this.checkAsyncSchedule(field.context);
    }
    checkAsyncSchedule(cx) {
      if (cx.scheduleOn) {
        this.workScheduled++;
        cx.scheduleOn.then(() => this.scheduleWork()).catch((err) => logException(this.view.state, err)).then(() => this.workScheduled--);
        cx.scheduleOn = null;
      }
    }
    destroy() {
      if (this.working)
        this.working();
    }
    isWorking() {
      return !!(this.working || this.workScheduled > 0);
    }
  }, {
    eventHandlers: { focus() {
      this.scheduleWork();
    } }
  });
  var language = /* @__PURE__ */ Facet.define({
    combine(languages) {
      return languages.length ? languages[0] : null;
    },
    enables: [Language.state, parseWorker]
  });
  var indentService = /* @__PURE__ */ Facet.define();
  var indentUnit = /* @__PURE__ */ Facet.define({
    combine: (values) => {
      if (!values.length)
        return "  ";
      if (!/^(?: +|\t+)$/.test(values[0]))
        throw new Error("Invalid indent unit: " + JSON.stringify(values[0]));
      return values[0];
    }
  });
  function getIndentUnit(state) {
    let unit = state.facet(indentUnit);
    return unit.charCodeAt(0) == 9 ? state.tabSize * unit.length : unit.length;
  }
  function indentString(state, cols) {
    let result = "", ts = state.tabSize;
    if (state.facet(indentUnit).charCodeAt(0) == 9)
      while (cols >= ts) {
        result += "	";
        cols -= ts;
      }
    for (let i = 0; i < cols; i++)
      result += " ";
    return result;
  }
  function getIndentation(context2, pos) {
    if (context2 instanceof EditorState)
      context2 = new IndentContext(context2);
    for (let service of context2.state.facet(indentService)) {
      let result = service(context2, pos);
      if (result != null)
        return result;
    }
    let tree = syntaxTree(context2.state);
    return tree ? syntaxIndentation(context2, tree, pos) : null;
  }
  var IndentContext = class {
    constructor(state, options = {}) {
      this.state = state;
      this.options = options;
      this.unit = getIndentUnit(state);
    }
    lineAt(pos, bias = 1) {
      let line = this.state.doc.lineAt(pos);
      let { simulateBreak, simulateDoubleBreak } = this.options;
      if (simulateBreak != null && simulateBreak >= line.from && simulateBreak <= line.to) {
        if (simulateDoubleBreak && simulateBreak == pos)
          return { text: "", from: pos };
        else if (bias < 0 ? simulateBreak < pos : simulateBreak <= pos)
          return { text: line.text.slice(simulateBreak - line.from), from: simulateBreak };
        else
          return { text: line.text.slice(0, simulateBreak - line.from), from: line.from };
      }
      return line;
    }
    textAfterPos(pos, bias = 1) {
      if (this.options.simulateDoubleBreak && pos == this.options.simulateBreak)
        return "";
      let { text, from } = this.lineAt(pos, bias);
      return text.slice(pos - from, Math.min(text.length, pos + 100 - from));
    }
    column(pos, bias = 1) {
      let { text, from } = this.lineAt(pos, bias);
      let result = this.countColumn(text, pos - from);
      let override = this.options.overrideIndentation ? this.options.overrideIndentation(from) : -1;
      if (override > -1)
        result += override - this.countColumn(text, text.search(/\S|$/));
      return result;
    }
    countColumn(line, pos = line.length) {
      return countColumn(line, this.state.tabSize, pos);
    }
    lineIndent(pos, bias = 1) {
      let { text, from } = this.lineAt(pos, bias);
      let override = this.options.overrideIndentation;
      if (override) {
        let overriden = override(from);
        if (overriden > -1)
          return overriden;
      }
      return this.countColumn(text, text.search(/\S|$/));
    }
    get simulatedBreak() {
      return this.options.simulateBreak || null;
    }
  };
  var indentNodeProp = /* @__PURE__ */ new NodeProp();
  function syntaxIndentation(cx, ast, pos) {
    return indentFrom(ast.resolveInner(pos).enterUnfinishedNodesBefore(pos), pos, cx);
  }
  function ignoreClosed(cx) {
    return cx.pos == cx.options.simulateBreak && cx.options.simulateDoubleBreak;
  }
  function indentStrategy(tree) {
    let strategy = tree.type.prop(indentNodeProp);
    if (strategy)
      return strategy;
    let first = tree.firstChild, close;
    if (first && (close = first.type.prop(NodeProp.closedBy))) {
      let last2 = tree.lastChild, closed = last2 && close.indexOf(last2.name) > -1;
      return (cx) => delimitedStrategy(cx, true, 1, void 0, closed && !ignoreClosed(cx) ? last2.from : void 0);
    }
    return tree.parent == null ? topIndent : null;
  }
  function indentFrom(node, pos, base2) {
    for (; node; node = node.parent) {
      let strategy = indentStrategy(node);
      if (strategy)
        return strategy(TreeIndentContext.create(base2, pos, node));
    }
    return null;
  }
  function topIndent() {
    return 0;
  }
  var TreeIndentContext = class extends IndentContext {
    constructor(base2, pos, node) {
      super(base2.state, base2.options);
      this.base = base2;
      this.pos = pos;
      this.node = node;
    }
    static create(base2, pos, node) {
      return new TreeIndentContext(base2, pos, node);
    }
    get textAfter() {
      return this.textAfterPos(this.pos);
    }
    get baseIndent() {
      let line = this.state.doc.lineAt(this.node.from);
      for (; ; ) {
        let atBreak = this.node.resolve(line.from);
        while (atBreak.parent && atBreak.parent.from == atBreak.from)
          atBreak = atBreak.parent;
        if (isParent(atBreak, this.node))
          break;
        line = this.state.doc.lineAt(atBreak.from);
      }
      return this.lineIndent(line.from);
    }
    continue() {
      let parent = this.node.parent;
      return parent ? indentFrom(parent, this.pos, this.base) : 0;
    }
  };
  function isParent(parent, of) {
    for (let cur2 = of; cur2; cur2 = cur2.parent)
      if (parent == cur2)
        return true;
    return false;
  }
  function bracketedAligned(context2) {
    let tree = context2.node;
    let openToken = tree.childAfter(tree.from), last2 = tree.lastChild;
    if (!openToken)
      return null;
    let sim = context2.options.simulateBreak;
    let openLine = context2.state.doc.lineAt(openToken.from);
    let lineEnd = sim == null || sim <= openLine.from ? openLine.to : Math.min(openLine.to, sim);
    for (let pos = openToken.to; ; ) {
      let next = tree.childAfter(pos);
      if (!next || next == last2)
        return null;
      if (!next.type.isSkipped)
        return next.from < lineEnd ? openToken : null;
      pos = next.to;
    }
  }
  function delimitedStrategy(context2, align, units, closing2, closedAt) {
    let after = context2.textAfter, space = after.match(/^\s*/)[0].length;
    let closed = closing2 && after.slice(space, space + closing2.length) == closing2 || closedAt == context2.pos + space;
    let aligned = align ? bracketedAligned(context2) : null;
    if (aligned)
      return closed ? context2.column(aligned.from) : context2.column(aligned.to);
    return context2.baseIndent + (closed ? 0 : context2.unit * units);
  }
  var DontIndentBeyond = 200;
  function indentOnInput() {
    return EditorState.transactionFilter.of((tr) => {
      if (!tr.docChanged || !tr.isUserEvent("input.type") && !tr.isUserEvent("input.complete"))
        return tr;
      let rules = tr.startState.languageDataAt("indentOnInput", tr.startState.selection.main.head);
      if (!rules.length)
        return tr;
      let doc2 = tr.newDoc, { head } = tr.newSelection.main, line = doc2.lineAt(head);
      if (head > line.from + DontIndentBeyond)
        return tr;
      let lineStart = doc2.sliceString(line.from, head);
      if (!rules.some((r) => r.test(lineStart)))
        return tr;
      let { state } = tr, last2 = -1, changes = [];
      for (let { head: head2 } of state.selection.ranges) {
        let line2 = state.doc.lineAt(head2);
        if (line2.from == last2)
          continue;
        last2 = line2.from;
        let indent = getIndentation(state, line2.from);
        if (indent == null)
          continue;
        let cur2 = /^\s*/.exec(line2.text)[0];
        let norm = indentString(state, indent);
        if (cur2 != norm)
          changes.push({ from: line2.from, to: line2.from + cur2.length, insert: norm });
      }
      return changes.length ? [tr, { changes, sequential: true }] : tr;
    });
  }
  var foldService = /* @__PURE__ */ Facet.define();
  var foldNodeProp = /* @__PURE__ */ new NodeProp();
  function syntaxFolding(state, start, end) {
    let tree = syntaxTree(state);
    if (tree.length < end)
      return null;
    let inner = tree.resolveInner(end);
    let found = null;
    for (let cur2 = inner; cur2; cur2 = cur2.parent) {
      if (cur2.to <= end || cur2.from > end)
        continue;
      if (found && cur2.from < start)
        break;
      let prop = cur2.type.prop(foldNodeProp);
      if (prop && (cur2.to < tree.length - 50 || tree.length == state.doc.length || !isUnfinished(cur2))) {
        let value2 = prop(cur2, state);
        if (value2 && value2.from <= end && value2.from >= start && value2.to > end)
          found = value2;
      }
    }
    return found;
  }
  function isUnfinished(node) {
    let ch = node.lastChild;
    return ch && ch.to == node.to && ch.type.isError;
  }
  function foldable(state, lineStart, lineEnd) {
    for (let service of state.facet(foldService)) {
      let result = service(state, lineStart, lineEnd);
      if (result)
        return result;
    }
    return syntaxFolding(state, lineStart, lineEnd);
  }
  function mapRange(range2, mapping) {
    let from = mapping.mapPos(range2.from, 1), to2 = mapping.mapPos(range2.to, -1);
    return from >= to2 ? void 0 : { from, to: to2 };
  }
  var foldEffect = /* @__PURE__ */ StateEffect.define({ map: mapRange });
  var unfoldEffect = /* @__PURE__ */ StateEffect.define({ map: mapRange });
  function selectedLines(view) {
    let lines = [];
    for (let { head } of view.state.selection.ranges) {
      if (lines.some((l) => l.from <= head && l.to >= head))
        continue;
      lines.push(view.lineBlockAt(head));
    }
    return lines;
  }
  var foldState = /* @__PURE__ */ StateField.define({
    create() {
      return Decoration.none;
    },
    update(folded, tr) {
      folded = folded.map(tr.changes);
      for (let e of tr.effects) {
        if (e.is(foldEffect) && !foldExists(folded, e.value.from, e.value.to))
          folded = folded.update({ add: [foldWidget.range(e.value.from, e.value.to)] });
        else if (e.is(unfoldEffect))
          folded = folded.update({
            filter: (from, to2) => e.value.from != from || e.value.to != to2,
            filterFrom: e.value.from,
            filterTo: e.value.to
          });
      }
      if (tr.selection) {
        let onSelection = false, { head } = tr.selection.main;
        folded.between(head, head, (a2, b2) => {
          if (a2 < head && b2 > head)
            onSelection = true;
        });
        if (onSelection)
          folded = folded.update({
            filterFrom: head,
            filterTo: head,
            filter: (a2, b2) => b2 <= head || a2 >= head
          });
      }
      return folded;
    },
    provide: (f) => EditorView.decorations.from(f)
  });
  function findFold(state, from, to2) {
    var _a2;
    let found = null;
    (_a2 = state.field(foldState, false)) === null || _a2 === void 0 ? void 0 : _a2.between(from, to2, (from2, to3) => {
      if (!found || found.from > from2)
        found = { from: from2, to: to3 };
    });
    return found;
  }
  function foldExists(folded, from, to2) {
    let found = false;
    folded.between(from, from, (a2, b2) => {
      if (a2 == from && b2 == to2)
        found = true;
    });
    return found;
  }
  function maybeEnable(state, other) {
    return state.field(foldState, false) ? other : other.concat(StateEffect.appendConfig.of(codeFolding()));
  }
  var foldCode = (view) => {
    for (let line of selectedLines(view)) {
      let range2 = foldable(view.state, line.from, line.to);
      if (range2) {
        view.dispatch({ effects: maybeEnable(view.state, [foldEffect.of(range2), announceFold(view, range2)]) });
        return true;
      }
    }
    return false;
  };
  var unfoldCode = (view) => {
    if (!view.state.field(foldState, false))
      return false;
    let effects = [];
    for (let line of selectedLines(view)) {
      let folded = findFold(view.state, line.from, line.to);
      if (folded)
        effects.push(unfoldEffect.of(folded), announceFold(view, folded, false));
    }
    if (effects.length)
      view.dispatch({ effects });
    return effects.length > 0;
  };
  function announceFold(view, range2, fold = true) {
    let lineFrom = view.state.doc.lineAt(range2.from).number, lineTo = view.state.doc.lineAt(range2.to).number;
    return EditorView.announce.of(`${view.state.phrase(fold ? "Folded lines" : "Unfolded lines")} ${lineFrom} ${view.state.phrase("to")} ${lineTo}.`);
  }
  var foldAll = (view) => {
    let { state } = view, effects = [];
    for (let pos = 0; pos < state.doc.length; ) {
      let line = view.lineBlockAt(pos), range2 = foldable(state, line.from, line.to);
      if (range2)
        effects.push(foldEffect.of(range2));
      pos = (range2 ? view.lineBlockAt(range2.to) : line).to + 1;
    }
    if (effects.length)
      view.dispatch({ effects: maybeEnable(view.state, effects) });
    return !!effects.length;
  };
  var unfoldAll = (view) => {
    let field = view.state.field(foldState, false);
    if (!field || !field.size)
      return false;
    let effects = [];
    field.between(0, view.state.doc.length, (from, to2) => {
      effects.push(unfoldEffect.of({ from, to: to2 }));
    });
    view.dispatch({ effects });
    return true;
  };
  var foldKeymap = [
    { key: "Ctrl-Shift-[", mac: "Cmd-Alt-[", run: foldCode },
    { key: "Ctrl-Shift-]", mac: "Cmd-Alt-]", run: unfoldCode },
    { key: "Ctrl-Alt-[", run: foldAll },
    { key: "Ctrl-Alt-]", run: unfoldAll }
  ];
  var defaultConfig = {
    placeholderDOM: null,
    placeholderText: "\u2026"
  };
  var foldConfig = /* @__PURE__ */ Facet.define({
    combine(values) {
      return combineConfig(values, defaultConfig);
    }
  });
  function codeFolding(config2) {
    let result = [foldState, baseTheme$12];
    if (config2)
      result.push(foldConfig.of(config2));
    return result;
  }
  var foldWidget = /* @__PURE__ */ Decoration.replace({ widget: /* @__PURE__ */ new class extends WidgetType {
    toDOM(view) {
      let { state } = view, conf = state.facet(foldConfig);
      let onclick = (event) => {
        let line = view.lineBlockAt(view.posAtDOM(event.target));
        let folded = findFold(view.state, line.from, line.to);
        if (folded)
          view.dispatch({ effects: unfoldEffect.of(folded) });
        event.preventDefault();
      };
      if (conf.placeholderDOM)
        return conf.placeholderDOM(view, onclick);
      let element = document.createElement("span");
      element.textContent = conf.placeholderText;
      element.setAttribute("aria-label", state.phrase("folded code"));
      element.title = state.phrase("unfold");
      element.className = "cm-foldPlaceholder";
      element.onclick = onclick;
      return element;
    }
  }() });
  var foldGutterDefaults = {
    openText: "\u2304",
    closedText: "\u203A",
    markerDOM: null,
    domEventHandlers: {}
  };
  var FoldMarker = class extends GutterMarker {
    constructor(config2, open) {
      super();
      this.config = config2;
      this.open = open;
    }
    eq(other) {
      return this.config == other.config && this.open == other.open;
    }
    toDOM(view) {
      if (this.config.markerDOM)
        return this.config.markerDOM(this.open);
      let span = document.createElement("span");
      span.textContent = this.open ? this.config.openText : this.config.closedText;
      span.title = view.state.phrase(this.open ? "Fold line" : "Unfold line");
      return span;
    }
  };
  function foldGutter(config2 = {}) {
    let fullConfig = Object.assign(Object.assign({}, foldGutterDefaults), config2);
    let canFold = new FoldMarker(fullConfig, true), canUnfold = new FoldMarker(fullConfig, false);
    let markers = ViewPlugin.fromClass(class {
      constructor(view) {
        this.from = view.viewport.from;
        this.markers = this.buildMarkers(view);
      }
      update(update3) {
        if (update3.docChanged || update3.viewportChanged || update3.startState.facet(language) != update3.state.facet(language) || update3.startState.field(foldState, false) != update3.state.field(foldState, false) || syntaxTree(update3.startState) != syntaxTree(update3.state))
          this.markers = this.buildMarkers(update3.view);
      }
      buildMarkers(view) {
        let builder = new RangeSetBuilder();
        for (let line of view.viewportLineBlocks) {
          let mark = findFold(view.state, line.from, line.to) ? canUnfold : foldable(view.state, line.from, line.to) ? canFold : null;
          if (mark)
            builder.add(line.from, line.from, mark);
        }
        return builder.finish();
      }
    });
    let { domEventHandlers } = fullConfig;
    return [
      markers,
      gutter({
        class: "cm-foldGutter",
        markers(view) {
          var _a2;
          return ((_a2 = view.plugin(markers)) === null || _a2 === void 0 ? void 0 : _a2.markers) || RangeSet.empty;
        },
        initialSpacer() {
          return new FoldMarker(fullConfig, false);
        },
        domEventHandlers: Object.assign(Object.assign({}, domEventHandlers), { click: (view, line, event) => {
          if (domEventHandlers.click && domEventHandlers.click(view, line, event))
            return true;
          let folded = findFold(view.state, line.from, line.to);
          if (folded) {
            view.dispatch({ effects: unfoldEffect.of(folded) });
            return true;
          }
          let range2 = foldable(view.state, line.from, line.to);
          if (range2) {
            view.dispatch({ effects: foldEffect.of(range2) });
            return true;
          }
          return false;
        } })
      }),
      codeFolding()
    ];
  }
  var baseTheme$12 = /* @__PURE__ */ EditorView.baseTheme({
    ".cm-foldPlaceholder": {
      backgroundColor: "#eee",
      border: "1px solid #ddd",
      color: "#888",
      borderRadius: ".2em",
      margin: "0 1px",
      padding: "0 1px",
      cursor: "pointer"
    },
    ".cm-foldGutter span": {
      padding: "0 1px",
      cursor: "pointer"
    }
  });
  var HighlightStyle = class {
    constructor(spec, options) {
      let modSpec;
      function def(spec2) {
        let cls = StyleModule.newName();
        (modSpec || (modSpec = /* @__PURE__ */ Object.create(null)))["." + cls] = spec2;
        return cls;
      }
      const all = typeof options.all == "string" ? options.all : options.all ? def(options.all) : void 0;
      const scopeOpt = options.scope;
      this.scope = scopeOpt instanceof Language ? (type2) => type2.prop(languageDataProp) == scopeOpt.data : scopeOpt ? (type2) => type2 == scopeOpt : void 0;
      this.style = tagHighlighter(spec.map((style2) => ({
        tag: style2.tag,
        class: style2.class || def(Object.assign({}, style2, { tag: null }))
      })), {
        all
      }).style;
      this.module = modSpec ? new StyleModule(modSpec) : null;
      this.themeType = options.themeType;
    }
    static define(specs, options) {
      return new HighlightStyle(specs, options || {});
    }
  };
  var highlighterFacet = /* @__PURE__ */ Facet.define();
  var fallbackHighlighter = /* @__PURE__ */ Facet.define({
    combine(values) {
      return values.length ? [values[0]] : null;
    }
  });
  function getHighlighters(state) {
    let main = state.facet(highlighterFacet);
    return main.length ? main : state.facet(fallbackHighlighter);
  }
  function syntaxHighlighting(highlighter, options) {
    let ext = [treeHighlighter], themeType;
    if (highlighter instanceof HighlightStyle) {
      if (highlighter.module)
        ext.push(EditorView.styleModule.of(highlighter.module));
      themeType = highlighter.themeType;
    }
    if (options === null || options === void 0 ? void 0 : options.fallback)
      ext.push(fallbackHighlighter.of(highlighter));
    else if (themeType)
      ext.push(highlighterFacet.computeN([EditorView.darkTheme], (state) => {
        return state.facet(EditorView.darkTheme) == (themeType == "dark") ? [highlighter] : [];
      }));
    else
      ext.push(highlighterFacet.of(highlighter));
    return ext;
  }
  var TreeHighlighter = class {
    constructor(view) {
      this.markCache = /* @__PURE__ */ Object.create(null);
      this.tree = syntaxTree(view.state);
      this.decorations = this.buildDeco(view, getHighlighters(view.state));
    }
    update(update3) {
      let tree = syntaxTree(update3.state), highlighters = getHighlighters(update3.state);
      let styleChange = highlighters != getHighlighters(update3.startState);
      if (tree.length < update3.view.viewport.to && !styleChange && tree.type == this.tree.type) {
        this.decorations = this.decorations.map(update3.changes);
      } else if (tree != this.tree || update3.viewportChanged || styleChange) {
        this.tree = tree;
        this.decorations = this.buildDeco(update3.view, highlighters);
      }
    }
    buildDeco(view, highlighters) {
      if (!highlighters || !this.tree.length)
        return Decoration.none;
      let builder = new RangeSetBuilder();
      for (let { from, to: to2 } of view.visibleRanges) {
        highlightTree(this.tree, highlighters, (from2, to3, style2) => {
          builder.add(from2, to3, this.markCache[style2] || (this.markCache[style2] = Decoration.mark({ class: style2 })));
        }, from, to2);
      }
      return builder.finish();
    }
  };
  var treeHighlighter = /* @__PURE__ */ Prec.high(/* @__PURE__ */ ViewPlugin.fromClass(TreeHighlighter, {
    decorations: (v) => v.decorations
  }));
  var defaultHighlightStyle = /* @__PURE__ */ HighlightStyle.define([
    {
      tag: tags.meta,
      color: "#7a757a"
    },
    {
      tag: tags.link,
      textDecoration: "underline"
    },
    {
      tag: tags.heading,
      textDecoration: "underline",
      fontWeight: "bold"
    },
    {
      tag: tags.emphasis,
      fontStyle: "italic"
    },
    {
      tag: tags.strong,
      fontWeight: "bold"
    },
    {
      tag: tags.strikethrough,
      textDecoration: "line-through"
    },
    {
      tag: tags.keyword,
      color: "#708"
    },
    {
      tag: [tags.atom, tags.bool, tags.url, tags.contentSeparator, tags.labelName],
      color: "#219"
    },
    {
      tag: [tags.literal, tags.inserted],
      color: "#164"
    },
    {
      tag: [tags.string, tags.deleted],
      color: "#a11"
    },
    {
      tag: [tags.regexp, tags.escape, /* @__PURE__ */ tags.special(tags.string)],
      color: "#e40"
    },
    {
      tag: /* @__PURE__ */ tags.definition(tags.variableName),
      color: "#00f"
    },
    {
      tag: /* @__PURE__ */ tags.local(tags.variableName),
      color: "#30a"
    },
    {
      tag: [tags.typeName, tags.namespace],
      color: "#085"
    },
    {
      tag: tags.className,
      color: "#167"
    },
    {
      tag: [/* @__PURE__ */ tags.special(tags.variableName), tags.macroName],
      color: "#256"
    },
    {
      tag: /* @__PURE__ */ tags.definition(tags.propertyName),
      color: "#00c"
    },
    {
      tag: tags.comment,
      color: "#940"
    },
    {
      tag: tags.invalid,
      color: "#f00"
    }
  ]);
  var baseTheme2 = /* @__PURE__ */ EditorView.baseTheme({
    "&.cm-focused .cm-matchingBracket": { backgroundColor: "#328c8252" },
    "&.cm-focused .cm-nonmatchingBracket": { backgroundColor: "#bb555544" }
  });
  var DefaultScanDist = 1e4;
  var DefaultBrackets = "()[]{}";
  var bracketMatchingConfig = /* @__PURE__ */ Facet.define({
    combine(configs) {
      return combineConfig(configs, {
        afterCursor: true,
        brackets: DefaultBrackets,
        maxScanDistance: DefaultScanDist,
        renderMatch: defaultRenderMatch
      });
    }
  });
  var matchingMark = /* @__PURE__ */ Decoration.mark({ class: "cm-matchingBracket" });
  var nonmatchingMark = /* @__PURE__ */ Decoration.mark({ class: "cm-nonmatchingBracket" });
  function defaultRenderMatch(match) {
    let decorations2 = [];
    let mark = match.matched ? matchingMark : nonmatchingMark;
    decorations2.push(mark.range(match.start.from, match.start.to));
    if (match.end)
      decorations2.push(mark.range(match.end.from, match.end.to));
    return decorations2;
  }
  var bracketMatchingState = /* @__PURE__ */ StateField.define({
    create() {
      return Decoration.none;
    },
    update(deco, tr) {
      if (!tr.docChanged && !tr.selection)
        return deco;
      let decorations2 = [];
      let config2 = tr.state.facet(bracketMatchingConfig);
      for (let range2 of tr.state.selection.ranges) {
        if (!range2.empty)
          continue;
        let match = matchBrackets(tr.state, range2.head, -1, config2) || range2.head > 0 && matchBrackets(tr.state, range2.head - 1, 1, config2) || config2.afterCursor && (matchBrackets(tr.state, range2.head, 1, config2) || range2.head < tr.state.doc.length && matchBrackets(tr.state, range2.head + 1, -1, config2));
        if (match)
          decorations2 = decorations2.concat(config2.renderMatch(match, tr.state));
      }
      return Decoration.set(decorations2, true);
    },
    provide: (f) => EditorView.decorations.from(f)
  });
  var bracketMatchingUnique = [
    bracketMatchingState,
    baseTheme2
  ];
  function bracketMatching(config2 = {}) {
    return [bracketMatchingConfig.of(config2), bracketMatchingUnique];
  }
  function matchingNodes(node, dir, brackets) {
    let byProp = node.prop(dir < 0 ? NodeProp.openedBy : NodeProp.closedBy);
    if (byProp)
      return byProp;
    if (node.name.length == 1) {
      let index = brackets.indexOf(node.name);
      if (index > -1 && index % 2 == (dir < 0 ? 1 : 0))
        return [brackets[index + dir]];
    }
    return null;
  }
  function matchBrackets(state, pos, dir, config2 = {}) {
    let maxScanDistance = config2.maxScanDistance || DefaultScanDist, brackets = config2.brackets || DefaultBrackets;
    let tree = syntaxTree(state), node = tree.resolveInner(pos, dir);
    for (let cur2 = node; cur2; cur2 = cur2.parent) {
      let matches2 = matchingNodes(cur2.type, dir, brackets);
      if (matches2 && cur2.from < cur2.to)
        return matchMarkedBrackets(state, pos, dir, cur2, matches2, brackets);
    }
    return matchPlainBrackets(state, pos, dir, tree, node.type, maxScanDistance, brackets);
  }
  function matchMarkedBrackets(_state, _pos, dir, token, matching, brackets) {
    let parent = token.parent, firstToken = { from: token.from, to: token.to };
    let depth = 0, cursor = parent === null || parent === void 0 ? void 0 : parent.cursor();
    if (cursor && (dir < 0 ? cursor.childBefore(token.from) : cursor.childAfter(token.to)))
      do {
        if (dir < 0 ? cursor.to <= token.from : cursor.from >= token.to) {
          if (depth == 0 && matching.indexOf(cursor.type.name) > -1 && cursor.from < cursor.to) {
            return { start: firstToken, end: { from: cursor.from, to: cursor.to }, matched: true };
          } else if (matchingNodes(cursor.type, dir, brackets)) {
            depth++;
          } else if (matchingNodes(cursor.type, -dir, brackets)) {
            depth--;
            if (depth == 0)
              return {
                start: firstToken,
                end: cursor.from == cursor.to ? void 0 : { from: cursor.from, to: cursor.to },
                matched: false
              };
          }
        }
      } while (dir < 0 ? cursor.prevSibling() : cursor.nextSibling());
    return { start: firstToken, matched: false };
  }
  function matchPlainBrackets(state, pos, dir, tree, tokenType, maxScanDistance, brackets) {
    let startCh = dir < 0 ? state.sliceDoc(pos - 1, pos) : state.sliceDoc(pos, pos + 1);
    let bracket2 = brackets.indexOf(startCh);
    if (bracket2 < 0 || bracket2 % 2 == 0 != dir > 0)
      return null;
    let startToken = { from: dir < 0 ? pos - 1 : pos, to: dir > 0 ? pos + 1 : pos };
    let iter = state.doc.iterRange(pos, dir > 0 ? state.doc.length : 0), depth = 0;
    for (let distance2 = 0; !iter.next().done && distance2 <= maxScanDistance; ) {
      let text = iter.value;
      if (dir < 0)
        distance2 += text.length;
      let basePos = pos + distance2 * dir;
      for (let pos2 = dir > 0 ? 0 : text.length - 1, end = dir > 0 ? text.length : -1; pos2 != end; pos2 += dir) {
        let found = brackets.indexOf(text[pos2]);
        if (found < 0 || tree.resolve(basePos + pos2, 1).type != tokenType)
          continue;
        if (found % 2 == 0 == dir > 0) {
          depth++;
        } else if (depth == 1) {
          return { start: startToken, end: { from: basePos + pos2, to: basePos + pos2 + 1 }, matched: found >> 1 == bracket2 >> 1 };
        } else {
          depth--;
        }
      }
      if (dir > 0)
        distance2 += text.length;
    }
    return iter.done ? { start: startToken, matched: false } : null;
  }
  var noTokens = /* @__PURE__ */ Object.create(null);
  var typeArray = [NodeType.none];
  var warned = [];
  var defaultTable = /* @__PURE__ */ Object.create(null);
  for (let [legacyName, name2] of [
    ["variable", "variableName"],
    ["variable-2", "variableName.special"],
    ["string-2", "string.special"],
    ["def", "variableName.definition"],
    ["tag", "typeName"],
    ["attribute", "propertyName"],
    ["type", "typeName"],
    ["builtin", "variableName.standard"],
    ["qualifier", "modifier"],
    ["error", "invalid"],
    ["header", "heading"],
    ["property", "propertyName"]
  ])
    defaultTable[legacyName] = /* @__PURE__ */ createTokenType(noTokens, name2);
  function warnForPart(part, msg) {
    if (warned.indexOf(part) > -1)
      return;
    warned.push(part);
    console.warn(msg);
  }
  function createTokenType(extra, tagStr) {
    let tag = null;
    for (let part of tagStr.split(".")) {
      let value2 = extra[part] || tags[part];
      if (!value2) {
        warnForPart(part, `Unknown highlighting tag ${part}`);
      } else if (typeof value2 == "function") {
        if (!tag)
          warnForPart(part, `Modifier ${part} used at start of tag`);
        else
          tag = value2(tag);
      } else {
        if (tag)
          warnForPart(part, `Tag ${part} used as modifier`);
        else
          tag = value2;
      }
    }
    if (!tag)
      return 0;
    let name2 = tagStr.replace(/ /g, "_"), type2 = NodeType.define({
      id: typeArray.length,
      name: name2,
      props: [styleTags({ [name2]: tag })]
    });
    typeArray.push(type2);
    return type2.id;
  }

  // node_modules/@codemirror/commands/dist/index.js
  var toggleComment = (target) => {
    let config2 = getConfig(target.state);
    return config2.line ? toggleLineComment(target) : config2.block ? toggleBlockCommentByLine(target) : false;
  };
  function command(f, option) {
    return ({ state, dispatch }) => {
      if (state.readOnly)
        return false;
      let tr = f(option, state);
      if (!tr)
        return false;
      dispatch(state.update(tr));
      return true;
    };
  }
  var toggleLineComment = /* @__PURE__ */ command(changeLineComment, 0);
  var toggleBlockComment = /* @__PURE__ */ command(changeBlockComment, 0);
  var toggleBlockCommentByLine = /* @__PURE__ */ command((o, s) => changeBlockComment(o, s, selectedLineRanges(s)), 0);
  function getConfig(state, pos = state.selection.main.head) {
    let data = state.languageDataAt("commentTokens", pos);
    return data.length ? data[0] : {};
  }
  var SearchMargin = 50;
  function findBlockComment(state, { open, close }, from, to2) {
    let textBefore = state.sliceDoc(from - SearchMargin, from);
    let textAfter = state.sliceDoc(to2, to2 + SearchMargin);
    let spaceBefore = /\s*$/.exec(textBefore)[0].length, spaceAfter = /^\s*/.exec(textAfter)[0].length;
    let beforeOff = textBefore.length - spaceBefore;
    if (textBefore.slice(beforeOff - open.length, beforeOff) == open && textAfter.slice(spaceAfter, spaceAfter + close.length) == close) {
      return {
        open: { pos: from - spaceBefore, margin: spaceBefore && 1 },
        close: { pos: to2 + spaceAfter, margin: spaceAfter && 1 }
      };
    }
    let startText, endText;
    if (to2 - from <= 2 * SearchMargin) {
      startText = endText = state.sliceDoc(from, to2);
    } else {
      startText = state.sliceDoc(from, from + SearchMargin);
      endText = state.sliceDoc(to2 - SearchMargin, to2);
    }
    let startSpace = /^\s*/.exec(startText)[0].length, endSpace = /\s*$/.exec(endText)[0].length;
    let endOff = endText.length - endSpace - close.length;
    if (startText.slice(startSpace, startSpace + open.length) == open && endText.slice(endOff, endOff + close.length) == close) {
      return {
        open: {
          pos: from + startSpace + open.length,
          margin: /\s/.test(startText.charAt(startSpace + open.length)) ? 1 : 0
        },
        close: {
          pos: to2 - endSpace - close.length,
          margin: /\s/.test(endText.charAt(endOff - 1)) ? 1 : 0
        }
      };
    }
    return null;
  }
  function selectedLineRanges(state) {
    let ranges = [];
    for (let r of state.selection.ranges) {
      let fromLine = state.doc.lineAt(r.from);
      let toLine = r.to <= fromLine.to ? fromLine : state.doc.lineAt(r.to);
      let last2 = ranges.length - 1;
      if (last2 >= 0 && ranges[last2].to > fromLine.from)
        ranges[last2].to = toLine.to;
      else
        ranges.push({ from: fromLine.from, to: toLine.to });
    }
    return ranges;
  }
  function changeBlockComment(option, state, ranges = state.selection.ranges) {
    let tokens = ranges.map((r) => getConfig(state, r.from).block);
    if (!tokens.every((c4) => c4))
      return null;
    let comments = ranges.map((r, i) => findBlockComment(state, tokens[i], r.from, r.to));
    if (option != 2 && !comments.every((c4) => c4)) {
      return { changes: state.changes(ranges.map((range2, i) => {
        if (comments[i])
          return [];
        return [{ from: range2.from, insert: tokens[i].open + " " }, { from: range2.to, insert: " " + tokens[i].close }];
      })) };
    } else if (option != 1 && comments.some((c4) => c4)) {
      let changes = [];
      for (let i = 0, comment2; i < comments.length; i++)
        if (comment2 = comments[i]) {
          let token = tokens[i], { open, close } = comment2;
          changes.push({ from: open.pos - token.open.length, to: open.pos + open.margin }, { from: close.pos - close.margin, to: close.pos + token.close.length });
        }
      return { changes };
    }
    return null;
  }
  function changeLineComment(option, state, ranges = state.selection.ranges) {
    let lines = [];
    let prevLine = -1;
    for (let { from, to: to2 } of ranges) {
      let startI = lines.length, minIndent = 1e9;
      for (let pos = from; pos <= to2; ) {
        let line = state.doc.lineAt(pos);
        if (line.from > prevLine && (from == to2 || to2 > line.from)) {
          prevLine = line.from;
          let token = getConfig(state, pos).line;
          if (!token)
            continue;
          let indent = /^\s*/.exec(line.text)[0].length;
          let empty2 = indent == line.length;
          let comment2 = line.text.slice(indent, indent + token.length) == token ? indent : -1;
          if (indent < line.text.length && indent < minIndent)
            minIndent = indent;
          lines.push({ line, comment: comment2, token, indent, empty: empty2, single: false });
        }
        pos = line.to + 1;
      }
      if (minIndent < 1e9) {
        for (let i = startI; i < lines.length; i++)
          if (lines[i].indent < lines[i].line.text.length)
            lines[i].indent = minIndent;
      }
      if (lines.length == startI + 1)
        lines[startI].single = true;
    }
    if (option != 2 && lines.some((l) => l.comment < 0 && (!l.empty || l.single))) {
      let changes = [];
      for (let { line, token, indent, empty: empty2, single } of lines)
        if (single || !empty2)
          changes.push({ from: line.from + indent, insert: token + " " });
      let changeSet = state.changes(changes);
      return { changes: changeSet, selection: state.selection.map(changeSet, 1) };
    } else if (option != 1 && lines.some((l) => l.comment >= 0)) {
      let changes = [];
      for (let { line, comment: comment2, token } of lines)
        if (comment2 >= 0) {
          let from = line.from + comment2, to2 = from + token.length;
          if (line.text[to2 - line.from] == " ")
            to2++;
          changes.push({ from, to: to2 });
        }
      return { changes };
    }
    return null;
  }
  var fromHistory = /* @__PURE__ */ Annotation.define();
  var isolateHistory = /* @__PURE__ */ Annotation.define();
  var invertedEffects = /* @__PURE__ */ Facet.define();
  var historyConfig = /* @__PURE__ */ Facet.define({
    combine(configs) {
      return combineConfig(configs, {
        minDepth: 100,
        newGroupDelay: 500
      }, { minDepth: Math.max, newGroupDelay: Math.min });
    }
  });
  function changeEnd(changes) {
    let end = 0;
    changes.iterChangedRanges((_, to2) => end = to2);
    return end;
  }
  var historyField_ = /* @__PURE__ */ StateField.define({
    create() {
      return HistoryState.empty;
    },
    update(state, tr) {
      let config2 = tr.state.facet(historyConfig);
      let fromHist = tr.annotation(fromHistory);
      if (fromHist) {
        let selection = tr.docChanged ? EditorSelection.single(changeEnd(tr.changes)) : void 0;
        let item = HistEvent.fromTransaction(tr, selection), from = fromHist.side;
        let other = from == 0 ? state.undone : state.done;
        if (item)
          other = updateBranch(other, other.length, config2.minDepth, item);
        else
          other = addSelection(other, tr.startState.selection);
        return new HistoryState(from == 0 ? fromHist.rest : other, from == 0 ? other : fromHist.rest);
      }
      let isolate = tr.annotation(isolateHistory);
      if (isolate == "full" || isolate == "before")
        state = state.isolate();
      if (tr.annotation(Transaction.addToHistory) === false)
        return !tr.changes.empty ? state.addMapping(tr.changes.desc) : state;
      let event = HistEvent.fromTransaction(tr);
      let time = tr.annotation(Transaction.time), userEvent = tr.annotation(Transaction.userEvent);
      if (event)
        state = state.addChanges(event, time, userEvent, config2.newGroupDelay, config2.minDepth);
      else if (tr.selection)
        state = state.addSelection(tr.startState.selection, time, userEvent, config2.newGroupDelay);
      if (isolate == "full" || isolate == "after")
        state = state.isolate();
      return state;
    },
    toJSON(value2) {
      return { done: value2.done.map((e) => e.toJSON()), undone: value2.undone.map((e) => e.toJSON()) };
    },
    fromJSON(json) {
      return new HistoryState(json.done.map(HistEvent.fromJSON), json.undone.map(HistEvent.fromJSON));
    }
  });
  function history(config2 = {}) {
    return [
      historyField_,
      historyConfig.of(config2),
      EditorView.domEventHandlers({
        beforeinput(e, view) {
          let command2 = e.inputType == "historyUndo" ? undo : e.inputType == "historyRedo" ? redo : null;
          if (!command2)
            return false;
          e.preventDefault();
          return command2(view);
        }
      })
    ];
  }
  function cmd(side, selection) {
    return function({ state, dispatch }) {
      if (!selection && state.readOnly)
        return false;
      let historyState = state.field(historyField_, false);
      if (!historyState)
        return false;
      let tr = historyState.pop(side, state, selection);
      if (!tr)
        return false;
      dispatch(tr);
      return true;
    };
  }
  var undo = /* @__PURE__ */ cmd(0, false);
  var redo = /* @__PURE__ */ cmd(1, false);
  var undoSelection = /* @__PURE__ */ cmd(0, true);
  var redoSelection = /* @__PURE__ */ cmd(1, true);
  var HistEvent = class {
    constructor(changes, effects, mapped, startSelection, selectionsAfter) {
      this.changes = changes;
      this.effects = effects;
      this.mapped = mapped;
      this.startSelection = startSelection;
      this.selectionsAfter = selectionsAfter;
    }
    setSelAfter(after) {
      return new HistEvent(this.changes, this.effects, this.mapped, this.startSelection, after);
    }
    toJSON() {
      var _a2, _b, _c;
      return {
        changes: (_a2 = this.changes) === null || _a2 === void 0 ? void 0 : _a2.toJSON(),
        mapped: (_b = this.mapped) === null || _b === void 0 ? void 0 : _b.toJSON(),
        startSelection: (_c = this.startSelection) === null || _c === void 0 ? void 0 : _c.toJSON(),
        selectionsAfter: this.selectionsAfter.map((s) => s.toJSON())
      };
    }
    static fromJSON(json) {
      return new HistEvent(json.changes && ChangeSet.fromJSON(json.changes), [], json.mapped && ChangeDesc.fromJSON(json.mapped), json.startSelection && EditorSelection.fromJSON(json.startSelection), json.selectionsAfter.map(EditorSelection.fromJSON));
    }
    static fromTransaction(tr, selection) {
      let effects = none2;
      for (let invert of tr.startState.facet(invertedEffects)) {
        let result = invert(tr);
        if (result.length)
          effects = effects.concat(result);
      }
      if (!effects.length && tr.changes.empty)
        return null;
      return new HistEvent(tr.changes.invert(tr.startState.doc), effects, void 0, selection || tr.startState.selection, none2);
    }
    static selection(selections) {
      return new HistEvent(void 0, none2, void 0, void 0, selections);
    }
  };
  function updateBranch(branch, to2, maxLen, newEvent) {
    let start = to2 + 1 > maxLen + 20 ? to2 - maxLen - 1 : 0;
    let newBranch = branch.slice(start, to2);
    newBranch.push(newEvent);
    return newBranch;
  }
  function isAdjacent(a2, b2) {
    let ranges = [], isAdjacent2 = false;
    a2.iterChangedRanges((f, t2) => ranges.push(f, t2));
    b2.iterChangedRanges((_f, _t, f, t2) => {
      for (let i = 0; i < ranges.length; ) {
        let from = ranges[i++], to2 = ranges[i++];
        if (t2 >= from && f <= to2)
          isAdjacent2 = true;
      }
    });
    return isAdjacent2;
  }
  function eqSelectionShape(a2, b2) {
    return a2.ranges.length == b2.ranges.length && a2.ranges.filter((r, i) => r.empty != b2.ranges[i].empty).length === 0;
  }
  function conc(a2, b2) {
    return !a2.length ? b2 : !b2.length ? a2 : a2.concat(b2);
  }
  var none2 = [];
  var MaxSelectionsPerEvent = 200;
  function addSelection(branch, selection) {
    if (!branch.length) {
      return [HistEvent.selection([selection])];
    } else {
      let lastEvent = branch[branch.length - 1];
      let sels = lastEvent.selectionsAfter.slice(Math.max(0, lastEvent.selectionsAfter.length - MaxSelectionsPerEvent));
      if (sels.length && sels[sels.length - 1].eq(selection))
        return branch;
      sels.push(selection);
      return updateBranch(branch, branch.length - 1, 1e9, lastEvent.setSelAfter(sels));
    }
  }
  function popSelection(branch) {
    let last2 = branch[branch.length - 1];
    let newBranch = branch.slice();
    newBranch[branch.length - 1] = last2.setSelAfter(last2.selectionsAfter.slice(0, last2.selectionsAfter.length - 1));
    return newBranch;
  }
  function addMappingToBranch(branch, mapping) {
    if (!branch.length)
      return branch;
    let length = branch.length, selections = none2;
    while (length) {
      let event = mapEvent(branch[length - 1], mapping, selections);
      if (event.changes && !event.changes.empty || event.effects.length) {
        let result = branch.slice(0, length);
        result[length - 1] = event;
        return result;
      } else {
        mapping = event.mapped;
        length--;
        selections = event.selectionsAfter;
      }
    }
    return selections.length ? [HistEvent.selection(selections)] : none2;
  }
  function mapEvent(event, mapping, extraSelections) {
    let selections = conc(event.selectionsAfter.length ? event.selectionsAfter.map((s) => s.map(mapping)) : none2, extraSelections);
    if (!event.changes)
      return HistEvent.selection(selections);
    let mappedChanges = event.changes.map(mapping), before = mapping.mapDesc(event.changes, true);
    let fullMapping = event.mapped ? event.mapped.composeDesc(before) : before;
    return new HistEvent(mappedChanges, StateEffect.mapEffects(event.effects, mapping), fullMapping, event.startSelection.map(before), selections);
  }
  var joinableUserEvent = /^(input\.type|delete)($|\.)/;
  var HistoryState = class {
    constructor(done, undone, prevTime = 0, prevUserEvent = void 0) {
      this.done = done;
      this.undone = undone;
      this.prevTime = prevTime;
      this.prevUserEvent = prevUserEvent;
    }
    isolate() {
      return this.prevTime ? new HistoryState(this.done, this.undone) : this;
    }
    addChanges(event, time, userEvent, newGroupDelay, maxLen) {
      let done = this.done, lastEvent = done[done.length - 1];
      if (lastEvent && lastEvent.changes && !lastEvent.changes.empty && event.changes && (!userEvent || joinableUserEvent.test(userEvent)) && (!lastEvent.selectionsAfter.length && time - this.prevTime < newGroupDelay && isAdjacent(lastEvent.changes, event.changes) || userEvent == "input.type.compose")) {
        done = updateBranch(done, done.length - 1, maxLen, new HistEvent(event.changes.compose(lastEvent.changes), conc(event.effects, lastEvent.effects), lastEvent.mapped, lastEvent.startSelection, none2));
      } else {
        done = updateBranch(done, done.length, maxLen, event);
      }
      return new HistoryState(done, none2, time, userEvent);
    }
    addSelection(selection, time, userEvent, newGroupDelay) {
      let last2 = this.done.length ? this.done[this.done.length - 1].selectionsAfter : none2;
      if (last2.length > 0 && time - this.prevTime < newGroupDelay && userEvent == this.prevUserEvent && userEvent && /^select($|\.)/.test(userEvent) && eqSelectionShape(last2[last2.length - 1], selection))
        return this;
      return new HistoryState(addSelection(this.done, selection), this.undone, time, userEvent);
    }
    addMapping(mapping) {
      return new HistoryState(addMappingToBranch(this.done, mapping), addMappingToBranch(this.undone, mapping), this.prevTime, this.prevUserEvent);
    }
    pop(side, state, selection) {
      let branch = side == 0 ? this.done : this.undone;
      if (branch.length == 0)
        return null;
      let event = branch[branch.length - 1];
      if (selection && event.selectionsAfter.length) {
        return state.update({
          selection: event.selectionsAfter[event.selectionsAfter.length - 1],
          annotations: fromHistory.of({ side, rest: popSelection(branch) }),
          userEvent: side == 0 ? "select.undo" : "select.redo",
          scrollIntoView: true
        });
      } else if (!event.changes) {
        return null;
      } else {
        let rest = branch.length == 1 ? none2 : branch.slice(0, branch.length - 1);
        if (event.mapped)
          rest = addMappingToBranch(rest, event.mapped);
        return state.update({
          changes: event.changes,
          selection: event.startSelection,
          effects: event.effects,
          annotations: fromHistory.of({ side, rest }),
          filter: false,
          userEvent: side == 0 ? "undo" : "redo",
          scrollIntoView: true
        });
      }
    }
  };
  HistoryState.empty = /* @__PURE__ */ new HistoryState(none2, none2);
  var historyKeymap = [
    { key: "Mod-z", run: undo, preventDefault: true },
    { key: "Mod-y", mac: "Mod-Shift-z", run: redo, preventDefault: true },
    { key: "Mod-u", run: undoSelection, preventDefault: true },
    { key: "Alt-u", mac: "Mod-Shift-u", run: redoSelection, preventDefault: true }
  ];
  function updateSel(sel, by) {
    return EditorSelection.create(sel.ranges.map(by), sel.mainIndex);
  }
  function setSel(state, selection) {
    return state.update({ selection, scrollIntoView: true, userEvent: "select" });
  }
  function moveSel({ state, dispatch }, how) {
    let selection = updateSel(state.selection, how);
    if (selection.eq(state.selection))
      return false;
    dispatch(setSel(state, selection));
    return true;
  }
  function rangeEnd(range2, forward) {
    return EditorSelection.cursor(forward ? range2.to : range2.from);
  }
  function cursorByChar(view, forward) {
    return moveSel(view, (range2) => range2.empty ? view.moveByChar(range2, forward) : rangeEnd(range2, forward));
  }
  function ltrAtCursor(view) {
    return view.textDirectionAt(view.state.selection.main.head) == Direction.LTR;
  }
  var cursorCharLeft = (view) => cursorByChar(view, !ltrAtCursor(view));
  var cursorCharRight = (view) => cursorByChar(view, ltrAtCursor(view));
  function cursorByGroup(view, forward) {
    return moveSel(view, (range2) => range2.empty ? view.moveByGroup(range2, forward) : rangeEnd(range2, forward));
  }
  var cursorGroupLeft = (view) => cursorByGroup(view, !ltrAtCursor(view));
  var cursorGroupRight = (view) => cursorByGroup(view, ltrAtCursor(view));
  function interestingNode(state, node, bracketProp) {
    if (node.type.prop(bracketProp))
      return true;
    let len = node.to - node.from;
    return len && (len > 2 || /[^\s,.;:]/.test(state.sliceDoc(node.from, node.to))) || node.firstChild;
  }
  function moveBySyntax(state, start, forward) {
    let pos = syntaxTree(state).resolveInner(start.head);
    let bracketProp = forward ? NodeProp.closedBy : NodeProp.openedBy;
    for (let at = start.head; ; ) {
      let next = forward ? pos.childAfter(at) : pos.childBefore(at);
      if (!next)
        break;
      if (interestingNode(state, next, bracketProp))
        pos = next;
      else
        at = forward ? next.to : next.from;
    }
    let bracket2 = pos.type.prop(bracketProp), match, newPos;
    if (bracket2 && (match = forward ? matchBrackets(state, pos.from, 1) : matchBrackets(state, pos.to, -1)) && match.matched)
      newPos = forward ? match.end.to : match.end.from;
    else
      newPos = forward ? pos.to : pos.from;
    return EditorSelection.cursor(newPos, forward ? -1 : 1);
  }
  var cursorSyntaxLeft = (view) => moveSel(view, (range2) => moveBySyntax(view.state, range2, !ltrAtCursor(view)));
  var cursorSyntaxRight = (view) => moveSel(view, (range2) => moveBySyntax(view.state, range2, ltrAtCursor(view)));
  function cursorByLine(view, forward) {
    return moveSel(view, (range2) => {
      if (!range2.empty)
        return rangeEnd(range2, forward);
      let moved = view.moveVertically(range2, forward);
      return moved.head != range2.head ? moved : view.moveToLineBoundary(range2, forward);
    });
  }
  var cursorLineUp = (view) => cursorByLine(view, false);
  var cursorLineDown = (view) => cursorByLine(view, true);
  function cursorByPage(view, forward) {
    let { state } = view, selection = updateSel(state.selection, (range2) => {
      return range2.empty ? view.moveVertically(range2, forward, Math.min(view.dom.clientHeight, innerHeight)) : rangeEnd(range2, forward);
    });
    if (selection.eq(state.selection))
      return false;
    let startPos = view.coordsAtPos(state.selection.main.head);
    let scrollRect = view.scrollDOM.getBoundingClientRect();
    let effect;
    if (startPos && startPos.top > scrollRect.top && startPos.bottom < scrollRect.bottom && startPos.top - scrollRect.top <= view.scrollDOM.scrollHeight - view.scrollDOM.scrollTop - view.scrollDOM.clientHeight)
      effect = EditorView.scrollIntoView(selection.main.head, { y: "start", yMargin: startPos.top - scrollRect.top });
    view.dispatch(setSel(state, selection), { effects: effect });
    return true;
  }
  var cursorPageUp = (view) => cursorByPage(view, false);
  var cursorPageDown = (view) => cursorByPage(view, true);
  function moveByLineBoundary(view, start, forward) {
    let line = view.lineBlockAt(start.head), moved = view.moveToLineBoundary(start, forward);
    if (moved.head == start.head && moved.head != (forward ? line.to : line.from))
      moved = view.moveToLineBoundary(start, forward, false);
    if (!forward && moved.head == line.from && line.length) {
      let space = /^\s*/.exec(view.state.sliceDoc(line.from, Math.min(line.from + 100, line.to)))[0].length;
      if (space && start.head != line.from + space)
        moved = EditorSelection.cursor(line.from + space);
    }
    return moved;
  }
  var cursorLineBoundaryForward = (view) => moveSel(view, (range2) => moveByLineBoundary(view, range2, true));
  var cursorLineBoundaryBackward = (view) => moveSel(view, (range2) => moveByLineBoundary(view, range2, false));
  var cursorLineStart = (view) => moveSel(view, (range2) => EditorSelection.cursor(view.lineBlockAt(range2.head).from, 1));
  var cursorLineEnd = (view) => moveSel(view, (range2) => EditorSelection.cursor(view.lineBlockAt(range2.head).to, -1));
  function toMatchingBracket(state, dispatch, extend2) {
    let found = false, selection = updateSel(state.selection, (range2) => {
      let matching = matchBrackets(state, range2.head, -1) || matchBrackets(state, range2.head, 1) || range2.head > 0 && matchBrackets(state, range2.head - 1, 1) || range2.head < state.doc.length && matchBrackets(state, range2.head + 1, -1);
      if (!matching || !matching.end)
        return range2;
      found = true;
      let head = matching.start.from == range2.head ? matching.end.to : matching.end.from;
      return extend2 ? EditorSelection.range(range2.anchor, head) : EditorSelection.cursor(head);
    });
    if (!found)
      return false;
    dispatch(setSel(state, selection));
    return true;
  }
  var cursorMatchingBracket = ({ state, dispatch }) => toMatchingBracket(state, dispatch, false);
  function extendSel(view, how) {
    let selection = updateSel(view.state.selection, (range2) => {
      let head = how(range2);
      return EditorSelection.range(range2.anchor, head.head, head.goalColumn);
    });
    if (selection.eq(view.state.selection))
      return false;
    view.dispatch(setSel(view.state, selection));
    return true;
  }
  function selectByChar(view, forward) {
    return extendSel(view, (range2) => view.moveByChar(range2, forward));
  }
  var selectCharLeft = (view) => selectByChar(view, !ltrAtCursor(view));
  var selectCharRight = (view) => selectByChar(view, ltrAtCursor(view));
  function selectByGroup(view, forward) {
    return extendSel(view, (range2) => view.moveByGroup(range2, forward));
  }
  var selectGroupLeft = (view) => selectByGroup(view, !ltrAtCursor(view));
  var selectGroupRight = (view) => selectByGroup(view, ltrAtCursor(view));
  var selectSyntaxLeft = (view) => extendSel(view, (range2) => moveBySyntax(view.state, range2, !ltrAtCursor(view)));
  var selectSyntaxRight = (view) => extendSel(view, (range2) => moveBySyntax(view.state, range2, ltrAtCursor(view)));
  function selectByLine(view, forward) {
    return extendSel(view, (range2) => view.moveVertically(range2, forward));
  }
  var selectLineUp = (view) => selectByLine(view, false);
  var selectLineDown = (view) => selectByLine(view, true);
  function selectByPage(view, forward) {
    return extendSel(view, (range2) => view.moveVertically(range2, forward, Math.min(view.dom.clientHeight, innerHeight)));
  }
  var selectPageUp = (view) => selectByPage(view, false);
  var selectPageDown = (view) => selectByPage(view, true);
  var selectLineBoundaryForward = (view) => extendSel(view, (range2) => moveByLineBoundary(view, range2, true));
  var selectLineBoundaryBackward = (view) => extendSel(view, (range2) => moveByLineBoundary(view, range2, false));
  var selectLineStart = (view) => extendSel(view, (range2) => EditorSelection.cursor(view.lineBlockAt(range2.head).from));
  var selectLineEnd = (view) => extendSel(view, (range2) => EditorSelection.cursor(view.lineBlockAt(range2.head).to));
  var cursorDocStart = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: 0 }));
    return true;
  };
  var cursorDocEnd = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: state.doc.length }));
    return true;
  };
  var selectDocStart = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: state.selection.main.anchor, head: 0 }));
    return true;
  };
  var selectDocEnd = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: state.selection.main.anchor, head: state.doc.length }));
    return true;
  };
  var selectAll = ({ state, dispatch }) => {
    dispatch(state.update({ selection: { anchor: 0, head: state.doc.length }, userEvent: "select" }));
    return true;
  };
  var selectLine = ({ state, dispatch }) => {
    let ranges = selectedLineBlocks(state).map(({ from, to: to2 }) => EditorSelection.range(from, Math.min(to2 + 1, state.doc.length)));
    dispatch(state.update({ selection: EditorSelection.create(ranges), userEvent: "select" }));
    return true;
  };
  var selectParentSyntax = ({ state, dispatch }) => {
    let selection = updateSel(state.selection, (range2) => {
      var _a2;
      let context2 = syntaxTree(state).resolveInner(range2.head, 1);
      while (!(context2.from < range2.from && context2.to >= range2.to || context2.to > range2.to && context2.from <= range2.from || !((_a2 = context2.parent) === null || _a2 === void 0 ? void 0 : _a2.parent)))
        context2 = context2.parent;
      return EditorSelection.range(context2.to, context2.from);
    });
    dispatch(setSel(state, selection));
    return true;
  };
  var simplifySelection = ({ state, dispatch }) => {
    let cur2 = state.selection, selection = null;
    if (cur2.ranges.length > 1)
      selection = EditorSelection.create([cur2.main]);
    else if (!cur2.main.empty)
      selection = EditorSelection.create([EditorSelection.cursor(cur2.main.head)]);
    if (!selection)
      return false;
    dispatch(setSel(state, selection));
    return true;
  };
  function deleteBy({ state, dispatch }, by) {
    if (state.readOnly)
      return false;
    let event = "delete.selection";
    let changes = state.changeByRange((range2) => {
      let { from, to: to2 } = range2;
      if (from == to2) {
        let towards = by(from);
        if (towards < from)
          event = "delete.backward";
        else if (towards > from)
          event = "delete.forward";
        from = Math.min(from, towards);
        to2 = Math.max(to2, towards);
      }
      return from == to2 ? { range: range2 } : { changes: { from, to: to2 }, range: EditorSelection.cursor(from) };
    });
    if (changes.changes.empty)
      return false;
    dispatch(state.update(changes, { scrollIntoView: true, userEvent: event }));
    return true;
  }
  function skipAtomic(target, pos, forward) {
    if (target instanceof EditorView)
      for (let ranges of target.state.facet(EditorView.atomicRanges).map((f) => f(target)))
        ranges.between(pos, pos, (from, to2) => {
          if (from < pos && to2 > pos)
            pos = forward ? to2 : from;
        });
    return pos;
  }
  var deleteByChar = (target, forward) => deleteBy(target, (pos) => {
    let { state } = target, line = state.doc.lineAt(pos), before, targetPos;
    if (!forward && pos > line.from && pos < line.from + 200 && !/[^ \t]/.test(before = line.text.slice(0, pos - line.from))) {
      if (before[before.length - 1] == "	")
        return pos - 1;
      let col = countColumn(before, state.tabSize), drop = col % getIndentUnit(state) || getIndentUnit(state);
      for (let i = 0; i < drop && before[before.length - 1 - i] == " "; i++)
        pos--;
      targetPos = pos;
    } else {
      targetPos = findClusterBreak(line.text, pos - line.from, forward, forward) + line.from;
      if (targetPos == pos && line.number != (forward ? state.doc.lines : 1))
        targetPos += forward ? 1 : -1;
    }
    return skipAtomic(target, targetPos, forward);
  });
  var deleteCharBackward = (view) => deleteByChar(view, false);
  var deleteCharForward = (view) => deleteByChar(view, true);
  var deleteByGroup = (target, forward) => deleteBy(target, (start) => {
    let pos = start, { state } = target, line = state.doc.lineAt(pos);
    let categorize = state.charCategorizer(pos);
    for (let cat = null; ; ) {
      if (pos == (forward ? line.to : line.from)) {
        if (pos == start && line.number != (forward ? state.doc.lines : 1))
          pos += forward ? 1 : -1;
        break;
      }
      let next = findClusterBreak(line.text, pos - line.from, forward) + line.from;
      let nextChar2 = line.text.slice(Math.min(pos, next) - line.from, Math.max(pos, next) - line.from);
      let nextCat = categorize(nextChar2);
      if (cat != null && nextCat != cat)
        break;
      if (nextChar2 != " " || pos != start)
        cat = nextCat;
      pos = next;
    }
    return skipAtomic(target, pos, forward);
  });
  var deleteGroupBackward = (target) => deleteByGroup(target, false);
  var deleteGroupForward = (target) => deleteByGroup(target, true);
  var deleteToLineEnd = (view) => deleteBy(view, (pos) => {
    let lineEnd = view.lineBlockAt(pos).to;
    return skipAtomic(view, pos < lineEnd ? lineEnd : Math.min(view.state.doc.length, pos + 1), true);
  });
  var deleteToLineStart = (view) => deleteBy(view, (pos) => {
    let lineStart = view.lineBlockAt(pos).from;
    return skipAtomic(view, pos > lineStart ? lineStart : Math.max(0, pos - 1), false);
  });
  var splitLine = ({ state, dispatch }) => {
    if (state.readOnly)
      return false;
    let changes = state.changeByRange((range2) => {
      return {
        changes: { from: range2.from, to: range2.to, insert: Text.of(["", ""]) },
        range: EditorSelection.cursor(range2.from)
      };
    });
    dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }));
    return true;
  };
  var transposeChars = ({ state, dispatch }) => {
    if (state.readOnly)
      return false;
    let changes = state.changeByRange((range2) => {
      if (!range2.empty || range2.from == 0 || range2.from == state.doc.length)
        return { range: range2 };
      let pos = range2.from, line = state.doc.lineAt(pos);
      let from = pos == line.from ? pos - 1 : findClusterBreak(line.text, pos - line.from, false) + line.from;
      let to2 = pos == line.to ? pos + 1 : findClusterBreak(line.text, pos - line.from, true) + line.from;
      return {
        changes: { from, to: to2, insert: state.doc.slice(pos, to2).append(state.doc.slice(from, pos)) },
        range: EditorSelection.cursor(to2)
      };
    });
    if (changes.changes.empty)
      return false;
    dispatch(state.update(changes, { scrollIntoView: true, userEvent: "move.character" }));
    return true;
  };
  function selectedLineBlocks(state) {
    let blocks = [], upto = -1;
    for (let range2 of state.selection.ranges) {
      let startLine = state.doc.lineAt(range2.from), endLine = state.doc.lineAt(range2.to);
      if (!range2.empty && range2.to == endLine.from)
        endLine = state.doc.lineAt(range2.to - 1);
      if (upto >= startLine.number) {
        let prev = blocks[blocks.length - 1];
        prev.to = endLine.to;
        prev.ranges.push(range2);
      } else {
        blocks.push({ from: startLine.from, to: endLine.to, ranges: [range2] });
      }
      upto = endLine.number + 1;
    }
    return blocks;
  }
  function moveLine(state, dispatch, forward) {
    if (state.readOnly)
      return false;
    let changes = [], ranges = [];
    for (let block of selectedLineBlocks(state)) {
      if (forward ? block.to == state.doc.length : block.from == 0)
        continue;
      let nextLine = state.doc.lineAt(forward ? block.to + 1 : block.from - 1);
      let size = nextLine.length + 1;
      if (forward) {
        changes.push({ from: block.to, to: nextLine.to }, { from: block.from, insert: nextLine.text + state.lineBreak });
        for (let r of block.ranges)
          ranges.push(EditorSelection.range(Math.min(state.doc.length, r.anchor + size), Math.min(state.doc.length, r.head + size)));
      } else {
        changes.push({ from: nextLine.from, to: block.from }, { from: block.to, insert: state.lineBreak + nextLine.text });
        for (let r of block.ranges)
          ranges.push(EditorSelection.range(r.anchor - size, r.head - size));
      }
    }
    if (!changes.length)
      return false;
    dispatch(state.update({
      changes,
      scrollIntoView: true,
      selection: EditorSelection.create(ranges, state.selection.mainIndex),
      userEvent: "move.line"
    }));
    return true;
  }
  var moveLineUp = ({ state, dispatch }) => moveLine(state, dispatch, false);
  var moveLineDown = ({ state, dispatch }) => moveLine(state, dispatch, true);
  function copyLine(state, dispatch, forward) {
    if (state.readOnly)
      return false;
    let changes = [];
    for (let block of selectedLineBlocks(state)) {
      if (forward)
        changes.push({ from: block.from, insert: state.doc.slice(block.from, block.to) + state.lineBreak });
      else
        changes.push({ from: block.to, insert: state.lineBreak + state.doc.slice(block.from, block.to) });
    }
    dispatch(state.update({ changes, scrollIntoView: true, userEvent: "input.copyline" }));
    return true;
  }
  var copyLineUp = ({ state, dispatch }) => copyLine(state, dispatch, false);
  var copyLineDown = ({ state, dispatch }) => copyLine(state, dispatch, true);
  var deleteLine = (view) => {
    if (view.state.readOnly)
      return false;
    let { state } = view, changes = state.changes(selectedLineBlocks(state).map(({ from, to: to2 }) => {
      if (from > 0)
        from--;
      else if (to2 < state.doc.length)
        to2++;
      return { from, to: to2 };
    }));
    let selection = updateSel(state.selection, (range2) => view.moveVertically(range2, true)).map(changes);
    view.dispatch({ changes, selection, scrollIntoView: true, userEvent: "delete.line" });
    return true;
  };
  function isBetweenBrackets(state, pos) {
    if (/\(\)|\[\]|\{\}/.test(state.sliceDoc(pos - 1, pos + 1)))
      return { from: pos, to: pos };
    let context2 = syntaxTree(state).resolveInner(pos);
    let before = context2.childBefore(pos), after = context2.childAfter(pos), closedBy;
    if (before && after && before.to <= pos && after.from >= pos && (closedBy = before.type.prop(NodeProp.closedBy)) && closedBy.indexOf(after.name) > -1 && state.doc.lineAt(before.to).from == state.doc.lineAt(after.from).from)
      return { from: before.to, to: after.from };
    return null;
  }
  var insertNewlineAndIndent = /* @__PURE__ */ newlineAndIndent(false);
  var insertBlankLine = /* @__PURE__ */ newlineAndIndent(true);
  function newlineAndIndent(atEof) {
    return ({ state, dispatch }) => {
      if (state.readOnly)
        return false;
      let changes = state.changeByRange((range2) => {
        let { from, to: to2 } = range2, line = state.doc.lineAt(from);
        let explode = !atEof && from == to2 && isBetweenBrackets(state, from);
        if (atEof)
          from = to2 = (to2 <= line.to ? line : state.doc.lineAt(to2)).to;
        let cx = new IndentContext(state, { simulateBreak: from, simulateDoubleBreak: !!explode });
        let indent = getIndentation(cx, from);
        if (indent == null)
          indent = /^\s*/.exec(state.doc.lineAt(from).text)[0].length;
        while (to2 < line.to && /\s/.test(line.text[to2 - line.from]))
          to2++;
        if (explode)
          ({ from, to: to2 } = explode);
        else if (from > line.from && from < line.from + 100 && !/\S/.test(line.text.slice(0, from)))
          from = line.from;
        let insert2 = ["", indentString(state, indent)];
        if (explode)
          insert2.push(indentString(state, cx.lineIndent(line.from, -1)));
        return {
          changes: { from, to: to2, insert: Text.of(insert2) },
          range: EditorSelection.cursor(from + 1 + insert2[1].length)
        };
      });
      dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }));
      return true;
    };
  }
  function changeBySelectedLine(state, f) {
    let atLine = -1;
    return state.changeByRange((range2) => {
      let changes = [];
      for (let pos = range2.from; pos <= range2.to; ) {
        let line = state.doc.lineAt(pos);
        if (line.number > atLine && (range2.empty || range2.to > line.from)) {
          f(line, changes, range2);
          atLine = line.number;
        }
        pos = line.to + 1;
      }
      let changeSet = state.changes(changes);
      return {
        changes,
        range: EditorSelection.range(changeSet.mapPos(range2.anchor, 1), changeSet.mapPos(range2.head, 1))
      };
    });
  }
  var indentSelection = ({ state, dispatch }) => {
    if (state.readOnly)
      return false;
    let updated = /* @__PURE__ */ Object.create(null);
    let context2 = new IndentContext(state, { overrideIndentation: (start) => {
      let found = updated[start];
      return found == null ? -1 : found;
    } });
    let changes = changeBySelectedLine(state, (line, changes2, range2) => {
      let indent = getIndentation(context2, line.from);
      if (indent == null)
        return;
      if (!/\S/.test(line.text))
        indent = 0;
      let cur2 = /^\s*/.exec(line.text)[0];
      let norm = indentString(state, indent);
      if (cur2 != norm || range2.from < line.from + cur2.length) {
        updated[line.from] = indent;
        changes2.push({ from: line.from, to: line.from + cur2.length, insert: norm });
      }
    });
    if (!changes.changes.empty)
      dispatch(state.update(changes, { userEvent: "indent" }));
    return true;
  };
  var indentMore = ({ state, dispatch }) => {
    if (state.readOnly)
      return false;
    dispatch(state.update(changeBySelectedLine(state, (line, changes) => {
      changes.push({ from: line.from, insert: state.facet(indentUnit) });
    }), { userEvent: "input.indent" }));
    return true;
  };
  var indentLess = ({ state, dispatch }) => {
    if (state.readOnly)
      return false;
    dispatch(state.update(changeBySelectedLine(state, (line, changes) => {
      let space = /^\s*/.exec(line.text)[0];
      if (!space)
        return;
      let col = countColumn(space, state.tabSize), keep = 0;
      let insert2 = indentString(state, Math.max(0, col - getIndentUnit(state)));
      while (keep < space.length && keep < insert2.length && space.charCodeAt(keep) == insert2.charCodeAt(keep))
        keep++;
      changes.push({ from: line.from + keep, to: line.from + space.length, insert: insert2.slice(keep) });
    }), { userEvent: "delete.dedent" }));
    return true;
  };
  var emacsStyleKeymap = [
    { key: "Ctrl-b", run: cursorCharLeft, shift: selectCharLeft, preventDefault: true },
    { key: "Ctrl-f", run: cursorCharRight, shift: selectCharRight },
    { key: "Ctrl-p", run: cursorLineUp, shift: selectLineUp },
    { key: "Ctrl-n", run: cursorLineDown, shift: selectLineDown },
    { key: "Ctrl-a", run: cursorLineStart, shift: selectLineStart },
    { key: "Ctrl-e", run: cursorLineEnd, shift: selectLineEnd },
    { key: "Ctrl-d", run: deleteCharForward },
    { key: "Ctrl-h", run: deleteCharBackward },
    { key: "Ctrl-k", run: deleteToLineEnd },
    { key: "Ctrl-Alt-h", run: deleteGroupBackward },
    { key: "Ctrl-o", run: splitLine },
    { key: "Ctrl-t", run: transposeChars },
    { key: "Ctrl-v", run: cursorPageDown }
  ];
  var standardKeymap = /* @__PURE__ */ [
    { key: "ArrowLeft", run: cursorCharLeft, shift: selectCharLeft, preventDefault: true },
    { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: cursorGroupLeft, shift: selectGroupLeft },
    { mac: "Cmd-ArrowLeft", run: cursorLineBoundaryBackward, shift: selectLineBoundaryBackward },
    { key: "ArrowRight", run: cursorCharRight, shift: selectCharRight, preventDefault: true },
    { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: cursorGroupRight, shift: selectGroupRight },
    { mac: "Cmd-ArrowRight", run: cursorLineBoundaryForward, shift: selectLineBoundaryForward },
    { key: "ArrowUp", run: cursorLineUp, shift: selectLineUp, preventDefault: true },
    { mac: "Cmd-ArrowUp", run: cursorDocStart, shift: selectDocStart },
    { mac: "Ctrl-ArrowUp", run: cursorPageUp, shift: selectPageUp },
    { key: "ArrowDown", run: cursorLineDown, shift: selectLineDown, preventDefault: true },
    { mac: "Cmd-ArrowDown", run: cursorDocEnd, shift: selectDocEnd },
    { mac: "Ctrl-ArrowDown", run: cursorPageDown, shift: selectPageDown },
    { key: "PageUp", run: cursorPageUp, shift: selectPageUp },
    { key: "PageDown", run: cursorPageDown, shift: selectPageDown },
    { key: "Home", run: cursorLineBoundaryBackward, shift: selectLineBoundaryBackward, preventDefault: true },
    { key: "Mod-Home", run: cursorDocStart, shift: selectDocStart },
    { key: "End", run: cursorLineBoundaryForward, shift: selectLineBoundaryForward, preventDefault: true },
    { key: "Mod-End", run: cursorDocEnd, shift: selectDocEnd },
    { key: "Enter", run: insertNewlineAndIndent },
    { key: "Mod-a", run: selectAll },
    { key: "Backspace", run: deleteCharBackward, shift: deleteCharBackward },
    { key: "Delete", run: deleteCharForward },
    { key: "Mod-Backspace", mac: "Alt-Backspace", run: deleteGroupBackward },
    { key: "Mod-Delete", mac: "Alt-Delete", run: deleteGroupForward },
    { mac: "Mod-Backspace", run: deleteToLineStart },
    { mac: "Mod-Delete", run: deleteToLineEnd }
  ].concat(/* @__PURE__ */ emacsStyleKeymap.map((b2) => ({ mac: b2.key, run: b2.run, shift: b2.shift })));
  var defaultKeymap = /* @__PURE__ */ [
    { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: cursorSyntaxLeft, shift: selectSyntaxLeft },
    { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: cursorSyntaxRight, shift: selectSyntaxRight },
    { key: "Alt-ArrowUp", run: moveLineUp },
    { key: "Shift-Alt-ArrowUp", run: copyLineUp },
    { key: "Alt-ArrowDown", run: moveLineDown },
    { key: "Shift-Alt-ArrowDown", run: copyLineDown },
    { key: "Escape", run: simplifySelection },
    { key: "Mod-Enter", run: insertBlankLine },
    { key: "Alt-l", mac: "Ctrl-l", run: selectLine },
    { key: "Mod-i", run: selectParentSyntax, preventDefault: true },
    { key: "Mod-[", run: indentLess },
    { key: "Mod-]", run: indentMore },
    { key: "Mod-Alt-\\", run: indentSelection },
    { key: "Shift-Mod-k", run: deleteLine },
    { key: "Shift-Mod-\\", run: cursorMatchingBracket },
    { key: "Mod-/", run: toggleComment },
    { key: "Alt-A", run: toggleBlockComment }
  ].concat(standardKeymap);

  // node_modules/crelt/index.es.js
  function crelt() {
    var elt = arguments[0];
    if (typeof elt == "string")
      elt = document.createElement(elt);
    var i = 1, next = arguments[1];
    if (next && typeof next == "object" && next.nodeType == null && !Array.isArray(next)) {
      for (var name2 in next)
        if (Object.prototype.hasOwnProperty.call(next, name2)) {
          var value2 = next[name2];
          if (typeof value2 == "string")
            elt.setAttribute(name2, value2);
          else if (value2 != null)
            elt[name2] = value2;
        }
      i++;
    }
    for (; i < arguments.length; i++)
      add(elt, arguments[i]);
    return elt;
  }
  function add(elt, child) {
    if (typeof child == "string") {
      elt.appendChild(document.createTextNode(child));
    } else if (child == null) {
    } else if (child.nodeType != null) {
      elt.appendChild(child);
    } else if (Array.isArray(child)) {
      for (var i = 0; i < child.length; i++)
        add(elt, child[i]);
    } else {
      throw new RangeError("Unsupported child node: " + child);
    }
  }

  // node_modules/@codemirror/search/dist/index.js
  var basicNormalize = typeof String.prototype.normalize == "function" ? (x) => x.normalize("NFKD") : (x) => x;
  var SearchCursor = class {
    constructor(text, query, from = 0, to2 = text.length, normalize) {
      this.value = { from: 0, to: 0 };
      this.done = false;
      this.matches = [];
      this.buffer = "";
      this.bufferPos = 0;
      this.iter = text.iterRange(from, to2);
      this.bufferStart = from;
      this.normalize = normalize ? (x) => normalize(basicNormalize(x)) : basicNormalize;
      this.query = this.normalize(query);
    }
    peek() {
      if (this.bufferPos == this.buffer.length) {
        this.bufferStart += this.buffer.length;
        this.iter.next();
        if (this.iter.done)
          return -1;
        this.bufferPos = 0;
        this.buffer = this.iter.value;
      }
      return codePointAt(this.buffer, this.bufferPos);
    }
    next() {
      while (this.matches.length)
        this.matches.pop();
      return this.nextOverlapping();
    }
    nextOverlapping() {
      for (; ; ) {
        let next = this.peek();
        if (next < 0) {
          this.done = true;
          return this;
        }
        let str = fromCodePoint(next), start = this.bufferStart + this.bufferPos;
        this.bufferPos += codePointSize(next);
        let norm = this.normalize(str);
        for (let i = 0, pos = start; ; i++) {
          let code = norm.charCodeAt(i);
          let match = this.match(code, pos);
          if (match) {
            this.value = match;
            return this;
          }
          if (i == norm.length - 1)
            break;
          if (pos == start && i < str.length && str.charCodeAt(i) == code)
            pos++;
        }
      }
    }
    match(code, pos) {
      let match = null;
      for (let i = 0; i < this.matches.length; i += 2) {
        let index = this.matches[i], keep = false;
        if (this.query.charCodeAt(index) == code) {
          if (index == this.query.length - 1) {
            match = { from: this.matches[i + 1], to: pos + 1 };
          } else {
            this.matches[i]++;
            keep = true;
          }
        }
        if (!keep) {
          this.matches.splice(i, 2);
          i -= 2;
        }
      }
      if (this.query.charCodeAt(0) == code) {
        if (this.query.length == 1)
          match = { from: pos, to: pos + 1 };
        else
          this.matches.push(1, pos);
      }
      return match;
    }
  };
  if (typeof Symbol != "undefined")
    SearchCursor.prototype[Symbol.iterator] = function() {
      return this;
    };
  var empty = { from: -1, to: -1, match: /* @__PURE__ */ /.*/.exec("") };
  var baseFlags = "gm" + (/x/.unicode == null ? "" : "u");
  var RegExpCursor = class {
    constructor(text, query, options, from = 0, to2 = text.length) {
      this.to = to2;
      this.curLine = "";
      this.done = false;
      this.value = empty;
      if (/\\[sWDnr]|\n|\r|\[\^/.test(query))
        return new MultilineRegExpCursor(text, query, options, from, to2);
      this.re = new RegExp(query, baseFlags + ((options === null || options === void 0 ? void 0 : options.ignoreCase) ? "i" : ""));
      this.iter = text.iter();
      let startLine = text.lineAt(from);
      this.curLineStart = startLine.from;
      this.matchPos = from;
      this.getLine(this.curLineStart);
    }
    getLine(skip) {
      this.iter.next(skip);
      if (this.iter.lineBreak) {
        this.curLine = "";
      } else {
        this.curLine = this.iter.value;
        if (this.curLineStart + this.curLine.length > this.to)
          this.curLine = this.curLine.slice(0, this.to - this.curLineStart);
        this.iter.next();
      }
    }
    nextLine() {
      this.curLineStart = this.curLineStart + this.curLine.length + 1;
      if (this.curLineStart > this.to)
        this.curLine = "";
      else
        this.getLine(0);
    }
    next() {
      for (let off = this.matchPos - this.curLineStart; ; ) {
        this.re.lastIndex = off;
        let match = this.matchPos <= this.to && this.re.exec(this.curLine);
        if (match) {
          let from = this.curLineStart + match.index, to2 = from + match[0].length;
          this.matchPos = to2 + (from == to2 ? 1 : 0);
          if (from == this.curLine.length)
            this.nextLine();
          if (from < to2 || from > this.value.to) {
            this.value = { from, to: to2, match };
            return this;
          }
          off = this.matchPos - this.curLineStart;
        } else if (this.curLineStart + this.curLine.length < this.to) {
          this.nextLine();
          off = 0;
        } else {
          this.done = true;
          return this;
        }
      }
    }
  };
  var flattened = /* @__PURE__ */ new WeakMap();
  var FlattenedDoc = class {
    constructor(from, text) {
      this.from = from;
      this.text = text;
    }
    get to() {
      return this.from + this.text.length;
    }
    static get(doc2, from, to2) {
      let cached = flattened.get(doc2);
      if (!cached || cached.from >= to2 || cached.to <= from) {
        let flat = new FlattenedDoc(from, doc2.sliceString(from, to2));
        flattened.set(doc2, flat);
        return flat;
      }
      if (cached.from == from && cached.to == to2)
        return cached;
      let { text, from: cachedFrom } = cached;
      if (cachedFrom > from) {
        text = doc2.sliceString(from, cachedFrom) + text;
        cachedFrom = from;
      }
      if (cached.to < to2)
        text += doc2.sliceString(cached.to, to2);
      flattened.set(doc2, new FlattenedDoc(cachedFrom, text));
      return new FlattenedDoc(from, text.slice(from - cachedFrom, to2 - cachedFrom));
    }
  };
  var MultilineRegExpCursor = class {
    constructor(text, query, options, from, to2) {
      this.text = text;
      this.to = to2;
      this.done = false;
      this.value = empty;
      this.matchPos = from;
      this.re = new RegExp(query, baseFlags + ((options === null || options === void 0 ? void 0 : options.ignoreCase) ? "i" : ""));
      this.flat = FlattenedDoc.get(text, from, this.chunkEnd(from + 5e3));
    }
    chunkEnd(pos) {
      return pos >= this.to ? this.to : this.text.lineAt(pos).to;
    }
    next() {
      for (; ; ) {
        let off = this.re.lastIndex = this.matchPos - this.flat.from;
        let match = this.re.exec(this.flat.text);
        if (match && !match[0] && match.index == off) {
          this.re.lastIndex = off + 1;
          match = this.re.exec(this.flat.text);
        }
        if (match && this.flat.to < this.to && match.index + match[0].length > this.flat.text.length - 10)
          match = null;
        if (match) {
          let from = this.flat.from + match.index, to2 = from + match[0].length;
          this.value = { from, to: to2, match };
          this.matchPos = to2 + (from == to2 ? 1 : 0);
          return this;
        } else {
          if (this.flat.to == this.to) {
            this.done = true;
            return this;
          }
          this.flat = FlattenedDoc.get(this.text, this.flat.from, this.chunkEnd(this.flat.from + this.flat.text.length * 2));
        }
      }
    }
  };
  if (typeof Symbol != "undefined") {
    RegExpCursor.prototype[Symbol.iterator] = MultilineRegExpCursor.prototype[Symbol.iterator] = function() {
      return this;
    };
  }
  function validRegExp(source) {
    try {
      new RegExp(source, baseFlags);
      return true;
    } catch (_a2) {
      return false;
    }
  }
  function createLineDialog(view) {
    let input = crelt("input", { class: "cm-textfield", name: "line" });
    let dom = crelt("form", {
      class: "cm-gotoLine",
      onkeydown: (event) => {
        if (event.keyCode == 27) {
          event.preventDefault();
          view.dispatch({ effects: dialogEffect.of(false) });
          view.focus();
        } else if (event.keyCode == 13) {
          event.preventDefault();
          go();
        }
      },
      onsubmit: (event) => {
        event.preventDefault();
        go();
      }
    }, crelt("label", view.state.phrase("Go to line"), ": ", input), " ", crelt("button", { class: "cm-button", type: "submit" }, view.state.phrase("go")));
    function go() {
      let match = /^([+-])?(\d+)?(:\d+)?(%)?$/.exec(input.value);
      if (!match)
        return;
      let { state } = view, startLine = state.doc.lineAt(state.selection.main.head);
      let [, sign, ln, cl, percent] = match;
      let col = cl ? +cl.slice(1) : 0;
      let line = ln ? +ln : startLine.number;
      if (ln && percent) {
        let pc = line / 100;
        if (sign)
          pc = pc * (sign == "-" ? -1 : 1) + startLine.number / state.doc.lines;
        line = Math.round(state.doc.lines * pc);
      } else if (ln && sign) {
        line = line * (sign == "-" ? -1 : 1) + startLine.number;
      }
      let docLine = state.doc.line(Math.max(1, Math.min(state.doc.lines, line)));
      view.dispatch({
        effects: dialogEffect.of(false),
        selection: EditorSelection.cursor(docLine.from + Math.max(0, Math.min(col, docLine.length))),
        scrollIntoView: true
      });
      view.focus();
    }
    return { dom };
  }
  var dialogEffect = /* @__PURE__ */ StateEffect.define();
  var dialogField = /* @__PURE__ */ StateField.define({
    create() {
      return true;
    },
    update(value2, tr) {
      for (let e of tr.effects)
        if (e.is(dialogEffect))
          value2 = e.value;
      return value2;
    },
    provide: (f) => showPanel.from(f, (val) => val ? createLineDialog : null)
  });
  var gotoLine = (view) => {
    let panel = getPanel(view, createLineDialog);
    if (!panel) {
      let effects = [dialogEffect.of(true)];
      if (view.state.field(dialogField, false) == null)
        effects.push(StateEffect.appendConfig.of([dialogField, baseTheme$13]));
      view.dispatch({ effects });
      panel = getPanel(view, createLineDialog);
    }
    if (panel)
      panel.dom.querySelector("input").focus();
    return true;
  };
  var baseTheme$13 = /* @__PURE__ */ EditorView.baseTheme({
    ".cm-panel.cm-gotoLine": {
      padding: "2px 6px 4px",
      "& label": { fontSize: "80%" }
    }
  });
  var defaultHighlightOptions = {
    highlightWordAroundCursor: false,
    minSelectionLength: 1,
    maxMatches: 100,
    wholeWords: false
  };
  var highlightConfig = /* @__PURE__ */ Facet.define({
    combine(options) {
      return combineConfig(options, defaultHighlightOptions, {
        highlightWordAroundCursor: (a2, b2) => a2 || b2,
        minSelectionLength: Math.min,
        maxMatches: Math.min
      });
    }
  });
  function highlightSelectionMatches(options) {
    let ext = [defaultTheme, matchHighlighter];
    if (options)
      ext.push(highlightConfig.of(options));
    return ext;
  }
  var matchDeco = /* @__PURE__ */ Decoration.mark({ class: "cm-selectionMatch" });
  var mainMatchDeco = /* @__PURE__ */ Decoration.mark({ class: "cm-selectionMatch cm-selectionMatch-main" });
  function insideWordBoundaries(check, state, from, to2) {
    return (from == 0 || check(state.sliceDoc(from - 1, from)) != CharCategory.Word) && (to2 == state.doc.length || check(state.sliceDoc(to2, to2 + 1)) != CharCategory.Word);
  }
  function insideWord(check, state, from, to2) {
    return check(state.sliceDoc(from, from + 1)) == CharCategory.Word && check(state.sliceDoc(to2 - 1, to2)) == CharCategory.Word;
  }
  var matchHighlighter = /* @__PURE__ */ ViewPlugin.fromClass(class {
    constructor(view) {
      this.decorations = this.getDeco(view);
    }
    update(update3) {
      if (update3.selectionSet || update3.docChanged || update3.viewportChanged)
        this.decorations = this.getDeco(update3.view);
    }
    getDeco(view) {
      let conf = view.state.facet(highlightConfig);
      let { state } = view, sel = state.selection;
      if (sel.ranges.length > 1)
        return Decoration.none;
      let range2 = sel.main, query, check = null;
      if (range2.empty) {
        if (!conf.highlightWordAroundCursor)
          return Decoration.none;
        let word = state.wordAt(range2.head);
        if (!word)
          return Decoration.none;
        check = state.charCategorizer(range2.head);
        query = state.sliceDoc(word.from, word.to);
      } else {
        let len = range2.to - range2.from;
        if (len < conf.minSelectionLength || len > 200)
          return Decoration.none;
        if (conf.wholeWords) {
          query = state.sliceDoc(range2.from, range2.to);
          check = state.charCategorizer(range2.head);
          if (!(insideWordBoundaries(check, state, range2.from, range2.to) && insideWord(check, state, range2.from, range2.to)))
            return Decoration.none;
        } else {
          query = state.sliceDoc(range2.from, range2.to).trim();
          if (!query)
            return Decoration.none;
        }
      }
      let deco = [];
      for (let part of view.visibleRanges) {
        let cursor = new SearchCursor(state.doc, query, part.from, part.to);
        while (!cursor.next().done) {
          let { from, to: to2 } = cursor.value;
          if (!check || insideWordBoundaries(check, state, from, to2)) {
            if (range2.empty && from <= range2.from && to2 >= range2.to)
              deco.push(mainMatchDeco.range(from, to2));
            else if (from >= range2.to || to2 <= range2.from)
              deco.push(matchDeco.range(from, to2));
            if (deco.length > conf.maxMatches)
              return Decoration.none;
          }
        }
      }
      return Decoration.set(deco);
    }
  }, {
    decorations: (v) => v.decorations
  });
  var defaultTheme = /* @__PURE__ */ EditorView.baseTheme({
    ".cm-selectionMatch": { backgroundColor: "#99ff7780" },
    ".cm-searchMatch .cm-selectionMatch": { backgroundColor: "transparent" }
  });
  var selectWord = ({ state, dispatch }) => {
    let { selection } = state;
    let newSel = EditorSelection.create(selection.ranges.map((range2) => state.wordAt(range2.head) || EditorSelection.cursor(range2.head)), selection.mainIndex);
    if (newSel.eq(selection))
      return false;
    dispatch(state.update({ selection: newSel }));
    return true;
  };
  function findNextOccurrence(state, query) {
    let { main, ranges } = state.selection;
    let word = state.wordAt(main.head), fullWord = word && word.from == main.from && word.to == main.to;
    for (let cycled = false, cursor = new SearchCursor(state.doc, query, ranges[ranges.length - 1].to); ; ) {
      cursor.next();
      if (cursor.done) {
        if (cycled)
          return null;
        cursor = new SearchCursor(state.doc, query, 0, Math.max(0, ranges[ranges.length - 1].from - 1));
        cycled = true;
      } else {
        if (cycled && ranges.some((r) => r.from == cursor.value.from))
          continue;
        if (fullWord) {
          let word2 = state.wordAt(cursor.value.from);
          if (!word2 || word2.from != cursor.value.from || word2.to != cursor.value.to)
            continue;
        }
        return cursor.value;
      }
    }
  }
  var selectNextOccurrence = ({ state, dispatch }) => {
    let { ranges } = state.selection;
    if (ranges.some((sel) => sel.from === sel.to))
      return selectWord({ state, dispatch });
    let searchedText = state.sliceDoc(ranges[0].from, ranges[0].to);
    if (state.selection.ranges.some((r) => state.sliceDoc(r.from, r.to) != searchedText))
      return false;
    let range2 = findNextOccurrence(state, searchedText);
    if (!range2)
      return false;
    dispatch(state.update({
      selection: state.selection.addRange(EditorSelection.range(range2.from, range2.to), false),
      effects: EditorView.scrollIntoView(range2.to)
    }));
    return true;
  };
  var searchConfigFacet = /* @__PURE__ */ Facet.define({
    combine(configs) {
      var _a2;
      return {
        top: configs.reduce((val, conf) => val !== null && val !== void 0 ? val : conf.top, void 0) || false,
        caseSensitive: configs.reduce((val, conf) => val !== null && val !== void 0 ? val : conf.caseSensitive, void 0) || false,
        createPanel: ((_a2 = configs.find((c4) => c4.createPanel)) === null || _a2 === void 0 ? void 0 : _a2.createPanel) || ((view) => new SearchPanel(view))
      };
    }
  });
  var SearchQuery = class {
    constructor(config2) {
      this.search = config2.search;
      this.caseSensitive = !!config2.caseSensitive;
      this.regexp = !!config2.regexp;
      this.replace = config2.replace || "";
      this.valid = !!this.search && (!this.regexp || validRegExp(this.search));
      this.unquoted = config2.literal ? this.search : this.search.replace(/\\([nrt\\])/g, (_, ch) => ch == "n" ? "\n" : ch == "r" ? "\r" : ch == "t" ? "	" : "\\");
    }
    eq(other) {
      return this.search == other.search && this.replace == other.replace && this.caseSensitive == other.caseSensitive && this.regexp == other.regexp;
    }
    create() {
      return this.regexp ? new RegExpQuery(this) : new StringQuery(this);
    }
    getCursor(doc2, from = 0, to2 = doc2.length) {
      return this.regexp ? regexpCursor(this, doc2, from, to2) : stringCursor(this, doc2, from, to2);
    }
  };
  var QueryType2 = class {
    constructor(spec) {
      this.spec = spec;
    }
  };
  function stringCursor(spec, doc2, from, to2) {
    return new SearchCursor(doc2, spec.unquoted, from, to2, spec.caseSensitive ? void 0 : (x) => x.toLowerCase());
  }
  var StringQuery = class extends QueryType2 {
    constructor(spec) {
      super(spec);
    }
    nextMatch(doc2, curFrom, curTo) {
      let cursor = stringCursor(this.spec, doc2, curTo, doc2.length).nextOverlapping();
      if (cursor.done)
        cursor = stringCursor(this.spec, doc2, 0, curFrom).nextOverlapping();
      return cursor.done ? null : cursor.value;
    }
    prevMatchInRange(doc2, from, to2) {
      for (let pos = to2; ; ) {
        let start = Math.max(from, pos - 1e4 - this.spec.unquoted.length);
        let cursor = stringCursor(this.spec, doc2, start, pos), range2 = null;
        while (!cursor.nextOverlapping().done)
          range2 = cursor.value;
        if (range2)
          return range2;
        if (start == from)
          return null;
        pos -= 1e4;
      }
    }
    prevMatch(doc2, curFrom, curTo) {
      return this.prevMatchInRange(doc2, 0, curFrom) || this.prevMatchInRange(doc2, curTo, doc2.length);
    }
    getReplacement(_result) {
      return this.spec.replace;
    }
    matchAll(doc2, limit) {
      let cursor = stringCursor(this.spec, doc2, 0, doc2.length), ranges = [];
      while (!cursor.next().done) {
        if (ranges.length >= limit)
          return null;
        ranges.push(cursor.value);
      }
      return ranges;
    }
    highlight(doc2, from, to2, add2) {
      let cursor = stringCursor(this.spec, doc2, Math.max(0, from - this.spec.unquoted.length), Math.min(to2 + this.spec.unquoted.length, doc2.length));
      while (!cursor.next().done)
        add2(cursor.value.from, cursor.value.to);
    }
  };
  function regexpCursor(spec, doc2, from, to2) {
    return new RegExpCursor(doc2, spec.search, spec.caseSensitive ? void 0 : { ignoreCase: true }, from, to2);
  }
  var RegExpQuery = class extends QueryType2 {
    nextMatch(doc2, curFrom, curTo) {
      let cursor = regexpCursor(this.spec, doc2, curTo, doc2.length).next();
      if (cursor.done)
        cursor = regexpCursor(this.spec, doc2, 0, curFrom).next();
      return cursor.done ? null : cursor.value;
    }
    prevMatchInRange(doc2, from, to2) {
      for (let size = 1; ; size++) {
        let start = Math.max(from, to2 - size * 1e4);
        let cursor = regexpCursor(this.spec, doc2, start, to2), range2 = null;
        while (!cursor.next().done)
          range2 = cursor.value;
        if (range2 && (start == from || range2.from > start + 10))
          return range2;
        if (start == from)
          return null;
      }
    }
    prevMatch(doc2, curFrom, curTo) {
      return this.prevMatchInRange(doc2, 0, curFrom) || this.prevMatchInRange(doc2, curTo, doc2.length);
    }
    getReplacement(result) {
      return this.spec.replace.replace(/\$([$&\d+])/g, (m3, i) => i == "$" ? "$" : i == "&" ? result.match[0] : i != "0" && +i < result.match.length ? result.match[i] : m3);
    }
    matchAll(doc2, limit) {
      let cursor = regexpCursor(this.spec, doc2, 0, doc2.length), ranges = [];
      while (!cursor.next().done) {
        if (ranges.length >= limit)
          return null;
        ranges.push(cursor.value);
      }
      return ranges;
    }
    highlight(doc2, from, to2, add2) {
      let cursor = regexpCursor(this.spec, doc2, Math.max(0, from - 250), Math.min(to2 + 250, doc2.length));
      while (!cursor.next().done)
        add2(cursor.value.from, cursor.value.to);
    }
  };
  var setSearchQuery = /* @__PURE__ */ StateEffect.define();
  var togglePanel = /* @__PURE__ */ StateEffect.define();
  var searchState = /* @__PURE__ */ StateField.define({
    create(state) {
      return new SearchState(defaultQuery(state).create(), null);
    },
    update(value2, tr) {
      for (let effect of tr.effects) {
        if (effect.is(setSearchQuery))
          value2 = new SearchState(effect.value.create(), value2.panel);
        else if (effect.is(togglePanel))
          value2 = new SearchState(value2.query, effect.value ? createSearchPanel : null);
      }
      return value2;
    },
    provide: (f) => showPanel.from(f, (val) => val.panel)
  });
  var SearchState = class {
    constructor(query, panel) {
      this.query = query;
      this.panel = panel;
    }
  };
  var matchMark = /* @__PURE__ */ Decoration.mark({ class: "cm-searchMatch" });
  var selectedMatchMark = /* @__PURE__ */ Decoration.mark({ class: "cm-searchMatch cm-searchMatch-selected" });
  var searchHighlighter = /* @__PURE__ */ ViewPlugin.fromClass(class {
    constructor(view) {
      this.view = view;
      this.decorations = this.highlight(view.state.field(searchState));
    }
    update(update3) {
      let state = update3.state.field(searchState);
      if (state != update3.startState.field(searchState) || update3.docChanged || update3.selectionSet || update3.viewportChanged)
        this.decorations = this.highlight(state);
    }
    highlight({ query, panel }) {
      if (!panel || !query.spec.valid)
        return Decoration.none;
      let { view } = this;
      let builder = new RangeSetBuilder();
      for (let i = 0, ranges = view.visibleRanges, l = ranges.length; i < l; i++) {
        let { from, to: to2 } = ranges[i];
        while (i < l - 1 && to2 > ranges[i + 1].from - 2 * 250)
          to2 = ranges[++i].to;
        query.highlight(view.state.doc, from, to2, (from2, to3) => {
          let selected = view.state.selection.ranges.some((r) => r.from == from2 && r.to == to3);
          builder.add(from2, to3, selected ? selectedMatchMark : matchMark);
        });
      }
      return builder.finish();
    }
  }, {
    decorations: (v) => v.decorations
  });
  function searchCommand(f) {
    return (view) => {
      let state = view.state.field(searchState, false);
      return state && state.query.spec.valid ? f(view, state) : openSearchPanel(view);
    };
  }
  var findNext = /* @__PURE__ */ searchCommand((view, { query }) => {
    let { from, to: to2 } = view.state.selection.main;
    let next = query.nextMatch(view.state.doc, from, to2);
    if (!next || next.from == from && next.to == to2)
      return false;
    view.dispatch({
      selection: { anchor: next.from, head: next.to },
      scrollIntoView: true,
      effects: announceMatch(view, next),
      userEvent: "select.search"
    });
    return true;
  });
  var findPrevious = /* @__PURE__ */ searchCommand((view, { query }) => {
    let { state } = view, { from, to: to2 } = state.selection.main;
    let range2 = query.prevMatch(state.doc, from, to2);
    if (!range2)
      return false;
    view.dispatch({
      selection: { anchor: range2.from, head: range2.to },
      scrollIntoView: true,
      effects: announceMatch(view, range2),
      userEvent: "select.search"
    });
    return true;
  });
  var selectMatches = /* @__PURE__ */ searchCommand((view, { query }) => {
    let ranges = query.matchAll(view.state.doc, 1e3);
    if (!ranges || !ranges.length)
      return false;
    view.dispatch({
      selection: EditorSelection.create(ranges.map((r) => EditorSelection.range(r.from, r.to))),
      userEvent: "select.search.matches"
    });
    return true;
  });
  var selectSelectionMatches = ({ state, dispatch }) => {
    let sel = state.selection;
    if (sel.ranges.length > 1 || sel.main.empty)
      return false;
    let { from, to: to2 } = sel.main;
    let ranges = [], main = 0;
    for (let cur2 = new SearchCursor(state.doc, state.sliceDoc(from, to2)); !cur2.next().done; ) {
      if (ranges.length > 1e3)
        return false;
      if (cur2.value.from == from)
        main = ranges.length;
      ranges.push(EditorSelection.range(cur2.value.from, cur2.value.to));
    }
    dispatch(state.update({
      selection: EditorSelection.create(ranges, main),
      userEvent: "select.search.matches"
    }));
    return true;
  };
  var replaceNext = /* @__PURE__ */ searchCommand((view, { query }) => {
    let { state } = view, { from, to: to2 } = state.selection.main;
    if (state.readOnly)
      return false;
    let next = query.nextMatch(state.doc, from, from);
    if (!next)
      return false;
    let changes = [], selection, replacement;
    if (next.from == from && next.to == to2) {
      replacement = state.toText(query.getReplacement(next));
      changes.push({ from: next.from, to: next.to, insert: replacement });
      next = query.nextMatch(state.doc, next.from, next.to);
    }
    if (next) {
      let off = changes.length == 0 || changes[0].from >= next.to ? 0 : next.to - next.from - replacement.length;
      selection = { anchor: next.from - off, head: next.to - off };
    }
    view.dispatch({
      changes,
      selection,
      scrollIntoView: !!selection,
      effects: next ? announceMatch(view, next) : void 0,
      userEvent: "input.replace"
    });
    return true;
  });
  var replaceAll = /* @__PURE__ */ searchCommand((view, { query }) => {
    if (view.state.readOnly)
      return false;
    let changes = query.matchAll(view.state.doc, 1e9).map((match) => {
      let { from, to: to2 } = match;
      return { from, to: to2, insert: query.getReplacement(match) };
    });
    if (!changes.length)
      return false;
    view.dispatch({
      changes,
      userEvent: "input.replace.all"
    });
    return true;
  });
  function createSearchPanel(view) {
    return view.state.facet(searchConfigFacet).createPanel(view);
  }
  function defaultQuery(state, fallback) {
    var _a2;
    let sel = state.selection.main;
    let selText = sel.empty || sel.to > sel.from + 100 ? "" : state.sliceDoc(sel.from, sel.to);
    let caseSensitive = (_a2 = fallback === null || fallback === void 0 ? void 0 : fallback.caseSensitive) !== null && _a2 !== void 0 ? _a2 : state.facet(searchConfigFacet).caseSensitive;
    return fallback && !selText ? fallback : new SearchQuery({ search: selText.replace(/\n/g, "\\n"), caseSensitive });
  }
  var openSearchPanel = (view) => {
    let state = view.state.field(searchState, false);
    if (state && state.panel) {
      let panel = getPanel(view, createSearchPanel);
      if (!panel)
        return false;
      let searchInput = panel.dom.querySelector("[name=search]");
      if (searchInput != view.root.activeElement) {
        let query = defaultQuery(view.state, state.query.spec);
        if (query.valid)
          view.dispatch({ effects: setSearchQuery.of(query) });
        searchInput.focus();
        searchInput.select();
      }
    } else {
      view.dispatch({ effects: [
        togglePanel.of(true),
        state ? setSearchQuery.of(defaultQuery(view.state, state.query.spec)) : StateEffect.appendConfig.of(searchExtensions)
      ] });
    }
    return true;
  };
  var closeSearchPanel = (view) => {
    let state = view.state.field(searchState, false);
    if (!state || !state.panel)
      return false;
    let panel = getPanel(view, createSearchPanel);
    if (panel && panel.dom.contains(view.root.activeElement))
      view.focus();
    view.dispatch({ effects: togglePanel.of(false) });
    return true;
  };
  var searchKeymap = [
    { key: "Mod-f", run: openSearchPanel, scope: "editor search-panel" },
    { key: "F3", run: findNext, shift: findPrevious, scope: "editor search-panel", preventDefault: true },
    { key: "Mod-g", run: findNext, shift: findPrevious, scope: "editor search-panel", preventDefault: true },
    { key: "Escape", run: closeSearchPanel, scope: "editor search-panel" },
    { key: "Mod-Shift-l", run: selectSelectionMatches },
    { key: "Alt-g", run: gotoLine },
    { key: "Mod-d", run: selectNextOccurrence, preventDefault: true }
  ];
  var SearchPanel = class {
    constructor(view) {
      this.view = view;
      let query = this.query = view.state.field(searchState).query.spec;
      this.commit = this.commit.bind(this);
      this.searchField = crelt("input", {
        value: query.search,
        placeholder: phrase(view, "Find"),
        "aria-label": phrase(view, "Find"),
        class: "cm-textfield",
        name: "search",
        onchange: this.commit,
        onkeyup: this.commit
      });
      this.replaceField = crelt("input", {
        value: query.replace,
        placeholder: phrase(view, "Replace"),
        "aria-label": phrase(view, "Replace"),
        class: "cm-textfield",
        name: "replace",
        onchange: this.commit,
        onkeyup: this.commit
      });
      this.caseField = crelt("input", {
        type: "checkbox",
        name: "case",
        checked: query.caseSensitive,
        onchange: this.commit
      });
      this.reField = crelt("input", {
        type: "checkbox",
        name: "re",
        checked: query.regexp,
        onchange: this.commit
      });
      function button(name2, onclick, content2) {
        return crelt("button", { class: "cm-button", name: name2, onclick, type: "button" }, content2);
      }
      this.dom = crelt("div", { onkeydown: (e) => this.keydown(e), class: "cm-search" }, [
        this.searchField,
        button("next", () => findNext(view), [phrase(view, "next")]),
        button("prev", () => findPrevious(view), [phrase(view, "previous")]),
        button("select", () => selectMatches(view), [phrase(view, "all")]),
        crelt("label", null, [this.caseField, phrase(view, "match case")]),
        crelt("label", null, [this.reField, phrase(view, "regexp")]),
        ...view.state.readOnly ? [] : [
          crelt("br"),
          this.replaceField,
          button("replace", () => replaceNext(view), [phrase(view, "replace")]),
          button("replaceAll", () => replaceAll(view), [phrase(view, "replace all")]),
          crelt("button", {
            name: "close",
            onclick: () => closeSearchPanel(view),
            "aria-label": phrase(view, "close"),
            type: "button"
          }, ["\xD7"])
        ]
      ]);
    }
    commit() {
      let query = new SearchQuery({
        search: this.searchField.value,
        caseSensitive: this.caseField.checked,
        regexp: this.reField.checked,
        replace: this.replaceField.value
      });
      if (!query.eq(this.query)) {
        this.query = query;
        this.view.dispatch({ effects: setSearchQuery.of(query) });
      }
    }
    keydown(e) {
      if (runScopeHandlers(this.view, e, "search-panel")) {
        e.preventDefault();
      } else if (e.keyCode == 13 && e.target == this.searchField) {
        e.preventDefault();
        (e.shiftKey ? findPrevious : findNext)(this.view);
      } else if (e.keyCode == 13 && e.target == this.replaceField) {
        e.preventDefault();
        replaceNext(this.view);
      }
    }
    update(update3) {
      for (let tr of update3.transactions)
        for (let effect of tr.effects) {
          if (effect.is(setSearchQuery) && !effect.value.eq(this.query))
            this.setQuery(effect.value);
        }
    }
    setQuery(query) {
      this.query = query;
      this.searchField.value = query.search;
      this.replaceField.value = query.replace;
      this.caseField.checked = query.caseSensitive;
      this.reField.checked = query.regexp;
    }
    mount() {
      this.searchField.select();
    }
    get pos() {
      return 80;
    }
    get top() {
      return this.view.state.facet(searchConfigFacet).top;
    }
  };
  function phrase(view, phrase2) {
    return view.state.phrase(phrase2);
  }
  var AnnounceMargin = 30;
  var Break = /[\s\.,:;?!]/;
  function announceMatch(view, { from, to: to2 }) {
    let lineStart = view.state.doc.lineAt(from).from, lineEnd = view.state.doc.lineAt(to2).to;
    let start = Math.max(lineStart, from - AnnounceMargin), end = Math.min(lineEnd, to2 + AnnounceMargin);
    let text = view.state.sliceDoc(start, end);
    if (start != lineStart) {
      for (let i = 0; i < AnnounceMargin; i++)
        if (!Break.test(text[i + 1]) && Break.test(text[i])) {
          text = text.slice(i);
          break;
        }
    }
    if (end != lineEnd) {
      for (let i = text.length - 1; i > text.length - AnnounceMargin; i--)
        if (!Break.test(text[i - 1]) && Break.test(text[i])) {
          text = text.slice(0, i);
          break;
        }
    }
    return EditorView.announce.of(`${view.state.phrase("current match")}. ${text} ${view.state.phrase("on line")} ${view.state.doc.lineAt(from).number}`);
  }
  var baseTheme3 = /* @__PURE__ */ EditorView.baseTheme({
    ".cm-panel.cm-search": {
      padding: "2px 6px 4px",
      position: "relative",
      "& [name=close]": {
        position: "absolute",
        top: "0",
        right: "4px",
        backgroundColor: "inherit",
        border: "none",
        font: "inherit",
        padding: 0,
        margin: 0
      },
      "& input, & button, & label": {
        margin: ".2em .6em .2em 0"
      },
      "& input[type=checkbox]": {
        marginRight: ".2em"
      },
      "& label": {
        fontSize: "80%",
        whiteSpace: "pre"
      }
    },
    "&light .cm-searchMatch": { backgroundColor: "#ffff0054" },
    "&dark .cm-searchMatch": { backgroundColor: "#00ffff8a" },
    "&light .cm-searchMatch-selected": { backgroundColor: "#ff6a0054" },
    "&dark .cm-searchMatch-selected": { backgroundColor: "#ff00ff8a" }
  });
  var searchExtensions = [
    searchState,
    /* @__PURE__ */ Prec.lowest(searchHighlighter),
    baseTheme3
  ];

  // node_modules/@codemirror/autocomplete/dist/index.js
  var CompletionContext = class {
    constructor(state, pos, explicit) {
      this.state = state;
      this.pos = pos;
      this.explicit = explicit;
      this.abortListeners = [];
    }
    tokenBefore(types2) {
      let token = syntaxTree(this.state).resolveInner(this.pos, -1);
      while (token && types2.indexOf(token.name) < 0)
        token = token.parent;
      return token ? {
        from: token.from,
        to: this.pos,
        text: this.state.sliceDoc(token.from, this.pos),
        type: token.type
      } : null;
    }
    matchBefore(expr) {
      let line = this.state.doc.lineAt(this.pos);
      let start = Math.max(line.from, this.pos - 250);
      let str = line.text.slice(start - line.from, this.pos - line.from);
      let found = str.search(ensureAnchor(expr, false));
      return found < 0 ? null : { from: start + found, to: this.pos, text: str.slice(found) };
    }
    get aborted() {
      return this.abortListeners == null;
    }
    addEventListener(type2, listener) {
      if (type2 == "abort" && this.abortListeners)
        this.abortListeners.push(listener);
    }
  };
  function toSet(chars) {
    let flat = Object.keys(chars).join("");
    let words = /\w/.test(flat);
    if (words)
      flat = flat.replace(/\w/g, "");
    return `[${words ? "\\w" : ""}${flat.replace(/[^\w\s]/g, "\\$&")}]`;
  }
  function prefixMatch(options) {
    let first = /* @__PURE__ */ Object.create(null), rest = /* @__PURE__ */ Object.create(null);
    for (let { label } of options) {
      first[label[0]] = true;
      for (let i = 1; i < label.length; i++)
        rest[label[i]] = true;
    }
    let source = toSet(first) + toSet(rest) + "*$";
    return [new RegExp("^" + source), new RegExp(source)];
  }
  function completeFromList(list) {
    let options = list.map((o) => typeof o == "string" ? { label: o } : o);
    let [validFor, match] = options.every((o) => /^\w+$/.test(o.label)) ? [/\w*$/, /\w+$/] : prefixMatch(options);
    return (context2) => {
      let token = context2.matchBefore(match);
      return token || context2.explicit ? { from: token ? token.from : context2.pos, options, validFor } : null;
    };
  }
  var Option = class {
    constructor(completion, source, match) {
      this.completion = completion;
      this.source = source;
      this.match = match;
    }
  };
  function cur(state) {
    return state.selection.main.head;
  }
  function ensureAnchor(expr, start) {
    var _a2;
    let { source } = expr;
    let addStart = start && source[0] != "^", addEnd = source[source.length - 1] != "$";
    if (!addStart && !addEnd)
      return expr;
    return new RegExp(`${addStart ? "^" : ""}(?:${source})${addEnd ? "$" : ""}`, (_a2 = expr.flags) !== null && _a2 !== void 0 ? _a2 : expr.ignoreCase ? "i" : "");
  }
  function insertCompletionText(state, text, from, to2) {
    return Object.assign(Object.assign({}, state.changeByRange((range2) => {
      if (range2 == state.selection.main)
        return {
          changes: { from, to: to2, insert: text },
          range: EditorSelection.cursor(from + text.length)
        };
      let len = to2 - from;
      if (!range2.empty || len && state.sliceDoc(range2.from - len, range2.from) != state.sliceDoc(from, to2))
        return { range: range2 };
      return {
        changes: { from: range2.from - len, to: range2.from, insert: text },
        range: EditorSelection.cursor(range2.from - len + text.length)
      };
    })), { userEvent: "input.complete" });
  }
  function applyCompletion(view, option) {
    const apply = option.completion.apply || option.completion.label;
    let result = option.source;
    if (typeof apply == "string")
      view.dispatch(insertCompletionText(view.state, apply, result.from, result.to));
    else
      apply(view, option.completion, result.from, result.to);
  }
  var SourceCache = /* @__PURE__ */ new WeakMap();
  function asSource(source) {
    if (!Array.isArray(source))
      return source;
    let known = SourceCache.get(source);
    if (!known)
      SourceCache.set(source, known = completeFromList(source));
    return known;
  }
  var FuzzyMatcher = class {
    constructor(pattern) {
      this.pattern = pattern;
      this.chars = [];
      this.folded = [];
      this.any = [];
      this.precise = [];
      this.byWord = [];
      for (let p2 = 0; p2 < pattern.length; ) {
        let char = codePointAt(pattern, p2), size = codePointSize(char);
        this.chars.push(char);
        let part = pattern.slice(p2, p2 + size), upper = part.toUpperCase();
        this.folded.push(codePointAt(upper == part ? part.toLowerCase() : upper, 0));
        p2 += size;
      }
      this.astral = pattern.length != this.chars.length;
    }
    match(word) {
      if (this.pattern.length == 0)
        return [0];
      if (word.length < this.pattern.length)
        return null;
      let { chars, folded, any, precise, byWord } = this;
      if (chars.length == 1) {
        let first = codePointAt(word, 0);
        return first == chars[0] ? [0, 0, codePointSize(first)] : first == folded[0] ? [-200, 0, codePointSize(first)] : null;
      }
      let direct = word.indexOf(this.pattern);
      if (direct == 0)
        return [0, 0, this.pattern.length];
      let len = chars.length, anyTo = 0;
      if (direct < 0) {
        for (let i = 0, e = Math.min(word.length, 200); i < e && anyTo < len; ) {
          let next = codePointAt(word, i);
          if (next == chars[anyTo] || next == folded[anyTo])
            any[anyTo++] = i;
          i += codePointSize(next);
        }
        if (anyTo < len)
          return null;
      }
      let preciseTo = 0;
      let byWordTo = 0, byWordFolded = false;
      let adjacentTo = 0, adjacentStart = -1, adjacentEnd = -1;
      let hasLower = /[a-z]/.test(word), wordAdjacent = true;
      for (let i = 0, e = Math.min(word.length, 200), prevType = 0; i < e && byWordTo < len; ) {
        let next = codePointAt(word, i);
        if (direct < 0) {
          if (preciseTo < len && next == chars[preciseTo])
            precise[preciseTo++] = i;
          if (adjacentTo < len) {
            if (next == chars[adjacentTo] || next == folded[adjacentTo]) {
              if (adjacentTo == 0)
                adjacentStart = i;
              adjacentEnd = i + 1;
              adjacentTo++;
            } else {
              adjacentTo = 0;
            }
          }
        }
        let ch, type2 = next < 255 ? next >= 48 && next <= 57 || next >= 97 && next <= 122 ? 2 : next >= 65 && next <= 90 ? 1 : 0 : (ch = fromCodePoint(next)) != ch.toLowerCase() ? 1 : ch != ch.toUpperCase() ? 2 : 0;
        if (!i || type2 == 1 && hasLower || prevType == 0 && type2 != 0) {
          if (chars[byWordTo] == next || folded[byWordTo] == next && (byWordFolded = true))
            byWord[byWordTo++] = i;
          else if (byWord.length)
            wordAdjacent = false;
        }
        prevType = type2;
        i += codePointSize(next);
      }
      if (byWordTo == len && byWord[0] == 0 && wordAdjacent)
        return this.result(-100 + (byWordFolded ? -200 : 0), byWord, word);
      if (adjacentTo == len && adjacentStart == 0)
        return [-200 - word.length, 0, adjacentEnd];
      if (direct > -1)
        return [-700 - word.length, direct, direct + this.pattern.length];
      if (adjacentTo == len)
        return [-200 + -700 - word.length, adjacentStart, adjacentEnd];
      if (byWordTo == len)
        return this.result(-100 + (byWordFolded ? -200 : 0) + -700 + (wordAdjacent ? 0 : -1100), byWord, word);
      return chars.length == 2 ? null : this.result((any[0] ? -700 : 0) + -200 + -1100, any, word);
    }
    result(score2, positions, word) {
      let result = [score2 - word.length], i = 1;
      for (let pos of positions) {
        let to2 = pos + (this.astral ? codePointSize(codePointAt(word, pos)) : 1);
        if (i > 1 && result[i - 1] == pos)
          result[i - 1] = to2;
        else {
          result[i++] = pos;
          result[i++] = to2;
        }
      }
      return result;
    }
  };
  var completionConfig = /* @__PURE__ */ Facet.define({
    combine(configs) {
      return combineConfig(configs, {
        activateOnTyping: true,
        override: null,
        closeOnBlur: true,
        maxRenderedOptions: 100,
        defaultKeymap: true,
        optionClass: () => "",
        aboveCursor: false,
        icons: true,
        addToOptions: []
      }, {
        defaultKeymap: (a2, b2) => a2 && b2,
        closeOnBlur: (a2, b2) => a2 && b2,
        icons: (a2, b2) => a2 && b2,
        optionClass: (a2, b2) => (c4) => joinClass(a2(c4), b2(c4)),
        addToOptions: (a2, b2) => a2.concat(b2)
      });
    }
  });
  function joinClass(a2, b2) {
    return a2 ? b2 ? a2 + " " + b2 : a2 : b2;
  }
  function optionContent(config2) {
    let content2 = config2.addToOptions.slice();
    if (config2.icons)
      content2.push({
        render(completion) {
          let icon = document.createElement("div");
          icon.classList.add("cm-completionIcon");
          if (completion.type)
            icon.classList.add(...completion.type.split(/\s+/g).map((cls) => "cm-completionIcon-" + cls));
          icon.setAttribute("aria-hidden", "true");
          return icon;
        },
        position: 20
      });
    content2.push({
      render(completion, _s, match) {
        let labelElt = document.createElement("span");
        labelElt.className = "cm-completionLabel";
        let { label } = completion, off = 0;
        for (let j = 1; j < match.length; ) {
          let from = match[j++], to2 = match[j++];
          if (from > off)
            labelElt.appendChild(document.createTextNode(label.slice(off, from)));
          let span = labelElt.appendChild(document.createElement("span"));
          span.appendChild(document.createTextNode(label.slice(from, to2)));
          span.className = "cm-completionMatchedText";
          off = to2;
        }
        if (off < label.length)
          labelElt.appendChild(document.createTextNode(label.slice(off)));
        return labelElt;
      },
      position: 50
    }, {
      render(completion) {
        if (!completion.detail)
          return null;
        let detailElt = document.createElement("span");
        detailElt.className = "cm-completionDetail";
        detailElt.textContent = completion.detail;
        return detailElt;
      },
      position: 80
    });
    return content2.sort((a2, b2) => a2.position - b2.position).map((a2) => a2.render);
  }
  function rangeAroundSelected(total, selected, max2) {
    if (total <= max2)
      return { from: 0, to: total };
    if (selected <= total >> 1) {
      let off2 = Math.floor(selected / max2);
      return { from: off2 * max2, to: (off2 + 1) * max2 };
    }
    let off = Math.floor((total - selected) / max2);
    return { from: total - (off + 1) * max2, to: total - off * max2 };
  }
  var CompletionTooltip = class {
    constructor(view, stateField) {
      this.view = view;
      this.stateField = stateField;
      this.info = null;
      this.placeInfo = {
        read: () => this.measureInfo(),
        write: (pos) => this.positionInfo(pos),
        key: this
      };
      let cState = view.state.field(stateField);
      let { options, selected } = cState.open;
      let config2 = view.state.facet(completionConfig);
      this.optionContent = optionContent(config2);
      this.optionClass = config2.optionClass;
      this.range = rangeAroundSelected(options.length, selected, config2.maxRenderedOptions);
      this.dom = document.createElement("div");
      this.dom.className = "cm-tooltip-autocomplete";
      this.dom.addEventListener("mousedown", (e) => {
        for (let dom = e.target, match; dom && dom != this.dom; dom = dom.parentNode) {
          if (dom.nodeName == "LI" && (match = /-(\d+)$/.exec(dom.id)) && +match[1] < options.length) {
            applyCompletion(view, options[+match[1]]);
            e.preventDefault();
            return;
          }
        }
      });
      this.list = this.dom.appendChild(this.createListBox(options, cState.id, this.range));
      this.list.addEventListener("scroll", () => {
        if (this.info)
          this.view.requestMeasure(this.placeInfo);
      });
    }
    mount() {
      this.updateSel();
    }
    update(update3) {
      if (update3.state.field(this.stateField) != update3.startState.field(this.stateField))
        this.updateSel();
    }
    positioned() {
      if (this.info)
        this.view.requestMeasure(this.placeInfo);
    }
    updateSel() {
      let cState = this.view.state.field(this.stateField), open = cState.open;
      if (open.selected < this.range.from || open.selected >= this.range.to) {
        this.range = rangeAroundSelected(open.options.length, open.selected, this.view.state.facet(completionConfig).maxRenderedOptions);
        this.list.remove();
        this.list = this.dom.appendChild(this.createListBox(open.options, cState.id, this.range));
        this.list.addEventListener("scroll", () => {
          if (this.info)
            this.view.requestMeasure(this.placeInfo);
        });
      }
      if (this.updateSelectedOption(open.selected)) {
        if (this.info) {
          this.info.remove();
          this.info = null;
        }
        let { completion } = open.options[open.selected];
        let { info } = completion;
        if (!info)
          return;
        let infoResult = typeof info === "string" ? document.createTextNode(info) : info(completion);
        if (!infoResult)
          return;
        if ("then" in infoResult) {
          infoResult.then((node) => {
            if (node && this.view.state.field(this.stateField, false) == cState)
              this.addInfoPane(node);
          }).catch((e) => logException(this.view.state, e, "completion info"));
        } else {
          this.addInfoPane(infoResult);
        }
      }
    }
    addInfoPane(content2) {
      let dom = this.info = document.createElement("div");
      dom.className = "cm-tooltip cm-completionInfo";
      dom.appendChild(content2);
      this.dom.appendChild(dom);
      this.view.requestMeasure(this.placeInfo);
    }
    updateSelectedOption(selected) {
      let set2 = null;
      for (let opt = this.list.firstChild, i = this.range.from; opt; opt = opt.nextSibling, i++) {
        if (i == selected) {
          if (!opt.hasAttribute("aria-selected")) {
            opt.setAttribute("aria-selected", "true");
            set2 = opt;
          }
        } else {
          if (opt.hasAttribute("aria-selected"))
            opt.removeAttribute("aria-selected");
        }
      }
      if (set2)
        scrollIntoView2(this.list, set2);
      return set2;
    }
    measureInfo() {
      let sel = this.dom.querySelector("[aria-selected]");
      if (!sel || !this.info)
        return null;
      let listRect = this.dom.getBoundingClientRect();
      let infoRect = this.info.getBoundingClientRect();
      let selRect = sel.getBoundingClientRect();
      if (selRect.top > Math.min(innerHeight, listRect.bottom) - 10 || selRect.bottom < Math.max(0, listRect.top) + 10)
        return null;
      let top2 = Math.max(0, Math.min(selRect.top, innerHeight - infoRect.height)) - listRect.top;
      let left = this.view.textDirection == Direction.RTL;
      let spaceLeft = listRect.left, spaceRight = innerWidth - listRect.right;
      if (left && spaceLeft < Math.min(infoRect.width, spaceRight))
        left = false;
      else if (!left && spaceRight < Math.min(infoRect.width, spaceLeft))
        left = true;
      return { top: top2, left };
    }
    positionInfo(pos) {
      if (this.info) {
        this.info.style.top = (pos ? pos.top : -1e6) + "px";
        if (pos) {
          this.info.classList.toggle("cm-completionInfo-left", pos.left);
          this.info.classList.toggle("cm-completionInfo-right", !pos.left);
        }
      }
    }
    createListBox(options, id, range2) {
      const ul = document.createElement("ul");
      ul.id = id;
      ul.setAttribute("role", "listbox");
      ul.setAttribute("aria-expanded", "true");
      ul.setAttribute("aria-label", this.view.state.phrase("Completions"));
      for (let i = range2.from; i < range2.to; i++) {
        let { completion, match } = options[i];
        const li = ul.appendChild(document.createElement("li"));
        li.id = id + "-" + i;
        li.setAttribute("role", "option");
        let cls = this.optionClass(completion);
        if (cls)
          li.className = cls;
        for (let source of this.optionContent) {
          let node = source(completion, this.view.state, match);
          if (node)
            li.appendChild(node);
        }
      }
      if (range2.from)
        ul.classList.add("cm-completionListIncompleteTop");
      if (range2.to < options.length)
        ul.classList.add("cm-completionListIncompleteBottom");
      return ul;
    }
  };
  function completionTooltip(stateField) {
    return (view) => new CompletionTooltip(view, stateField);
  }
  function scrollIntoView2(container, element) {
    let parent = container.getBoundingClientRect();
    let self = element.getBoundingClientRect();
    if (self.top < parent.top)
      container.scrollTop -= parent.top - self.top;
    else if (self.bottom > parent.bottom)
      container.scrollTop += self.bottom - parent.bottom;
  }
  function score(option) {
    return (option.boost || 0) * 100 + (option.apply ? 10 : 0) + (option.info ? 5 : 0) + (option.type ? 1 : 0);
  }
  function sortOptions(active, state) {
    let options = [], i = 0;
    for (let a2 of active)
      if (a2.hasResult()) {
        if (a2.result.filter === false) {
          let getMatch = a2.result.getMatch;
          for (let option of a2.result.options) {
            let match = [1e9 - i++];
            if (getMatch)
              for (let n2 of getMatch(option))
                match.push(n2);
            options.push(new Option(option, a2, match));
          }
        } else {
          let matcher = new FuzzyMatcher(state.sliceDoc(a2.from, a2.to)), match;
          for (let option of a2.result.options)
            if (match = matcher.match(option.label)) {
              if (option.boost != null)
                match[0] += option.boost;
              options.push(new Option(option, a2, match));
            }
        }
      }
    let result = [], prev = null;
    for (let opt of options.sort(cmpOption)) {
      if (!prev || prev.label != opt.completion.label || prev.detail != opt.completion.detail || prev.type != null && opt.completion.type != null && prev.type != opt.completion.type || prev.apply != opt.completion.apply)
        result.push(opt);
      else if (score(opt.completion) > score(prev))
        result[result.length - 1] = opt;
      prev = opt.completion;
    }
    return result;
  }
  var CompletionDialog = class {
    constructor(options, attrs, tooltip, timestamp, selected) {
      this.options = options;
      this.attrs = attrs;
      this.tooltip = tooltip;
      this.timestamp = timestamp;
      this.selected = selected;
    }
    setSelected(selected, id) {
      return selected == this.selected || selected >= this.options.length ? this : new CompletionDialog(this.options, makeAttrs(id, selected), this.tooltip, this.timestamp, selected);
    }
    static build(active, state, id, prev, conf) {
      let options = sortOptions(active, state);
      if (!options.length)
        return null;
      let selected = 0;
      if (prev && prev.selected) {
        let selectedValue = prev.options[prev.selected].completion;
        for (let i = 0; i < options.length; i++)
          if (options[i].completion == selectedValue) {
            selected = i;
            break;
          }
      }
      return new CompletionDialog(options, makeAttrs(id, selected), {
        pos: active.reduce((a2, b2) => b2.hasResult() ? Math.min(a2, b2.from) : a2, 1e8),
        create: completionTooltip(completionState),
        above: conf.aboveCursor
      }, prev ? prev.timestamp : Date.now(), selected);
    }
    map(changes) {
      return new CompletionDialog(this.options, this.attrs, Object.assign(Object.assign({}, this.tooltip), { pos: changes.mapPos(this.tooltip.pos) }), this.timestamp, this.selected);
    }
  };
  var CompletionState = class {
    constructor(active, id, open) {
      this.active = active;
      this.id = id;
      this.open = open;
    }
    static start() {
      return new CompletionState(none3, "cm-ac-" + Math.floor(Math.random() * 2e6).toString(36), null);
    }
    update(tr) {
      let { state } = tr, conf = state.facet(completionConfig);
      let sources = conf.override || state.languageDataAt("autocomplete", cur(state)).map(asSource);
      let active = sources.map((source) => {
        let value2 = this.active.find((s) => s.source == source) || new ActiveSource(source, this.active.some((a2) => a2.state != 0) ? 1 : 0);
        return value2.update(tr, conf);
      });
      if (active.length == this.active.length && active.every((a2, i) => a2 == this.active[i]))
        active = this.active;
      let open = tr.selection || active.some((a2) => a2.hasResult() && tr.changes.touchesRange(a2.from, a2.to)) || !sameResults(active, this.active) ? CompletionDialog.build(active, state, this.id, this.open, conf) : this.open && tr.docChanged ? this.open.map(tr.changes) : this.open;
      if (!open && active.every((a2) => a2.state != 1) && active.some((a2) => a2.hasResult()))
        active = active.map((a2) => a2.hasResult() ? new ActiveSource(a2.source, 0) : a2);
      for (let effect of tr.effects)
        if (effect.is(setSelectedEffect))
          open = open && open.setSelected(effect.value, this.id);
      return active == this.active && open == this.open ? this : new CompletionState(active, this.id, open);
    }
    get tooltip() {
      return this.open ? this.open.tooltip : null;
    }
    get attrs() {
      return this.open ? this.open.attrs : baseAttrs;
    }
  };
  function sameResults(a2, b2) {
    if (a2 == b2)
      return true;
    for (let iA = 0, iB = 0; ; ) {
      while (iA < a2.length && !a2[iA].hasResult)
        iA++;
      while (iB < b2.length && !b2[iB].hasResult)
        iB++;
      let endA = iA == a2.length, endB = iB == b2.length;
      if (endA || endB)
        return endA == endB;
      if (a2[iA++].result != b2[iB++].result)
        return false;
    }
  }
  var baseAttrs = {
    "aria-autocomplete": "list"
  };
  function makeAttrs(id, selected) {
    return {
      "aria-autocomplete": "list",
      "aria-haspopup": "listbox",
      "aria-activedescendant": id + "-" + selected,
      "aria-controls": id
    };
  }
  var none3 = [];
  function cmpOption(a2, b2) {
    let dScore = b2.match[0] - a2.match[0];
    if (dScore)
      return dScore;
    return a2.completion.label.localeCompare(b2.completion.label);
  }
  function getUserEvent(tr) {
    return tr.isUserEvent("input.type") ? "input" : tr.isUserEvent("delete.backward") ? "delete" : null;
  }
  var ActiveSource = class {
    constructor(source, state, explicitPos = -1) {
      this.source = source;
      this.state = state;
      this.explicitPos = explicitPos;
    }
    hasResult() {
      return false;
    }
    update(tr, conf) {
      let event = getUserEvent(tr), value2 = this;
      if (event)
        value2 = value2.handleUserEvent(tr, event, conf);
      else if (tr.docChanged)
        value2 = value2.handleChange(tr);
      else if (tr.selection && value2.state != 0)
        value2 = new ActiveSource(value2.source, 0);
      for (let effect of tr.effects) {
        if (effect.is(startCompletionEffect))
          value2 = new ActiveSource(value2.source, 1, effect.value ? cur(tr.state) : -1);
        else if (effect.is(closeCompletionEffect))
          value2 = new ActiveSource(value2.source, 0);
        else if (effect.is(setActiveEffect)) {
          for (let active of effect.value)
            if (active.source == value2.source)
              value2 = active;
        }
      }
      return value2;
    }
    handleUserEvent(tr, type2, conf) {
      return type2 == "delete" || !conf.activateOnTyping ? this.map(tr.changes) : new ActiveSource(this.source, 1);
    }
    handleChange(tr) {
      return tr.changes.touchesRange(cur(tr.startState)) ? new ActiveSource(this.source, 0) : this.map(tr.changes);
    }
    map(changes) {
      return changes.empty || this.explicitPos < 0 ? this : new ActiveSource(this.source, this.state, changes.mapPos(this.explicitPos));
    }
  };
  var ActiveResult = class extends ActiveSource {
    constructor(source, explicitPos, result, from, to2) {
      super(source, 2, explicitPos);
      this.result = result;
      this.from = from;
      this.to = to2;
    }
    hasResult() {
      return true;
    }
    handleUserEvent(tr, type2, conf) {
      var _a2;
      let from = tr.changes.mapPos(this.from), to2 = tr.changes.mapPos(this.to, 1);
      let pos = cur(tr.state);
      if ((this.explicitPos < 0 ? pos <= from : pos < this.from) || pos > to2 || type2 == "delete" && cur(tr.startState) == this.from)
        return new ActiveSource(this.source, type2 == "input" && conf.activateOnTyping ? 1 : 0);
      let explicitPos = this.explicitPos < 0 ? -1 : tr.changes.mapPos(this.explicitPos), updated;
      if (checkValid(this.result.validFor, tr.state, from, to2))
        return new ActiveResult(this.source, explicitPos, this.result, from, to2);
      if (this.result.update && (updated = this.result.update(this.result, from, to2, new CompletionContext(tr.state, pos, explicitPos >= 0))))
        return new ActiveResult(this.source, explicitPos, updated, updated.from, (_a2 = updated.to) !== null && _a2 !== void 0 ? _a2 : cur(tr.state));
      return new ActiveSource(this.source, 1, explicitPos);
    }
    handleChange(tr) {
      return tr.changes.touchesRange(this.from, this.to) ? new ActiveSource(this.source, 0) : this.map(tr.changes);
    }
    map(mapping) {
      return mapping.empty ? this : new ActiveResult(this.source, this.explicitPos < 0 ? -1 : mapping.mapPos(this.explicitPos), this.result, mapping.mapPos(this.from), mapping.mapPos(this.to, 1));
    }
  };
  function checkValid(validFor, state, from, to2) {
    if (!validFor)
      return false;
    let text = state.sliceDoc(from, to2);
    return typeof validFor == "function" ? validFor(text, from, to2, state) : ensureAnchor(validFor, true).test(text);
  }
  var startCompletionEffect = /* @__PURE__ */ StateEffect.define();
  var closeCompletionEffect = /* @__PURE__ */ StateEffect.define();
  var setActiveEffect = /* @__PURE__ */ StateEffect.define({
    map(sources, mapping) {
      return sources.map((s) => s.map(mapping));
    }
  });
  var setSelectedEffect = /* @__PURE__ */ StateEffect.define();
  var completionState = /* @__PURE__ */ StateField.define({
    create() {
      return CompletionState.start();
    },
    update(value2, tr) {
      return value2.update(tr);
    },
    provide: (f) => [
      showTooltip.from(f, (val) => val.tooltip),
      EditorView.contentAttributes.from(f, (state) => state.attrs)
    ]
  });
  var CompletionInteractMargin = 75;
  function moveCompletionSelection(forward, by = "option") {
    return (view) => {
      let cState = view.state.field(completionState, false);
      if (!cState || !cState.open || Date.now() - cState.open.timestamp < CompletionInteractMargin)
        return false;
      let step = 1, tooltip;
      if (by == "page" && (tooltip = getTooltip(view, cState.open.tooltip)))
        step = Math.max(2, Math.floor(tooltip.dom.offsetHeight / tooltip.dom.querySelector("li").offsetHeight) - 1);
      let selected = cState.open.selected + step * (forward ? 1 : -1), { length } = cState.open.options;
      if (selected < 0)
        selected = by == "page" ? 0 : length - 1;
      else if (selected >= length)
        selected = by == "page" ? length - 1 : 0;
      view.dispatch({ effects: setSelectedEffect.of(selected) });
      return true;
    };
  }
  var acceptCompletion = (view) => {
    let cState = view.state.field(completionState, false);
    if (view.state.readOnly || !cState || !cState.open || Date.now() - cState.open.timestamp < CompletionInteractMargin)
      return false;
    applyCompletion(view, cState.open.options[cState.open.selected]);
    return true;
  };
  var startCompletion = (view) => {
    let cState = view.state.field(completionState, false);
    if (!cState)
      return false;
    view.dispatch({ effects: startCompletionEffect.of(true) });
    return true;
  };
  var closeCompletion = (view) => {
    let cState = view.state.field(completionState, false);
    if (!cState || !cState.active.some((a2) => a2.state != 0))
      return false;
    view.dispatch({ effects: closeCompletionEffect.of(null) });
    return true;
  };
  var RunningQuery = class {
    constructor(active, context2) {
      this.active = active;
      this.context = context2;
      this.time = Date.now();
      this.updates = [];
      this.done = void 0;
    }
  };
  var DebounceTime = 50;
  var MaxUpdateCount = 50;
  var MinAbortTime = 1e3;
  var completionPlugin = /* @__PURE__ */ ViewPlugin.fromClass(class {
    constructor(view) {
      this.view = view;
      this.debounceUpdate = -1;
      this.running = [];
      this.debounceAccept = -1;
      this.composing = 0;
      for (let active of view.state.field(completionState).active)
        if (active.state == 1)
          this.startQuery(active);
    }
    update(update3) {
      let cState = update3.state.field(completionState);
      if (!update3.selectionSet && !update3.docChanged && update3.startState.field(completionState) == cState)
        return;
      let doesReset = update3.transactions.some((tr) => {
        return (tr.selection || tr.docChanged) && !getUserEvent(tr);
      });
      for (let i = 0; i < this.running.length; i++) {
        let query = this.running[i];
        if (doesReset || query.updates.length + update3.transactions.length > MaxUpdateCount && Date.now() - query.time > MinAbortTime) {
          for (let handler of query.context.abortListeners) {
            try {
              handler();
            } catch (e) {
              logException(this.view.state, e);
            }
          }
          query.context.abortListeners = null;
          this.running.splice(i--, 1);
        } else {
          query.updates.push(...update3.transactions);
        }
      }
      if (this.debounceUpdate > -1)
        clearTimeout(this.debounceUpdate);
      this.debounceUpdate = cState.active.some((a2) => a2.state == 1 && !this.running.some((q) => q.active.source == a2.source)) ? setTimeout(() => this.startUpdate(), DebounceTime) : -1;
      if (this.composing != 0)
        for (let tr of update3.transactions) {
          if (getUserEvent(tr) == "input")
            this.composing = 2;
          else if (this.composing == 2 && tr.selection)
            this.composing = 3;
        }
    }
    startUpdate() {
      this.debounceUpdate = -1;
      let { state } = this.view, cState = state.field(completionState);
      for (let active of cState.active) {
        if (active.state == 1 && !this.running.some((r) => r.active.source == active.source))
          this.startQuery(active);
      }
    }
    startQuery(active) {
      let { state } = this.view, pos = cur(state);
      let context2 = new CompletionContext(state, pos, active.explicitPos == pos);
      let pending = new RunningQuery(active, context2);
      this.running.push(pending);
      Promise.resolve(active.source(context2)).then((result) => {
        if (!pending.context.aborted) {
          pending.done = result || null;
          this.scheduleAccept();
        }
      }, (err) => {
        this.view.dispatch({ effects: closeCompletionEffect.of(null) });
        logException(this.view.state, err);
      });
    }
    scheduleAccept() {
      if (this.running.every((q) => q.done !== void 0))
        this.accept();
      else if (this.debounceAccept < 0)
        this.debounceAccept = setTimeout(() => this.accept(), DebounceTime);
    }
    accept() {
      var _a2;
      if (this.debounceAccept > -1)
        clearTimeout(this.debounceAccept);
      this.debounceAccept = -1;
      let updated = [];
      let conf = this.view.state.facet(completionConfig);
      for (let i = 0; i < this.running.length; i++) {
        let query = this.running[i];
        if (query.done === void 0)
          continue;
        this.running.splice(i--, 1);
        if (query.done) {
          let active = new ActiveResult(query.active.source, query.active.explicitPos, query.done, query.done.from, (_a2 = query.done.to) !== null && _a2 !== void 0 ? _a2 : cur(query.updates.length ? query.updates[0].startState : this.view.state));
          for (let tr of query.updates)
            active = active.update(tr, conf);
          if (active.hasResult()) {
            updated.push(active);
            continue;
          }
        }
        let current = this.view.state.field(completionState).active.find((a2) => a2.source == query.active.source);
        if (current && current.state == 1) {
          if (query.done == null) {
            let active = new ActiveSource(query.active.source, 0);
            for (let tr of query.updates)
              active = active.update(tr, conf);
            if (active.state != 1)
              updated.push(active);
          } else {
            this.startQuery(current);
          }
        }
      }
      if (updated.length)
        this.view.dispatch({ effects: setActiveEffect.of(updated) });
    }
  }, {
    eventHandlers: {
      blur() {
        let state = this.view.state.field(completionState, false);
        if (state && state.tooltip && this.view.state.facet(completionConfig).closeOnBlur)
          this.view.dispatch({ effects: closeCompletionEffect.of(null) });
      },
      compositionstart() {
        this.composing = 1;
      },
      compositionend() {
        if (this.composing == 3) {
          setTimeout(() => this.view.dispatch({ effects: startCompletionEffect.of(false) }), 20);
        }
        this.composing = 0;
      }
    }
  });
  var baseTheme4 = /* @__PURE__ */ EditorView.baseTheme({
    ".cm-tooltip.cm-tooltip-autocomplete": {
      "& > ul": {
        fontFamily: "monospace",
        whiteSpace: "nowrap",
        overflow: "hidden auto",
        maxWidth_fallback: "700px",
        maxWidth: "min(700px, 95vw)",
        minWidth: "250px",
        maxHeight: "10em",
        listStyle: "none",
        margin: 0,
        padding: 0,
        "& > li": {
          overflowX: "hidden",
          textOverflow: "ellipsis",
          cursor: "pointer",
          padding: "1px 3px",
          lineHeight: 1.2
        }
      }
    },
    "&light .cm-tooltip-autocomplete ul li[aria-selected]": {
      background: "#17c",
      color: "white"
    },
    "&dark .cm-tooltip-autocomplete ul li[aria-selected]": {
      background: "#347",
      color: "white"
    },
    ".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after": {
      content: '"\xB7\xB7\xB7"',
      opacity: 0.5,
      display: "block",
      textAlign: "center"
    },
    ".cm-tooltip.cm-completionInfo": {
      position: "absolute",
      padding: "3px 9px",
      width: "max-content",
      maxWidth: "300px"
    },
    ".cm-completionInfo.cm-completionInfo-left": { right: "100%" },
    ".cm-completionInfo.cm-completionInfo-right": { left: "100%" },
    "&light .cm-snippetField": { backgroundColor: "#00000022" },
    "&dark .cm-snippetField": { backgroundColor: "#ffffff22" },
    ".cm-snippetFieldPosition": {
      verticalAlign: "text-top",
      width: 0,
      height: "1.15em",
      margin: "0 -0.7px -.7em",
      borderLeft: "1.4px dotted #888"
    },
    ".cm-completionMatchedText": {
      textDecoration: "underline"
    },
    ".cm-completionDetail": {
      marginLeft: "0.5em",
      fontStyle: "italic"
    },
    ".cm-completionIcon": {
      fontSize: "90%",
      width: ".8em",
      display: "inline-block",
      textAlign: "center",
      paddingRight: ".6em",
      opacity: "0.6"
    },
    ".cm-completionIcon-function, .cm-completionIcon-method": {
      "&:after": { content: "'\u0192'" }
    },
    ".cm-completionIcon-class": {
      "&:after": { content: "'\u25CB'" }
    },
    ".cm-completionIcon-interface": {
      "&:after": { content: "'\u25CC'" }
    },
    ".cm-completionIcon-variable": {
      "&:after": { content: "'\u{1D465}'" }
    },
    ".cm-completionIcon-constant": {
      "&:after": { content: "'\u{1D436}'" }
    },
    ".cm-completionIcon-type": {
      "&:after": { content: "'\u{1D461}'" }
    },
    ".cm-completionIcon-enum": {
      "&:after": { content: "'\u222A'" }
    },
    ".cm-completionIcon-property": {
      "&:after": { content: "'\u25A1'" }
    },
    ".cm-completionIcon-keyword": {
      "&:after": { content: "'\u{1F511}\uFE0E'" }
    },
    ".cm-completionIcon-namespace": {
      "&:after": { content: "'\u25A2'" }
    },
    ".cm-completionIcon-text": {
      "&:after": { content: "'abc'", fontSize: "50%", verticalAlign: "middle" }
    }
  });
  var defaults2 = {
    brackets: ["(", "[", "{", "'", '"'],
    before: ")]}:;>"
  };
  var closeBracketEffect = /* @__PURE__ */ StateEffect.define({
    map(value2, mapping) {
      let mapped = mapping.mapPos(value2, -1, MapMode.TrackAfter);
      return mapped == null ? void 0 : mapped;
    }
  });
  var skipBracketEffect = /* @__PURE__ */ StateEffect.define({
    map(value2, mapping) {
      return mapping.mapPos(value2);
    }
  });
  var closedBracket = /* @__PURE__ */ new class extends RangeValue {
  }();
  closedBracket.startSide = 1;
  closedBracket.endSide = -1;
  var bracketState = /* @__PURE__ */ StateField.define({
    create() {
      return RangeSet.empty;
    },
    update(value2, tr) {
      if (tr.selection) {
        let lineStart = tr.state.doc.lineAt(tr.selection.main.head).from;
        let prevLineStart = tr.startState.doc.lineAt(tr.startState.selection.main.head).from;
        if (lineStart != tr.changes.mapPos(prevLineStart, -1))
          value2 = RangeSet.empty;
      }
      value2 = value2.map(tr.changes);
      for (let effect of tr.effects) {
        if (effect.is(closeBracketEffect))
          value2 = value2.update({ add: [closedBracket.range(effect.value, effect.value + 1)] });
        else if (effect.is(skipBracketEffect))
          value2 = value2.update({ filter: (from) => from != effect.value });
      }
      return value2;
    }
  });
  function closeBrackets() {
    return [inputHandler2, bracketState];
  }
  var definedClosing = "()[]{}<>";
  function closing(ch) {
    for (let i = 0; i < definedClosing.length; i += 2)
      if (definedClosing.charCodeAt(i) == ch)
        return definedClosing.charAt(i + 1);
    return fromCodePoint(ch < 128 ? ch : ch + 1);
  }
  function config(state, pos) {
    return state.languageDataAt("closeBrackets", pos)[0] || defaults2;
  }
  var android = typeof navigator == "object" && /* @__PURE__ */ /Android\b/.test(navigator.userAgent);
  var inputHandler2 = /* @__PURE__ */ EditorView.inputHandler.of((view, from, to2, insert2) => {
    if ((android ? view.composing : view.compositionStarted) || view.state.readOnly)
      return false;
    let sel = view.state.selection.main;
    if (insert2.length > 2 || insert2.length == 2 && codePointSize(codePointAt(insert2, 0)) == 1 || from != sel.from || to2 != sel.to)
      return false;
    let tr = insertBracket(view.state, insert2);
    if (!tr)
      return false;
    view.dispatch(tr);
    return true;
  });
  var deleteBracketPair = ({ state, dispatch }) => {
    if (state.readOnly)
      return false;
    let conf = config(state, state.selection.main.head);
    let tokens = conf.brackets || defaults2.brackets;
    let dont = null, changes = state.changeByRange((range2) => {
      if (range2.empty) {
        let before = prevChar(state.doc, range2.head);
        for (let token of tokens) {
          if (token == before && nextChar(state.doc, range2.head) == closing(codePointAt(token, 0)))
            return {
              changes: { from: range2.head - token.length, to: range2.head + token.length },
              range: EditorSelection.cursor(range2.head - token.length),
              userEvent: "delete.backward"
            };
        }
      }
      return { range: dont = range2 };
    });
    if (!dont)
      dispatch(state.update(changes, { scrollIntoView: true }));
    return !dont;
  };
  var closeBracketsKeymap = [
    { key: "Backspace", run: deleteBracketPair }
  ];
  function insertBracket(state, bracket2) {
    let conf = config(state, state.selection.main.head);
    let tokens = conf.brackets || defaults2.brackets;
    for (let tok of tokens) {
      let closed = closing(codePointAt(tok, 0));
      if (bracket2 == tok)
        return closed == tok ? handleSame(state, tok, tokens.indexOf(tok + tok + tok) > -1) : handleOpen(state, tok, closed, conf.before || defaults2.before);
      if (bracket2 == closed && closedBracketAt(state, state.selection.main.from))
        return handleClose(state, tok, closed);
    }
    return null;
  }
  function closedBracketAt(state, pos) {
    let found = false;
    state.field(bracketState).between(0, state.doc.length, (from) => {
      if (from == pos)
        found = true;
    });
    return found;
  }
  function nextChar(doc2, pos) {
    let next = doc2.sliceString(pos, pos + 2);
    return next.slice(0, codePointSize(codePointAt(next, 0)));
  }
  function prevChar(doc2, pos) {
    let prev = doc2.sliceString(pos - 2, pos);
    return codePointSize(codePointAt(prev, 0)) == prev.length ? prev : prev.slice(1);
  }
  function handleOpen(state, open, close, closeBefore) {
    let dont = null, changes = state.changeByRange((range2) => {
      if (!range2.empty)
        return {
          changes: [{ insert: open, from: range2.from }, { insert: close, from: range2.to }],
          effects: closeBracketEffect.of(range2.to + open.length),
          range: EditorSelection.range(range2.anchor + open.length, range2.head + open.length)
        };
      let next = nextChar(state.doc, range2.head);
      if (!next || /\s/.test(next) || closeBefore.indexOf(next) > -1)
        return {
          changes: { insert: open + close, from: range2.head },
          effects: closeBracketEffect.of(range2.head + open.length),
          range: EditorSelection.cursor(range2.head + open.length)
        };
      return { range: dont = range2 };
    });
    return dont ? null : state.update(changes, {
      scrollIntoView: true,
      userEvent: "input.type"
    });
  }
  function handleClose(state, _open, close) {
    let dont = null, moved = state.selection.ranges.map((range2) => {
      if (range2.empty && nextChar(state.doc, range2.head) == close)
        return EditorSelection.cursor(range2.head + close.length);
      return dont = range2;
    });
    return dont ? null : state.update({
      selection: EditorSelection.create(moved, state.selection.mainIndex),
      scrollIntoView: true,
      effects: state.selection.ranges.map(({ from }) => skipBracketEffect.of(from))
    });
  }
  function handleSame(state, token, allowTriple) {
    let dont = null, changes = state.changeByRange((range2) => {
      if (!range2.empty)
        return {
          changes: [{ insert: token, from: range2.from }, { insert: token, from: range2.to }],
          effects: closeBracketEffect.of(range2.to + token.length),
          range: EditorSelection.range(range2.anchor + token.length, range2.head + token.length)
        };
      let pos = range2.head, next = nextChar(state.doc, pos);
      if (next == token) {
        if (nodeStart(state, pos)) {
          return {
            changes: { insert: token + token, from: pos },
            effects: closeBracketEffect.of(pos + token.length),
            range: EditorSelection.cursor(pos + token.length)
          };
        } else if (closedBracketAt(state, pos)) {
          let isTriple = allowTriple && state.sliceDoc(pos, pos + token.length * 3) == token + token + token;
          return {
            range: EditorSelection.cursor(pos + token.length * (isTriple ? 3 : 1)),
            effects: skipBracketEffect.of(pos)
          };
        }
      } else if (allowTriple && state.sliceDoc(pos - 2 * token.length, pos) == token + token && nodeStart(state, pos - 2 * token.length)) {
        return {
          changes: { insert: token + token + token + token, from: pos },
          effects: closeBracketEffect.of(pos + token.length),
          range: EditorSelection.cursor(pos + token.length)
        };
      } else if (state.charCategorizer(pos)(next) != CharCategory.Word) {
        let prev = state.sliceDoc(pos - 1, pos);
        if (prev != token && state.charCategorizer(pos)(prev) != CharCategory.Word && !probablyInString(state, pos, token))
          return {
            changes: { insert: token + token, from: pos },
            effects: closeBracketEffect.of(pos + token.length),
            range: EditorSelection.cursor(pos + token.length)
          };
      }
      return { range: dont = range2 };
    });
    return dont ? null : state.update(changes, {
      scrollIntoView: true,
      userEvent: "input.type"
    });
  }
  function nodeStart(state, pos) {
    let tree = syntaxTree(state).resolveInner(pos + 1);
    return tree.parent && tree.from == pos;
  }
  function probablyInString(state, pos, quoteToken) {
    let node = syntaxTree(state).resolveInner(pos, -1);
    for (let i = 0; i < 5; i++) {
      if (state.sliceDoc(node.from, node.from + quoteToken.length) == quoteToken)
        return true;
      let parent = node.to == pos && node.parent;
      if (!parent)
        break;
      node = parent;
    }
    return false;
  }
  function autocompletion(config2 = {}) {
    return [
      completionState,
      completionConfig.of(config2),
      completionPlugin,
      completionKeymapExt,
      baseTheme4
    ];
  }
  var completionKeymap = [
    { key: "Ctrl-Space", run: startCompletion },
    { key: "Escape", run: closeCompletion },
    { key: "ArrowDown", run: /* @__PURE__ */ moveCompletionSelection(true) },
    { key: "ArrowUp", run: /* @__PURE__ */ moveCompletionSelection(false) },
    { key: "PageDown", run: /* @__PURE__ */ moveCompletionSelection(true, "page") },
    { key: "PageUp", run: /* @__PURE__ */ moveCompletionSelection(false, "page") },
    { key: "Enter", run: acceptCompletion }
  ];
  var completionKeymapExt = /* @__PURE__ */ Prec.highest(/* @__PURE__ */ keymap.computeN([completionConfig], (state) => state.facet(completionConfig).defaultKeymap ? [completionKeymap] : []));

  // node_modules/@codemirror/lint/dist/index.js
  var SelectedDiagnostic = class {
    constructor(from, to2, diagnostic) {
      this.from = from;
      this.to = to2;
      this.diagnostic = diagnostic;
    }
  };
  var LintState = class {
    constructor(diagnostics, panel, selected) {
      this.diagnostics = diagnostics;
      this.panel = panel;
      this.selected = selected;
    }
    static init(diagnostics, panel, state) {
      let markedDiagnostics = diagnostics;
      let diagnosticFilter = state.facet(lintConfig).markerFilter;
      if (diagnosticFilter)
        markedDiagnostics = diagnosticFilter(markedDiagnostics);
      let ranges = Decoration.set(markedDiagnostics.map((d2) => {
        return d2.from == d2.to || d2.from == d2.to - 1 && state.doc.lineAt(d2.from).to == d2.from ? Decoration.widget({
          widget: new DiagnosticWidget(d2),
          diagnostic: d2
        }).range(d2.from) : Decoration.mark({
          attributes: { class: "cm-lintRange cm-lintRange-" + d2.severity },
          diagnostic: d2
        }).range(d2.from, d2.to);
      }), true);
      return new LintState(ranges, panel, findDiagnostic(ranges));
    }
  };
  function findDiagnostic(diagnostics, diagnostic = null, after = 0) {
    let found = null;
    diagnostics.between(after, 1e9, (from, to2, { spec }) => {
      if (diagnostic && spec.diagnostic != diagnostic)
        return;
      found = new SelectedDiagnostic(from, to2, spec.diagnostic);
      return false;
    });
    return found;
  }
  function hideTooltip(tr, tooltip) {
    return !!(tr.effects.some((e) => e.is(setDiagnosticsEffect)) || tr.changes.touchesRange(tooltip.pos));
  }
  function maybeEnableLint(state, effects) {
    return state.field(lintState, false) ? effects : effects.concat(StateEffect.appendConfig.of([
      lintState,
      EditorView.decorations.compute([lintState], (state2) => {
        let { selected, panel } = state2.field(lintState);
        return !selected || !panel || selected.from == selected.to ? Decoration.none : Decoration.set([
          activeMark.range(selected.from, selected.to)
        ]);
      }),
      hoverTooltip(lintTooltip, { hideOn: hideTooltip }),
      baseTheme5
    ]));
  }
  function setDiagnostics(state, diagnostics) {
    return {
      effects: maybeEnableLint(state, [setDiagnosticsEffect.of(diagnostics)])
    };
  }
  var setDiagnosticsEffect = /* @__PURE__ */ StateEffect.define();
  var togglePanel2 = /* @__PURE__ */ StateEffect.define();
  var movePanelSelection = /* @__PURE__ */ StateEffect.define();
  var lintState = /* @__PURE__ */ StateField.define({
    create() {
      return new LintState(Decoration.none, null, null);
    },
    update(value2, tr) {
      if (tr.docChanged) {
        let mapped = value2.diagnostics.map(tr.changes), selected = null;
        if (value2.selected) {
          let selPos = tr.changes.mapPos(value2.selected.from, 1);
          selected = findDiagnostic(mapped, value2.selected.diagnostic, selPos) || findDiagnostic(mapped, null, selPos);
        }
        value2 = new LintState(mapped, value2.panel, selected);
      }
      for (let effect of tr.effects) {
        if (effect.is(setDiagnosticsEffect)) {
          value2 = LintState.init(effect.value, value2.panel, tr.state);
        } else if (effect.is(togglePanel2)) {
          value2 = new LintState(value2.diagnostics, effect.value ? LintPanel.open : null, value2.selected);
        } else if (effect.is(movePanelSelection)) {
          value2 = new LintState(value2.diagnostics, value2.panel, effect.value);
        }
      }
      return value2;
    },
    provide: (f) => [
      showPanel.from(f, (val) => val.panel),
      EditorView.decorations.from(f, (s) => s.diagnostics)
    ]
  });
  var activeMark = /* @__PURE__ */ Decoration.mark({ class: "cm-lintRange cm-lintRange-active" });
  function lintTooltip(view, pos, side) {
    let { diagnostics } = view.state.field(lintState);
    let found = [], stackStart = 2e8, stackEnd = 0;
    diagnostics.between(pos - (side < 0 ? 1 : 0), pos + (side > 0 ? 1 : 0), (from, to2, { spec }) => {
      if (pos >= from && pos <= to2 && (from == to2 || (pos > from || side > 0) && (pos < to2 || side < 0))) {
        found.push(spec.diagnostic);
        stackStart = Math.min(from, stackStart);
        stackEnd = Math.max(to2, stackEnd);
      }
    });
    let diagnosticFilter = view.state.facet(lintConfig).tooltipFilter;
    if (diagnosticFilter)
      found = diagnosticFilter(found);
    if (!found.length)
      return null;
    return {
      pos: stackStart,
      end: stackEnd,
      above: view.state.doc.lineAt(stackStart).to < stackEnd,
      create() {
        return { dom: diagnosticsTooltip(view, found) };
      }
    };
  }
  function diagnosticsTooltip(view, diagnostics) {
    return crelt("ul", { class: "cm-tooltip-lint" }, diagnostics.map((d2) => renderDiagnostic(view, d2, false)));
  }
  var openLintPanel = (view) => {
    let field = view.state.field(lintState, false);
    if (!field || !field.panel)
      view.dispatch({ effects: maybeEnableLint(view.state, [togglePanel2.of(true)]) });
    let panel = getPanel(view, LintPanel.open);
    if (panel)
      panel.dom.querySelector(".cm-panel-lint ul").focus();
    return true;
  };
  var closeLintPanel = (view) => {
    let field = view.state.field(lintState, false);
    if (!field || !field.panel)
      return false;
    view.dispatch({ effects: togglePanel2.of(false) });
    return true;
  };
  var nextDiagnostic = (view) => {
    let field = view.state.field(lintState, false);
    if (!field)
      return false;
    let sel = view.state.selection.main, next = field.diagnostics.iter(sel.to + 1);
    if (!next.value) {
      next = field.diagnostics.iter(0);
      if (!next.value || next.from == sel.from && next.to == sel.to)
        return false;
    }
    view.dispatch({ selection: { anchor: next.from, head: next.to }, scrollIntoView: true });
    return true;
  };
  var lintKeymap = [
    { key: "Mod-Shift-m", run: openLintPanel },
    { key: "F8", run: nextDiagnostic }
  ];
  var lintPlugin = /* @__PURE__ */ ViewPlugin.fromClass(class {
    constructor(view) {
      this.view = view;
      this.timeout = -1;
      this.set = true;
      let { delay: delay3 } = view.state.facet(lintConfig);
      this.lintTime = Date.now() + delay3;
      this.run = this.run.bind(this);
      this.timeout = setTimeout(this.run, delay3);
    }
    run() {
      let now = Date.now();
      if (now < this.lintTime - 10) {
        setTimeout(this.run, this.lintTime - now);
      } else {
        this.set = false;
        let { state } = this.view, { sources } = state.facet(lintConfig);
        Promise.all(sources.map((source) => Promise.resolve(source(this.view)))).then((annotations) => {
          let all = annotations.reduce((a2, b2) => a2.concat(b2));
          if (this.view.state.doc == state.doc)
            this.view.dispatch(setDiagnostics(this.view.state, all));
        }, (error) => {
          logException(this.view.state, error);
        });
      }
    }
    update(update3) {
      let config2 = update3.state.facet(lintConfig);
      if (update3.docChanged || config2 != update3.startState.facet(lintConfig)) {
        this.lintTime = Date.now() + config2.delay;
        if (!this.set) {
          this.set = true;
          this.timeout = setTimeout(this.run, config2.delay);
        }
      }
    }
    force() {
      if (this.set) {
        this.lintTime = Date.now();
        this.run();
      }
    }
    destroy() {
      clearTimeout(this.timeout);
    }
  });
  var lintConfig = /* @__PURE__ */ Facet.define({
    combine(input) {
      return Object.assign({ sources: input.map((i) => i.source) }, combineConfig(input.map((i) => i.config), {
        delay: 750,
        markerFilter: null,
        tooltipFilter: null
      }));
    },
    enables: lintPlugin
  });
  function assignKeys(actions) {
    let assigned = [];
    if (actions)
      actions:
        for (let { name: name2 } of actions) {
          for (let i = 0; i < name2.length; i++) {
            let ch = name2[i];
            if (/[a-zA-Z]/.test(ch) && !assigned.some((c4) => c4.toLowerCase() == ch.toLowerCase())) {
              assigned.push(ch);
              continue actions;
            }
          }
          assigned.push("");
        }
    return assigned;
  }
  function renderDiagnostic(view, diagnostic, inPanel) {
    var _a2;
    let keys2 = inPanel ? assignKeys(diagnostic.actions) : [];
    return crelt("li", { class: "cm-diagnostic cm-diagnostic-" + diagnostic.severity }, crelt("span", { class: "cm-diagnosticText" }, diagnostic.renderMessage ? diagnostic.renderMessage() : diagnostic.message), (_a2 = diagnostic.actions) === null || _a2 === void 0 ? void 0 : _a2.map((action, i) => {
      let click = (e) => {
        e.preventDefault();
        let found = findDiagnostic(view.state.field(lintState).diagnostics, diagnostic);
        if (found)
          action.apply(view, found.from, found.to);
      };
      let { name: name2 } = action, keyIndex = keys2[i] ? name2.indexOf(keys2[i]) : -1;
      let nameElt = keyIndex < 0 ? name2 : [
        name2.slice(0, keyIndex),
        crelt("u", name2.slice(keyIndex, keyIndex + 1)),
        name2.slice(keyIndex + 1)
      ];
      return crelt("button", {
        type: "button",
        class: "cm-diagnosticAction",
        onclick: click,
        onmousedown: click,
        "aria-label": ` Action: ${name2}${keyIndex < 0 ? "" : ` (access key "${keys2[i]})"`}.`
      }, nameElt);
    }), diagnostic.source && crelt("div", { class: "cm-diagnosticSource" }, diagnostic.source));
  }
  var DiagnosticWidget = class extends WidgetType {
    constructor(diagnostic) {
      super();
      this.diagnostic = diagnostic;
    }
    eq(other) {
      return other.diagnostic == this.diagnostic;
    }
    toDOM() {
      return crelt("span", { class: "cm-lintPoint cm-lintPoint-" + this.diagnostic.severity });
    }
  };
  var PanelItem = class {
    constructor(view, diagnostic) {
      this.diagnostic = diagnostic;
      this.id = "item_" + Math.floor(Math.random() * 4294967295).toString(16);
      this.dom = renderDiagnostic(view, diagnostic, true);
      this.dom.id = this.id;
      this.dom.setAttribute("role", "option");
    }
  };
  var LintPanel = class {
    constructor(view) {
      this.view = view;
      this.items = [];
      let onkeydown = (event) => {
        if (event.keyCode == 27) {
          closeLintPanel(this.view);
          this.view.focus();
        } else if (event.keyCode == 38 || event.keyCode == 33) {
          this.moveSelection((this.selectedIndex - 1 + this.items.length) % this.items.length);
        } else if (event.keyCode == 40 || event.keyCode == 34) {
          this.moveSelection((this.selectedIndex + 1) % this.items.length);
        } else if (event.keyCode == 36) {
          this.moveSelection(0);
        } else if (event.keyCode == 35) {
          this.moveSelection(this.items.length - 1);
        } else if (event.keyCode == 13) {
          this.view.focus();
        } else if (event.keyCode >= 65 && event.keyCode <= 90 && this.selectedIndex >= 0) {
          let { diagnostic } = this.items[this.selectedIndex], keys2 = assignKeys(diagnostic.actions);
          for (let i = 0; i < keys2.length; i++)
            if (keys2[i].toUpperCase().charCodeAt(0) == event.keyCode) {
              let found = findDiagnostic(this.view.state.field(lintState).diagnostics, diagnostic);
              if (found)
                diagnostic.actions[i].apply(view, found.from, found.to);
            }
        } else {
          return;
        }
        event.preventDefault();
      };
      let onclick = (event) => {
        for (let i = 0; i < this.items.length; i++) {
          if (this.items[i].dom.contains(event.target))
            this.moveSelection(i);
        }
      };
      this.list = crelt("ul", {
        tabIndex: 0,
        role: "listbox",
        "aria-label": this.view.state.phrase("Diagnostics"),
        onkeydown,
        onclick
      });
      this.dom = crelt("div", { class: "cm-panel-lint" }, this.list, crelt("button", {
        type: "button",
        name: "close",
        "aria-label": this.view.state.phrase("close"),
        onclick: () => closeLintPanel(this.view)
      }, "\xD7"));
      this.update();
    }
    get selectedIndex() {
      let selected = this.view.state.field(lintState).selected;
      if (!selected)
        return -1;
      for (let i = 0; i < this.items.length; i++)
        if (this.items[i].diagnostic == selected.diagnostic)
          return i;
      return -1;
    }
    update() {
      let { diagnostics, selected } = this.view.state.field(lintState);
      let i = 0, needsSync = false, newSelectedItem = null;
      diagnostics.between(0, this.view.state.doc.length, (_start, _end, { spec }) => {
        let found = -1, item;
        for (let j = i; j < this.items.length; j++)
          if (this.items[j].diagnostic == spec.diagnostic) {
            found = j;
            break;
          }
        if (found < 0) {
          item = new PanelItem(this.view, spec.diagnostic);
          this.items.splice(i, 0, item);
          needsSync = true;
        } else {
          item = this.items[found];
          if (found > i) {
            this.items.splice(i, found - i);
            needsSync = true;
          }
        }
        if (selected && item.diagnostic == selected.diagnostic) {
          if (!item.dom.hasAttribute("aria-selected")) {
            item.dom.setAttribute("aria-selected", "true");
            newSelectedItem = item;
          }
        } else if (item.dom.hasAttribute("aria-selected")) {
          item.dom.removeAttribute("aria-selected");
        }
        i++;
      });
      while (i < this.items.length && !(this.items.length == 1 && this.items[0].diagnostic.from < 0)) {
        needsSync = true;
        this.items.pop();
      }
      if (this.items.length == 0) {
        this.items.push(new PanelItem(this.view, {
          from: -1,
          to: -1,
          severity: "info",
          message: this.view.state.phrase("No diagnostics")
        }));
        needsSync = true;
      }
      if (newSelectedItem) {
        this.list.setAttribute("aria-activedescendant", newSelectedItem.id);
        this.view.requestMeasure({
          key: this,
          read: () => ({ sel: newSelectedItem.dom.getBoundingClientRect(), panel: this.list.getBoundingClientRect() }),
          write: ({ sel, panel }) => {
            if (sel.top < panel.top)
              this.list.scrollTop -= panel.top - sel.top;
            else if (sel.bottom > panel.bottom)
              this.list.scrollTop += sel.bottom - panel.bottom;
          }
        });
      } else if (this.selectedIndex < 0) {
        this.list.removeAttribute("aria-activedescendant");
      }
      if (needsSync)
        this.sync();
    }
    sync() {
      let domPos = this.list.firstChild;
      function rm2() {
        let prev = domPos;
        domPos = prev.nextSibling;
        prev.remove();
      }
      for (let item of this.items) {
        if (item.dom.parentNode == this.list) {
          while (domPos != item.dom)
            rm2();
          domPos = item.dom.nextSibling;
        } else {
          this.list.insertBefore(item.dom, domPos);
        }
      }
      while (domPos)
        rm2();
    }
    moveSelection(selectedIndex) {
      if (this.selectedIndex < 0)
        return;
      let field = this.view.state.field(lintState);
      let selection = findDiagnostic(field.diagnostics, this.items[selectedIndex].diagnostic);
      if (!selection)
        return;
      this.view.dispatch({
        selection: { anchor: selection.from, head: selection.to },
        scrollIntoView: true,
        effects: movePanelSelection.of(selection)
      });
    }
    static open(view) {
      return new LintPanel(view);
    }
  };
  function svg(content2, attrs = `viewBox="0 0 40 40"`) {
    return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${encodeURIComponent(content2)}</svg>')`;
  }
  function underline(color) {
    return svg(`<path d="m0 2.5 l2 -1.5 l1 0 l2 1.5 l1 0" stroke="${color}" fill="none" stroke-width=".7"/>`, `width="6" height="3"`);
  }
  var baseTheme5 = /* @__PURE__ */ EditorView.baseTheme({
    ".cm-diagnostic": {
      padding: "3px 6px 3px 8px",
      marginLeft: "-1px",
      display: "block",
      whiteSpace: "pre-wrap"
    },
    ".cm-diagnostic-error": { borderLeft: "5px solid #d11" },
    ".cm-diagnostic-warning": { borderLeft: "5px solid orange" },
    ".cm-diagnostic-info": { borderLeft: "5px solid #999" },
    ".cm-diagnosticAction": {
      font: "inherit",
      border: "none",
      padding: "2px 4px",
      backgroundColor: "#444",
      color: "white",
      borderRadius: "3px",
      marginLeft: "8px"
    },
    ".cm-diagnosticSource": {
      fontSize: "70%",
      opacity: 0.7
    },
    ".cm-lintRange": {
      backgroundPosition: "left bottom",
      backgroundRepeat: "repeat-x",
      paddingBottom: "0.7px"
    },
    ".cm-lintRange-error": { backgroundImage: /* @__PURE__ */ underline("#d11") },
    ".cm-lintRange-warning": { backgroundImage: /* @__PURE__ */ underline("orange") },
    ".cm-lintRange-info": { backgroundImage: /* @__PURE__ */ underline("#999") },
    ".cm-lintRange-active": { backgroundColor: "#ffdd9980" },
    ".cm-tooltip-lint": {
      padding: 0,
      margin: 0
    },
    ".cm-lintPoint": {
      position: "relative",
      "&:after": {
        content: '""',
        position: "absolute",
        bottom: 0,
        left: "-2px",
        borderLeft: "3px solid transparent",
        borderRight: "3px solid transparent",
        borderBottom: "4px solid #d11"
      }
    },
    ".cm-lintPoint-warning": {
      "&:after": { borderBottomColor: "orange" }
    },
    ".cm-lintPoint-info": {
      "&:after": { borderBottomColor: "#999" }
    },
    ".cm-panel.cm-panel-lint": {
      position: "relative",
      "& ul": {
        maxHeight: "100px",
        overflowY: "auto",
        "& [aria-selected]": {
          backgroundColor: "#ddd",
          "& u": { textDecoration: "underline" }
        },
        "&:focus [aria-selected]": {
          background_fallback: "#bdf",
          backgroundColor: "Highlight",
          color_fallback: "white",
          color: "HighlightText"
        },
        "& u": { textDecoration: "none" },
        padding: 0,
        margin: 0
      },
      "& [name=close]": {
        position: "absolute",
        top: "0",
        right: "2px",
        background: "inherit",
        border: "none",
        font: "inherit",
        padding: 0,
        margin: 0
      }
    }
  });

  // node_modules/@codemirror/basic-setup/dist/index.js
  var basicSetup = [
    /* @__PURE__ */ lineNumbers(),
    /* @__PURE__ */ highlightActiveLineGutter(),
    /* @__PURE__ */ highlightSpecialChars(),
    /* @__PURE__ */ history(),
    /* @__PURE__ */ foldGutter(),
    /* @__PURE__ */ drawSelection(),
    /* @__PURE__ */ dropCursor(),
    /* @__PURE__ */ EditorState.allowMultipleSelections.of(true),
    /* @__PURE__ */ indentOnInput(),
    /* @__PURE__ */ syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    /* @__PURE__ */ bracketMatching(),
    /* @__PURE__ */ closeBrackets(),
    /* @__PURE__ */ autocompletion(),
    /* @__PURE__ */ rectangularSelection(),
    /* @__PURE__ */ crosshairCursor(),
    /* @__PURE__ */ highlightActiveLine(),
    /* @__PURE__ */ highlightSelectionMatches(),
    /* @__PURE__ */ keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      ...lintKeymap
    ])
  ];

  // public/packages/code-module.js
  var $2 = module("code-module");
  $2.on("click", ".publish", (event) => {
    const link = event.target.closest($2.selector).getAttribute("src");
    const { file } = $2.read();
    fetch(link, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ file })
    }).then(() => {
      window.location.href = window.location.href;
    });
  });
  $2.render((target) => {
    const link = target.getAttribute("src");
    console.log(link);
    const { file } = $2.read();
    if (!file) {
      fetch(link).then((res) => res.json()).then(({ file: file2 }) => $2.write({ file: file2 }));
      return;
    }
    if (!target.view) {
      target.innerHTML = `
      <button class="publish">Publish</button>
    `;
      const config2 = {
        extensions: [
          basicSetup,
          EditorView.updateListener.of(
            persist(target, $2, {})
          )
        ]
      };
      const state = EditorState.create({
        ...config2,
        doc: file
      });
      target.view = new EditorView({
        parent: target,
        state
      });
    }
  });
  function persist(_target, $7, _flags) {
    return (update3) => {
      if (update3.changes.inserted.length < 0)
        return;
      const file = update3.view.state.doc.toString();
      $7.write({ file });
    };
  }
  $2.style(`
  & {
		display: block;
    max-height: 60vh;
    overflow: scroll;
  }
`);

  // node_modules/colorjs.io/dist/color.js
  function multiplyMatrices(A, B) {
    let m3 = A.length;
    if (!Array.isArray(A[0])) {
      A = [A];
    }
    if (!Array.isArray(B[0])) {
      B = B.map((x) => [x]);
    }
    let p2 = B[0].length;
    let B_cols = B[0].map((_, i) => B.map((x) => x[i]));
    let product = A.map((row) => B_cols.map((col) => {
      let ret = 0;
      if (!Array.isArray(row)) {
        for (let c4 of col) {
          ret += row * c4;
        }
        return ret;
      }
      for (let i = 0; i < row.length; i++) {
        ret += row[i] * (col[i] || 0);
      }
      return ret;
    }));
    if (m3 === 1) {
      product = product[0];
    }
    if (p2 === 1) {
      return product.map((x) => x[0]);
    }
    return product;
  }
  function isString(str) {
    return type(str) === "string";
  }
  function type(o) {
    let str = Object.prototype.toString.call(o);
    return (str.match(/^\[object\s+(.*?)\]$/)[1] || "").toLowerCase();
  }
  function toPrecision(n2, precision) {
    n2 = +n2;
    precision = +precision;
    let integerLength = (Math.floor(n2) + "").length;
    if (precision > integerLength) {
      return +n2.toFixed(precision - integerLength);
    } else {
      let p10 = 10 ** (integerLength - precision);
      return Math.round(n2 / p10) * p10;
    }
  }
  function parseFunction(str) {
    if (!str) {
      return;
    }
    str = str.trim();
    const isFunctionRegex = /^([a-z]+)\((.+?)\)$/i;
    const isNumberRegex = /^-?[\d.]+$/;
    let parts = str.match(isFunctionRegex);
    if (parts) {
      let args = [];
      parts[2].replace(/\/?\s*([-\w.]+(?:%|deg)?)/g, ($0, arg) => {
        if (/%$/.test(arg)) {
          arg = new Number(arg.slice(0, -1) / 100);
          arg.type = "<percentage>";
        } else if (/deg$/.test(arg)) {
          arg = new Number(+arg.slice(0, -3));
          arg.type = "<angle>";
          arg.unit = "deg";
        } else if (isNumberRegex.test(arg)) {
          arg = new Number(arg);
          arg.type = "<number>";
        }
        if ($0.startsWith("/")) {
          arg = arg instanceof Number ? arg : new Number(arg);
          arg.alpha = true;
        }
        args.push(arg);
      });
      return {
        name: parts[1].toLowerCase(),
        rawName: parts[1],
        rawArgs: parts[2],
        args
      };
    }
  }
  function last(arr) {
    return arr[arr.length - 1];
  }
  function interpolate(start, end, p2) {
    if (isNaN(start)) {
      return end;
    }
    if (isNaN(end)) {
      return start;
    }
    return start + (end - start) * p2;
  }
  function interpolateInv(start, end, value2) {
    return (value2 - start) / (end - start);
  }
  function mapRange2(from, to2, value2) {
    return interpolate(to2[0], to2[1], interpolateInv(from[0], from[1], value2));
  }
  function parseCoordGrammar(coordGrammars) {
    return coordGrammars.map((coordGrammar2) => {
      return coordGrammar2.split("|").map((type2) => {
        type2 = type2.trim();
        let range2 = type2.match(/^(<[a-z]+>)\[(-?[.\d]+),\s*(-?[.\d]+)\]?$/);
        if (range2) {
          let ret = new String(range2[1]);
          ret.range = [+range2[2], +range2[3]];
          return ret;
        }
        return type2;
      });
    });
  }
  var util = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    isString,
    type,
    toPrecision,
    parseFunction,
    last,
    interpolate,
    interpolateInv,
    mapRange: mapRange2,
    parseCoordGrammar,
    multiplyMatrices
  });
  var Hooks = class {
    add(name2, callback, first) {
      if (typeof arguments[0] != "string") {
        for (var name2 in arguments[0]) {
          this.add(name2, arguments[0][name2], arguments[1]);
        }
        return;
      }
      (Array.isArray(name2) ? name2 : [name2]).forEach(function(name3) {
        this[name3] = this[name3] || [];
        if (callback) {
          this[name3][first ? "unshift" : "push"](callback);
        }
      }, this);
    }
    run(name2, env) {
      this[name2] = this[name2] || [];
      this[name2].forEach(function(callback) {
        callback.call(env && env.context ? env.context : env, env);
      });
    }
  };
  var hooks = new Hooks();
  var defaults3 = {
    gamut_mapping: "lch.c",
    precision: 5,
    deltaE: "76"
  };
  var WHITES = {
    D50: [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585],
    D65: [0.3127 / 0.329, 1, (1 - 0.3127 - 0.329) / 0.329]
  };
  function getWhite(name2) {
    if (Array.isArray(name2)) {
      return name2;
    }
    return WHITES[name2];
  }
  function adapt$1(W1, W2, XYZ, options = {}) {
    W1 = getWhite(W1);
    W2 = getWhite(W2);
    if (!W1 || !W2) {
      throw new TypeError(`Missing white point to convert ${!W1 ? "from" : ""}${!W1 && !W2 ? "/" : ""}${!W2 ? "to" : ""}`);
    }
    if (W1 === W2) {
      return XYZ;
    }
    let env = { W1, W2, XYZ, options };
    hooks.run("chromatic-adaptation-start", env);
    if (!env.M) {
      if (env.W1 === WHITES.D65 && env.W2 === WHITES.D50) {
        env.M = [
          [1.0479298208405488, 0.022946793341019088, -0.05019222954313557],
          [0.029627815688159344, 0.990434484573249, -0.01707382502938514],
          [-0.009243058152591178, 0.015055144896577895, 0.7518742899580008]
        ];
      } else if (env.W1 === WHITES.D50 && env.W2 === WHITES.D65) {
        env.M = [
          [0.9554734527042182, -0.023098536874261423, 0.0632593086610217],
          [-0.028369706963208136, 1.0099954580058226, 0.021041398966943008],
          [0.012314001688319899, -0.020507696433477912, 1.3303659366080753]
        ];
      }
    }
    hooks.run("chromatic-adaptation-end", env);
    if (env.M) {
      return multiplyMatrices(env.M, env.XYZ);
    } else {
      throw new TypeError("Only Bradford CAT with white points D50 and D65 supported for now.");
    }
  }
  var \u03B5$4 = 75e-6;
  var _processFormat, processFormat_fn, _path, _getPath, getPath_fn;
  var _ColorSpace = class {
    constructor(options) {
      __privateAdd(this, _processFormat);
      __privateAdd(this, _getPath);
      __privateAdd(this, _path, void 0);
      this.id = options.id;
      this.name = options.name;
      this.base = options.base ? _ColorSpace.get(options.base) : null;
      this.aliases = options.aliases;
      if (this.base) {
        this.fromBase = options.fromBase;
        this.toBase = options.toBase;
      }
      let coords = options.coords ?? this.base.coords;
      this.coords = coords;
      let white2 = options.white ?? this.base.white ?? "D65";
      this.white = getWhite(white2);
      this.formats = options.formats ?? {};
      for (let name2 in this.formats) {
        let format = this.formats[name2];
        format.type ||= "function";
        format.name ||= name2;
      }
      if (options.cssId && !this.formats.functions?.color) {
        this.formats.color = { id: options.cssId };
        Object.defineProperty(this, "cssId", { value: options.cssId });
      } else if (this.formats?.color && !this.formats?.color.id) {
        this.formats.color.id = this.id;
      }
      this.referred = options.referred;
      __privateSet(this, _path, __privateMethod(this, _getPath, getPath_fn).call(this).reverse());
      hooks.run("colorspace-init-end", this);
    }
    inGamut(coords, { epsilon = \u03B5$4 } = {}) {
      if (this.isPolar) {
        coords = this.toBase(coords);
        return this.base.inGamut(coords, { epsilon });
      }
      let coordMeta = Object.values(this.coords);
      return coords.every((c4, i) => {
        let meta2 = coordMeta[i];
        if (meta2.type !== "angle" && meta2.range) {
          if (Number.isNaN(c4)) {
            return true;
          }
          let [min, max2] = meta2.range;
          return (min === void 0 || c4 >= min - epsilon) && (max2 === void 0 || c4 <= max2 + epsilon);
        }
        return true;
      });
    }
    get cssId() {
      return this.formats.functions?.color?.id || this.id;
    }
    get isPolar() {
      for (let id in this.coords) {
        if (this.coords[id].type === "angle") {
          return true;
        }
      }
      return false;
    }
    getFormat(format) {
      if (typeof format === "object") {
        format = __privateMethod(this, _processFormat, processFormat_fn).call(this, format);
        return format;
      }
      let ret;
      if (format === "default") {
        ret = Object.values(this.formats)[0];
      } else {
        ret = this.formats[format];
      }
      if (ret) {
        ret = __privateMethod(this, _processFormat, processFormat_fn).call(this, ret);
        return ret;
      }
      return null;
    }
    to(space, coords) {
      if (arguments.length === 1) {
        [space, coords] = [space.space, space.coords];
      }
      space = _ColorSpace.get(space);
      if (this === space) {
        return coords;
      }
      coords = coords.map((c4) => Number.isNaN(c4) ? 0 : c4);
      let myPath = __privateGet(this, _path);
      let otherPath = __privateGet(space, _path);
      let connectionSpace, connectionSpaceIndex;
      for (let i = 0; i < myPath.length; i++) {
        if (myPath[i] === otherPath[i]) {
          connectionSpace = myPath[i];
          connectionSpaceIndex = i;
        } else {
          break;
        }
      }
      if (!connectionSpace) {
        throw new Error(`Cannot convert between color spaces ${this} and ${space}: no connection space was found`);
      }
      for (let i = myPath.length - 1; i > connectionSpaceIndex; i--) {
        coords = myPath[i].toBase(coords);
      }
      for (let i = connectionSpaceIndex + 1; i < otherPath.length; i++) {
        coords = otherPath[i].fromBase(coords);
      }
      return coords;
    }
    from(space, coords) {
      if (arguments.length === 1) {
        [space, coords] = [space.space, space.coords];
      }
      space = _ColorSpace.get(space);
      return space.to(this, coords);
    }
    toString() {
      return `${this.name} (${this.id})`;
    }
    getMinCoords() {
      let ret = [];
      for (let id in this.coords) {
        let meta2 = this.coords[id];
        let range2 = meta2.range || meta2.refRange;
        ret.push(range2?.min ?? 0);
      }
      return ret;
    }
    static get all() {
      return [...new Set(Object.values(_ColorSpace.registry))];
    }
    static register(id, space) {
      if (arguments.length === 1) {
        space = arguments[0];
        id = space.id;
      }
      space = this.get(space);
      if (this.registry[id] && this.registry[id] !== space) {
        throw new Error(`Duplicate color space registration: '${id}'`);
      }
      this.registry[id] = space;
      if (arguments.length === 1 && space.aliases) {
        for (let alias of space.aliases) {
          this.register(alias, space);
        }
      }
      return space;
    }
    static get(space, ...alternatives) {
      if (!space || space instanceof _ColorSpace) {
        return space;
      }
      let argType = type(space);
      if (argType === "string") {
        let ret = _ColorSpace.registry[space.toLowerCase()];
        if (!ret) {
          throw new TypeError(`No color space found with id = "${space}"`);
        }
        return ret;
      }
      if (alternatives.length) {
        return _ColorSpace.get(...alternatives);
      }
      throw new TypeError(`${space} is not a valid color space`);
    }
    static resolveCoord(ref, workingSpace) {
      let coordType = type(ref);
      let space, coord;
      if (coordType === "string") {
        if (ref.includes(".")) {
          [space, coord] = ref.split(".");
        } else {
          [space, coord] = [, ref];
        }
      } else if (Array.isArray(ref)) {
        [space, coord] = ref;
      } else {
        space = ref.space;
        coord = ref.coordId;
      }
      space = _ColorSpace.get(space);
      if (!space) {
        space = workingSpace;
      }
      if (!space) {
        throw new TypeError(`Cannot resolve coordinate reference ${ref}: No color space specified and relative references are not allowed here`);
      }
      coordType = type(coord);
      if (coordType === "number" || coordType === "string" && coord >= 0) {
        let meta2 = Object.entries(space.coords)[coord];
        if (meta2) {
          return { space, id: meta2[0], index: coord, ...meta2[1] };
        }
      }
      space = _ColorSpace.get(space);
      let normalizedCoord = coord.toLowerCase();
      let i = 0;
      for (let id in space.coords) {
        let meta2 = space.coords[id];
        if (id.toLowerCase() === normalizedCoord || meta2.name?.toLowerCase() === normalizedCoord) {
          return { space, id, index: i, ...meta2 };
        }
        i++;
      }
      throw new TypeError(`No "${coord}" coordinate found in ${space.name}. Its coordinates are: ${Object.keys(space.coords).join(", ")}`);
    }
  };
  var ColorSpace = _ColorSpace;
  _processFormat = new WeakSet();
  processFormat_fn = function(format) {
    if (format.coords && !format.coordGrammar) {
      format.type ||= "function";
      format.name ||= "color";
      format.coordGrammar = parseCoordGrammar(format.coords);
      let coordFormats = Object.entries(this.coords).map(([id, coordMeta], i) => {
        let outputType = format.coordGrammar[i][0];
        let fromRange = coordMeta.range || coordMeta.refRange;
        let toRange = outputType.range, suffix = "";
        if (outputType == "<percentage>") {
          toRange = [0, 100];
          suffix = "%";
        } else if (outputType == "<angle>") {
          suffix = "deg";
        }
        return { fromRange, toRange, suffix };
      });
      format.serializeCoords = (coords, precision) => {
        return coords.map((c4, i) => {
          let { fromRange, toRange, suffix } = coordFormats[i];
          if (fromRange && toRange) {
            c4 = mapRange2(fromRange, toRange, c4);
          }
          c4 = toPrecision(c4, precision);
          if (suffix) {
            c4 += suffix;
          }
          return c4;
        });
      };
    }
    return format;
  };
  _path = new WeakMap();
  _getPath = new WeakSet();
  getPath_fn = function() {
    let ret = [this];
    for (let space = this; space = space.base; ) {
      ret.push(space);
    }
    return ret;
  };
  __publicField(ColorSpace, "registry", {});
  __publicField(ColorSpace, "DEFAULT_FORMAT", {
    type: "functions",
    name: "color"
  });
  var XYZ_D65 = new ColorSpace({
    id: "xyz-d65",
    name: "XYZ D65",
    coords: {
      x: { name: "X" },
      y: { name: "Y" },
      z: { name: "Z" }
    },
    white: "D65",
    formats: {
      color: {
        ids: ["xyz-d65", "xyz"]
      }
    },
    aliases: ["xyz"]
  });
  var RGBColorSpace = class extends ColorSpace {
    constructor(options) {
      if (!options.coords) {
        options.coords = {
          r: {
            range: [0, 1],
            name: "Red"
          },
          g: {
            range: [0, 1],
            name: "Green"
          },
          b: {
            range: [0, 1],
            name: "Blue"
          }
        };
      }
      if (!options.base) {
        options.base = XYZ_D65;
      }
      if (options.toXYZ_M && options.fromXYZ_M) {
        options.toBase ??= (rgb) => {
          let xyz = multiplyMatrices(options.toXYZ_M, rgb);
          if (this.white !== this.base.white) {
            xyz = adapt$1(this.white, this.base.white, xyz);
          }
          return xyz;
        };
        options.fromBase ??= (xyz) => {
          xyz = adapt$1(this.base.white, this.white, xyz);
          return multiplyMatrices(options.fromXYZ_M, xyz);
        };
      }
      options.referred ??= "display";
      super(options);
    }
  };
  function parse(str) {
    let env = { "str": String(str)?.trim() };
    hooks.run("parse-start", env);
    if (env.color) {
      return env.color;
    }
    env.parsed = parseFunction(env.str);
    if (env.parsed) {
      let name2 = env.parsed.name;
      if (name2 === "color") {
        let id = env.parsed.args.shift();
        let alpha = env.parsed.rawArgs.indexOf("/") > 0 ? env.parsed.args.pop() : 1;
        for (let space of ColorSpace.all) {
          let colorSpec = space.getFormat("color");
          if (colorSpec) {
            if (id === colorSpec.id || colorSpec.ids?.includes(id)) {
              let argCount = Object.keys(space.coords).length;
              let coords = Array(argCount).fill(0);
              coords.forEach((_, i) => coords[i] = env.parsed.args[i] || 0);
              return { spaceId: space.id, coords, alpha };
            }
          }
        }
        let didYouMean = "";
        if (id in ColorSpace.registry) {
          let cssId = ColorSpace.registry[id].formats?.functions?.color?.id;
          if (cssId) {
            didYouMean = `Did you mean color(${cssId})?`;
          }
        }
        throw new TypeError(`Cannot parse color(${id}). ` + (didYouMean || "Missing a plugin?"));
      } else {
        for (let space of ColorSpace.all) {
          let format = space.getFormat(name2);
          if (format && format.type === "function") {
            let alpha = 1;
            if (format.lastAlpha || last(env.parsed.args).alpha) {
              alpha = env.parsed.args.pop();
            }
            let coords = env.parsed.args;
            if (format.coordGrammar) {
              Object.entries(space.coords).forEach(([id, coordMeta], i) => {
                let coordGrammar2 = format.coordGrammar[i];
                let providedType = coords[i]?.type;
                coordGrammar2 = coordGrammar2.find((c4) => c4 == providedType);
                if (!coordGrammar2) {
                  let coordName = coordMeta.name || id;
                  throw new TypeError(`${providedType} not allowed for ${coordName} in ${name2}()`);
                }
                let fromRange = coordGrammar2.range;
                if (providedType === "<percentage>") {
                  fromRange ||= [0, 1];
                }
                let toRange = coordMeta.range || coordMeta.refRange;
                if (fromRange && toRange) {
                  coords[i] = mapRange2(fromRange, toRange, coords[i]);
                }
              });
            }
            return {
              spaceId: space.id,
              coords,
              alpha
            };
          }
        }
      }
    } else {
      for (let space of ColorSpace.all) {
        for (let formatId in space.formats) {
          let format = space.formats[formatId];
          if (format.type !== "custom") {
            continue;
          }
          if (format.test && !format.test(env.str)) {
            continue;
          }
          let color = format.parse(env.str);
          if (color) {
            color.alpha ??= 1;
            return color;
          }
        }
      }
    }
    throw new TypeError(`Could not parse ${str} as a color. Missing a plugin?`);
  }
  function getColor(color) {
    if (!color) {
      throw new TypeError("Empty color reference");
    }
    if (isString(color)) {
      color = parse(color);
    }
    let space = color.space || color.spaceId;
    if (!(space instanceof ColorSpace)) {
      color.space = ColorSpace.get(space);
    }
    if (color.alpha === void 0) {
      color.alpha = 1;
    }
    return color;
  }
  function getAll(color, space) {
    space = ColorSpace.get(space);
    return space.from(color);
  }
  function get(color, prop) {
    let { space, index } = ColorSpace.resolveCoord(prop, color.space);
    let coords = getAll(color, space);
    return coords[index];
  }
  function setAll(color, space, coords) {
    space = ColorSpace.get(space);
    color.coords = space.to(color.space, coords);
    return color;
  }
  function set$1(color, prop, value2) {
    color = getColor(color);
    if (arguments.length === 2 && type(arguments[1]) === "object") {
      let object = arguments[1];
      for (let p2 in object) {
        set$1(color, p2, object[p2]);
      }
    } else {
      if (typeof value2 === "function") {
        value2 = value2(get(color, prop));
      }
      let { space, index } = ColorSpace.resolveCoord(prop, color.space);
      let coords = getAll(color, space);
      coords[index] = value2;
      setAll(color, space, coords);
    }
    return color;
  }
  var XYZ_D50 = new ColorSpace({
    id: "xyz-d50",
    name: "XYZ D50",
    white: "D50",
    base: XYZ_D65,
    fromBase: (coords) => adapt$1(XYZ_D65.white, "D50", coords),
    toBase: (coords) => adapt$1("D50", XYZ_D65.white, coords),
    formats: {
      color: {}
    }
  });
  var \u03B5$3 = 216 / 24389;
  var \u03B53$1 = 24 / 116;
  var \u03BA$1 = 24389 / 27;
  var white$1 = WHITES.D50;
  var lab = new ColorSpace({
    id: "lab",
    name: "Lab",
    coords: {
      l: {
        refRange: [0, 100],
        name: "L"
      },
      a: {
        refRange: [-125, 125]
      },
      b: {
        refRange: [-125, 125]
      }
    },
    white: white$1,
    base: XYZ_D50,
    fromBase(XYZ) {
      let xyz = XYZ.map((value2, i) => value2 / white$1[i]);
      let f = xyz.map((value2) => value2 > \u03B5$3 ? Math.cbrt(value2) : (\u03BA$1 * value2 + 16) / 116);
      return [
        116 * f[1] - 16,
        500 * (f[0] - f[1]),
        200 * (f[1] - f[2])
      ];
    },
    toBase(Lab) {
      let f = [];
      f[1] = (Lab[0] + 16) / 116;
      f[0] = Lab[1] / 500 + f[1];
      f[2] = f[1] - Lab[2] / 200;
      let xyz = [
        f[0] > \u03B53$1 ? Math.pow(f[0], 3) : (116 * f[0] - 16) / \u03BA$1,
        Lab[0] > 8 ? Math.pow((Lab[0] + 16) / 116, 3) : Lab[0] / \u03BA$1,
        f[2] > \u03B53$1 ? Math.pow(f[2], 3) : (116 * f[2] - 16) / \u03BA$1
      ];
      return xyz.map((value2, i) => value2 * white$1[i]);
    },
    formats: {
      "lab": {
        coords: ["<number> | <percentage>", "<number>", "<number>"]
      }
    }
  });
  function constrain(angle) {
    return (angle % 360 + 360) % 360;
  }
  function adjust(arc, angles) {
    if (arc === "raw") {
      return angles;
    }
    let [a1, a2] = angles.map(constrain);
    let angleDiff = a2 - a1;
    if (arc === "increasing") {
      if (angleDiff < 0) {
        a2 += 360;
      }
    } else if (arc === "decreasing") {
      if (angleDiff > 0) {
        a1 += 360;
      }
    } else if (arc === "longer") {
      if (-180 < angleDiff && angleDiff < 180) {
        if (angleDiff > 0) {
          a2 += 360;
        } else {
          a1 += 360;
        }
      }
    } else if (arc === "shorter") {
      if (angleDiff > 180) {
        a1 += 360;
      } else if (angleDiff < -180) {
        a2 += 360;
      }
    }
    return [a1, a2];
  }
  var lch = new ColorSpace({
    id: "lch",
    name: "LCH",
    coords: {
      l: {
        refRange: [0, 100],
        name: "Lightness"
      },
      c: {
        refRange: [0, 150],
        name: "Chroma"
      },
      h: {
        refRange: [0, 360],
        type: "angle",
        name: "Hue"
      }
    },
    base: lab,
    fromBase(Lab) {
      let [L, a2, b2] = Lab;
      let hue;
      const \u03B52 = 0.02;
      if (Math.abs(a2) < \u03B52 && Math.abs(b2) < \u03B52) {
        hue = NaN;
      } else {
        hue = Math.atan2(b2, a2) * 180 / Math.PI;
      }
      return [
        L,
        Math.sqrt(a2 ** 2 + b2 ** 2),
        constrain(hue)
      ];
    },
    toBase(LCH) {
      let [Lightness, Chroma, Hue] = LCH;
      if (Chroma < 0) {
        Chroma = 0;
      }
      if (isNaN(Hue)) {
        Hue = 0;
      }
      return [
        Lightness,
        Chroma * Math.cos(Hue * Math.PI / 180),
        Chroma * Math.sin(Hue * Math.PI / 180)
      ];
    },
    formats: {
      "lch": {
        coords: ["<number> | <percentage>", "<number>", "<number> | <angle>"]
      }
    }
  });
  var Gfactor = 25 ** 7;
  var \u03C0$1 = Math.PI;
  var r2d = 180 / \u03C0$1;
  var d2r$1 = \u03C0$1 / 180;
  function deltaE2000(color, sample, { kL = 1, kC = 1, kH = 1 } = {}) {
    let [L1, a1, b1] = lab.from(color);
    let C1 = lch.from(lab, [L1, a1, b1])[1];
    let [L2, a2, b2] = lab.from(sample);
    let C2 = lch.from(lab, [L2, a2, b2])[1];
    if (C1 < 0) {
      C1 = 0;
    }
    if (C2 < 0) {
      C2 = 0;
    }
    let Cbar = (C1 + C2) / 2;
    let C7 = Cbar ** 7;
    let G = 0.5 * (1 - Math.sqrt(C7 / (C7 + Gfactor)));
    let adash1 = (1 + G) * a1;
    let adash2 = (1 + G) * a2;
    let Cdash1 = Math.sqrt(adash1 ** 2 + b1 ** 2);
    let Cdash2 = Math.sqrt(adash2 ** 2 + b2 ** 2);
    let h1 = adash1 === 0 && b1 === 0 ? 0 : Math.atan2(b1, adash1);
    let h2 = adash2 === 0 && b2 === 0 ? 0 : Math.atan2(b2, adash2);
    if (h1 < 0) {
      h1 += 2 * \u03C0$1;
    }
    if (h2 < 0) {
      h2 += 2 * \u03C0$1;
    }
    h1 *= r2d;
    h2 *= r2d;
    let \u0394L = L2 - L1;
    let \u0394C = Cdash2 - Cdash1;
    let hdiff = h2 - h1;
    let hsum = h1 + h2;
    let habs = Math.abs(hdiff);
    let \u0394h;
    if (Cdash1 * Cdash2 === 0) {
      \u0394h = 0;
    } else if (habs <= 180) {
      \u0394h = hdiff;
    } else if (hdiff > 180) {
      \u0394h = hdiff - 360;
    } else if (hdiff < -180) {
      \u0394h = hdiff + 360;
    } else {
      console.log("the unthinkable has happened");
    }
    let \u0394H = 2 * Math.sqrt(Cdash2 * Cdash1) * Math.sin(\u0394h * d2r$1 / 2);
    let Ldash = (L1 + L2) / 2;
    let Cdash = (Cdash1 + Cdash2) / 2;
    let Cdash7 = Math.pow(Cdash, 7);
    let hdash;
    if (Cdash1 * Cdash2 === 0) {
      hdash = hsum;
    } else if (habs <= 180) {
      hdash = hsum / 2;
    } else if (hsum < 360) {
      hdash = (hsum + 360) / 2;
    } else {
      hdash = (hsum - 360) / 2;
    }
    let lsq = (Ldash - 50) ** 2;
    let SL = 1 + 0.015 * lsq / Math.sqrt(20 + lsq);
    let SC = 1 + 0.045 * Cdash;
    let T = 1;
    T -= 0.17 * Math.cos((hdash - 30) * d2r$1);
    T += 0.24 * Math.cos(2 * hdash * d2r$1);
    T += 0.32 * Math.cos((3 * hdash + 6) * d2r$1);
    T -= 0.2 * Math.cos((4 * hdash - 63) * d2r$1);
    let SH = 1 + 0.015 * Cdash * T;
    let \u0394\u03B8 = 30 * Math.exp(-1 * ((hdash - 275) / 25) ** 2);
    let RC = 2 * Math.sqrt(Cdash7 / (Cdash7 + Gfactor));
    let RT = -1 * Math.sin(2 * \u0394\u03B8 * d2r$1) * RC;
    let dE = (\u0394L / (kL * SL)) ** 2;
    dE += (\u0394C / (kC * SC)) ** 2;
    dE += (\u0394H / (kH * SH)) ** 2;
    dE += RT * (\u0394C / (kC * SC)) * (\u0394H / (kH * SH));
    return Math.sqrt(dE);
  }
  var \u03B5$2 = 75e-6;
  function inGamut(color, space = color.space, { epsilon = \u03B5$2 } = {}) {
    color = getColor(color);
    space = ColorSpace.get(space);
    let coords = color.coords;
    if (space !== color.space) {
      coords = space.from(color);
    }
    return space.inGamut(coords, { epsilon });
  }
  function clone(color) {
    return {
      space: color.space,
      coords: color.coords.slice(),
      alpha: color.alpha
    };
  }
  function toGamut(color, { method = defaults3.gamut_mapping, space = color.space } = {}) {
    if (isString(arguments[1])) {
      space = arguments[1];
    }
    space = ColorSpace.get(space);
    if (inGamut(color, space, { epsilon: 0 })) {
      return color;
    }
    let spaceColor = to(color, space);
    if (method !== "clip" && !inGamut(color, space)) {
      let clipped = toGamut(clone(spaceColor), { method: "clip", space });
      if (deltaE2000(color, clipped) > 2) {
        let coordMeta = ColorSpace.resolveCoord(method);
        let mapSpace = coordMeta.space;
        let coordId = coordMeta.id;
        let mappedColor = to(spaceColor, mapSpace);
        let bounds = coordMeta.range || coordMeta.refRange;
        let min = bounds[0];
        let \u03B52 = 0.01;
        let low = min;
        let high = get(mappedColor, coordId);
        while (high - low > \u03B52) {
          let clipped2 = clone(mappedColor);
          clipped2 = toGamut(clipped2, { space, method: "clip" });
          let deltaE2 = deltaE2000(mappedColor, clipped2);
          if (deltaE2 - 2 < \u03B52) {
            low = get(mappedColor, coordId);
          } else {
            high = get(mappedColor, coordId);
          }
          set$1(mappedColor, coordId, (low + high) / 2);
        }
        spaceColor = to(mappedColor, space);
      } else {
        spaceColor = clipped;
      }
    }
    if (method === "clip" || !inGamut(spaceColor, space, { epsilon: 0 })) {
      let bounds = Object.values(space.coords).map((c4) => c4.range || []);
      spaceColor.coords = spaceColor.coords.map((c4, i) => {
        let [min, max2] = bounds[i];
        if (min !== void 0) {
          c4 = Math.max(min, c4);
        }
        if (max2 !== void 0) {
          c4 = Math.min(c4, max2);
        }
        return c4;
      });
    }
    if (space !== color.space) {
      spaceColor = to(spaceColor, color.space);
    }
    color.coords = spaceColor.coords;
    return color;
  }
  toGamut.returns = "color";
  function to(color, space, { inGamut: inGamut2 } = {}) {
    color = getColor(color);
    space = ColorSpace.get(space);
    let coords = space.from(color);
    let ret = { space, coords, alpha: color.alpha };
    if (inGamut2) {
      ret = toGamut(ret);
    }
    return ret;
  }
  to.returns = "color";
  function serialize(color, {
    precision = defaults3.precision,
    format = "default",
    inGamut: inGamut$1 = true,
    ...customOptions
  } = {}) {
    let ret;
    color = getColor(color);
    let formatId = format;
    format = color.space.getFormat(format) ?? color.space.getFormat("default") ?? ColorSpace.DEFAULT_FORMAT;
    inGamut$1 ||= format.toGamut;
    let coords = color.coords;
    coords = coords.map((c4) => c4 ? c4 : 0);
    if (inGamut$1 && !inGamut(color)) {
      coords = toGamut(clone(color), inGamut$1 === true ? void 0 : inGamut$1).coords;
    }
    if (format.type === "custom") {
      customOptions.precision = precision;
      if (format.serialize) {
        ret = format.serialize(coords, color.alpha, customOptions);
      } else {
        throw new TypeError(`format ${formatId} can only be used to parse colors, not for serialization`);
      }
    } else {
      let name2 = format.name || "color";
      if (format.serializeCoords) {
        coords = format.serializeCoords(coords, precision);
      } else {
        if (precision !== null) {
          coords = coords.map((c4) => toPrecision(c4, precision));
        }
      }
      let args = [...coords];
      if (name2 === "color") {
        let cssId = format.id || format.ids?.[0] || color.space.id;
        args.unshift(cssId);
      }
      let alpha = color.alpha;
      if (precision !== null) {
        alpha = toPrecision(alpha, precision);
      }
      let strAlpha = color.alpha < 1 ? ` ${format.commas ? "," : "/"} ${alpha}` : "";
      ret = `${name2}(${args.join(format.commas ? ", " : " ")}${strAlpha})`;
    }
    return ret;
  }
  var toXYZ_M$5 = [
    [0.6369580483012914, 0.14461690358620832, 0.1688809751641721],
    [0.2627002120112671, 0.6779980715188708, 0.05930171646986196],
    [0, 0.028072693049087428, 1.060985057710791]
  ];
  var fromXYZ_M$5 = [
    [1.716651187971268, -0.355670783776392, -0.25336628137366],
    [-0.666684351832489, 1.616481236634939, 0.0157685458139111],
    [0.017639857445311, -0.042770613257809, 0.942103121235474]
  ];
  var REC2020Linear = new RGBColorSpace({
    id: "rec2020-linear",
    name: "Linear REC.2020",
    white: "D65",
    toXYZ_M: toXYZ_M$5,
    fromXYZ_M: fromXYZ_M$5
  });
  var \u03B1 = 1.09929682680944;
  var \u03B2 = 0.018053968510807;
  var REC2020 = new RGBColorSpace({
    id: "rec2020",
    name: "REC.2020",
    base: REC2020Linear,
    toBase(RGB) {
      return RGB.map(function(val) {
        if (val < \u03B2 * 4.5) {
          return val / 4.5;
        }
        return Math.pow((val + \u03B1 - 1) / \u03B1, 1 / 0.45);
      });
    },
    fromBase(RGB) {
      return RGB.map(function(val) {
        if (val >= \u03B2) {
          return \u03B1 * Math.pow(val, 0.45) - (\u03B1 - 1);
        }
        return 4.5 * val;
      });
    },
    formats: {
      color: {}
    }
  });
  var toXYZ_M$4 = [
    [0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
    [0.2289745640697488, 0.6917385218365064, 0.079286914093745],
    [0, 0.04511338185890264, 1.043944368900976]
  ];
  var fromXYZ_M$4 = [
    [2.493496911941425, -0.9313836179191239, -0.40271078445071684],
    [-0.8294889695615747, 1.7626640603183463, 0.023624685841943577],
    [0.03584583024378447, -0.07617238926804182, 0.9568845240076872]
  ];
  var P3Linear = new RGBColorSpace({
    id: "p3-linear",
    name: "Linear P3",
    white: "D65",
    toXYZ_M: toXYZ_M$4,
    fromXYZ_M: fromXYZ_M$4
  });
  var toXYZ_M$3 = [
    [0.41239079926595934, 0.357584339383878, 0.1804807884018343],
    [0.21263900587151027, 0.715168678767756, 0.07219231536073371],
    [0.01933081871559182, 0.11919477979462598, 0.9505321522496607]
  ];
  var fromXYZ_M$3 = [
    [3.2409699419045226, -1.537383177570094, -0.4986107602930034],
    [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559],
    [0.05563007969699366, -0.20397695888897652, 1.0569715142428786]
  ];
  var sRGBLinear = new RGBColorSpace({
    id: "srgb-linear",
    name: "Linear sRGB",
    white: "D65",
    toXYZ_M: toXYZ_M$3,
    fromXYZ_M: fromXYZ_M$3,
    formats: {
      color: {}
    }
  });
  var KEYWORDS = {
    "aliceblue": [240 / 255, 248 / 255, 1],
    "antiquewhite": [250 / 255, 235 / 255, 215 / 255],
    "aqua": [0, 1, 1],
    "aquamarine": [127 / 255, 1, 212 / 255],
    "azure": [240 / 255, 1, 1],
    "beige": [245 / 255, 245 / 255, 220 / 255],
    "bisque": [1, 228 / 255, 196 / 255],
    "black": [0, 0, 0],
    "blanchedalmond": [1, 235 / 255, 205 / 255],
    "blue": [0, 0, 1],
    "blueviolet": [138 / 255, 43 / 255, 226 / 255],
    "brown": [165 / 255, 42 / 255, 42 / 255],
    "burlywood": [222 / 255, 184 / 255, 135 / 255],
    "cadetblue": [95 / 255, 158 / 255, 160 / 255],
    "chartreuse": [127 / 255, 1, 0],
    "chocolate": [210 / 255, 105 / 255, 30 / 255],
    "coral": [1, 127 / 255, 80 / 255],
    "cornflowerblue": [100 / 255, 149 / 255, 237 / 255],
    "cornsilk": [1, 248 / 255, 220 / 255],
    "crimson": [220 / 255, 20 / 255, 60 / 255],
    "cyan": [0, 1, 1],
    "darkblue": [0, 0, 139 / 255],
    "darkcyan": [0, 139 / 255, 139 / 255],
    "darkgoldenrod": [184 / 255, 134 / 255, 11 / 255],
    "darkgray": [169 / 255, 169 / 255, 169 / 255],
    "darkgreen": [0, 100 / 255, 0],
    "darkgrey": [169 / 255, 169 / 255, 169 / 255],
    "darkkhaki": [189 / 255, 183 / 255, 107 / 255],
    "darkmagenta": [139 / 255, 0, 139 / 255],
    "darkolivegreen": [85 / 255, 107 / 255, 47 / 255],
    "darkorange": [1, 140 / 255, 0],
    "darkorchid": [153 / 255, 50 / 255, 204 / 255],
    "darkred": [139 / 255, 0, 0],
    "darksalmon": [233 / 255, 150 / 255, 122 / 255],
    "darkseagreen": [143 / 255, 188 / 255, 143 / 255],
    "darkslateblue": [72 / 255, 61 / 255, 139 / 255],
    "darkslategray": [47 / 255, 79 / 255, 79 / 255],
    "darkslategrey": [47 / 255, 79 / 255, 79 / 255],
    "darkturquoise": [0, 206 / 255, 209 / 255],
    "darkviolet": [148 / 255, 0, 211 / 255],
    "deeppink": [1, 20 / 255, 147 / 255],
    "deepskyblue": [0, 191 / 255, 1],
    "dimgray": [105 / 255, 105 / 255, 105 / 255],
    "dimgrey": [105 / 255, 105 / 255, 105 / 255],
    "dodgerblue": [30 / 255, 144 / 255, 1],
    "firebrick": [178 / 255, 34 / 255, 34 / 255],
    "floralwhite": [1, 250 / 255, 240 / 255],
    "forestgreen": [34 / 255, 139 / 255, 34 / 255],
    "fuchsia": [1, 0, 1],
    "gainsboro": [220 / 255, 220 / 255, 220 / 255],
    "ghostwhite": [248 / 255, 248 / 255, 1],
    "gold": [1, 215 / 255, 0],
    "goldenrod": [218 / 255, 165 / 255, 32 / 255],
    "gray": [128 / 255, 128 / 255, 128 / 255],
    "green": [0, 128 / 255, 0],
    "greenyellow": [173 / 255, 1, 47 / 255],
    "grey": [128 / 255, 128 / 255, 128 / 255],
    "honeydew": [240 / 255, 1, 240 / 255],
    "hotpink": [1, 105 / 255, 180 / 255],
    "indianred": [205 / 255, 92 / 255, 92 / 255],
    "indigo": [75 / 255, 0, 130 / 255],
    "ivory": [1, 1, 240 / 255],
    "khaki": [240 / 255, 230 / 255, 140 / 255],
    "lavender": [230 / 255, 230 / 255, 250 / 255],
    "lavenderblush": [1, 240 / 255, 245 / 255],
    "lawngreen": [124 / 255, 252 / 255, 0],
    "lemonchiffon": [1, 250 / 255, 205 / 255],
    "lightblue": [173 / 255, 216 / 255, 230 / 255],
    "lightcoral": [240 / 255, 128 / 255, 128 / 255],
    "lightcyan": [224 / 255, 1, 1],
    "lightgoldenrodyellow": [250 / 255, 250 / 255, 210 / 255],
    "lightgray": [211 / 255, 211 / 255, 211 / 255],
    "lightgreen": [144 / 255, 238 / 255, 144 / 255],
    "lightgrey": [211 / 255, 211 / 255, 211 / 255],
    "lightpink": [1, 182 / 255, 193 / 255],
    "lightsalmon": [1, 160 / 255, 122 / 255],
    "lightseagreen": [32 / 255, 178 / 255, 170 / 255],
    "lightskyblue": [135 / 255, 206 / 255, 250 / 255],
    "lightslategray": [119 / 255, 136 / 255, 153 / 255],
    "lightslategrey": [119 / 255, 136 / 255, 153 / 255],
    "lightsteelblue": [176 / 255, 196 / 255, 222 / 255],
    "lightyellow": [1, 1, 224 / 255],
    "lime": [0, 1, 0],
    "limegreen": [50 / 255, 205 / 255, 50 / 255],
    "linen": [250 / 255, 240 / 255, 230 / 255],
    "magenta": [1, 0, 1],
    "maroon": [128 / 255, 0, 0],
    "mediumaquamarine": [102 / 255, 205 / 255, 170 / 255],
    "mediumblue": [0, 0, 205 / 255],
    "mediumorchid": [186 / 255, 85 / 255, 211 / 255],
    "mediumpurple": [147 / 255, 112 / 255, 219 / 255],
    "mediumseagreen": [60 / 255, 179 / 255, 113 / 255],
    "mediumslateblue": [123 / 255, 104 / 255, 238 / 255],
    "mediumspringgreen": [0, 250 / 255, 154 / 255],
    "mediumturquoise": [72 / 255, 209 / 255, 204 / 255],
    "mediumvioletred": [199 / 255, 21 / 255, 133 / 255],
    "midnightblue": [25 / 255, 25 / 255, 112 / 255],
    "mintcream": [245 / 255, 1, 250 / 255],
    "mistyrose": [1, 228 / 255, 225 / 255],
    "moccasin": [1, 228 / 255, 181 / 255],
    "navajowhite": [1, 222 / 255, 173 / 255],
    "navy": [0, 0, 128 / 255],
    "oldlace": [253 / 255, 245 / 255, 230 / 255],
    "olive": [128 / 255, 128 / 255, 0],
    "olivedrab": [107 / 255, 142 / 255, 35 / 255],
    "orange": [1, 165 / 255, 0],
    "orangered": [1, 69 / 255, 0],
    "orchid": [218 / 255, 112 / 255, 214 / 255],
    "palegoldenrod": [238 / 255, 232 / 255, 170 / 255],
    "palegreen": [152 / 255, 251 / 255, 152 / 255],
    "paleturquoise": [175 / 255, 238 / 255, 238 / 255],
    "palevioletred": [219 / 255, 112 / 255, 147 / 255],
    "papayawhip": [1, 239 / 255, 213 / 255],
    "peachpuff": [1, 218 / 255, 185 / 255],
    "peru": [205 / 255, 133 / 255, 63 / 255],
    "pink": [1, 192 / 255, 203 / 255],
    "plum": [221 / 255, 160 / 255, 221 / 255],
    "powderblue": [176 / 255, 224 / 255, 230 / 255],
    "purple": [128 / 255, 0, 128 / 255],
    "rebeccapurple": [102 / 255, 51 / 255, 153 / 255],
    "red": [1, 0, 0],
    "rosybrown": [188 / 255, 143 / 255, 143 / 255],
    "royalblue": [65 / 255, 105 / 255, 225 / 255],
    "saddlebrown": [139 / 255, 69 / 255, 19 / 255],
    "salmon": [250 / 255, 128 / 255, 114 / 255],
    "sandybrown": [244 / 255, 164 / 255, 96 / 255],
    "seagreen": [46 / 255, 139 / 255, 87 / 255],
    "seashell": [1, 245 / 255, 238 / 255],
    "sienna": [160 / 255, 82 / 255, 45 / 255],
    "silver": [192 / 255, 192 / 255, 192 / 255],
    "skyblue": [135 / 255, 206 / 255, 235 / 255],
    "slateblue": [106 / 255, 90 / 255, 205 / 255],
    "slategray": [112 / 255, 128 / 255, 144 / 255],
    "slategrey": [112 / 255, 128 / 255, 144 / 255],
    "snow": [1, 250 / 255, 250 / 255],
    "springgreen": [0, 1, 127 / 255],
    "steelblue": [70 / 255, 130 / 255, 180 / 255],
    "tan": [210 / 255, 180 / 255, 140 / 255],
    "teal": [0, 128 / 255, 128 / 255],
    "thistle": [216 / 255, 191 / 255, 216 / 255],
    "tomato": [1, 99 / 255, 71 / 255],
    "turquoise": [64 / 255, 224 / 255, 208 / 255],
    "violet": [238 / 255, 130 / 255, 238 / 255],
    "wheat": [245 / 255, 222 / 255, 179 / 255],
    "white": [1, 1, 1],
    "whitesmoke": [245 / 255, 245 / 255, 245 / 255],
    "yellow": [1, 1, 0],
    "yellowgreen": [154 / 255, 205 / 255, 50 / 255]
  };
  var coordGrammar = Array(3).fill("<percentage> | <number>[0, 255]");
  var sRGB = new RGBColorSpace({
    id: "srgb",
    name: "sRGB",
    base: sRGBLinear,
    fromBase: (rgb) => {
      return rgb.map((val) => {
        let sign = val < 0 ? -1 : 1;
        let abs = val * sign;
        if (abs > 31308e-7) {
          return sign * (1.055 * abs ** (1 / 2.4) - 0.055);
        }
        return 12.92 * val;
      });
    },
    toBase: (rgb) => {
      return rgb.map((val) => {
        let sign = val < 0 ? -1 : 1;
        let abs = val * sign;
        if (abs < 0.04045) {
          return val / 12.92;
        }
        return sign * ((abs + 0.055) / 1.055) ** 2.4;
      });
    },
    formats: {
      "rgb": {
        coords: coordGrammar
      },
      "color": {},
      "rgba": {
        coords: coordGrammar,
        commas: true,
        lastAlpha: true
      },
      "hex": {
        type: "custom",
        toGamut: true,
        test: (str) => /^#([a-f0-9]{3,4}){1,2}$/i.test(str),
        parse(str) {
          if (str.length <= 5) {
            str = str.replace(/[a-f0-9]/gi, "$&$&");
          }
          let rgba = [];
          str.replace(/[a-f0-9]{2}/gi, (component) => {
            rgba.push(parseInt(component, 16) / 255);
          });
          return {
            spaceId: "srgb",
            coords: rgba.slice(0, 3),
            alpha: rgba.slice(3)[0]
          };
        },
        serialize: (coords, alpha, {
          collapse = true
        } = {}) => {
          if (alpha < 1) {
            coords.push(alpha);
          }
          coords = coords.map((c4) => Math.round(c4 * 255));
          let collapsible = collapse && coords.every((c4) => c4 % 17 === 0);
          let hex = coords.map((c4) => {
            if (collapsible) {
              return (c4 / 17).toString(16);
            }
            return c4.toString(16).padStart(2, "0");
          }).join("");
          return "#" + hex;
        }
      },
      "keyword": {
        type: "custom",
        test: (str) => /^[a-z]+$/i.test(str),
        parse(str) {
          str = str.toLowerCase();
          let ret = { spaceId: "srgb", coords: null, alpha: 1 };
          if (str === "transparent") {
            ret.coords = KEYWORDS.black;
            ret.alpha = 0;
          } else {
            ret.coords = KEYWORDS[str];
          }
          if (ret.coords) {
            return ret;
          }
        }
      }
    }
  });
  var P3 = new RGBColorSpace({
    id: "p3",
    name: "P3",
    base: P3Linear,
    fromBase: sRGB.fromBase,
    toBase: sRGB.toBase,
    formats: {
      color: {
        id: "display-p3"
      }
    }
  });
  defaults3.display_space = sRGB;
  if (typeof CSS !== "undefined" && CSS.supports) {
    for (let space of [lab, REC2020, P3]) {
      let coords = space.getMinCoords();
      let color = { space, coords, alpha: 1 };
      let str = serialize(color);
      if (CSS.supports("color", str)) {
        defaults3.display_space = space;
        break;
      }
    }
  }
  function display(color, { space = defaults3.display_space, ...options } = {}) {
    let ret = serialize(color, options);
    if (typeof CSS === "undefined" || CSS.supports("color", ret) || !defaults3.display_space) {
      ret = new String(ret);
      ret.color = color;
    } else {
      let fallbackColor = to(color, space);
      ret = new String(serialize(fallbackColor, options));
      ret.color = fallbackColor;
    }
    return ret;
  }
  function distance(color1, color2, space = "lab") {
    space = ColorSpace.get(space);
    let coords1 = space.from(color1);
    let coords2 = space.from(color2);
    return Math.sqrt(coords1.reduce((acc, c12, i) => {
      let c22 = coords2[i];
      if (isNaN(c12) || isNaN(c22)) {
        return acc;
      }
      return acc + (c22 - c12) ** 2;
    }, 0));
  }
  function equals(color1, color2) {
    color1 = getColor(color1);
    color2 = getColor(color2);
    return color1.space === color2.space && color1.alpha === color2.alpha && color1.coords.every((c4, i) => c4 === color2.coords[i]);
  }
  function getLuminance(color) {
    return get(color, [XYZ_D65, "y"]);
  }
  function setLuminance(color) {
    set(color, [XYZ_D65, "y"], value);
  }
  function register$2(Color2) {
    Object.defineProperty(Color2.prototype, "luminance", {
      get() {
        return getLuminance(this);
      },
      set(value2) {
        setLuminance(this);
      }
    });
  }
  var luminance = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    getLuminance,
    setLuminance,
    register: register$2
  });
  function contrastWCAG21(color1, color2) {
    color1 = getColor(color1);
    color2 = getColor(color2);
    let Y1 = Math.max(getLuminance(color1), 0);
    let Y2 = Math.max(getLuminance(color2), 0);
    if (Y2 > Y1) {
      [Y1, Y2] = [Y2, Y1];
    }
    return (Y1 + 0.05) / (Y2 + 0.05);
  }
  var normBG = 0.56;
  var normTXT = 0.57;
  var revTXT = 0.62;
  var revBG = 0.65;
  var blkThrs = 0.022;
  var blkClmp = 1.414;
  var loClip = 0.1;
  var deltaYmin = 5e-4;
  var scaleBoW = 1.14;
  var loBoWoffset = 0.027;
  var scaleWoB = 1.14;
  function fclamp(Y) {
    if (Y >= blkThrs)
      return Y;
    return Y + (blkThrs - Y) ** blkClmp;
  }
  function linearize(val) {
    let sign = val < 0 ? -1 : 1;
    let abs = Math.abs(val);
    return sign * Math.pow(abs, 2.4);
  }
  function contrastAPCA(background, foreground) {
    foreground = getColor(foreground);
    background = getColor(background);
    let S;
    let C2;
    let Sapc;
    let R, G, B;
    foreground = to(foreground, "srgb");
    [R, G, B] = foreground.coords;
    let lumTxt = linearize(R) * 0.2126729 + linearize(G) * 0.7151522 + linearize(B) * 0.072175;
    background = to(background, "srgb");
    [R, G, B] = background.coords;
    let lumBg = linearize(R) * 0.2126729 + linearize(G) * 0.7151522 + linearize(B) * 0.072175;
    let Ytxt = fclamp(lumTxt);
    let Ybg = fclamp(lumBg);
    let BoW = Ybg > Ytxt;
    if (Math.abs(Ybg - Ytxt) < deltaYmin) {
      C2 = 0;
    } else {
      if (BoW) {
        S = Ybg ** normBG - Ytxt ** normTXT;
        C2 = S * scaleBoW;
      } else {
        S = Ybg ** revBG - Ytxt ** revTXT;
        C2 = S * scaleWoB;
      }
    }
    if (Math.abs(C2) < loClip) {
      Sapc = 0;
    } else if (C2 > 0) {
      Sapc = C2 - loBoWoffset;
    } else {
      Sapc = C2 + loBoWoffset;
    }
    return Sapc * 100;
  }
  function contrastMichelson(color1, color2) {
    color1 = getColor(color1);
    color2 = getColor(color2);
    let Y1 = Math.max(getLuminance(color1), 0);
    let Y2 = Math.max(getLuminance(color2), 0);
    if (Y2 > Y1) {
      [Y1, Y2] = [Y2, Y1];
    }
    let denom = Y1 + Y2;
    return denom === 0 ? 0 : (Y1 - Y2) / denom;
  }
  var max = 5e4;
  function contrastWeber(color1, color2) {
    color1 = getColor(color1);
    color2 = getColor(color2);
    let Y1 = Math.max(getLuminance(color1), 0);
    let Y2 = Math.max(getLuminance(color2), 0);
    if (Y2 > Y1) {
      [Y1, Y2] = [Y2, Y1];
    }
    return Y2 === 0 ? max : (Y1 - Y2) / Y2;
  }
  function contrastLstar(color1, color2) {
    color1 = getColor(color1);
    color2 = getColor(color2);
    let L1 = get(color1, [lab, "l"]);
    let L2 = get(color2, [lab, "l"]);
    return Math.abs(L1 - L2);
  }
  var \u03B5$1 = 216 / 24389;
  var \u03B53 = 24 / 116;
  var \u03BA = 24389 / 27;
  var white = WHITES.D65;
  var lab_d65 = new ColorSpace({
    id: "lab-d65",
    name: "Lab D65",
    coords: {
      l: {
        refRange: [0, 100],
        name: "L"
      },
      a: {
        refRange: [-125, 125]
      },
      b: {
        refRange: [-125, 125]
      }
    },
    white,
    base: XYZ_D65,
    fromBase(XYZ) {
      let xyz = XYZ.map((value2, i) => value2 / white[i]);
      let f = xyz.map((value2) => value2 > \u03B5$1 ? Math.cbrt(value2) : (\u03BA * value2 + 16) / 116);
      return [
        116 * f[1] - 16,
        500 * (f[0] - f[1]),
        200 * (f[1] - f[2])
      ];
    },
    toBase(Lab) {
      let f = [];
      f[1] = (Lab[0] + 16) / 116;
      f[0] = Lab[1] / 500 + f[1];
      f[2] = f[1] - Lab[2] / 200;
      let xyz = [
        f[0] > \u03B53 ? Math.pow(f[0], 3) : (116 * f[0] - 16) / \u03BA,
        Lab[0] > 8 ? Math.pow((Lab[0] + 16) / 116, 3) : Lab[0] / \u03BA,
        f[2] > \u03B53 ? Math.pow(f[2], 3) : (116 * f[2] - 16) / \u03BA
      ];
      return xyz.map((value2, i) => value2 * white[i]);
    },
    formats: {
      "lab-d65": {
        coords: ["<number> | <percentage>", "<number>", "<number>"]
      }
    }
  });
  var phi = Math.pow(5, 0.5) * 0.5 + 0.5;
  function contrastDeltaPhi(color1, color2) {
    color1 = getColor(color1);
    color2 = getColor(color2);
    let Lstr1 = get(color1, [lab_d65, "l"]);
    let Lstr2 = get(color2, [lab_d65, "l"]);
    let deltaPhiStar = Math.abs(Math.pow(Lstr1, phi) - Math.pow(Lstr2, phi));
    let contrast2 = Math.pow(deltaPhiStar, 1 / phi) * Math.SQRT2 - 40;
    return contrast2 < 7.5 ? 0 : contrast2;
  }
  var contrastMethods = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    contrastWCAG21,
    contrastAPCA,
    contrastMichelson,
    contrastWeber,
    contrastLstar,
    contrastDeltaPhi
  });
  function contrast(background, foreground, o = {}) {
    if (isString(o)) {
      o = { algorithm: o };
    }
    let { algorithm, ...rest } = o;
    if (!algorithm) {
      let algorithms = Object.keys(contrastMethods).map((a2) => a2.replace(/^contrast/, "")).join(", ");
      throw new TypeError(`contrast() function needs a contrast algorithm. Please specify one of: ${algorithms}`);
    }
    background = getColor(background);
    foreground = getColor(foreground);
    for (let a2 in contrastMethods) {
      if ("contrast" + algorithm.toLowerCase() === a2.toLowerCase()) {
        return contrastMethods[a2](background, foreground, rest);
      }
    }
    throw new TypeError(`Unknown contrast algorithm: ${algorithm}`);
  }
  function uv(color) {
    let [X, Y, Z] = getAll(color, XYZ_D65);
    let denom = X + 15 * Y + 3 * Z;
    return [4 * X / denom, 9 * Y / denom];
  }
  function xy(color) {
    let [X, Y, Z] = getAll(color, XYZ_D65);
    let sum = X + Y + Z;
    return [X / sum, Y / sum];
  }
  function register$1(Color2) {
    Object.defineProperty(Color2.prototype, "uv", {
      get() {
        return uv(this);
      }
    });
    Object.defineProperty(Color2.prototype, "xy", {
      get() {
        return xy(this);
      }
    });
  }
  var chromaticity = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    uv,
    xy,
    register: register$1
  });
  function deltaE76(color, sample) {
    return distance(color, sample, "lab");
  }
  var \u03C0 = Math.PI;
  var d2r = \u03C0 / 180;
  function deltaECMC(color, sample, { l = 2, c: c4 = 1 } = {}) {
    let [L1, a1, b1] = lab.from(color);
    let [, C1, H1] = lch.from(lab, [L1, a1, b1]);
    let [L2, a2, b2] = lab.from(sample);
    let C2 = lch.from(lab, [L2, a2, b2])[1];
    if (C1 < 0) {
      C1 = 0;
    }
    if (C2 < 0) {
      C2 = 0;
    }
    let \u0394L = L1 - L2;
    let \u0394C = C1 - C2;
    let \u0394a = a1 - a2;
    let \u0394b = b1 - b2;
    let H2 = \u0394a ** 2 + \u0394b ** 2 - \u0394C ** 2;
    let SL = 0.511;
    if (L1 >= 16) {
      SL = 0.040975 * L1 / (1 + 0.01765 * L1);
    }
    let SC = 0.0638 * C1 / (1 + 0.0131 * C1) + 0.638;
    let T;
    if (Number.isNaN(H1)) {
      H1 = 0;
    }
    if (H1 >= 164 && H1 <= 345) {
      T = 0.56 + Math.abs(0.2 * Math.cos((H1 + 168) * d2r));
    } else {
      T = 0.36 + Math.abs(0.4 * Math.cos((H1 + 35) * d2r));
    }
    let C4 = Math.pow(C1, 4);
    let F = Math.sqrt(C4 / (C4 + 1900));
    let SH = SC * (F * T + 1 - F);
    let dE = (\u0394L / (l * SL)) ** 2;
    dE += (\u0394C / (c4 * SC)) ** 2;
    dE += H2 / SH ** 2;
    return Math.sqrt(dE);
  }
  var Yw$1 = 203;
  var XYZ_Abs_D65 = new ColorSpace({
    id: "xyz-abs-d65",
    name: "Absolute XYZ D65",
    coords: {
      x: {
        refRange: [0, 9504.7],
        name: "Xa"
      },
      y: {
        refRange: [0, 1e4],
        name: "Ya"
      },
      z: {
        refRange: [0, 10888.3],
        name: "Za"
      }
    },
    base: XYZ_D65,
    fromBase(XYZ) {
      return XYZ.map((v) => Math.max(v * Yw$1, 0));
    },
    toBase(AbsXYZ) {
      return AbsXYZ.map((v) => Math.max(v / Yw$1, 0));
    }
  });
  var b$1 = 1.15;
  var g = 0.66;
  var n$1 = 2610 / 2 ** 14;
  var ninv$1 = 2 ** 14 / 2610;
  var c1$2 = 3424 / 2 ** 12;
  var c2$2 = 2413 / 2 ** 7;
  var c3$2 = 2392 / 2 ** 7;
  var p = 1.7 * 2523 / 2 ** 5;
  var pinv = 2 ** 5 / (1.7 * 2523);
  var d = -0.56;
  var d0 = 16295499532821565e-27;
  var XYZtoCone_M = [
    [0.41478972, 0.579999, 0.014648],
    [-0.20151, 1.120649, 0.0531008],
    [-0.0166008, 0.2648, 0.6684799]
  ];
  var ConetoXYZ_M = [
    [1.9242264357876067, -1.0047923125953657, 0.037651404030618],
    [0.35031676209499907, 0.7264811939316552, -0.06538442294808501],
    [-0.09098281098284752, -0.3127282905230739, 1.5227665613052603]
  ];
  var ConetoIab_M = [
    [0.5, 0.5, 0],
    [3.524, -4.066708, 0.542708],
    [0.199076, 1.096799, -1.295875]
  ];
  var IabtoCone_M = [
    [1, 0.1386050432715393, 0.05804731615611886],
    [0.9999999999999999, -0.1386050432715393, -0.05804731615611886],
    [0.9999999999999998, -0.09601924202631895, -0.8118918960560388]
  ];
  var Jzazbz = new ColorSpace({
    id: "jzazbz",
    name: "Jzazbz",
    coords: {
      jz: {
        refRange: [0, 1],
        name: "Jz"
      },
      az: {
        refRange: [-0.5, 0.5]
      },
      bz: {
        refRange: [-0.5, 0.5]
      }
    },
    base: XYZ_Abs_D65,
    fromBase(XYZ) {
      let [Xa, Ya, Za] = XYZ;
      let Xm = b$1 * Xa - (b$1 - 1) * Za;
      let Ym = g * Ya - (g - 1) * Xa;
      let LMS = multiplyMatrices(XYZtoCone_M, [Xm, Ym, Za]);
      let PQLMS = LMS.map(function(val) {
        let num = c1$2 + c2$2 * (val / 1e4) ** n$1;
        let denom = 1 + c3$2 * (val / 1e4) ** n$1;
        return (num / denom) ** p;
      });
      let [Iz, az, bz] = multiplyMatrices(ConetoIab_M, PQLMS);
      let Jz = (1 + d) * Iz / (1 + d * Iz) - d0;
      return [Jz, az, bz];
    },
    toBase(Jzazbz2) {
      let [Jz, az, bz] = Jzazbz2;
      let Iz = (Jz + d0) / (1 + d - d * (Jz + d0));
      let PQLMS = multiplyMatrices(IabtoCone_M, [Iz, az, bz]);
      let LMS = PQLMS.map(function(val) {
        let num = c1$2 - val ** pinv;
        let denom = c3$2 * val ** pinv - c2$2;
        let x = 1e4 * (num / denom) ** ninv$1;
        return x;
      });
      let [Xm, Ym, Za] = multiplyMatrices(ConetoXYZ_M, LMS);
      let Xa = (Xm + (b$1 - 1) * Za) / b$1;
      let Ya = (Ym + (g - 1) * Xa) / g;
      return [Xa, Ya, Za];
    },
    formats: {
      "color": {}
    }
  });
  var jzczhz = new ColorSpace({
    id: "jzczhz",
    name: "JzCzHz",
    coords: {
      jz: {
        refRange: [0, 1],
        name: "Jz"
      },
      cz: {
        refRange: [0, 1],
        name: "Chroma"
      },
      hz: {
        refRange: [0, 360],
        type: "angle",
        name: "Hue"
      }
    },
    base: Jzazbz,
    fromBase(jzazbz) {
      let [Jz, az, bz] = jzazbz;
      let hue;
      const \u03B52 = 2e-4;
      if (Math.abs(az) < \u03B52 && Math.abs(bz) < \u03B52) {
        hue = NaN;
      } else {
        hue = Math.atan2(bz, az) * 180 / Math.PI;
      }
      return [
        Jz,
        Math.sqrt(az ** 2 + bz ** 2),
        constrain(hue)
      ];
    },
    toBase(jzczhz2) {
      return [
        jzczhz2[0],
        jzczhz2[1] * Math.cos(jzczhz2[2] * Math.PI / 180),
        jzczhz2[1] * Math.sin(jzczhz2[2] * Math.PI / 180)
      ];
    },
    formats: {
      color: {}
    }
  });
  function deltaEJz(color, sample) {
    let [Jz1, Cz1, Hz1] = jzczhz.from(color);
    let [Jz2, Cz2, Hz2] = jzczhz.from(sample);
    let \u0394J = Jz1 - Jz2;
    let \u0394C = Cz1 - Cz2;
    if (Number.isNaN(Hz1) && Number.isNaN(Hz2)) {
      Hz1 = 0;
      Hz2 = 0;
    } else if (Number.isNaN(Hz1)) {
      Hz1 = Hz2;
    } else if (Number.isNaN(Hz2)) {
      Hz2 = Hz1;
    }
    let \u0394h = Hz1 - Hz2;
    let \u0394H = 2 * Math.sqrt(Cz1 * Cz2) * Math.sin(\u0394h / 2 * (Math.PI / 180));
    return Math.sqrt(\u0394J ** 2 + \u0394C ** 2 + \u0394H ** 2);
  }
  var c1$1 = 3424 / 4096;
  var c2$1 = 2413 / 128;
  var c3$1 = 2392 / 128;
  var m1 = 2610 / 16384;
  var m2 = 2523 / 32;
  var im1 = 16384 / 2610;
  var im2 = 32 / 2523;
  var XYZtoLMS_M$1 = [
    [0.3592, 0.6976, -0.0358],
    [-0.1922, 1.1004, 0.0755],
    [7e-3, 0.0749, 0.8434]
  ];
  var LMStoIPT_M = [
    [2048 / 4096, 2048 / 4096, 0],
    [6610 / 4096, -13613 / 4096, 7003 / 4096],
    [17933 / 4096, -17390 / 4096, -543 / 4096]
  ];
  var IPTtoLMS_M = [
    [0.9999888965628402, 0.008605050147287059, 0.11103437159861648],
    [1.00001110343716, -0.008605050147287059, -0.11103437159861648],
    [1.0000320633910054, 0.56004913547279, -0.3206339100541203]
  ];
  var LMStoXYZ_M$1 = [
    [2.0701800566956137, -1.326456876103021, 0.20661600684785517],
    [0.3649882500326575, 0.6804673628522352, -0.04542175307585323],
    [-0.04959554223893211, -0.04942116118675749, 1.1879959417328034]
  ];
  var ictcp = new ColorSpace({
    id: "ictcp",
    name: "ICTCP",
    coords: {
      i: {
        refRange: [0, 1],
        name: "I"
      },
      ct: {
        refRange: [-0.5, 0.5],
        name: "CT"
      },
      cp: {
        refRange: [-0.5, 0.5],
        name: "CP"
      }
    },
    base: XYZ_Abs_D65,
    fromBase(XYZ) {
      let LMS = multiplyMatrices(XYZtoLMS_M$1, XYZ);
      return LMStoICtCp(LMS);
    },
    toBase(ICtCp) {
      let LMS = ICtCptoLMS(ICtCp);
      return multiplyMatrices(LMStoXYZ_M$1, LMS);
    },
    formats: {
      color: {}
    }
  });
  function LMStoICtCp(LMS) {
    let PQLMS = LMS.map(function(val) {
      let num = c1$1 + c2$1 * (val / 1e4) ** m1;
      let denom = 1 + c3$1 * (val / 1e4) ** m1;
      return (num / denom) ** m2;
    });
    return multiplyMatrices(LMStoIPT_M, PQLMS);
  }
  function ICtCptoLMS(ICtCp) {
    let PQLMS = multiplyMatrices(IPTtoLMS_M, ICtCp);
    let LMS = PQLMS.map(function(val) {
      let num = Math.max(val ** im2 - c1$1, 0);
      let denom = c2$1 - c3$1 * val ** im2;
      return 1e4 * (num / denom) ** im1;
    });
    return LMS;
  }
  function deltaEITP(color, sample) {
    let [I1, T1, P1] = ictcp.from(color);
    let [I2, T2, P2] = ictcp.from(sample);
    return 720 * Math.sqrt((I1 - I2) ** 2 + 0.25 * (T1 - T2) ** 2 + (P1 - P2) ** 2);
  }
  var XYZtoLMS_M = [
    [0.8190224432164319, 0.3619062562801221, -0.12887378261216414],
    [0.0329836671980271, 0.9292868468965546, 0.03614466816999844],
    [0.048177199566046255, 0.26423952494422764, 0.6335478258136937]
  ];
  var LMStoXYZ_M = [
    [1.2268798733741557, -0.5578149965554813, 0.28139105017721583],
    [-0.04057576262431372, 1.1122868293970594, -0.07171106666151701],
    [-0.07637294974672142, -0.4214933239627914, 1.5869240244272418]
  ];
  var LMStoLab_M = [
    [0.2104542553, 0.793617785, -0.0040720468],
    [1.9779984951, -2.428592205, 0.4505937099],
    [0.0259040371, 0.7827717662, -0.808675766]
  ];
  var LabtoLMS_M = [
    [0.9999999984505198, 0.39633779217376786, 0.2158037580607588],
    [1.0000000088817609, -0.10556134232365635, -0.06385417477170591],
    [1.0000000546724108, -0.08948418209496575, -1.2914855378640917]
  ];
  var OKLab = new ColorSpace({
    id: "oklab",
    name: "OKLab",
    coords: {
      l: {
        refRange: [0, 1],
        name: "L"
      },
      a: {
        refRange: [-0.4, 0.4]
      },
      b: {
        refRange: [-0.4, 0.4]
      }
    },
    white: "D65",
    base: XYZ_D65,
    fromBase(XYZ) {
      let LMS = multiplyMatrices(XYZtoLMS_M, XYZ);
      let LMSg = LMS.map((val) => Math.cbrt(val));
      return multiplyMatrices(LMStoLab_M, LMSg);
    },
    toBase(OKLab2) {
      let LMSg = multiplyMatrices(LabtoLMS_M, OKLab2);
      let LMS = LMSg.map((val) => val ** 3);
      return multiplyMatrices(LMStoXYZ_M, LMS);
    },
    formats: {
      "oklab": {
        coords: ["<number> | <percentage>", "<number>", "<number>"]
      }
    }
  });
  function deltaEOK(color, sample) {
    let [L1, a1, b1] = OKLab.from(color);
    let [L2, a2, b2] = OKLab.from(sample);
    let \u0394L = L1 - L2;
    let \u0394a = a1 - a2;
    let \u0394b = b1 - b2;
    return Math.sqrt(\u0394L ** 2 + \u0394a ** 2 + \u0394b ** 2);
  }
  var deltaEMethods = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    deltaE76,
    deltaECMC,
    deltaE2000,
    deltaEJz,
    deltaEITP,
    deltaEOK
  });
  function deltaE(c12, c22, o = {}) {
    if (isString(o)) {
      o = { method: o };
    }
    let { method = defaults3.deltaE, ...rest } = o;
    c12 = getColor(c12);
    c22 = getColor(c22);
    for (let m3 in deltaEMethods) {
      if ("deltae" + method.toLowerCase() === m3.toLowerCase()) {
        return deltaEMethods[m3](c12, c22, rest);
      }
    }
    throw new TypeError(`Unknown deltaE method: ${method}`);
  }
  var deltaE$1 = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    "default": deltaE
  });
  function lighten(color, amount = 0.25) {
    let space = ColorSpace.get("oklch", "lch");
    let lightness = [space, "l"];
    return set$1(color, lightness, (l) => l * (1 + amount));
  }
  function darken(color, amount = 0.25) {
    let space = ColorSpace.get("oklch", "lch");
    let lightness = [space, "l"];
    return set$1(color, lightness, (l) => l * (1 - amount));
  }
  var variations = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    lighten,
    darken
  });
  function mix(c12, c22, p2 = 0.5, o = {}) {
    [c12, c22] = [getColor(c12), getColor(c22)];
    if (type(p2) === "object") {
      [p2, o] = [0.5, p2];
    }
    let { space, outputSpace, premultiplied } = o;
    let r = range(c12, c22, { space, outputSpace, premultiplied });
    return r(p2);
  }
  function steps(c12, c22, options = {}) {
    let colorRange;
    if (isRange(c12)) {
      [colorRange, options] = [c12, c22];
      [c12, c22] = colorRange.rangeArgs.colors;
    }
    let {
      maxDeltaE,
      deltaEMethod,
      steps: steps2 = 2,
      maxSteps = 1e3,
      ...rangeOptions
    } = options;
    if (!colorRange) {
      [c12, c22] = [getColor(c12), getColor(c22)];
      colorRange = range(c12, c22, rangeOptions);
    }
    let totalDelta = deltaE(c12, c22);
    let actualSteps = maxDeltaE > 0 ? Math.max(steps2, Math.ceil(totalDelta / maxDeltaE) + 1) : steps2;
    let ret = [];
    if (maxSteps !== void 0) {
      actualSteps = Math.min(actualSteps, maxSteps);
    }
    if (actualSteps === 1) {
      ret = [{ p: 0.5, color: colorRange(0.5) }];
    } else {
      let step = 1 / (actualSteps - 1);
      ret = Array.from({ length: actualSteps }, (_, i) => {
        let p2 = i * step;
        return { p: p2, color: colorRange(p2) };
      });
    }
    if (maxDeltaE > 0) {
      let maxDelta = ret.reduce((acc, cur2, i) => {
        if (i === 0) {
          return 0;
        }
        let \u0394\u0395 = deltaE(cur2.color, ret[i - 1].color, deltaEMethod);
        return Math.max(acc, \u0394\u0395);
      }, 0);
      while (maxDelta > maxDeltaE) {
        maxDelta = 0;
        for (let i = 1; i < ret.length && ret.length < maxSteps; i++) {
          let prev = ret[i - 1];
          let cur2 = ret[i];
          let p2 = (cur2.p + prev.p) / 2;
          let color = colorRange(p2);
          maxDelta = Math.max(maxDelta, deltaE(color, prev.color), deltaE(color, cur2.color));
          ret.splice(i, 0, { p: p2, color: colorRange(p2) });
          i++;
        }
      }
    }
    ret = ret.map((a2) => a2.color);
    return ret;
  }
  function range(color1, color2, options = {}) {
    if (isRange(color1)) {
      let [r, options2] = [color1, color2];
      return range(...r.rangeArgs.colors, { ...r.rangeArgs.options, ...options2 });
    }
    let { space, outputSpace, progression, premultiplied } = options;
    color1 = getColor(color1);
    color2 = getColor(color2);
    color1 = clone(color1);
    color2 = clone(color2);
    let rangeArgs = { colors: [color1, color2], options };
    if (space) {
      space = ColorSpace.get(space);
    } else {
      space = ColorSpace.registry[defaults3.interpolationSpace] || color1.space;
    }
    outputSpace = outputSpace ? ColorSpace.get(outputSpace) : space;
    color1 = to(color1, space);
    color2 = to(color2, space);
    color1 = toGamut(color1);
    color2 = toGamut(color2);
    if (space.coords.h && space.coords.h.type === "angle") {
      let arc = options.hue = options.hue || "shorter";
      let hue = [space, "h"];
      let [\u03B81, \u03B82] = [get(color1, hue), get(color2, hue)];
      [\u03B81, \u03B82] = adjust(arc, [\u03B81, \u03B82]);
      set$1(color1, hue, \u03B81);
      set$1(color2, hue, \u03B82);
    }
    if (premultiplied) {
      color1.coords = color1.coords.map((c4) => c4 * color1.alpha);
      color2.coords = color2.coords.map((c4) => c4 * color2.alpha);
    }
    return Object.assign((p2) => {
      p2 = progression ? progression(p2) : p2;
      let coords = color1.coords.map((start, i) => {
        let end = color2.coords[i];
        return interpolate(start, end, p2);
      });
      let alpha = interpolate(color1.alpha, color2.alpha, p2);
      let ret = { space, coords, alpha };
      if (premultiplied) {
        ret.coords = ret.coords.map((c4) => c4 / alpha);
      }
      if (outputSpace !== space) {
        ret = to(ret, outputSpace);
      }
      return ret;
    }, {
      rangeArgs
    });
  }
  function isRange(val) {
    return type(val) === "function" && !!val.rangeArgs;
  }
  defaults3.interpolationSpace = "lab";
  function register(Color2) {
    Color2.defineFunction("mix", mix, { returns: "color" });
    Color2.defineFunction("range", range, { returns: "function<color>" });
    Color2.defineFunction("steps", steps, { returns: "array<color>" });
  }
  var interpolation = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    mix,
    steps,
    range,
    isRange,
    register
  });
  var HSL = new ColorSpace({
    id: "hsl",
    name: "HSL",
    coords: {
      h: {
        refRange: [0, 360],
        type: "angle",
        name: "Hue"
      },
      s: {
        range: [0, 100],
        name: "Saturation"
      },
      l: {
        range: [0, 100],
        name: "Lightness"
      }
    },
    base: sRGB,
    fromBase: (rgb) => {
      let max2 = Math.max(...rgb);
      let min = Math.min(...rgb);
      let [r, g2, b2] = rgb;
      let [h, s, l] = [NaN, 0, (min + max2) / 2];
      let d2 = max2 - min;
      if (d2 !== 0) {
        s = l === 0 || l === 1 ? 0 : (max2 - l) / Math.min(l, 1 - l);
        switch (max2) {
          case r:
            h = (g2 - b2) / d2 + (g2 < b2 ? 6 : 0);
            break;
          case g2:
            h = (b2 - r) / d2 + 2;
            break;
          case b2:
            h = (r - g2) / d2 + 4;
        }
        h = h * 60;
      }
      return [h, s * 100, l * 100];
    },
    toBase: (hsl) => {
      let [h, s, l] = hsl;
      h = h % 360;
      if (h < 0) {
        h += 360;
      }
      s /= 100;
      l /= 100;
      function f(n2) {
        let k = (n2 + h / 30) % 12;
        let a2 = s * Math.min(l, 1 - l);
        return l - a2 * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      }
      return [f(0), f(8), f(4)];
    },
    formats: {
      "hsl": {
        toGamut: true,
        coords: ["<number> | <angle>", "<percentage>", "<percentage>"]
      },
      "hsla": {
        coords: ["<number> | <angle>", "<percentage>", "<percentage>"],
        commas: true,
        lastAlpha: true
      }
    }
  });
  var HSV = new ColorSpace({
    id: "hsv",
    name: "HSV",
    coords: {
      h: {
        refRange: [0, 360],
        type: "angle",
        name: "Hue"
      },
      s: {
        range: [0, 100],
        name: "Saturation"
      },
      v: {
        range: [0, 100],
        name: "Value"
      }
    },
    base: HSL,
    fromBase(hsl) {
      let [h, s, l] = hsl;
      s /= 100;
      l /= 100;
      let v = l + s * Math.min(l, 1 - l);
      return [
        h,
        v === 0 ? 0 : 200 * (1 - l / v),
        100 * v
      ];
    },
    toBase(hsv) {
      let [h, s, v] = hsv;
      s /= 100;
      v /= 100;
      let l = v * (1 - s / 2);
      return [
        h,
        l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l) * 100,
        l * 100
      ];
    },
    formats: {
      color: {
        toGamut: true
      }
    }
  });
  var hwb = new ColorSpace({
    id: "hwb",
    name: "HWB",
    coords: {
      h: {
        refRange: [0, 360],
        type: "angle",
        name: "Hue"
      },
      w: {
        range: [0, 100],
        name: "Whiteness"
      },
      b: {
        range: [0, 100],
        name: "Blackness"
      }
    },
    base: HSV,
    fromBase(hsv) {
      let [h, s, v] = hsv;
      return [h, v * (100 - s) / 100, 100 - v];
    },
    toBase(hwb2) {
      let [h, w, b2] = hwb2;
      w /= 100;
      b2 /= 100;
      let sum = w + b2;
      if (sum >= 1) {
        let gray = w / sum;
        return [h, 0, gray * 100];
      }
      let v = 1 - b2;
      let s = v === 0 ? 0 : 1 - w / v;
      return [h, s * 100, v * 100];
    },
    formats: {
      "hwb": {
        toGamut: true,
        coords: ["<number> | <angle>", "<percentage>", "<percentage>"]
      }
    }
  });
  var toXYZ_M$2 = [
    [0.5766690429101305, 0.1855582379065463, 0.1882286462349947],
    [0.29734497525053605, 0.6273635662554661, 0.07529145849399788],
    [0.02703136138641234, 0.07068885253582723, 0.9913375368376388]
  ];
  var fromXYZ_M$2 = [
    [2.0415879038107465, -0.5650069742788596, -0.34473135077832956],
    [-0.9692436362808795, 1.8759675015077202, 0.04155505740717557],
    [0.013444280632031142, -0.11836239223101838, 1.0151749943912054]
  ];
  var A98Linear = new RGBColorSpace({
    id: "a98rgb-linear",
    name: "Linear Adobe\xAE 98 RGB compatible",
    white: "D65",
    toXYZ_M: toXYZ_M$2,
    fromXYZ_M: fromXYZ_M$2
  });
  var a98rgb = new RGBColorSpace({
    id: "a98rgb",
    name: "Adobe\xAE 98 RGB compatible",
    base: A98Linear,
    toBase: (RGB) => RGB.map((val) => Math.pow(Math.abs(val), 563 / 256) * Math.sign(val)),
    fromBase: (RGB) => RGB.map((val) => Math.pow(Math.abs(val), 256 / 563) * Math.sign(val)),
    formats: {
      color: {
        id: "a98-rgb"
      }
    }
  });
  var toXYZ_M$1 = [
    [0.7977604896723027, 0.13518583717574031, 0.0313493495815248],
    [0.2880711282292934, 0.7118432178101014, 8565396060525902e-20],
    [0, 0, 0.8251046025104601]
  ];
  var fromXYZ_M$1 = [
    [1.3457989731028281, -0.25558010007997534, -0.05110628506753401],
    [-0.5446224939028347, 1.5082327413132781, 0.02053603239147973],
    [0, 0, 1.2119675456389454]
  ];
  var ProPhotoLinear = new RGBColorSpace({
    id: "prophoto-linear",
    name: "Linear ProPhoto",
    white: "D50",
    base: XYZ_D50,
    toXYZ_M: toXYZ_M$1,
    fromXYZ_M: fromXYZ_M$1
  });
  var Et = 1 / 512;
  var Et2 = 16 / 512;
  var prophoto = new RGBColorSpace({
    id: "prophoto",
    name: "ProPhoto",
    base: ProPhotoLinear,
    toBase(RGB) {
      return RGB.map((v) => v < Et2 ? v / 16 : v ** 1.8);
    },
    fromBase(RGB) {
      return RGB.map((v) => v >= Et ? v ** (1 / 1.8) : 16 * v);
    },
    formats: {
      color: {
        id: "prophoto-rgb"
      }
    }
  });
  var oklch = new ColorSpace({
    id: "oklch",
    name: "OKLCh",
    coords: {
      l: {
        refRange: [0, 1],
        name: "Lightness"
      },
      c: {
        refRange: [0, 0.4],
        name: "Chroma"
      },
      h: {
        refRange: [0, 360],
        type: "angle",
        name: "Hue"
      }
    },
    white: "D65",
    base: OKLab,
    fromBase(oklab) {
      let [L, a2, b2] = oklab;
      let h;
      const \u03B52 = 2e-4;
      if (Math.abs(a2) < \u03B52 && Math.abs(b2) < \u03B52) {
        h = NaN;
      } else {
        h = Math.atan2(b2, a2) * 180 / Math.PI;
      }
      return [
        L,
        Math.sqrt(a2 ** 2 + b2 ** 2),
        constrain(h)
      ];
    },
    toBase(oklch2) {
      let [L, C2, h] = oklch2;
      let a2, b2;
      if (isNaN(h)) {
        a2 = 0;
        b2 = 0;
      } else {
        a2 = C2 * Math.cos(h * Math.PI / 180);
        b2 = C2 * Math.sin(h * Math.PI / 180);
      }
      return [L, a2, b2];
    },
    formats: {
      "oklch": {
        coords: ["<number> | <percentage>", "<number>", "<number> | <angle>"]
      }
    }
  });
  var Yw = 203;
  var n = 2610 / 2 ** 14;
  var ninv = 2 ** 14 / 2610;
  var m = 2523 / 2 ** 5;
  var minv = 2 ** 5 / 2523;
  var c1 = 3424 / 2 ** 12;
  var c2 = 2413 / 2 ** 7;
  var c3 = 2392 / 2 ** 7;
  var rec2100Pq = new RGBColorSpace({
    id: "rec2100pq",
    name: "REC.2100-PQ",
    base: REC2020Linear,
    toBase(RGB) {
      return RGB.map(function(val) {
        let x = (Math.max(val ** minv - c1, 0) / (c2 - c3 * val ** minv)) ** ninv;
        return x * 1e4 / Yw;
      });
    },
    fromBase(RGB) {
      return RGB.map(function(val) {
        let x = Math.max(val * Yw / 1e4, 0);
        let num = c1 + c2 * x ** n;
        let denom = 1 + c3 * x ** n;
        return (num / denom) ** m;
      });
    },
    formats: {
      color: {
        id: "rec2100-pq"
      }
    }
  });
  var a = 0.17883277;
  var b = 0.28466892;
  var c = 0.55991073;
  var rec2100Hlg = new RGBColorSpace({
    id: "rec2100hlg",
    cssid: "rec2100-hlg",
    name: "REC.2100-HLG",
    referred: "scene",
    base: REC2020Linear,
    toBase(RGB) {
      return RGB.map(function(val) {
        if (val <= 1 / 12) {
          return Math.sqrt(3 * val);
        }
        return a * Math.log(12 * val - b) + c;
      });
    },
    fromBase(RGB) {
      return RGB.map(function(val) {
        if (val <= 0.5) {
          return val ** 2 / 3;
        }
        return Math.exp((val - c) / a + b) / 12;
      });
    },
    formats: {
      color: {
        id: "rec2100-hlg"
      }
    }
  });
  var CATs = {};
  hooks.add("chromatic-adaptation-start", (env) => {
    if (env.options.method) {
      env.M = adapt(env.W1, env.W2, env.options.method);
    }
  });
  hooks.add("chromatic-adaptation-end", (env) => {
    if (!env.M) {
      env.M = adapt(env.W1, env.W2, env.options.method);
    }
  });
  function defineCAT({ id, toCone_M, fromCone_M }) {
    CATs[id] = arguments[0];
  }
  function adapt(W1, W2, id = "Bradford") {
    let method = CATs[id];
    let [\u03C1s, \u03B3s, \u03B2s] = multiplyMatrices(method.toCone_M, W1);
    let [\u03C1d, \u03B3d, \u03B2d] = multiplyMatrices(method.toCone_M, W2);
    let scale = [
      [\u03C1d / \u03C1s, 0, 0],
      [0, \u03B3d / \u03B3s, 0],
      [0, 0, \u03B2d / \u03B2s]
    ];
    let scaled_cone_M = multiplyMatrices(scale, method.toCone_M);
    let adapt_M = multiplyMatrices(method.fromCone_M, scaled_cone_M);
    return adapt_M;
  }
  defineCAT({
    id: "von Kries",
    toCone_M: [
      [0.40024, 0.7076, -0.08081],
      [-0.2263, 1.16532, 0.0457],
      [0, 0, 0.91822]
    ],
    fromCone_M: [
      [1.8599364, -1.1293816, 0.2198974],
      [0.3611914, 0.6388125, -64e-7],
      [0, 0, 1.0890636]
    ]
  });
  defineCAT({
    id: "Bradford",
    toCone_M: [
      [0.8951, 0.2664, -0.1614],
      [-0.7502, 1.7135, 0.0367],
      [0.0389, -0.0685, 1.0296]
    ],
    fromCone_M: [
      [0.9869929, -0.1470543, 0.1599627],
      [0.4323053, 0.5183603, 0.0492912],
      [-85287e-7, 0.0400428, 0.9684867]
    ]
  });
  defineCAT({
    id: "CAT02",
    toCone_M: [
      [0.7328, 0.4296, -0.1624],
      [-0.7036, 1.6975, 61e-4],
      [3e-3, 0.0136, 0.9834]
    ],
    fromCone_M: [
      [1.0961238, -0.278869, 0.1827452],
      [0.454369, 0.4735332, 0.0720978],
      [-96276e-7, -5698e-6, 1.0153256]
    ]
  });
  defineCAT({
    id: "CAT16",
    toCone_M: [
      [0.401288, 0.650173, -0.051461],
      [-0.250268, 1.204414, 0.045854],
      [-2079e-6, 0.048952, 0.953127]
    ],
    fromCone_M: [
      [1.862067855087233, -1.011254630531685, 0.1491867754444518],
      [0.3875265432361372, 0.6214474419314753, -0.008973985167612518],
      [-0.01584149884933386, -0.03412293802851557, 1.04996443687785]
    ]
  });
  Object.assign(WHITES, {
    A: [1.0985, 1, 0.35585],
    C: [0.98074, 1, 1.18232],
    D55: [0.95682, 1, 0.92149],
    D75: [0.94972, 1, 1.22638],
    E: [1, 1, 1],
    F2: [0.99186, 1, 0.67393],
    F7: [0.95041, 1, 1.08747],
    F11: [1.00962, 1, 0.6435]
  });
  WHITES.ACES = [0.32168 / 0.33767, 1, (1 - 0.32168 - 0.33767) / 0.33767];
  var toXYZ_M = [
    [0.6624541811085053, 0.13400420645643313, 0.1561876870049078],
    [0.27222871678091454, 0.6740817658111484, 0.05368951740793705],
    [-0.005574649490394108, 0.004060733528982826, 1.0103391003129971]
  ];
  var fromXYZ_M = [
    [1.6410233796943257, -0.32480329418479, -0.23642469523761225],
    [-0.6636628587229829, 1.6153315916573379, 0.016756347685530137],
    [0.011721894328375376, -0.008284441996237409, 0.9883948585390215]
  ];
  var ACEScg = new RGBColorSpace({
    id: "acescg",
    name: "ACEScg",
    coords: {
      r: {
        range: [0, 65504],
        name: "Red"
      },
      g: {
        range: [0, 65504],
        name: "Green"
      },
      b: {
        range: [0, 65504],
        name: "Blue"
      }
    },
    referred: "scene",
    white: WHITES.ACES,
    toXYZ_M,
    fromXYZ_M,
    formats: {
      color: {}
    }
  });
  var \u03B5 = 2 ** -16;
  var ACES_min_nonzero = -0.35828683;
  var ACES_cc_max = (Math.log2(65504) + 9.72) / 17.52;
  var acescc = new RGBColorSpace({
    id: "acescc",
    name: "ACEScc",
    coords: {
      r: {
        range: [ACES_min_nonzero, ACES_cc_max],
        name: "Red"
      },
      g: {
        range: [ACES_min_nonzero, ACES_cc_max],
        name: "Green"
      },
      b: {
        range: [ACES_min_nonzero, ACES_cc_max],
        name: "Blue"
      }
    },
    referred: "scene",
    base: ACEScg,
    toBase(RGB) {
      const low = (9.72 - 15) / 17.52;
      return RGB.map(function(val) {
        if (val <= low) {
          return (2 ** (val * 17.52 - 9.72) - \u03B5) * 2;
        } else if (val < ACES_cc_max) {
          return 2 ** (val * 17.52 - 9.72);
        } else {
          return 65504;
        }
      });
    },
    fromBase(RGB) {
      return RGB.map(function(val) {
        if (val <= 0) {
          return (Math.log2(\u03B5) + 9.72) / 17.52;
        } else if (val < \u03B5) {
          return (Math.log2(\u03B5 + val * 0.5) + 9.72) / 17.52;
        } else {
          return (Math.log2(val) + 9.72) / 17.52;
        }
      });
    },
    formats: {
      color: {}
    }
  });
  var spaces = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    XYZ_D65,
    XYZ_D50,
    XYZ_ABS_D65: XYZ_Abs_D65,
    Lab_D65: lab_d65,
    Lab: lab,
    LCH: lch,
    sRGB_Linear: sRGBLinear,
    sRGB,
    HSL,
    HWB: hwb,
    HSV,
    P3_Linear: P3Linear,
    P3,
    A98RGB_Linear: A98Linear,
    A98RGB: a98rgb,
    ProPhoto_Linear: ProPhotoLinear,
    ProPhoto: prophoto,
    REC_2020_Linear: REC2020Linear,
    REC_2020: REC2020,
    OKLab,
    OKLCH: oklch,
    Jzazbz,
    JzCzHz: jzczhz,
    ICTCP: ictcp,
    REC_2100_PQ: rec2100Pq,
    REC_2100_HLG: rec2100Hlg,
    ACEScg,
    ACEScc: acescc
  });
  var Color = class {
    constructor(...args) {
      let color;
      if (args.length === 1) {
        color = getColor(args[0]);
      }
      let space, coords, alpha;
      if (color) {
        space = color.space || color.spaceId;
        coords = color.coords;
        alpha = color.alpha;
      } else {
        [space, coords, alpha] = args;
      }
      this.#space = ColorSpace.get(space);
      this.coords = coords ? coords.slice() : [0, 0, 0];
      this.alpha = alpha < 1 ? alpha : 1;
      for (let i = 0; i < this.coords.length; i++) {
        if (this.coords[i] === "NaN") {
          this.coords[i] = NaN;
        }
      }
      for (let id in this.#space.coords) {
        Object.defineProperty(this, id, {
          get: () => this.get(id),
          set: (value2) => this.set(id, value2)
        });
      }
    }
    #space;
    get space() {
      return this.#space;
    }
    get spaceId() {
      return this.#space.id;
    }
    clone() {
      return new Color(this.space, this.coords, this.alpha);
    }
    toJSON() {
      return {
        spaceId: this.spaceId,
        coords: this.coords,
        alpha: this.alpha
      };
    }
    display(...args) {
      let ret = display(this, ...args);
      ret.color = new Color(ret.color);
      return ret;
    }
    static get(color, ...args) {
      if (color instanceof Color) {
        return color;
      }
      return new Color(color, ...args);
    }
    static defineFunction(name2, code, o = code) {
      if (arguments.length === 1) {
        [name2, code, o] = [arguments[0].name, arguments[0], arguments[0]];
      }
      let { instance = true, returns } = o;
      let func = function(...args) {
        let ret = code(...args);
        if (returns === "color") {
          ret = Color.get(ret);
        } else if (returns === "function<color>") {
          let f = ret;
          ret = function(...args2) {
            let ret2 = f(...args2);
            return Color.get(ret2);
          };
          Object.assign(ret, f);
        } else if (returns === "array<color>") {
          ret = ret.map((c4) => Color.get(c4));
        }
        return ret;
      };
      if (!(name2 in Color)) {
        Color[name2] = func;
      }
      if (instance) {
        Color.prototype[name2] = function(...args) {
          return func(this, ...args);
        };
      }
    }
    static defineFunctions(o) {
      for (let name2 in o) {
        Color.defineFunction(name2, o[name2], o[name2]);
      }
    }
    static extend(exports) {
      if (exports.register) {
        exports.register(Color);
      } else if (exports.default) {
        Color.defineFunction(exports.default.name, exports.default);
      } else if (typeof exports === "function") {
        Color.defineFunction(exports);
      } else {
        for (let name2 in exports) {
          Color.defineFunction(name2, exports[name2]);
        }
      }
    }
  };
  Color.defineFunctions({
    get,
    getAll,
    set: set$1,
    setAll,
    to,
    equals,
    inGamut,
    toGamut,
    distance,
    toString: serialize
  });
  Object.assign(Color, {
    util,
    hooks,
    WHITES,
    Space: ColorSpace,
    spaces: ColorSpace.registry,
    parse,
    defaults: defaults3
  });
  for (let key of Object.keys(spaces)) {
    ColorSpace.register(spaces[key]);
  }
  for (let id in ColorSpace.registry) {
    addSpaceAccessors(id, ColorSpace.registry[id]);
  }
  hooks.add("colorspace-init-end", addSpaceAccessors);
  function addSpaceAccessors(id, space) {
    Object.keys(space.coords);
    Object.values(space.coords).map((c4) => c4.name);
    let propId = id.replace(/-/g, "_");
    Object.defineProperty(Color.prototype, propId, {
      get() {
        let ret = this.getAll(id);
        if (typeof Proxy === "undefined") {
          return ret;
        }
        return new Proxy(ret, {
          has: (obj, property) => {
            try {
              ColorSpace.resolveCoord([space, property]);
              return true;
            } catch (e) {
            }
            return Reflect.has(obj, property);
          },
          get: (obj, property, receiver) => {
            if (property && typeof property !== "symbol" && !(property in obj)) {
              let { index } = ColorSpace.resolveCoord([space, property]);
              if (index >= 0) {
                return obj[index];
              }
            }
            return Reflect.get(obj, property, receiver);
          },
          set: (obj, property, value2, receiver) => {
            if (property && typeof property !== "symbol" && !(property in obj) || property >= 0) {
              let { index } = ColorSpace.resolveCoord([space, property]);
              if (index >= 0) {
                obj[index] = value2;
                this.setAll(id, obj);
                return true;
              }
            }
            return Reflect.set(obj, property, value2, receiver);
          }
        });
      },
      set(coords) {
        this.setAll(id, coords);
      },
      configurable: true,
      enumerable: true
    });
  }
  Color.extend(deltaEMethods);
  Color.extend(deltaE$1);
  Color.extend(variations);
  Color.extend(contrast);
  Color.extend(chromaticity);
  Color.extend(luminance);
  Color.extend(interpolation);
  Color.extend(contrastMethods);

  // public/packages/gamepad.js
  var controllers = {};
  function gamepads() {
    const ids = Object.keys(controllers) || [];
    return ids.map((x) => controllers[x]).map(gatherInputs);
  }
  var initialState = {};
  var $3 = module("gamepad-debug", initialState);
  $3.render((target) => renderGamepads(target, $3));
  function connecthandler(e) {
    const { index } = e.gamepad;
    controllers[index] = e.gamepad;
  }
  function disconnecthandler(e) {
    const { index } = e.gamepad;
    delete controllers[index];
  }
  function renderValue(value2, index) {
    const offset = parseFloat(value2) - 2 + "rem";
    return `
    <li
      class="input"
      style="--value: ${offset};"
    >${index}</li>
  `;
  }
  function renderInputs(_$, flags) {
    const { gamepad } = flags;
    return `
    <ul class="buttons">
      ${gamepad.buttons.map(renderValue).join("")}
    </ul>
    <ul class="axes">
      ${gamepad.axes.map(renderValue).join("")}
    </ul>
  `;
  }
  function renderGamepads(_target, $7) {
    const list = gamepads().map((gamepad, index) => `
      <li class="gamepad" id="${gamepad.id}">
        <label>${index + 1}: ${gamepad.id}</label>
        ${renderInputs($7, { gamepad })}
      </li>
    `).join("");
    return `<ul class="gamepads">${list}</ul>`;
  }
  function gatherInputs(gamepad, _index) {
    const buttons = [...gamepad.buttons].map((button, _i) => {
      let value2 = button;
      if (typeof value2 == "object") {
        value2 = value2.value;
      }
      return value2;
    });
    const axes = [...gamepad.axes].map((axis, _i) => {
      const value2 = axis;
      return value2;
    });
    return { buttons, axes, id: gamepad.id, index: gamepad.index };
  }
  globalThis.addEventListener("gamepadconnected", connecthandler);
  globalThis.addEventListener("gamepaddisconnected", disconnecthandler);
  $3.style(`
  & .gamepads {
    background: rgba(0,0,0,.04);
    border: 1px solid rgba(0,0,0,.1);
    border-radius: 1rem;
    list-style-type: none;
    padding: 0 1rem;
  }
  & .gamepad {
    border-bottom: 1px solid rgba(0,0,0,.1);
    padding: 1rem 0;
  }
  & .gamepad:last-child {
    border-bottom: none;

  }
  & .buttons,
  & .axes {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(2rem, 1fr));
    list-style-type: none;
    padding: .5rem 0 0;
  }
  & .input {
    background: linear-gradient(lime 0%, orange 50%, rebeccapurple 100%);
    background-size: 1px 6rem;
    background-repeat: repeat-x;
    background-position-y: var(--value);
    border-radius: 2rem;
    width: 2rem;
    height: 2rem;
    display: grid;
    place-content: center;
  }
`);

  // public/packages/guitar.js
  var initialState2 = {
    activeFrets: [],
    activeRegisters: [],
    activeMotions: [],
    frames: {}
  };
  var $4 = module("guitar-debug", initialState2);
  var fretMap = [0, 1, 3, 2, 4];
  var registers = [
    "     ",
    "x    ",
    "x   x",
    " x   ",
    " x  x",
    "  x  ",
    "  x x",
    "   x ",
    "   xx",
    "xx   ",
    "xx  x",
    " xx  ",
    " xx x",
    "x x x",
    "xxxxx"
  ];
  requestAnimationFrame(loop);
  function loop(time) {
    const activeFrets = gamepads().map((x) => toFrets($4, x));
    const activeRegisters = activeFrets.map((x) => toRegisters($4, x));
    const activeMotions = gamepads().map((x) => toMotion($4, x));
    $4.write({
      time,
      activeFrets,
      activeRegisters,
      activeMotions
    });
    requestAnimationFrame(loop);
  }
  $4.render(() => {
    const {
      activeRegisters,
      activeMotions
    } = $4.read();
    const classes = (i) => {
      return ["up", "down", "left", "right"].map((x) => activeMotions[i][x] ? x : "").join(" ");
    };
    return activeRegisters.map((x, i) => `
    <div class="${classes(i)}">
      ${x}
    </div>
  `).join("");
  });
  function toFrets(_$, flags) {
    const pressed = (value2) => value2 === 1 ? "x" : " ";
    const frets = flags.buttons.map(pressed).slice(0, 5);
    return fretMap.map((i) => frets[i]).join("");
  }
  function toRegisters(_$, frets) {
    return registers.indexOf(frets);
  }
  function toMotion(_$, flags) {
    const [vertical] = [...flags.axes].splice(-1);
    const [horizontal] = [...flags.axes].splice(-2);
    return {
      up: vertical === -1,
      down: vertical === 1,
      left: horizontal === -1,
      right: horizontal === 1
    };
  }
  $4.style(`
  & {
    display: grid;
    grid-template-columns: 1fr 1fr;
    height: 100vh;
    width: 100vw;
    place-items: center;
  }
  & .note {
    font-size: 10vh;
    line-height: 1;
  }

  & .strummed {
    transform: scale(2);
  }
`);
  var guitar_default = $4;

  // public/packages/synth-module.js
  var context = new AudioContext();
  async function loadSample(url) {
    const sample = await fetch(url).then((response) => response.arrayBuffer()).then((buffer) => context.decodeAudioData(buffer));
    return sample;
  }
  function playSample(sample, sampleNote, noteToPlay) {
    const source = context.createBufferSource();
    source.buffer = sample;
    source.playbackRate.value = 2 ** ((noteToPlay - sampleNote) / 12);
    source.connect(context.destination);
    source.start(0);
  }
  var synths = [];
  Promise.all([
    loadSample("/samples/1.mp3"),
    loadSample("/samples/2.mp3"),
    loadSample("/samples/3.mp3"),
    loadSample("/samples/4.mp3"),
    loadSample("/samples/5.mp3"),
    loadSample("/samples/6.mp3"),
    loadSample("/samples/7.mp3"),
    loadSample("/samples/8.mp3")
  ]).then((s) => synths = s);
  var $5 = module("synth-module", {
    colors: [],
    start: 120,
    length: 360,
    octave: 4,
    reverse: false,
    pitch: 0,
    synth: 0
  });
  var strumVelocity = 75;
  var sustainedDuration = 100;
  var actionableFPS = 4;
  var majorScale = [
    "C",
    "G",
    "D",
    "A",
    "E",
    "B",
    "F#",
    "Db",
    "Ab",
    "Eb",
    "Bb",
    "F"
  ];
  var minorScale = [
    "a",
    "e",
    "b",
    "f#",
    "c#",
    "g#",
    "d#",
    "bb",
    "f",
    "c",
    "g",
    "d"
  ];
  var lightnessStops = [
    [5, 30],
    [20, 45],
    [35, 60],
    [50, 75],
    [65, 90],
    [80, 105],
    [95, 120]
  ];
  var octaveUp = () => {
    const octave = $5.read().octave + 1;
    if (octave > 6) {
      return;
    }
    $5.write({ octave });
  };
  var octaveDown = () => {
    const octave = $5.read().octave - 1;
    if (octave < 0) {
      return;
    }
    $5.write({ octave });
  };
  var pitchUp = () => {
    const pitch = $5.read().pitch + 1;
    $5.write({ pitch });
  };
  var pitchDown = () => {
    const pitch = $5.read().pitch - 1;
    $5.write({ pitch });
  };
  function attack(event) {
    event.preventDefault();
    const { colors, synth } = $5.read();
    const { octave, note, hue } = event.target.dataset;
    playSample(synths[synth], 60, parseInt(octave) * 12 + (12 + parseInt(note)));
    event.target.classList.add("active");
    const body = new Color(colors[parseInt(hue)][parseInt(octave)].value).to("srgb");
    document.querySelector("body").style.setProperty("background", body);
  }
  function release(event) {
    event.preventDefault();
    event.target.classList.remove("active");
  }
  var chords = [
    [],
    [0, 4, 1],
    [0, 9, 1],
    [1, 5, 2],
    [1, 10, 2],
    [2, 6, 3],
    [2, 11, 3],
    [4, 8, 5],
    [4, 2, 5],
    [3, 9, 4],
    [3, 0, 4],
    [11, 3, 0],
    [11, 8, 0],
    [],
    []
  ];
  var activeSynths = [];
  requestAnimationFrame(loop2);
  function loop2(time) {
    const { activeRegisters, activeFrets, activeMotions } = guitar_default.read();
    activeRegisters.map((register2, i) => {
      const { up, down } = activeMotions[i];
      if (activeFrets[i] === "x x x") {
        [[up, octaveUp], [down, octaveDown]].map(([flag, feature2]) => {
          flag && throttle({ key: "octave-shift", time, feature: feature2 });
        });
      }
      if (activeFrets[i] === "xxxxx") {
        [[up, pitchUp], [down, pitchDown]].map(([flag, feature2]) => {
          flag && throttle({ key: "pitch-shift", time, feature: feature2 });
        });
      }
      if (!chords[register2])
        return;
      const feature = () => {
        if (up || down && register2 > 0) {
          activeSynths = chords[register2];
          activeSynths.map((x, i2) => {
            const index = down ? x : activeSynths[activeSynths.length - 1 - i2];
            const node = document.querySelector(`[data-index='${index}']`);
            node && queueAttack(node, i2);
          });
        }
      };
      feature();
    });
    requestAnimationFrame(loop2);
  }
  function throttle({ key, time, feature }) {
    const { frames = {} } = $5.read();
    const frame = frames[key] || {};
    if (time - 1e3 / actionableFPS > (frame.time || 0)) {
      feature();
      $5.write({ time }, (state, payload) => {
        return {
          ...state,
          frames: {
            ...frames,
            [key]: {
              time: payload.time
            }
          }
        };
      });
    }
  }
  function queueRelease(node) {
    setTimeout(() => {
      node.dispatchEvent(new Event("touchend"));
    }, sustainedDuration);
  }
  function queueAttack(node, i) {
    setTimeout(() => {
      node.dispatchEvent(new Event("touchstart"));
      queueRelease(node);
    }, i * strumVelocity);
  }
  $5.write({ colors: recalculate() });
  $5.render(() => {
    const { start, length, reverse, colors, octave, pitch, debug } = $5.read();
    const wheel = majorScale.map((majorNote, index) => {
      const majorScaleIndex = mod(index - pitch * 7, majorScale.length);
      const minorNote = minorScale[mod(majorScaleIndex + pitch * 7, minorScale.length)];
      const minorScaleIndex = mod(majorScaleIndex + 3, minorScale.length);
      const majorColorIndex = mod(
        mod(majorScaleIndex * 7, colors.length) + pitch,
        colors.length
      );
      const minorColorIndex = mod(
        mod(minorScaleIndex * 7, colors.length) + pitch,
        colors.length
      );
      const majorColorScales = colors[majorColorIndex].map((x) => x.value);
      const minorColorScales = colors[minorColorIndex].map((x) => x.value);
      const majorStepClass = majorNote.length === 2 ? "step half" : "step";
      const minorStepClass = minorNote.length === 2 ? "step half" : "step";
      const majorSynth = majorScaleIndex;
      const minorSynth = minorScaleIndex + majorScale.length;
      const note = mod(index * 7, majorScale.length);
      return `
      <div class="group" style="
				transform: rotate(${majorScaleIndex * 30}deg)
				
			">
        <button
          class="${majorStepClass}"
					data-index="${majorSynth}"
          data-octave="${octave}"
          data-note="${note}"
					data-hue="${majorColorIndex}"
          style="${gradient(majorColorScales, [4, 3, 2])}"
        >
        </button>
        <button
          class="${minorStepClass}"
					data-index="${minorSynth}"
          data-octave="${octave}"
          data-note="${minorScaleIndex}"
					data-hue="${minorColorIndex}"
          style="${gradient(minorColorScales, [4, 3, 2])}"
        >
        </button>
      </div>
    `;
    }).join("");
    return `
    <div class="wheel">
      ${wheel}
			${controls()}
    </div>
  `;
  });
  function controls() {
    return `
		<div class="controls" style="display: none;">
			<button class="octave-up"></button>
			<button class="pitch-up"></button>
			<button class="pitch-down"></button>
			<button class="octave-down"></button>
		</div>
	`;
  }
  $5.on("click", ".octave-up", octaveUp);
  $5.on("click", ".octave-down", octaveDown);
  $5.on("click", ".pitch-up", pitchUp);
  $5.on("click", ".pitch-down", pitchDown);
  $5.style(`
  & {
    height: 100%;
    display: grid;
    place-content: center;
  }
  & .wheel {
    display: grid;
    grid-template-areas: "slot";
    grid-template-rows: 45vmin;
    grid-template-columns: 40vmin;
    place-content: start center;
    padding: 0 1rem;
    height: 90vmin;
		user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
    touch-action: manipulation;
  }
  & .group {
    grid-area: slot;
    transform-origin: bottom;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    clip-path: polygon(20% 0%, 50% 100%, 80% 0%);
    gap: 1px;
  }
  & .step {
    border: none;
    width: 100%;
    height: auto;
    display: grid;
    place-items: start;
    color: black;
		position: relative;
  }

  & .step.half {
    color: white;
  }

	& .step::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			rgba(0, 0, 0, .25),
			transparent,
			rgba(255, 255, 255, .75),
			transparent,
			transparent,
			transparent
		);
		background-size: 300% 300%;
		background-position-y: 100%;
		animation: &-decay 100ms ease-out forwards;
	}

	& .step.active::before {
		animation: &-attack 100ms ease-out forwards;
	}

	@keyframes &-attack {
		0% {
			background-position-y: 50%;
		}
		100% {
			background-position-y: 0%;
		}
	}

	@keyframes &-decay {
		0% {
			background-position-y: 50%;
		}
		100% {
			background-position-y: 100%;
		}
	}

  ${invertedLabels()}
`);
  function invertedLabels() {
    const rulesets = [];
    for (let i = 1; i < 360; i++) {
      rulesets.push(`
      & [style*="rotate(${i}deg)"] label {
        transform: rotate(${-1 * i}deg);
      }
    `);
    }
    return rulesets.join("");
  }
  function upload(colors) {
    const palette = colors.flatMap((x) => x).map(({ name: name2, value: value2 }) => `
    ${name2}: ${value2};
  `).join("");
    fetch("/design-system", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ palette })
    });
  }
  function gradient(scale, stops) {
    return `
    background: linear-gradient(${stops.map((x) => scale[x]).join(", ")})
  `;
  }
  function recalculate() {
    const { start, length, reverse } = $5.read();
    const colors = [...Array(12)].map((_, hueIndex) => {
      const step = length / 12 * hueIndex;
      const hue = reverse ? start - step : start + step;
      return lightnessStops.map(([l, c4], i) => {
        const name2 = `--wheel-${hueIndex}-${i}`;
        const value2 = new Color("lch", [l, c4, hue]).display().toString({ format: "hex" });
        return {
          name: name2,
          value: value2,
          block: hueIndex,
          inline: i
        };
      });
    });
    upload(colors);
    return colors;
  }
  $5.on("mousedown", ".step", attack);
  $5.on("mouseup", ".step", release);
  $5.on("touchstart", ".step", attack);
  $5.on("touchend", ".step", release);
  function mod(x, n2) {
    return (x % n2 + n2) % n2;
  }

  // public/packages/design-system.js
  var $6 = module("design-system");
  $6.render(() => {
    const { palette } = $6.read();
    if (!palette) {
      fetch("/design-system").then((res) => res.json()).then(({ palette: palette2 }) => $6.write({ palette: palette2 }));
      return;
    }
    return `
    <style>
      :root {
        "${palette}"
      }
    </style>
  `;
  });
})();
/*!
* focus-trap 7.0.0
* @license MIT, https://github.com/focus-trap/focus-trap/blob/master/LICENSE
*/
/*!
* tabbable 6.0.1
* @license MIT, https://github.com/focus-trap/tabbable/blob/master/LICENSE
*/
