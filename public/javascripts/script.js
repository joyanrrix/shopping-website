import { product } from './product.js';
import { category } from './category.js';
import { breadcrumb } from './breadcrumb.js';
import { user } from './user.js';
import { shoppingCart } from './cart.js';
import { Utils } from './utils.js';
import { order } from './order.js';

document.addEventListener("DOMContentLoaded", function () {
    function setUser() {
        document.querySelector(".close_modal").addEventListener('click', () => {
            document.querySelector(".modal").style.display = "none";
        });
        user.checkLogin();
    }
    setUser();

    async function setDefaultProductList() {
        breadcrumb.initBreadcrumb();
        const products = await product.fetchProducts();
        product.renderProductList(products)
    }
    setDefaultProductList();


    async function renderSidebar() {
        const categories = await category.fetchCategories();
        category.renderSidebar(categories)
    }
    renderSidebar()

    shoppingCart.loadFromStorage();

    document.querySelector(".order_history").addEventListener("click", async () => {
        const orderData = await order.getOrderHistory();
        order.renderOrderHistory(orderData);
        breadcrumb.renderClickableHome();
    });
});