# Charity Backend API

<p align="center">
  <a href="http://nestjs.com/" target="_blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A robust and scalable backend API for the Charity application, built with NestJS.</p>

## Table of Contents

*   [Project Overview](#project-overview)
*   [Features](#features)
*   [Technologies Used](#technologies-used)
*   [Prerequisites](#prerequisites)
*   [Installation and Setup](#installation-and-setup)
*   [Running the Application](#running-the-application)
*   [Running Tests](#running-tests)
*   [API Documentation](#api-documentation)
*   [Deployment](#deployment)
*   [Support](#support)
*   [License](#license)

## Project Overview

This project serves as the backend API for a charity application, providing all necessary endpoints for managing users, campaigns, donations, and other related functionalities. It's built using the NestJS framework, ensuring a modular, scalable, and maintainable architecture.

## Features

*   **User Management:** User registration, authentication (JWT, OAuth), and profile management.
*   **Campaign Management:** Create, read, update, and delete charity campaigns.
*   **Donation System:** Process and track donations.
*   **KYC (Know Your Customer):** Implementation of KYC features for users.
*   **Badge System:** Awarding and managing user badges based on activity.
*   **Comment System:** Functionality for users to comment on campaigns or posts.
*   **Notification System:** Real-time notifications for various events.
*   **Email Services:** Sending transactional emails (e.g., verification, password reset).
*   **Image and Audio Uploads:** Handling media uploads for campaigns and user profiles.
*   **AI Integration:** (Potentially) AI-powered features for content generation or moderation.
*   **Admin Dashboard:** Endpoints for administrative tasks and analytics.

## Technologies Used

*   **Framework:** [NestJS](https://nestjs.com/) (Node.js)
*   **Database:** [PostgreSQL](https://www.postgresql.org/) (via Prisma ORM)
*   **ORM:** [Prisma](https://www.prisma.io/)
*   **Authentication:** JWT, Passport.js (Local, Google, Facebook, GitHub strategies)
*   **Real-time Communication:** WebSockets (Socket.IO)
*   **Caching:** Redis (via Cache Manager)
*   **Email:** Nodemailer, Handlebars (for templates)
*   **Cloud Storage:** Cloudinary (for image/audio uploads)
*   **AI:** Google GenAI, OpenAI
*   **Validation:** Class-validator, Class-transformer
*   **Dependency Management:** npm
*   **Containerization:** Docker

## Prerequisites

Before you begin, ensure you have the following installed on your system:

*   [Node.js](https://nodejs.org/en/download/) (LTS version recommended)
*   [npm](https://www.npmjs.com/get-npm) (comes with Node.js)
*   [Docker](https://www.docker.com/get-started)
*   [Docker Compose](https://docs.docker.com/compose/install/)
*   [PostgreSQL](https://www.postgresql.org/download/) (or use Docker for the database)

## Installation and Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/charity-backend.git
    cd charity-backend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the root of the project and add your environment variables. A `.env.example` file might be provided as a guide. Key variables typically include:

    *   `DATABASE_URL` (for PostgreSQL connection string)
    *   `JWT_SECRET`
    *   `REDIS_HOST`, `REDIS_PORT`
    *   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
    *   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
    *   `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`
    *   `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
    *   `MAILER_EMAIL`, `MAILER_PASSWORD`
    *   `GEMINI_API_KEY`
    *   `OPENAI_API_KEY`

4.  **Database Setup (using Docker Compose for convenience):**

    You can use Docker Compose to spin up a PostgreSQL and Redis instance:

    ```bash
    docker-compose up -d postgres redis
    ```

    *Ensure your `DATABASE_URL` in `.env` points to the Dockerized PostgreSQL instance (e.g., `postgresql://user:password@localhost:5432/database`).*

5.  **Run Prisma Migrations:**

    Generate Prisma client and apply migrations to your database:

    ```bash
    npm run prisma:generate
    npx prisma migrate dev --name init
    ```
    *(Note: `init` can be replaced with a descriptive name for your initial migration)*

## Running the Application

*   **Development Mode (with watch):**

    ```bash
    npm run start:dev
    ```

*   **Production Mode:**

    ```bash
    npm run start:prod
    ```

*   **Debug Mode:**

    ```bash
    npm run start:debug
    ```

The application will typically run on `http://localhost:3000` (or the port specified in your environment variables).

## Running Tests

*   **Unit Tests:**

    ```bash
    npm run test
    ```

*   **End-to-End Tests:**

    ```bash
    npm run test:e2e
    ```

*   **Test Coverage:**

    ```bash
    npm run test:cov
    ```

## API Documentation

API documentation will be available (e.g., via Swagger/OpenAPI) once the application is running, typically at `http://localhost:3000/api` or a similar path, depending on the configuration.

## Deployment

For deployment, you can build the application and run the production bundle:

```bash
npm run build
node dist/main
```

Consider using Docker for production deployments. A `Dockerfile` is provided in the project root.

To build the Docker image:

```bash
npm run docker:build
```

Refer to the [NestJS Deployment documentation](https://docs.nestjs.com/deployment) for more advanced deployment strategies.

## Support

For questions, issues, or contributions, please refer to the project's GitHub repository.

## License

This project is [UNLICENSED](LICENSE). Please refer to the `LICENSE` file for more details.