import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/user.model.js";
import sendMail from "../utils/mailer.js";
import Blog from "../model/blog.model.js";

//signup user
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(name, email, password);
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
      path: "/",
      maxAge: 24 * 60 * 60 * 1000
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

//forget password
export const forget = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
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
      .json({ message: "password reset successfully", success: true });
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
    console.log(userBlogs);
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
