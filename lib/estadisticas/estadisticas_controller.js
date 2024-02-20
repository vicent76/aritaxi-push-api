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

router.get("/servicios", async(req, res, next) => {
    try {
        let desdeFecha = req.query.desdeFecha
        let hastaFecha = req.query.hastaFecha
        let pagina = req.query.pagina
        const result = await alfaEstadisticas.historicoServicios(desdeFecha, hastaFecha, pagina)
        res.json(result)
    } catch (error) {
        next(error)
    }
})

router.get("/buscar-estadisticas/:dFecha/:hFecha/:licencia", async(req, res, next) => {
    try {
        let dFecha = req.params.dFecha;
        let hFecha = req.params.hFecha;
        let licencia = req.params.licencia;
        const result = await mysqlEstadisticas.getEstadisticas(dFecha, hFecha, licencia)
        res.json(result)
    } catch (error) {
        next(error)
    }
})

module.exports = router