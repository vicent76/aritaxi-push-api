const express = require('express')
const router = express.Router()
const mysqlEmpresas = require('./empresas_mysql')

router.get("/test", async(req, res, next) => {
    try {
        const result = await mysqlEmpresas.test()
        res.json(result)
    } catch (error) {
        next(error)
    }
})

router.post("/", async(req, res, next) => {
    try {
        let empresa = req.body
        let r = await mysqlEmpresas.postEmpresa(empresa)
        res.json(r)
    } catch (error) {
        next(error)
    }
})

router.get("/", async(req, res, next) => {
    try {
        let r = await mysqlEmpresas.getEmpresas()
        res.json(r)
    } catch (error) {
        next(error)
    }
})

router.get("/:empresaId", async(req, res, next) => {
    try {
        let r = await mysqlEmpresas.getEmpresa(req.params.empresaId)
        if (!r) return res.status(404).json(`No existe una empresa con el empresaId = ${req.params.empresaId}`)
        res.json(r)
    } catch (error) {
        next(error)
    }
})

router.put("/", async(req, res, next) => {
    try {
        let empresa = req.body
        if (!empresa.empresaId || !empresa.mysqlBaseDatos) {
            return res.status(400).json("Debe indicar el identificador de la empresa (empresaId) y la base de datos asociada (mysqlBaseDatos)")
        }
        let r = await mysqlEmpresas.putEmpresa(empresa)
        res.json(r)
    } catch (error) {
        next(error)
    }
})

router.delete("/:empresaId", async(req, res, next) => {
    try {
        let r = await mysqlEmpresas.deleteEmpresa(req.params.empresaId)
        if (!r) return res.status(404).json(`No existe una empresa con el empresaId = ${req.params.empresaId}`)
        res.json(r)
    } catch (error) {
        next(error)
    }
})

router.post("/buscar-codigoweb", async(req, res, next) => {
    try {
        let empresa = req.body
        if (!empresa.codigoWeb) {
            return res.status(400).json(`Debe incluir el código de empresa (codigoWeb) en la petición.`)
        }
        let r = await mysqlEmpresas.postBuscarCodigoWeb(empresa.codigoWeb)
        if (!r) return res.status(404).json(`No se ha encontrado una empresa con el codigoWeb ${empresa.codigoWeb}`)
        res.json(r)
    } catch (error) {
        next(error)
    }
})

router.post("/buscar-accurl", async(req, res, next) => {
    try {
        let empresa = req.body
        if (!empresa.accUrl) {
            return res.status(400).json(`Debe incluir el código de empresa (accUrl) en la petición.`)
        }
        let r = await mysqlEmpresas.postBuscarAccUrl(empresa.accUrl)
        if (!r) return res.status(404).json(`No se ha encontrado una empresa con el accUrl ${empresa.accUrl}`)
        res.json(r)
    } catch (error) {
        next(error)
    }
})

module.exports = router