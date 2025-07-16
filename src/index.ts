import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);

app.get("/", (_req, res) => {
  res.send("Backend is running");
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});

