import express from 'express';
import connection from '../config/database.js';
import {
    ApiError,
    CheckoutPaymentIntent,
    Client,
    Environment,
    LogLevel,
    OrdersController,
} from "@paypal/paypal-server-sdk";
import crypto from 'crypto';
import { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } from '../config/config.js';

const router = express.Router();

const client = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: PAYPAL_CLIENT_ID,
        oAuthClientSecret: PAYPAL_CLIENT_SECRET,
    },
    timeout: 0,
    environment: Environment.Sandbox,
    logging: {
        logLevel: LogLevel.Info,
        logRequest: {
            logBody: true,
        },
        logResponse: {
            logHeaders: true,
        },
    },
});

const ordersController = new OrdersController(client);

const createOrder = async (orderId, digest, orderData, total) => {
    const collect = {
        body: {
            intent: CheckoutPaymentIntent.Capture,
            purchaseUnits: [
                {
                    referenceId: orderId.toString(),
                    customId: digest,
                    amount: {
                        currencyCode: "HKD",
                        value: total.toString(),
                        breakdown: {
                            itemTotal: {
                                currencyCode: "HKD",
                                value: total.toString(),
                            },
                        },
                    },
                    items: orderData.map((item) => ({
                        id: item.pid,
                        name: item.name,
                        unitAmount: {
                            currencyCode: "HKD",
                            value: item.price.toString(),
                        },
                        quantity: item.quantity.toString(),
                    }))
                }
            ],
        },
        prefer: "return=minimal",
    };

    try {
        const { body, ...httpResponse } = await ordersController.createOrder(
            collect
        );
        // Get more response info...
        // const { statusCode, headers } = httpResponse;
        return {
            jsonResponse: JSON.parse(body),
            httpStatusCode: httpResponse.statusCode,
        };
    } catch (error) {
        if (error instanceof ApiError) {
            // const { statusCode, headers } = error;
            throw new Error(error.message);
        }
    }
};

const captureOrder = async (orderID) => {
    const collect = {
        id: orderID,
        prefer: "return=minimal",
    };

    try {
        const { body, ...httpResponse } = await ordersController.captureOrder(
            collect
        );
        // Get more response info...
        // const { statusCode, headers } = httpResponse;
        return {
            jsonResponse: JSON.parse(body),
            httpStatusCode: httpResponse.statusCode,
        };
    } catch (error) {
        if (error instanceof ApiError) {
            // const { statusCode, headers } = error;
            throw new Error(error.message);
        }
    }
};

const checkDigest = async (data) => {
    const orderId = data.reference_id;

    const captures = data.payments.captures[0];

    const returnDigest = captures.custom_id;
    const { currency_code, value } = captures.amount;

    console.log("Return Digest:", returnDigest);
    const [rows] = await connection.promise().query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (rows.length === 0) {
        console.error("Order not found");
        return false;
    }
    const order = rows[0];
    const digest = order.digest;
    console.log("Digest from DB:", digest);

    const digestString = [
        currency_code,
        order.email,
        order.salt,
        order.products,
        value,
    ].join(';');
    console.log("Digest String:", digestString);
    const calculatedDigest = crypto.createHash('sha256').update(digestString).digest('hex');
    console.log("Calculated Digest:", calculatedDigest);
    if (returnDigest === calculatedDigest && calculatedDigest === digest) {
        const txnId = captures.id;
        const query = 'UPDATE orders SET txn_id = ?, status = ? WHERE id = ?';
        const values = [txnId, 'PAIDED', orderId];
        await connection.promise().query(query, values);
        return true;
    }
    
    return false;
}

const getProductDetails = async (cart) => {
    const productDetails = [];
    for (const item of cart) {
        const pid = item.pid;
        const quantity = item.quantity;

        const query = 'SELECT * FROM products WHERE pid = ?';
        const [rows] = await connection.promise().query(query, [pid]);
        if (rows.length > 0) {
            const product = rows[0];
            productDetails.push({
                pid: product.pid,
                name: product.name,
                quantity: quantity,
                price: product.price
            });
        }
    }
    return productDetails;
}

const getUserName = async (id) => {
    if (!id) return 'Guest';
    const query = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await connection.promise().query(query, [id]);
    if (rows.length > 0) {
        const user = rows[0];
        return user.username;
    }
}

const saveOrderToDB = async (req, digestString, digest) => {
    let username = req.cookies.userid;

    if (!username) {
        username = 'Guest';
    }

    const [currency, email, salt, products, total] = digestString.split(';');

    const query = 'INSERT INTO orders (username, digest, currency, email, salt, products, total) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [username, digest, currency, email, salt, products, total];

    const [result] = await connection.promise().query(query, values);

    return result.insertId;
}

router.get('/', (req, res, next) => {
    res.render('checkout', { PAYPAL_CLIENT_ID: PAYPAL_CLIENT_ID });
});

router.post("/create_order", async (req, res) => {
    try {
        // use the cart information passed from the front-end to calculate the order amount detals
        const cart = req.body;

        const salt = crypto.randomBytes(16).toString('hex');
        const orderData = await getProductDetails(cart);
        const total = orderData.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

        const digestArray = [
            'HKD',
            'sb-pg8hf40294384@business.example.com',
            salt,
            orderData.map(item => `${item.pid}:${item.quantity}:${item.price}`).join(','),
            total,
        ];
        const digestString = digestArray.join(';');
        console.log(digestString);

        const digest = crypto.createHash('sha256').update(digestString).digest('hex');
        const orderId = await saveOrderToDB(req, digestString, digest);

        const { jsonResponse, httpStatusCode } = await createOrder(orderId, digest, orderData, total);

        res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
        console.error("Failed to create order:", error);
        res.status(500).json({ error: "Failed to create order." });
    }
});

router.post("/orders/:orderID/capture", async (req, res) => {
    try {
        const { orderID } = req.params;
        const { jsonResponse, httpStatusCode } = await captureOrder(orderID);

        if (!checkDigest(jsonResponse.purchase_units[0])) {
            throw new Error("Digest check failed");
        }

        res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
        console.error("Failed to create order:", error);
        res.status(500).json({ error: "Failed to capture order." });
    }
});

export default router;