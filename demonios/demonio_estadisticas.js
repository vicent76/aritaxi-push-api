const dotenv = require('dotenv')
const moment = require('moment')
const mysql = require('mysql2/promise')
const connector = require('../lib/comun/conector_mysql')
const estadisticasAlfa = require('../lib/estadisticas/estadisticas_alfa')
const fs = require('fs')
dotenv.config()

let estaTrabajando = false
let regLic = []

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
                let pageSize = 5000
                console.log(`Procesando desde ${desdeFecha} hasta ${hastaFecha}`)
                // Hacemos la primera llamada y asi obtenemos los primeros datos 
                // y conocemos el número total de registros.
                let resultados = []
                // Leemos las diferentes empresas en un vector
                let empresas = process.env.ALFA_COMPANIES.split(',')
                for (let index = 0; index < empresas.length; index++) {
                    const empresa = empresas[index];
                    await demonioEstadisticas.procesarUnaEmpresa(desdeFecha, hastaFecha, empresa, resultados, pageSize)
                }
                await demonioEstadisticas.grabarResultados(resultados, ano, mes)
                // fs.writeFileSync('2122.json', JSON.stringify(regLic, null))
                console.log('Demonio estadisticas end')
                estaTrabajando = false
            } catch (error) {
                console.log("Error demonio", error)
                estaTrabajando = false
            }
        })()
    },
    procesarUnaEmpresa: async (desdeFecha, hastaFecha, empresa, resultados, pageSize) => {
        let pagina = 1
        let datos = await estadisticasAlfa.historicoServiciosPorEmpresa(desdeFecha, hastaFecha, pagina, empresa, pageSize)
        let totalRegistros = datos.totalCount
        let registros = datos.data
        await demonioEstadisticas.procesarGrupoRegistros(registros, resultados, empresa)
        let numPaginas = Math.ceil(totalRegistros / pageSize) // Ahora parametrizado tamaño de página
        console.log(`Procesando páginas: ${pagina} de ${numPaginas} empresa ${empresa}`)
        for (let index = 2; index <= numPaginas; index++) {
            let pagina = index
            console.log(`Procesando páginas: ${pagina} de ${numPaginas} empresa ${empresa}`)
            datos = await estadisticasAlfa.historicoServiciosPorEmpresa(desdeFecha, hastaFecha, pagina, empresa, pageSize)
            registros = datos.data
            await demonioEstadisticas.procesarGrupoRegistros(registros, resultados, empresa)
        }
    },
    procesarGrupoRegistros: async (registros, resultados, empresa) => {
        for (let index = 0; index < registros.length; index++) {
            const registro = registros[index];
            if (registro.STATUS === 956) continue // No procesamos los anulados.
            let licencia = registro.TAXI_LICENSE
            let importe = registro.TRIP_AMOUNT
            let liquidable = false
            if (registro.SUBSCR_CUSTOMER_ID) liquidable = true
            // Buscamos si en los resultados ya existe este objeto
            let nuevo = false
            let taxista = resultados.find(r => (r.licencia === licencia) && (r.empresa === empresa))
            if (taxista) {
                taxista.totalViajes += 1
                taxista.totalImporte += importe
            } else {
                taxista = {
                    licencia: licencia,
                    totalViajes: 1,
                    totalImporte: importe,
                    totalViajesLiq: 0,
                    totalImporteLiq: 0,
                    empresa: empresa
                }
                nuevo = true
            }
            if (liquidable) {
                taxista.totalViajesLiq += 1
                taxista.totalImporteLiq += importe
            }
            if (nuevo) resultados.push(taxista)
        }
    },
    grabarResultados: async (resultados, ano, mes) => {
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
                    importe: resultado.totalImporte,
                    viajesLiquidable: resultado.totalViajesLiq,
                    importeLiquidable: resultado.totalImporteLiq,
                    empresa: resultado.empresa
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