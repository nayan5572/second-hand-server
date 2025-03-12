import mongoose from "mongoose";
import { Server } from "http";
import app from "./app";
import config from "./app/config";

let server: Server | null = null;

// Database connection
async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    server = app.listen(config.port, () => {
      console.log(`Example app listening: ${config.port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();
