// app_enlaces_db_mysql
// Manejo de la tabla app_enlaces en la base de datos
var mysql = require("mysql"); // librería para el acceso a bases de datos MySQL
var async = require("async"); // librería para el manejo de llamadas asíncronas en JS
var connector = require('../comun/conector_mysql');
var mysql2 = require('mysql2/promise');


var sql = "";

// comprobarEnlace
// comprueba que tiene la estructura de objeto mínima
// necesaria para guardarlo en la base de datos
// Por ejemplo, que es del tipo correcto y tiene los atributos 
// adecuados.
function comprobarEnlace(enlace){
	// debe ser objeto del tipo que toca
	var comprobado = "object" === typeof enlace;
	// en estas propiedades no se admiten valores nulos
	comprobado = (comprobado && enlace.hasOwnProperty("enlaceId"));
	comprobado = (comprobado && enlace.hasOwnProperty("nombre"));
	return comprobado;
}


module.exports.getEnlaces = async (empresaId) =>{
	let  connection = undefined;
	try {
		let cfg = await connector.empresa(empresaId);
		connection = await mysql2.createConnection(cfg);
		sql = "SELECT * FROM app_enlaces";
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


// getEnlacesBuscar
// lee todos los registros de la tabla app_enlaces cuyo
// nombre contiene la cadena de búsqueda. Si la cadena es '*'
// devuelve todos los registros
module.exports.getEnlacesBuscar = async (nombre, empresaId) => {
	let conn = undefined;
	try {
		let cfg = await connector.empresa(empresaId)
		conn = await mysql2.createConnection(cfg)
        var sql = "SELECT * FROM app_enlaces";
        if (nombre !== "*") {
            sql = "SELECT * FROM app_enlaces WHERE nombre LIKE ?";
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


// getEnlace
// busca  el enlace con id pasado
module.exports.getEnlace = async (id, empresaId) => {
    let  connection = undefined;
    try {
        let cfg = await connector.empresa(empresaId);
		connection = await mysql2.createConnection(cfg);
		sql = "SELECT * FROM app_enlaces WHERE enlaceId = ?";
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


// postEnlace
// crear en la base de datos el enlace pasado
module.exports.postEnlace = async (enlace) => {
	let connection = undefined;
	enlace.enlaceId = 0; // fuerza el uso de autoincremento
	try {
		if (!comprobarEnlace(enlace)){
			throw new Error("El enlace pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
		}
		let cfg = await connector.empresa(enlace.empresaId);
		connection = await mysql2.createConnection(cfg);
		delete enlace.empresaId
		let sql = "INSERT INTO app_enlaces SET ?";
		sql = mysql2.format(sql, enlace);
		const [result] = await connection.query(sql);
		await connection.end();
		return enlace;
	} catch(error) {
		if (connection) {
			await connection.end()
		}
		throw (error)
	}
}

// putEnlace
// Modifica el enlace según los datos del objeto pasao
module.exports.putEnlace = async(id, enlace) => {
	let connection = undefined;
	try {
		if (!comprobarEnlace(enlace)){
			throw new Error("El enlace pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
		}
		if (id != enlace.enlaceId) {
			throw new Error("El ID del objeto y de la url no coinciden");
		}
		let cfg = await connector.empresa(enlace.empresaId);
		connection = await mysql2.createConnection(cfg);
		delete enlace.empresaId
		sql = "UPDATE app_enlaces SET ? WHERE enlaceId = ?";
		sql = mysql2.format(sql, [enlace, enlace.enlaceId]);
		const [result] = await connection.query(sql);
		await connection.end();
		return enlace;
	} catch(error) {
		if (connection) {
			await connection.end()
		}
		throw (error)
	}
}

// deleteEnlace
// Elimina el enlace con el id pasado
module.exports.deleteEnlace = async(id, empresaId) =>{
	let connection = undefined;
	try {
		let cfg = await connector.empresa(empresaId);
		connection = await mysql2.createConnection(cfg);
		var sql = "DELETE from app_enlaces WHERE enlaceId = ?";
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