# HRD Application System

## Features
- **User Management**: Secure login/registration with role-based access
- **Application Tracking**: Status tracking, document attachments, interview scheduling
- **Search & Filter**: Filter by status/position with full-text search
- **Data Export**: Export to Excel functionality

## Technologies
- Frontend: React, React Bootstrap, React Icons
- Data: XLSX (Excel export)
- State Management: Context API + LocalStorage

Default Logins
Role	Email	Password
HRD	hrd@company.com	password123
Admin	admin@company.com	admin123

src/
├── components/
│   ├── Applications.js
│   ├── Dashboard.js
│   ├── Login.js
│   └── Register.js
├── App.js
└── index.js
