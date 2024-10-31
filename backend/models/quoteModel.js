const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema(
  {
    ethAmount: {
      type: String,
    },
    maticAmount: {
      type: String,
    },
    bnbAmount: {
      type: String,
    },
    satVMAmount: {
      type: String,
      default: '1',
    },
    usdAmount: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Quote', QuoteSchema);
