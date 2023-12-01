const dotenv = require('dotenv')
const mysql2 = require('mysql2/promise')
dotenv.config()
var mysql1 = require('mysql');

//var config2 = require('../../config/mysql_config.json');




/*
module.exports.getConnectionGeneral = function(db) {
    var connection = mysql.createConnection({
        host: process.env.SERVER,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: db,
        port: process.env.PORT
    });
    connection.connect(function(err) {
        if (err) throw err;
        return null;
    });
    return connection;
};

module.exports.getConnectionUsuarios = function() {
    var connection = mysql.createConnection({
        host: process.env.USUARIOS_SERVER,
        user: process.env.USUARIOS_USER,
        password: process.env.USUARIOS_PASSWORD,
        database: process.env.USUARIOS_DATABASE,
        port: process.env.USUARIOS_PORT
    });
    connection.connect(function(err) {
        if (err) throw err;
        return null;
    });
    return connection;
};

module.exports.getConnectionBd = function() {
    var connection = mysql.createConnection({
        host: process.env.BD_SERVER,
        user: process.env.BD_USER,
        password: process.env.BD_PASSWORD,
        database: process.env.BD_DATABASE,
        port: process.env.BD_PORT
    });
    connection.connect(function(err) {
        if (err) throw err;
        return null;
    });
    return connection;
};


module.exports.getConnectionCampanya = function(campanya) {
    var connection = mysql.createConnection({
        host: process.env.ARIAGROSERVER,
        user: process.env.ARIAGROUSER,
        password: process.env.ARIAGROPASSWORD,
        database: campanya,
        port: process.env.ARIAGROPORT
    });
    connection.connect(function(err) {
        if (err) throw err;
        return null;
    });
    return connection;
};

module.exports.getConnectionTienda = function() {
    var cfg = {
        host: process.env.TIENDA_SERVER,
        user: process.env.TIENDA_USER,
        password: process.env.TIENDA_PASSWORD,
        database: process.env.TIENDA_DATABASE,
        port: process.env.TIENDA_PORT
    }
    var connection = mysql.createConnection(cfg);
    connection.connect(function(err) {
        if (err) throw err;
        return null;
    });
    return connection;
};

module.exports.getConnectionAceite = function() {
    var connection = mysql.createConnection({
        host: process.env.ACEITE_SERVER,
        user: process.env.ACEITE_USER,
        password: process.env.ACEITE_PASSWORD,
        database: process.env.ACEITE_DATABASE,
        port: process.env.ACEITE_PORT
    });
    connection.connect(function(err) {
        if (err) throw err;
        return null;
    });
    return connection;
};


module.exports.getConnectionTratamientos = function(db) {
    if (!db) {
        db = process.env.TRATAMIENTOS_DATABASE;
    }
    var connection = mysql.createConnection({
        host: process.env.TRATAMIENTOS_SERVER,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: db,
        port: process.env.TRATAMIENTOS_PORT
    });
    connection.connect(function(err) {
        if (err) throw err;
        return null;
    });
    return connection;
};



module.exports.getConnectionTelefonia = function() {
    var connection = mysql.createConnection({
        host: process.env.TELEFONIA_SERVER,
        user: process.env.TELEFONIA_USER,
        password: process.env.TELEFONIA_PASSWORD,
        database: process.env.TELEFONIA_DATABASE,
        port: process.env.TELEFONIA_PORT
    });
    connection.connect(function(err) {
        if (err) throw err;
        return null;
    });
    return connection;
};

module.exports.getConnectionGasolinera = function() {
    var connection = mysql.createConnection({
        host: process.env.GASOLINERA_SERVER,
        user: process.env.GASOLINERA_USER,
        password: process.env.GASOLINERA_PASSWORD,
        database: process.env.GASOLINERA_DATABASE,
        port: process.env.GASOLINERA_PORT
    });
    connection.connect(function(err) {
        if (err) throw err;
        return null;
    });
    return connection;
};


module.exports.getConnectionGesSocial = function() {
    var connection = mysql.createConnection({
        host: process.env.GESSOCIAL_SERVER,
        user: process.env.GESSOCIAL_USER,
        password: process.env.GESSOCIAL_PASSWORD,
        database: process.env.GESSOCIAL_DATABASE,
        port: process.env.GESSOCIAL_PORT
    });
    connection.connect(function(err) {
        if (err) throw err;
        return null;
    });
    return connection;
};

module.exports.getConnectionPush = function() {
    var connection = mysql.createConnection({
        host: process.env.PUSH_SERVER,
        user: process.env.PUSH_USER,
        password: process.env.PUSH_PASSWORD,
        database: process.env.PUSH_DATABASE,
        port: process.env.PUSH_PORT
    });
    connection.connect(function(err) {
        if (err) throw err;
        return null;
    });
    return connection;
};


module.exports.closeConnection = function(connection) {
    connection.end(function(err) {
        if (err) throw err;
    });
};

module.exports.controlDatabaseAriagro = function() {
    if (!process.env.ARIAGRODATABASE || process.env.ARIAGRODATABASE == "") {
        return false;
    } else {
        return true;
    }
}



module.exports.controlDatabaseTelefonia = function() {
    if (!process.env.TELEFONIA_DATABASE || process.env.TELEFONIA_DATABASE == "") {
        return false;
    } else {
        return true;
    }
}

module.exports.controlDatabaseTienda = function() {
    if (!process.env.TIENDA_DATABASE || process.env.TIENDA_DATABASE == "") {
        return false;
    } else {
        return true;
    }
}

module.exports.controlDatabaseAceite = function() {
    if (!process.env.ACEITE_DATABASE || process.env.ACEITE_DATABASE == "") {
        return false;
    } else {
        return true;
    }
}

module.exports.controlDatabaseTratamientos = function() {
    if (!process.env.TRATAMIENTOS_DATABASE || process.env.TRATAMIENTOS_DATABASE == "") {
        return false;
    } else {
        return true;
    }
}




}
 */



module.exports.getConnectionPush = function() {
    var connection = mysql1.createConnection({
        host: process.env.PUSH_SERVER,
        user: process.env.PUSH_USER,
        password: process.env.PUSH_PASSWORD,
        database: process.env.PUSH_DATABASE,
        port: process.env.PUSH_PORT
    });
    connection.connect(function(err) {
        if (err) throw err;
        return null;
    });
    return connection;
};

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
            conn = await mysql2.createConnection(cfg)
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
    },

    usuarios: async(empresaId) => {
        let conn = undefined
        try {
            let cfg = await conectorMysql.base()
            conn = await mysql2.createConnection(cfg)
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
                database: empresa.mysqlBaseDatosUsuarios,
                decimalNumbers: true,
                timezone: "UTC"
            }
            return configuracion
        } catch (error) {
            if (conn) await conn.end()  
            throw(error)
        }
    },
    push: async(empresaId) => {
        let conn = undefined
        try {
            let cfg = await conectorMysql.base()
            conn = await mysql2.createConnection(cfg)
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
                database: empresa.mysqlBaseDatosPush,
                decimalNumbers: true,
                timezone: "UTC"
            }
            return configuracion
        } catch (error) {
            if (conn) await conn.end()  
            throw(error)
        }
    },
    getConnectionPush: function() {
        var connection = mysql1.createConnection({
            host: process.env.PUSH_SERVER,
            user: process.env.PUSH_USER,
            password: process.env.PUSH_PASSWORD,
            database: process.env.PUSH_DATABASE,
            port: process.env.PUSH_PORT
        });
        connection.connect(function(err) {
            if (err) throw err;
            return null;
        });
        return connection;
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
controlDatabaseCuotas: function() {
    if (!process.env.CUOTAS_DATABASE || process.env.CUOTAS_DATABASE == "") {
        return false;
    } else {
        return true;
    }
}


}

module.exports = conectorMysql