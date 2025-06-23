import { uploadImageToCloudinary } from "../utils/cloud.midilware.js";
import Blog from "../model/blog.model.js";

//Get All the Blogs from the database
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("user", "name profileImage");
    if (blogs.length === 0) {
      return res
        .status(404)
        .json({ message: "No blogs found yet please add one" });
    }
    res.status(200).json({ message: "success", data: blogs });
  } catch (error) {
    res.status(500).json({ message: "failed", error: error.message });
  }
};
//Get single the Blog from the database
export const getSingleBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id).populate("user", "name profileImage");
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json({ message: "success", data: blog });
  } catch (error) {
    res.status(500).json({ message: "failed", error: error.message });
  }
};

//Post the single blog in the data base
export const addBlog = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ message: "Unauthorized no user found" });
    const { title, description, category, subSections } = req.body;
    if (!title || !description || !category ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!req.file)
      return res.status(400).json({ message: "Image is required" });
    console.log(req.file.path);
    const file = await uploadImageToCloudinary(req.file?.path);
    if (!file) return res.status(500).json({ message: "Image upload failed" });
    const parsedSubSections = JSON.parse(subSections);
    const blog = await Blog.create({
      title,
      description,
      category,
      image: file,
      user: user._id,
      subSections: parsedSubSections,
    });
    return res.status(201).json({ message: "Add Successfully", blog });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "failed", error: error.message });
  }
};

//update the blog in the database
export const updateBlog = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ message: "Unauthorized no user found" });
    const { id } = req.params;
    const is_blog = await Blog.findById(id);
    if (!is_blog) return res.status(404).json({ message: "Blog not found" });
    if (is_blog.user.toString() !== user._id.toString()) {
      return res
        .status(401)
        .json({ message: "you can only update your own blog" });
    }
    const { title, description, category, subSections } = req.body;
    if (!title && !description && !category) {
      return res.status(400).json({ message: "No changes found" });
    }
    let file;
    if (req.file?.path) {
      file = await uploadImageToCloudinary(req.file?.path);
      if (!file)
        return res.status(500).json({ message: "Image upload failed" });
    }
    const parsedSubSections = subSections && JSON.parse(subSections);
    const updated_blog = await Blog.findByIdAndUpdate(
      id,
      {
        title: title || is_blog.title,
        description: description || is_blog.description,
        category: category || is_blog.category,
        image: file || is_blog.image,
        user: is_blog.user,
        subSections: parsedSubSections || is_blog.subSections,
      },
      { new: true }
    );
    return res.status(201).json({ message: "updated", updated_blog });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "failed", error: error.message });
  }
};

//delete the blog from the database
export const deleteBlog = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ message: "Unauthorized no user found" });
    const { id } = req.params;
    const is_blog = await Blog.findById(id);
    if (!is_blog) return res.status(404).json({ message: "Blog not found" });
    if (is_blog.user.toString() !== user._id.toString()) {
      return res
        .status(401)
        .json({ message: "you can only delete your own blog" });
    }
    await Blog.findByIdAndDelete(id);
    return res.status(201).json({ message: "deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "failed", error: error.message });
  }
};
//find my own blog from the database
export const findOwnBlog = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ message: "Unauthorized no user found" });
    const my_blog = await Blog.findOne({ user: user._id });
    if (!my_blog) return res.status(404).json({ message: "Blog not found" });
    return res.status(201).json({ message: "success", my_blog });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "failed", error: error.message });
  }
};
