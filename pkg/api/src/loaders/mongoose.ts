import mongoose from "mongoose";
import { Db } from "mongodb";

import { conf } from "@/app/config";

export default async (): Promise<Db> => {
  const connection = await mongoose.connect(conf.get("db.url"), {
    autoCreate: true,
    autoIndex: true,
  });

  return connection.connection.db;
};
