# CareSure Frontend

Next.js frontend application for CareSure.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` (or copy from `ENV_EXAMPLE.txt`):
```env
# For production (Render backend):
NEXT_PUBLIC_API_URL=https://careure-ebm-backend.onrender.com/api

# For local development:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

## Features

- Landing page
- Authentication (login/signup)
- Dashboard
- Patient management
- Medication management
- Reminder scheduling
- Device integration
- Reports and analytics
- Medical cards

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Axios
