# Journey Builder

## What it is
A React and TypeScript UI for editing prefill mappings on a DAG of forms. It was built against a mock blueprint API.

## What it does
- Loads a blueprint graph and lists every form node.
- Shows each field. A mapped prefill is labeled. An unmapped field opens a source picker.
- Sources are grouped: upstream form fields, including transitive ancestors, plus global client and action properties.
- New data sources plug in by implementing one interface and registering it. The modal picks them up with no other changes.

## Stack
React, TypeScript, Vite, Vitest.

## What it shows
DAG traversal, typed API contracts, and a small plugin registry. Tests cover parent and ancestor walks, source grouping, and the prefill panel.
