var express = require('express');
var router = express.Router();
var usuariosDb = require("./usuarios_db_mysql");

// GetUsuarios
// Devuelve una lista de objetos con todos los usuarios de la 
// base de datos.
// Si en la url se le pasa un nombre devuelve aquellos usuarios
// que lo contengan.
router.get('/', function(req, res) {
    var nombre = req.query.nombre;
    if (nombre) {
        usuariosDb.getUsuariosBuscar(nombre, function(err, usuarios) {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.json(usuarios);
            }
        });

    } else {
        usuariosDb.getUsuarios(function(err, usuarios) {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.json(usuarios);
            }
        });
    }
});

// GetUsuarios
// Devuelve una lista de objetos con todos los usuarios de la 
// base de datos.
// Si en la url se le pasa un nombre devuelve aquellos usuarios
// que lo contengan.
router.get('/:empresaId', async(req, res, next) => {
    try{
        var nombre = req.query.nombre;

        let usuarios = []
        if (nombre) {
            usuarios = await  usuariosDb.getUsuariosBuscar(nombre, req.params.empresaId)
            res.json(usuarios);
        } else {
            usuarios = await usuariosDb.getUsuarios( req.params.empresaId)
            res.json(usuarios);
        }

    } catch(error) {
        next(error)
    }
  
    
});

// GetUsuario
// devuelve el usuario con el id pasado
router.get('/:codusu', function(req, res) {
    usuariosDb.getUsuario(req.params.codusu, function(err, usuario) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (usuario == null) {
                res.status(404).send("Usuario no encontrado");
            } else {
                res.json(usuario);
            }
        }
    });
});

// Login
// comprueba si hay algún usuario con el login y password pasados
// si lo encuentra lo devuelve como objeto, si no devuelve nulo.
router.post('/login', async (req, res, next) => {
    try {
        let peticion = req.body.usuario;
        if (!peticion.empresaId || !peticion.login || !peticion.password) return res.status(400).json(`Error en la llamada, debe incluir la empresa (empresaId), así como el (login) y la contraseña (password)`);
        let usuario = await usuariosDb.loginUsuarios(peticion)
        if (!usuario) {
            return res.status(401).json('Login o contraseña incorrectos');
        } else {
            res.json(usuario);
        }
    } catch(error) {
        next(error)
    }
});


// PostUsuario
// permite dar de alta un usuario
router.post('/', function(req, res) {
    usuariosDb.postUsuario(req.body.usuario, function(err, usuario) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(usuario);
        }
    });
});



// PutUsuario
// modifica el usuario con el id pasado
router.put('/:codusu', function(req, res) {
    // antes de modificar comprobamos que el objeto existe
    usuariosDb.getUsuario(req.params.codusu, function(err, usuario) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (usuario == null) {
                res.status(404).send("Usuario no encontrado");
            } else {
                // ya sabemos que existe y lo intentamos modificar.
                usuariosDb.putUsuario(req.params.codusu, req.body.usuario, function(err, usuario) {
                    if (err) {
                        res.status(500).send(err.message);
                    } else {
                        res.json(usuario);
                    }
                });
            }
        }
    });
});

// DeleteUsuario
// elimina un usuario de la base de datos
router.delete('/:codusu', function(req, res) {
    usuariosDb.deleteUsuario(req.params.codusu, function(err, usuario) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(null);
        }
    });
});

// Exports
module.exports = router;