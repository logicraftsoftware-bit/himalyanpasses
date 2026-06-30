import "dotenv/config";
import express from "express";
import apiRoutes from "./routes/api.js";
import { connectDB, seedDB } from "./db.js";

const app = express();
let dbReadyPromise = null;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(async (req, res, next) => {
  try {
    if (!dbReadyPromise) {
      dbReadyPromise = connectDB().then(seedDB);
    }

    await dbReadyPromise;
    next();
  } catch (error) {
    next(error);
  }
});

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send({ status: "himalayan passes backend", version: "0.1.0" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
