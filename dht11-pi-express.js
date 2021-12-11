const cors = require('cors')
const express = require('express')
const sensor = require("node-dht-sensor")

const config = require('./config.json')


let currentReading = {
    tempC: -1,
    humidity: -1,
    measuredAt: 0
}

const read = async () => {
    return new Promise(res => {
        sensor.read(11, config.dhtPin, function(err, sensTempC, sensHumidity) {
            if (!err) {
               currentReading = {
                   tempC: sensTempC + config.offsets.tempC,
                   humidity:  (sensHumidity / 100) + config.offsets.humidity,
                   measuredAt: new Date()
               }
            }
            res()
        });
    })
}

const app = express()
app.use(cors())
app.get('/', async (req, res) => {
    if (currentReading.measuredAt < (Date.now() - config.readingTimeoutMs)) {
        await read()
    }
    res.send(currentReading)
})
app.listen(config.port, () => console.log("started"))
