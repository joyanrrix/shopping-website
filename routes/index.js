var express = require('express');
var router = express.Router();
var path = require('path');
const connection = require('../config/database');

/* GET home page. */
router.get('/', function (req, res, next) {
	res.sendFile(path.join(__dirname, '../public/index.html'));
});


// GET categories
// router.get('/get_categories', function (req, res, next) {
// 	const query = 'SELECT * FROM categories';
// 	connection.query(query, function (err, results) {
// 		if (err) throw err;
// 		console.log(results);
// 		res.json(results);
// 	});
// });


// GET all products
router.get('/get_products', function (req, res, next) {
	const query = 'SELECT * FROM products';
	connection.query(query, function (err, results) {
		if (err) throw err;
		// console.log(results);
		res.json(results);
	});
});

module.exports = router;
