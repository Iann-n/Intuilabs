# IntuiLabs

> Learning should feel like discovering reality, not memorizing facts.

IntuiLabs is an AI-powered interactive textbook platform designed to transform complex STEM concepts into intuitive, visual, and deeply engaging learning experiences.

Instead of presenting static notes and formulas, IntuiLabs generates dynamic lessons that combine:

* Intuition-first explanations
* Interactive visualizations
* Mathematical symbolism
* Step-by-step conceptual scaffolding
* AI-generated educational narratives

The goal is to help students build genuine understanding rather than rote memorization.

---

# Vision

Traditional education often introduces formulas before intuition.

Students learn:

```
Formula
↓
Procedure
↓
Exam
```

but never develop an intuitive mental model of why concepts exist.

IntuiLabs reverses this process:

```
Intuition
↓
Visualization
↓
Symbolic Representation
↓
Mathematical Formalism
```

Inspired by educators such as:

* Richard Feynman
* Grant Sanderson (3Blue1Brown)
* Michael Stevens (Vsauce)

the platform aims to reveal the hidden structure behind mathematics, engineering, and science.

---

# Core Features

## Interactive Lesson Generation

Users can request any topic:

* Fourier Series
* Laplace Transforms
* Control Systems
* Eigenvalues
* Signal Processing
* Differential Equations

The system generates structured educational lessons designed around conceptual understanding.

---

## Dual Domain Visualization Engine

The DualDomainVisualizer is the core educational component of IntuiLabs.

It presents:

* Physical intuition
* Mathematical abstractions
* Symbolic transformations
* Dynamic animations

simultaneously.

Students can see how concepts evolve across multiple representations rather than memorizing isolated formulas.

---

## Semantic Lesson Cache

To reduce generation costs and improve response speed, IntuiLabs uses semantic caching.

Workflow:

```
User Query
    ↓
Embedding Generation
    ↓
Vector Similarity Search
    ↓
Cache Hit?
    ↓
Return Existing Lesson
    ↓
OR
Generate New Lesson
    ↓
Store Lesson
```

This allows conceptually similar queries to reuse previously generated lessons.

Example:

```
Laplace Transform
```

and

```
What is the Laplace Transform?
```

can resolve to the same cached lesson.

---

## Vector Search

Powered by:

* Supabase
* pgvector
* Embedding-based retrieval

The system performs semantic similarity matching rather than exact string matching.

This enables fuzzy concept retrieval and intelligent lesson reuse.

---

# Architecture

```
Frontend (Next.js)
        ↓
Lesson API
        ↓
Lesson Orchestrator
        ↓
Semantic Cache Search
        ↓
Embedding Generation
        ↓
Vector Similarity Search
        ↓
Lesson Generation
        ↓
Database Persistence
        ↓
Frontend Rendering
```

---

# Tech Stack

## Frontend

* Next.js
* React
* TypeScript

## Database

* Supabase
* PostgreSQL
* pgvector

## AI Infrastructure

* AI SDK
* OpenAI
* Gemini
* OpenRouter

## Validation

* Zod

## ORM

* Drizzle ORM

---

# Project Structure

```
src/
├── app/
│   └── api/
├── components/
│   ├── DualDomainVisualizer.tsx
│   ├── LessonLayout.tsx
│   └── ...
├── lib/
│   ├── ai/
│   ├── db/
│   ├── schema/
│   └── lesson-orchestrator.ts
└── types/
```

---

# Current Status

### Completed

* Semantic caching pipeline
* Vector search infrastructure
* Supabase integration
* Lesson orchestration layer
* Interactive visualization system
* Dynamic lesson rendering
* Embedding generation
* Database persistence

### In Progress

* Production-grade lesson generation
* Model evaluation
* Quality scoring system
* Textbook ingestion pipeline
* RAG knowledge integration

---

# Long-Term Goal

Create the world's most intuitive interactive STEM textbook.

A platform where students can explore concepts visually, develop intuition naturally, and build genuine understanding through guided discovery.

---

# Author

Built by Yoon Hao Ian.

Monash Engineering Student.

Exploring the intersection of:

* Education
* Artificial Intelligence
* Human Understanding
* Interactive Visualization