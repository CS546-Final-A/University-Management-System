// importData.js
import "dotenv/config";

import * as mongoCollections from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

import fs from "fs";
function replaceOid(jsonObject) {
  const parsedObject = jsonObject;

  function processItem(item) {
    if (item && typeof item === "object") {
      for (const key in item) {
        for (const key2 in item[key]) {
          if (key2 === "$oid") {
            item[key] = new ObjectId(item[key][key2]);
          }
          if (key2 === "$date") {
            item[key] = new Date(item[key][key2]);
          }
          if (key2 === "$numberInt") {
            item[key] = parseInt(item[key][key2]);
          }
          if (key2 === "$numberDecimal") {
            item[key] = parseFloat(item[key][key2]);
          }
          if (key2 === "$numberLong") {
            item[key] = parseInt(item[key][key2]);
          }
          if (key2 === "$numberDouble") {
            item[key] = parseFloat(item[key][key2]);
          } else {
            processItem(item[key]);
          }
        }
      }
    } else if (Array.isArray(item)) {
      item.forEach((arrayItem) => {
        processItem(arrayItem);
      });
    }
  }

  processItem(parsedObject);

  return parsedObject;
}

const importData = async () => {
  try {
    const collections = [
      "courses",
      "users",
      "departments",
      "finalgrades",
      "assignments",
    ];

    const loadJSON = (filePath) => {
      try {
        let jsonData = fs.readFileSync(filePath, "utf8");

        return JSON.parse(jsonData);
      } catch (error) {
        console.error(`Error loading JSON file: ${error}`);
        return null;
      }
    };

    for (let collection of collections) {
      const data = loadJSON(`seed/seeds/${collection}Data.json`);

      replaceOid(data);
      if (data) {
        const dbCollection = await mongoCollections[collection]();
        // dbCollection.drop();
        await dbCollection.deleteMany({});
        await dbCollection.insertMany(data);
        console.log(`Inserted ${data.length} documents into ${collection}`);
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
};
await importData();
