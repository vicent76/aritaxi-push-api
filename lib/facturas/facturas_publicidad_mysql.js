var mysql2 = require('mysql2/promise');
var connector = require('../comun/conector_mysql');
//var config = require('../../config/mysql_config.json');
//var cfg = require('../../config/config.json');
var Stimulsoft = require('stimulsoft-reports-js');
var fs = require("fs");
var moment = require('moment');




module.exports.getFacturasPublicidad = async (codclien, year, empresaId) => {
    var facturas = [];
    let connection = null;
    var sql = "";
    try {
                            
  

    sql = "SELECT";
    sql += " f.codtipom AS codtipom,";
    sql += " f.numfactu AS numfactu,";
    sql += " f.fecfactu AS fecfactu,";
    sql += " f.codsocio AS codsocio,"
    sql += " f.concepto AS concepto,";
    sql += " f.importel AS importe,";
    sql += " 1 AS numlinea,";
    sql += " st.letraser AS letraser,";
    sql += " f.baseiva1 AS bases,";
    sql += " f.impoiva1 AS cuotas,";
    sql += " f.impreten as retenciones,";
    sql += " f.totalfac as totalfac";
    sql += " FROM sfactusoc AS f";
    sql += " LEFT JOIN stipom AS st ON st.codtipom = f.codtipom"
    sql += " WHERE f.codsocio = ? AND YEAR(f.fecfactu) = ?";
   




    var array = [];
    if(process.env.PUBLICIDAD_TIPO_FACT){
        array = JSON.parse(process.env.PUBLICIDAD_TIPO_FACT);//convertimos el objeto en json
    }
    
    if (process.env.PUBLICIDAD_TIPO_FACT && array.length > 0){
        sql += " AND f.codtipom IN (" + connector.sqlInString(array) + ")";
    }
    sql += " ORDER BY f.fecfactu DESC, f.codtipom, f.numfactu;";
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
                letraser: factura.letraser,
                numfactu: factura.letraser + "-" + factura.numfactu,
                fecfactu: factura.fecfactu,
                bases: factura.bases,
                cuotas: factura.cuotas,
                retenciones: factura.retenciones,
                totalfac: factura.totalfac,
                lineas: []
            };
            numfacAnt = factura.numfactu;
            tipomAnt = factura.codtipom;
        }
        // siempre se procesa una linea
        if (factura.numlinea) {
            linJs = {
                concepto: factura.concepto 
            };
            cabJs.lineas.push(linJs);
        }
    }
    if (cabJs) {
        fcJs.push(cabJs);
    }
    return fcJs;
}


var fnFacturasFromDbToJsonNoAlizcoop = function(facturas) {
    var fcJs = [];
    var cabJs = null;
    var linJs = null;
    var partJs = [];
    var numfacAnt = 0;
    var tipomAnt = 0;
    var antNumPart = 0;
    for (var i = 0; i < facturas.length; i++) {
        var factura = facturas[i];
        if (numfacAnt != factura.numfactu ||  tipomAnt != factura.codtipom) {
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
                partes: []
            };
            numfacAnt = factura.numfactu;
            tipomAnt = factura.codtipom;
            }
             // se procesan los partes
            if (antNumPart != factura.numparte) {
                partJs = {
                    numparte: factura.numparte,
                    fechapar: factura.fechapar,
                    codtrata: factura.codtrata,
                    nomtrata: factura.nomtrata,
                    codcampo: factura.codcampo,
                    nomparti: factura.nomparti,
                    codvarie: factura.codvarie,
                    nomvarie: factura.nomvarie,
                    lineas: []

                };
                cabJs.partes.push(partJs);
                antNumPart = factura.numparte;
            
            }
            // siempre se procesa una linea
            if (factura.codartic) {
                linJs = {
                    codartic: factura.codartic,
                    nomartic: factura.nomartic,
                    precioar: factura.precioar,
                    cantidad: factura.cantidad,
                    importel: factura.importel

                };
                partJs.lineas.push(linJs);
            }
            
    }
    
    if (cabJs) {
        fcJs.push(cabJs);
    }
    return fcJs;
}
