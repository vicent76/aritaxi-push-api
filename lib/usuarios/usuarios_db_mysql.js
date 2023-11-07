// usuarios_db_mysql
// Manejo de la tabla usuarios en la base de datos
var mysql = require("mysql"); // librería para el acceso a bases de datos MySQL
var async = require("async"); // librería para el manejo de llamadas asíncronas en JS
var connector = require('../comun/conector_mysql');
var mysql2 = require('mysql2/promise');


var sql = "";

// comprobarUsuario
// comprueba que tiene la estructura de objeto mínima
// necesaria para guardarlo en la base de datos
// Por ejemplo, que es del tipo correcto y tiene los atributos 
// adecuados.
function comprobarUsuario(usuario){
	// debe ser objeto del tipo que toca
	var comprobado = "object" === typeof usuario;
	// en estas propiedades no se admiten valores nulos
	comprobado = (comprobado && usuario.hasOwnProperty("codusu"));
	comprobado = (comprobado && usuario.hasOwnProperty("nomusu"));
	comprobado = (comprobado && usuario.hasOwnProperty("login"));
	comprobado = (comprobado && usuario.hasOwnProperty("password"));
	return comprobado;
}


// getUsuarios
// lee todos los registros de la tabla usuarios y
// los devuelve como una lista de objetos
module.exports.getUsuarios = async (empresaId) =>{
	let  connection = undefined;
	try {
		let cfg = await connector.usuarios(empresaId);
		connection = await mysql2.createConnection(cfg);
		var sql = "SELECT * FROM usuarios";
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


module.exports.loginUsuarios = async (peticion) => {
	let conn = undefined
	try {
		let cfg = await connector.usuarios(peticion.empresaId)
		conn = await mysql2.createConnection(cfg)
		let sql = `SELECT * FROM usuarios WHERE login='${peticion.login}' AND passwordpropio='${peticion.password}'  AND nivelaritaxi >= 0`
		const [r1] = await conn.query(sql);
		await conn.end()
		if (r1.length === 0) return null
		return r1[0]
	} catch (error) {
		if (conn) {
			await conn.end()
		}
		throw (error)
	}
},

// getUsuariosBuscar
// lee todos los registros de la tabla usuarios cuyo
// nomusu contiene la cadena de búsqueda. Si la cadena es '*'
// devuelve todos los registros
module.exports.getUsuariosBuscar = async (nomusu, empresaId) => {
	let conn = undefined;
	try {
		let cfg = await connector.usuarios(empresaId)
		conn = await mysql2.createConnection(cfg)
		var sql = "SELECT * FROM usuarios";
		if (nomusu !== "*") {
			sql = "SELECT * FROM usuarios WHERE nomusu LIKE ?";
			sql = mysql2.format(sql, '%' + nomusu + '%');
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

// getUsuario
// busca  el usuario con id pasado
module.exports.getUsuario = function(id, callback){
	var connection = conector.getConnectionUsuarios();
	var usuarios = null;
	sql = "SELECT * FROM usuarios WHERE codusu = ?";
	sql = mysql.format(sql, id);
	connection.query(sql, function(err, result){
		conector.closeConnection(connection);
		if (err){
			return callback(err, null);
		}
		if (result.length == 0){
			return callback(null, null);
		}
		callback(null, result[0]);
	});
}


// postUsuario
// crear en la base de datos el usuario pasado
module.exports.postUsuario = function (usuario, callback){
	if (!comprobarUsuario(usuario)){
		var err = new Error("El usuario pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
		callback(err);
		return;
	}
	var connection = conector.getConnectionUsuarios();
	usuario.codusu = 0; // fuerza el uso de autoincremento
	sql = "INSERT INTO usuarios SET ?";
	sql = mysql.format(sql, usuario);
	connection.query(sql, function(err, result){
		conector.closeConnection(connection);
		if (err){
			return callback(err);
		}
		usuario.codusu = result.insertId;
		callback(null, usuario);
	});
}

// putUsuario
// Modifica el usuario según los datos del objeto pasao
module.exports.putUsuario = function(id, usuario, callback){
	if (!comprobarUsuario(usuario)){
		var err = new Error("El usuario pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
		callback(err);
		return;
    }
    if (id != usuario.codusu) {
        var err = new Error("El ID del objeto y de la url no coinciden");
        callback(err);
        return;
    }
	var connection = conector.getConnectionUsuarios();
	sql = "UPDATE usuarios SET ? WHERE codusu = ?";
	sql = mysql.format(sql, [usuario, usuario.codusu]);
	connection.query(sql, function(err, result){
		conector.closeConnection(connection);
		if (err){
			return callback(err);
		}
		callback(null, usuario);
	});
}

// deleteUsuario
// Elimina el usuario con el id pasado
module.exports.deleteUsuario = function(id, callback){
	var connection = conector.getConnectionUsuarios();
	sql = "DELETE from usuarios WHERE codusu = ?";
	sql = mysql.format(sql, id);
	connection.query(sql, function(err, result){
		conector.closeConnection(connection);
		if (err){
			return callback(err);
		}
		callback(null);
	});
}