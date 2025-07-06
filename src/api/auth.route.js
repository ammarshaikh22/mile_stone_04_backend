import router from 'express'
import { forget, getUser, Login, logout, signup, verify } from '../controller/user.controller.js'
import { authenticated } from '../helper/authendicated.js'


const authRoute = router()

authRoute.post('/login', Login)
authRoute.post('/logout',authenticated, logout)
authRoute.post('/signup', signup)
authRoute.post('/verify', verify)
authRoute.post('/forget', forget)
authRoute.get('/getUser',authenticated, getUser)

export default authRoute