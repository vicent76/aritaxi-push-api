var express = require('express');
var router = express.Router();
var uploader = require('./uploader');

//router.post('/',uploader.uploadTerminalFile(req));

router.post('/', async (req, res, next) => {
    try {
        let result = await uploader.uploadTerminalFile(req)
        res.json(result);
    } catch(error) {
        next(res.status(500).send(error.message));
    }
});



// -- exports
module.exports = router;