// vendor.ts — v4, handles minified esm.sh output
const html = await Deno.readTextFile("./client/public/index.html");
const match = html.match(/<script type="importmap">\s*(\{[\s\S]*?\})\s*<\/script>/);
if (!match) throw new Error("No import map found");

const importMap = JSON.parse(match[1]);
const imports: Record<string, string> = importMap.imports;

const errors: string[] = [];
const fetched = new Map<string, string>();
let count = 0;

const REMOTE_HOSTS = [
  "esm.sh",
  "cdn.skypack.dev",
  "cdn.jsdelivr.net",
  "registry.rowsncolumns.app",
  "pyscript.net",
];

function isRemote(url: string): boolean {
  return REMOTE_HOSTS.some(h => url.includes(h));
}

function safePath(url: string): string {
  const u = new URL(url);
  let p = u.host + u.pathname;
  if (u.search) {
    // Hash the query string to keep filenames unique but sane
    let h = 0;
    for (const c of u.search) h = ((h << 5) - h + c.charCodeAt(0)) | 0;
    p += `_q${Math.abs(h).toString(36)}`;
  }
  p = p.replace(/\/$/, "");
  if (!/\.(m?js|css|wasm)$/.test(p)) p += ".js";
  return p;
}

async function vendorUrl(url: string): Promise<string> {
  if (fetched.has(url)) return fetched.get(url)!;

  const filePath = safePath(url);
  const localPath = `/public/vendor/deps/${filePath}`;
  const diskPath = `./client${localPath}`;
  fetched.set(url, localPath);

  try {
    process.stdout?.write?.(`\r  [${count}] ${url.slice(0, 80)}...`) 
    console.log(`  [${count}] ${url}`);

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 Chrome/120" },
      redirect: "follow",
    });

    if (!res.ok) {
      errors.push(`${res.status} ${url}`);
      return localPath;
    }

    let code = await res.text();

    // Aggressive pattern: catch ALL esm.sh-style imports in minified code
    // Matches: from"/path", from '/path', import("/path"), import('/path')
    // The key: NO assumption of whitespace between from and quote
    const allImports: [string, string][] = [];

    // Catch: from"..." and from '...' (with or without space)
    for (const m of code.matchAll(/\bfrom\s*["'](\/[^"']+)["']/g)) {
      allImports.push([m[1], m[0]]);
    }
    for (const m of code.matchAll(/\bfrom\s*["'](https:\/\/esm\.sh\/[^"']+)["']/g)) {
      allImports.push([m[1], m[0]]);
    }

    // Catch: import("...") and import('...')
    for (const m of code.matchAll(/\bimport\s*\(\s*["'](\/[^"']+)["']\s*\)/g)) {
      allImports.push([m[1], m[0]]);
    }
    for (const m of code.matchAll(/\bimport\s*\(\s*["'](https:\/\/esm\.sh\/[^"']+)["']\s*\)/g)) {
      allImports.push([m[1], m[0]]);
    }

    // Catch: bare side-effect imports — import "/node/crypto.mjs"
    // (no 'from', no dynamic import parens)
    for (const m of code.matchAll(/\bimport\s*["'](\/[^"']+)["']/g)) {
      allImports.push([m[1], m[0]]);
    }
    for (const m of code.matchAll(/\bimport\s*["'](https:\/\/esm\.sh\/[^"']+)["']/g)) {
      allImports.push([m[1], m[0]]);
    }

    // Catch: relative imports — from"./ffi.mjs", from"../util.mjs"
    for (const m of code.matchAll(/\bfrom\s*["'](\.\.?\/[^"']+)["']/g)) {
      allImports.push([m[1], m[0]]);
    }
    for (const m of code.matchAll(/\bimport\s*["'](\.\.?\/[^"']+)["']/g)) {
      allImports.push([m[1], m[0]]);
    }
    for (const m of code.matchAll(/\bimport\s*\(\s*["'](\.\.?\/[^"']+)["']\s*\)/g)) {
      allImports.push([m[1], m[0]]);
    }

    // Fetch .wasm and other binary assets referenced anywhere in the code
    for (const m of code.matchAll(/["']([^"']*\.wasm)["']/g)) {
      const wasmRef = m[1];
      // Skip data URIs, absolute URLs to other hosts, etc.
      if (wasmRef.startsWith("data:") || wasmRef.startsWith("blob:")) continue;

      let wasmUrl: string;
      try {
        wasmUrl = new URL(wasmRef, url).href;
      } catch {
        continue;
      }

      if (fetched.has(wasmUrl)) continue;

      const wasmFilePath = safePath(wasmUrl);
      const wasmLocalPath = `/public/vendor/deps/${wasmFilePath}`;
      const wasmDiskPath = `./client${wasmLocalPath}`;
      fetched.set(wasmUrl, wasmLocalPath);

      try {
        console.log(`  [binary] ${wasmUrl}`);
        const res = await fetch(wasmUrl, { redirect: "follow" });
        if (res.ok) {
          const dir = wasmDiskPath.substring(0, wasmDiskPath.lastIndexOf("/"));
          await Deno.mkdir(dir, { recursive: true });
          const bytes = new Uint8Array(await res.arrayBuffer());
          await Deno.writeFile(wasmDiskPath, bytes);
          count++;
        } else {
          errors.push(`${res.status} [binary] ${wasmUrl}`);
        }
      } catch (e) {
        errors.push(`FAIL [binary] ${wasmUrl}: ${e.message}`);
      }
    }

    // Dedupe
    const seen = new Set<string>();
    for (const [depPath] of allImports) {
      if (seen.has(depPath)) continue;
      seen.add(depPath);

      let depUrl = depPath;
      if (depPath.startsWith("./") || depPath.startsWith("../")) {
        // Resolve relative to the current file's original URL
        depUrl = new URL(depPath, url).href;
      } else if (depPath.startsWith("/")) {
        depUrl = `https://esm.sh${depPath}`;
      }

      if (!isRemote(depUrl) && !depUrl.startsWith("https://esm.sh")) continue;

      const depLocal = await vendorUrl(depUrl);

      // For relative imports, keep them relative — don't rewrite to absolute
      // The file will be in the right place on disk
      // So we DON'T rewrite relative paths, we just ensure the file gets fetched
      if (depPath.startsWith("./") || depPath.startsWith("../")) {
        // Don't rewrite — just make sure it's vendored at the right disk location
        continue;
      }

      code = code.replaceAll(`"${depPath}"`, `"${depLocal}"`);
      code = code.replaceAll(`'${depPath}'`, `'${depLocal}'`);
    }

    const dir = diskPath.substring(0, diskPath.lastIndexOf("/"));
    await Deno.mkdir(dir, { recursive: true });
    await Deno.writeTextFile(diskPath, code);
    count++;

  } catch (e) {
    errors.push(`FAIL ${url}: ${e.message}`);
  }

  return localPath;
}

console.log("Vendoring remote dependencies from index.html...\n");

const vendoredImports: Record<string, string> = {};

for (const [specifier, url] of Object.entries(imports)) {
  if (isRemote(url)) {
    vendoredImports[specifier] = await vendorUrl(url);
  } else {
    vendoredImports[specifier] = url;
  }
}

const vendoredMap = JSON.stringify({ imports: vendoredImports }, null, 2);
await Deno.writeTextFile("./client/public/vendor/importmap.json", vendoredMap);

console.log(`\n\n${count} modules vendored (including transitive deps).`);
if (errors.length) {
  console.log(`\n${errors.length} errors:`);
  errors.forEach(e => console.log(`  ${e}`));
}
console.log("\nWritten: client/public/public/vendor/importmap.json");
