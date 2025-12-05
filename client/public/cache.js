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

  async function get(key) {
    const db = await database;

    const transaction = db.transaction(CACHE);
    const objectStore = transaction.objectStore(CACHE);

    const value = await new Promise(function loadFromDatabase(resolve, reject) {
      const read = objectStore.openCursor();

      read.onsuccess = function(event) {
        const cursor = event.target.result;

        if (cursor) {
          if(key === cursor.key) {
            resolve(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(null)
        }
      };
      read.onerror = reject;
    });

    return value;
  }

  async function put(key, data, type) {
    const db = await database;

    const record = { schema: key, data, type };

    const transaction = db.transaction(CACHE, 'readwrite');
    const objectStore = transaction.objectStore(CACHE);

    let request;

    return new Promise(function saveToDatabase(resolve, reject) {
      try {
        request = objectStore.get(key);
        request.onsuccess = function(event) {
          const request = objectStore.put(record);
          request.onsuccess = () => resolve({ ok: true });
        }
      } catch (e) {
        const request = objectStore.add(record);
        request.onsuccess = resolve;
        request.onerror = reject;
      }
    });
  }

  async function del(key) {
    const db = await database;

    const transaction = db.transaction(CACHE, 'readwrite');
    const objectStore = transaction.objectStore(CACHE);

    let request;

    return new Promise(function deleteFromDatabase(resolve, reject) {
      try {
        request = objectStore.delete(key);
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
