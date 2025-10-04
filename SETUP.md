# Expense Management System - Setup Guide

A complete expense management system with Node.js + Express + SQLite backend and React + TypeScript frontend.

## Features

### Backend Features
- JWT-based authentication with role-based access control (Admin, Manager, Employee)
- Multi-step approval workflows with configurable rules
- SQLite database for data persistence
- RESTful API endpoints for expenses, users, and approval management
- Automatic first user becomes Admin

### Frontend Features
- React 18 with TypeScript and Tailwind CSS
- OCR receipt scanning with Tesseract.js
- Currency conversion integration
- Role-based navigation and route protection
- Responsive design with modern UI

## Tech Stack

**Backend:**
- Node.js + Express
- SQLite (better-sqlite3)
- JWT authentication
- bcryptjs for password hashing

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios
- Tesseract.js (OCR)
- React Router v6
- Lucide React (icons)

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. The backend uses SQLite, so no database setup is needed. The database file will be created automatically on first run.

4. Start the backend server:
```bash
npm start
```

The backend will run on http://localhost:5000

### Frontend Setup

1. Open a new terminal and navigate to the project root:
```bash
cd ..
```

2. Install frontend dependencies (if not already installed):
```bash
npm install
```

3. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on http://localhost:5173

## Usage

### First Time Setup

1. **Create Admin Account**: Sign up at http://localhost:5173/signup
   - The first user to sign up automatically becomes an Admin
   - Select your country to set default currency

2. **Admin Dashboard**: After signing in, you'll have access to:
   - Dashboard: View and approve/reject expenses
   - Submit Expense: Create new expense entries
   - History: View all expenses with filters
   - Approval Rules: Configure approval workflows
   - Manage Users: Create and manage users, assign roles

### User Roles

**Admin:**
- Full system access
- Create users and assign roles
- Configure approval rules
- Approve/reject expenses
- View all expenses

**Manager:**
- Approve/reject expenses assigned to them
- Submit their own expenses
- View their team's expenses

**Employee:**
- Submit expenses
- View their own expense history
- Track approval status

### Key Features

**OCR Receipt Scanning:**
- Upload receipt images when submitting expenses
- Automatically extracts amount, date, vendor, and description
- Supports common receipt formats

**Currency Conversion:**
- Select expense currency when submitting
- Automatic conversion to company default currency
- Real-time exchange rates via exchangerate-api.com

**Approval Workflows:**
- Multi-step approval (Manager → Finance → Director)
- Configurable approval rules:
  - Percentage approval (e.g., 60% of approvers must approve)
  - Specific approver required (e.g., CFO must approve)
  - Hybrid rules
  - Amount-based rules (min/max thresholds)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login

### Users
- `GET /api/users/me` - Get current user profile
- `GET /api/users` - Get all users
- `POST /api/users` - Create user (Admin only)
- `PATCH /api/users/role` - Change user role (Admin only)
- `PATCH /api/users/manager` - Assign manager (Admin only)

### Expenses
- `POST /api/expenses` - Submit expense
- `GET /api/expenses` - Get expenses (role-based filtering)
- `PATCH /api/expenses/:id/approve` - Approve expense
- `PATCH /api/expenses/:id/reject` - Reject expense

### Approval Rules
- `GET /api/users/approval-rules` - Get all rules
- `POST /api/users/approval-rules` - Create rule (Admin only)
- `DELETE /api/users/approval-rules/:id` - Delete rule (Admin only)

## External APIs Used

- **Currency Conversion**: https://api.exchangerate-api.com
- **Country Data**: https://restcountries.com

## Project Structure

```
ExpenseManagementSystem/
├── backend/
│   ├── server.js              # Express server
│   ├── .env                   # Environment variables
│   ├── package.json
│   ├── controllers/           # Business logic
│   │   ├── authController.js
│   │   ├── expenseController.js
│   │   └── userController.js
│   ├── routes/               # API routes
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   └── users.js
│   ├── models/               # Database models
│   │   ├── User.js
│   │   └── Expense.js
│   └── middleware/           # Auth middleware
│       └── authJwt.js
└── frontend/
    ├── src/
    │   ├── components/       # React components
    │   │   └── Layout.tsx
    │   ├── contexts/         # Context providers
    │   │   └── AuthContext.tsx
    │   ├── pages/            # Page components
    │   │   ├── SignIn.tsx
    │   │   ├── SignUp.tsx
    │   │   ├── DashBoard.tsx
    │   │   ├── AddEntry.tsx
    │   │   ├── History.tsx
    │   │   ├── ApprovalRules.tsx
    │   │   └── ManageUsers.tsx
    │   ├── services/         # API services
    │   │   └── api.ts
    │   ├── types/            # TypeScript types
    │   │   └── index.ts
    │   └── App.tsx           # Main app with routing
    └── package.json
```

## Development Notes

- Backend runs on port 5000
- Frontend runs on port 5173
- SQLite database is stored as `expenses.db` in the backend directory
- JWT tokens expire after 24 hours
- CORS is enabled for frontend-backend communication

## Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Role-based access control
- Protected API routes with middleware
- Route guards on frontend

## Troubleshooting

**Backend won't start:**
- Ensure Node.js v16+ is installed
- Check if port 5000 is available
- Run `npm install` in backend directory

**Frontend won't start:**
- Ensure Node.js v16+ is installed
- Check if port 5173 is available
- Run `npm install` in project root

**Database errors:**
- Delete `expenses.db` file and restart backend to reset database
- Ensure write permissions in backend directory

**OCR not working:**
- Check console for Tesseract errors
- Ensure receipt image is clear and readable
- Supported formats: JPG, PNG, WebP
