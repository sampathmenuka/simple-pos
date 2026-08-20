# SimplePOS - Simple Point of Sale System

A clean, modern Point of Sale system built with Next.js, TypeScript, and PostgreSQL. Designed for simplicity and ease of use.

## Features

- **Dashboard**: Sales analytics with revenue trends and key metrics
- **POS Interface**: Fast, intuitive checkout with product selection and cart management
- **Product Management**: Product catalog with inventory tracking
- **Category Management**: Organize products into categories
- **Customer Management**: Manage customer profiles
- **Order History**: Complete order records with detailed breakdown
- **Discounts**: Flexible discount application at checkout
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode**: Built-in theme switching

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: Custom reactive stores, React Query for server state
- **UI Components**: Radix UI with Tailwind CSS
- **Charts**: Recharts for analytics visualization
- **Styling**: Tailwind CSS 4

## Prerequisites

- Node.js 18.x or higher
- PostgreSQL server (local or cloud)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd simple-pos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your PostgreSQL connection string:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/simplepos
   ```

4. **Create the database**
   ```bash
   createdb simplepos
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

6. **Seed sample data**
   ```bash
   npm run db:seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Default Login

- **Username**: admin
- **Password**: admin123

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed the database
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run lint` - Run ESLint

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/login/      # Login page
│   ├── categories/        # Categories management
│   ├── customers/         # Customers management
│   ├── orders/            # Order history
│   ├── pos/               # POS checkout interface
│   ├── products/          # Product management
│   └── page.tsx           # Dashboard
├── components/            # React components
├── lib/                   # Utilities and data layer
│   ├── api/hooks/         # React Query hooks
│   ├── db.ts              # Database queries (Prisma)
│   ├── prisma.ts          # Prisma client
│   ├── store.ts           # UI & cart state
│   └── utils-pos.ts       # POS utilities & types
├── prisma/                # Prisma schema & migrations
└── public/                # Static assets
```

## License

This project is for educational and personal use.
