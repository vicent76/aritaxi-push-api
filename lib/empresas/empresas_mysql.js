const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')

const empresas_mysql = {
    test: async () => {
        return 'EMPRESAS TEST'
    },
    postEmpresa: async (empresa) => {
        let conn = undefined
        try {
            // Creamos una conexión general
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)
            // Primero actualizamos la empresa base
            const [r1] = await conn.query('INSERT INTO empresas SET ?', empresa)
            empresa.empresaId = r1.insertId
            // Ahora la base de datos específica de la empresa
            await conn.query(`INSERT INTO ${empresa.mysqlBaseDatos}.empresas SET ?`, empresa)
            // Si todo ha ido bien grabamos y cerramos
            await conn.end()
            return empresa
        } catch (error) {
            if (conn) {
                await conn.end()
            }
            throw (error)
        }
    },
    getEmpresas: async () => {
        let conn = undefined
        try {
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)
            let sql = `SELECT * FROM empresas`
            const [empresas] = await conn.query(sql)
            await conn.end()
            return empresas
        } catch (error) {
            if (conn) {
                await conn.end()
            }
            throw (error)
        }
    },
    getEmpresa: async (empresaId) => {
        let conn = undefined
        try {
            let cfg = await connector.base()
            let empresa = null
            conn = await mysql.createConnection(cfg)
            let sql = `SELECT * FROM empresas WHERE empresaId = ${empresaId}`
            const [r] = await conn.query(sql)
            await conn.end()
            if (r.length == 0) return empresa
            empresa = r[0]
            return empresa
        } catch (error) {
            if (conn) {
                await conn.end()
            }
            throw (error)
        }
    },
    putEmpresa: async (empresa) => {
        let conn = undefined
        try {
            // Creamos una conexión general
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)
            // Protegemos con una transacción
            await conn.query('START TRANSACTION')
            // Primero actualizamos la empresa base
            await conn.query('UPDATE empresas SET ? WHERE empresaId = ?', [empresa, empresa.empresaId])
            // Ahora la base de datos específica de la empresa
            await conn.query(`UPDATE ${empresa.mysqlBaseDatos}.empresas SET ? WHERE empresaId = ?`, [empresa, empresa.empresaId])
            // Si todo ha ido bien grabamos y cerramos
            await conn.query('COMMIT')
            await conn.end()
            return empresa
        } catch (error) {
            if (conn) {
                await conn.query('ROLLBACK')
                await conn.end()
            }
            throw (error)
        }
    },
    deleteEmpresa: async (empresaId) => {
        let conn = undefined
        try {
            // Creamos una conexión general
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)
            // Buscamos la empresa en la base para conocer la base de datos específica
            const [r0] = await conn.query(`SELECT * FROM empresas WHERE empresaId = ${empresaId}`)
            if (r0.length === 0) return null
            let empresa = r0[0]
            // Primero actualizamos la empresa base
            const [r1] = await conn.query('DELETE FROM empresas WHERE empresaId = ?', empresaId)
            // Ahora la base de datos específica de la empresa
            const [r2] = await conn.query(`DELETE FROM ${empresa.mysqlBaseDatos}.empresas WHERE empresaId = ?`, empresaId)
            // Si todo ha ido bien grabamos y cerramos
            await conn.end()
            return {
                raiz: r1,
                particular: r2
            }
        } catch (error) {
            if (conn) {
                await conn.end()
            }
            throw (error)
        }
    },
    postBuscarCodigoWeb: async (codigoWeb) => {
        let conn = undefined
        try {
            // Creamos una conexión general
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)
            const [r0] = await conn.query(`SELECT * FROM empresas WHERE codigoWeb='${codigoWeb}'`)
            await conn.end()
            if (r0.length === 0) return null
            let empresa = r0[0]
            let respuesta = empresa
            return respuesta
        } catch (error) {
            if (conn) {
                await conn.end()
            }
            throw (error)
        }
    },
    postBuscarAccUrl: async (accUrl) => {
        let conn = undefined
        try {
            // Creamos una conexión general
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)
            const [r0] = await conn.query(`SELECT * FROM empresas WHERE accUrl='${accUrl}'`)
            await conn.end()
            if (r0.length === 0) return null
            let empresa = r0[0]
            let respuesta = empresa
            return respuesta
        } catch (error) {
            if (conn) {
                await conn.end()
            }
            throw (error)
        }
    },
}

module.exports = empresas_mysql