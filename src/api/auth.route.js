import router from 'express'
import { getAllUser, getUser, Login, logout, signup, updatePassword, updateUser, verify } from '../controller/user.controller.js'
import { authenticated } from '../helper/authendicated.js'
import { upload } from '../helper/multer.js'

const authRoute = router()

authRoute.post('/login', Login)
authRoute.post('/logout',authenticated, logout)
authRoute.post('/signup', signup)
authRoute.post('/verify', verify)
authRoute.post('/updatePass', updatePassword)
authRoute.get('/getUser',authenticated, getUser)
authRoute.get('/getAllUser', getAllUser)
authRoute.put('/updateUser',authenticated,upload.single('image'), updateUser)

export default authRoute