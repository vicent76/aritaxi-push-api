var express = require('express');
var router = express.Router();
var mensajesDb = require("./mensajes_db_mysql");
//var camposMysql = require('../campos/campos_mysql');


// GetMensajes
// Devuelve una lista de objetos con todos los mensajes de la 
// base de datos.
// Si en la url se le pasa un nombre devuelve aquellos mensajes
// que lo contengan.
router.get('/:empresaId', async (req, res, next ) => {
    try {
        let mensajes = await mensajesDb.getMensajes(req.params.empresaId)
        res.json(mensajes);
    } catch(error) {
        next(res.status(500).send(error.message));
    }
});

// GetMensajesUsuaio
// devuelve el mensaje con el id pasado
router.get('/usuario/:codusu/:empresaId', async(req, res, next) => {
    try {
        let mensajes = await mensajesDb.getMensajesUsuario(req.params.codusu, req.params.empresaId)
        res.json(mensajes);
    } catch(error) {
        next(res.status(500).send(error.message));
    }
});

// GetUsuariosMensaje
// devuelve los usuarios relacionados con el mensaje
router.get('/usuarios-mensaje/:mensajeId/:empresaId', async(req, res, next) => {
    try {
        let usuarios = [];
        usuarios = await mensajesDb.getUsuariosMensaje(req.params.mensajeId, req.params.empresaId)
        res.json(usuarios);
    } catch(error) {
        next(res.status(500).send(error.message));
    }
   
});

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
        next(res.status(500).send(error.message));
    }
});



// PutMensaje
// Actualiza el mensaje como leido en la fecha pasada
router.put('/usuario/:usuarioPushId/:empresaId', async(req, res, next) => {
    try {
        const result = await mensajesDb.putMensajesUsuario(req.params.usuarioPushId, req.body.mensajeId, req.body.fecha, req.params.empresaId)
        res.json(result);
    } catch(error) {
        next(res.status(500).send(error.message));
    }
});





// GetMensaje
// devuelve el mensaje con el id pasado
router.get('/:mensajeId/:empresaId', async (req, res, next) => {
    try {
        const mensaje = await mensajesDb.getMensaje(req.params.mensajeId, req.params.empresaId)
        if (mensaje.length == 0) {
            res.status(404).send("Mensaje no encontrado");
        } else {
            res.json(mensaje[0]);
        }
    } catch(err) {
        next(err);
    }
});

router.get('/buscar/host/correo', function(req, res) {
    mensajesDb.getConfigCorreo(function(err, config) {
        if (err) {
            return res.status(500).send(err.message);
        } else {
            res.json(config);
        }
    });
});


// PostMensaje
// permite dar de alta un mensaje
router.post('/send/:empresaId', async (req, res, next) => {
    try {
        let mensaje = await mensajesDb.postSendMensaje(req.body.mensaje, req.params.empresaId)
        res.json(mensaje);
    } catch(error) {
        console.log("SEND (ERR): ", error);
        next(res.status(500).send(error.message)); 
    }
});

// PostCorreo
// Envia un mensaje por correo electrónico
router.post('/correo', async (req, res, next) => {
    try {
        let options =  mensajesDb.postCorreo(req.body.correo)
        let correo = await mensajesDb.sendCorreo(options)
        res.json(correo);
    } catch(error) {
        console.log("SEND (ERR): ", error);
        next(res.status(500).send(error.message)); 
    }
});

// PostMensaje
// permite dar de alta un mensaje
router.post('/sendnew/:empresaId', async (req, res, next) => {
    try {
        let mensaje = await mensajesDb.postSendMensajeNew(req.body.mensaje, req.params.empresaId)
        res.json(mensaje);
    }  catch(error) {
        console.log("SENDNEW (ERR): ", error);
        next(res.status(500).send(error.message));
    }
});

// PostMensaje
// permite dar de alta un mensaje
router.post('/:empresaId', async (req, res, next) => {
    try {
        let mensaje = [];
        mensaje = await mensajesDb.postMensaje(req.body.mensaje, req.params.empresaId)
        res.json(mensaje);
    } catch(error) {
        next(res.status(500).send(error.message));
    }
});



// PutMensaje
// modifica el mensaje con el id pasado
router.put('/:empresaId/:mensajeId', async (req, res, next) => {
    // antes de modificar comprobamos que el objeto existe
    try {
        let mensaje = [];
        mensaje = await  mensajesDb.getMensaje(req.params.mensajeId, req.params.empresaId);
        if (mensaje.length == 0) {
            res.status(404).send("Mensaje no encontrado");
        } else {
            // ya sabemos que existe y lo intentamos modificar.
            let result = await mensajesDb.putMensaje(req.params.mensajeId, req.body.mensaje, req.params.empresaId);
            res.json(mensaje);
        }
        
    } catch(error) {
        next(res.status(500).send(error.message));
    }
});

// DeleteMensaje
// elimina un mensaje de la base de datos
router.delete('/:empresaId/:mensajeId', async (req, res, next) => {
    try {
        let result = await mensajesDb.deleteMensaje(req.params.empresaId, req.params.mensajeId);
        res.json(result);
    }  catch(error) {
        next(res.status(500).send(error.message));
    }
});

// PutMensaje
// Actualiza el mensaje como leido en la fecha pasada
router.put('/mensaje/usuario/actualiza/:usuarioPushId/:empresaId', async(req, res, next) => {
    try {
        const result = await mensajesDb.putMensajesUsuario2(req.body.mensaje, req.params.usuarioPushId, req.params.empresaId)
        res.json(result);
    } catch(error) {
        next(res.status(500).send(error.message));
    }
});

// PutMensaje
// Actualiza el mensaje con una respuesta
router.put('/usuario/envia/una/respuesta', async(req, res, next) => {
    try {
        const result = await mensajesDb.putMensajesUsuarioRespuesta(req.body.respuesta)
        res.json(result);
    } catch(error) {
        next(res.status(500).send(error.message));
    }
});

module.exports = router;
