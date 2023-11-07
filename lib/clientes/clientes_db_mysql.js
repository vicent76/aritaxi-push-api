// clientes_db_mysql
// Manejo de la tabla clientes en la base de datos
var mysql = require("mysql"); // librería para el acceso a bases de datos MySQL
var async = require("async"); // librería para el manejo de llamadas asíncronas en JS
var connector = require('../comun/conector_mysql');
var mysql2 = require('mysql2/promise');
//var cfg = require('../../config/mysql_config.json');


var sql = "";

// comprobarCliente
// comprueba que tiene la estructura de objeto mínima
// necesaria para guardarlo en la base de datos
// Por ejemplo, que es del tipo correcto y tiene los atributos 
// adecuados.
function comprobarCliente(cliente) {
    // debe ser objeto del tipo que toca
    var comprobado = "object" === typeof cliente;
    // en estas propiedades no se admiten valores nulos
    comprobado = (comprobado && cliente.hasOwnProperty("codclien"));
    comprobado = (comprobado && cliente.hasOwnProperty("nifclien"));
    comprobado = (comprobado && cliente.hasOwnProperty("login"));
    comprobado = (comprobado && cliente.hasOwnProperty("password"));
    return comprobado;
}


// getClientes
// lee todos los registros de la tabla clientes y
// los devuelve como una lista de objetos
module.exports.getClientes = async (empresaId) =>{
	let  connection = undefined;
	try {
		let cfg = await connector.empresa(empresaId);
		connection = await mysql2.createConnection(cfg);
		sql = "SELECT * FROM sclien ORDER BY nomclien";
		const [result] = await connection.query(sql);
		await connection.end();
		return result;
	} catch (error) {
		if (connection) {
			await connection.end()
		}
		throw (error)

	}
}



// getClientesLogados
// lee todos los registros de la tabla clientes y
// los devuelve como una lista de objetos
module.exports.getClientesLogados = async (empresaId) =>{
	let  connection = undefined;
	try {
		let cfg = await connector.empresa(empresaId);
		connection = await mysql2.createConnection(cfg);
		sql = "SELECT * FROM sclien WHERE NOT playerId IS NULL ORDER BY nomclien";
		const [result] = await connection.query(sql);
		await connection.end();
		return result;
	} catch (error) {
		if (connection) {
			await connection.end()
		}
		throw (error)

	}
}


// getClientesLogados2
// lee todos los registros de la tabla clientes y
// los devuelve como una lista de objetos
module.exports.getClientesLogados2 = function(params, callback) {
    var connection = conector.getConnectionBd();
    var clientes = null;
    sql = "SELECT * FROM sclien WHERE NOT playerId IS NULL";
    if (params) {
        if (params.soloMensajes) sql += " AND soloMensajes = 1";
        if (params.ariagro) sql += " AND NOT ariagroId IS NULL";
        if (params.tienda) sql += " AND NOT tiendaId IS NULL";
        if (params.telefonia) sql += " AND NOT telefoniaId IS NULL";
        if (params.gasolinera) sql += " AND NOT gasolineraId IS NULL";
        if (params.esTrabajador) sql += " AND esTrabajador = 1";
    }
    sql += "  ORDER BY nomclien";
    connection.query(sql, function(err, result) {
        conector.closeConnection(connection);
        if (err) {
            return callback(err, null);
        }
        clientes = result;
        callback(null, clientes);
    });

}


// [export] getLogin
// 
module.exports.getLogin = function(login, password, callback) {
    var usuario = null;
    var longitud;
    var cadena1;
    var cadena2 = "*";
    var sql = "SELECT * FROM sclien WHERE login = ? AND password = ?";
    sql = mysql.format(sql, [login, password]);
    var connection = conector.getConnectionBd();
    connection.query(sql, function(err, result) {
        if (err) {
            conector.closeConnection(connection);
            return callback(err, null);
        }
        if (result && (result.length > 0)) {
            usuario = result[0];
            if(usuario.iban) {
                longitud = usuario.iban.length - 4;
                usuario.ibanOriginal =  usuario.iban;
                cadena1 = usuario.iban.substr(longitud);
                for(var i =0; i< longitud -1; i++) {
                    cadena2 += "*"
                }
                usuario.iban = cadena2 + cadena1;
            }
            sql = "SELECT * FROM " + process.env.ARIAGRODATABASE + ".rsocios WHERE codsocio = ?";
            sql = mysql.format(sql, usuario.ariagroId);
            connection.query(sql, function(err, result){
                conector.closeConnection(connection);
                if (!err && result.length > 0) {
                    usuario.socio = result[0];
                }
                return callback(null, usuario);
           })
        } else {
            return callback(null, usuario);
        }
    });

};

module.exports.getClientesBuscar = async (nomclien, empresaId) => {
	let conn = undefined;
	try {
		let cfg = await connector.empresa(empresaId)
		conn = await mysql2.createConnection(cfg)
        var sql = "SELECT * FROM sclien ORDER BY nomclien";
        if (nomclien !== "*") {
            sql = "SELECT * FROM sclien WHERE nomclien LIKE ? ORDER BY nomclien";
			sql = mysql2.format(sql, '%' + nomclien + '%');
		}
		const [result] = await conn.query(sql)
		await conn.end()
		return result
	} catch(error) {
		if (conn) {
			await conn.end()
		}
		throw (error)
	}
}


// getClientesBuscarLogados
// lee todos los registros de la tabla clientes cuyo
// nomclien contiene la cadena de búsqueda. Si la cadena es '*'
// devuelve todos los registros
module.exports.getClientesBuscarLogados = async (nomclien, empresaId) => {
	let conn = undefined;
	try {
		let cfg = await connector.empresa(empresaId)
		conn = await mysql2.createConnection(cfg)
        var sql = "SELECT * FROM sclien WHERE NOT playerId IS NULL ORDER BY nomclien";
        if (nomclien !== "*") {
            sql = "SELECT * FROM sclien WHERE NOT playerId IS NULL AND nomclien LIKE ? ORDER BY nomclien";
			sql = mysql2.format(sql, '%' + nomclien + '%');
		}
		const [result] = await conn.query(sql)
		await conn.end()
		return result
	} catch(error) {
		if (conn) {
			await conn.end()
		}
		throw (error)
	}
}


// getCliente
// busca  el cliente con id pasado
module.exports.getCliente = async (id, empresaId) => {
    let  connection = undefined;
    try {
        let cfg = await connector.empresa(empresaId);
		connection = await mysql2.createConnection(cfg);
        sql = "SELECT * FROM sclien WHERE codclien = ?";
        sql = mysql2.format(sql, id);
        const [result] = await connection.query(sql);
		await connection.end();
		return result;

    } catch(error) {
        if (connection) {
			await connection.end()
		}
		throw (error)
    }
}


module.exports.getClientesSinLogar = async (empresaId) => {
    let  connection = undefined;
    try{
        let cfg = await connector.empresa(empresaId);
		connection = await mysql2.createConnection(cfg);
        sql = "SELECT * FROM sclien WHERE  playerId IS NULL  ORDER BY nomclien";
        const [result] = await connection.query(sql);
		await connection.end();
		return result;
    } catch(error) {
        if (connection) {
			await connection.end()
		}
		throw (error)
    }
}


// postCliente
// crear en la base de datos el cliente pasado
module.exports.postCliente = function(cliente, callback) {
    if (!comprobarCliente(cliente)) {
        var err = new Error("El cliente pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
        callback(err);
        return;
    }
    var connection = conector.getConnectionBd();
    cliente.codclien = 0; // fuerza el uso de autoincremento
    sql = "INSERT INTO sclien SET ?";
    sql = mysql.format(sql, cliente);
    connection.query(sql, function(err, result) {
        conector.closeConnection(connection);
        if (err) {
            return callback(err);
        }
        cliente.codclien = result.insertId;
        callback(null, cliente);
    });
}

// putCliente
// Modifica el cliente según los datos del objeto pasao
module.exports.putCliente = function(id, cliente, callback) {
    delete cliente.telsoci1;
    delete cliente.telsoci2;
    delete cliente.telsoci3;
    delete cliente.movsocio;
    delete cliente.socio;
    if(cliente.ibanOriginal) {
        cliente.iban = cliente.ibanOriginal
        delete cliente.ibanOriginal;
    }
    if (!comprobarCliente(cliente)) {
        var err = new Error("El cliente pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
        console.log("ERR1: ", JSON.stringify(err));
        callback(err);
        return;
    }
    if (id != cliente.codclien) {
        var err = new Error("El ID del objeto y de la url no coinciden");
        console.log("ERR2: ", JSON.stringify(err));
        callback(err);
        return;
    }
    var connection = conector.getConnectionBd();
    sql = "UPDATE sclien SET ? WHERE codclien = ?";
    sql = mysql.format(sql, [cliente, cliente.codclien]);
    connection.query(sql, function(err, result) {
        conector.closeConnection(connection);
        if (err) {
            console.log("ERR3: ", JSON.stringify(err));
            return callback(err);
        }
        callback(null, cliente);
    });
}

// deleteCliente
// Elimina el cliente con el id pasado
module.exports.deleteCliente = function(id, cliente, callback) {
    var connection = conector.getConnectionBd();
    sql = "DELETE from sclien WHERE codclien = ?";
    sql = mysql.format(sql, id);
    connection.query(sql, function(err, result) {
        conector.closeConnection(connection);
        if (err) {
            return callback(err);
        }
        callback(null);
    });
}
