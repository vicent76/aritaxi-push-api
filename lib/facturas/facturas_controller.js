var express = require('express');
var router = express.Router();
var facturasCuotasMysql = require('./facturas_cuotas_mysql');
var facturasVentaSocioMysql = require('./facturas_venta_socio_mysql');
var facturasLiquidacionesMysql = require('./facturas_liquidaciones_mysql'); 
var facturasPublicidadMysql = require('./facturas_publicidad_mysql'); 
var envCorreo = require('../comun/enviar_correos');

// Devuelve todas las facturas de un cliente determinado (Cuotas)
router.get('/cuotas/:codclien/:year/:empresaId', async (req, res, next)  =>{
    try {
        var codclien = req.params.codclien;
        var year = req.params.year;
        var empresaId = req.params.empresaId;
        if (codclien && year) {
            const f = await facturasCuotasMysql.getFacturasCuotasCliente(codclien, year, empresaId)
            return res.json(f);
        } else {
            return res.status(400).send('Formato de la petición incorrecto');
        }
    } catch(err) {
        next(err);
    }
});


// Devuelve todas las facturas de un cliente determinado (liquidaciones)
router.get('/liquidaciones/:codclien/:year/:empresaId', async (req, res, next)  =>{
    try {
        var codclien = req.params.codclien;
        var year = req.params.year;
        var empresaId = req.params.empresaId;
        if (codclien && year) {
            const f = await facturasLiquidacionesMysql.getFacturasLiquidaciones(codclien, year, empresaId)
            return res.json(f);
        } else {
            return res.status(400).send('Formato de la petición incorrecto');
        }
    } catch(err) {
        next(err);
    }
});

// Devuelve todas las facturas de un cliente determinado (Cuotas)
router.get('/ventas-socio/:codclien/:year/:empresaId', async (req, res, next)  =>{
    try {
        var codclien = req.params.codclien;
        var year = req.params.year;
        var empresaId = req.params.empresaId;
        if (codclien && year) {
            const f = await facturasVentaSocioMysql.getFacturasVentaSocio(codclien, year, empresaId)
            return res.json(f);
        } else {
            return res.status(400).send('Formato de la petición incorrecto');
        }
    } catch(err) {
        next(err);
    }
});

// Devuelve todas las facturas de un cliente determinado (publicidad)
router.get('/publicidad/:codclien/:year/:empresaId', async (req, res, next)  =>{
    try {
        var codclien = req.params.codclien;
        var year = req.params.year;
        var empresaId = req.params.empresaId;
        if (codclien && year) {
            const f = await facturasPublicidadMysql.getFacturasPublicidad(codclien, year, empresaId)
            return res.json(f);
        } else {
            return res.status(400).send('Formato de la petición incorrecto');
        }
    } catch(err) {      
        next(err);
    }
});




// --------------------INFORME FACTURA -----------------------------



//Envio de pdf por correo de cuotas
router.post('/cuotas/correo/esto', function(req, res) {
    var codclien = req.body.codclien;
    var year = req.body.fecfactu;
    var numfactu = req.body.numfactu;
    var letraser = req.body.letraser;
    var informe = req.body.informe;
    if (codclien && year) {
        facturasCuotasMysql.postPrepararCorreosCuotas(codclien, year, numfactu, letraser, informe, function(err, facturas) {
            if (err) {
                return res.status(500).send(err.message);
            }
            return res.json(facturas)
        });
    } else {
        return res.status(400).send('Formato de la petición incorrecto');
    }
});



 router.post('/enviar/correo/comun', function (req, res) {
    var numfactu = req.body.numfactu;
    var email = req.body.email;
    var ruta = req.body.ruta;
    var coop = req.body.coop;
    var codtipom = req.body.codtipom;
    envCorreo.crearCorreosAEnviar(numfactu, email, ruta, coop, codtipom, (err, data) => {
        if (err) return res.status(500).send(err.message);
        var msg = data;
        res.json(msg);
    })
 });
 
 
module.exports = router;
