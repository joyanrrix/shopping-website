import express from 'express';
import connection from '../config/database.js';

const router = express.Router();

router.get('/get_categories', function(req, res, next) {
    const query = 'SELECT * FROM categories';
    connection.query(query, function(err, results) {
        if (err) throw err;
        console.log(results);
        res.json(results);
    });
});

export default router;