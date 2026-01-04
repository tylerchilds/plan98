// the tanka of the tiniest violin

// Fixing the tiniest violin is the easiest trick in the book. All you do is delete four forward slashes. That's it.

////

import elf from '@silly/elf'
import saga from "@silly/saga"

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
  Text,
  Add,
  Subtract,
  Multiply,
  Divide,
  Modulo,
  Box,
  Self,
  Saga,
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
  return parseFloat(x)
}

export function Float(x) {
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

export function Self(x, box) {
  return elf(x, box)
}

export function Saga(x) {
  return saga(Text(x))
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
  console.log.apply(null, args)
  logs.push(args.join(' '))
}

export function Bug(...args) {
  console.error.apply(null, args)
  bugs.push(args.join(' '))
}

export function Dashboard() {
  return { logs, bugs }
}
