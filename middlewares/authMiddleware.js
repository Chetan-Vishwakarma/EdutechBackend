import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import UserModel from "../models/userSchema.js";

const authMiddleware = async (req,res,next) => {
    const { authorization } = req.headers;
    let token;
    if(authorization && authorization.startsWith('Bearer')){
        token = authorization.split(' ')[1];
        const {userId} = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await UserModel.findById({_id:userId}).select("-password");
        next();
    }else{
        res.status(404).json({ message: "Unauthorized user"})
    }
    if(!token){
        res.status(404).json({ message: "Unauthorized user, no token"})
    }
}

export default authMiddleware;