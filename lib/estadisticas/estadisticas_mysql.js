const mysql = require('mysql2/promise')
const connector = require('../../lib/comun/conector_mysql')

const estadisticas_mysql = {
    test: async () => {
        return 'ESTADISTICAS TEST'
    },

    getEstadisticas: async (dFecha, hFecha, licencia) => {
        let conn = undefined;
        try {
            let cfg = await connector.base(null)
            conn = await mysql.createConnection(cfg)
            var sql = "SELECT * FROM app_estadisticas";
            //sql += "LEFT JOIN sclien as c ON c.clicencia"
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
    
}

module.exports = estadisticas_mysql