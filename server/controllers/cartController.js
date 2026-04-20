const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('cartItems.product');

    if (cart) {
      res.json(cart);
    } else {
      res.json({ cartItems: [] });
    }
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add or update item in cart
// @route   POST /api/cart
// @access  Private
const updateCart = async (req, res) => {
  try {
    const { productId, qty } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product is required' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (qty < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    if (qty > product.countInStock) {
      return res.status(400).json({ message: 'Requested quantity exceeds stock' });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      const existingItem = cart.cartItems.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.qty = qty;
      } else {
        cart.cartItems.push({ product: productId, qty });
      }

      const updatedCart = await cart.save();
      await updatedCart.populate('cartItems.product');
      res.json(updatedCart);
    } else {
      const newCart = new Cart({
        user: req.user._id,
        cartItems: [{ product: productId, qty }],
      });
      const createdCart = await newCart.save();
      await createdCart.populate('cartItems.product');
      res.status(201).json(createdCart);
    }
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.json({ cartItems: [] });
    }

    cart.cartItems = cart.cartItems.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    const updatedCart = await cart.save();
    await updatedCart.populate('cartItems.product');
    res.json(updatedCart);
  } catch (err) {
    console.error('Remove cart item error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.json({ cartItems: [] });
    }

    cart.cartItems = [];
    const updatedCart = await cart.save();
    res.json(updatedCart);
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getCart, updateCart, removeCartItem, clearCart };
