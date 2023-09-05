import express from "express";
import userRouter from "./routes/userRouter.js";
import adminRouter from "./routes/adminRouter.js";
import connectDB from "./database/db.js";
import cors from "cors";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(fileUpload({
    useTempFiles:true
}))
const port = process.env.PORT || 8000;
// const username = process.env.NAME;
// const password = process.env.PASSWORD;

const DATABASE = process.env.DATABASE;

connectDB(DATABASE);

app.use("/user",userRouter);
app.use("/admin",adminRouter);

app.listen(port,()=>console.log(`Server invoked at localhost:${port}`));