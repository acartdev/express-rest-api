require('dotenv').config()
const express = require ('express')
const router = require('./src/router')
const bodyPaser = require('body-parser')
const app = express()

const port = process.env.PORT

app.use(express.json())
app.use(bodyPaser.json())
app.use(router)
app.listen(port, ()=>{
    console.log(`Listening to my loginApp on port ${port}`)
})
