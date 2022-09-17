const mongoose = require('mongoose')
const routers = require('./routers/router')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { config } = require('dotenv')
require('dotenv').config()

const PORT = process.env.PORT

const app = express()

app.use(express.json())

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: 'https://wishlist-client.vercel.app/' }));

app.use('/', routers)

const start = async () => {
    try {
        await mongoose.connect('mongodb+srv://wishlistdb:fpJvnypWHGczSktz@cluster0.0b8yb4c.mongodb.net/?retryWrites=true&w=majority')
        app.listen(PORT, () => console.log('cool'))

    } catch (e) {
        console.log(e)
    }
}


start()