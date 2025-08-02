import express from "express";
import { addClient, getClients, uploadClientsFromCSV } from "../controllers/client.controller.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, addClient);
router.get("/", verifyToken, getClients);
// routes/clients.js
router.post("/upload", verifyToken, uploadClientsFromCSV);


export default router;
