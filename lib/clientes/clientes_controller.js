var express = require('express');
var router = express.Router();
var clientesDb = require("./clientes_db_mysql");


// Login
// comprueba si hay algún cliente con el login y password pasados
// si lo encuentra lo devuelve como objeto, si no devuelve nulo.
router.get('/login', function(req, res) {
    // confirmar que se han recibido correctamente los parámetros
    // login: identificador del usuario para el login
    // password: password asignada
    query = req.query;
    if (query.login && query.password) {
        clientesDb.getLogin(query.login, query.password, function(err, usuario) {
            if (err) {
                return res.status(500).send(err.message);
            }
            if (usuario) {
                return res.json(usuario)
            } else {
                return res.status(404).send('Usuario no encontrado');
            }
        });
    } else {
        return res.status(400).send('Formato de la petición incorrecto');
    }
});



// GetClientes
// Devuelve una lista de objetos con todos los clientes de la 
// base de datos.
// Si en la url se le pasa un nomclien devuelve aquellos clientes
// que lo contengan.
router.get('/:empresaId', async(req, res, next) => {
    try{
        var nomclien = req.query.nomclien;

        let clientes = []
        if (nomclien) {
            clientes = await  clientesDb.getClientesBuscar(nomclien, req.params.empresaId)
            res.json(clientes);
        } else {
            clientes = await clientesDb.getClientes( req.params.empresaId)
            res.json(clientes);
        }

    } catch(error) {
        next(error)
    }
  
    
});

// GetClientesLogados
// Devuelve una lista de objetos con todos los clientes de la 
// base de datos.
// Si en la url se le pasa un nomclien devuelve aquellos clientes
// que lo contengan.
router.get('/logados/:empresaId', async (req, res, next ) => {
    try{
        var nomclien = req.query.nomclien;
        let clientes = []
        if (nomclien) {
            clientes = await  clientesDb.getClientesBuscarLogados(nomclien, req.params.empresaId)
            res.json(clientes);
        } else {
            clientes = await clientesDb.getClientesLogados( req.params.empresaId)
            res.json(clientes);
        }

    } catch(error) {
        next(error);
    }
});

// GetClientesLogados2
// Devuelve una lista de objetos con todos los clientes de la 
// base de datos.
// Si en la url se le pasa un nomclien devuelve aquellos clientes
// que lo contengan.
router.get('/logados2', function(req, res) {
    var params = req.query;

    clientesDb.getClientesLogados2(params, function(err, clientes) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(clientes);
        }
    });

});

// GetCliente
// devuelve el cliente con el id pasado
router.get('/:codclien/:empresaId', async(req, res, next) => {
    try {
        let cliente = await clientesDb.getCliente(req.params.codclien, req.params.empresaId);
        if (cliente.length == 0) {
            return res.status(404).send("Cliente no encontrado");
        }
        return res.json(cliente[0])
    } catch(err) {
        next(err);
    }
});


// GetClientesSinLogar
// Devuelve una lista de objetos con todos los clientes sin logar
// base de datos.
router.get('/sin-logar/usuarios/:empresaId', async (req, res, next) => {
    try {
        let clientes = await clientesDb.getClientesSinLogar(req.params.empresaId);
        res.json(clientes);
    } catch(error) {
        next(error)
    }
});


// PostCliente
// permite dar de alta un cliente
router.post('/', function(req, res) {
    clientesDb.postCliente(req.body.cliente, function(err, cliente) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(cliente);
        }
    });
});



// PutCliente
// modifica el cliente con el id pasado
router.put('/:codclien', function(req, res) {
    // antes de modificar comprobamos que el objeto existe
    clientesDb.getCliente(req.params.codclien, function(err, cliente) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (cliente == null) {
                res.status(404).send("Cliente no encontrado");
            } else {
                // ya sabemos que existe y lo intentamos modificar.
                clientesDb.putCliente(req.params.codclien, req.body.cliente, function(err, cliente) {
                    if (err) {
                        res.status(500).send(err.message);
                    } else {
                        res.json(cliente);
                    }
                });
            }
        }
    });
});

// DeleteCliente
// elimina un cliente de la base de datos
router.delete('/:codclien', function(req, res) {
    var cliente = req.body.cliente;
    clientesDb.deleteCliente(req.params.codclien, cliente, function(err, cliente) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(null);
        }
    });
});

// Exports
module.exports = router;
