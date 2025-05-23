// mensajes_db_mysql
// Manejo de la tabla mensajes en la base de datos
var mysql = require("mysql"); // librería para el acceso a bases de datos MySQL
var parametrosDb = require('../parametros/parametros_db_mysql');
//var cfg = require('../../config/config.json');
var fs = require("fs");
const fsPromises = require('fs').promises;
var csv = require("csv");
var myutil = require('../comun/myutil');
var XLSX = require('xlsx');
var nodemailer = require('nodemailer');
var sql = "";
var moment = require('moment');
const OneSignal = require('onesignal-node');  



var connector = require('../comun/conector_mysql');
var mysql2 = require('mysql2/promise');
const { array } = require("xlsx/jszip");


// comprobarMensaje
// comprueba que tiene la estructura de objeto mínima
// necesaria para guardarlo en la base de datos
// Por ejemplo, que es del tipo correcto y tiene los atributos 
// adecuados.
function comprobarMensaje(mensaje) {
    // debe ser objeto del tipo que toca
    var comprobado = "object" === typeof mensaje;
    // en estas propiedades no se admiten valores nulos
    comprobado = (comprobado && mensaje.hasOwnProperty("mensajeId"));
    comprobado = (comprobado && mensaje.hasOwnProperty("asunto"));
    comprobado = (comprobado && mensaje.hasOwnProperty("texto"));
    comprobado = (comprobado && mensaje.hasOwnProperty("fecha"));
    return comprobado;
}

function recuperaConfig() {
    var cfg = {
        apiPort: process.env.API_PORT,
        apiHost: process.env.API_HOST,
        ficheros: process.env.FICHEROS,
        smtpConfig: {
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_SECURE, 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        },
        destinatario: process.env.EMAIL_DESTINATARIO
    }
    return cfg;
}


// getMensajesUsuario
// lee los mensajes relacionados con un determinado usuario
module.exports.getMensajesUsuario = async (codusu, empresaId) => {
    var connection = undefined;
    var mensajes = [];
    var sql = "";
    try {
        let cfg = await connector.empresa(empresaId);
		connection = await mysql2.createConnection(cfg);
        sql = "SELECT m.mensajeId, m.asunto, m.texto, m.fecha, mu.estado, mu.fecha as fechalec, m.necesitaConfirmacion, mu.confirmado,";
        sql += " mu.textoRespuesta, mu.leidaRespuesta"
        sql += " FROM app_mensajes_usuariospush AS mu";
        sql += " LEFT JOIN app_mensajes AS m ON m.mensajeId = mu.mensajeId";
        sql += " WHERE mu.usuarioPushId = ?";
        sql += " AND m.estado = 'ENVIADO'";
        sql += " ORDER by m.fecha DESC";
        sql = mysql2.format(sql, codusu);
        const [result] = await connection.query(sql);
        mensajes = result
		await connection.end();
		return mensajes;

    } catch(error) {
        if (connection) {
			await connection.end();
		}
		throw (error);
    }
}


// getUsuariosMensaje
// lee los usuarios relacionados con un determinado mensaje
module.exports.getUsuariosMensaje = async (mensajeId, empresaId) => {
    let  connection = undefined;
    var usuarios = [];
    if(mensajeId == 0) return usuarios;
    var sql = "";
    try {
        let cfg = await connector.empresa(empresaId);
		connection = await mysql2.createConnection(cfg);
        sql = "SELECT u.codclien, m.asunto, u.nomclien as nombre, u.telclie1 AS telefono1, u.maiclie1 as email, mu.estado, mu.fecha AS fechalec,";
        sql += " mu.textoRespuesta, mu.confirmado"
        sql += " FROM app_mensajes AS m";
        sql += " LEFT JOIN app_mensajes_usuariospush AS mu ON (mu.mensajeId = m.mensajeId)";
        sql += " LEFT JOIN sclien AS u ON (u.codclien = mu.usuarioPushId)";
        sql += " WHERE m.mensajeId = ?";
        sql += " ORDER BY u.nomclien";
        sql = mysql2.format(sql, mensajeId);
        const [result] = await connection.query(sql);
        usuarios = result
        if(usuarios.length > 0) {
                for (let m of usuarios) {
                    if(m.fechalec) { 
                        m.fechalec = moment(m.fechalec).format('YYYY-MM-DD HH:mm:ss');
                    }
                }
        }
		await connection.end();
		return usuarios;

    } catch(error) {
        if (connection) {
			await connection.end();
		}
		throw (error);
    }

}



// putMensajesUsuario
module.exports.putMensajesUsuario = async (usuarioPushId, mensajeId, fecha, empresaId) => {
    let connection = null;
    var sql = null;
    try {
        let cfg = await connector.empresa(empresaId);
		connection = await mysql2.createConnection(cfg);
        sql = "UPDATE app_mensajes_usuariospush";
        sql += " SET estado = 'LEIDO', fecha = ?";
        sql += " WHERE mensajeId = ? AND usuarioPushId = ?";
        sql = mysql2.format(sql, [fecha, mensajeId, usuarioPushId]);
        const result = await  connection.query(sql);
        await connection.end();
		return result;

    } catch(error) {
        if (connection) {
			await connection.end();
		}
		throw (error);
    }
    
}

// putMensajesUsuarioRespuesta
module.exports.putMensajesUsuarioRespuesta = async (mensaje) => {
    let connection = null;
    var sql = null;
    try {
        let cfg = await connector.empresa(0);
		connection = await mysql2.createConnection(cfg);
        sql = "UPDATE app_mensajes_usuariospush";
        sql += " SET ?";
        sql += " WHERE mensajeId = ? AND usuarioPushId = ?";
        sql = mysql2.format(sql, [mensaje, mensaje.mensajeId, mensaje.usuarioPushId]);
        const result = await connection.query(sql);
        await connection.end();
		return result;

    } catch(error) {
        if (connection) {
			await connection.end();
		}
		throw (error);
    }
    
}

// putMensajesUsuario
module.exports.putMensajesUsuario2 = async (mensaje, usuarioPushId, empresaId) => {
    let connection = null;
    var sql = null;
    try {
        let cfg = await connector.empresa(empresaId);
		connection = await mysql2.createConnection(cfg);
        sql = "UPDATE app_mensajes_usuariospush";
        sql += " SET ?";
        sql += " WHERE mensajeId = ? AND usuarioPushId = ?";
        sql = mysql2.format(sql, [mensaje, mensaje.mensajeId, usuarioPushId]);
        const result = connection.query(sql);
        await connection.end();
		return result;

    } catch(error) {
        if (connection) {
			await connection.end();
		}
		throw (error);
    }
    
}



// lee todos los registros de la tabla mensajes y
// los devuelve como una lista de objetos
module.exports.getMensajes = async (empresaId) => {
    let connection = null;
    var mensajes = [];
    var sql = null;
    var u = process.env.BASE_MYSQL_USUARIOS;
    try {
        let cfg = await connector.empresa(empresaId);
        connection = await mysql2.createConnection(cfg);
        sql = "SELECT mens.*, ad.nomusu AS responsable FROM app_mensajes AS mens";
        sql += " LEFT JOIN " + u + ".usuarios AS ad ON ad.codusu = mens.administradorId";
        sql += " ORDER BY fecha DESC";
        const [result] =  await connection.query(sql);
        await connection.end();
        mensajes = result;
        if(mensajes.length > 0) {
            for (let m of mensajes) {
                m.fecha = moment(m.fecha).format('YYYY-MM-DD HH:mm:ss');
            }
        }
        return mensajes;

    } catch(error) {
        if (connection) {
			await connection.end();
		}
		throw (error);
    }
}

// getMensaje
// busca  el mensaje con id pasado
module.exports.getMensaje = async (id, empresaId) => {
    let connection = null;
    var sql = "";
    var u = process.env.BASE_MYSQL_USUARIOS;
    try {
        let cfg = await connector.empresa(empresaId);
        connection = await mysql2.createConnection(cfg);
        sql = "SELECT mens.*, ad.nomusu AS responsable FROM app_mensajes AS mens";
        sql += " LEFT JOIN " + u + ".usuarios AS ad ON ad.codusu = mens.administradorId";
        sql += " WHERE mens.mensajeId = ?";
        sql = mysql2.format(sql, id);
        const [result] =  await connection.query(sql);
        await connection.end();
        return result;
        
    } catch(error) {
        if (connection) {
			await connection.end();
		}
		throw (error);
    }
}
module.exports.getConfigCorreo = function(callback) {
    var cfg = recuperaConfig();
    callback(null, cfg)
}


// postMensaje
// crear en la base de datos el mensaje pasado
module.exports.postMensaje = async (mensaje, empresaId) => {
    try {
        // (1) Obtener la lista de destinatarios si hay
        if(mensaje.usuPush.length > 0) {
            const [res] = await fnObtainPlayersIds(mensaje, empresaId)
            var playList = res;
            if (playList.length == 0){
                throw new Error('No se ha escogido ningún destinatario');
            }
        }
        const [result] = await fnStoreMensaje2(mensaje, playList, empresaId)
        return result;
    } catch(error) {
		throw (error);
    }
   
}

// postCorreo
// Envia un mensaje de correo al destinatario en config
module.exports.postCorreo = function (correo){
    var obj = {};
    var n;
    var posicion;
    var subcadena;
    try {
        //1 Comprobamos que el iban no contenga *
        posicion = correo.texto.indexOf("después de la modificación");
        subcadena = correo.texto.substr(posicion);

        posicion = subcadena.indexOf("iban");
        subcadena = subcadena.substr(posicion);
        n = subcadena.indexOf("*");
        if(n != -1) {
            throw new Error('El correo es incorrecto, se han incluido * en el iban');
        }
        //comprobarIban(correo.texto, function(data,err) {
            //if(err) throw  new Error(err);
            var cfg = recuperaConfig();
            // 1- verificamos que el correo contiene asunto y texto
            if (!correo || !correo.asunto || !correo.texto){
                throw new Error('El correo es incorrecto');
            }
            // 2- Montamos el transporte del correo basado en la
            // configuración.
            //correo.texto = data;
            var transporter = nodemailer.createTransport(cfg.smtpConfig);
            var emisor = cfg.destinatario;
             if (correo.emisor){
                emisor = correo.emisor;
            }
            var mailOptions = {
                from: emisor,
                to: cfg.destinatario,
                subject: '[ARITAXI MOVIL] ' + correo.asunto,
                text: correo.texto
            };
             obj = {
                transporter: transporter,
                mailOptions: mailOptions
             }

              return obj;         
        //});
    } catch(error) {
		throw (error);
    }
}

module.exports.sendCorreo = async (o) => {
    try {
        const info = await o.transporter.sendMail(o.mailOptions);
        return info;
    }catch(e) {
        throw(e);
    }
   
}

module.exports.putMensaje = async (id, mensaje, empresaId) => {
    let connection = null;
    let sql = "";
    try {
        if (!comprobarMensaje(mensaje)) {
            var err = new Error("El mensaje pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
            throw err;
        }
        if (id != mensaje.mensajeId) {
            var err = new Error("El ID del objeto y de la url no coinciden");
            throw err
        }
        //montamos el objeto  el mansaje
        let cfg = await connector.empresa(empresaId);
        connection = await mysql2.createConnection(cfg);
        var mensObj = {
            mensajeId: mensaje.mensajeId,
            asunto: mensaje.asunto,
            texto: mensaje.texto,
            estado: mensaje.estado,
            pushId: null,
            necesitaConfirmacion: mensaje.necesitaConfirmacion,
            administradorId: mensaje.administradorId
        }
        sql = "UPDATE app_mensajes SET ? WHERE mensajeId = ?";
        sql = mysql2.format(sql, [mensObj, mensaje.mensajeId]);
        const result = await connection.query(sql);
        if(mensaje.estado == 'PENDIENTE' && mensaje.usuPush[0] != null) {
            //Borramos todos los registros del mansaje en la tabla app_mensajes_usuariospush
            //y los volvemos a crear
            sql = "DELETE FROM app_mensajes_usuariospush WHERE mensajeId = ?";
            sql = mysql2.format(sql, mensaje.mensajeId);
            const result2 = await connection.query(sql);
            var usuPush = mensaje.usuPush
            if(usuPush.length > 0) {
                for (let u of usuPush) {
                    var mensaje2 = 
                    {
                        mensajeId: mensaje.mensajeId,
                        usuarioPushId: u,
                        estado: 'PENDIENTE',
                        fecha: null,
                        confirmado: 0
                    }
                    sql = "INSERT INTO app_mensajes_usuariospush SET ?";
                    sql = mysql2.format(sql, [mensaje2]);
                    let result3 = await connection.query(sql);
                }
            }
            await connection.end();
            return mensaje;
        }
        await connection.end();
        return mensaje;

    } catch(error) {
        if (connection) {
			await connection.end();
		}
		throw (error);
    }
};


// deleteMensaje
// Elimina el mensaje con el id pasado
module.exports.deleteMensaje = async (empresaId, id) => {
    let connection = null;
    try {
        let cfg = await connector.empresa(empresaId);
        connection = await mysql2.createConnection(cfg);

        sql = "DELETE FROM app_mensajes_usuariospush WHERE mensajeId = ?";
        sql =  mysql2.format(sql, id);
        let result = await connection.query(sql);
        sql = "DELETE FROM app_mensajes WHERE mensajeId = ?";
        sql =  mysql2.format(sql, id);
        let result2 = await connection.query(sql);
        await connection.end();
        return null;

    } catch(error) {
        if (connection) {
			await connection.end();
		}
		throw (error);
    }
};

// 
module.exports.postSendMensaje = async (mensaje, empresaId) => {
    try {
        let res = []
        //obtener la lista de lños destinatarios
        if(mensaje.fichero) {
            res =  await fnObtainPlayersIdsFromFichero(mensaje.fichero, null)
        } else {
            res =  await fnObtainPlayersIds(mensaje, empresaId)
        }
        var [playList] = res;
        const [result] = await fnStoreMensaje(mensaje, playList, empresaId)
        var mensaje2 = result;
            const paramas = await parametrosDb.getParametro(0, empresaId);
            var parametros = paramas;
            const body = await fnSendMessage(mensaje2, parametros, playList);
            if(body) {
                if(Array.isArray(body)) {
                    var res2 = body[0];
                    mensaje2.estado = "ENVIADO";
                    mensaje2.pushId = res2.id;
                    const s = await fnPutMensaje(mensaje2.mensajeId, mensaje2, empresaId);
                    return result;
                } else {
                    throw new Error(body)
                }
            }
          
    } catch(error) {
        if(error) {
            try {
                if(mensaje2) {
                    const r = await fnDeleteMensaje(mensaje2.mensajeId, mensaje2, empresaId);
                }
            } catch(err) {
                throw (err);
            }
            throw (error.message);
        }
    }
}

module.exports.postSendMensajeNew = async (mensaje, empresaId) => {
    let res = []
    try {
        // (1) Obtener la lista de destinatarios
        if(mensaje.estado == 'PENDIENTE') {
            res = await fnObtainPlayersIds(mensaje, empresaId)
        } else {
            res = await fnObtainPlayersIdsFromMensaje(mensaje, empresaId)
        }
        
        var [playList] = res;
        const paramas = await parametrosDb.getParametro(0, empresaId)
        var parametros = paramas;
        const body = await fnSendMessage(mensaje, parametros, playList);
        if(body) {
            if(Array.isArray(body)) {
                if(mensaje.estado == 'PENDIENTE') {
                    await fnStoreMensajeUsuariosNew(mensaje, playList, empresaId);
                    await fnPutMensajeNew(mensaje, mensaje.mensajeId, mensaje.administradorId, empresaId);
                } else {
                    await fnPutMensajeNew(mensaje, mensaje.mensajeId, mensaje.administradorId, empresaId);
                } 
                return null;
            } else {
                throw new Error(body)
            }
        }
    } catch(error) {
        if(error) {
            throw (error.message);
        }
    }
}


// Returns an array with userPushIds and playersIds
// dependig on parameters

var fnObtainPlayersIds = async (mensaje, empresaId) => {
    var playList = [];
    var sql = "";
    let  connection = undefined;
    try {
        // if there aren't any parameters, return empty array
        // no users to send for
    if(!mensaje.fichero) {
        if ((!mensaje.usuPush || mensaje.usuPush.length == 0 || mensaje.usuPush[0] == null)) {
            throw new Error('No hay ningún usuario valido al que enviar el mensaje')
        }
    }
   
    let cfg = await connector.empresa(empresaId);
    connection = await mysql2.createConnection(cfg);
    // tratamiento del mensaje cuando es un fichero
    if (mensaje.fichero) {
        playList = await fnObtainPlayersIdsFromFichero(mensaje.fichero, connection);
        if(playList.length == 0)  throw new Error('El archivo no se puede procesar');
        return playList
    } else {
        if (mensaje.usuPush && mensaje.usuPush.length > 0) {
            var inSQL = mensaje.usuPush.toString();
            sql = "SELECT u.codclien, u.playerId";
            sql += " FROM sclien AS u";
            sql += " WHERE u.codclien IN (?)";
            sql += " AND NOT u.playerId IS NULL"
            sql = mysql2.format(sql, inSQL);
            sql = sql.replace(/'/g, "");
            const [result] = await connection.query(sql);
            await connection.end();
            return  [result];
            
        } 
    }

    }catch(error) {
        if (connection) {
			await connection.end();
		}
		return (error);
    }
    
    
}

var fnObtainPlayersIdsFromMensaje = async (mensaje, empresaId) => {
    var sql = "";
    let  connection = undefined;
    try {
        let cfg = await connector.empresa(empresaId);
        connection = await mysql2.createConnection(cfg);
        // if there's an USER, we send to that USER no matter 
        // what global sending parameters we have.
        sql = "SELECT u.codclien, u.playerId";
        sql += " FROM app_mensajes AS m";
        sql += " LEFT JOIN app_mensajes_usuariospush AS mu ON mu.mensajeId = m.mensajeId";
        sql += " LEFT JOIN sclien AS u ON u.codclien = mu.usuarioPushId";
        sql += " WHERE m.mensajeId = ?";
        sql = mysql2.format(sql, mensaje.mensajeId);
        const [result] = await connection.query(sql);
        await connection.end();
        return [result];
    } catch(error) {
        if (connection) {
			await connection.end();
		}
		throw (error);
    }
}

var fnSendMessage = async(mensaje, parametros, playList) => {
    try {
        // obtain list of playersIds
        var include_player_ids = [];
        var contenido = "[" + parametros.tituloPush + "] " + mensaje.asunto;
        for (var i = 0; i < playList.length; i++) {
            include_player_ids.push(playList[i].playerId);
        };
        var data = {
            //include_player_ids: include_player_ids,
            headings: {
                en: parametros.tituloPush
            },
            data: {
                mensajeId: mensaje.mensajeId
            },
            contents: {
                en: contenido
            },
              include_player_ids: include_player_ids
        };
        //var request = require('request');
    
        var options = {
            method: 'POST',
            headers: {
                apiRoot: 'https://onesignal.com/api/v1/notifications',
                'Authorization': 'Basic ' + parametros.restApi,
                'Content-type': 'application/json'
            },
            
        };

        const client = new OneSignal.Client(parametros.appId, parametros.restApi, options);

        try {
            const response = await client.createNotification(data);
            console.log(response.body.id);
            if (response.body) {
                res = response.body;
                console.log("RES ONESIGNAL: ", res);
            }
            if (response.statusCode == 200) {
                return [response.body]
            } else {
               throw new Error(error)
            }
          } catch (e) {
            if (e instanceof OneSignal.HTTPError) {
              // When status code of HTTP response is not 2xx, HTTPError is thrown.
              return e;
            }
          }

    } catch(error) {
        throw(error)
    }
};


var fnStoreMensaje =  async(mensaje, playList, empresaId) => {
    let  connection = undefined;
    var mensaje2 = {
        mensajeId: mensaje.mensajeId,
        asunto: mensaje.asunto,
        texto: mensaje.texto,
        estado: 'PENDIENTE',
        fecha: new Date(),
        necesitaConfirmacion: mensaje.necesitaConfirmacion,
        administradorId: mensaje.administradorId

    }
    try {
        if (!comprobarMensaje(mensaje2)) {
            throw new Error("El mensaje pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
        }
        let cfg = await connector.empresa(empresaId);
		connection = await mysql2.createConnection(cfg);
        mensaje.mensajeId = 0; // fuerza el uso de autoincremento
        sql = "INSERT INTO app_mensajes SET ?";
        sql = mysql2.format(sql, mensaje2);
        const [result] = await connection.query(sql);
        await connection.end();
        mensaje2.mensajeId = result.insertId;
        const res = await fnStoreMensajeUsuarios(mensaje2, playList, empresaId)
        return [mensaje2];
    } catch (error) {
        if (connection) {
			await connection.end();
		}
		throw (error);
    }
}

var fnStoreMensaje2 = async(mensaje, playList, empresaId) => {
    let  connection = undefined;
    var mensaje2 = {
        mensajeId: mensaje.mensajeId,
        asunto: mensaje.asunto,
        texto: mensaje.texto,
        estado: 'PENDIENTE',
        fecha: new Date(),
        necesitaConfirmacion: mensaje.necesitaConfirmacion,
        administradorId: mensaje.administradorId
    }
    try {
        if (!comprobarMensaje(mensaje2)) {
            throw new Error("El mensaje pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
        }
        let cfg = await connector.empresa(empresaId);
		connection = await mysql2.createConnection(cfg);
        mensaje.mensajeId = 0; // fuerza el uso de autoincremento
        var sql = "INSERT INTO app_mensajes SET ?";
        sql = mysql2.format(sql, mensaje2);
        const [result] = await connection.query(sql);
        await connection.end();
        mensaje2.mensajeId = result.insertId;
        if(playList) {
            const res = await fnStoreMensajeUsuarios2(mensaje2, playList, empresaId)
            return [mensaje2];
        }
        return [mensaje2];
    } catch (error) {
        if (connection) {
			await connection.end();
		}
		throw (error);
    }
}

var fnStoreMensajeUsuarios = async (mensaje, playList, empresaId) => {
    // write records for all users implied when a message is sent
    var records = [];
    var record = [];
    var sql = "";
    for (var i = 0; i < playList.length; i++) {
        record = [];
        record.push(mensaje.mensajeId);
        record.push(playList[i].codclien);
        record.push('ENVIADO');
        //record.push(new Date());
        records.push(record);
    }
    let connection = null;
    try {
        let cfg = await connector.empresa(empresaId);
		connection = await mysql2.createConnection(cfg);
        sql = "INSERT INTO app_mensajes_usuariospush (mensajeId, usuarioPushId, estado) VALUES  ?";
        sql = mysql2.format(sql, [records]);
        let [res] = await connection.query(sql);
        await connection.end();
        return res
    } catch(error) {
        if (connection) {
			await connection.end();
		}
		throw (error);
    }
}

var fnStoreMensajeUsuariosNew = async (mensaje, playList, empresaId) => {
    // write records for all users implied when a message is sent
    var records = [];
    var record = [];
    var sql = "";
    
    for (var i = 0; i < playList.length; i++) {
        record = [];
        record.push(mensaje.mensajeId);
        record.push(playList[i].codclien);
        record.push('ENVIADO');
        //record.push(new Date());
        records.push(record);
    }
    let connection = null;
    try {
        let cfg = await connector.empresa(empresaId);
		connection = await mysql2.createConnection(cfg);

        sql = "DELETE FROM app_mensajes_usuariospush WHERE mensajeId = ?";
        sql = mysql2.format(sql, mensaje.mensajeId);
        const result2 = await connection.query(sql);

        sql = "INSERT INTO app_mensajes_usuariospush (mensajeId, usuarioPushId, estado) VALUES  ?";
        sql = mysql2.format(sql, [records]);
        let [res] = await connection.query(sql);
        await connection.end();
        return res
    } catch(error) {
        if (connection) {
			await connection.end();
		}
		throw (error);
    }
}



var fnStoreMensajeUsuarios2 = async (mensaje, playList, empresaId) => {
    // write records for all users implied when a message is sent
    var records = [];
    var record = [];
    var sql = "";
    for (var i = 0; i < playList.length; i++) {
        record = [];
        var usuarioPushId = playList[i].codclien;
        record.push(mensaje.mensajeId);
        record.push(usuarioPushId);
        record.push('PENDIENTE');
        records.push(record);
    }
    let connection = null;
    try {
        let cfg = await connector.empresa(empresaId);
		connection = await mysql2.createConnection(cfg);
        sql = "INSERT INTO app_mensajes_usuariospush (mensajeId, usuarioPushId, estado) VALUES  ?";
        sql = mysql2.format(sql, [records]);
        let [res] = await connection.query(sql);
        await connection.end();
        return res
    } catch(error) {
        if (connection) {
			await connection.end();
		}
		throw (error);
    }
    
}

var fnDeleteMensaje = async (id, mensaje, empresaId) => {
    let connection = null;
    var sql = "";
    try {
        let cfg = await connector.empresa(empresaId);
        connection = await mysql2.createConnection(cfg);
        sql = "DELETE from app_mensajes_usuariospush WHERE mensajeId = ?";
        sql = mysql2.format(sql, id);
        const result = await connection.query(sql);
        sql = "DELETE from app_mensajes WHERE mensajeId = ?";
        sql = mysql2.format(sql, id);
        const resul2 = await connection.query(sql);
        await connection.end();
        return null;
    }  catch(error) {
        if (connection) {
			await connection.end();
		}
		throw (error);
    }
   
}

var fnPutMensaje = async (id, mensaje, empresaId)=> {
    let connection = null;
    try {
        if (!comprobarMensaje(mensaje)) {
            throw new Error("El mensaje pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
        }
        if (id != mensaje.mensajeId) {
            throw new Error("El ID del objeto y de la url no coinciden");
        }
        let cfg = await connector.empresa(empresaId);
        connection = await mysql2.createConnection(cfg);
        sql = "UPDATE app_mensajes SET ? WHERE mensajeId = ?";
        sql = mysql2.format(sql, [mensaje, mensaje.mensajeId]);
        let result = await connection.query(sql);
        await connection.end();
        return null;
    } catch(error) {
        if (connection) {
			await connection.end();
		}
		throw (error);
    }
   
}



var fnPutMensajeNew = async (mensaje, id, administradorId, empresaId) => {
    let connection = null;
    try {
        var texto = mensaje.texto;
        var asunto = mensaje.asunto;
        let cfg = await connector.empresa(empresaId);
        connection = await mysql2.createConnection(cfg);

        sql = "UPDATE app_mensajes AS m, app_mensajes_usuariospush AS mu";
        sql += " SET m.estado = 'ENVIADO', mu.estado = 'ENVIADO', m.administradorId = ?,";
        sql += " m.texto = ?, m.asunto = ?, m.necesitaConfirmacion = ?";
        sql += " WHERE m.mensajeId = ? AND mu.mensajeId = ?;"
        sql = mysql2.format(sql, [administradorId, texto, asunto, mensaje.necesitaConfirmacion, id, id]);
        let result = await connection.query(sql);
        await connection.end();
        return null;
    } catch(error) {
        if (connection) {
			await connection.end();
		}
		throw (error);
    }
};

var fnObtainPlayersIdsFromFichero = async (fichero, connection) => {
    try {
        if(!connection) {
            let cfg = await connector.empresa(null);
            connection = await mysql2.createConnection(cfg);
        }
        // Whats is the files's extension?
        var ext = fichero.split('.').pop();
        var fileName = process.env.FICHEROS + fichero;
        switch (ext) {
            case 'csv':
                // read cvs file
                var data = await fsPromises.readFile(fileName, 'utf8');
                var r = await parseCSVData();
                break;
            case 'xlsx':
           /*  case 'xls': */
                var book = XLSX.readFile(fileName);
                var sheet_name = book.SheetNames[0];
                var sheet = book.Sheets[sheet_name];
                var cellEmpty = false;
                var codes = [];
                var inSQL = "";
                var i = 0
                var cont;
                while (!cellEmpty) {
                    // Only first column
                    i++;
                    var cell = sheet['A' + i];
                    if (!cell) {
                        cellEmpty = true;
                    } else {
                        var cellValue = cell.v;
                        if (myutil.isNumber(cellValue)) {
                            cellValue = parseInt(cellValue);
                            codes.push(cellValue);
                        } else {
                            codes.push(cellValue);
                        }    
                    }
                }
                for(var j = 0; j < codes.length; j++) {
                    cont = codes.length - 1
                    inSQL += '"'+ codes[j] +'"' ;
                    if (j == cont) break;
                    inSQL += ",";
                }
                //var inSQL = codes.toString();
                var playList = null;
                var sql = "";
                
                sql = "SELECT u.codclien, u.playerId";
                sql += " FROM sclien AS u";
                sql += " WHERE u.codclien IN ("+inSQL+")";
                sql += " AND NOT u.playerId IS NULL"
                sql = mysql2.format(sql);
                sql = sql.replace(/'/g, "");
                const [result] = await connection.query(sql);
                await connection.end();
                return [result]

                break;
            default:
                // by defalut empty array returned
                return [];
                break;
        }
        } catch(error) {
            if (connection) {
                await connection.end();
            }
            throw (error);
        }
}

var  parseCSVData =  async (data, connection) => {
    return new Promise((resolve, reject) => {
        csv.parse(data, { "delimiter": "," }, (err, parsedData) => {
            if (err) {
                reject(err);
                return;
            }
            const codes = [];
            for (let i = 0; i < parsedData.length; i++) {
                const item = parsedData[i][0];
                if (myutil.isNumber(item)) {
                    codes.push(parseInt(item));
                } else {
                    codes.push(item);
                }
            }
            const inSQL = codes.map(code => `"${code}"`).join(',');
            let sql = "SELECT u.codclien, u.playerId";
            sql += " FROM sclien AS u";
            sql += " WHERE u.login IN (" + inSQL + ")";
            sql += " AND NOT u.playerId IS NULL";
            sql = sql.replace(/'/g, "");
            
            connection.query(sql)
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
        });
    });
}







