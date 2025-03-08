var express = require('express');
var router = express.Router();
const connection = require('../config/database');

router.get('/get_products', function(req, res, next) {
    const query = 'SELECT * FROM products';
    connection.query(query, function(err, results) {
        if (err) throw err;
        console.log(results);
        res.json(results);
    });
});

router.get('/get_product_by_id', function(req, res, next) {
    const pid = req.query.pid;
    const query = 'SELECT * FROM products WHERE pid = ?';
    connection.query(query, [pid], function(err, results) {
        if (err) throw err;
        console.log(results);
        res.json(results[0]);
    });
});

router.get('/get_products_by_catid', function(req, res, next) {
    const pid = req.query.catid;
    const query = 'SELECT * FROM products WHERE catid = ?';
    connection.query(query, [pid], function(err, results) {
        if (err) throw err;
        console.log(results);
        res.json(results);
    });
});

module.exports = router;