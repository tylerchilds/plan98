const CACHE = 'cache';

export default function cache(name) {

  const database = new Promise(function initialize(resolve, reject) {
    const request = indexedDB.open(name, 1);

    request.onupgradeneeded = function(event) {
      const database = event.target.result;

      database.createObjectStore(CACHE, { keyPath: 'schema', autoIncrement: false });
    };

    request.onsuccess = function(event) {
      resolve(event.target.result);
    };
  });

  async function get(keys) {
    const db = await database;

    const transaction = db.transaction(CACHE);
    const objectStore = transaction.objectStore(CACHE);

    const rows = await new Promise(function loadFromDatabase(resolve, reject) {
      const rows = [];
      const read = objectStore.openCursor();

      read.onsuccess = function(event) {
        let cursor = event.target.result;

        if (cursor) {
          if(keys.includes(cursor.key)) {
            rows.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(rows)
        }
      };
      read.onerror = reject;
    });

    return rows;
  }

  async function put(schema, data) {
    const db = await database;

    const record = { schema, data };

    const transaction = db.transaction(CACHE, 'readwrite');
    const objectStore = transaction.objectStore(CACHE);

    let request;

    return new Promise(function saveToDatabase(resolve, reject) {
      try {
        request = objectStore.get(schema);
        request.onsuccess = function(event) {
          const request = objectStore.put(record);
          request.onsuccess = resolve;
        }
      } catch (e) {
        const request = objectStore.add(record);
        request.onsuccess = resolve;
        request.onerror = reject;
      }
    });
  }

  async function del(schema) {
    const db = await database;

    const transaction = db.transaction(CACHE, 'readwrite');
    const objectStore = transaction.objectStore(CACHE);

    let request;

    return new Promise(function deleteFromDatabase(resolve, reject) {
      try {
        request = objectStore.delete(schema);
        request.onsuccess = resolve;
      } catch (e) {
        reject(e)
      }
    });
  }

  return {
    del,
    put,
    get
  }
}
