const Product = require('../models/productModel');
const { getSettings } = require('../models/appSettingsModel');

const normalizeImages = (images = [], image = '') => {
  const cleanedImages = Array.isArray(images)
    ? images.map((item) => item.trim()).filter(Boolean)
    : [];

  if (cleanedImages.length > 0) {
    return cleanedImages;
  }

  return image ? [image.trim()].filter(Boolean) : [];
};

// Fisher-Yates shuffle (in-place)
const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// @desc    Upload product images
// @route   POST /api/products/upload
// @access  Private/Admin
const uploadProductImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const urls = req.files.map((file) => `${baseUrl}/uploads/${file.filename}`);
    res.json({ urls });
  } catch (err) {
    next(err);
  }
};

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const settings = await getSettings();
    const sortMode = settings.sortMode || 'recent';

    // Admin panel always gets newest-first — no shuffle
    if (req.query.all === 'true') {
      const products = await Product.find({}).sort({ createdAt: -1 });
      return res.json({ products, page: 1, pages: 1 });
    }

    const pageSize = Math.min(Number(req.query.pageSize) || 15, 50);
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: 'i' } }
      : {};

    const count = await Product.countDocuments({ ...keyword });

    if (sortMode === 'random') {
      // Fetch ALL matching products sorted newest-first so index 0 is always newest
      const allProducts = await Product.find({ ...keyword }).sort({ createdAt: -1 });

      // Pin the single newest product at top, shuffle the rest
      const [newest, ...rest] = allProducts;
      const shuffled = newest ? [newest, ...shuffle(rest)] : shuffle(rest);

      // Paginate the shuffled result
      const start = pageSize * (page - 1);
      const products = shuffled.slice(start, start + pageSize);

      return res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
    }

    // Default: recent (newest-first)
    const products = await Product.find({ ...keyword })
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
  } catch (err) {
    next(err);
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const { name, price, image, images, brand, category, countInStock, description } = req.body;

    const normalizedImages = normalizeImages(images, image);

    if (normalizedImages.length === 0) {
      return res.status(400).json({ message: 'At least one product image is required' });
    }

    const product = new Product({
      name,
      price,
      user: req.user._id,
      image: normalizedImages[0],
      images: normalizedImages,
      brand,
      category,
      countInStock,
      description,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (err) {
    next(err);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const { name, price, description, image, images, brand, category, countInStock } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      const normalizedImages = normalizeImages(images, image);

      if (normalizedImages.length === 0) {
        return res.status(400).json({ message: 'At least one product image is required' });
      }

      product.name = name;
      product.price = price;
      product.description = description;
      product.image = normalizedImages[0];
      product.images = normalizedImages;
      product.brand = brand;
      product.category = category;
      product.countInStock = countInStock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  uploadProductImages,
};
