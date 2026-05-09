# 🚀 Quick Reference - SplitFlow

## Essential Commands

### Initial Setup
```bash
# Clone and setup everything
git clone <repo>
npm run install:all

# Or with automation
bash setup.sh

# Start development
npm run dev:all
```

### Backend Commands
```bash
cd server

# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Database
npm run prisma:migrate -- --name <migration_name>
npm run prisma:studio

# Production
npm start
```

### Frontend Commands
```bash
cd client/Expense-management

# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Preview
npm run preview

# Lint
npm run lint
```

### Docker
```bash
# Start PostgreSQL locally
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs postgres
```

---

## URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:4000 |
| API Health | http://localhost:4000/api/health |
| PgAdmin | http://localhost:5050 |

---

## Environment Files

### Backend (.env)
```env
PORT=4000
JWT_SECRET=<your_secret>
DATABASE_URL=postgresql://user:pass@host:port/db
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:4000/api
```

---

## Key Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `SETUP.md` | Installation guide |
| `DEVELOPER_GUIDE.md` | Developer reference |
| `PROJECT_SUMMARY.md` | Detailed summary |

---

## Common Issues

### Port in Use
```bash
# Find process on port
lsof -i :4000
# Kill it
kill -9 <PID>
```

### Database Connection Error
- Verify DATABASE_URL format
- Check if database is running
- Check credentials

### Module Not Found
```bash
# Reinstall
rm -rf node_modules
npm install
```

---

## API Testing

### Using curl
```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"User","password":"pass"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'
```

### Using Postman
1. Import `http://localhost:4000/api` endpoints
2. Get token from login
3. Add to Authorization header: `Bearer <token>`

---

## Database Schema Quick Reference

```
User
├── id, email, name, password
└── Relations: groupsCreated, groupMemberships, expensesPaid

Group
├── id, name, createdBy
└── Relations: creator, members, expenses

GroupMember
├── userId, groupId
└── Relations: user, group

Expense
├── id, amount, paidBy, groupId
└── Relations: paidByUser, group, splits

ExpenseSplit
├── id, expenseId, userId, shareAmount
└── Relations: expense, user
```

---

## Development Workflow

1. **Feature Planning**: Update DEVELOPER_GUIDE.md
2. **Backend**: Update schema → migrate → add controller/route
3. **Frontend**: Add API call → create component → test
4. **Testing**: Manual testing checklist
5. **Commit**: Clear commit messages

---

## Deployment Checklist

- [ ] Build success: `npm run build:server` && `npm run build:client`
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Frontend built to `dist/`
- [ ] No console errors
- [ ] API endpoints tested
- [ ] Test user account created

---

## Performance Tips

- Use React DevTools Profiler
- Check Network tab for API calls
- Monitor database queries
- Use Chrome DevTools Lighthouse

---

## Helpful Links

- [Prisma Docs](https://www.prisma.io/docs/)
- [Tailwind Docs](https://tailwindcss.com/)
- [React Docs](https://react.dev/)
- [Express Docs](https://expressjs.com/)

---

**Need more help? Check PROJECT_SUMMARY.md or DEVELOPER_GUIDE.md**
