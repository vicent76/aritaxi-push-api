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
module.exports.getClientes = async (empresaId) => {
    let connection = undefined;
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
module.exports.getClientesLogados = async (empresaId) => {
    let connection = undefined;
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





// [export] getLogin
// 
module.exports.getLogin = async (login, password, empresaId) => {
    let connection = undefined;
    var usuario = null;
    var longitud;
    var cadena1;
    var cadena2 = "*";
    var sql = "";
    try {
        let cfg = await connector.empresa(empresaId);
        connection = await mysql2.createConnection(cfg);
        sql = " SELECT s.*, c.nomchofe FROM sclien AS s";
        sql += " LEFT JOIN scoche AS c ON c.codcoche = s.codcoche";
        sql += " WHERE login = ? AND password = ?";
        sql = mysql2.format(sql, [login, password]);
        const [result] = await connection.query(sql);

        if (result && (result.length > 0)) {
            usuario = result[0];
            if (usuario.iban) {
                longitud = usuario.iban.length - 4;
                usuario.ibanOriginal = usuario.iban;
                cadena1 = usuario.iban.substr(longitud);
                for (var i = 0; i < longitud - 1; i++) {
                    cadena2 += "*"
                }
                usuario.iban = cadena2 + cadena1;
            }
            sql = `select sc2.* 
            from sclien_chofer as sc 
            left join schofe as sc2 on sc2.codchofe = sc.codchofe 
            where sc.codsocio = ${usuario.codclien} and sc.fechabaj is null`
            const [r2] = await connection.query(sql)
            await connection.end();
            usuario.choferes = r2
            return usuario;

        } else {
            await connection.end();
            return null;
        }
    } catch (error) {
        if (connection) {
            await connection.end()
        }
        throw (error)

    }
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
    } catch (error) {
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
    } catch (error) {
        if (conn) {
            await conn.end()
        }
        throw (error)
    }
}


// getCliente
// busca  el cliente con id pasado
module.exports.getCliente = async (id, empresaId) => {
    let connection = undefined;
    try {
        let cfg = await connector.empresa(empresaId);
        connection = await mysql2.createConnection(cfg);
        sql = "SELECT * FROM sclien WHERE codclien = ?";
        sql = mysql2.format(sql, id);
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


module.exports.getClientesSinLogar = async (empresaId) => {
    let connection = undefined;
    try {
        let cfg = await connector.empresa(empresaId);
        connection = await mysql2.createConnection(cfg);
        sql = "SELECT * FROM sclien WHERE  playerId IS NULL  ORDER BY nomclien";
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


// postCliente
// crear en la base de datos el cliente pasado
module.exports.postCliente = function (cliente, callback) {
    if (!comprobarCliente(cliente)) {
        var err = new Error("El cliente pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
        callback(err);
        return;
    }
    var connection = conector.getConnectionBd();
    cliente.codclien = 0; // fuerza el uso de autoincremento
    sql = "INSERT INTO sclien SET ?";
    sql = mysql.format(sql, cliente);
    connection.query(sql, function (err, result) {
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
module.exports.putCliente = async (id, empresaId, cliente) => {
    let connection = undefined;

    try {
        if (!comprobarCliente(cliente)) {
            var err = new Error("El cliente pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
            console.log("ERR1: ", JSON.stringify(err));
            throw err;
        }
        if (id != cliente.codclien) {
            var err = new Error("El ID del objeto y de la url no coinciden");
            console.log("ERR2: ", JSON.stringify(err));
            throw err
        }
        let cfg = await connector.empresa(empresaId);
        connection = await mysql2.createConnection(cfg);

        var sql = `UPDATE sclien SET ? WHERE codclien = ${id}`;
        sql = mysql2.format(sql, cliente);
        const result = await connection.query(sql);
        connection.end();
        return result;

    } catch (error) {
        if (connection) {
            await connection.end()
        }
        throw (error)
    }
}

// deleteCliente
// Elimina el cliente con el id pasado
module.exports.deleteCliente = function (id, cliente, callback) {
    var connection = conector.getConnectionBd();
    sql = "DELETE from sclien WHERE codclien = ?";
    sql = mysql.format(sql, id);
    connection.query(sql, function (err, result) {
        conector.closeConnection(connection);
        if (err) {
            return callback(err);
        }
        callback(null);
    });
}
