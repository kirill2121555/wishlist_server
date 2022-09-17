const { config } = require('dotenv')
require('dotenv').config()
const mongoose = require('mongoose')
const routers = require('./routers/router')
const PORT = process.env.PORT
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const app = express()

app.use(express.json())

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: 'https://wishlist-client.vercel.app/' }));



app.use('/', routers)

const start = async () => {
    try {
        await mongoose.connect(process.env.DB)
        app.listen(PORT, () => console.log('cool'))

    } catch (e) {
        console.log(e)
    }
}


start()