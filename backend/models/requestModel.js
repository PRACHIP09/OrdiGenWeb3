const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema(
  {
    userEthAddress: {
      type: String,
      required: true,
    },
    userBtcAddress: {
      // Taproot address [Validate]
      type: String,
      required: true,
    },
    paymentAddress: {
      // Our Taproot BTC Relayer address
      type: String,
      required: true,
    },
    paymentAddressIndex: {
      type: Number,
      required: true,
    },
    amountWithFees: {
      // Amount which user will send
      type: String,
      required: true,
    },
    txHash: {
      // EVM tx hash
      type: String,
    },
    refundTxHash: {
      // EVM tx hash in case of refund
      type: String,
    },
    outputInscriptions: [
      // outputs
      {
        auctionId: {
          type: String,
          required: true,
        },
        amount: { // null for collection
          type: String,
        },
        price: {
          type: String,
          required: true,
        },
        tick: { // name for collection
          type: String,
          required: true,
        },
        txid: {
          // Unisat txid
          type: String,
        },
      },
    ],
    status: {
      type: String,
      enum: [
        'Pending',
        'Signed',
        'Payment Received',
        'Partially Completed',
        'Completed',
        'Cancelled',
        'Failed',
      ],
      default: 'Pending',
    },
    chain: {
      type: String,
      enum: ['Ethereum', 'SatoshiVM', 'Polygon', 'Binance'],
      default: 'Ethereum',
    },
    type: {
      type: String,
      enum: ['brc20', 'collection'],
      default: 'brc20',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Request', RequestSchema);
