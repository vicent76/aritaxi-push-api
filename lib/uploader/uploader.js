// Se encarga de los mensajes para carga de FICHEROS
//
// manejo de ficheros
const fs = require('fs').promises;
var formidable = require('formidable');
//var cfg = require('../../config/config.json');




function isFormData(req) {
    var type = req.headers['content-type'] || '';
    return 0 == type.indexOf('multipart/form-data');
}

module.exports.uploadTerminalFile = async (req) => {
        try {
            if (!isFormData(req)) {
                res.statusCode = 404;
                throw new Error('Petición incorrecta: se esperaba multipart/form-data');
            }
    
            var form = new formidable.IncomingForm();
            const [fields, files] = await new Promise((resolve, reject) => {
                form.parse(req, function(err, fields, files) {
                  if (err) reject(err);
                  resolve([fields, files]);
                });
              });
            let result = await fs.readFile(files.file.path);
            const oldPath = files.file.path;
            const newPath = process.env.FICHEROS + files.file.name;
            let resut2 = await fs.rename(oldPath, newPath);
            return 'Archivo subido correctamente';
            
        } catch (e) {
            if(e) throw new Error(e);
        }
}