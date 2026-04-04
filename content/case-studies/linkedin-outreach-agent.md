# LinkedIn Outreach Agent

## Overview

This project is a Chrome extension built to make LinkedIn outreach more natural, more personalized, and less repetitive. Instead of generating generic AI-sounding messages, the extension is designed to work from visible LinkedIn context and produce replies that stay grounded in profile information, conversation flow, and intent.

The goal was to create a practical assistant for recruiter replies, networking follow-ups, post comments, and connection requests, while still keeping the user in control of what gets sent.

## What I Built

- A Chrome extension that injects a LinkedIn-side assistant overlay
- Scenario-based generation flows for recruiter replies, post comments, and outreach
- Support for multiple provider modes: `OpenAI`, `Ollama`, and OpenAI-compatible local servers
- Shared prompt logic and profile-context grounding so replies stay aligned with the intended voice
- Browser-agent helpers that can assist with repetitive LinkedIn actions
- A review-first workflow so the final message can be edited before it is used

## Why It Matters

This project combines LLM integration, browser automation, UX constraints, and responsible-use considerations in one product. It is not just an API demo. It works inside a live interface, uses visible page context, and supports both local and cloud inference paths depending on privacy and control requirements.

It also reflects a real product decision: the best outreach assistant is not the one that generates the most text, but the one that stays truthful, context-aware, and easy to review.

## Technical Highlights

- Built the extension in `JavaScript` with a LinkedIn-native overlay and provider-configurable model support
- Added grounding through saved profile context and scenario-specific prompt logic to reduce generic output
- Supported recruiter replies, follow-ups, comments, connection notes, and acceptance responses through targeted workflows
- Added browser-agent assistance for repetitive UI actions while preserving a human review checkpoint
- Enabled both local and cloud model usage through `Ollama`, `OpenAI`, and OpenAI-compatible endpoints

## Outcome

This project stands out in the portfolio as applied AI tooling rather than pure model experimentation. It shows product thinking, interface integration, prompt design, and practical automation in a way that is much closer to a real end-user workflow than a notebook-based demo.
