# Blood Donation & Emergency Logistics Platform - Backend API

A secure, scalable RESTful backend service built for managing emergency blood donations, donor-recipient logistics matching, and integrated payments.

## ?? Live Deployment & API Resources
- Live Server URL: https://blood-donation-emergency-platform-eosin.vercel.app
- Postman API Documentation: https://documenter.getpostman.com/view/55173835/2sBYHQ2NT6
- GitHub Repository: https://github.com/abdulalimax/Blood-Donation-Emergency-Platform

## ??? Technology Stack
- Runtime & Framework: Node.js, Express.js
- Language: TypeScript
- ORM: Prisma ORM
- Database: PostgreSQL
- Authentication: JWT, bcrypt, Google OAuth
- Payment Processing: Stripe Checkout Session API
- Deployment: Vercel (Serverless Functions)

## ?? Core Features
1. Role-based Authentication (DONOR, RECIPIENT, ADMIN) & JWT tokens.
2. Filter & Query blood donors by blood group and city.
3. Manage emergency blood donation requests.
4. Stripe Hosted Checkout session creation & logistics verification.

## ?? Environment Variables
Ensure the following variables are in .env and Vercel Project Settings:
- PORT=5000
- DATABASE_URL="your_database_url"
- JWT_SECRET="your_jwt_secret"
- JWT_EXPIRES_IN="7d"
- STRIPE_SECRET_KEY="sk_test_..."
