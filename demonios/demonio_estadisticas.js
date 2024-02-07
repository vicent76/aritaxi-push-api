const dotenv = require('dotenv')
const moment = require('moment')
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
    }
}

module.exports = demonioEstadisticas