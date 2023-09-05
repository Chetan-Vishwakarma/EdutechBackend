import UserModel from "../models/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import CourseModel from "../models/courseSchema.js";

const userRegistration = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const user = await UserModel.findOne({ email: email });
  if (user) {
    res.status(209).json({ error:true, message: "Email already exists" });
  } else {
    if (name && email && password && confirmPassword) {
      if (password === confirmPassword) {
        try {
          const salt = await bcrypt.genSalt(10);
          const hashpassword = await bcrypt.hash(password, salt);
          const allUsers = await UserModel.find({});
          const doc = new UserModel({
            _id: allUsers.length > 0 ? allUsers.length + 1 : 1,
            name: name,
            email: email,
            password: hashpassword,
            myCourses: [],
            myWishlist: [],
            role: allUsers.length > 0 ? "user" : "admin",
          });
          await doc.save();
          const saved_user = await UserModel.findOne({ email: email });
          //Generate Token
          const token = jwt.sign(
            { userId: saved_user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "5d" }
          );
          res
            .status(201)
            .json({ error:false, message: "User Registered Successfully", token: token });
        } catch (err) {
          res
            .status(209)
            .json({ error:true, message: "Unable to registration" });
        }
      } else {
        res
          .status(209)
          .json({ error:true, message: "Password and confirm-password doesn't match" });
      }
    } else {
      res.status(209).json({ error:true, message: "All field are required" });
    }
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const user = await UserModel.findOne({ email: email });
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (email === user.email && isMatch) {
          //Generate token
          const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "5d" }
          );
          res
            .status(200)
            .json({ error:false, message: "Login success", role: user.role, token: token });
        } else {
          res.status(209).json({ error:true, message: "Email and Password is not valid" });
        }
      } else {
        res.status(209).json({ error:true, message: "You are not a registered user" });
      }
    } else {
      res.status(209).json({ error:true, message: "All field are required" });
    }
  } catch (err) {
    res.status(209).json({ error:true, message: "Unable to loggin" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { old_Password, password, confirm_Password } = req.body;
    const user = await UserModel.findOne({ _id: req.user._id });

    const isMatch = await bcrypt.compare(old_Password, user.password);
    if (old_Password && password && confirm_Password) {
      if (isMatch) {
        if (password === confirm_Password) {
          const salt = await bcrypt.genSalt(10);
          const newHashPassword = await bcrypt.hash(password, salt);

          await UserModel.findByIdAndUpdate(user._id, {
            $set: { password: newHashPassword },
          });
          res.status(200).json({ message: "Password updated successfully" });
        } else {
          res
            .status(209)
            .json({ message: "Password and confirm password doesn't match" });
        }
      } else {
        res.status(209).json({ message: "Old password doesn't match" });
      }
    } else {
      res.status(209).json({ message: "All fields are required" });
    }
  } catch (err) {
    res.status(209).json({ message: "Unable to change password" });
  }
};

const addToCourseList = async (req, res) => {
  try {
    let myCourses;
    if (req.body._id) {
      const course = await CourseModel.findById(req.body._id);
      if (course) {
        if (req.user.myCourses.length > 0) {
          if (!req.user.myCourses.includes(course._id)) {
            myCourses = [...req.user.myCourses, course._id];
            await UserModel.findByIdAndUpdate(req.user._id, {
              $set: { myCourses: myCourses },
            });
            res
              .status(200)
              .json({ error:false, message: "Course added to your course cart" });
          } else {
            res
              .status(209)
              .json({
                error:true,
                message: "This course is already included in your cart",
              });
          }
        } else {
          myCourses = course._id;
          await UserModel.findByIdAndUpdate(req.user._id, {
            $set: { myCourses: myCourses },
          });
          res.status(200).json({ error:false, message: "Course added to your course cart" });
        }
      } else {
        res.status(209).json({ error:true, message: "Course is not found" });
      }
    } else {
      res
        .status(209)
        .json({
          error:true,
          message: "Unable to process, field is empty",
        });
    }
  } catch (err) {
    res
      .status(209)
      .json({
        error:true,
        message: "Unable to to add this course in your course list line-142",
      });
  }
};

const fetchMyCourses = async (req, res) => {
  let coursesId = req.user.myCourses;
  let courses = [];
  if (coursesId.length > 0) {
    try {
      for (let i = 0; i < coursesId.length; i++) {
        const doc = await CourseModel.findById(coursesId[i]);
        courses.push(doc);
      }
      res.status(201).json({ error:false, data:courses});
    } catch (err) {
      res.status(200).json({ error:true, message: "Unable to fetch data" });
    }
  } else {
    res.status(200).json({ error:true, data:courses, message: "Your course list is empty" });
  }
};

const fetchAllCourses = async (req, res) => {
  try {
    const courses = await CourseModel.find({});
    res.status(200).json({ error:false, data:courses });
  } catch (err) {
    res.status(209).json({ error:true, message: "Unable to fetch data" });
  }
};

const removeFromCart = async (req, res) => {
  let user = req.user;
  let id = Number(req.query.id);
  if (id !== undefined || null) {
    let updatedCourse = user.myCourses.filter((item) => {
      return item !== id;
    });
    try {
      await UserModel.findByIdAndUpdate(user._id, { myCourses: updatedCourse });
      res.status(201).json({ error:false, message: "Item removed from cart successfully" });
    } catch (err) {
      res
        .status(209)
        .json({ error:true, message: "Unable to remove this item from your cart" });
    }
  } else {
    res.status(209).json({ error:true, message: "All fields are required" });
  }
};

const addToWishlist = async (req, res) => {
  let id = Number(req.query.id);
  let wishList;
  if (req.user.myWishlist.includes(id)) {
    res
      .status(209)
      .json({ error: true, message: "This item is already in your wishlist" });
  } else {
    wishList = req.user.myWishlist;
    wishList.push(id);
    try {
      await UserModel.findByIdAndUpdate(req.user._id, { myWishlist: wishList });
      res
        .status(201)
        .json({ error: false, message: "Item added to your wishlist" });
    } catch (err) {
      res
        .status(209)
        .json({
          error: true,
          message: "Unable to save this item into your wishlist",
        });
    }
  }
};

const fetchWishListCourses = async(req,res) => {
  let allCourses = [];
  try{
    for(let i=0; i<req?.user?.myWishlist?.length; i++){
      let doc = await CourseModel.findById(req?.user?.myWishlist[i]);
      allCourses.push(doc);
    }
    if(allCourses.length>0){
      res.status(200).json({ error:false, data:allCourses });  
    }else{
      res.status(209).json({ error:true, data:[], message:"Your wishlist is empty" });  
    }
  }catch(err){
    res.status(209).json({ error:true, message:"Unable to fetch your wishlist course" });
  }
}

const removeFromWishlist = async(req,res) => {
  let id = Number(req.query.id);
  let user = req.user;
  if(id){
    let updatedData = user.myWishlist.filter((item)=>item!==id);
    try{
      await UserModel.findByIdAndUpdate(user._id,{myWishlist:updatedData});
      res.status(201).json({ error:false, message:"Item removed successfully from wishlist" });
    }catch(err){
      res.status(209).json({ error:true, message:"Unable to remove this item { Internal Server Error }" });
    }
  }else{
    res.status(209).json({ error:true, message:"Unable to remove this item because you have not given any query param like { id:_ }" })
  }
}

const userController = {
  userRegistration,
  userLogin,
  changePassword,
  addToCourseList,
  fetchMyCourses,
  fetchAllCourses,
  removeFromCart,
  addToWishlist,
  fetchWishListCourses,
  removeFromWishlist
};

export default userController;
