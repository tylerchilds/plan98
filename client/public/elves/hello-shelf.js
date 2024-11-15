Promise.all([
  import("@silly/elf"),
  import("shelf-merge"),
]).then(([
  e,
  s
]) => {
  const elf = e.default
  const shelf_merge = s.default

  let change, A
  if (true) {
    A = [null, 0]
    change = shelf_merge(A, {
      A: {
        x: 2,
        y: 3
      }
    })
    console.log(JSON.stringify(change, null, 4)) // direct reads
  }

  let change2

  let B
  if (true) {
    B = [null, 0]

    change2 = shelf_merge(B, {
      B: {
        x: 5,
        y: 7,
      }
    })

    // wait time
    //shelf_merge(B, change)

    console.log(JSON.stringify(B, null, 4))

    // we change ourselves..

    let d = shelf_merge(B, {B: {y: 6}})

    console.log(JSON.stringify(d, null, 4))

    console.log(JSON.stringify(B, null, 4))

    shelf_merge(change2, d)

    console.log(JSON.stringify(change2, null, 4))


    shelf_merge(A, change2)

    console.log(JSON.stringify(A, null, 4))

    console.log(JSON.stringify(B, null, 4))
  }
  const merge = shelf_merge.default

  console.log(change)
  const $ = elf('hello-shelf')

  $.teach({ A, B, change, change2 })

  $.draw(() => {
    return [A, B, change, change2]
      .map(x => JSON.stringify(x, null, 4))
      .join('<hr>')
  })
})
