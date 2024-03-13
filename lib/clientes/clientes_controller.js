var express = require('express');
var router = express.Router();
var clientesDb = require("./clientes_db_mysql");



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

// Login
// comprueba si hay algún cliente con el login y password pasados
// si lo encuentra lo devuelve como objeto, si no devuelve nulo.
router.get('/login/empresa', async(req, res, next) => {
    // confirmar que se han recibido correctamente los parámetros
    // login: identificador del usuario para el login
    // password: password asignada
    try {
        query = req.query;
        if (query.login && query.password) {
            let usuario = await clientesDb.getLogin(query.login, query.password, query.empresaId)
            if (usuario) {
                return res.json(usuario)
            } else {
                return res.status(404).send("Usuario o contraseña incorrectos.");
            }
        } else {
            return res.status(400).send('Formato de la petición incorrecto.');
        }

    } catch(error) {
        next(res.status(500).send(error.message));
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
router.put('/:codclien/:empresaId', async(req, res, next) => {
    try {
        // antes de modificar comprobamos que el objeto existe
        let cliente = await clientesDb.getCliente(req.params.codclien, req.params.empresaId);
        if (cliente.length == 0) {
            res.status(404).send("Cliente no encontrado");
        } 
         // ya sabemos que existe y lo intentamos modificar.
         let result = await clientesDb.putCliente(req.params.codclien, req.params.empresaId, req.body.cliente)
        res.json(cliente); 
        
    } catch(error) {
        next(error);
    }
   
    
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
