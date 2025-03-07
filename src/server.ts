import mongoose from "mongoose";
import { Server } from "http";
import app from "./app";
import config from "./app/config";

let server: Server;

async function main() {
  try {
    await mongoose.connect(
      "mongodb+srv://admin-um:admin12345678@cluster0.wlyyget.mongodb.net/ph-seceond?retryWrites=true&w=majority&appName=Cluster0"
    );
    server = app.listen(config.port, () => {
      console.log(`Example app listening: ${config.port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();
