const mysql = require('mysql2/promise')
const connector = require('../../lib/comun/conector_mysql')

const estadisticas_mysql = {
    test: async () => {
        return 'ESTADISTICAS TEST'
    },
}

module.exports = estadisticas_mysql