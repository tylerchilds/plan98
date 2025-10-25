import("npm:linkedom@0.18.5").then(async({ DOMParser }) => {
  globalThis.DOMParser = DOMParser
  const doc = new DOMParser().parseFromString(
    '<!DOCTYPE html><html><head></head><body></body></html>',
    'text/html'
  );

  // Patch querySelector methods to handle :defined
  const originalQuerySelector = doc.querySelector.bind(doc);
  const originalQuerySelectorAll = doc.querySelectorAll.bind(doc);

  doc.querySelector = function(selector) {
    try {
      // Remove :defined pseudo-class as it's not supported
      const cleanSelector = selector.replace(/:defined/g, '');
      return originalQuerySelector(cleanSelector || '*');
    } catch (e) {
      console.warn('querySelector error:', e.message);
      return null;
    }
  };

  doc.querySelectorAll = function(selector) {
    try {
      const cleanSelector = selector.replace(/:defined/g, '');
      return originalQuerySelectorAll(cleanSelector || '*');
    } catch (e) {
      console.warn('querySelectorAll error:', e.message);
      return [];
    }
  };

  globalThis.document = doc;

  globalThis.MutationObserver = class MutationObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    disconnect() {}
    takeRecords() { return []; }
  };

  const {
    string,
    bool,
    number,
    True,
    False,
    Value,
    Precision,
    Text,
    Add,
    Subtract,
    Multiply,
    Divide,
    Modulo,
    Box,
    Elf,
    Saga,
    Expect,
    Describe
  } = await import('./types.js')

  Describe('True is true', (done) => {
    Expect(True(), true)

    return done()
  })

  Describe('False is not true', (done) => {
    Expect(False(), !true)

    return done()
  })

  Describe('A value could be anything really', (done) => {
    Expect(typeof Value(True()), bool)
    Expect(typeof Value(False()), bool)
    Expect(typeof Text(), string)
    Expect(typeof Value(123), number)
    Expect(typeof Value(123.98), number)
    Expect(typeof Precision('123.98'), number)

    return done()
  })

  Describe('Math will always math', (done) => {
    Expect(Add(3,1), 4)
    Expect(Subtract(3,1), 2)
    Expect(Subtract(1,3), -2)
    Expect(Multiply(9,9), 81)
    Expect(Divide(9,9), 1)
    Expect(Modulo(9,9), 0)

    return done()
  })

  Describe('A Saga will always be a string', (done) => {
    Expect(typeof Saga(123), string)
    Expect(typeof Saga('Hello'), string)
    Expect(typeof Saga(() => null), string)
    Expect(typeof Saga(True()), string)
    Expect(typeof Saga(False()), string)
    Expect(typeof Saga(Value()), string)
    Expect(typeof Saga(Precision()), string)
    Expect(typeof Saga(Text()), string)

    return done()
  })

  Describe('An Elf has self-transforming properties', (done) => {
    const selfTransformingProperties = ['link', 'learn', 'draw', 'style', 'when', 'teach']
    const $ = Box(Elf(Text()))

    const everyKeyIsSelfTransforming = Object.keys($)
      .every(x => selfTransformingProperties.includes(x))

    Expect(everyKeyIsSelfTransforming, True())

    return done()
  })
});
