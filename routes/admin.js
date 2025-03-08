var express = require('express');
var path = require('path');
var router = express.Router();
const connection = require('../config/database');
const multer = require('multer');
const upload = multer({ dest: 'public/images/' });

router.get('/', function (req, res, next) {
	res.sendFile(path.join(__dirname, '../public/admin.html'));
});

router.get('/tables', function (req, res, next) {
	connection.query('SHOW TABLES', function (err, rows, fields) {
		if (err) throw err;
		console.log(rows);
		res.json(rows);
	});
});

router.get('/categories', function (req, res, next) {
	connection.query('SELECT * from categories', function (err, rows, fields) {
		if (err) throw err;
		console.log(rows);
		res.json(rows);
	});
});

router.get('/products', function (req, res, next) {
	connection.query('SELECT * from products', function (err, rows, fields) {
		if (err) throw err;
		console.log(rows);
		res.json(rows);
	});
});

// UPDATE products
router.put('/products', upload.single('image'), function (req, res, next) {
	const { pid, catid, name, price, description } = req.body;
	const image = req.file ? req.file.filename : null;
	const query = 'UPDATE products SET catid = ?, name = ?, price = ?, description = ?, image = ? WHERE pid = ?';
	const params = [catid, name, price, description, image, pid];
	connection.query(query, params, function (err, rows, fields) {
		if (err) throw err;
		console.log(rows);
		res.json(rows);
	});
});


// UPDATE categories
router.put('/categories', function (req, res, next) {
	const { catid, name } = req.body;
	connection.query('UPDATE categories SET name = ? WHERE catid = ?', [name, catid], function (err, rows, fields) {
		if (err) throw err;
		console.log(rows);
		res.json(rows);
	});
});


// DELETE products
router.delete('/products/:pid', function (req, res, next) {
	const pid = req.params.pid;
	connection.query('DELETE FROM products WHERE pid = ?', [pid], function (err, rows, fields) {
		if (err) throw err;
		console.log(rows);
		res.json(rows);
	});
});


// DELETE categories
router.delete('/categories/:catid', function (req, res, next) {
	const catid = req.params.catid;
	connection.query('DELETE FROM categories WHERE catid = ?', [catid], function (err, rows, fields) {
		if (err) throw err;
		console.log(rows);
		res.json(rows);
	});
});


// ADD products
router.post('/products', upload.single('image'), function (req, res, next) {
	console.log(req.file);
	const { catid, name, price, description } = req.body;
	const image = req.file ? req.file.filename : null;
	console.log(image);
	const query = 'INSERT INTO products (catid, name, price, description, image) VALUES (?, ?, ?, ?, ?)';
	const params = [catid, name, price, description, image];
	connection.query(query, params, function (err, rows, fields) {
		if (err) throw err;
		console.log(rows);
		res.json(rows);
	});
});


// ADD categories
router.post('/categories', function (req, res, next) {
	const { name } = req.body;
	connection.query('INSERT INTO categories (name) VALUES (?)', [name], function (err, rows, fields) {
		if (err) throw err;
		console.log(rows);
		res.json(rows);
	});
});

module.exports = router;
