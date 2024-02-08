const dotenv = require('dotenv')
const mysql2 = require('mysql2/promise')
dotenv.config()


const conectorMysql = {
    base: async () => {
        let configuracion = {
            host: process.env.BASE_MYSQL_SERVER,
            port: process.env.BASE_MYSQL_PORT,
            user: process.env.BASE_MYSQL_USER,
            password: process.env.BASE_MYSQL_PASSWORD,
            database: process.env.BASE_MYSQL_DATABASE,
            decimalNumbers: true
        }
        return configuracion
    },
    empresa: async(empresaId) => {
        let configuracion = {
            host: process.env.BASE_MYSQL_SERVER,
            port: process.env.BASE_MYSQL_PORT,
            user: process.env.BASE_MYSQL_USER,
            password: process.env.BASE_MYSQL_PASSWORD,
            database: process.env.BASE_MYSQL_DATABASE,
            decimalNumbers: true
        }
        return configuracion
        // let conn = undefined
        // try {
        //     let cfg = await conectorMysql.base()
        //     conn = await mysql2.createConnection(cfg)
        //     let sql = `SELECT * FROM empresas WHERE empresaId = ${empresaId}`
        //     const [r] = await conn.query(sql)
        //     if (r.length == 0) throw new Error(`No se ha encontrado una empresa con el id ${empresaId}`)
        //     await conn.end()
        //     let empresa = r[0]
        //     let configuracion = {
        //         host: empresa.mysqlServer,
        //         port: empresa.mysqlPort,
        //         user: empresa.mysqlUsuario,
        //         password: empresa.mysqlPassword,
        //         database: empresa.mysqlBaseDatos,
        //         decimalNumbers: true,
        //     }
        //     return configuracion
        // } catch (error) {
        //     if (conn) await conn.end()  
        //     throw(error)
        // }
    },

    usuarios: async(empresaId) => {
        let configuracion = {
            host: process.env.BASE_MYSQL_SERVER,
            port: process.env.BASE_MYSQL_PORT,
            user: process.env.BASE_MYSQL_USER,
            password: process.env.BASE_MYSQL_PASSWORD,
            database: process.env.BASE_MYSQL_USUARIOS,
            decimalNumbers: true
        }
        return configuracion
        // let conn = undefined;
        // try {
        //     let cfg = await conectorMysql.base()
        //     conn = await mysql2.createConnection(cfg)
        //     let sql = `SELECT * FROM empresas WHERE empresaId = ${empresaId}`
        //     const [r] = await conn.query(sql)
        //     if (r.length == 0) throw new Error(`No se ha encontrado una empresa con el id ${empresaId}`)
        //     await conn.end()
        //     let empresa = r[0]
        //     let configuracion = {
        //         host: empresa.mysqlServer,
        //         port: empresa.mysqlPort,
        //         user: empresa.mysqlUsuario,
        //         password: empresa.mysqlPassword,
        //         database: empresa.mysqlBaseDatosUsuarios,
        //         decimalNumbers: true
        //     }
        //     return configuracion
        // } catch (error) {
        //     if (conn) await conn.end()  
        //     throw(error)
        // }
    },
    
sqlInString: function(v) {
    var sl = "";
    for (var i = 0; i < v.length; i++) {
        sl += "'" + v[i] + "',";
    }
    if (v.length > 0){
        // eliminar la última coma
        sl = sl.substring(0, sl.length-1);
    }
    return sl;
},



}

module.exports = conectorMysql