# AI Content Generator

> A powerful AI-powered content generation platform built with **Node.js**, **Express**, **MongoDB**, **Redis**, and **Google Gemini AI**. Generate high-quality blog posts, product descriptions, and social media content with intelligent queue-based processing.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Queue System & Worker Process](#queue-system--worker-process)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Overview

**AI Content Generator** is a production-ready backend system that leverages Google's Gemini AI to generate various types of content. The system uses a queue-based architecture with **Bull** and **Redis** to process AI generation requests asynchronously, ensuring scalability and reliability.

### Key Highlights

- **Asynchronous Processing**: Queue-based content generation with 1-minute delay
- **AI-Powered**: Integrated with Google Gemini AI for high-quality content
- **RESTful API**: Clean, well-documented REST API with proper authentication
- **Database**: MongoDB with Mongoose ODM for flexible data modeling
- **Type Safety**: Built with TypeScript for robust type checking
- **Error Handling**: Custom exception system with proper logging
- **Security**: JWT-based authentication with refresh tokens
- **Scalability**: Worker processes can scale independently

---

## Features

### 🎯 Core Features

- **User Authentication**
  - Registration with email and password
  - JWT-based authentication (access + refresh tokens)
  - Secure password hashing with bcrypt

- **Content Generation**
  - Support for multiple content types: **Blog**, **Product**, **Social Media**
  - AI-powered content generation via Google Gemini
  - Quality validation and retry logic
  - Customizable prompts for each content type

- **Queue Management**
  - Background job processing with Bull queue
  - 1-minute delay before AI generation
  - Automatic retries with exponential backoff
  - Job status tracking (pending → processing → completed/failed)

- **Content Management**
  - Create, read, update, delete (CRUD) operations
  - Pagination and filtering
  - Content status management (draft/published)
  - Soft delete functionality

### 🔧 Technical Features

- Custom exception handling with proper HTTP status codes
- Winston logger for structured logging
- Input validation with express-validator
- Graceful shutdown for worker processes
- MongoDB indexing for performance
- Environment-based configuration

---

## Tech Stack

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Cache/Queue**: Redis + Bull
- **AI**: Google Generative AI (Gemini)

### Authentication & Security

- **JWT**: jsonwebtoken
- **Hashing**: bcryptjs
- **Validation**: express-validator

### Development Tools

- **Build**: TypeScript Compiler (tsc)
- **Dev Server**: tsx (TypeScript execute)
- **Process Manager**: Concurrently (for running multiple processes)
- **Package Manager**: pnpm

---

## Architecture

### System Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│             │ HTTP    │              │  Queue  │             │
│   Client    ├────────▶│  API Server  ├────────▶│    Redis    │
│             │         │  (Express)   │         │   (Bull)    │
└─────────────┘         └──────┬───────┘         └──────┬──────┘
                               │                        │
                               │                        │
                        ┌──────▼────────┐        ┌──────▼──────┐
                        │               │        │             │
                        │   MongoDB     │        │   Worker    │
                        │  (Database)   │        │  Process    │
                        │               │        │             │
                        └───────────────┘        └──────┬──────┘
                                                        │
                                                        │
                                                 ┌──────▼──────┐
                                                 │  Gemini AI  │
                                                 │   Service   │
                                                 └─────────────┘
```

### Request Flow

#### 1. Content Generation Request

```
1. User sends POST /api/content/generate
2. API validates request and authenticates user
3. Creates content record in MongoDB (status: pending)
4. Adds job to Redis queue with 1-minute delay
5. Returns 202 Accepted with jobId
6. Worker picks up job after 1 minute
7. Worker calls Gemini AI to generate content
8. Worker updates content record (status: completed)
9. User polls GET /api/content/job/:jobId/status
10. Returns generated content
```

---

## Project Structure

```
ai-content-generator/
├── apps/
│   └── server/                    # Main server application
│       ├── src/
│       │   ├── config/            # Configuration files
│       │   │   ├── ai.ts          # Google Gemini AI config
│       │   │   ├── database.ts    # MongoDB connection
│       │   │   ├── env.ts         # Environment variables
│       │   │   ├── queue.ts       # Bull queue setup
│       │   │   └── redis.ts       # Redis client config
│       │   │
│       │   ├── controllers/       # Route controllers
│       │   │   ├── auth_controller.ts
│       │   │   └── content_controller.ts
│       │   │
│       │   ├── exceptions/        # Custom exceptions
│       │   │   ├── base_exception.ts
│       │   │   ├── http_exceptions.ts
│       │   │   └── index.ts
│       │   │
│       │   ├── jobs/              # Queue job processors
│       │   │   └── content_generation_processor.ts
│       │   │
│       │   ├── middleware/        # Express middleware
│       │   │   ├── api_logging.ts
│       │   │   ├── auth.ts
│       │   │   ├── error_handler.ts
│       │   │   └── validation.ts
│       │   │
│       │   ├── models/            # Mongoose models
│       │   │   ├── content_model.ts
│       │   │   ├── user_model.ts
│       │   │   ├── refresh_token_model.ts
│       │   │   └── index.ts
│       │   │
│       │   ├── routes/            # API routes
│       │   │   ├── auth_routes.ts
│       │   │   ├── content_routes.ts
│       │   │   └── index.ts
│       │   │
│       │   ├── services/          # Business logic
│       │   │   ├── ai_service.ts
│       │   │   ├── auth_service.ts
│       │   │   ├── content_service.ts
│       │   │   └── queue_service.ts
│       │   │
│       │   ├── types/             # TypeScript interfaces
│       │   │   ├── content_interfaces.ts
│       │   │   ├── queue_interfaces.ts
│       │   │   └── response_interfaces.ts
│       │   │
│       │   ├── utils/             # Utility functions
│       │   │   ├── ai_prompts.ts
│       │   │   ├── constants.ts
│       │   │   ├── logger.ts
│       │   │   ├── messages.ts
│       │   │   └── response.ts
│       │   │
│       │   ├── index.ts           # API server entry point
│       │   └── worker.ts          # Worker process entry point
│       │
│       ├── .env.example           # Environment variables template
│       ├── .env.local             # Local environment variables
│       ├── package.json
│       └── tsconfig.json
│
├── docs/                          # Documentation
│   └── AI_QUEUE_IMPLEMENTATION_STEPS.md
│
├── package.json                   # Root package.json
├── pnpm-workspace.yaml           # pnpm workspace config
└── README.md                      # This file
```

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **pnpm**: v8.0.0 or higher
- **MongoDB**: v5.0 or higher (running locally or MongoDB Atlas)
- **Redis**: v6.0 or higher (running locally or Redis Cloud)
- **Google Gemini API Key**: Get it from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Check Installations

```bash
# Check Node.js version
node --version

# Check pnpm version
pnpm --version

# Check MongoDB (if running locally)
mongosh --version

# Check Redis (if running locally)
redis-cli --version
```

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-content-generator
```

### 2. Install Dependencies

```bash
# Install all dependencies using pnpm
pnpm install
```

This will install dependencies for all workspace packages.

---

## Environment Setup

### 1. Navigate to Server Directory

```bash
cd apps/server
```

### 2. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env.local
```

### 3. Configure Environment Variables

Open `.env.local` and fill in the following variables:

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
NODE_ENV=development
PORT=3000

# ============================================
# DATABASE CONFIGURATION (MongoDB)
# ============================================
# Option 1: Local MongoDB
MONGO_URI=mongodb://localhost:27017/ai-content-generator

# Option 2: MongoDB Atlas (recommended for production)
# MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ai-content-generator?retryWrites=true&w=majority

# ============================================
# REDIS CONFIGURATION
# ============================================
# Option 1: Local Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_URL=redis://127.0.0.1:6379

# Option 2: Redis Cloud (recommended for production)
# REDIS_URL=redis://<username>:<password>@<host>:<port>

# ============================================
# JWT CONFIGURATION
# ============================================
# Generate random secrets using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# ============================================
# GOOGLE GEMINI AI CONFIGURATION
# ============================================
# Get your API key from: https://makersuite.google.com/app/apikey
GOOGLE_AI_API_KEY=your-google-gemini-api-key-here

# AI Model Configuration
AI_MODEL=gemini-1.5-flash
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=2048
AI_TOP_P=0.9
AI_TOP_K=40
```

### 4. Generate JWT Secrets

Generate secure random secrets for JWT:

```bash
# Generate JWT_SECRET
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

Copy the generated values and paste them into your `.env.local` file.

---

## Running the Application

### Option 1: Run Server and Worker Together (Recommended)

This runs both the API server and worker process concurrently in development mode:

```bash
# From the root directory
cd apps/server

# Run both processes together
pnpm run dev:all
```

You should see:

```
[0] 🚀 Server running on http://localhost:3000
[0] 📡 API endpoint: http://localhost:3000/api/welcome
[0] 🌍 Environment: development
[1] 🤖 Worker process starting...
[1] ✅ Content generation processor registered
[1] 👂 Worker is now listening for jobs...
```

### Option 2: Run Server and Worker Separately

**Terminal 1 - API Server:**

```bash
cd apps/server
pnpm run dev
```

**Terminal 2 - Worker Process:**

```bash
cd apps/server
pnpm run worker:dev
```

### Production Mode

```bash
# Build the project
pnpm run build

# Run both server and worker in production
pnpm run start:all
```

---

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication Endpoints

#### 1. Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "statusCode": 201
}
```

#### 2. Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "statusCode": 200
}
```

#### 3. Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Content Generation Endpoints

> **Note**: All content endpoints require authentication. Include the access token in the Authorization header:
>
> ```
> Authorization: Bearer <your_access_token>
> ```

#### 1. Queue Content Generation

```http
POST /api/content/generate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Benefits of AI in Healthcare",
  "contentType": "blog",
  "prompt": "Write a comprehensive blog post about the benefits of AI in healthcare, covering diagnostics, treatment, and patient care"
}
```

**Response (202 Accepted):**

```json
{
  "success": true,
  "message": "Content generation queued successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "title": "Benefits of AI in Healthcare",
    "contentType": "blog",
    "prompt": "Write a comprehensive blog post...",
    "generatedText": "",
    "status": "draft",
    "jobId": "1",
    "generationStatus": "pending",
    "failureReason": null,
    "message": "Content generation queued. It will be processed in 1 minute.",
    "expectedDelay": 60000
  },
  "statusCode": 202
}
```

**Content Types:**

- `blog` - Blog posts and articles
- `product` - Product descriptions
- `social` - Social media content

#### 2. Get Job Status

```http
GET /api/content/job/:jobId/status
Authorization: Bearer <access_token>
```

**Response (Pending/Processing):**

```json
{
  "success": true,
  "message": "Job status retrieved successfully",
  "data": {
    "jobId": "1",
    "status": "processing"
  },
  "statusCode": 200
}
```

**Response (Completed):**

```json
{
  "success": true,
  "message": "Job status retrieved successfully",
  "data": {
    "jobId": "1",
    "status": "completed",
    "content": {
      "id": "507f1f77bcf86cd799439011",
      "title": "Benefits of AI in Healthcare",
      "generatedText": "Artificial Intelligence (AI) is revolutionizing healthcare...",
      "contentType": "blog",
      "prompt": "Write a comprehensive blog post..."
    }
  },
  "statusCode": 200
}
```

**Response (Failed):**

```json
{
  "success": true,
  "message": "Job status retrieved successfully",
  "data": {
    "jobId": "1",
    "status": "failed",
    "failureReason": "AI service quota exceeded"
  },
  "statusCode": 200
}
```

#### 3. Get All User Content

```http
GET /api/content?page=1&limit=10&contentType=blog&status=draft
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `contentType` (optional) - Filter by type: blog, product, social
- `status` (optional) - Filter by status: draft, published

**Response:**

```json
{
  "success": true,
  "message": "Contents retrieved successfully",
  "data": {
    "contents": [
      {
        "id": "507f1f77bcf86cd799439011",
        "userId": "507f191e810c19729de860ea",
        "title": "Benefits of AI in Healthcare",
        "contentType": "blog",
        "prompt": "Write a comprehensive blog post...",
        "generatedText": "Artificial Intelligence...",
        "status": "draft",
        "jobId": "1",
        "generationStatus": "completed",
        "failureReason": null
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "totalPages": 3,
      "limit": 10
    }
  },
  "statusCode": 200
}
```

#### 4. Get Content by ID

```http
GET /api/content/:id
Authorization: Bearer <access_token>
```

#### 5. Update Content

```http
PUT /api/content/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "published"
}
```

#### 6. Delete Content

```http
DELETE /api/content/:id
Authorization: Bearer <access_token>
```

---

## Queue System & Worker Process

### How It Works

1. **Content Generation Request**
   - User submits content generation request via API
   - System creates a content record with status `pending`
   - Job is added to Redis queue with 1-minute delay

2. **Queue Processing**
   - After 1 minute, job becomes available
   - Worker process picks up the job
   - Worker updates content status to `processing`

3. **AI Generation**
   - Worker calls Google Gemini AI service
   - AI generates content based on the prompt
   - Quality validation checks the generated content

4. **Completion**
   - Worker updates content with generated text
   - Content status changes to `completed`
   - User can retrieve the content via API

### Job Status Flow

```
pending → processing → completed
                    ↘ failed
```

### Retry Logic

- **Attempts**: 3 attempts per job
- **Backoff**: Exponential backoff (2s, 4s, 8s)
- **Quality Validation**: Retries if content fails quality checks

---

## Development

### Available Scripts

From `apps/server/`:

```bash
# Development
pnpm run dev              # Start API server only
pnpm run worker:dev       # Start worker only
pnpm run dev:all          # Start both server and worker

# Production
pnpm run build            # Build TypeScript
pnpm run start            # Start API server (production)
pnpm run worker:prod      # Start worker (production)
pnpm run start:all        # Start both (production)

# Type Checking
pnpm run type-check       # Check TypeScript types
```

### Code Structure Best Practices

- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Models**: Define data schemas
- **Middleware**: Process requests before controllers
- **Exceptions**: Custom error handling
- **Utils**: Reusable utility functions

---

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

**Error:**

```
MongoDB connection failed. Error details: connect ECONNREFUSED
```

**Solutions:**

- Ensure MongoDB is running: `mongod` (local) or check MongoDB Atlas connection
- Verify `MONGO_URI` in `.env.local`
- Check network connectivity

#### 2. Redis Connection Failed

**Error:**

```
Error connecting to Redis: ECONNREFUSED
```

**Solutions:**

- Start Redis: `redis-server` (local) or check Redis Cloud connection
- Verify `REDIS_URL` in `.env.local`
- Check Redis is running: `redis-cli ping` (should return `PONG`)

#### 3. Google Gemini API Error

**Error:**

```
Invalid or missing Gemini API key
```

**Solutions:**

- Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Add to `.env.local`: `GOOGLE_AI_API_KEY=your-key-here`
- Ensure API key has proper permissions

#### 4. Worker Not Processing Jobs

**Solutions:**

- Ensure worker process is running: `pnpm run worker:dev`
- Check Redis connection
- Verify Bull queue configuration
- Check worker logs for errors

#### 5. JWT Token Errors

**Error:**

```
Invalid token
```

**Solutions:**

- Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` are set in `.env.local`
- Token may have expired (access tokens expire in 15 minutes)
- Use refresh token endpoint to get new access token

**Built with ❤️ using Node.js, Express, MongoDB, Redis, and Google Gemini AI**
