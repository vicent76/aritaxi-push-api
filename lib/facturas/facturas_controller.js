var express = require('express');
var router = express.Router();
var facturasCuotasMysql = require('./facturas_cuotas_mysql');
var facturasVentaSocioMysql = require('./facturas_venta_socio_mysql');
var facturasGasolineraMysql = require('./facturas_gasolinera_mysql');
var facturasLiquidacionesMysql = require('./facturas_liquidaciones_mysql');
var facturasVariasMysql =  require('./facturas_varias_mysql');  
var envCorreo = require('../comun/enviar_correos');
var facturasAceiteMysql = require('./facturas_aceite_mysql');
var cod = 0;
var mysql2 = require('mysql2/promise');

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

// Devuelve todas las facturas de un cliente determinado (Aceite)
router.get('/aceite/:codsocio/:year', function(req, res) {
    var codsocio = req.params.codsocio;
    var year = req.params.year;
    if (codsocio && year) {
        facturasAceiteMysql.getFacturasAceiteCliente(codsocio, year, function(err, facturas) {
            if (err) {
                return res.status(500).send(err.message);
            }
            return res.json(facturas)
        });
    } else {
        return res.status(400).send('Formato de la petición incorrecto');
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

// Devuelve todas las facturas de un cliente determinado (Gasolinera)
router.get('/gasolinera/:codclien/:year', function(req, res) {
    var codclien = req.params.codclien;
    var year = req.params.year;
    if (codclien && year) {
        facturasGasolineraMysql.getFacturasGasolineraCliente(codclien, year, function(err, facturas) {
            if (err) {
                return res.status(500).send(err.message);
            }
            return res.json(facturas)
        });
    } else {
        return res.status(400).send('Formato de la petición incorrecto');
    }
});

router.get('/varias/:campanya', function(req, res) {
    
    var campanya = req.params.campanya;
    if (campanya) {
        facturasVariasMysql.getFacturasVariasCliente(campanya, cod, function(err, facturas) {
            if (err) {
                return res.status(500).send(err.message);
            }
            return res.json(facturas)
        });
    } else {
        return res.status(400).send('Formato de la petición incorrecto');
    }
});

router.get('/varias/bis/:codsocio/:campanya', function(req, res) {
    
    var campanya = req.params.campanya;
    var codsocio = req.params.codsocio;
    if (campanya && codsocio) {
        facturasVariasMysql.getFacturasVariasCliente(campanya, codsocio, function(err, facturas) {
            if (err) {
                return res.status(500).send(err.message);
            }
            return res.json(facturas)
        });
    } else {
        return res.status(400).send('Formato de la petición incorrecto');
    }
});

// --------------------INFORME FACTURA -----------------------------

//Envio de pdf por correo de gasolnera
router.post('/gasolinera/correo/', function(req, res) {
    var codclien = req.body.codclien;
    var year = req.body.fecfactu;
    var numfactu = req.body.numfactu;
    var letraser = req.body.letraser;
    var informe = req.body.informe;
    if (codclien && year) {
        facturasGasolineraMysql.postPrepararCorreosGasol(codclien, year, numfactu, letraser, informe, function(err, facturas) {
            if (err) {
                return res.status(500).send(err.message);
            }
            return res.json(facturas)
        });
    } else {
        return res.status(400).send('Formato de la petición incorrecto');
    }
});


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
