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
// Weather Data
// https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}
// Geocode
// http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}

async function fetchGeocode(location){
    try{
        const geocode_url = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${process.env.OW_API}`
        const response = await axios.get(geocode_url)
        if(response.data && response.data.length > 0){
            return {
                lat: response.data[0].lat,
                lon: response.data[0].lon,
            }
        }
        return null
    } catch (error){
        console.error('Error fetching the geocode', err)
        return null
    }
}

async function fetchWeather(location) {
    try{
        const locationData = fetchGeocode(location)

        if(!locationData) {
            throw new Error('Could not get the location coordinates')
        }
        const api_url = `https://api.openweathermap.org/data/3.0/onecall?lat=${locationData.lat}&lon=${locationData.lon}&exclude={part}&appid=${process.env.OW_API}`
        const response = await axios.get(api_url)
        return response.data;
    } catch (error){
        console.error('Error fetching the weather',error)
        return null
    }
    
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})