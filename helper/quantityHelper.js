const Quantity = require("../models/QuantityModel");

module.exports = {
  getQuantities: (productId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let sizes = await Quantity.distinct("quantities.size", {
          product: productId,
        });
        resolve({ sizes });
      } catch (error) {
        reject(error);
      }
    });
  },
};
