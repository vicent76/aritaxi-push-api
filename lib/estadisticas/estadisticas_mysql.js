const mysql = require('mysql2/promise')
const connector = require('../../lib/comun/conector_mysql')

const estadisticas_mysql = {
    test: async () => {
        return 'ESTADISTICAS TEST'
    },

    getEstadisticas: async (ano, mes, licencia) => {
        let conn = undefined;
        try {
            let cfg = await connector.base(null)
            conn = await mysql.createConnection(cfg)
            var sql = "SELECT * FROM app_estadisticas";
            sql += " WHERE ano = ? AND mes = ? AND licencia = ?";
            sql = mysql.format( sql, [ano, mes, licencia] );
            const [result] = await conn.query(sql);
            await conn.end()
            return result[0]
        } catch(error) {
            if (conn) {
                await conn.end()
            }
            throw (error)
        }
    },

    getAnyos: async () => {
        let conn = undefined;
        try {
            let cfg = await connector.base(null)
            conn = await mysql.createConnection(cfg)
            var sql = "SELECT DISTINCT ano FROM app_estadisticas ORDER BY ano desc LIMIT 2";
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