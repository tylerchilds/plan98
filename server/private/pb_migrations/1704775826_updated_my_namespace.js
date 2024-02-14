/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6hxkybjcwln5ilj")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "hhlwz35y",
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
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6hxkybjcwln5ilj")

  // remove
  collection.schema.removeField("hhlwz35y")

  return dao.saveCollection(collection)
})
