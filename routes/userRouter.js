import express from "express";
import userController from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

//route level middleware
router.post("/changePassword",authMiddleware);
router.post("/addToCourseList",authMiddleware);
router.delete("/removeFromCart",authMiddleware);
router.get("/mycourses",authMiddleware);
router.post("/AddToWishlist",authMiddleware);
router.get("/fetchWishListCourses",authMiddleware);
router.delete("/removeFromWishlist",authMiddleware)

//public routes
router.post("/register",userController.userRegistration);
router.post("/login",userController.userLogin);
router.get("/allcourses",userController.fetchAllCourses);

//private routes
router.post("/changePassword",userController.changePassword);
router.post("/addToCourseList",userController.addToCourseList);
router.get("/mycourses",userController.fetchMyCourses);
router.delete("/removeFromCart",userController.removeFromCart);
router.post("/AddToWishlist",userController.addToWishlist);
router.get("/fetchWishListCourses",userController.fetchWishListCourses);
router.delete("/removeFromWishlist",userController.removeFromWishlist);

export default router;