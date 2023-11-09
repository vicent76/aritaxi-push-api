// parametros_db_mysql
// Manejo de la tabla app_parametros en la base de datos
var mysql = require("mysql"); // librería para el acceso a bases de datos MySQL
var async = require("async"); // librería para el manejo de llamadas asíncronas en JS
var connector = require('../comun/conector_mysql');
var mysql2 = require('mysql2/promise');


var sql = "";

// comprobarParametro
// comprueba que tiene la estructura de objeto mínima
// necesaria para guardarlo en la base de datos
// Por ejemplo, que es del tipo correcto y tiene los atributos 
// adecuados.
function comprobarParametro(parametro){
	// debe ser objeto del tipo que toca
	var comprobado = "object" === typeof parametro;
	// en estas propiedades no se admiten valores nulos
	comprobado = (comprobado && parametro.hasOwnProperty("parametroId"));
	return comprobado;
}


// getParametros
// lee todos los registros de la tabla app_parametros y
// los devuelve como una lista de objetos
module.exports.getParametros = function(callback){
	var connection = conector.getConnectionPush();
	var parametros = null;
	sql = "SELECT * FROM app_parametros";
	connection.query(sql, function(err, result){
		conector.closeConnection(connection);
		if (err){
			return callback(err, null);
		}
		parametros = result;
		callback(null, parametros);
	});	
}

// getParametro
// busca  el parametro con id pasado
module.exports.getParametro = async (id, empresaId) =>{
	let conn = undefined
	try {
		let cfg = await connector.empresa(empresaId);
		conn = await mysql2.createConnection(cfg);
		sql =  `SELECT * FROM app_parametros WHERE parametroId ='${id}'`;
		const [parametro] = await conn.query(sql);
		await conn.end()
		return parametro[0]
	}catch(error) {
		if (conn) {
			await conn.end()
		}
		throw (error)
	}
}



// postParametro
// crear en la base de datos el parametro pasado
module.exports.postParametro = async (parametro, callback) => {
	let conn = undefined
	if (!comprobarParametro(parametro))	throw new Error("El parametro pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
	parametro.parametroId = 0; // fuerza el uso de autoincremento
	sql = "INSERT INTO app_parametros SET ?";
	sql = mysql.format(sql, parametro);
	connection.query(sql, function(err, result){
		conector.closeConnection(connection);
		if (err){
			return callback(err);
		}
		parametro.parametroId = result.insertId;
		callback(null, parametro);
	});
}

// putParametro
// Modifica el parametro según los datos del objeto pasao
module.exports.putParametro = async (id, empresaId, parametro) => {
	try {
		let conn = undefined
		if (!comprobarParametro(parametro))	throw new Error("El parametro pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
		if (id != parametro.parametroId) throw new Error("El ID del objeto y de la url no coinciden");
		let cfg = await connector.empresa(empresaId);
		conn = await mysql2.createConnection(cfg);
		var sql = `UPDATE app_parametros SET ? WHERE parametroId = ${id}`;
		sql = mysql2.format(sql, parametro)
		const [result] = await conn.query(sql);
		await conn.end()
		return result
	} catch(error) {
		if (conn) {
			await conn.end()
		}
		throw (error)
	}
}

// deleteParametro
// Elimina el parametro con el id pasado
module.exports.deleteParametro = function(id, parametro, callback){
	var connection = conector.getConnectionPush();
	sql = "DELETE from app_parametros WHERE parametroId = ?";
	sql = mysql.format(sql, id);
	connection.query(sql, function(err, result){
		conector.closeConnection(connection);
		if (err){
			return callback(err);
		}
		callback(null);
	});
}