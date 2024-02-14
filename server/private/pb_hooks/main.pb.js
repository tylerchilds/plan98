routerAdd("GET", "/hello/:name", (c) => {
  let name = c.pathParam("name")

  return c.json(200, { "message": "Hello " + name })
})

routerAdd("GET", "/public/:pathname", async (c) => {
  let pathname = c.pathParam("pathname")

  const file = await fetch('/'+pathname).then(res => res.text())

  return c.json(200, { "message": "Hello " + file })
})

onModelAfterUpdate((e) => {
  console.log("user updated...", e.model.get("email"))
}, "users")
