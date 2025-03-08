import { product } from "./product.js";
import { breadcrumb } from "./breadcrumb.js";

class Category {
    constructor() {
        this.sidebar = document.querySelector(".sidebar");
        this.menuButton = document.querySelector(".menu_button");
        this.categoryItems = document.querySelector('.sidebar .items');

        this.bindEvent()
    }

    bindEvent() {
        this.menuButton.addEventListener("click", (e) => {
            this.showCategoryList();
        });

        document.addEventListener("click", (e) => {
            if (!this.sidebar.contains(e.target) && !this.menuButton.contains(e.target)) {
                this.closeCategoryList()
            }
        });
    }

    async fetchCategory() {
        try {
            const response = await fetch('/categories/get_category');
            const data = await response.json();
            return data;
        } catch(err) {
            console.error(err)
        }
    }

    async fetchCategories() {
        try {
            const response = await fetch('/categories/get_categories');
            const data = await response.json();
            return data;
        } catch(err) {
            console.error(err)
        }
    }

    async renderCategoryList(categories) {
        this.categoryItems.innerHTML = '';
        categories.forEach(category => {
            const categoryItem = document.createElement('li');
            categoryItem.className = 'category_item';
            categoryItem.textContent = category.name;
            categoryItem.addEventListener('click', async (e) => {
                breadcrumb.initBreadcrumb();
                breadcrumb.enter(e.target.textContent);
                const products = await product.fetchProductsByCatId(category.catid);
                product.renderProductList(products);
                this.closeCategoryList();
            });

            this.categoryItems.appendChild(categoryItem);
        });
    }

    showCategoryList() {
        this.sidebar.classList.toggle("active");
        product.mainContainer.classList.toggle("dimmed");
    }

    closeCategoryList() {
        this.sidebar.classList.remove("active");
        product.mainContainer.classList.remove("dimmed");
    }
}

export var category = new Category