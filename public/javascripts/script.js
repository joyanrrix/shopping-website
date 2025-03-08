import { ShoppingCart } from './cart.js';
import { product } from './product.js';
import { category } from './category.js';
import { breadcrumb } from './breadcrumb.js';

document.addEventListener("DOMContentLoaded", function () {

    async function setDefaultProductList() {
        breadcrumb.initBreadcrumb();
        const products = await product.fetchProducts();
        product.renderProductList(products)
    }
    setDefaultProductList();


    async function renderCategoryList() {
        const categories = await category.fetchCategories();
        category.renderCategoryList(categories)
    }
    renderCategoryList()
});