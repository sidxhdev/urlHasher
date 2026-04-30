# URL Hasher

A full-stack URL shortener application that converts long URLs into compact, shareable short links with click tracking capabilities.

## Project Overview

URL Hasher is a modern web application that allows users to quickly shorten URLs and track how many times each shortened link is clicked. The project consists of a React-based frontend and a Go-based backend API, both built with clean architecture principles.

## Features

- Shorten URLs with a single click
- Generate consistent short codes using MD5 hashing
- Track click counts for each shortened URL
- Automatic deduplication (same URL returns existing short code)
- Responsive web interface
- Cross-origin support (CORS enabled)
- High-performance PostgreSQL backend
- Comprehensive API with health checks

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Modern CSS** - Responsive styling

### Backend
- **Go 1.21** - Server runtime
- **Chi Router** - Lightweight HTTP routing
- **PostgreSQL** - Data persistence
- **godotenv** - Environment configuration

## Project Structure

```
urlHasher/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── styles/        # Component styles
│   │   ├── App.tsx        # Root component with routing
│   │   ├── main.tsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── Dockerfile         # Frontend container image
│   ├── nginx.conf         # Nginx configuration for serving
│   ├── vite.config.ts     # Vite configuration
│   ├── tsconfig.json      # TypeScript configuration
│   ├── package.json       # Dependencies and scripts
│   └── index.html         # HTML template
│
├── server/                # Go backend application
│   ├── cmd/
│   │   └── main.go        # Application entry point
│   ├── internal/
│   │   ├── config/        # Configuration management
│   │   ├── controllers/   # HTTP request handlers
│   │   ├── middleware/    # HTTP middleware (CORS, logging)
│   │   ├── models/        # Data structures
│   │   ├── database/      # Database initialization
│   │   ├── repository/    # Data access layer
│   │   └── services/      # Business logic
│   ├── pkg/
│   │   └── utils/         # Utility functions (hashing)
│   ├── Dockerfile         # Backend container image
│   ├── go.mod             # Go module definition
│   ├── .env               # Environment variables (backend)
│   └── main               # Compiled binary
│
├── docker-compose.yml     # Docker Compose orchestration
├── .env                   # Environment variables (root)
├── .gitignore             # Git ignore patterns
├── README.md              # This file
├── DOCKER_DEPLOYMENT.md   # Docker deployment guide
└── go.mod                 # Go workspace module (if applicable)
```

## Prerequisites

- **Node.js** 16+ (for frontend)
- **Go** 1.21+ (for backend)
- **PostgreSQL** 12+ (for database)

## Installation

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install Go dependencies:
   ```bash
   go mod download
   ```

3. Create a `.env` file in the server directory:
   ```bash
   DATABASE_URL=postgres://user:password@localhost:5432/urlhasher
   PORT=8080
   BASE_URL=http://localhost:5000
   ENVIRONMENT=development
   ```

4. Build the server:
   ```bash
   go build -o main cmd/main.go
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the client directory:
   ```bash
   VITE_API_URL=http://localhost:8080
   ```

## Running the Application

### Start PostgreSQL

Ensure PostgreSQL is running and the database `urlhasher` exists:

```bash
# Create database (if not exists)
createdb urlhasher
```

### Start Backend Server

```bash
cd server
./main
```

The server will start on http://localhost:8080 and automatically create the required database tables.

### Start Frontend Development Server

In a new terminal:

```bash
cd client
npm run dev
```

The client will start on `http://localhost:5173` (default Vite port).

## API Documentation

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "urlHasher API is running"
}
```

### Create Short URL

```http
POST /api/shorten
Content-Type: application/json

{
  "url": "https://www.example.com/very/long/url/that/needs/shortening"
}
```

**Response (201 Created):**
```json
{
  "short_url": "abc1234567",
  "full_url": "http://localhost:5000/redirect/abc1234567"
}
```

### Get All URLs

```http
GET /api/urls
```

**Response:**
```json
[
  {
    "id": "abc1234567",
    "original_url": "https://www.example.com/very/long/url",
    "short_url": "abc1234567",
    "creation_date": "2024-01-15T10:30:00Z",
    "click_count": 42
  }
]
```

### Get URL by ID

```http
GET /api/urls/{id}
```

**Response:**
```json
{
  "id": "abc1234567",
  "original_url": "https://www.example.com/very/long/url",
  "short_url": "abc1234567",
  "creation_date": "2024-01-15T10:30:00Z",
  "click_count": 42
}
```

### Redirect to Original URL

```http
GET /redirect/{id}
```

**Behavior:** Redirects to the original URL and increments click count.

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error description"
}
```

Common HTTP status codes:
- `200 OK` - Successful GET request
- `201 Created` - URL successfully created
- `400 Bad Request` - Invalid input or missing required fields
- `404 Not Found` - URL not found
- `500 Internal Server Error` - Server error

## Development

### Frontend Commands

```bash
cd client

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Backend Commands

```bash
cd server

# Run application
go run cmd/main.go

# Build binary
go build -o main cmd/main.go

# Format code
go fmt ./...

# Run tests (if available)
go test ./...
```

## How It Works

1. **URL Submission**: User enters a long URL in the frontend
2. **Hash Generation**: Backend generates a 10-character MD5-based hash
3. **Deduplication**: System checks if the URL already exists (returns existing code)
4. **Storage**: New URL is stored in PostgreSQL with metadata
5. **Short Link**: User receives a short, shareable link
6. **Redirection**: When clicked, the short link redirects to the original URL
7. **Analytics**: Each click is recorded and counted

## Database Schema

### URLs Table

```sql
CREATE TABLE urls (
  id VARCHAR(50) PRIMARY KEY,
  original_url TEXT NOT NULL,
  short_url VARCHAR(50) NOT NULL,
  creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  click_count INTEGER DEFAULT 0
);

CREATE INDEX idx_short_url ON urls(short_url);
CREATE INDEX idx_original_url ON urls(original_url);
```

## Deployment

### Docker Deployment (Recommended for EC2)

For a complete setup on a single EC2 instance with all services containerized, see [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md).

Quick start:
```bash
# Create .env file with your configuration
cp .env.example .env

# Build and start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost/api
```

### Manual Deployment

### Backend Deployment

1. Build the binary:
   ```bash
   go build -o main cmd/main.go
   ```

2. Deploy with environment variables:
   ```bash
   DATABASE_URL=postgres://prod_user:prod_pass@prod_host/prod_db \
   PORT=8080 \
   BASE_URL=https://yourdomain.com \
   ENVIRONMENT=production \
   ./main
   ```

### Frontend Deployment

1. Build for production:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or suggestions, please open an issue in the repository.
