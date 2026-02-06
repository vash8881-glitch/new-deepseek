require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize i18next
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: path.join(__dirname, 'locales/{{lng}}/translation.json')
    },
    supportedLngs: ['en', 'hi', 'kn', 'mr']
  });

app.use(middleware.handle(i18next));

// Create locales if they don't exist
const createTranslations = () => {
  const translations = {
    en: {
      welcome: "Welcome to VEG24 Fresh",
      products: "Products",
      add_to_cart: "Add to Cart",
      daily_fresh: "Daily Fresh",
      organic: "Organic"
    },
    hi: {
      welcome: "VEG24 ताजा में आपका स्वागत है",
      products: "उत्पाद",
      add_to_cart: "कार्ट में जोड़ें",
      daily_fresh: "दैनिक ताजा",
      organic: "जैविक"
    },
    kn: {
      welcome: "VEG24 ಫ್ರೆಶ್ಗೆ ಸ್ವಾಗತ",
      products: "ಉತ್ಪನ್ನಗಳು",
      add_to_cart: "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ",
      daily_fresh: "ದೈನಂದಿನ ತಾಜಾ",
      organic: "ಸಾವಯವ"
    },
    mr: {
      welcome: "VEG24 फ्रेश मध्ये आपले स्वागत आहे",
      products: "उत्पादने",
      add_to_cart: "कार्टमध्ये जोडा",
      daily_fresh: "दैनंदिन ताजे",
      organic: "ऑर्गेनिक"
    }
  };

  Object.entries(translations).forEach(([lang, data]) => {
    const filePath = path.join(__dirname, 'locales', lang, 'translation.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  });
};

createTranslations();

// Sample data
let users = [];
let products = [
  {
    id: 1,
    name: { en: 'Tomato', hi: 'टमाटर', kn: 'ಟೊಮೇಟೊ', mr: 'टोमॅटो' },
    price: { current: 40, unit: 'kg' },
    stock: 100,
    tags: ['daily-fresh', 'organic'],
    image: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Tomato'
  },
  {
    id: 2,
    name: { en: 'Potato', hi: 'आलू', kn: 'ಆಲೂಗಡ್ಡೆ', mr: 'बटाटा' },
    price: { current: 30, unit: 'kg' },
    stock: 50,
    tags: ['local'],
    image: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Potato'
  }
];

// API Routes

// Get translations
app.get('/api/translations/:lang', (req, res) => {
  const lang = req.params.lang;
  const filePath = path.join(__dirname, 'locales', lang, 'translation.json');
  
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(data);
  } else {
    res.json({ error: 'Language not found' });
  }
});

// Get products
app.get('/api/products', (req, res) => {
  const lang = req.language || 'en';
  
  const localizedProducts = products.map(product => ({
    ...product,
    name: product.name[lang] || product.name.en,
    price: product.price.current
  }));
  
  res.json(localizedProducts);
});

// Send OTP (demo version)
app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  
  if (!phone || phone.length !== 10) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid phone number' 
    });
  }
  
  // Demo OTP - in production, use Twilio
  console.log(`Demo OTP for ${phone}: 123456`);
  
  res.json({ 
    success: true, 
    message: 'OTP sent successfully',
    demo_otp: '123456', // For demo only
    expiresIn: 120
  });
});

// Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  
  if (!phone || !otp) {
    return res.status(400).json({ 
      success: false, 
      message: 'Phone and OTP required' 
    });
  }
  
  // For demo, accept any 6-digit OTP
  if (otp === '123456') {
    const token = 'demo-token-' + Date.now();
    const user = { 
      id: users.length + 1, 
      phone, 
      name: `User${phone.slice(-4)}` 
    };
    users.push(user);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid OTP'
    });
  }
});

// Admin dashboard
app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    success: true,
    stats: {
      revenue: { today: 12500, weekly: 85000, monthly: 320000 },
      orders: { total: 150, pending: 12, delivered: 138 },
      customers: { total: 89, new: 15 },
      products: { total: products.length, lowStock: 2 }
    }
  });
});

// Serve static files for frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Default route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>VEG24 Fresh - Backend Running</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        h1 {
          font-size: 3rem;
          margin-bottom: 20px;
        }
        .container {
          background: rgba(255,255,255,0.1);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          max-width: 800px;
          margin: 0 auto;
        }
        .endpoints {
          text-align: left;
          background: rgba(0,0,0,0.2);
          padding: 20px;
          border-radius: 10px;
          margin-top: 30px;
        }
        code {
          background: rgba(0,0,0,0.3);
          padding: 5px 10px;
          border-radius: 5px;
          display: block;
          margin: 10px 0;
        }
        a {
          color: #ffcc00;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 VEG24 Backend Running Successfully!</h1>
        <p>Vegetable E-commerce Platform Backend</p>
        
        <div class="endpoints">
          <h3>Available Endpoints:</h3>
          <code>GET /api/products</code>
          <code>POST /api/auth/send-otp</code>
          <code>POST /api/auth/verify-otp</code>
          <code>GET /api/translations/:lang</code>
          <code>GET /api/admin/dashboard</code>
          
          <h3 style="margin-top: 30px;">Test Commands:</h3>
          <code>curl -X GET http://localhost:5000/api/products</code>
          <code>curl -X POST http://localhost:5000/api/auth/send-otp -H "Content-Type: application/json" -d '{"phone":"9876543210"}'</code>
        </div>
        
        <p style="margin-top: 30px;">
          <a href="/api/products">Test Products API</a> | 
          <a href="/api/admin/dashboard">Test Admin Dashboard</a>
        </p>
      </div>
    </body>
    </html>
  `);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  🌱 VEG24 E-commerce Backend Started!
  ⚡ Server running on: http://localhost:${PORT}
  
  Available APIs:
  ✅ GET    /api/products
  ✅ POST   /api/auth/send-otp
  ✅ POST   /api/auth/verify-otp
  ✅ GET    /api/translations/:lang
  ✅ GET    /api/admin/dashboard
  
  Test with:
  curl http://localhost:${PORT}/api/products
  `);
});