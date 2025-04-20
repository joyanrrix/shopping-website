import { product } from "./product.js";
import { breadcrumb } from "./breadcrumb.js";
import { Utils } from "./utils.js";
import { table } from "./table.js";

class Category {
    constructor() {
        this.sidebar = document.querySelector(".sidebar");
        this.sidebarItems = document.querySelector(".sidebar .items");
        this.menuButton = document.querySelector(".menu_button");
        this.overlay = document.querySelector('.overlay');
        this.hidenTimeout = null;

        this.bindEvent()
    }

    bindEvent() {
        this.menuButton.addEventListener("mouseenter", () => this.showSidebar());
        this.sidebar.addEventListener("mouseenter", () => this.showSidebar());

        this.menuButton.addEventListener("mouseleave", () => this.hideSidebarWithDelay());
        this.sidebar.addEventListener("mouseleave", () => this.hideSidebarWithDelay());
    }

    async fetchTables() {
        try {
            const response = await fetch('/admin/get_tables');
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

    async renderSidebar(items) {
        this.sidebarItems.innerHTML = '';
        if (Utils.isAdmin()) {
            this.addTablesToSidebar(items);
        } else {
            this.addCategoriesToSidebar(items);
        }
    }

    addTablesToSidebar(tables) {
        tables.forEach(item => {
            const tableItem = document.createElement('li');
            tableItem.className = 'category_item';
            tableItem.textContent = item.Tables_in_shop;
            tableItem.addEventListener('click', async (e) => {
                breadcrumb.initBreadcrumb(tableItem.textContent);
                table.renderTable(tableItem.textContent);
                this.hideSidebar();
            });

            this.sidebarItems.appendChild(tableItem);
        });
    }

    addCategoriesToSidebar(categories) {
        categories.forEach(category => {
            const categoryItem = document.createElement('li');
            categoryItem.className = 'category_item';
            categoryItem.textContent = category.name;
            categoryItem.addEventListener('click', async (e) => {
                breadcrumb.initBreadcrumb();
                breadcrumb.enter(e.target.textContent);

                const products = await product.fetchProductsByCatId(category.catid);
                product.renderProductList(products);
                this.hideSidebar();
            });

            this.sidebarItems.appendChild(categoryItem);
        });
    }
        

    showSidebar() {
        clearTimeout(this.hidenTimeout);
        this.sidebar.style.display = 'block';
        this.overlay.style.display = 'block';
    }

    hideSidebarWithDelay() {
        this.hidenTimeout = setTimeout(() => {
            this.sidebar.style.display = 'none';
            this.overlay.style.display = 'none';
        }, 300);
    }

    hideSidebar() {
        this.sidebar.style.display = 'none';
        this.overlay.style.display = 'none';
    }
}

export var category = new Category();