import mongoose, { Mongoose } from "mongoose";

import locals from "./locals";

export default async (): Promise<Mongoose> => {
  return await mongoose.connect(locals.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
