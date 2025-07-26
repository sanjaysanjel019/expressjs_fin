# Finance App Backend

This is the backend for a personal finance management application, built with Node.js, Express, and TypeScript. It provides a RESTful API for managing users, transactions, and generating financial reports.

## Features

*   **User Authentication**: Secure user registration with password hashing using `bcrypt`.
*   **Transaction Management**: CRUD operations for income and expense transactions.
*   **Recurring Transactions**: Support for daily, weekly, monthly, and yearly recurring transactions.
*   **Categorization**: Organize transactions into categories.
*   **Reporting**: Automated monthly financial report settings for users.
*   **Type-Safe**: Written entirely in TypeScript with a strict configuration.
*   **Validation**: Robust request validation using Zod.
*   **Scalable Structure**: Well-organized project structure for easy maintenance and scalability.

## Tech Stack

*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Language**: TypeScript
*   **Database**: MongoDB
*   **ODM**: Mongoose
*   **Validation**: Zod
*   **Environment Variables**: dotenv

## Prerequisites

Before you begin, ensure you have the following installed:
*   Node.js (v18.x or later recommended)
*   npm or yarn
*   A running MongoDB instance (local or cloud-hosted like MongoDB Atlas)

## Installation

1.  Clone the repository:
    ```bash
    git clone <your-repository-url>
    cd finance_app/backend
    ```

2.  Install the dependencies:
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

## Configuration

Create a `.env` file in the root of the `backend` directory. You can copy the example file to get started:

```bash
cp .env.example .env
```

Then, fill in the necessary environment variables in your new `.env` file.

#### `.env.example`
```env
# Server Configuration
PORT=5000
BASE_PATH=/api/v1

# Database
DATABASE_URL=mongodb://localhost:27017/finance_app

# Frontend
FRONTEND_ORIGIN=http://localhost:3000

# JWT Secrets (for future implementation)
# JWT_SECRET=your_super_secret_key
# JWT_EXPIRES_IN=1d
```

### Environment Variables

*   `PORT`: The port on which the server will run.
*   `BASE_PATH`: The base path for all API routes (e.g., `/api/v1`).
*   `DATABASE_URL`: The connection string for your MongoDB database.
*   `FRONTEND_ORIGIN`: The URL of your frontend application for CORS configuration.

## Running the Application

1.  To start the server in development mode with hot-reloading (using `ts-node-dev`):
    ```bash
    npm run dev
    ```

2.  To build the project for production:
    ```bash
    npm run build
    ```

3.  To start the built server in production:
    ```bash
    npm start
    ```

The server will be running at `http://localhost:<PORT>`.

> **Note**: Make sure you have the necessary scripts in your `package.json`:
> ```json
> "scripts": {
>   "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
>   "build": "tsc",
>   "start": "node dist/index.js"
> }
> ```

## API Endpoints

All endpoints are prefixed with the `BASE_PATH` (e.g., `/api/v1`).

### Authentication

*   `POST /auth/register`: Register a new user.
    *   **Request Body**:
        ```json
        {
          "name": "John Doe",
          "email": "john.doe@example.com",
          "password": "password123"
        }
        ```
    *   **Response (201 Created)**:
        ```json
        {
          "message": "User registered successfully",
          "data": {
            "user": {
              "name": "John Doe",
              "email": "john.doe@example.com",
              "profilePicture": null,
              "_id": "...",
              "createdAt": "...",
              "updatedAt": "..."
            }
          }
        }
        ```

*   `POST /auth/login`: (To be implemented)

## Project Structure

The project follows a modular structure for better organization and scalability.

```
src/
├── config/         # Environment variables, database connection, etc.
├── controllers/    # Express controllers for handling requests.
├── enums/          # Application-wide enums.
├── middlewares/    # Custom Express middlewares (error handling, async wrapper).
├── models/         # Mongoose models and schemas.
├── routes/         # Express route definitions.
├── services/       # Business logic and database interactions.
├── utils/          # Utility functions (error classes, helpers).
├── validators/     # Zod validation schemas.
└── index.ts        # Main application entry point.
```

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

