/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "i41d6e2di5gjefz",
    "created": "2024-07-10 03:03:25.074Z",
    "updated": "2024-07-10 03:03:25.074Z",
    "name": "potlucks",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "6jjkyqbt",
        "name": "name",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("i41d6e2di5gjefz");

  return dao.deleteCollection(collection);
})
