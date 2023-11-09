var express = require('express');
var router = express.Router();
var parametrosDb = require("./parametros_db_mysql");


router.get('/:parametroId/:empresaId', async (req, res, next) => {
    try {
        let parametro = await parametrosDb.getParametro(req.params.parametroId, req.params.empresaId)
        if (!parametro) {
            return res.status(404).send("Parametro no encontrado");
        } else {
            res.json(parametro);
        }
    } catch(error) {
        next(error)
    }
});

// PostParametro
// permite dar de alta un parametro
router.post('/', function(req, res) {
    parametrosDb.postParametro(req.body.parametro, function(err, parametro) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(parametro);
        }
    });
});



// PutParametro
// modifica el parametro con el id pasado
router.put('/:parametroId/:empresaId', async(req, res, next) => {
    try {
        let parametro = await parametrosDb.getParametro(req.params.parametroId, req.params.empresaId);
        if (!parametro) {
            return res.status(404).send("Parametro no encontrado");
        } else {
            let result = await parametrosDb.putParametro(req.params.parametroId, req.params.empresaId, req.body.parametro);
            if(result) res.json(result);
        }
    } catch(error) {
        next(error);
    }
});

// DeleteParametro
// elimina un parametro de la base de datos
router.delete('/:parametroId', function(req, res) {
    var parametro = req.body.parametro;
    parametrosDb.deleteParametro(req.params.parametroId, parametro, function(err, parametro) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(null);
        }
    });
});

// Exports
module.exports = router;