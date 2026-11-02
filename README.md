<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=180&section=header&text=Blood%20Donation%20API&fontSize=34&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Emergency%20Medical%20Service%20Platform%20Backend&descSize=15&descColor=38bdf8" width="100%" />
</div>

<div align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Stripe-626CD9?style=flat&logo=stripe&logoColor=white" />
</div>

---

### 🌐 Quick Links & Live Demos

- **Live API Deployment:** [Access Live Service](https://blood-donation-emergency-platform-eosin.vercel.app)
- **API Documentation (Postman):** [View Postman Docs](https://documenter.getpostman.com/view/55173835/2sBYHQ2NT6)
- **GitHub Repository:** [Client/Server Repo](https://github.com/abdulalimax/Blood-Donation-Emergency-Platform)

---

### 📋 Project Overview

The **Blood Donation & Emergency Service Platform** is a robust backend API service engineered to bridge the critical gap between blood donors and emergency medical recipients. This platform automates donor matching, enables real-time location and blood group filtering, handles emergency request dispatches, and provides secure payment logistics support.

---

### ✨ Key Features & Functionality

- **Role-Based Access Control (RBAC):** Secure authorization workflows for Donors, Recipients, and Administrators using JSON Web Tokens (JWT).
- **Advanced Search & Filtering:** Dynamic querying capabilities to filter active blood donors by blood group, availability status, and district location.
- **Emergency Dispatch Workflow:** Seamless creation, tracking, and management of urgent blood requests with immediate donor response coordination.
- **Integrated Payment Gateway:** Secure payment processing via Stripe for handling emergency medical delivery logistics.
- **Strict Validation & Security:** Robust input validation with Zod schemas, secure password hashing (bcrypt), and parameterized relational queries via Prisma ORM.

---

### 🛠️ Technology Stack & Architecture

- **Language & Runtime:** TypeScript, Node.js[cite: 10]
- **Framework:** Express.js[cite: 10]
- **Database & ORM:** PostgreSQL, Prisma ORM[cite: 10]
- **Payment Gateway:** Stripe API[cite: 10]
- **Security & Validation:** JWT, Bcrypt, Zod
- **Deployment Platform:** Vercel

---

### 📂 Clean Folder Structure

```text
blood-donation-backend/
├── prisma/
│   └── schema.db
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.ts
├── .env.example
├── package.json
└── tsconfig.json
⚙️ Environment Setup & Installation Guide
To run this backend service locally, follow these steps:

Clone the repository:

Bash
git clone [https://github.com/abdulalimax/Blood-Donation-Emergency-Platform.git](https://github.com/abdulalimax/Blood-Donation-Emergency-Platform.git)
cd Blood-Donation-Emergency-Platform
Install dependencies:

Bash
npm install
Configure environment variables:
Create a .env file in the root directory and add the following keys:

Code snippet
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your_jwt_secret_key"
STRIPE_SECRET_KEY="your_stripe_secret_key"
Run database migrations:

Bash
npx prisma migrate dev
Start the development server:

Bash
npm run dev
