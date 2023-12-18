// importData.js

import { MongoClient } from "mongodb";
import seedData from "./seedData.json";

const importData = async () => {
  const uri = "mongodb://localhost:27017/your-database-name";
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();

    const database = client.db();
    const collection = database.collection("");

    await collection.deleteMany({});

    await collection.insertMany(seedData);

    console.log("Data imported successfully from seedData.json");
  } finally {
    await client.close();
  }
};

importData();
