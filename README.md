# AZUE Perfume House —— Backend

Backend application for the AZUE Perfume House e-commerce platform.

AZUE Perfume is a full-stack e-commerce application for selling authentic perfumes online. The customer-facing application allows users to browse perfumes, explore product details and variants, read perfume-related blog articles, manage their accounts, and place orders.

The backend provides APIs for the AZUE Perfume House e-commerce platform, including product and inventory management, blog content management, customer accounts, orders, returns, and business reporting. It also provides APIs for the administration panel and implements stateless authentication using JWT-based access and refresh tokens.

The project may be expanded in the future with additional e-commerce and business management capabilities.

**Related:** [Frontend](https://github.com/suanhsawmtung/Azue-Perfume-House)

## Features

### Customer & Public API

- **Homepage content APIs** — personalized products, best sellers, latest blogs, and latest reviews
- Product browsing and search APIs
- Product filtering and pagination APIs
- Product details and variant APIs
- Shopping cart APIs
- Wishlist APIs
- Customer review APIs
- Customer profile and account APIs
- Order creation and order history APIs
- Order status APIs
- Blog listing and detail APIs

### Administration Panel

- Dashboard and business reporting APIs
- Product management APIs (CRUD)
- Product variant and stock management APIs
- Blog management APIs (CRUD)
- Order management APIs
- Order status management APIs
- Customer/user management APIs
- Inventory and stock management APIs
- Review management APIs

### Possible Future Improvements

- Real-time notifications for customers and administrators ✅
- Real-time customer–admin messaging ✅
- Supplier management ✅
- Enhanced delivery and order fulfillment process ✅
- Enhanced return and exchange management
- Promotions and enhanced discount features
- FAQ
- Additional business and reporting features

## Tech Stack

### Runtime & Framework

- **Node.js** — JavaScript runtime
- **Express.js** — Backend framework
- **TypeScript** — Type-safe development

### Database

- **PostgreSQL** — Relational database
- **Prisma ORM** — Database access and ORM

### Authentication & Authorization

- **JWT** — Stateless authentication with access and refresh tokens
- **Passport.js** — Google OAuth authentication
- **Role-based authorization** — Customer and administrator access control

### API & Validation

- **Express Validator** — Request validation
- **REST API** — Client-server communication

### File & Email Services

- **Multer** — Multipart/form-data and file uploads
- **Resend** — Transactional email delivery

## Important Technical Implementations

- JWT-based stateless authentication with access and refresh tokens
- Role-based authorization for customers and administrators
- Google OAuth authentication with Passport.js
- API request validation with Express Validator
- Rate limiting for API protection
- Centralized API error handling
- Secure password hashing
- Product variant and inventory management
- Pagination and filtering
- File upload handling with Multer
- Transactional email delivery with Resend
- RESTful API architecture

## Setup

### Prerequisites

- Node.js
- pnpm
- PostgreSQL
- Redis

### Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd <repository-folder>
pnpm install
```

### Environment Variables

Create a `.env` file in the project root and add the required environment variables:

```env
APP_ENV=development
PORT=
DEBUG=

SERVER_URL=backend_url
WEB_URL=frontend_url

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

EMAIL_PROVIDER=log
RESEND_API_KEY=

ACCESS_TOKEN_SECRET_KEY=
REFRESH_TOKEN_SECRET_KEY=

CORS_ORIGINS=frontend_url

REDIS_URL=your_redis_url

DATABASE_URL=database_connection_url
```

### Database Setup

Make sure PostgreSQL is running and your DATABASE_URL is configured in .env.

### Redis Setup

Make sure Redis is running and your REDIS_URL is configured in .env.

#### Run Prisma migrations:

```bash
npx prisma migrate dev
```

#### Generate the Prisma client:

```bash
pnpm prisma generate
```

#### Run the seeder:

```bash
pnpm seed
```

### Run the Development Server

```bash
pnpm dev
```

## Environment Variables

| Variable                   | Description                                 | Example                                                            |
| -------------------------- | ------------------------------------------- | ------------------------------------------------------------------ |
| `APP_ENV`                  | Current application environment             | `development`                                                      |
| `PORT`                     | Port used by the backend server             | `8080`                                                             |
| `DEBUG`                    | Enables or disables debug logging           | `true`                                                             |
| `SERVER_URL`               | Base URL of the backend server              | `http://localhost:8080`                                            |
| `WEB_URL`                  | Base URL of the frontend application        | `http://localhost:5173`                                            |
| `GOOGLE_CLIENT_ID`         | Google OAuth client ID                      | `your-google-client-id`                                            |
| `GOOGLE_CLIENT_SECRET`     | Google OAuth client secret                  | `your-google-client-secret`                                        |
| `EMAIL_PROVIDER`           | Email provider used by the application      | `log`                                                              |
| `RESEND_API_KEY`           | API key for Resend email delivery           | `your-resend-api-key`                                              |
| `RESEND_FROM_EMAIL`        | Sender email address for outgoing emails    | `noreply@example.com`                                              |
| `ACCESS_TOKEN_SECRET_KEY`  | Secret key used to sign access tokens       | `your-access-token-secret`                                         |
| `REFRESH_TOKEN_SECRET_KEY` | Secret key used to sign refresh tokens      | `your-refresh-token-secret`                                        |
| `CORS_ORIGINS`             | Allowed frontend origin(s) for CORS         | `http://localhost:5173`                                            |
| `DATABASE_URL`             | PostgreSQL connection string used by Prisma | `postgresql://username:password@localhost:5432/azue?schema=public` |

> **Note:** These are development values. Update them according to your deployment environment.
