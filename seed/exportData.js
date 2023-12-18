// exportData.js

import { MongoClient } from "mongodb";

const exportData = async () => {
  const uri = "mongodb://localhost:27017/your-database-name";
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();

    const database = client.db();
    const collection = database.collection("your-collection-name");

    // Query your data
    const dataToExport = await collection.find().toArray();

    // Save the data to a JSON file (or any other format)
    const fs = require("fs").promises;
    await fs.writeFile("seedData.json", JSON.stringify(dataToExport, null, 2));

    console.log("Data exported successfully to seedData.json");
  } finally {
    await client.close();
  }
};

exportData();
