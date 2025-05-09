import { Utils } from "./utils.js";
import { shoppingCart } from "./cart.js";

window.paypal
  .Buttons({
    style: {
      shape: "rect",
      layout: "vertical",
      color: "gold",
      label: "paypal",
    },

    async createOrder() {
      try {
        const cart = shoppingCart.getCart();

        const response = await fetch("/checkout/create_order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Csrf-Token': Utils.getCsrfToken()
          },
          body: JSON.stringify(Array.from(cart.values())),
        });

        const orderData = await response.json();

        if (orderData.id) {
          return orderData.id;
        }
        const errorDetail = orderData?.details?.[0];
        const errorMessage = errorDetail
          ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
          : JSON.stringify(orderData);

        throw new Error(errorMessage);
      } catch (error) {
        console.error(error);
      }
    },

    async onApprove(data, actions) {
      try {
        const response = await fetch(`/checkout/orders/${data.orderID}/capture`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Csrf-Token': Utils.getCsrfToken()
          },
        });

        const orderData = await response.json();
        // Three cases to handle:
        //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
        //   (2) Other non-recoverable errors -> Show a failure message
        //   (3) Successful transaction -> Show confirmation or thank you message

        const errorDetail = orderData?.details?.[0];

        if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
          // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
          // recoverable state, per
          // https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
          return actions.restart();
        } else if (errorDetail) {
          // (2) Other non-recoverable errors -> Show a failure message
          throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
        } else if (!orderData.purchase_units) {
          throw new Error(JSON.stringify(orderData));
        } else {
          // (3) Successful transaction -> Show confirmation or thank you message
          // Or go to another URL:  actions.redirect('thank_you.html');
          const transaction =
            orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
            orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];

          localStorage.setItem("shopping-cart", JSON.stringify([]));
          location.reload();
        }
      } catch (error) {
        console.error(error);
      }
    },
  })
  .render("#paypal-button-container");
