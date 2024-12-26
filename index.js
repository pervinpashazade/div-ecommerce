import express from "express";
import monngose from "mongoose";
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

monngose
  .connect(appConfig.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

app.get("/api/v1/cron", (req, res) => {
  // every day on 00:00
  //   cron.schedule("0 0 * * *", async () => {
  //     await Subscribe.deleteMany({
  //       isVerifiedEmail: false,
  //     }).then(() => {
  //       console.log("Deleted all unverified emails");
  //     });

  //     console.log("running a task every day on 00:00");
  //   });

  cron.schedule("*/10 * * * * *", async () => {
    await Subscribe.deleteMany({
      isVerifiedEmail: false,
    }).then(() => {
      console.log("Deleted all unverified emails");
    });

    console.log("running a task every 10 seconds");
  });
  res.send("Cron job started");
});

app.listen(appConfig.PORT, () => {
  console.log("Server is running on port 8080");
});
