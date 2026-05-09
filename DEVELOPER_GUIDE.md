# 🔧 Developer Guide - SplitFlow

## Project Overview

SplitFlow is a full-stack web application for managing shared expenses. The project is organized into two main parts:

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Prisma + PostgreSQL

## Architecture

### Frontend Structure
```
src/
├── components/        # Reusable UI components
├── pages/            # Full page components
├── context/          # React context for state management
├── hooks/            # Custom React hooks
├── utils/            # Helper functions and API calls
└── types/            # TypeScript type definitions
```

### Backend Structure
```
├── controllers/      # Business logic for routes
├── routes/           # API route definitions
├── middleware/       # Express middleware (auth, etc)
├── utils/            # Helper functions (settlement algorithm)
├── types/            # TypeScript type definitions
└── prisma/           # Database schema
```

## Key Features Implemented

### 1. Authentication
- **JWT-based authentication** with 7-day expiration
- **Password hashing** using bcrypt
- **Auth context** for managing user state on frontend

### 2. Group Management
- Create groups
- Add/remove members
- Update group details
- View all group members with balances

### 3. Expense Tracking
- Add expenses with flexible splitting
- Track who paid and who owes
- Edit and delete expenses
- View expense history

### 4. Smart Settlement
- **Greedy algorithm** for minimizing transactions
- Calculate user balances
- Suggest optimal payment paths
- Real-time balance updates

### 5. UI/UX
- **Premium design** with Tailwind CSS
- **Responsive layout** for all devices
- **Interactive components** with smooth animations
- **Icons** using Lucide React

## API Reference

### Authentication Endpoints
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
GET    /api/auth/profile       - Get user profile
PUT    /api/auth/profile       - Update user profile
```

### Group Endpoints
```
POST   /api/group              - Create group
GET    /api/group              - Get user's groups
GET    /api/group/:id          - Get group details
PUT    /api/group/:id          - Update group
POST   /api/group/member/add   - Add member
DELETE /api/group/:id/member/:uid - Remove member
```

### Expense Endpoints
```
POST   /api/expense            - Add expense
GET    /api/expense/:groupId   - Get expenses
PUT    /api/expense/:id        - Update expense
DELETE /api/expense/:id        - Delete expense
GET    /api/expense/:gid/settlement - Get settlements
```

## Settlement Algorithm

The app minimizes transactions using a greedy algorithm:

1. **Calculate Balances**: For each user, sum their credits (paid) and debits (split)
2. **Separate Users**: Split into debtors (negative balance) and creditors (positive)
3. **Match Greedily**: Match each debtor with creditors, settling minimum amounts
4. **Continue**: Repeat until all balances are settled

### Example
```
Expenses:
- A pays ₹300, split among A, B, C (each gets ₹100 credit)
- B pays ₹200, split among A, B, C (each gets ₹66.67 credit)

Balances:
- A: 300 - 166.67 = +133.33 (owed)
- B: 200 - 266.67 = -66.67 (owes)
- C: -266.67 (owes)

Settlement:
- B pays A: ₹66.67
- C pays A: ₹133.33
Total transactions: 2
```

## Development Workflow

### 1. Local Setup
```bash
# Install dependencies
npm run install:all

# Or manually:
npm install
cd server && npm install
cd ../client/Expense-management && npm install
```

### 2. Environment Setup
```bash
# Backend
cd server
cp .env.example .env
# Edit .env with your DATABASE_URL

# Frontend
cd client/Expense-management
# .env is already configured
```

### 3. Database Setup
```bash
cd server
npm run prisma:migrate -- --name init
```

### 4. Run Development Server
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client/Expense-management
npm run dev

# Or both together:
npm run dev:all
```

## Database Schema

### User
```sql
CREATE TABLE User (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  profileAvatar VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Group
```sql
CREATE TABLE Group (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES User(id)
);
```

### GroupMember
```sql
CREATE TABLE GroupMember (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  groupId INT NOT NULL,
  joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (userId, groupId),
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  FOREIGN KEY (groupId) REFERENCES Group(id) ON DELETE CASCADE
);
```

### Expense
```sql
CREATE TABLE Expense (
  id INT PRIMARY KEY AUTO_INCREMENT,
  amount DECIMAL(10,2) NOT NULL,
  description VARCHAR(255),
  paidBy INT NOT NULL,
  groupId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (paidBy) REFERENCES User(id),
  FOREIGN KEY (groupId) REFERENCES Group(id) ON DELETE CASCADE
);
```

### ExpenseSplit
```sql
CREATE TABLE ExpenseSplit (
  id INT PRIMARY KEY AUTO_INCREMENT,
  expenseId INT NOT NULL,
  userId INT NOT NULL,
  shareAmount DECIMAL(10,2) NOT NULL,
  UNIQUE (expenseId, userId),
  FOREIGN KEY (expenseId) REFERENCES Expense(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);
```

## Code Standards

### TypeScript
- Always use types for function parameters and returns
- Create interfaces for API responses
- Use enums for constants

### React Components
- Functional components with hooks
- Use proper TypeScript props typing
- Extract reusable logic to custom hooks

### API Calls
- Centralize in `utils/api.ts`
- Use axios for HTTP requests
- Add request interceptors for auth tokens

### Styling
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use consistent spacing and colors

## Common Tasks

### Add a New Feature
1. Create database model in `prisma/schema.prisma`
2. Run migrations: `npm run prisma:migrate -- --name feature_name`
3. Create API controller in `server/controllers/`
4. Create API routes in `server/routes/`
5. Add API methods in `client/utils/api.ts`
6. Create React components/pages in `client/src/pages/`
7. Connect components to API

### Fix a Bug
1. Identify if it's frontend or backend
2. Add test cases
3. Fix the issue
4. Test thoroughly
5. Commit with clear message

### Deploy
1. Build: `npm run build`
2. Push to GitHub
3. Deploy frontend to Vercel
4. Deploy backend to Heroku/Railway

## Debugging

### Frontend
- Use React DevTools extension
- Check console for errors
- Use Vite dev server with source maps

### Backend
- Use `console.log()` for debugging
- Check network tab in browser DevTools
- Use Postman for API testing

## Testing

### Manual Testing Checklist
- [ ] Register new user
- [ ] Login with credentials
- [ ] Create a group
- [ ] Add members to group
- [ ] Add expenses
- [ ] View settlement calculations
- [ ] Edit/delete expenses
- [ ] Logout

### API Testing
Use Postman or curl:
```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Create group
curl -X POST http://localhost:4000/api/group \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"My Group"}'
```

## Performance Tips

1. **Frontend**: Use React DevTools Profiler to identify slow renders
2. **Backend**: Use database indexes for frequently queried fields
3. **API**: Cache responses when possible
4. **Images**: Optimize profile avatars before upload

## Security Considerations

1. **Passwords**: Always hash with bcrypt
2. **Tokens**: Never expose JWT secrets
3. **CORS**: Configure properly for production
4. **SQL Injection**: Prisma ORM prevents this
5. **Validation**: Validate all user inputs

## Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Contributing

1. Create a feature branch: `git checkout -b feature/name`
2. Make changes and commit
3. Push to GitHub: `git push origin feature/name`
4. Create a Pull Request

## Troubleshooting

### Port Already in Use
```bash
# Find process on port
lsof -i :4000  # Backend
lsof -i :5173  # Frontend

# Kill process
kill -9 <PID>
```

### Database Connection Issues
- Verify DATABASE_URL format
- Check if database is running
- Verify credentials
- Check IP whitelisting (for cloud databases)

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules
npm cache clean --force
npm install
```

---

**Happy coding! 🚀**
