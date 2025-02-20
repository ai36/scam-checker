/* global process */
/* eslint-env node */
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import checkUrlRouter from "./api/check-url.js";

dotenv.config();

const app = express();

// Получаем __dirname для ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Разрешаем CORS для http://localhost:5173 (или используйте '*' для всех)
app.use(cors({
  origin: "http://localhost:5173"
}));

// Подключаем JSON-парсер
app.use(express.json());

// Обслуживаем статические файлы из папки build (если есть)
app.use(express.static(path.join(__dirname, "build")));

// Подключаем API-роутер по пути /api/check-url
app.use("/api/check-url", checkUrlRouter);

// Для всех остальных запросов отдаем index.html (для клиентской части)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
