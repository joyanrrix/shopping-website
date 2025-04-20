import createError from 'http-errors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import csurf from 'csurf';
import session from 'express-session';
import logger from 'morgan';
import helmet from 'helmet';

import indexRouter from './routes/index.js';
import adminRouter from './routes/admin.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import checkoutRouter from './routes/checkout.js';
import ordersRouter from './routes/orders.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('view cache', false);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "fonts.googleapis.com", 'cdnjs.cloudflare.com', 'https://*.paypalobjects.com', "'unsafe-inline'"],
        scriptSrc: ["'self'", 'cdnjs.cloudflare.com', 'https://*.paypal.com', 'https://*.paypalobjects.com', "'unsafe-inline'"],
        fontSrc: ["'self'", 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com', 'https://*.paypalobjects.com'],
        imgSrc: ["'self'", "data:", 'https://*.paypalobjects.com', 'https://*.paypal.com'],
        connectSrc: ["'self'", 'https://*.paypal.com'],
        frameSrc: ["'self'", 'https://*.paypal.com'],
    }
}));

var csrfProtection = csurf({ cookie: true });
app.use(csrfProtection);
app.use(function (req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/products', productsRouter);
app.use('/categories', categoriesRouter);
app.use('/admin', adminRouter);
app.use('/checkout', checkoutRouter);
app.use('/orders', ordersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

export default app;