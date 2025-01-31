document.addEventListener("DOMContentLoaded", function() {
    const menuButton = document.querySelector(".menu_button");
    const sidebar = document.querySelector(".sidebar");
    const mainContainer = document.querySelector(".main_container");
    const categories = document.querySelectorAll(".category_item");
    const productList = document.querySelector(".product_list");
    const shoppingList = document.querySelector(".shopping-list");
    const breadcrumb = document.querySelector(".breadcrumb");
    const cartContainer = document.querySelector(".cart_container");
    const cartItems = document.querySelector(".cart_items");
    const checkoutButton = document.querySelector(".checkout_button");
    const cartCount = document.querySelector(".cart_count");

    var cart = [];
    var curPath = ["Home"];
    
    const products = {
        "Home": [
            { title: "Home1", price: "999.99", img: "assets/img/home.jpg", detail: "This is Home1"},
            { title: "Home2", price: "999.99", img: "assets/img/home.jpg", detail: "This is Home2"},
            { title: "Home3", price: "999.99", img: "assets/img/home.jpg", detail: "This is Home3"},
            { title: "Home4", price: "999.99", img: "assets/img/home.jpg", detail: "This is Home4"}
        ],
        "Food": [
            { title: "Food1", price: "666.66", img: "assets/img/food.jpg", detail: "This is Food1"},
            { title: "Food2", price: "666.66", img: "assets/img/food.jpg", detail: "This is Food2"},
            { title: "Food3", price: "666.66", img: "assets/img/food.jpg", detail: "This is Food3"},
            { title: "Food4", price: "666.66", img: "assets/img/food.jpg", detail: "This is Food4"}
        ],
        "Electronics": [
            { title: "Electronics1", price: "6666.66", img: "assets/img/electronics.jpg", detail: "This is Electronics1"},
            { title: "Electronics2", price: "6666.66", img: "assets/img/electronics.jpg", detail: "This is Electronics2"},
            { title: "Electronics3", price: "6666.66", img: "assets/img/electronics.jpg", detail: "This is Electronics3"},
            { title: "Electronics4", price: "6666.66", img: "assets/img/electronics.jpg", detail: "This is Electronics4"}
        ]
    };

    function setDefaultProductList() {
        const defaultCategory = "Home";
        curPath = [defaultCategory];
        updateBreadcrumb();
        productList.innerHTML = "";
        products[defaultCategory].forEach(product => {
            const productHTML = `
                <div class="product">
                    <img src="${product.img}" class="product_image">
                    <span class="product_title">${product.title}</span>
                    <div class="product_price">
                        $${product.price}
                        <button class="add_to_cart_button"><i class="fa-solid fa-cart-shopping"></i></button>
                    </div>
                </div>
            `;
            productList.innerHTML += productHTML;
        });
        addProductClickEvent();
        addAddToCartEvent();
    }

    setDefaultProductList();
    
    categories.forEach(category => {
        category.addEventListener("click", function() {
            const selectedCategory = this.textContent;
            productList.innerHTML = "";
            
            curPath = [curPath[0], selectedCategory];
            updateBreadcrumb();
            sidebar.classList.remove("active");
            mainContainer.classList.remove("dimmed");
            
            
            products[selectedCategory].forEach(product => {
                const productHTML = `
                    <div class="product">
                        <img src="${product.img}" class="product_image">
                        <span class="product_title">${product.title}</span>
                        <div class="product_price">
                            $${product.price}
                            <button class="add_to_cart_button"><i class="fa-solid fa-cart-shopping"></i></button>
                        </div>
                    </div>
                `;
                productList.innerHTML += productHTML;
            });

            addProductClickEvent();
            addAddToCartEvent();
        });
    });

    menuButton.addEventListener("click", function() {
        sidebar.classList.toggle("active");
        mainContainer.classList.toggle("dimmed");
    });
    
    document.addEventListener("click", function(e) {
        if (!sidebar.contains(e.target) && !menuButton.contains(e.target)) {
            sidebar.classList.remove("active");
            mainContainer.classList.remove("dimmed");
        }

        switch (e.target.id) {
            case "breadcrumb_back": {
                categories.forEach(category => {
                    if (category.textContent === e.target.innerHTML) {
                        category.click();
                    }
                });
            } break;
            case "breadcrumb_back_home": {
                setDefaultProductList();
            } break;
        }
    });

    function updateBreadcrumb() {
        breadcrumb.innerHTML = curPath.map((path, index) => {
            if (index == curPath.length - 1) {
                return `<span class="breadcrumb_title">${path}</span>`;
            } if (index == 0) {
                return `<a href="#" id="breadcrumb_back_home">${path}</a><i class="fa-solid fa-angle-right"></i>`;
            } else {
                return `<a href="#" id="breadcrumb_back">${path}</a><i class="fa-solid fa-angle-right"></i>`;
            }
        }).join("");
    }

    function addProductClickEvent() {
        const productElements = document.querySelectorAll('.product');
        productElements.forEach(product => {
            product.addEventListener('click', function() {
                const img = this.querySelector('.product_image').src;
                const title = this.querySelector('.product_title').innerText;
                const price = this.querySelector('.product_price').innerText;
                const description = products[curPath[curPath.length - 1]].find(p => p.title == title).detail;

                curPath.push(title);
                updateBreadcrumb();

                productList.innerHTML = `
                    <div class="main_image">
                        <img class="product_image" src="${img}">
                    </div>
                    <div class="product_details">
                        <h1 class="product_title">${title}</h1>
                        <p class="product_description">${description}</p>
                        <p class="product_price">${price}</p>
                        <button class="add_to_cart_button">Add to cart</button>
                    </div>
                `;

                document.querySelector('.add_to_cart_button').addEventListener('click', function(event) {
                    const price = parseFloat(document.querySelector('.product_price').innerText.replace('$', ''));
                    addToCart({ title, price, img });
                });
            });
        });
    };

    function addAddToCartEvent() {
        const addToCartButtons = document.querySelectorAll('.add_to_cart_button');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.stopPropagation();
                const productElement = this.closest('.product') ? this.closest('.product') : this.closest('.product_detail');
                const title = productElement.querySelector('.product_title').innerText;
                const price = parseFloat(productElement.querySelector('.product_price').innerText.replace('$', ''));
                const img = productElement.querySelector('.product_image').src;

                addToCart({ title, price, img });
            });
        });
    }

    function addToCart(product) {
        const existingProduct = cart.find(item => item.title === product.title);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            product.quantity = 1;
            cart.push(product);
        }
        updateCart();
    }

    function updateCart() {
        cartItems.innerHTML = '';
        let total = 0;
        cart.forEach(product => {
            total += product.price * product.quantity;
            const cartItemHTML = `
                <li class="cart_item">
                    <img src="${product.img}" class="cart_item_image" alt="Product Image">
                    <div class="cart_item_details">
                        <span class="cart_item_title">${product.title}</span>
                        <input type="number" class="quantity_input" value="${product.quantity}" min="1" data-title="${product.title}">
                        <span class="cart_item_price">$${(product.price * product.quantity).toFixed(2)}</span>
                    </div>
                </li>
            `;
            cartItems.innerHTML += cartItemHTML;
        });
        cartCount.innerText = `$${total.toFixed(2)}`;
        addQuantityChangeEvent();
    }

    function addQuantityChangeEvent() {
        const quantityInputs = document.querySelectorAll('.quantity_input');
        quantityInputs.forEach(input => {
            input.addEventListener('change', function() {
                const title = this.getAttribute('data-title');
                const newQuantity = parseInt(this.value);
                const product = cart.find(item => item.title === title);
                if (product) {
                    product.quantity = newQuantity;
                    updateCart();
                }
            });
        });
    }
});