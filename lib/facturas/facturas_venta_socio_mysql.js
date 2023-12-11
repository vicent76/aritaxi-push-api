var mysql2 = require('mysql2/promise');
var connector = require('../comun/conector_mysql');
//var config = require('../../config/mysql_config.json');
//var cfg = require('../../config/config.json');
var Stimulsoft = require('stimulsoft-reports-js');
var fs = require("fs");
var moment = require('moment');



module.exports.getFacturasVentaSocio = async (codclien, year, empresaId) => {
    var facturas = [];
    let connection = null;
    var sql = "";
    try {
                            
  

    sql = "SELECT";
    sql += " f.codtipom AS codtipom,";
    sql += " f.numfactu AS numfactu,";
    sql += " f.fecfactu AS fecfactu,";
    sql += " st.letraser AS letraser,";
    sql += " (COALESCE(f.baseimp1,0) + COALESCE(f.baseimp2,0) + COALESCE(f.baseimp3,0)) AS bases,";
    sql += " (COALESCE(f.imporiv1,0) + COALESCE(f.imporiv2,0) + COALESCE(f.imporiv3,0)";
    sql += " + COALESCE(f.imporiv1re,0) + COALESCE(f.imporiv2re,0) + COALESCE(f.imporiv3re,0)) AS cuotas,";
    sql += " f.totalfac AS totalfac,";
    sql += " lf.codtipoa AS codtipoa,";
    sql += " lf.numalbar AS numalbar,"
    sql += " lf.numlinea AS numlinea,";
    sql += " lf.codartic AS codartic,";
    sql += " lf.nomartic AS nomartic,";
    sql += " lf.precioar AS precioar,";
    sql += " lf.cantidad AS cantidad,";
    sql += " lf.dtoline1 AS dtoline1,";
    sql += " lf.dtoline2 AS dtoline2,";
    sql += " lf.importel AS importel";
    sql += " FROM scafac AS f";
    sql += " LEFT JOIN slifac AS lf ON (lf.codtipom = f.codtipom AND lf.numfactu = f.numfactu AND lf.fecfactu = f.fecfactu)";
    sql += " LEFT JOIN stipom AS st ON st.codtipom = f.codtipom"
    sql += " WHERE f.codclien = ? AND YEAR(f.fecfactu) = ?";
    // como hay gente que tiene la telefonía y la cuotas en la misma base de datos lo que hacemos es
    // buscar las específicas de tipo si nos las han puesto.
    var array = [];
    if(process.env.VENTA_SOCIO_TIPO_FAC){
        array = JSON.parse(process.env.VENTA_SOCIO_TIPO_FAC);//convertimos el objeto en json
    }
    
    if (process.env.VENTA_SOCIO_TIPO_FAC && array.length > 0){
        sql += " AND f.codtipom IN (" + connector.sqlInString(array) + ")";
    }
    sql += " ORDER BY f.fecfactu DESC, f.codtipom, f.numfactu, lf.codtipoa, lf.numalbar, lf.numlinea;";
    sql = mysql2.format(sql, [codclien, year]);

    let cfg = await connector.empresa(empresaId);
    connection = await mysql2.createConnection(cfg);
    const [result] = await connection.query(sql);
    await connection.end()
    if(result) {
        const r  = fnFacturasFromDbToJson(result);
       return r;
    } else {
        return facturas;
    }

    } catch (error) {
		if (connection) {
			await connection.end()
		}
		throw (error)
	}    
};


var fnFacturasFromDbToJson = function(facturas) {
    var fcJs = [];
    var cabJs = null;
    var linJs = null;
    var numfacAnt = 0;
    var tipomAnt = 0;
    for (var i = 0; i < facturas.length; i++) {
        var factura = facturas[i];
        if (numfacAnt != factura.numfactu || tipomAnt != factura.codtipom) {
            // es una factura nueva
            // si ya habiamos procesado una la pasamos al vector
            if (cabJs) {
                fcJs.push(cabJs);
            }
            cabJs = {
                codtipom: factura.codtipom,
                numfactu: factura.letraser + "-" + factura.numfactu,
                fecfactu: factura.fecfactu,
                bases: factura.bases,
                cuotas: factura.cuotas,
                totalfac: factura.totalfac,
                lineas: []
            };
            numfacAnt = factura.numfactu;
            tipomAnt = factura.codtipom;
        }
        // siempre se procesa una linea
        if (factura.numlinea) {
            linJs = {
                codtipoa: factura.codtipoa,
                numalbar: factura.numalbar,
                numlinea: factura.numlinea,
                codartic: factura.codartic,
                nomartic: factura.nomartic,
                precioar: factura.precioar,
                cantidad: factura.cantidad,
                dtoline1: factura.dtoline1,
                dtoline2: factura.dtoline2,
                importel: factura.importel
            };
            cabJs.lineas.push(linJs);
        }
    }
    if (cabJs) {
        fcJs.push(cabJs);
    }
    return fcJs;
}
