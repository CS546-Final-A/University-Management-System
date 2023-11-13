import { dbConnection } from "./mongoConnection.js";

const getCollectionFn = async (collection) => {
  const db = await dbConnection();
  _col = await db.collection(collection);

  return _col;
};
