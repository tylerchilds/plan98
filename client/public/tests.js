var string = 'string'
var bool = 'boolean'
var number = 'number'

var Types = {
  string: string,
  bool: bool,
  number: number,
  True: True,
  False: False,
  Value: Value,
  Precision: Precision,
  Text: Text,
  Add: Add,
  Subtract: Subtract,
  Multiply: Multiply,
  Divide: Divide,
  Modulo: Modulo,
  Saga: Saga,
  Expect: Expect,
  Describe: Describe
}

function True() {
  return true
}

function False() {
  return false
}

function Value(x) {
  return x
}

function Precision(x) {
  return parseFloat(x)
}

function Text(x) {
  if(!x) x = ''
  return x.toString()
}

function Add(a, b) {
  return a + b
}

function Subtract(a, b) {
  return a - b
}

function Multiply(a, b) {
  return a * b
}

function Divide(a, b) {
  return a / b
}

function Modulo(a, b) {
  return a % b
}

function saga(x) {
  return ""
}

function Saga(x) {
  return saga(Text(x))
}

function Expect(a, b) {
  if(a === b) {
    Success()
  } else {
    if (typeof console !== 'undefined') {
      console.log('error: ', a, b)
    }

    Failure()
  }
}

function Describe(x, a) {
  if (typeof console !== 'undefined') {
    console.log(x, a(Success))
  }
}

function Success() {
  return True()
}

function Failure() {
  throw new Error('Strongly Typed No No!')
}

Describe('True is true', function callback(done) {
  Expect(True(), true)

  return done()
})

Describe('False is not true', function callback(done) {
  Expect(False(), !true)

  return done()
})

Describe('A value could be anything really', function callback(done) {
  Expect(typeof Value(True()), bool)
  Expect(typeof Value(False()), bool)
  Expect(typeof Text(), string)
  Expect(typeof Value(123), number)
  Expect(typeof Value(123.98), number)
  Expect(typeof Precision('123.98'), number)

  return done()
})

Describe('Math will always math', function callback(done) {
  Expect(Add(3,1), 4)
  Expect(Subtract(3,1), 2)
  Expect(Subtract(1,3), -2)
  Expect(Multiply(9,9), 81)
  Expect(Divide(9,9), 1)
  Expect(Modulo(9,9), 0)

  return done()
})

Describe('A Saga will always be a string', function callback(done) {
  Expect(typeof Saga(123), string)
  Expect(typeof Saga('Hello'), string)
  Expect(typeof Saga(function(){}), string)
  Expect(typeof Saga(True()), string)
  Expect(typeof Saga(False()), string)
  Expect(typeof Saga(Value()), string)
  Expect(typeof Saga(Precision()), string)
  Expect(typeof Saga(Text()), string)

  return done()
})

Describe('A plaintext saga will output markup language', function callback(done) {
  var saga = ''
  saga += '# Ext/Int Alfheim'
  saga += '\n'
  saga += '@ Silly'
  saga += '\n'
  saga += '> Remember Xanadu? lol'

  Expect(Saga(saga), 'todo: implement saga in mqjs')
})

Types
