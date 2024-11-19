const td = new TextDecoder();
const file = Deno.args[0]
const [filename, extension] = file.split('.')
await new Deno.Command("mkdir", {
  args: ["-p", filename]
}).output();

const p = await new Deno.Command("ffmpeg", {
  args: ["-i", file, "-c:v", "libx264", "-acodec", "aac", "-strict", "-2", "-b:a", "128k", "-hls_time", "10", "-hls_list_size", "0", "-f", "hls", `${filename}/manifest.m3u8`]
}).output();

const out = td.decode(p.stdout).trim();
const err = td.decode(p.stderr).trim();

console.log("STDOUT ==> ", out);
console.log("STDERR ==> ", err);
