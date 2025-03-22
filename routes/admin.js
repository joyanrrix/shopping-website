var express = require('express');
var path = require('path');
var router = express.Router();
const connection = require('../config/database');
const multer = require('multer');
const { user } = require('../public/javascripts/user');
const upload = multer({ dest: 'public/images/' });

router.get('/', function (req, res, next) {
	// res.sendFile(path.join(__dirname, '../public/admin.html'));
	res.render('admin');
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

router.get('/users', (req, res, next) => {
	connection.query('SELECT * from users', function (err, rows, fields) {
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
	const query = 'UPDATE categories SET name = ? WHERE catid = ?';
	const params = [name, catid];
	connection.query(query, params, function (err, rows, fields) {
		if (err) throw err;
		console.log(rows);
		res.json(rows);
	});
});

router.put('/users', (req, res, next) => {
	const { userid, email, password, isAdmin } = req.body;
	console.log(req.body);
	const query = 'UPDATE users SET email = ?, password = ?, isAdmin = ? WHERE userid = ?';
	connection.query(query, [email, password, isAdmin, userid], function (err, rows, fields) {
		if (err) throw err;
		console.log(rows);
		res.json(rows);
	});
});


// DELETE products
router.delete('/products/:pid', function (req, res, next) {
	const pid = req.params.pid;
	const query = 'DELETE FROM products WHERE pid = ?';
	const params = [pid];
	connection.query(query, params, function (err, rows, fields) {
		if (err) throw err;
		console.log(rows);
		res.json(rows);
	});
});


// DELETE categories
router.delete('/categories/:catid', function (req, res, next) {
	const catid = req.params.catid;
	const query = 'DELETE FROM categories WHERE catid = ?';
	const params = [catid];
	connection.query(query, params, function (err, rows, fields) {
		if (err) throw err;
		console.log(rows);
		res.json(rows);
	});
});

router.delete('/users/:userid', (req, res, next) => {
	const userid = req.params.userid;
	const query = 'DELETE FROM users WHERE userid = ?';
	const params = [userid];
	connection.query(query, params, function (err, rows, fields) {
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
	const query = 'INSERT INTO categories (name) VALUES (?)';
	const params = [name];
	connection.query(query, params, function (err, rows, fields) {
		if (err) throw err;
		console.log(rows);
		res.json(rows);
	});
});

router

module.exports = router;
