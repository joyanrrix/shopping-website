var express = require('express');
var router = express.Router();
const connection = require('../config/database');

router.get('/get_categories', function(req, res, next) {
    const query = 'SELECT * FROM categories';
    connection.query(query, function(err, results) {
        if (err) throw err;
        console.log(results);
        res.json(results);
    });
});

module.exports = router;