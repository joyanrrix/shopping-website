import { product } from "./product.js";

class Breadcrumb {
    constructor() {
        this.breadcrumb = document.querySelector(".breadcrumb");
        this.curPath = [];
    }

    initBreadcrumb() {
        this.curPath = ['Home'];
        this.updateBreadcrumb();
    }

    updateBreadcrumb() {
        this.breadcrumb.innerHTML = "";
        
        this.curPath.forEach((item, index) => {
            if (index == this.curPath.length - 1) {
                const path = document.createElement("span");
                path.className = "breadcrumb_title";
                path.textContent = item;
                this.breadcrumb.appendChild(path);
            } else {
                const path = document.createElement("a");
                path.href = "javascript:void(0)";
                path.id = "breadcrumb_back";
                path.textContent = item;
                path.addEventListener("click", (e) => {
                    this.back(e.target.textContent);
                });

                const angle = document.createElement("i");
                angle.className = "fa-solid fa-angle-right"

                this.breadcrumb.appendChild(path);
                this.breadcrumb.appendChild(angle);
            }
        })
    }

    enter(path) {
        this.curPath.push(path);
        this.updateBreadcrumb();
    }

    async back(path) {
        if (path == "Home") {
            this.initBreadcrumb();
            const products = await product.fetchProducts();
            product.renderProductList(products);
        } else {
            const categoryItems = document.querySelectorAll('.category_item');
            categoryItems.forEach((item) => {
                console.log(item);
                if (item.textContent == path) {
                    item.click();
                    return;
                }
            });
            
        }
    }

}

export var breadcrumb = new Breadcrumb();