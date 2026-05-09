# 🚀 Setup Guide - SplitFlow

## Step-by-Step Installation

### Step 1: Database Setup

First, set up your PostgreSQL database on Supabase:

1. Go to [Supabase Console](https://console.supabase.com)
2. Create a new project or use existing one
3. Copy your database connection string

### Step 2: Backend Configuration

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Update your `.env` file:
```env
PORT=4000
JWT_SECRET=your_super_secret_jwt_key_here
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=development
```

4. Create database migrations:
```bash
npm run prisma:migrate -- --name init
```

5. Start the backend server:
```bash
npm run dev
```

The server will run on `http://localhost:4000`

### Step 3: Frontend Configuration

1. Open a new terminal and navigate to the client:
```bash
cd client/Expense-management
```

2. Install dependencies:
```bash
npm install
```

3. The `.env` file is already configured with:
```env
VITE_API_URL=http://localhost:4000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## ✅ Verification Checklist

- [ ] PostgreSQL database is accessible
- [ ] Backend server is running on port 4000
- [ ] Frontend is running on port 5173
- [ ] You can access the landing page
- [ ] API health check: `http://localhost:4000/api/health`

## 🎯 First Time User Flow

1. Open `http://localhost:5173` in your browser
2. Click "Get Started" to register
3. Fill in your details (Email, Name, Password)
4. After registration, you'll be redirected to dashboard
5. Click "New Group" to create your first group
6. Add your friends to the group
7. Start adding expenses!

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 4000 (backend)
sudo lsof -ti:4000 | xargs kill -9

# Kill process on port 5173 (frontend)
sudo lsof -ti:5173 | xargs kill -9
```

### Database Connection Error
- Verify DATABASE_URL in `.env`
- Check if Supabase database is running
- Ensure IP is whitelisted in Supabase

### CORS Error
- Ensure backend is running on `http://localhost:4000`
- Check that `VITE_API_URL` points to correct server

### Module Not Found
```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install
```

## 📦 Build for Production

### Frontend
```bash
cd client/Expense-management
npm run build
```

### Backend
```bash
cd server
npm run build
```

## 🌐 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set `VITE_API_URL` environment variable to your backend URL
4. Deploy

### Backend (Heroku / Railway)
1. Create account on Heroku or Railway
2. Connect your GitHub repository
3. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
4. Deploy

## 📱 Testing the App

### Test Credentials
```
Email: test@example.com
Password: Test@123
```

### Test Scenarios
1. Create a group with friends
2. Add expenses and split them
3. View settlement calculations
4. Pay and clear debts

## 💡 Tips

- Use meaningful expense descriptions for better tracking
- Always include all group members when splitting
- Check settlement calculations before making payments
- Clear notifications after viewing settlements

## 📞 Support

For issues:
1. Check the troubleshooting section above
2. Review browser console for errors
3. Check backend logs for API issues
4. Verify database connection

Happy expense splitting! 🎉
