const moment = require('moment-timezone')
const dotenv = require('dotenv')
const mysqlEstadisticas = require('./estadisticas_mysql')
dotenv.config()

let zona_horaria = process.env.ESTADISTICAS_LOCAL || 'Europe/Madrid'

const estadisticas_alfa = {
    fechasMesActual: async() => {
        let fecha_local = moment().tz(zona_horaria).format('YYYY-MM-DD HH:mm:ss')
        let datos = {
            fecha_actual: fecha_local,
            mes_actual: moment(fecha_local).month(),
            ano_actual: moment(fecha_local).year(),
            primer_dia: moment(fecha_local).startOf('month').format('YYYY-MM-DD 00:00:00'),
            ultimo_dia: moment(fecha_local).endOf('month').format('YYYY-MM-DD 23:59:59'),
        }
        return datos
    }

}

// export const GetSubscribersHistoricalTrips = (empresa, alfaId, pagina, desdeFecha, hastaFecha) => {
//     const ent = Entorno.gentEnv()
//     const url_base = `${ent.API_URL}/api/alfa/gatewayhist`
//     //const url = `${empresa.alfaHistoricUrl}/subscribershistoricaltrips?pageNumber=${pagina}&pageSize=100&companyId=${empresa.alfaCompanyId}&fromDate=${desdeFecha}&toDate=${hastaFecha}&subscriberNoFrom=${alfaId}&subscriberNoTo=${alfaId}`
//     const url = `${empresa.alfaHistoricUrl}/historicaltrips?pageNumber=${pagina}&pageSize=100&companyId=${empresa.alfaCompanyId}&fromDate=${desdeFecha}&toDate=${hastaFecha}`
//     let data = {
//         "url": url,
//         "user": empresa.alfaHistoricUser,
//         "password": empresa.alfaHistoricPassword,
//         "configurationId": empresa.alfaConfigurationId,
//         "pagina": pagina,
//         "body": {
//             "companyId": empresa.alfaCompanyId,
//             "subscriberNo": alfaId
//         }
//     }
//     return axios.post(url_base, data, {
//         auth: {
//             username: empresa.alfaUser,
//             password: empresa.alfaPassword
//         }
//     })
// }

module.exports = estadisticas_alfa