# Microservices Using .NET Core

## What it is
A loosely coupled .NET Core system that practices clean architecture across separate services, with an API gateway and mixed persistence.

## Stack
.NET Core, Entity Framework Core, RabbitMQ, gRPC, Redis, PostgreSQL, MongoDB, SQL Server, Ocelot gateway, Docker Compose.

## What it shows
- Service boundaries under a BuildingBlocks and Services layout.
- Ocelot as the entry gateway in front of the services.
- RabbitMQ for async messaging and gRPC for service-to-service calls.
- Polyglot persistence: PostgreSQL, MongoDB, SQL Server, plus Redis as cache.
- Docker Compose so the services and stores can run together.

## Why it matters
This is the early systems work that later showed up in the TCS and Hexagon integration platforms: contracts between services, failure handling, and a gateway instead of one shared database.
