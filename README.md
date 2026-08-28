# 🎓 TestPlatform — Zamonaviy Bilim va Baholash Tizimi

[![Deploy to GitHub Pages](https://github.com/AsilbekTurkmanov/TestPlatform-Demo-day/actions/workflows/deploy.yml/badge.svg)](https://github.com/AsilbekTurkmanov/TestPlatform-Demo-day/actions/workflows/deploy.yml)
[![.NET 10](https://img.shields.io/badge/.NET-10.0-purple.svg)](https://dotnet.microsoft.com/)
[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-336791.svg)](https://www.postgresql.org/)

> **🌐 Live Demo (GitHub Pages)**: [https://asilbekturkmanov.github.io/TestPlatform-Demo-day/](https://asilbekturkmanov.github.io/TestPlatform-Demo-day/)

---

## 🌟 Asosiy Xususiyatlar (Key Features)

- 🇺🇿 **3 Tilli Mahalliylashtirish**: O'zbekcha (Default), Ruscha (🇷🇺), Inglizcha (🇬🇧) to'liq qo'llab-quvvatlanadi.
- 🌓 **Mavzular (Theme)**: Yorug' (Light), Qorong'i (Dark), va Tizim (System) rejimlari.
- 📱 **100% Responsiv Dizayn**: Mobile, Tablet, Noutbuk va Desktop ekranlarga moslashuvchan interfeys (Google Stitch design system).
- ⏱️ **Server-Sinxron Taymer**: Vaqt hisobi hech qachon mijoz soatiga bog'liq emas; server `ExpiresAt` orqali qat'iy nazorat qilinadi.
- 💾 **Avtomatik Saqlash (Autosave)**: Har bir javob tanlanganda serverga lahzali saqlanadi.
- 🎉 **Natijalar va Xatolar Tahlili**: Ballar foizi, konfetti animatsiyasi va har bir savol bo'yicha tushuntirishlar.
- 📊 **Interaktiv Grafiklar**: Recharts orqali ballar dinamikasi, kategoriya o'zlashtirishi va ballar taqsimoti.

---

## 👥 Foydalanuvchi Rollari va Demo Kirish (Demo Accounts)

| Rol | Email | Parol | 1-Click Demo |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@testplatform.uz` | `Admin123!` | Navbar / Kirish sahifasida mavjud |
| **Teacher** (O'qituvchi) | `teacher@testplatform.uz` | `Teacher123!` | Navbar / Kirish sahifasida mavjud |
| **Student** (Talaba) | `student@testplatform.uz` | `Student123!` | Navbar / Kirish sahifasida mavjud |

---

## 🏛️ Texnologik Stek (Tech Stack)

### Backend
- **Framework**: C# .NET 10 ASP.NET Core Web API (Clean Architecture: Domain, Application, Infrastructure, WebApi)
- **Database**: PostgreSQL 18 + Entity Framework Core 10 Fluent API
- **Xavfsizlik**: BCrypt Password Hashing, JWT Bearer Token + Refresh Token Rotation
- **Testlar**: xUnit Unit Test Suite (Scoring engine, Timer expiration, Claims & Roles)

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS, Glassmorphism, Custom Scrollbars
- **Grafiklar & Effektlar**: Recharts, Canvas-Confetti, Lucide React
- **State & Routing**: TanStack Query, React Router (HashRouter for GitHub Pages)

---

## 🚀 Mahalliy O'rnatish va Ishga Tushirish (Local Setup)

### 1. Backend (.NET 10 + PostgreSQL)
```bash
cd backend/src/TestPlatform.WebApi
dotnet run --urls "http://localhost:5000"
```
*Swagger API Hujjatlari*: `http://localhost:5000/swagger`

### 2. Frontend (React 19 + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Ilova*: `http://localhost:5173`

---

## 🧪 Testlarni Ishga Tushirish (Unit Tests)
```bash
dotnet test backend/tests/TestPlatform.UnitTests/TestPlatform.UnitTests.csproj
```

---
*Created with ❤️ for TestPlatform Demo Day.*
