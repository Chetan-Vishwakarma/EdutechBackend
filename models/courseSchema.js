import mongoose from "mongoose";

const courseSchema = mongoose.Schema({
    _id: { type:Number, required:true },
    name:{ type:String, required:true, trim:true },
    price:{ type:String, required:true, trim:true },
    imageURL:{ type:String, required:true, trim:true },
    description:{ type:String, required:true, trim:true },
});

const CourseModel = mongoose.model("course",courseSchema);

export default CourseModel;