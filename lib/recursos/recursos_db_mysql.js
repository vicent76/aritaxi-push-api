// recursos_db_mysql
// Manejo de la tabla recursos en la base de datos
var mysql = require("mysql"); // librería para el acceso a bases de datos MySQL
var async = require("async"); // librería para el manejo de llamadas asíncronas en JS
var connector = require('../comun/conector_mysql');
var mysql2 = require('mysql2/promise');



var sql = "";

// comprobarRecurso
// comprueba que tiene la estructura de objeto mínima
// necesaria para guardarlo en la base de datos
// Por ejemplo, que es del tipo correcto y tiene los atributos 
// adecuados.
function comprobarRecurso(recurso){
	// debe ser objeto del tipo que toca
	var comprobado = "object" === typeof recurso;
	// en estas propiedades no se admiten valores nulos
	comprobado = (comprobado && recurso.hasOwnProperty("recursoId"));
	comprobado = (comprobado && recurso.hasOwnProperty("nombre"));
	return comprobado;
}


// getRecursos
// lee todos los registros de la tabla recursos y
// los devuelve como una lista de objetos
module.exports.getRecursos = async (empresaId) =>{
	let  connection = undefined;
	try {
		let cfg = await connector.push(empresaId);
		connection = await mysql2.createConnection(cfg);
		var sql = "SELECT * FROM recursos";
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


// getRecursosBuscar
// lee todos los registros de la tabla recursos cuyo
// nombre contiene la cadena de búsqueda. Si la cadena es '*'
// devuelve todos los registros
module.exports.getRecursosBuscar = async (nombre, empresaId) => {
	let conn = undefined;
	try {
		let cfg = await connector.push(empresaId)
		conn = await mysql2.createConnection(cfg)
		var sql = "SELECT * FROM recursos";
		if (nombre !== "*") {
			sql = "SELECT * FROM recursos WHERE nombre LIKE ?";
			sql = mysql2.format(sql, '%' + nombre + '%');
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


// getRecurso
// busca  el recurso con id pasado
module.exports.getRecurso = async (id, empresaId) => {
    let  connection = undefined;
    try {
        let cfg = await connector.push(empresaId);
		connection = await mysql2.createConnection(cfg);
		sql = "SELECT * FROM recursos WHERE recursoId = ?";
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



// postRecurso
// crear en la base de datos el recurso pasado
module.exports.postRecurso = function (recurso, callback){
	if (!comprobarRecurso(recurso)){
		var err = new Error("El recurso pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
		callback(err);
		return;
	}
	var connection = conector.getConnectionPush();
	recurso.recursoId = 0; // fuerza el uso de autoincremento
	sql = "INSERT INTO recursos SET ?";
	sql = mysql.format(sql, recurso);
	connection.query(sql, function(err, result){
		conector.closeConnection(connection);
		if (err){
			return callback(err);
		}
		recurso.recursoId = result.insertId;
		callback(null, recurso);
	});
}

// putRecurso
// Modifica el recurso según los datos del objeto pasao
module.exports.putRecurso = function(id, recurso, callback){
	if (!comprobarRecurso(recurso)){
		var err = new Error("El recurso pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
		callback(err);
		return;
    }
    if (id != recurso.recursoId) {
        var err = new Error("El ID del objeto y de la url no coinciden");
        callback(err);
        return;
    }
	var connection = conector.getConnectionPush();
	sql = "UPDATE recursos SET ? WHERE recursoId = ?";
	sql = mysql.format(sql, [recurso, recurso.recursoId]);
	connection.query(sql, function(err, result){
		conector.closeConnection(connection);
		if (err){
			return callback(err);
		}
		callback(null, recurso);
	});
}

module.exports.putRecurso = async(id, recurso) => {
	let connection = undefined;
	try {
		if (!comprobarRecurso(recurso)){
			throw new Error("El recurso pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
		}
		if (id != recurso.recursoId) {
			throw new Error("El ID del objeto y de la url no coinciden");
		}
		let cfg = await connector.push(recurso.empresaId);
		connection = await mysql2.createConnection(cfg);
		delete recurso.empresaId
		sql = "UPDATE recursos SET ? WHERE recursoId = ?";
		sql = mysql2.format(sql, [recurso, recurso.recursoId]);
		const [result] = await connection.query(sql);
		await connection.end();
		return recurso;
	} catch(error) {
		if (connection) {
			await connection.end()
		}
		throw (error)
	}
}

// deleteRecurso
// Elimina el recurso con el id pasado
module.exports.deleteRecurso = function(id, recurso, callback){
	var connection = conector.getConnectionPush();
	var recurso = undefined;
	sql = "SELECT * from recursos WHERE recursoId = ?";
	sql = mysql.format(sql, id);
	connection.query(sql, function(err, result){
		if (err){
			return callback(err);
		}
		recurso = result[0];
		sql = "DELETE from recursos WHERE recursoId = ?";
		sql = mysql.format(sql, id);
		connection.query(sql, function(err, result){
			conector.closeConnection(connection);
			if (err){
				return callback(err);
			}
			callback(null, recurso);
		});
			
	});
}