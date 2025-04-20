import express from 'express';
import connection from '../config/database.js';

const router = express.Router();

// router.get('/', (req, res) => {
//     res.render('order_history');
// });

router.get('/history', async (req, res) => {
    let username = req.cookies.userid;

    if (!username) {
        username = 'Guest';
    }

    try {
        const [orders] = await connection.promise().query(
            `SELECT id, products, total, status, txn_id, create_at FROM orders WHERE username = ? ORDER BY create_at DESC`,
            [username]
        );

        const productDetails = [];
        orders.forEach(order => {
            const products = order.products.split(',');
            products.forEach(product => {
                const [pid, quantity, price] = product.split(':');
                productDetails.push({ orderId: order.id, pid, quantity, price });
            });
        });

        const productIds = productDetails.map(item => item.pid);
        const [productInfo] = await connection.promise().query(
            `SELECT pid, name, description, image FROM products WHERE pid IN (?)`,
            [productIds]
        );

        const productMap = productInfo.reduce((map, product) => {
            map[product.pid] = product;
            return map;
        }, {});

        orders.forEach(order => {
            const products = order.products.split(',').map(product => {
                const [pid, quantity, price] = product.split(':');
                const productDetail = productMap[pid];
                return {
                    name: productDetail.name,
                    description: productDetail.description,
                    image: productDetail.image,
                    quantity,
                    price,
                };
            });
            order.items = products;
        });

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;