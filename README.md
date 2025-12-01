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
- [Real-time Updates with Socket.io](#real-time-updates-with-socketio)
- [Deployment](#deployment)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

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

- **Real-time Updates**
  - WebSocket connections via Socket.io
  - Live content generation status updates
  - Authenticated socket connections with JWT
  - Room-based user isolation
  - Redis Pub/Sub for multi-server scalability

### 🔧 Technical Features

- Custom exception handling with proper HTTP status codes
- Winston logger for structured logging
- Input validation with express-validator
- Graceful shutdown for worker processes
- MongoDB indexing for performance
- Environment-based configuration
- WebSocket authentication middleware
- Redis Pub/Sub for cross-process communication
- Comprehensive error handling at all layers

---

## Tech Stack

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Cache/Queue**: Redis + Bull
- **Real-time**: Socket.io (WebSocket)
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
│             │         │  (Express)   │         │  (Bull +    │
│             │◄────────┤  + Socket.io │         │   Pub/Sub)  │
│             │WebSocket│              │         │             │
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

#### 1. Content Generation Request (with Real-time Updates)

```
1. User connects to Socket.io server (wss://localhost:3000)
2. Socket authenticates user with JWT token
3. User joins their personal room (user:{userId})
4. User sends POST /api/content/generate
5. API validates request and authenticates user
6. Creates content record in MongoDB (status: pending)
7. Adds job to Redis queue with 1-minute delay
8. Returns 202 Accepted with jobId
9. Worker picks up job after 1 minute
10. Worker emits "generation started" event → Redis Pub/Sub → Socket.io
11. Client receives real-time update: status = "processing"
12. Worker calls Gemini AI to generate content
13. Worker emits "generation completed" event → Redis Pub/Sub → Socket.io
14. Client receives real-time update with generated content
15. Content is displayed immediately without polling
```

**Note**: Users can still poll GET /api/content/job/:jobId/status if not using Socket.io.

---

## Project Structure

```
ai-content-generator/
├── apps/
│   ├── server/                    # Backend API server
│   │   ├── src/
│   │   │   ├── config/            # Configuration files
│   │   │   │   ├── ai.ts          # Google Gemini AI config
│   │   │   │   ├── database.ts    # MongoDB connection
│   │   │   │   ├── env.ts         # Environment variables
│   │   │   │   ├── queue.ts       # Bull queue setup
│   │   │   │   ├── redis.ts       # Redis client config
│   │   │   │   ├── socket.ts      # Socket.io configuration
│   │   │   │   └── server.ts      # Server configuration
│   │   │   │
│   │   │   ├── controllers/       # Route controllers
│   │   │   │   ├── auth_controller.ts
│   │   │   │   └── content_controller.ts
│   │   │   │
│   │   │   ├── exceptions/        # Custom exceptions
│   │   │   │   ├── base_exception.ts
│   │   │   │   ├── http_exceptions.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── jobs/              # Queue job processors
│   │   │   │   └── content_generation_processor.ts
│   │   │   │
│   │   │   ├── middleware/        # Express middleware
│   │   │   │   ├── api_logging.ts
│   │   │   │   ├── auth.ts
│   │   │   │   ├── socket_auth.ts
│   │   │   │   ├── error_handler.ts
│   │   │   │   ├── query_manager.ts
│   │   │   │   └── validation.ts
│   │   │   │
│   │   │   ├── models/            # Mongoose models
│   │   │   │   ├── content_model.ts
│   │   │   │   ├── user_model.ts
│   │   │   │   ├── refresh_token_model.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── routes/            # API routes
│   │   │   │   ├── auth_routes.ts
│   │   │   │   ├── content_routes.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── services/          # Business logic
│   │   │   │   ├── ai_service.ts
│   │   │   │   ├── auth_service.ts
│   │   │   │   ├── content_service.ts
│   │   │   │   ├── queue_service.ts
│   │   │   │   ├── socket_service.ts
│   │   │   │   └── pubsub_service.ts
│   │   │   │
│   │   │   ├── types/             # TypeScript interfaces
│   │   │   │   ├── content_interfaces.ts
│   │   │   │   ├── queue_interfaces.ts
│   │   │   │   └── response_interfaces.ts
│   │   │   │
│   │   │   ├── utils/             # Utility functions
│   │   │   │   ├── ai_prompts.ts
│   │   │   │   ├── constants.ts
│   │   │   │   ├── logger.ts
│   │   │   │   ├── messages.ts
│   │   │   │   └── response.ts
│   │   │   │
│   │   │   ├── index.ts           # API server entry point
│   │   │   └── worker.ts          # Worker process entry point
│   │   │
│   │   ├── .env.example           # Environment variables template
│   │   ├── .env.local             # Local environment variables
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                       # Frontend React application
│       ├── src/
│       │   ├── api/               # API client & services
│       │   │   ├── client.ts      # Axios instance with interceptors
│       │   │   ├── auth.api.ts    # Authentication API calls
│       │   │   └── content.api.ts # Content API calls
│       │   │
│       │   ├── components/        # Reusable components
│       │   │   ├── Layout.tsx     # Main layout with header
│       │   │   ├── Loader.tsx     # Loading spinner
│       │   │   ├── StatusBadge.tsx # Status indicator badges
│       │   │   ├── Button.tsx     # Reusable button
│       │   │   ├── ErrorMessage.tsx # Error display
│       │   │   ├── BackButton.tsx # Navigation back button
│       │   │   ├── EmptyState.tsx # Empty state component
│       │   │   └── index.ts       # Barrel exports
│       │   │
│       │   ├── contexts/          # React Context providers
│       │   │   └── AuthContext.tsx # Authentication context
│       │   │
│       │   ├── hooks/             # Custom React hooks
│       │   │   └── useJobStatus.ts # Job status polling hook
│       │   │
│       │   ├── pages/             # Page components
│       │   │   ├── Login.tsx      # Login page
│       │   │   ├── Register.tsx   # Registration page
│       │   │   ├── ContentList.tsx # Content list page
│       │   │   ├── ContentCreate.tsx # Content creation page
│       │   │   └── ContentDetail.tsx # Content detail page
│       │   │
│       │   ├── types/             # TypeScript types
│       │   │   ├── auth.types.ts  # Auth-related types
│       │   │   ├── content.types.ts # Content-related types
│       │   │   └── api.types.ts   # API response types
│       │   │
│       │   ├── utils/             # Utility functions
│       │   │   └── storage.ts     # localStorage helpers
│       │   │
│       │   ├── App.tsx            # Root component with routing
│       │   ├── main.tsx           # Application entry point
│       │   ├── index.css          # Global styles & Tailwind
│       │   └── vite-env.d.ts      # Vite environment types
│       │
│       ├── public/                # Static assets
│       ├── .env.example           # Environment variables template
│       ├── .env.local             # Local environment variables
│       ├── index.html             # HTML template
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts         # Vite configuration
│       ├── tailwind.config.js     # TailwindCSS configuration
│       └── postcss.config.js      # PostCSS configuration
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
[0] Server running on http://localhost:3000
[0] Environment: development
[1] Worker process starting...
[1] Content generation processor registered
[1] Worker is now listening for jobs...
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

## Real-time Updates with Socket.io

### Overview

The application uses **Socket.io** for real-time bidirectional communication between the server and clients. This enables instant updates during content generation without polling.

### Architecture

- **Socket.io Server**: Runs alongside the Express HTTP server
- **Authentication**: JWT-based socket authentication middleware
- **User Rooms**: Each user joins a private room (`user:{userId}`)
- **Pub/Sub**: Redis Pub/Sub for multi-server scalability
- **Events**: Real-time content generation status updates

### Socket Events

#### Client → Server Events

| Event        | Description                         |
| ------------ | ----------------------------------- |
| `connection` | Client connects to Socket.io server |

#### Server → Client Events

| Event                          | Description                               | Payload                                                                      |
| ------------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------- |
| `content:generation:started`   | Content generation has started            | `{ contentId, jobId, status, timestamp }`                                    |
| `content:generation:completed` | Content generation completed successfully | `{ contentId, jobId, status, title, contentType, generatedText, timestamp }` |
| `content:generation:failed`    | Content generation failed                 | `{ contentId, jobId, status, failureReason, timestamp }`                     |

### Connection Example

#### JavaScript/TypeScript (Frontend)

```typescript
import { io, Socket } from 'socket.io-client';

// Get access token from localStorage or auth context
const accessToken = localStorage.getItem('access_token');

// Connect to Socket.io server
const socket: Socket = io('http://localhost:3000', {
  auth: {
    token: accessToken, // JWT token for authentication
  },
  transports: ['websocket', 'polling'],
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to Socket.io server');
  console.log('Socket ID:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});

// Listen for content generation events
socket.on('content:generation:started', (data) => {
  console.log('Generation started:', data);
  // Update UI: show "Processing..." status
});

socket.on('content:generation:completed', (data) => {
  console.log('Generation completed:', data);
  // Update UI: display generated content
  // data contains: contentId, jobId, title, generatedText, etc.
});

socket.on('content:generation:failed', (data) => {
  console.error('Generation failed:', data);
  // Update UI: show error message
  // data contains: contentId, jobId, failureReason
});

// Clean up on unmount
function cleanup() {
  socket.disconnect();
}
```

### Authentication

Socket connections are authenticated using JWT tokens:

1. Client sends JWT access token in the `auth` object during connection
2. Server validates the token using the same JWT secret
3. If valid, user data is attached to the socket
4. User is automatically joined to their private room: `user:{userId}`
5. Only authenticated users receive events

**Authentication Middleware** (`socket_auth.ts`):

```typescript
// Server-side implementation
socket.use(socketAuthMiddleware);
// Validates JWT and attaches user data to socket.user
```

### Redis Pub/Sub Integration

The system uses Redis Pub/Sub to enable real-time updates across multiple server instances:

**Flow:**

```
Worker Process → Redis Pub/Sub → API Server(s) → Socket.io → Client(s)
```

**Channels:**

- `content:generation:started`
- `content:generation:completed`
- `content:generation:failed`

This architecture allows horizontal scaling with multiple API server instances while maintaining real-time functionality.

### Example Use Case

**Scenario**: User queues a blog post generation

1. **User submits request**:

   ```typescript
   const response = await fetch('/api/content/generate', {
     method: 'POST',
     headers: {
       Authorization: `Bearer ${accessToken}`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       title: 'Benefits of AI',
       contentType: 'blog',
       prompt: 'Write about AI benefits',
     }),
   });

   const { jobId } = await response.json();
   ```

2. **After 1 minute, worker starts processing**:

   ```typescript
   // Client receives via Socket.io:
   socket.on('content:generation:started', (data) => {
     // { contentId: '...', jobId: '1', status: 'processing', timestamp: ... }
     setStatus('Generating your content...');
   });
   ```

3. **When AI generation completes**:
   ```typescript
   socket.on('content:generation:completed', (data) => {
     // {
     //   contentId: '...',
     //   jobId: '1',
     //   status: 'completed',
     //   title: 'Benefits of AI',
     //   contentType: 'blog',
     //   generatedText: 'Artificial Intelligence...',
     //   timestamp: ...
     // }
     displayContent(data.generatedText);
   });
   ```

### Environment Configuration

Socket.io configuration is already included in the server setup. No additional environment variables are required.

**CORS Configuration** (`config/socket.ts`):

```typescript
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});
```

### Benefits

**No Polling**: Eliminates the need for repeated API calls
**Instant Updates**: Users see generation progress in real-time
**Scalable**: Redis Pub/Sub enables multi-server deployments
**Secure**: JWT-based authentication for socket connections
**Efficient**: WebSocket connections use less bandwidth than HTTP polling

---

## Deployment

### Live Application

The application is deployed on **[Render](https://render.com)** with the following services:

| Service             | Live URL                                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Web Application** | [https://ai-content-generator-web.onrender.com](https://ai-content-generator-web.onrender.com)                 |
| **API Server**      | [https://ai-content-generator-server-xou3.onrender.com](https://ai-content-generator-server-xou3.onrender.com) |
| **Worker Process**  | [https://ai-content-generator-worker.onrender.com](https://ai-content-generator-worker.onrender.com)           |

### Deployment Stack

- **Frontend**: Static Site (React + Vite)
- **Backend**: Web Service (Node.js + Express + Socket.io)
- **Worker**: Background Worker (Bull Queue processor)
- **Redis**: Managed Redis instance for queue and Pub/Sub
- **Database**: MongoDB Atlas (external)

### Notes

**Free Tier**: Services may spin down after 15 minutes of inactivity (30-50 second cold starts)

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

#### 6. Socket.io Connection Issues

**Error:**

```
WebSocket connection failed
```

**Solutions:**

- Ensure the server is running with Socket.io initialized
- Check that JWT token is being sent in `auth` object during connection
- Verify CORS settings in `config/socket.ts` include your client URL
- Check browser console for specific Socket.io error messages
- Ensure Redis is running (required for Pub/Sub)
- Try switching transport: `transports: ['polling', 'websocket']`

#### 7. Real-time Updates Not Received

**Solutions:**

- Verify Socket.io connection is established (`socket.connected === true`)
- Check that worker process is running (`pnpm run worker:dev`)
- Ensure Redis Pub/Sub is initialized in both API server and worker
- Check server logs for Pub/Sub events being published
- Verify user is authenticated and joined to their room

---

**Developed using Node.js, Express, MongoDB, Redis, Socket.io, and Google Gemini AI**
