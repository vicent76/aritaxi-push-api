const mysql = require('mysql2/promise')
const connector = require('../../lib/comun/conector_mysql')

const estadisticas_mysql = {
    test: async () => {
        return 'ESTADISTICAS TEST'
    },
}

module.exports.getEstadisticas = async (dFecha, hFecha) => {
	let conn = undefined;
	try {
		let cfg = await connector.usuarios(empresaId)
		conn = await mysql.createConnection(cfg)
		var sql = "SELECT * FROM app_estadisticas";
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

module.exports = estadisticas_mysql