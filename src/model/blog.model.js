import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: [{ type: String }],
    image: { type: String, required: true },
    date: { type: String, required: true, default: new Date().toLocaleDateString() },
    user: { type: String, required: true },
    subSections: [{
        _id: false,
        title: { type: String, required: true },
        description: { type: String, required: true },
    }],
}, { timestamps: true })

const Blog = mongoose.models.blogSchema || mongoose.model('blog', blogSchema)

export default Blog