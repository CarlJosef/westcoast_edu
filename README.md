# Westcoast Education

---

[![My Skills](https://skillicons.dev/icons?i=html,css,js,ts,nodejs,vitest,vscode&perline=12)](https://skillicons.dev)

---

![HTML](https://img.shields.io/badge/HTML-5-orange)
![CSS](https://img.shields.io/badge/CSS-3-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES202x-yellow)
![TypeScript](https://img.shields.io/badge/TypeScript-checked-blue)
![Node.js](https://img.shields.io/badge/Node.js-runtime-green)
![json-server](https://img.shields.io/badge/json--server-API-lightgrey)
![Vitest](https://img.shields.io/badge/Vitest-tests-brightgreen)

---

## Meny

- [Features](#features)
- [Tech Stack](#tech-stack)
- [How to Run](#how-to-run)
- [Demo Credentials](#demo-credentials)
- [VG Track: TypeScript + TDD](#vg-track-typescript--tdd)
- [Quality Checklist](#quality-checklist)
- [Common API Endpoints](#common-api-endpoints)

---

## Screenshot

![App screenshot](westcoast/docs/screenshot.png)

---

A frontend application for browsing and booking **Westcoast Education** courses, including an admin flow for creating new courses.
The project uses `json-server` as a REST API and a static frontend built with HTML/CSS/JS.

---

## **Features**

### Step 1: Browse courses

- The start page lists courses (image, title, course number, planned start date, price).
- A course details page shows information about the selected course.

### Step 2: Booking & account

- The booking page is accessed via `book.html?courseId=<id>`.
- Create an account / log in.
- Complete a booking (stored via the API).

### Admin

- Admin can create new courses.
- Newly created courses always get an:
  - default image: `./assets/images/newcource.png`
  - planned start date: today (YYYY-MM-DD)
  - default delivery mode: `distance`

The UI includes fallbacks so there are no broken images and no `undefined` values shown.

---

## Tech Stack

- Frontend: **HTML**, **CSS**, **JavaScript (ES Modules)**
- VG track: **TypeScript** (validation + tests)
- API: **json-server**
- Tests: **Vitest**

---

## **How to Run**

> Important: run commands from the **`westcoast\`** folder, otherwise you may get errors.

### 1) Install dependencies

Run in: `H:\<path>\westcoast_edu\westcoast`

```bash
npm install
```

---

### 2) Start the API

- Run: **`npm run api`**

#### API URL

- [http://localhost:3001](http://localhost:3001)

### 3) Start the frontend

- Open the frontend in a browser (VS Code Live Server recommended):
  - **`client/index.html`**

### 4) Run tests and TypeScript check

- Run: **`npm test`**
- Run: **`npm run ts:check`**

## Other and For info is all credentials only in demo, no **REAL**

- Demo credentials:
  - Email: **`demo@westcoast.se`**
  - Password: **`demo123`**

---

## Quality Checklist

- No console errors
- No broken images (fallbacks implemented)
- Navigation works (Start/Admin)
- Admin course creation produces complete course data
- Booking flow works: create account → log in → book → log out
