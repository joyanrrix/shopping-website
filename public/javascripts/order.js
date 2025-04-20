import { Utils } from "./utils.js";

class Order {
    constructor() {
    }

    async getOrderHistory() {
        try {
            const response = await fetch("/orders/history", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'Csrf-Token': Utils.getCsrfToken()
                },
            });

            const orderData = await response.json();

            // console.log("Order History:", orderData);
            return orderData;

        } catch (error) {
            console.error("Error fetching order history:", error);
        }
    }

    renderOrderHistory(orderData) {
        const orderHistoryContainer = document.querySelector(".main_container");
        orderHistoryContainer.innerHTML = "";

        if (orderData && orderData.length > 0) {
            orderData.forEach(order => {
                const orderElement = document.createElement("div");
                orderElement.classList.add("order");

                const orderHeader = document.createElement("div");
                orderHeader.classList.add("order_header");
                orderHeader.innerHTML = `
                    <p><strong>Order ID</strong>${order.id}</p>
                    <p><strong>Date placed</strong>${new Date(order.create_at).toLocaleDateString()}</p>
                    <p><strong>Total amount</strong>$${order.total}</p>
                    <p><strong>Status</strong>${order.status}</p>
                    <p><strong>Transaction ID</strong>${order.txn_id}</p>
                `;
                orderElement.appendChild(orderHeader);

                const orderItems = document.createElement("div");
                orderItems.classList.add("order_items");
                orderItems.innerHTML = ``;
                order.items.forEach(item => {
                    const orderItem = document.createElement("div");
                    orderItem.classList.add("order_item");
                    orderItem.innerHTML = `
                        <div class="order_item_left">
                            <img class="order_img" src="./images/${item.image}" alt="${item.name}">
                        </div>
                        <div class="order_item_right">
                            <div class="order_item_header">
                                <p><strong>${item.name}</strong></p>
                                <p><strong>$${(item.price * item.quantity).toFixed(2)}</strong></p>
                            </div>
                            <p>${item.description}</p>
                            <p>$${item.price} x ${item.quantity}</p>
                        </div>
                    `;
                    orderItems.appendChild(orderItem);
                });
                orderElement.appendChild(orderItems);

                orderHistoryContainer.appendChild(orderElement);
            });
        } else {
            orderHistoryContainer.innerHTML = `
                <p class="order_not_found">No orders found.</p>
            `;
        }
    }
}

export const order = new Order();