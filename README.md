# NestJS Microservices with Apache Kafka

Build a small event-driven system composed of two NestJS microservices that communicate asynchronously over Apache Kafka. The goal of this task is to evaluate your understanding of event-driven architecture, clean NestJS module structure, and Kafka integration — not production-level polish.

## Scenario: Order Processing System

You will build two services that together process customer orders:

- **Orders Service** — exposes a REST API and acts as a Kafka producer/consumer.
- **Inventory Service** — consumes order events, checks stock, and emits result events.

## Event Flow

1. Client calls `POST /orders` on the Orders Service. The order is saved with status `PENDING` and an `order.created` event is published to Kafka.
2. Inventory Service consumes `order.created`, checks stock for the requested items, and publishes either `order.confirmed` or `order.failed`.
3. Orders Service consumes the result event and updates the order status to `CONFIRMED` or `FAILED`.
4. Client can call `GET /orders/:id` at any time to read the current status.

## Service 1 — Orders Service

REST API + Kafka producer and consumer.

- `POST /orders` — validate the request body with class-validator, persist the order, publish `order.created`.
- `GET /orders/:id` — return the order with its current status.
- Order status lifecycle: `PENDING` → `CONFIRMED` or `PENDING` → `FAILED`.
- Consume `order.confirmed` / `order.failed` and update the stored order accordingly.

## Service 2 — Inventory Service

Kafka consumer + producer (no public REST API required).

- Consume `order.created`.
- Check stock for the requested items (stock can be seeded or mocked in the database).
- Publish `order.confirmed` if all items are in stock, otherwise `order.failed`.

## Core Requirements

- Use NestJS microservice transport via `@nestjs/microservices` with the Kafka transport — not raw kafkajs wired by hand.
- Provide a working `docker-compose.yml` that spins up Kafka, both services, and the database.
- Use a real database (PostgreSQL preferred) with a simple schema or migration.
- Validate all incoming DTOs and handle errors gracefully, including consumer failures.
- Read broker URLs, DB connection, and similar values from environment variables — nothing hardcoded.
- Keep clean module structure: separate controllers, services, and event handlers.
- Include a short README explaining how to run the project and describing the event flow.

## Bonus (Optional — Signals Seniority)

Not required, but a plus if time allows:

- [ ] Consumer retry and/or dead-letter handling (I add retries using kafka build-in feature).
- [x] Idempotent consumers that safely handle duplicate events. (I don't know if we need to create specific service for it, for now i use db to check existing events)
- [x] A correlation / trace ID propagated through the events.
- [x] A basic unit test covering the order status transition logic.
