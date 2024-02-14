/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "fcuq6e85r3wcqs3",
    "created": "2024-01-22 21:24:27.812Z",
    "updated": "2024-01-22 21:24:27.812Z",
    "name": "paper_pockets",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "p0cozasq",
        "name": "user",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "4z63oild",
        "name": "pocket",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.id = user",
    "viewRule": "@request.auth.id = user",
    "createRule": "@request.auth.id = user",
    "updateRule": "@request.auth.id = user && \n(@request.data.user:isset = false || @request.auth.id = @request.data.user)",
    "deleteRule": "@request.auth.id = user",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("fcuq6e85r3wcqs3");

  return dao.deleteCollection(collection);
})
