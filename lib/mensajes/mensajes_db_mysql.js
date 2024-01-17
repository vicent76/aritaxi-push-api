// mensajes_db_mysql
// Manejo de la tabla mensajes en la base de datos
var mysql = require("mysql"); // librería para el acceso a bases de datos MySQL
var conector = require('../comun/conector_mysql');
var parametrosDb = require('../parametros/parametros_db_mysql');
//var cfg = require('../../config/config.json');
var fs = require("fs");
var csv = require("csv");
var myutil = require('../comun/myutil');
var XLSX = require('xlsx');
var nodemailer = require('nodemailer');
var sql = "";
var bdDatabase = process.env.BD_DATABASE
const OneSignal = require('onesignal-node');  



var connector = require('../comun/conector_mysql');
var mysql2 = require('mysql2/promise');


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
        reports_dir: process.env.REPORTS_DIR,
        clasif_dir: process.env.CLASIF_DIR,
        json_dir: process.env.JSON_DIR,
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
        sql = "SELECT m.mensajeId, m.asunto, m.texto, m.fecha, mu.estado, mu.fecha as fechalec";
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
        sql = "SELECT u.codclien, m.asunto, u.nomclien as nombre, u.telclie1 AS telefono1, u.maiclie1 as email, mu.estado, mu.fecha AS fechalec";
        sql += " FROM app_mensajes AS m";
        sql += " LEFT JOIN app_mensajes_usuariospush AS mu ON (mu.mensajeId = m.mensajeId)";
        sql += " LEFT JOIN sclien AS u ON (u.codclien = mu.usuarioPushId)";
        sql += " WHERE m.mensajeId = ?";
        sql += " ORDER BY u.nomclien";
        sql = mysql2.format(sql, mensajeId);
        const [result] = await connection.query(sql);
        usuarios = result
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
    try {
        let cfg = await connector.empresa(empresaId);
        connection = await mysql2.createConnection(cfg);
        sql = "SELECT mens.*, ad.nomusu AS responsable FROM app_mensajes AS mens";
        sql += " LEFT JOIN usuarios.usuarios AS ad ON ad.codusu = mens.administradorId";
        sql += " ORDER BY fecha DESC";
        const [result] =  await connection.query(sql);
        await connection.end();
        mensajes = result;
        return mensajes;

    } catch(error) {
        if (connection) {
			await connection.end();
		}
		throw (error);
    }
}


// getMensajesBuscar
// lee todos los registros de la tabla mensajes cuyo
// nombre contiene la cadena de búsqueda. Si la cadena es '*'
// devuelve todos los registros
module.exports.getMensajesBuscar = function(nombre, callback) {
    var connection = conector.getConnectionPush();
    var mensajes = null;
    var sql = "SELECT mens.*, ad.nombre AS responsable FROM mensajes AS mens";
    sql += " LEFT JOIN administradores AS ad ON ad.administradorId = mens.administradorId";
    sql += " ORDER BY fecha DESC";
    if (nombre !== "*") {
        sql = "SELECT mens.*, ad.nombre AS responsable FROM mensajes AS mens";
        sql += " LEFT JOIN administradores AS ad ON ad.administradorId = mens.administradorId";
        sql += " WHERE asunto LIKE ?";
        sql += " ORDER BY fecha DESC";
        sql = mysql.format(sql, '%' + nombre + '%');
    }
    connection.query(sql, function(err, result) {
        conector.closeConnection(connection);
        if (err) {
            return callback(err, null);
        }
        mensajes = result;
        callback(null, mensajes);
    });
}

// getMensaje
// busca  el mensaje con id pasado
module.exports.getMensaje = async (id, empresaId) => {
    let connection = null;
    var sql = "";
    try {
        let cfg = await connector.empresa(empresaId);
        connection = await mysql2.createConnection(cfg);
        sql = "SELECT mens.*, ad.nomusu AS responsable FROM app_mensajes AS mens";
        sql += " LEFT JOIN usuarios.usuarios AS ad ON ad.codusu = mens.administradorId";
        sql += " WHERE mens.mensajeId = ?";
        sql = mysql2.format(sql, id);
        const [result] =  await connection.query(sql);
        await connection.end();
        result;
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
        // (1) Obtener la lista de destinatarios
        const [res] = await fnObtainPlayersIds(mensaje, empresaId)
        var playList = res;
        if (playList.length == 0){
            throw new Error('No se ha escogido ningún destinatario');
        }
        const [result] = await fnStoreMensaje2(mensaje, playList, empresaId)
        return res;
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

module.exports.putMensaje = function(id, mensaje, callback) {
    if (!comprobarMensaje(mensaje)) {
        var err = new Error("El mensaje pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
        callback(err);
        return;
    }
    if (id != mensaje.mensajeId) {
        var err = new Error("El ID del objeto y de la url no coinciden");
        callback(err);
        return;
    }
    var connection = conector.getConnectionPush();
    sql = "UPDATE mensajes SET ? WHERE mensajeId = ?";
    sql = mysql.format(sql, [mensaje, mensaje.mensajeId]);
    connection.query(sql, function(err, result) {
        conector.closeConnection(connection);
        if (err) {
            return callback(err);
        }
        callback(null, mensaje);
    });
};


// deleteMensaje
// Elimina el mensaje con el id pasado
module.exports.deleteMensaje = function(id, mensaje, callback) {
    var connection = conector.getConnectionPush();
    sql = "DELETE from mensajes_usuariospush WHERE mensajeId = ?";
    sql = mysql.format(sql, id);
    connection.query(sql, function(err, result) {
        if (err) {
            conector.closeConnection(connection);
            return callback(err);
        }
        sql = "DELETE from mensajes WHERE mensajeId = ?";
        sql = mysql.format(sql, id);
        connection.query(sql, function(err, result) {
            conector.closeConnection(connection);
            if (err) {
                return callback(err);
            }
            callback(null);
        });
    });
};

// 
module.exports.postSendMensaje = async (mensaje, empresaId) => {
    try {
        //obtener la lista de lños destinatarios
        const [res] =  await fnObtainPlayersIds(mensaje, empresaId)
        var playList = res;
        const [result] = await fnStoreMensaje(mensaje, playList, empresaId)
        var mensaje2 = result;
            const paramas = await parametrosDb.getParametro(0, empresaId)
            var parametros = paramas;
            const body = await fnSendMessage(mensaje2, parametros, playList);
            if(body) {
                var res2 = body[0];
                mensaje2.estado = "ENVIADO";
                mensaje2.pushId = res2.id;
                const s = await fnPutMensaje(mensaje2.mensajeId, mensaje2, empresaId)
                return result;
            }
          
    } catch(error) {
        if(error) {
            try {
                const r = await fnDeleteMensaje(mensaje2.mensajeId, mensaje2, empresaId)
            } catch(err) {
                throw (err);
            }
            throw (error);
        }
    }
}

module.exports.postSendMensajeNew = function(mensaje, callback) {
    // (1) Obtener la lista de destinatarios
    fnObtainPlayersIdsFromMensaje(mensaje, function(err, res) {
        if (err) {
            return callback(err);
        }
        var playList = res;
        parametrosDb.getParametro(0, function(err, res) {
            if (err) {
                return callback(err);
            }
            var parametros = res;
            fnSendMessage(mensaje, parametros, playList, function(err, res) {
                if (!err) {
                    fnPutMensajeNew(mensaje.mensajeId, mensaje.administradorId,function(err, res) {
                        if (err) {
                            return callback(err);
                        }
                        return callback(null, res);
                    });
                } else {
                    err2 = new Error("[MENSAJE NO ENVIADO] " + err.message);
                    // borra el mensaje porque no vale
                    return callback(err2);
                }
            });
        });

    })
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
    if ((!mensaje.usuPush || mensaje.usuPush.length == 0)) {
        throw new Error('No hay ningún usuario valido al que enviar el mensaje')
    }
    let cfg = await connector.empresa(empresaId);
    connection = await mysql2.createConnection(cfg);
    // tratamiento del mensaje cuando es un fichero
    if (mensaje.fichero) {
        //fnObtainPlayersIdsFromFichero(mensaje.fichero, callback);
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
            playList = [result];
            return playList;
            
        } /* else {
            // It depends on wich flag is active we build a diferent sql
            sql = "SELECT usuarioPushId, playerId FROM usuariospush WHERE NOT playerId IS NULL";
            if (mensaje.soloMensajes) sql += " AND soloMensajes = 1";
            if (mensaje.esTrabajador) sql += " AND esTrabajador = 1";
            if (mensaje.ariagro) sql += " AND NOT ariagroId IS NULL";
            if (mensaje.tienda) sql += " AND NOT tiendaId IS NULL";
            if (mensaje.telefonia) sql += " AND NOT telefoniaId IS NULL";
            if (mensaje.gasolinera) sql += " AND NOT gasolineraId IS NULL";
            conn.query(sql, function(err, result) {
                conector.closeConnection(conn);
                if (err) {
                    return callback(err, null);
                }
                playList = result;
                return callback(null, playList);
            });
        } */
    }

    }catch(error) {
        if (connection) {
			await connection.end();
		}
		throw (error);
    }
    
    
}

var fnObtainPlayersIdsFromMensaje = function(mensaje, callback) {
    var playList = [];
    var sql = "";
    var conn = conector.getConnectionPush();

    // if there's an USER, we send to that USER no matter 
    // what global sending parameters we have.
    sql = "SELECT u.usuarioPushId, u.playerId";
    sql += " FROM mensajes AS m";
    sql += " LEFT JOIN mensajes_usuariospush AS mu ON mu.mensajeId = m.mensajeId";
    sql += " LEFT JOIN usuariospush AS u ON u.usuarioPushId = mu.usuarioPushId";
    sql += " WHERE m.mensajeId = ?";
    sql = mysql.format(sql, mensaje.mensajeId);
    conn.query(sql, function(err, result) {
        conector.closeConnection(conn);
        if (err) {
            return callback(err, null);
        }
        playList = result;
        return callback(null, playList);
    });
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
              console.log(e.statusCode);
              console.log(e.body);
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
        fecha: new Date()
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
        const res = await fnStoreMensajeUsuarios2(mensaje2, playList, empresaId)
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
        const [result] = connection.query(sql);
        sql = "DELETE from mensajes WHERE mensajeId = ?";
        sql = mysql2.format(sql, id);
        const [resul2] = connection.query(sql);
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
        let result = connection.query(sql);
        await connection.end();
        return null;
    } catch(error) {
        if (connection) {
			await connection.end();
		}
		throw (error);
    }
   
}



var fnPutMensajeNew = function(id, administradorId,callback) {
    var connection = conector.getConnectionPush();
    sql = "UPDATE mensajes AS m, mensajes_usuariospush AS mu";
    sql += " SET m.estado = 'ENVIADO', mu.estado = 'ENVIADO', m.administradorId = ?";
    sql += " WHERE m.mensajeId = ? AND mu.mensajeId = ?;"
    sql = mysql.format(sql, [administradorId, id, id]);
    connection.query(sql, function(err, result) {
        conector.closeConnection(connection);
        if (err) {
            return callback(err);
        }
        callback(null, null);
    });
};

var fnObtainPlayersIdsFromFichero = function(fichero, callback) {
    // Whats is the files's extension?
    var ext = fichero.split('.').pop();
    var fileName = process.env.FICHEROS + fichero;
    switch (ext) {
        case 'csv':
            // read cvs file
            fs.readFile(fileName, 'utf8', function(err, data) {
                if (err) {
                    return callback(err, null);
                }
                csv.parse(data, { "delimiter": "," }, function(err, data) {
                    if (err) {
                        return callback(err, null);
                    }
                    var codes = [];
                    for (var i = 0; i < data.length; i++) {
                        var item = data[i][0];
                        if (myutil.isNumber(item)) {
                            item = parseInt(item);
                            codes.push(item);
                        } else {
                            codes.push(item);
                        }    
                    }
                    //var inSQL = codes.toString();
                    var playList = [];
                    var sql = "";
                    var conn = conector.getConnectionPush();
                    var inSQL = "";
                    var cont;

                    for(var j = 0; j < codes.length; j++) {
                        cont = codes.length - 1
                        inSQL += '"'+ codes[j] +'"' ;
                        if (j == cont) break;
                        inSQL += ",";
                    }
                    sql = "SELECT u.usuarioPushId, u.playerId";
                    sql += " FROM usuariospush AS u";
                    sql += " WHERE u.login IN ("+inSQL+")";
                    sql += " AND NOT u.playerId IS NULL"
                    //sql = mysql.format(sql, inSQL);
                    sql = sql.replace(/'/g, "");
                    conn.query(sql, function(err, result) {
                        conector.closeConnection(conn);
                        if (err) {
                            return callback(err, null);
                        }
                        playList = result;
                        return callback(null, playList);
                    });
                })
            });
            break;
        case 'xlsx':
        case 'xls':
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
            var playList = [];
            var sql = "";
            var conn = conector.getConnectionPush();

            sql = "SELECT u.usuarioPushId, u.playerId";
            sql += " FROM usuariospush AS u";
            sql += " WHERE u.login IN ("+inSQL+")";
            sql += " AND NOT u.playerId IS NULL"
            //sql = mysql.format(sql, inSQL);
            sql = sql.replace(/'/g, "");
            conn.query(sql, function(err, result) {
                conector.closeConnection(conn);
                if (err) {
                    return callback(err, null);
                }
                playList = result;
                return callback(null, playList);
            });
            break;
        default:
            // by defalut empty array returned
            callback(null, []);
            break;
    }
}





