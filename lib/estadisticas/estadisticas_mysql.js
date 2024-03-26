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

    getEstadisticas6um: async (licencia) => {
        let conn = undefined;
        let respuesta = {
            labels: [],
            importeContado: [],
            importeCredito: [],
            viajesContado: [],
            viajesCredito: []
        }
        try {
            let cfg = await connector.base(null)
            conn = await mysql.createConnection(cfg)
            let sql =`SELECT CONCAT(ano, '-', mes) as label,
            viajes - viajesLiquidable as viajesContado, 
            viajesLiquidable as viajesCredito,
            importe - importeLiquidable as importeContado, 
            importeLiquidable  as importeCredito
            FROM app_estadisticas
            WHERE STR_TO_DATE(CONCAT(ano, '-', mes, '-01'), '%Y-%m-%d') >= DATE_SUB(DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'), INTERVAL 3 MONTH)
            AND licencia = ${licencia}`
            const [result] = await conn.query(sql);
            for (let index = 0; index < result.length; index++) {
                const element = result[index];
                respuesta.labels.push(element.label)
                respuesta.importeContado.push(element.importeContado)
                respuesta.importeCredito.push(element.importeCredito)
                respuesta.viajesContado.push(element.viajesContado)
                respuesta.viajesCredito.push(element.viajesCredito)
            }
            await conn.end()
            return respuesta
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