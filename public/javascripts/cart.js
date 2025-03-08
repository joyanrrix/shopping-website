export class ShoppingCart {
    constructor() {
        this.cart = new Map();
        this.loadFromStorage();
    }

    saveToStorage() {
        const data = Array.from(this.cart.entries())
            .map(([pid, product]) => ({
                "pid": pid,
                "quantity": product.quantity
            }));
        console.log(data);
        localStorage.setItem('shopping-cart', JSON.stringify(data));
    }

    loadFromStorage() {
        const data = JSON.parse(localStorage.getItem('shopping-cart'));
        if (!data) return;
        data.forEach(async ({ pid, quantity }) => {
            try {
                const response = await fetch(`/products/get_product_by_id?pid=${pid}`);
                const product = await response.json();
                product.quantity = quantity;
                this.cart.set(pid, product);
                this.updateUI();
            } catch (error) {
                console.error(error);
            }
        });
    }

    addToCart(product) {
        if (this.cart.has(product.pid)) {
            product.quantity += 1;
        } else {
            product.quantity = 1;
        }
        this.cart.set(product.pid, product);
        this.updateUI();
    }

    updateUI() {
        const cartItems = document.querySelector(".cart_items");
        cartItems.innerHTML = "";
        var total = 0;
        console.log(this.cart);
        this.cart.forEach(product => {
            total += product.price * product.quantity;

            const cartItem = document.createElement('li');
            cartItem.className = 'cart_item';

            const cartItemImage = document.createElement('img');
            cartItemImage.src = `./images/${product.image}`;
            cartItemImage.className = 'cart_item_image';

            const cartItemDetails = document.createElement('div');
            cartItemDetails.className = 'cart_item_details';

            const cartItemTitle = document.createElement('span');
            cartItemTitle.className = 'cart_item_title';
            cartItemTitle.innerText = product.name;

            const quantityInput = document.createElement('input');
            quantityInput.type = 'number';
            quantityInput.className = 'quantity_input';
            quantityInput.value = product.quantity;
            quantityInput.min = 1;
            quantityInput.setAttribute('data-title', product.name);
            quantityInput.addEventListener('change', (e) => {
                product.quantity = parseInt(e.target.value);
                this.updateUI();
            });

            const cartItemPrice = document.createElement('span');
            cartItemPrice.className = 'cart_item_price';
            cartItemPrice.innerText = `$${(product.price * product.quantity).toFixed(2)}`;

            const removeButton = document.createElement('button');
            removeButton.className = 'remove_button';
            removeButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
            removeButton.addEventListener('click', () => {
                this.cart.delete(product.pid);
                this.updateUI();
            });

            cartItemDetails.appendChild(cartItemTitle);
            cartItemDetails.appendChild(quantityInput);
            cartItemDetails.appendChild(cartItemPrice);

            cartItem.appendChild(cartItemImage);
            cartItem.appendChild(cartItemDetails);
            cartItem.appendChild(removeButton);

            cartItems.appendChild(cartItem);
        });
        document.querySelector(".cart_count").innerText = `$${total.toFixed(2)}`;
        this.saveToStorage();
    }

    getCart() {
        return this.cart;
    }
}