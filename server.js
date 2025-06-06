import express from 'express'
import 'dotenv/config'
import cor from 'cors'
import { connect } from './src/db/connect.js'
import route from './src/api/router.js'
import authRoute from './src/api/auth.route.js'
import cookieParser from 'cookie-parser'


const app = express()
app.use(express.json({ limit: "20mb" }))
app.use(express.urlencoded({ limit: "20mb", extended: true }))
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