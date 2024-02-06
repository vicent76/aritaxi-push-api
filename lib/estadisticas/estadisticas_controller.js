const express = require('express')
const router = express.Router()
const mysqlEstadisticas = require('./estadisticas_mysql')
const alfaEstadisticas = require('./estadisticas_alfa')

router.get("/test", async(req, res, next) => {
    try {
        const result = await mysqlEstadisticas.test()
        res.json(result)
    } catch (error) {
        next(error)
    }
})

router.get("/fecha_actual", async(req, res, next) => {
    try {
        const result = await alfaEstadisticas.fechasMesActual()
        res.json(result)
    } catch (error) {
        next(error)
    }
})

module.exports = router