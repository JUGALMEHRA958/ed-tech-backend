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

   
  /**
        @purpose create stripe user 
        @params nzbn 
        @response json
    **/
        async createStripeUser(email) {
          try {
            const customer = await stripe.customers.create({
              email: email,
            });
            return {
              status: 1,
              data: customer,
            };
          } catch (error) {
            console.error("Error creating Stripe user:", error);
            return {
              status: 0,
              data: error,
            };
          }
        }

                  /**
        @purpose create a product
        @params {name}
        @response json
    **/
  async createProduct(data) {
    try {
      const product = await stripe.products.create(data);

      return { status: 1, data: product };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      return { status: 0, data: error };
    }
  }

    /**
        @purpose create a product
        @params {name}
        @response json
    **/
        async listProducts({ metadataKey, metadataValue }) {
          try {
            const product = await stripe.products.list({
              limit: 100,
            });
            if (product.data && product.data.length) {
              let products = product.data.filter((e) => {
                if (e.metadata[metadataKey] == metadataValue) {
                  return e;
                }
              });
              if (products.length) {
                return { status: 1, data: products[0] };
              } else {
                return { status: 0, data: products };
              }
            }
            return { status: 0, data: product.data };
          } catch (error) {
            console.error("Error creating payment intent:", error);
            return { status: 0, data: error };
          }
        }

          /**
        @purpose create a payment invoice
        @params not disclosed yet
        @response json
    **/
  async createPaymentInvoice({ customer, description, paymentIntent ,couponId='' }) {
    try {
      let invoiceCreationObject={
        customer,
        collection_method: "charge_automatically",
        currency: "inr",
        auto_advance: true,
        description,
        metadata: {
          payment_intent_id: paymentIntent,
        },
        // custom_fields: [{ name: "IRN", value: "IRN NUMBER FROM GOVT" }],
        default_tax_rates: ["txr_1NKyCISBikUvm25bmAO1wO1z"],
      }
      if (couponId) {
        invoiceCreationObject.discounts = [
          {
            coupon: couponId
          }
        ];
      }  
      const paymentInvoice = await stripe.invoices.create(invoiceCreationObject);

      return { status: 1, data: paymentInvoice };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      return { status: 0, data: error };
    }
  }
  /**
        @purpose create a payment invoice item with price
        @params not disclosed yet
        @response json
    **/
  async createPaymentInvoiceItem({ customer, invoice, price }) {
    try {
      console.log({ customer, invoice, price },"{ customer, invoice, price }139");
      const paymentInvoice = await stripe.invoiceItems.create({
        customer,
        price,
        invoice,
        currency: "INR",
      });

      return { status: 1, data: paymentInvoice };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      return { status: 0, data: error };
    }
  }

  /**
        @purpose create a price
        @params {name}
        @response json
    **/
  async createPrice({ product, amount }) {
    try {
      const price = await stripe.prices.create({
        unit_amount: amount * 100,
        currency: "INR",
        product,
      });
      let productUpdated = await this.updateProduct(product, {
        metadata: { priceId: price.id },
      });
      return { status: 1, data: productUpdated };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      return { status: 0, data: error };
    }
  }
  /**
        @purpose update product
        @params {name}
        @response json
    **/
  async updateProduct(product, data) {
    try {
      const productUpdate = await stripe.products.update(product, data);
      return { status: 1, data: productUpdate };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      return { status: 0, data: error };
    }
  }

  async payInvoice(invoiceId) {
    try {
      const invoice = await stripe.invoices.pay(invoiceId);
      return {
        status: 1,
        data: invoice,
      };
    } catch (e) {
      return {
        status: 0,
        data: e,
      };
    }
  }
  async finaliseInvoice(invoiceId) {
    try {
      console.log(invoiceId,"invoiceId 197");
      const invoice = await stripe.invoices.finalizeInvoice(invoiceId);
      return invoice;
    } catch (e) {
      return e;
    }
  }
  async getInvoice(invoiceId) {
    try {
      const invoicePDF = await stripe.invoices.retrieveInvoicePdf(invoiceId);
      console.log("----------------\n", invoicePDF);
      return { status: 1, data: invoicePDF };
    } catch (e) {
      return { status: 0, data: e };
    }
  }

  async  createDiscountCoupon(name, percent) {
    const coupon = {
      name: name,
      percent_off: percent,
      currency: 'INR',
    };
  
    const coupons = await stripe.coupons.list();
    console.log(coupons,"coupons 222");
    const existingCoupon = coupons.data.find(coupon => coupon.name === name && coupon.percent_off === percent);
  
    if (existingCoupon) {
      // The coupon already exists, so do not create it.
      return null;
    } else {
      // The coupon does not exist, so create it.
      const createdCoupon = await stripe.coupons.create(coupon);
  
      return createdCoupon.id;
    }
  }
  
      
}

module.exports = StripeService;
