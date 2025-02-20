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

// Для ES Modules получаем __dirname:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Разрешаем запросы с http://localhost:5173 (или используйте '*' для всех)
app.use(cors({
  origin: "http://localhost:5173"
}));

// Подключаем JSON-парсер
app.use(express.json());

// Если у вас есть клиентская сборка, обслуживаем статические файлы
app.use(express.static(path.join(__dirname, "build")));

// Подключаем роутер для API
app.use("/api", checkUrlRouter);

// Для всех остальных запросов отдаем index.html (если клиентская часть)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
