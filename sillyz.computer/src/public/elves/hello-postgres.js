import { PGlite } from "@electric-sql/pglite";

(async function() {
  const db = new PGlite()
  console.log(await db.query("select 'Hello world' as message;"))
})()
