// importData.js

import { MongoClient } from "mongodb";
import courseData from "./courseData.json";
import userData from "./userData.json";
import departmentData from "./departmentData.json";
import sessionData from "./sessionData.json";
import assignmentData from "./assignmentData.json";
import path from "path";

const fs = require("fs");
const importData = async () => {
  const uri = "mongodb://localhost:27017/your-database-name";
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const collections = [
      "courses",
      "users",
      "departments",
      "sessions",
      "assignments",
    ];
    const loadJSON = (filePath) => {
      try {
        const jsonData = fs.readFileSync(filePath, "utf8");
        return JSON.parse(jsonData);
      } catch (error) {
        console.error(`Error loading JSON file: ${error}`);
        return null;
      }
    };

    collections.forEach(async (collectionName) => {
      const database = client.db();
      const collection = database.collection(collectionName);
      const jsonData = loadJSON("./seeds/" + collectionName + "Data.json");
      await collection.deleteMany({});
      const x = await collection.insertMany(jsonData);
      console.log(x);
      console.log(
        "Data imported successfully from " + collectionName + "Data.json"
      );
    });
  } finally {
    await client.close();
  }
};

importData();
