import express from 'express';
import connection from '../config/database.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'public/images/' });

router.get('/', function (req, res, next) {
	if (req.cookies != undefined && req.cookies.userid == 1) {
		res.render('admin', { user: false });
	} else {
		res.redirect('error');
	}
});

router.get('/get_tables', function (req, res, next) {
	connection.query('SHOW TABLES', function (err, rows, fields) {
		if (err) throw err;
		console.log(rows);
		res.json(rows);
	});
});

router.get('/get_table_items', function (req, res, next) {
	const table = req.query.table;
	const query = 'SELECT * FROM ??';
	connection.query(query, [table], function (err, rows, fields) {
		if (err) throw err;
		console.log(rows);
		res.json(rows);
	});
});

router.post('/update_table', upload.single('image'), (req, res, next) => {
	const table = req.query.table;

	const primaryKey = Object.keys(req.body)[0] // 动态获取主键字段

	const updates = [];
    const params = [];

	Object.entries(req.body).forEach(([key, value]) => {
        if (key !== primaryKey) {
            updates.push(`${key} = ?`);
            params.push(value);
        }
    });

	if (req.file) {
		updates.push('image = ?');
		params.push(req.file.filename);
	}

	params.push(primaryKey);
	params.push(req.body[primaryKey]);

    const query = `UPDATE ?? SET ${updates.join(', ')} WHERE ?? = ?`;
    const queryParams = [table, ...params];

	connection.query(query, queryParams, function (err, rows, fields) {
		if (err) throw err;
		console.log(rows);
		res.json(rows);
	});
});

router.post('/delete_item', (req, res, next) => {
	const table = req.query.table;

	const key = Object.keys(req.body)[0];
    const value = req.body[key];

	const query = `DELETE FROM ?? WHERE ?? = ?`;
	const params = [table, key, value];

	connection.query(query, params, function (err, rows, fields) {
		if (err) throw err;
		console.log(rows);
		res.json(rows);
	});
});

router.post('/add_item', upload.single('image'), (req, res, next) => {
	const table = req.query.table;

	const columns = [];
	const values = [];
	const placeholders = [];

	Object.entries(req.body).forEach(([key, value]) => {
		columns.push(key);
		values.push(value);
		placeholders.push('?');
	});

	if (req.file) {
        columns.push('image');
        values.push(req.file.filename);
        placeholders.push('?');
    }

	const query = `INSERT INTO ?? (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
	const params = [table, ...values];

	connection.query(query, params, function (err, rows, fields) {
		if (err) throw err;
		console.log(rows);
		res.json(rows);
	});
});

export default router;