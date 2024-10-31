const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    orderid: {
      type: String,
      require: true,
    },
    ethAmount: {  // Amount sent to exchange
      type: String,
      require: true,
    },
    recipientAddress: { // Relayer btc wallet
      type: String,
      require: true,
    },
    from_addr: { // Exchange eth receiver
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', OrderSchema);
