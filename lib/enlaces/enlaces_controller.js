var express = require('express');
var router = express.Router();
var enlacesDb = require("./enlaces_db_mysql");

// GetEnlaces
// Devuelve una lista de objetos con todos los enlaces de la 
// base de datos.
// Si en la url se le pasa un nombre devuelve aquellos enlaces
// que lo contengan.
router.get('/:empresaId', async(req, res, next) => {
    try{
        var nombre = req.query.nombre;
        let enlaces = [0];
        if (nombre) {
            enlaces = await  enlacesDb.getEnlacesBuscar(nombre, req.params.empresaId)
            res.json(enlaces);
        } else {
            enlaces = await enlacesDb.getEnlaces( req.params.empresaId)
            res.json(enlaces);
        }

    } catch(error) {
        next(error)
    }
});

// GetEnlace
// devuelve el enlace con el id pasado
router.get('/:enlaceId/:empresaId', async(req, res, next) => {
    try {
        let enlace = await enlacesDb.getEnlace(req.params.enlaceId, req.params.empresaId)
        if(enlace.length == 0) return  res.status(404).send("Enlace no encontrado");
        res.json(enlace[0]);
    } catch(error) {
        next(error)
    }
});


// PostEnlace
// permite dar de alta un enlace
router.post('/', async(req, res, next) => {
    try {
        let enlace = await  enlacesDb.postEnlace(req.body.enlace);
        res.json(enlace);
    } catch(error) {
        next(error)
    }
});



// PutEnlace
// modifica el enlace con el id pasado
router.put('/:enlaceId', async(req, res, next) => {
    try {
        var e = req.body.enlace;
        let enlace = await  enlacesDb.getEnlace(req.params.enlaceId, e.empresaId);
        if (enlace.length == 0) return res.status(404).send("Enlace no encontrado");
         // ya sabemos que existe y lo intentamos modificar.
        let result = await enlacesDb.putEnlace(req.params.enlaceId, e);
        res.json(result);
    } catch(error) {
        next(error)
    }
});

// DeleteEnlace
// elimina un enlace de la base de datos
router.delete('/:enlaceId/:empresaId', async(req, res, next) => {
    try {
            let enlace = await enlacesDb.deleteEnlace(req.params.enlaceId, req.params.empresaId);
            res.json(enlace);
        } catch(error) {
            next(error);
        }
});


// Exports
module.exports = router;