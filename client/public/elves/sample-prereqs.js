import elf from '@silly/elf'

const $ = elf('sample-prereqs', {
  expression: [[1, 0], [0, 2], [2, 1]]
})

$.draw(() => {
  const { expression } = $.learn()

  const solution = expression.every(([id, dep]) => {
    const deps = []

    function trace(dep, expression) {
      if(deps.includes(dep)) {
        return false; // circular dep
      } else {
        deps.push(dep)
      }

      const prereqs = expression.filter(course => {
        return course[0] === dep
      })

      if(prereqs.length === 0) {
        return true // no deps!
      }

      return prereqs.every((course) => {
        return trace(course[1], expression)
      })
    }
    return trace(dep, expression)
  })

  return `
    Expression: ${JSON.stringify(expression)}
    Solution: ${solution}
  `
})
