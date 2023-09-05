import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    _id: { type:Number, required:true },
    name:{ type:String, required:true, trim:true },
    email:{ type:String, required:true, trim:true },
    password:{ type:String, required:true, trim:true },
    myCourses:{ type:Array },
    role:{ type:String, required:true, trim:true },
    myWishlist:{type:Array},
});

const UserModel = mongoose.model("users",userSchema);

export default UserModel;