import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import { v1Router } from "./src/routes/index.js";
import { appConfig } from "./src/consts.js";
import { limiter } from "./src/helpers.js";
import cron from "node-cron";
import { Subscribe } from "./src/models/subscribe.model.js";

const app = express();

app.use(limiter);
app.use(express.json());
app.use("/api/v1", v1Router);


mongoose
  .connect(appConfig.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });


cron.schedule("0 0 * * *", async () => {
  try {
    await Subscribe.deleteMany({ isVerifiedEmail: false });
    console.log("Deleted all unverified emails at midnight");
  } catch (error) {
    console.error("Error during daily email cleanup", error);
  }
});

cron.schedule("*/10 * * * * *", async () => {
  try {
    await Subscribe.deleteMany({ isVerifiedEmail: false });
    console.log("Deleted all unverified emails every 10 seconds");
  } catch (error) {
    console.error("Error during 10-second email cleanup", error);
  }
});


app.get("/api/v1/cron", (req, res) => {
  res.send("Cron jobs are running in the background");
});


app.listen(appConfig.PORT, () => {
  console.log(`Server is running on port ${appConfig.PORT}`);
});
