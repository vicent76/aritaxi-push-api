const dotenv = require('dotenv')
const moment = require('moment')
const mysql = require('mysql2/promise')
const connector = require('../lib/comun/conector_mysql')
const estadisticasAlfa = require('../lib/estadisticas/estadisticas_alfa')
dotenv.config()

let estaTrabajando = false

const demonioEstadisticas = {
    run: async () => {
        if (estaTrabajando) {
            return
        }
        (async () => {
            try {
                estaTrabajando = true
                console.log('Demonio estadisticas start')
                // A por los valores que vamos a usar basados en la fecha actual
                let fechas = await estadisticasAlfa.fechasMesActual()
                let desdeFecha = moment(fechas.primer_dia).format('YYYY-MM-DD')
                let hastaFecha = moment(fechas.ultimo_dia).format('YYYY-MM-DD')
                let ano = fechas.ano_actual
                let mes = fechas.mes_actual
                let pagina = 1
                console.log(`Procesando desde ${desdeFecha} hasta ${hastaFecha}`)
                // Hacemos la primera llamada y asi obtenemos los primeros datos 
                // y conocemos el número total de registros.
                let resultados = []
                let datos = await estadisticasAlfa.historicoServicios(desdeFecha, hastaFecha, pagina)
                let totalRegistros = datos.totalCount
                let registros = datos.data
                await demonioEstadisticas.procesarGrupoRegistros(registros, resultados)
                let numPaginas = Math.ceil(totalRegistros / 100) // Cada página 100 registros
                // console.log(`Procesando páginas: ${pagina} de ${numPaginas}`)
                for (let index = 2; index <= numPaginas; index++) {
                    let pagina = index
                    // console.log(`Procesando páginas: ${pagina} de ${numPaginas}`)
                    datos = await estadisticasAlfa.historicoServicios(desdeFecha, hastaFecha, pagina)
                    registros = datos.data
                    await demonioEstadisticas.procesarGrupoRegistros(registros, resultados)
                }
                await demonioEstadisticas.grabarResultados(resultados, ano, mes)
                console.log('Demonio estadisticas end')
                estaTrabajando = false
            } catch (error) {
                console.log("Error demonio", error)
                estaTrabajando = false
            }
        })()
    },
    procesarGrupoRegistros: async(registros, resultados) => {
        for (let index = 0; index < registros.length; index++) {
            const registro = registros[index];
            let licencia = registro.TAXI_LICENSE
            let importe = registro.TRIP_AMOUNT
            // Buscamos si en los resultados ya existe este objeto
            let taxista = resultados.find(r => r.licencia === licencia)
            if (taxista) {
                taxista.totalViajes += 1
                taxista.totalImporte += importe
            } else {
                resultados.push({
                    licencia: licencia,
                    totalViajes: 1,
                    totalImporte: importe
                })
            }
        }
    },
    grabarResultados: async(resultados, ano, mes) => {
        console.log(`Grabando resultados año:${ano} mes:${mes}`)
        let conn = undefined
        try {
            // Creamos una conexión general
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)
            await conn.query('START TRANSACTION')
            // Primero eliminamos los registros para ese año y mes
            let sql = `delete from app_estadisticas where ano = ${ano} and mes = ${mes}`
            await conn.query(sql)
            // Recorremos los resultados para darlos de alta
            for (let index = 0; index < resultados.length; index++) {
                const resultado = resultados[index];
                const reg = {
                    ano: ano,
                    mes: mes,
                    licencia: resultado.licencia,
                    viajes: resultado.totalViajes,
                    importe: resultado.totalImporte
                }
                await conn.query('INSERT INTO app_estadisticas SET ?', reg)
            }
            // Si todo ha ido bien grabamos y cerramos
            await conn.query('COMMIT')
            await conn.end()
            return 
        } catch (error) {
            if (conn) {
                await conn.query('ROLLBACK')
                await conn.end()
            }
            throw (error)
        }
    }
}

module.exports = demonioEstadisticas