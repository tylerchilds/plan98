// the tanka of the tiniest violin

// Fixing the tiniest violin is the easiest trick in the book. All you do is delete four forward slashes. That's it.

////

import elf from '@silly/elf'
import saga from "@silly/saga"
import "@plan4/as2"

export const as2 = globalThis.as2

export const string = 'string'
export const bool = 'boolean'
export const number = 'number'

export const logs = []
export const bugs = []

const Types = {
  string,
  bool,
  number,
  True,
  False,
  Value,
  Integer,
  Float,
  Horizon,
  Text,
  Add,
  Subtract,
  Multiply,
  Divide,
  Modulo,
  Box,
  Self,
  Saga,
  Activities,
  Expect,
  Describe,
  Log,
  Bug,
  Dashboard
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

export function Integer(x) {
  return parseInt(x, 10)
}

export function Float(x) {
  return parseFloat(x)
}

export function Horizon(x) {
  return new Date(x)
}

export function Text(x='') {
  return String.fromCharCode(...new TextEncoder().encode(x.toString()))
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

export function Self(x, box) {
  return elf(x, box)
}

export function Saga(x) {
  return saga(Text(x))
}

export function Activities(x) {
  return as2.activities(Text(x))
}

export function Expect(a, b) {
  if(a === b) {
    Success()
  } else {
    Bug(a, b)
    Failure()
  }
}
export async function Describe(x, a) {
  try {
    Log(x, await a(Success))
  } catch (error) {
    Bug(x, error.message)
    Failure()
  }
}

export function Success() {
  return True()
}

export function Failure() {
  throw new Error('Game Over')
}

export function Log(...args) {
  if (typeof console !== 'undefined') {
    console.log.apply(null, args)
  }
  logs.push(args.join(' '))
}

export function Bug(...args) {
  if (typeof console !== 'undefined') {
    console.error.apply(null, args)
  }
  bugs.push(args.join(' '))
}

export function Dashboard() {
  return { logs, bugs }
}
