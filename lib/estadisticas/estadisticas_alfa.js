//const moment = require('moment-timezone')
const dotenv = require('dotenv')
//const axios = require('axios')
const mysqlEstadisticas = require('./estadisticas_mysql')
dotenv.config()

let zona_horaria = process.env.ESTADISTICAS_LOCAL || 'Europe/Madrid'

const estadisticas_alfa = {
    fechasMesActual: async() => {
        let fecha_local = moment().tz(zona_horaria).format('YYYY-MM-DD HH:mm:ss')
        let datos = {
            fecha_actual: fecha_local,
            mes_actual: moment(fecha_local).format('MM'),
            ano_actual: moment(fecha_local).format('YYYY'),
            primer_dia: moment(fecha_local).startOf('month').format('YYYY-MM-DD 00:00:00'),
            ultimo_dia: moment(fecha_local).endOf('month').format('YYYY-MM-DD 23:59:59'),
        }
        return datos
    },
    historicoServicios: async(desdeFecha, hastaFecha, pagina) => {
        let alfaHistoricUrl = process.env.ALFA_URL
        let alfaCompanyId =  process.env.ALFA_COMPANYID
        let alfaUser =  process.env.ALFA_USER
        let alfaPassword =  process.env.ALFA_PASSWORD
        let alfaConfigurationId = process.env.ALFA_CONFIGURATIONID
        const url = `${alfaHistoricUrl}/historicaltrips?pageNumber=${pagina}&pageSize=100&companyId=${alfaCompanyId}&fromDate=${desdeFecha}&toDate=${hastaFecha}`
        const { data: resultado } = await axios.get(url, {
            headers: {
                CONFIGURATIONID: alfaConfigurationId
            },
            auth: {
                username: alfaUser,
                password: alfaPassword
            }
        })
        return resultado
    }

}

module.exports = estadisticas_alfa