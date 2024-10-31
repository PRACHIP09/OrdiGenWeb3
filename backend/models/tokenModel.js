const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema(
  {
    tick: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Token', TokenSchema);
