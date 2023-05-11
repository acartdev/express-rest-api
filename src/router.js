const router = require('express').Router()
const generate = require('../src/controller/generate')
router.get("/", (req, res) => {
    const json = JSON.parse('{"test":"Hello World"}');
    res.send(json);
});

//generate
router.post('/generate', generate.generateTable);


module.exports = router