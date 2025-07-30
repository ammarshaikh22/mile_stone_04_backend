import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/user.model.js";
import sendMail from "../utils/mailer.js";
import Blog from "../model/blog.model.js";
import { uploadImageToCloudinary } from "../utils/cloud.midilware.js";
import { Domain } from "domain";
//signup user
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "please fill all fields" });
    }
    const alreadyEmail = await User.findOne({ email });
    if (alreadyEmail) {
      return res.status(400).json({ message: "user already exist" });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    await sendMail({
      email: email,
      emailType: "VERIFY",
      userId: user._id.toString(),
    });
    return res
      .status(200)
      .json({ message: "user created successfully", success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message + "try again" });
  }
};

//login user
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email && !password) {
      return res.status(400).json({ message: "invalid credentials" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    const MatchDecodePass = await bcryptjs.compare(password, user.password);
    if (!MatchDecodePass) {
      return res.status(402).json({ message: "password not matched" });
    } else if (!user.isVerified) {
      return res.status(401).json({ message: "please verify your email" });
    }
    const dataToken = {
      id: user._id,
    };
    const token = jwt.sign(dataToken, process.env.SECRET_TOKEN, {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000, 
      path: "/",
    });
    user.isLogin = true;
    await user.save();
    res.json({ message: "login successfully", success: true, token: token });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//verify user
export const verify = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(404)
        .json({ message: "verify token not found or expired" });
    }
    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();
    return res
      .status(200)
      .json({ message: "user verified successfully", success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//updatepassword
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, email, newPassword, confirmPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    const isMatch = await bcryptjs.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(404).json({ message: "current password not matched" });
    }
    if (confirmPassword !== newPassword) {
      return res.status(404).json({ message: "confirm password not matched" });
    }
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    await sendMail({
      email: email,
      emailType: "RESET",
      userId: user._id.toString(),
    });
    return res
      .status(200)
      .json({ message: "password Updated successfully", success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//get user deatils
export const getUser = async (req, res) => {
  try {
    if (!req.user)
      return res.status(400).json({ message: "Unauthorized no user found" });
    const user_id = req.user;
    const data = await User.findById(user_id);
    const userBlogs = await Blog.find(data._id ? { user: data._id } : {});
    if (!data) {
      return res.status(404).json({ message: "User not font" });
    }
    const someData = {
      name: data.name,
      email: data.email,
      profileImage: data.profileImage,
      isAdmin: data.isAdmin,
      _id: data._id,
      blogs: userBlogs,
    };
    return res
      .status(200)
      .json({ message: "user data get successfully", data: someData });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};
//get all user details
export const getAllUser = async (req, res) => {
  try {
    const data = await User.find({})
      .select(
        "-password -verifyToken -verifyTokenExpiry -forgotPassword -forgotPasswordExpiry"
      )
      .sort({ createdAt: -1 });
    if (!data) {
      return res.status(404).json({ message: "Users not font" });
    }
    return res
      .status(200)
      .json({ message: "user data get successfully", data: data });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

//logout user
export const logout = async (req, res) => {
  try {
    if (!req.user)
      return res.status(400).json({ message: "Unauthorized no user found" });
    const user_id = req.user;
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isLogin = false;
    await user.save();
    res.clearCookie("token");
    return res.status(200).json({ message: "logout successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//update user deatils
export const updateUser = async (req, res) => {
  try {
    if (!req.user)
      return res.status(400).json({ message: "Unauthorized no user found" });
    const user_id = req.user;
    const data = await User.findById(user_id);
    if (!data) {
      return res.status(404).json({ message: "User not found" });
    }
    const { name, email } = req.body;
    if (!req.file)
      return res.status(400).json({ message: "Image is required" });
    const file = await uploadImageToCloudinary(req.file?.path);
    if (!file) return res.status(500).json({ message: "Image upload failed" });
    data.name = name || data.name;
    data.email = email || data.email;
    data.profileImage = file || data.profileImage;
    await data.save();
    return res.status(200).json({ message: "User updated successfully", data });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};
