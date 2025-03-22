var express = require('express');
var router = express.Router();
var path = require('path');
const connection = require('../config/database');
const config = require('../config/config');

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index');
});

function hmacPassword(password) {
	const hmac = require('crypto').createHmac('sha256', config.salt);
	hmac.update(password);
	return hmac.digest('base64');
}

router.post('/login', function (req, res, next) {
	const { email, password } = req.body;
	hashedPassword = hmacPassword(password);
	const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
	connection.query(query, [email, hashedPassword], function (err, results) {
		if (err) throw err;
		if (results.length > 0) {
			result = results[0];
			result.success = true;
			res.cookie('userid', result.userid, { httpOnly: true , secure: true, maxAge: 1000 * 60 * 60 * 24 * 3 });
			res.json(result);
		} else {
			res.json({ success: false });
		}
	});
});

router.get('/check_login', (req, res, next) => {
	const userId = req.cookies.userid;
	if (userId) {
        res.json({ userid: userId });
    } else {
        res.json({ userid: "" });
    }
});

router.post('/change_password', (req, res, next) => {
	const { email, oldPassword, newPassword } = req.body;
	const hashedOldPassword = hmacPassword(oldPassword);
	const hashedNewPassword = hmacPassword(newPassword);
	const query = 'UPDATE users SET password = ? WHERE email = ? AND password = ?';
	connection.query(query, [hashedNewPassword, email, hashedOldPassword], function (err, results) {
		if (err) throw err;
		if (results.affectedRows > 0) {
			res.clearCookie('userid');
			res.json({ success: true });
		} else {
			res.json({ success: false });
		}
	});
});

router.get('/logout', (req, res, next) => {
	res.clearCookie('userid');
	res.json({ success: true });
});


// GET all products
router.get('/get_products', function (req, res, next) {
	res.locals.name="hello world";
	const query = 'SELECT * FROM products';
	connection.query(query, function (err, results) {
		if (err) throw err;
		// console.log(results);
		res.json(results);
	});
});

module.exports = router;
