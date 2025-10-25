import elf from '@silly/elf'
import saga from "@sillonious/saga"

export const string = 'string'
export const bool = 'boolean'
export const number = 'number'

const Types = {
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
}

export default Types

export function True() {
  return true
}

export function False() {
  return false
}

export function Value(x) {
  return x
}

export function Precision(x) {
  return parseFloat(x)
}

export function Text(x='') {
  return x.toString()
}

export function Add(a, b) {
  return a + b
}

export function Subtract(a, b) {
  return a - b
}

export function Multiply(a, b) {
  return a * b
}

export function Divide(a, b) {
  return a / b
}

export function Modulo(a, b) {
  return a % b
}

export function Box(x) {
  return { ...x }
}

export function Elf(x, box) {
  return elf(x, box)
}

export function Saga(x) {
  return saga(Text(x))
}

export function Expect(a, b) {
  if(a === b) {
    Success()
  } else {
    console.error(a, b)
    Failure()
  }
}

export function Describe(x, a) {
  console.log(x, a(Success))
}

function Success() {
  return True()
}

function Failure() {
  throw new Error('Strongly Typed No No!')
}
