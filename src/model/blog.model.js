import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: [{ type: String, required: true }],
    tags: [{ type: String, required: true }],
    image: { type: String, required: true },
    date: { type: String, required: true, default: new Date().toLocaleDateString() },
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
     },
    subSections: [{
        _id: false,
        title: { type: String, required: true },
        description: { type: String, required: true },
    }],
}, { timestamps: true })

const Blog = mongoose.models.blogSchema || mongoose.model('blog', blogSchema)

export default Blog