import router from 'express'
import { forget, Login, signup, verify } from '../controller/user.controller.js'


const authRoute = router()

authRoute.post('/login', Login)
authRoute.post('/signup', signup)
authRoute.post('/verify', verify)
authRoute.post('/forget', forget)

export default authRoute