import Express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import merkRoute from "./routes/merkRoute.js";
import motorRoute from "./routes/motorRoute.js";
import kriteriaRoute from "./routes/kriteriaRoute.js";
import recommendationRoute from "./routes/recommendationRoute.js";

dotenv.config();

const app = Express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(Express.json());

// Home
app.get("/", (req, res) => {
  res.send("API Sistem Pendukung Keputusan Rekomendasi Motor Bekas - TOPSIS");
});

// Routes
app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/merks", merkRoute);
app.use("/motors", motorRoute);
app.use("/kriterias", kriteriaRoute);
app.use("/recommendations", recommendationRoute);

app.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`);
});