# Realtime Commerce Platform

## Overview

This project started as an earlier Node.js commerce codebase and was rebuilt into a much more complete end-to-end platform. Instead of stopping at a basic shopping cart flow, I expanded it into a realistic marketplace-style system with separate customer and admin experiences, service separation, asynchronous workflows, search, recommendations, and fulfillment.

The goal was to build something that felt closer to a real platform than a classroom demo: customers can browse inventory, filter products, manage cart and profile data, place orders, and track fulfillment, while admins and sellers can work with product, warehouse, and operational views.

## What I Built

- Customer and admin applications using `Next.js`
- A core `Node.js` and `Express` application for platform logic
- An Express Gateway entry point
- Service-oriented domains for catalog, cart, orders, and search
- A GraphQL BFF for frontend aggregation
- A FastAPI recommendation service
- A `.NET` fulfillment service
- Background worker processing for order and fulfillment flows
- Supporting infrastructure with `MySQL`, `Redis`, `RabbitMQ`, `Redpanda`, `Meilisearch`, and `Docker Compose`

## Why It Matters

What makes this project strong is not just the number of technologies involved. It shows systems thinking across user flows, service boundaries, asynchronous operations, and infrastructure choices.

Rather than building one server that does everything, I used a layered architecture that reflects how production systems usually evolve: domain separation where it adds clarity, a gateway for coordination, caching and messaging where they improve responsiveness, and specialized services where they make the platform more flexible.

## Technical Highlights

- Rebuilt a basic ecommerce use case into a more complete marketplace platform with storefront, admin surface, and operational workflows
- Used `GraphQL` as a BFF layer so frontend applications could consume aggregated data through a cleaner interface
- Added `Meilisearch` for product search and `Redis` for fast state and caching use cases
- Modeled asynchronous flows with `RabbitMQ`, worker processing, and Kafka-compatible event streaming through `Redpanda`
- Added a `FastAPI` recommendation service and a `.NET` fulfillment service to show polyglot service design

## Outcome

This project became one of the clearest examples in the portfolio of full-stack and distributed-system depth. It demonstrates that I can move beyond isolated APIs and build a broader platform that ties together user experience, backend architecture, service composition, and supporting infrastructure.
