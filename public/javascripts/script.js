import { ShoppingCart } from './cart.js';
import { product } from './product.js';
import { category } from './category.js';
import { breadcrumb } from './breadcrumb.js';
import { user } from './user.js';

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
    
    
    async function renderCategoryList() {
        const categories = await category.fetchCategories();
        category.renderCategoryList(categories)
    }
    renderCategoryList()
    
});