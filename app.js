// AriTaxiApi
console.log("AriTaxiApi --------");
// Cargar los módulos básicos
var express = require('express');
var bodyParser = require("body-parser"); // proceso de los cuerpos de mensaje
var pjson = require('./package.json'); // read vrs and more information
var cors = require('cors'); // cross origin resopurce sharing management

// modulos encargados de las rutas
var empresas_router = require('./lib/empresas/empresas_controller');
var facturas_router = require('./lib/facturas/facturas_controller');

// controladores para rutas de push
var version_router = require('./lib/version/version_controller');
var usuarios_router = require('./lib/usuarios/usuarios_controller');
var clientes_router = require('./lib/clientes/clientes_controller');
var parametros_router = require('./lib/parametros/parametros_controller');
var mensajes_router = require('./lib/mensajes/mensajes_controller');
var uploader_router = require('./lib/uploader/uploader_controller');
var recursos_router = require('./lib/recursos/recursos_controller');
var enlaces_router = require('./lib/enlaces/enlaces_controller');
var s2_router = require('./lib/s2/s2_controller');
var estadisticas_router = require('./lib/estadisticas/estadisticas_controller');
var demonioEstadisticas = require('./demonios/demonio_estadisticas')
// express
var app = express();

const appServer = {
    crearServidor: () => {
        // CORS management
        app.options('*', cors()); // include before other routes
        app.use(cors());

        //importacion de configuracion env
        var conf = require('dotenv');
        conf.config();

        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json({ limit: '100mb' }));
        app.use(express.static(__dirname + '/www'));

        //---------- Rutas relacionadas con empresas
        app.use('/api/empresas', empresas_router);
        //---------- Rutas relacionadas con facturas
        app.use('/api/facturas', facturas_router);
        //---------- Rutas relacionadas con version
        app.use('/api/version', version_router);
        //---------- Rutas relacionadas con administradores
        app.use('/api/usuarios', usuarios_router);
        //---------- Rutas relacionadas con usupush
        app.use('/api/clientes', clientes_router);
        //---------- Rutas relacionadas con parametros
        app.use('/api/parametros', parametros_router);
        //---------- Rutas relacionadas con mensajes
        app.use('/api/mensajes', mensajes_router);
        //---------- Rutas relacionadas con el cargador.
        app.use('/api/uploader', uploader_router);
        //---------- Rutas relacionadas con recursos
        app.use('/api/recursos', recursos_router);
        //---------- Rutas relacionadas con enlaces
        app.use('/api/enlaces', enlaces_router);
        //---------- Rutas relacionadas con solicitud de documentos
        app.use('/api/s2', s2_router);
        //---------- Rutas relacionadas con estadisticas
        app.use('/api/estadisticas', estadisticas_router);

        app.use((req, res, next) => {
            res.sendFile(path.join(__dirname,"www", "index.html"));
        });

        app.use((error, req, res, next) => {
            res.status(error.status || 500);
            let mensaje = error.message;
            if (error.response && error.response.data) {
                mensaje += ` Code(${error.response.data.errorCode}) ${error.response.data.message}`
            }
            res.json({
                error: {
                    message: mensaje
                }
            });
        });
    },
    lanzarServidor: () => {
        app.listen(process.env.API_PORT);
        console.log("AriTaxiApi VRS: ", pjson.version)
        console.log("AriTaxiApi en puerto: ", process.env.API_PORT);
    },
    lanzarDemonios: () => {
        if (process.env.ESTADISTICAS_DELAY == 0) {
            console.log('No arranca demonio DELAY=0')
        } else {
            setInterval(demonioEstadisticas.run, process.env.ESTADISTICAS_DELAY)
        } 
    }
}

module.exports = appServer;