import { ShoppingCart } from './cart.js';
import { breadcrumb } from './breadcrumb.js';

var shoppingCart = new ShoppingCart();

class Product {
    constructor() {
        this.mainContainer = document.querySelector(".main_container");
    }

    async fetchProducts() {
        try {
            const response = await fetch('/products/get_products');
            const data = response.json()
            return data
        } catch(err) {
            console.error(err);
        }
    }

    async fetchProductsByCatId(catid) {
        try {
            const response = await fetch(`/products/get_products_by_catid?catid=${catid}`);
            const data = await response.json();
            return data;
        } catch(err) {
            console.error(err);
        }
    }

    renderProductList(products) {
        const productList = document.querySelector('.product_list');
        productList.innerHTML = "";
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.className = 'product';

            const productImage = document.createElement('img');
            productImage.src = `./images/${product.image}`;
            productImage.className = 'product_image';

            const productTitle = document.createElement('span');
            productTitle.className = 'product_title';
            productTitle.innerText = product.name;

            const productPrice = document.createElement('div');
            productPrice.className = 'product_price';
            productPrice.innerText = `$${product.price}`;

            const addToCartButton = document.createElement('button');
            addToCartButton.className = 'add_to_cart_button';
            addToCartButton.innerHTML = '<i class="fa-solid fa-cart-shopping"></i>';
            addToCartButton.addEventListener('click', function (e) {
                e.stopPropagation();
                shoppingCart.addToCart(product);
            });

            productPrice.appendChild(addToCartButton);
            productDiv.appendChild(productImage);
            productDiv.appendChild(productTitle);
            productDiv.appendChild(productPrice);

            productDiv.addEventListener('click', function () {
                const title = product.name;
                const price = `$${product.price}`;
                const description = product.description;

                breadcrumb.enter(title)

                productList.innerHTML = "";

                const productDiv = document.createElement('div');
                productDiv.className = 'main_product';

                const productImage = document.createElement('img');
                productImage.src = `./images/${product.image}`;
                productImage.style.width = '400px';
                productImage.style.height = 'auto';
                productImage.className = 'product_image';

                const productDetails = document.createElement('div');
                productDetails.className = 'product_details';

                const productTitle = document.createElement('h1');
                productTitle.className = 'product_title';
                productTitle.innerText = product.name;

                const productDescription = document.createElement('p');
                productDescription.className = 'product_description';
                productDescription.innerText = product.description;

                const productPrice = document.createElement('p');
                productPrice.className = 'product_price';
                productPrice.innerText = `$${product.price}`;

                const addToCartButton = document.createElement('button');
                addToCartButton.className = 'add_to_cart_button';
                addToCartButton.innerText = 'Add to cart';
                addToCartButton.addEventListener('click', function (e) {
                    e.stopPropagation();
                    shoppingCart.addToCart(product);
                });

                productDiv.appendChild(productImage);
                productDetails.appendChild(productTitle);
                productDetails.appendChild(productDescription);
                productDetails.appendChild(productPrice);
                productDetails.appendChild(addToCartButton);
                productList.appendChild(productDiv);
                productList.appendChild(productDetails);
            });

            productList.appendChild(productDiv);
        });
    }
}

export var product = new Product();