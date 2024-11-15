Promise.all([
  import("@silly/elf"),
  import("shelf-merge"),
]).then(([
  elf,
  shelf_merge
]) => {
  const merge = shelf_merge.default

  let shelf = [{hello: "world"}, [1, {hello: 1}]]

  let change = merge(shelf, {more: "data"}) // version info infered

  console.log(change)


  const elfOnTheShelf = elf.default('hello-shelf')

  elfOnTheShelf.draw(() => {
    return `
      I didn't imagine this punchline originally.
    `
  })
})
