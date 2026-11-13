# CivicQuest

## What it is
Hexathon prototype for employees and families who want to volunteer but do not know where to start. It centralizes local events, registration, a kids' sustainability game, and an Azure chatbot.

## What it does
- GeoIP city lookup filters volunteering and sustainability events by locality.
- Users register for open events. Admins create, edit, and delete events, including capacity, status, city, categories, and images.
- Eco Guardians is a Mario-style side-scroller that shows sustainability facts during play.
- Azure Bot Framework WebChat answers questions from a curated local-resource set.
- Azure Logic Apps can send event confirmation and group emails.

## Stack
Node.js, Express, EJS, Sequelize, SQLite, Bootstrap, Azure Bot Framework, Azure Logic Apps, GeoIP.

## Data model
Users, Events, and a UsersEventsMapping table for many-to-many registrations. Event fields cover title, description, date, location, city, state, max seats, current registrations, status, categories, and images.

## Architecture
EJS and static pages talk to an Express backend. The backend handles routes, GeoIP, registration, admin CRUD, the Azure bot widget, and the Logic App email trigger. SQLite is the default store, with a Postgres or MySQL connection string as an option.
