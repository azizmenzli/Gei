# Project Architecture & Technical Documentation

## Overview

This document describes the architecture, technology stack, and design decisions for our new B2B e-commerce platform. Our goals are:

- **High Performance and Scalability:**  
  Achieve fast data retrieval, quick page loads, and support for increasing traffic volumes.

- **SEO-Friendly Frontend:**  
  Ensure search engines can easily crawl and index content by leveraging Server-Side Rendering (SSR) with Next.js.

- **Maintainable and Modular Codebase:**  
  Utilize best-in-class frameworks, typed schemas, and modular architecture to ensure long-term maintainability and scalability.

## Technology Stack

### Backend

- **NestJS:** A progressive Node.js framework with strong modular architecture and TypeScript support.
- **Prisma:** A type-safe ORM for seamless database interaction and auto-generated TypeScript types.
- **PostgreSQL:** A robust, SQL-compliant relational database for persistent data storage.
- **Redis:** An in-memory data store for caching frequently accessed data, improving read performance.
- **Apollo Server (NestJS Integration):** For GraphQL queries (read operations), allowing flexible and efficient data fetching.
- **REST Endpoints (NestJS Controllers):** For write operations (create/update/delete), maintaining simplicity.

**Key Backend Libraries & Modules**:
- **@nestjs/graphql:** Integration with Apollo Server for GraphQL.
- **@nestjs/passport & passport-jwt:** For JWT-based authentication and authorization.
- **class-validator & class-transformer:** For input validation and data transformation in REST endpoints.
- **NestJS Config Module:** For environment-based configuration management.
- **Swagger (via @nestjs/swagger):** For automatic REST API documentation generation.
- **Passport:** To manage authentication strategies, including JWT and potential RBAC.
- **Chart.js (via CDN or Node package) for data visualization (optional in backend for reporting APIs)**

### Frontend

- **Next.js:** A React-based framework enabling SSR and SSG for improved initial load times, SEO benefits, and dynamic routing.
- **React:** The UI library for building dynamic, component-based interfaces.
- **Apollo Client (optional for GraphQL Reads):** If the frontend queries GraphQL directly from the browser, Apollo Client can manage requests and caching.
- **TypeScript:** Ensures type safety and better developer productivity.
- **Tailwind CSS:** A utility-first CSS framework for rapid, responsive design.
- **Ant Design (antd) Components:** Pre-built, themeable UI components for building consistent and user-friendly UIs.
- **Chart.js (CDN or local)**: For rendering interactive charts and graphs on the frontend.
- **Cloudinary or self-hosted Nextcloud:** For media storage and delivery (images, videos). Cloudinary offers CDN-like performance; Nextcloud can be self-hosted for more control.

**Key Frontend Libraries**:
- **axios or fetch:** For calling REST endpoints for writes if needed.
- **SWR or React Query (optional):** For client-side data fetching and caching if we complement SSR with client-side updates.
- **Styled Components or Tailwind CSS (chosen: Tailwind)**: For styling. Using Tailwind plus Ant Design for a comprehensive design system.

## API Layers

- **GraphQL (Read Operations):**  
  Allows clients (Next.js SSR processes) to fetch exactly the required data. Reduces over-fetching and improves performance.

- **REST (Write Operations):**  
  Retains simplicity for mutations (create, update, delete). REST endpoints are easy to document with Swagger and integrate with existing tooling.

## Architectural Diagram



             ┌─────────────────────┐
             │       Frontend      │
             │       Next.js       │
             │     (SSR/SSG + UI)  │
             └───────┬────────────┘
                     │
                     ▼ (GraphQL & REST requests)
             ┌─────────────────────┐
             │       Backend       │
             │       NestJS        │
             │ (Apollo & REST APIs)│
             │ Swagger for Docs    │
             └───────┬─────┬──────┘
                     │     │
                     │     │ (Cache checks)
                     │     ▼
              ┌──────┴─────┐
              │    Redis    │   <--- In-memory cache for quick reads
              │    Cache    │
              └──────┬─────┘
                     │ (On cache miss)
                     ▼
    ┌───────────────────────┐        ┌───────────┐
    │      PostgreSQL       │<-----> │  Prisma   │
    │      Database         │        │  Client   │
    └───────────────────────┘        └───────────┘




   


**Flow Explanation**:
- The frontend (Next.js) requests data via GraphQL from NestJS.
- NestJS checks Redis for cached results (fast retrieval on cache hits).
- On cache miss, NestJS uses Prisma to query PostgreSQL, caches the result in Redis, and returns the data.
- For write operations, the frontend calls NestJS REST endpoints, which update the database and invalidate/update Redis cache entries as needed.

## Data Flow

### Read Operations (GraphQL):

1. Next.js SSR requests data from the GraphQL endpoint in NestJS.
2. NestJS checks Redis. On a hit, it returns cached data instantly.
3. On a miss, NestJS queries PostgreSQL via Prisma.
4. Results are cached in Redis and returned to Next.js. Next.js then renders a fully formed HTML page, aiding SEO and performance.

### Write Operations (REST):

1. The frontend calls REST endpoints for create/update/delete actions.
2. NestJS updates the PostgreSQL database using Prisma.
3. After a write, NestJS invalidates or updates related Redis cache entries to keep reads consistent.
4. Subsequent reads see updated data from cache or re-fetch from the database.

## Key Benefits

- **Performance:**  
  Redis caching, SSR, and optional Dataloader usage ensure fast page loads and efficient data retrieval.
  
- **Scalability:**  
  Horizontal scaling with multiple NestJS instances behind a load balancer. Redis as a central cache. Kubernetes for orchestration and scaling containerized services.

- **SEO Optimization:**  
  SSR from Next.js ensures search engines index pre-rendered HTML.

- **Maintainability:**  
  Clear separation of GraphQL (reads) and REST (writes), plus a shared service layer in NestJS avoids logic duplication. Swagger docs help maintain API clarity.

- **Type Safety & Productivity:**  
  TypeScript throughout ensures a consistent, predictable codebase, reducing runtime errors and improving developer experience.

## Security & Authentication

- **JWT-based Authentication:**  
  Using `@nestjs/passport` and `passport-jwt` for secure token-based authentication. On login, JWT issued to client (e.g., HttpOnly cookie). Subsequent requests include JWT for server-side verification.

- **Authorization & RBAC:**  
  NestJS guards and Passport strategies enforce role-based access control. GraphQL resolvers and REST handlers check roles/permissions before returning or modifying data.

- **Validation & Sanitization:**  
  `class-validator` and `class-transformer` ensure input data integrity, preventing injection attacks and improving API robustness.

## DevOps & CI/CD

- **Containerization with Docker:**  
  Both backend (NestJS) and frontend (Next.js) are packaged into Docker images, ensuring environment consistency.
  
- **Kubernetes for Orchestration:**  
  Deploy containers to a Kubernetes cluster for easy scaling, rolling updates, and resilience.
  
- **CI/CD with GitHub Actions:**  
  - Automated tests, linting, and type checks run on every commit.
  - On successful builds, changes are deployed to staging, then production after approval.
  
- **Monitoring & Logging:**
  - **Portainer:** For managing Docker containers and images, providing a UI to handle container lifecycle.
  - **Grafana + Prometheus/ELK Stack:** Monitor application metrics, logs, and performance. Grafana visualizes metrics, Prometheus scrapes metrics, and the ELK stack (Elasticsearch, Logstash, Kibana) can handle logs.
  
- **Analytics & User Behavior Insights:**
  - For website traffic analysis and user interaction insights, integrate free or open-source tools:
    - **Matomo (self-hosted)** or **Plausible Analytics**: Privacy-friendly analytics for tracking visitors, page views, and conversions.
    - **Hotjar (limited free)** or **Microsoft Clarity (free)**: For heatmaps, session recordings, and user behavior insights to identify main focus areas of the website.
  
- **Caching Strategy in CI/CD:**
  - On schema or model changes, run Prisma migrations before restarting containers.
  - Flush or selectively invalidate Redis cache to prevent stale data post-deployment.

## Media Handling

- **Cloudinary or Nextcloud:**
  - Cloudinary for CDN-like performance and on-the-fly image transformations.
  - Nextcloud if self-hosting media is preferred for compliance or cost reasons.
  - Either integrated with the backend APIs, ensuring product images or user-uploaded media can be served quickly and reliably.

## Conclusion

This architecture combining NestJS, Next.js, Prisma, Redis, and PostgreSQL—delivers a high-performance, SEO-friendly B2B e-commerce platform. With Tailwind CSS, Ant Design components, and Chart.js, we provide a rich, interactive frontend experience. Authentication and authorization via JWT and Passport ensure secure access. Swagger improves API documentation clarity. Docker and Kubernetes enhance scalability and reliability, while GitHub Actions streamline CI/CD. Monitoring with Portainer, Grafana, and privacy-friendly analytics tools give actionable insights into system health and user behavior, driving continuous improvements and a robust future-proof platform.

