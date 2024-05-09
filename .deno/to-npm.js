// ex. scripts/build_npm.ts
import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.js"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  package: {
    name: "@sillonious/tag",
    version: Deno.args[0],
    description: "web kernel",
		access: "public",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/tylerchilds/kickstart.git",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    //Deno.copyFileSync("LICENSE", "npm/LICENSE");
    //Deno.copyFileSync("README.md", "npm/README.md");
  },
});
