# HRMS Backend (Node.js + Postgres)

## Prereqs
- Docker & docker-compose
- Node.js 18+ and npm

## Start Postgres
```bash
docker-compose up -d
```

## Install & Run
```bash
cp .env.example .env
npm install
npm run dev   # or npm start
```

## API Endpoints (examples)
- POST  /api/employees                 -> Create employee (offer created)
- GET   /api/employees/:id             -> Get employee
- POST  /api/attendance/:employeeId    -> Add attendance (IN/OUT)
- POST  /api/leave/:employeeId        -> Create leave request
- POST  /api/payroll/run              -> Trigger payroll run for period
- POST  /api/workflow/start           -> Start offer/onboarding workflow
