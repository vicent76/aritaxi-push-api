const dotenv = require('dotenv')
const mysql = require('mysql2/promise')
dotenv.config()

const conectorMysql = {
    base: async () => {
        let configuracion = {
            host: process.env.BASE_MYSQL_SERVER,
            port: process.env.BASE_MYSQL_PORT,
            user: process.env.BASE_MYSQL_USER,
            password: process.env.BASE_MYSQL_PASSWORD,
            database: process.env.BASE_MYSQL_DATABASE,
            decimalNumbers: true,
            timezone: "UTC"
        }
        return configuracion
    },
    empresa: async(empresaId) => {
        let conn = undefined
        try {
            let cfg = await conectorMysql.base()
            conn = await mysql.createConnection(cfg)
            let sql = `SELECT * FROM empresas WHERE empresaId = ${empresaId}`
            const [r] = await conn.query(sql)
            if (r.length == 0) throw new Error(`No se ha encontrado una empresa con el id ${empresaId}`)
            await conn.end()
            let empresa = r[0]
            let configuracion = {
                host: empresa.mysqlServer,
                port: empresa.mysqlPort,
                user: empresa.mysqlUsuario,
                password: empresa.mysqlPassword,
                database: empresa.mysqlBaseDatos,
                decimalNumbers: true,
                timezone: "UTC"
            }
            return configuracion
        } catch (error) {
            if (conn) await conn.end()  
            throw(error)
        }
    }
}

module.exports = conectorMysql