const Axios = require("axios");
const config = require("../../configs/configs");

const stripe = require("stripe")(
  "sk_test_51LXjFxSBikUvm25bYDOk4SIXcYVKqO4uDtlXXxTom0BkD99P6layTugG8oeipmoWiaSWikm0RlhXp6y2ItyiGA0L00alGeLQIf"
);

class StripeService {
  /**
        @purpose create a payment intent
        @params {price, currency, paymentMethodId}
        @response json
    **/
  async createPaymentIntent({ amount, currency }) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        payment_method_types: ["card"],
      });

      return { status: 1, data: paymentIntent };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      return { status: 0, data: error };
    }
  }
}
module.exports = StripeService;
