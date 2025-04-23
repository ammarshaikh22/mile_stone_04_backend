import express from 'express'
import 'dotenv/config'
import cor from 'cors'
import { connect } from './src/db/connect.js'
import route from './src/router/router.js'
import authRoute from './src/router/auth.route.js'
import cookieParser from 'cookie-parser'
const app = express()
app.use(express.json())
app.use(cor())
app.use(cookieParser())
app.use('/api/v2', route)
app.use('/api/v1', authRoute)
const port = process.env.PORT


connect().then(() => {
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}).catch((err) => {
    console.log(err)
})