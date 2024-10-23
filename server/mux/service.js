import express from "express";
import "@std/dotenv/load";
import * as base64 from "@cross/base64";


const MUX_TOKEN = Deno.env.get('MUX_TOKEN')
const MUX_SECRET = Deno.env.get('MUX_SECRET')

const auth = base64.fromString(MUX_TOKEN + ":" + MUX_SECRET)

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to the Dinosaur API!");
});

app.get("/mp4ify", async (req, res) => {

  const headers = new Headers()

  headers.append('Content-Type', 'application/json')
  headers.set('Authorization', 'Basic ' + auth);

  const result = await fetch(`https://api.mux.com/video/v1/assets/${req.query.asset_id}/mp4-support`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ mp4_support: 'capped-1080p' })
  }).catch(console.error)

  const download = await fetch(`https://stream.mux.com/${req.query.playback_id}/capped-1080p.mp4?download=cats`)

  let error = 'success'
  try {
    const file = await Deno.open(`./videos/${req.query.asset_id}.mp4`, { create: true, write: true })

    console.log(download.body)

    await download.body.pipeTo(file.writable)
    file.close()
  } catch(e) {
    error = e
  }

  res.send('done? ' + error)
})

app.listen(6868);

