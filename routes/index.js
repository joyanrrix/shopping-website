import express from 'express';
import connection from '../config/database.js';
import { salt, PAYPAL_CLIENT_ID } from '../config/config.js';
import crypto from 'crypto';

const router = express.Router();

router.get('/', (req, res, next) => {
    res.render('index', { user: true, PAYPAL_CLIENT_ID: PAYPAL_CLIENT_ID });
});

function hmacPassword(password) {
    const hmac = crypto.createHmac('sha256', salt);
    hmac.update(password);
    return hmac.digest('base64');
}

router.post('/login', (req, res, next) => {
    const { email, password } = req.body;
    const hashedPassword = hmacPassword(password);
    console.log(hashedPassword);
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    connection.query(query, [email, hashedPassword], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            const result = results[0];
            result.success = true;
            res.cookie('userid', result.userid, { httpOnly: true, secure: true, maxAge: 1000 * 60 * 60 * 24 * 3 });
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
    connection.query(query, [hashedNewPassword, email, hashedOldPassword], (err, results) => {
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
router.get('/get_products', (req, res, next) => {
    res.locals.name = "hello world";
    const query = 'SELECT * FROM products';
    connection.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

export default router;
