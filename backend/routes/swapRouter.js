const express = require('express');
const asyncHandler = require('express-async-handler');

const {
  newSwap,
  getSwaps,
  getSwapById,
  getSwapsByUser,
  signSwap,
  confirmSwap,
  cancelSwap,
  prepareSwap,
  quote,
  getTokens,
  searchTokens,
  getWhitelist,
  getDetails,
  getOrders,
} = require('../controllers/swapController');
const { isWhitelisted } = require('../middleware/whitelist');

const swapRouter = express.Router();

swapRouter.get('/', asyncHandler(getSwaps));
swapRouter.post('/', isWhitelisted(), asyncHandler(newSwap));

swapRouter.get('/global', asyncHandler(getDetails));
swapRouter.get('/quote', asyncHandler(quote));
swapRouter.get('/prepare', asyncHandler(prepareSwap));
swapRouter.get('/tokens', asyncHandler(getTokens));
swapRouter.get('/orders', asyncHandler(getOrders));
swapRouter.get('/tokens/search', asyncHandler(searchTokens));
swapRouter.get('/whitelist', asyncHandler(getWhitelist));

swapRouter.get('/user/:walletAddress', asyncHandler(getSwapsByUser));
swapRouter.put('/sign/:id', asyncHandler(signSwap));
swapRouter.put('/confirm/:id', asyncHandler(confirmSwap));
swapRouter.put('/cancel/:id', asyncHandler(cancelSwap));

swapRouter.get('/:id', asyncHandler(getSwapById));

module.exports = swapRouter;
