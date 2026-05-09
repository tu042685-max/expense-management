# 💰 SplitFlow - Group Expense Sharing App

A premium full-stack web application for tracking and managing shared expenses in groups. Automatically calculates who owes whom and minimizes transactions.

## 🎯 Features

- **User Authentication**: Secure JWT-based authentication
- **Group Management**: Create groups and invite friends
- **Expense Tracking**: Add and manage expenses with flexible splitting
- **Smart Settlement**: Automatically calculates who owes whom with optimized payment suggestions
- **Real-time Balances**: View individual balances and group summaries
- **Premium UI**: Modern, responsive design with smooth animations
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🛠 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for premium styling
- **React Router** for navigation
- **Axios** for API communication
- **Recharts** for data visualization
- **Lucide React** for beautiful icons

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma** ORM for database management
- **PostgreSQL** (via Supabase) for reliable data storage
- **JWT** for authentication
- **bcrypt** for password hashing

## 📁 Project Structure

```
Expense-management/
├── client/
│   └── Expense-management/
│       ├── src/
│       │   ├── components/     # Reusable React components
│       │   ├── pages/          # Page components
│       │   ├── context/        # Auth context
│       │   ├── hooks/          # Custom hooks
│       │   ├── utils/          # API calls and helpers
│       │   ├── types/          # TypeScript types
│       │   ├── App.tsx         # Main app with routing
│       │   ├── main.tsx        # Entry point
│       │   ├── index.css       # Global styles
│       │   └── App.css         # App styles
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       └── package.json
├── server/
│   ├── controllers/            # Business logic
│   ├── routes/                 # API routes
│   ├── middleware/             # Auth middleware
│   ├── utils/                  # Settlement algorithm
│   ├── types/                  # TypeScript types
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── index.ts                # Express app
│   ├── package.json
│   └── .env                    # Environment variables
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ 
- npm or yarn
- PostgreSQL database (Supabase recommended)

### Installation

#### 1. Backend Setup

```bash
cd server
npm install

# Create .env file with:
# PORT=4000
# JWT_SECRET=your_jwt_secret
# DATABASE_URL=your_postgresql_url
# NODE_ENV=development
```

#### 2. Frontend Setup

```bash
cd client/Expense-management
npm install

# Create .env file with:
# VITE_API_URL=http://localhost:4000/api
```

### Running the Application

#### Terminal 1 - Backend

```bash
cd server
npm run dev
```

The backend will start on `http://localhost:4000`

#### Terminal 2 - Frontend

```bash
cd client/Expense-management
npm run dev
```

The frontend will start on `http://localhost:5173`

## 📊 Database Schema

### User
- `id`: Primary Key
- `email`: Unique email address
- `name`: User's name
- `password`: Hashed password
- `profileAvatar`: Optional profile picture URL
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Group
- `id`: Primary Key
- `name`: Group name
- `description`: Optional group description
- `createdBy`: User ID who created the group
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### GroupMember
- `id`: Primary Key
- `userId`: User ID (Foreign Key)
- `groupId`: Group ID (Foreign Key)
- `joinedAt`: Timestamp

### Expense
- `id`: Primary Key
- `amount`: Expense amount
- `description`: Optional description
- `paidBy`: User ID who paid
- `groupId`: Group ID
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### ExpenseSplit
- `id`: Primary Key
- `expenseId`: Expense ID (Foreign Key)
- `userId`: User ID (Foreign Key)
- `shareAmount`: Amount this user owes/is owed

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Groups
- `POST /api/group` - Create new group
- `GET /api/group` - Get user's groups
- `GET /api/group/:groupId` - Get group details
- `PUT /api/group/:groupId` - Update group
- `POST /api/group/member/add` - Add member to group
- `DELETE /api/group/:groupId/member/:userId` - Remove member

### Expenses
- `POST /api/expense` - Add new expense
- `GET /api/expense/:groupId` - Get group expenses
- `PUT /api/expense/:expenseId` - Update expense
- `DELETE /api/expense/:expenseId` - Delete expense
- `GET /api/expense/:groupId/settlement` - Get settlement info

## 🧮 Settlement Algorithm

The app uses a greedy algorithm to minimize transactions:

1. Calculate each user's balance (positive = owed money, negative = owes money)
2. Separate users into debtors (negative balance) and creditors (positive balance)
3. Match debtors with creditors, settling the minimum amount
4. Continue until all debts are settled

**Example:**
- User A paid ₹100 → each owes ₹33.33
- User B paid ₹50 → each owes ₹16.67
- Final balances:
  - A: +₹16.66 (owed)
  - B: -₹16.67 (owes)
  - C: -₹50 (owes)
- Settlement: C pays A ₹33, C pays B ₹17, B pays A ₹16.67

## 🔐 Security

- Passwords are hashed using bcrypt
- JWT tokens for authenticated requests
- CORS configured for safe cross-origin requests
- Cascade delete for maintaining referential integrity

## 📝 Pages

### Public Pages
- **Landing Page** (`/`) - App introduction and features
- **Login** (`/login`) - User login
- **Register** (`/register`) - User registration

### Protected Pages
- **Dashboard** (`/dashboard`) - User's groups
- **Group Detail** (`/group/:groupId`) - Group expenses and settlement
- **Add Expense** (`/group/:groupId/add-expense`) - Add new expense

## 🎨 UI/UX Features

- **Premium Design**: Gradient backgrounds, smooth shadows, modern cards
- **Responsive Layout**: Mobile-first, works on all screen sizes
- **Interactive Charts**: Visual expense breakdown
- **Real-time Updates**: Instant balance calculations
- **Smooth Animations**: Transition effects and loading states

## 📦 Build & Deployment

### Frontend Build
```bash
cd client/Expense-management
npm run build
```

### Backend Build
```bash
cd server
npm run build
```

## 🤝 Contributing

Feel free to fork, modify, and improve this project!

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🙋 Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ by Your Team**

Happy splitting! 💸
