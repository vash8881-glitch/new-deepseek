cd backend
cat > .env << EOF
NODE_ENV=development
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production
MONGODB_URI=mongodb://localhost:27017/vegecommerce
BASE_URL=http://localhost:5000
EOF