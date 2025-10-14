import elf from '@silly/elf'

const Types = {
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
  Expect
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

export function Text(x) {
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

export function Expect(a, b) {
  return a === b
}
