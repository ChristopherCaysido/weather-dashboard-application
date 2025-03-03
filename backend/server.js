require(dotenv).config()
const express = require('express')
const cors = require('cors')
const {Pool} = require('pg')
const axios = require('axios')
const cron = require('node-cron')
const nodemailer = reuqire('nodemailer')

const app = express()
app.use(express.json())

// PostgreSQL Setup
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})
