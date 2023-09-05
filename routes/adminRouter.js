import express from "express";
import adminController from "../controllers/adminController.js"
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

//route level middleware
router.post("/createCourse", authMiddleware);

//private route
router.post("/createCourse", adminController.createCourse);

export default router;