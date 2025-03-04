require('dotenv').config({path:'../.env.development.local'})
const express = require('express')
const cors = require('cors')
const {Pool} = require('pg')
const axios = require('axios')
const cron = require('node-cron')
const nodemailer = require('nodemailer')

const app = express()
app.use(express.json())

// PostgreSQL Setup
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.NODE_ENV == 'Development' ? 'localhost' : process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASS),
    port: process.env.DB_PORT,
})

app.post('/subscribe', async (req,res) => {
    const {email,location,alert_condition} = req.body
    try {
        await pool.query(
            `INSERT INTO users (email, location, alert_condition) VALUES ($1,$2,$3)`,
            [email,location,alert_condition]
        )
        res.status(201).json({message: 'Subscription successful!'})
    } catch(err){
        console.error(err);
        res.status(500).json({error: 'Database Error'})
    }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})