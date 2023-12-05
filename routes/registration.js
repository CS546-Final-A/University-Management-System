import { Router } from "express";

import verify from "../data_validation.js";
import { users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

const router = Router();

router.get("/:userid", async (req, res) => {
  try {
    const id = req.params.userid;
    const usercol = await users();

    try {
      new ObjectId(id);
    } catch {
      throw { status: 400, message: "Invalid registration link" };
    }

    const identification = await usercol.findOne(
      { _id: new ObjectId(id), status: "Initalized" },
      { projection: { _id: 0, identification: 1 } }
    );

    if (!identification) {
      throw { status: 404, message: "Invalid registration link" };
    }

    res.render("public/registration", { identification: identification.type });
  } catch (e) {
    if (e.status) {
      res.status(e.status);
      res.render("public/error", { error: e.message });
    } else {
      console.log("Error:");
      console.log(e);
      res.status(500);
      res.render("public/error", { error: "Internal server error" });
    }
  }
});

export default router;
