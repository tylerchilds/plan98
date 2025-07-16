let queue = []
let i = 0

setInterval(() => {
  queue.push('event: ' + i)
  i++
}, 1000)

Deno.cron("Log a message", "* * * * *", () => {
  const processed = queue
  queue = []
  console.log(processed)
});
