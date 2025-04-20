import express from 'express';
import connection from '../config/database.js';

const router = express.Router();

router.get('/get_products', (req, res, next) => {
    const query = 'SELECT * FROM products';
    connection.query(query, (err, results) => {
        if (err) throw err;
        console.log(results);
        res.json(results);
    });
});

router.get('/get_product_by_id', (req, res, next) => {
    const pid = req.query.pid;
    const query = 'SELECT * FROM products WHERE pid = ?';
    connection.query(query, [pid], (err, results) => {
        if (err) throw err;
        console.log(results);
        res.json(results[0]);
    });
});

router.get('/get_products_by_catid', (req, res, next) => {
    const catid = req.query.catid;
    const query = 'SELECT * FROM products WHERE catid = ?';
    connection.query(query, [catid], (err, results) => {
        if (err) throw err;
        console.log(results);
        res.json(results);
    });
});

export default router;