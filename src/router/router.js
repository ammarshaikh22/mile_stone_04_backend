import router from 'express'
import { addBlog, deleteBlog, findOwnBlog, getAllBlogs, updateBlog } from '../controller/blog.controller.js'
import { authenticated } from '../helper/authendicated.js'
import { upload } from '../helper/multer.js'

const route = router()

route.get('/blogs', getAllBlogs)
route.get('/myBlog', authenticated, findOwnBlog)
route.post('/addBlog', authenticated, upload.single('image'), addBlog)
route.put('/updateBlog/:id', authenticated, upload.single('image'), updateBlog)
route.delete('/deleteBlog/:id', authenticated, deleteBlog)

export default route