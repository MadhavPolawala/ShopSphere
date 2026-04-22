const dotenv = require('dotenv');
dotenv.config(); // ⚠️ Must be first — env vars must exist before any module reads them

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const User = require('./models/userModel');

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const settingsRoutes = require('./routes/settingsRoutes');


connectDB();

const app = express();

// Support multiple allowed origins (comma-separated in CLIENT_URL env var)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

console.log('Allowed Origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// ✅ Initialize Passport (no session needed — we use JWT)
app.use(passport.initialize());

// ✅ Google OAuth Strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const googleId = profile.id;

      let user = await User.findOne({ $or: [{ googleId }, { email }] });

      if (user) {
        console.log('Google Strategy: User found in DB:', user.email, 'ID:', user._id);
        // If user exists but doesn't have googleId (was registered with email), link them
        if (!user.googleId) {
          console.log('Google Strategy: Linking existing email user to googleId');
          user.googleId = googleId;
          await user.save();
        }
      } else {
        console.log('Google Strategy: Creating new user for:', email);
        // Create new user
        user = await User.create({
          name,
          email,
          googleId,
          // No password for google users
        });
        console.log('Google Strategy: New user created with ID:', user._id);
      }
      return done(null, user);
    } catch (err) {
      console.error('Google Strategy Error:', err);
      return done(err, null);
    }
  }
));

// ✅ ROUTE: Start Google login — frontend redirects here
// e.g. window.location.href = `${BACKEND_URL}/auth/google`
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// ✅ ROUTE: Google calls this after user picks account
app.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed` }),
  (req, res) => {
    console.log('Google Auth Callback: User found:', req.user ? req.user.email : 'NULL');
    if (!req.user) {
      console.error('Google Auth Callback: req.user is missing!');
      return res.redirect(`${process.env.CLIENT_URL}/login?error=user_not_found`);
    }

    // Get ID safely
    const userId = req.user._id || req.user.id;
    if (!userId) {
      console.error('Google Auth Callback: User ID is missing!', req.user);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=id_missing`);
    }

    console.log('Google Auth Callback: Signing token for ID:', userId.toString(), 'Email:', req.user.email);
    // Sign a JWT with the user's MongoDB ID and Email
    const token = jwt.sign(
      { id: userId.toString(), email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token in URL
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
  }
);

// ✅ ROUTE: Frontend calls this to verify token & get user info
app.get('/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1]; // "Bearer <token>"
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/settings', settingsRoutes);

// 404 Handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

  // ─── Self-ping to prevent Render free-tier sleep ───────────────────────────
  // Render spins down after 15 min of inactivity. We ping our own /api/products
  // every 10 min (only in production) to keep the server awake.
  if (process.env.NODE_ENV === 'production' && process.env.BACKEND_URL) {
    const https = require('https');
    const PING_INTERVAL_MS = 11 * 60 * 1000; // 11 minutes

    const pingServer = () => {
      const url = `${process.env.BACKEND_URL}/api/products`;
      https.get(url, (res) => {
        console.log(`[keep-alive] Pinged ${url} → ${res.statusCode}`);
      }).on('error', (err) => {
        console.warn(`[keep-alive] Ping failed: ${err.message}`);
      });
    };

    // First ping after 10 min, then every 10 min thereafter
    setInterval(pingServer, PING_INTERVAL_MS);
    console.log('[keep-alive] Self-ping scheduled every 11 minutes');
  }
  // ───────────────────────────────────────────────────────────────────────────
});