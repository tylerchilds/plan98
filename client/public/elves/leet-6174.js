/*
 6174 is a magic number

 1. write a function to sort 6174, yielding two numbers: a big one and a small one
 2. subtract the small one from the big one
 3. If all numbers are identical, return it as is
 4. Finally, render the results to a webpage

*/
function magic(number) {
  const small = (number).toString().split('').sort()

  while(small.length < 4) {
    small.unshift('0')
  }

  const a = small[0]
  if(small.every(x => x===a)) {
    return parseInt(small.join(''))
  }

  const big = [...small].reverse()

  const next = parseInt(big.join('')) - parseInt(small.join(''))

  if(next === 6174) {
    return next
  }

  return magic(next)
}

const samples = []
for(let i = 1; i < 9999; i++) {
  samples.push(i)
}

import('@silly/elf').then((x) => {
  const elf = x.default
  elf('leet-6174').draw(() => {
    return samples.map(magic).join('<br>')
  })
})
