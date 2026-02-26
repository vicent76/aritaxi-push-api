var mysql2 = require('mysql2/promise');
var connector = require('../comun/conector_mysql');
var fs = require("fs");
var moment = require('moment');



module.exports.getModelo347 = async (nif, year) => {
    var facturas = [];
    let connection = null;
    var sql = "";
    try {
        let sql = `
                SELECT ((MONTH(c.fecfactu)-1) DIV 3 )+1 trimestre ,SUM(COALESCE(baseimpo,0)) + SUM(COALESCE(impoiva,0)) + SUM(COALESCE(imporec,0)) tot, 'CLI' AS tipo         
                FROM factcli c ,factcli_totales t                
                WHERE  C.NUmSerie = T.NUmSerie AND c.numfactu  = t.numfactu AND c.fecfactu  = t.fecfactu AND c.anofactu = t.anofactu AND year(c.fecfactu)= ${year}               
                AND c.nifdatos = '${nif}'  
                GROUP BY 1

                UNION

                SELECT ((MONTH(f.fecharec)-1) DIV 3)+1  trimestre ,SUM(COALESCE(baseimpo,0)) + SUM(COALESCE(impoiva,0)) + SUM(COALESCE(imporec,0)) tot, 'PRO' AS tipo        
                FROM factpro f INNER JOIN factpro_totales t ON f.numserie=t.numserie AND f.anofactu=t.anofactu AND f.numregis =t.numregis   
                WHERE  year (f.fecharec) = ${year} and nifdatos='${nif}'  
                GROUP BY 1 
                ORDER BY trimestre`;
                
        let cfg = await connector.conta();
        connection = await mysql2.createConnection(cfg);
        const [result] = await connection.query(sql);
        await connection.end()
        if (result) {
            const r = fnFacturasFromDbToJson(result);
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


var fnFacturasFromDbToJson = function (facturas) {
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
                letraser: factura.letraser,
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
