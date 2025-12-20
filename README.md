# Family Schedule App

A fullstack Next.js application for tracking where you sleep during trips, helping you balance time between different locations (e.g., parents' house vs in-laws' house).

## Features

- **Authentication**: Secure email/password authentication using NextAuth
- **Sleep Entry Tracking**: Log where you slept each night with a visual calendar
- **Location Management**: Create and manage multiple locations
- **Statistics**: View aggregated stats showing nights spent at each location
- **Responsive Design**: Works seamlessly on mobile and desktop

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (production)
- **Authentication**: NextAuth.js (Auth.js)
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ and Yarn
- Git

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies**:
   ```bash
   yarn install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and set:
   ```
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   TEST_DATABASE_URL="file:./test.db"
   ```
   
   **Important**: Generate a secure random string for `NEXTAUTH_SECRET`. You can use:
   ```bash
   openssl rand -base64 32
   ```

4. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Run the development server**:
   ```bash
   yarn dev
   ```

6. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

### First Time Setup

1. Click "Sign Up" on the login page
2. Create an account with your email and password
3. Default locations ("Parents" and "In-laws") will be automatically created
4. Start logging your sleep entries!

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn test` - Run tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:ui` - Run tests with UI
- `yarn db:migrate` - Run database migrations
- `yarn db:generate` - Generate Prisma client
- `yarn db:studio` - Open Prisma Studio (database GUI)

## Project Structure

```
family-schedule/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/            # Auth routes (login)
│   ├── (protected)/       # Protected routes (dashboard, locations)
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── locations/       # Location management components
├── lib/                  # Utility functions
│   ├── auth.ts          # NextAuth configuration
│   ├── prisma.ts        # Prisma client
│   └── utils.ts         # Helper functions
├── prisma/              # Database schema
│   └── schema.prisma    # Prisma schema
├── types/               # TypeScript type definitions
└── __tests__/           # Test files
```

## Testing

The project includes comprehensive tests for:
- API routes (locations, sleep entries)
- React components (Calendar, LoginForm, StatsCard, etc.)
- Utility functions
- Authentication logic

Run all tests:
```bash
yarn test
```

Run tests in watch mode:
```bash
yarn test:watch
```

## Database Schema

- **User**: Stores user accounts with email and hashed password
- **Location**: Stores locations (e.g., "Parents", "In-laws") with optional color
- **SleepEntry**: Stores sleep entries with date and location reference

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Locations
- `GET /api/locations` - Get all locations for authenticated user
- `POST /api/locations` - Create new location
- `PATCH /api/locations` - Update location
- `DELETE /api/locations?id={id}` - Delete location (if no entries)

### Sleep Entries
- `GET /api/sleep-entries?from={date}&to={date}` - Get entries in date range
- `POST /api/sleep-entries` - Create or update entry (upsert)

All API routes require authentication.

## Production Deployment

1. **Set up environment variables** on your hosting platform:
   - `DATABASE_URL` - Production database URL
   - `NEXTAUTH_SECRET` - Secure random string
   - `NEXTAUTH_URL` - Your production URL

2. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Build and deploy**:
   ```bash
   yarn build
   yarn start
   ```

## License

MIT

