var express = require('express');
var router = express.Router();
var recursosDb = require("./recursos_db_mysql");

// GetRecursos
// Devuelve una lista de objetos con todos los recursos de la 
// base de datos.
// Si en la url se le pasa un nombre devuelve aquellos recursos
// que lo contengan.
router.get('/:empresaId', async(req, res, next) => {
    try{
        var nombre = req.query.nombre;

        let recursos = []
        if (nombre) {
            recursos = await recursosDb.getRecursosBuscar(nombre, req.params.empresaId)
            res.json(recursos);
        } else {
            recursos = await recursosDb.getRecursos( req.params.empresaId)
            res.json(recursos);
        }

    } catch(error) {
        next(error)
    }
  
    
});

// GetRecurso
// devuelve el recurso con el id pasado
router.get('/:recursoId/:empresaId', async(req, res, next) => {
    try {
        let recurso = await recursosDb.getRecurso(req.params.recursoId, req.params.empresaId)
        if(recurso.length == 0) return  res.status(404).send("recurso no encontrado");
        res.json(recurso[0]);
    } catch(error) {
        next(error)
    }
});


// PostRecurso
// permite dar de alta un recurso
router.post('/', async(req, res, next) => {
    try {
        var e = req.body.recurso;
        let result = await  recursosDb.postRecurso(e);
        res.json(result);
    } catch(error) {
        next(error)
    }
});



// PutRecurso
// modifica el recurso con el id pasado
router.put('/:recursoId', async(req, res, next) => {
    try {
        var e = req.body.recurso;
        let recurso = await  recursosDb.getRecurso(req.params.recursoId, e.empresaId);
        if (recurso.length == 0) return res.status(404).send("Recurso no encontrado");
         // ya sabemos que existe y lo intentamos modificar.
        let result = await recursosDb.putRecurso(req.params.recursoId, e);
        res.json(result);
    } catch(error) {
        next(error)
    }
});


// DeleteRecurso
// elimina un recurso de la base de datos
router.delete('/:recursoId/:empresaId', async(req, res, next) => {
    try {
        let result = await recursosDb.deleteRecurso(req.params.recursoId, req.params.empresaId);
        res.json(result);
    } catch(error) {
        next(error)
    }
});

// Exports
module.exports = router;