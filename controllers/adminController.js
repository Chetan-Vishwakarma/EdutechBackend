import CourseModel from "../models/courseSchema.js";
import cloudinary from "cloudinary";

// Configuration
cloudinary.config({
  cloud_name: "djvj8xzpe",
  api_key: "678818645335916",
  api_secret: "U8HDXX0H59QtHp0fWmkGUoYT-9U",
});

const createCourse = async (req, res) => {
  const { name, price, description } = req.body;
  const image = req?.files?.image;
  console.log(name,price,description,image);
  try {
    if (name && price && description && image) {
      cloudinary.uploader.upload(image.tempFilePath, async (result, err) => {
        if (result) {
          const allCourses = await CourseModel.find({});
          const doc = await new CourseModel({
            _id: allCourses.length > 0 ? allCourses.length + 1 : 1,
            name: name,
            price: price,
            imageURL:result.url,
            description: description,
          });
          await doc.save();
          res.status(200).json({ error:false, message: "Course added successfully"})
        } else {
          res.status(209).status({ error:true, message: "Unable to create course" });
        }
      });
    } else {
      res.status(209).json({ error:true, message: "All fields are required" });
    }
  } catch (err) {
    res.status(209).json({ message: "Unable to create course" });
  }
};

export default {
  createCourse,
};
