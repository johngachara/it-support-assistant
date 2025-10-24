# IT Support Report Management System

> A comprehensive AI-powered platform for managing IT support reports with intelligent recommendations, interactive chat assistance, and multi-format export capabilities.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Usage Guide](#-usage-guide)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

## ✨ Features

### 🔐 Authentication & Security
- **Supabase Authentication** - Secure email/password authentication
- **Session Persistence** - Stay logged in across browser sessions
- **Protected Routes** - Automatic redirect for unauthenticated users
- **User Profiles** - Display user information in sidebar

### 📝 Report Management
- **4-Step Wizard** - Intuitive report creation process
  1. Machine details and user complaint
  2. Technical findings documentation
  3. AI-powered recommendations
  4. Preview and export
- **Draft System** - Save progress at any step and continue later
- **Duplicate Reports** - Use existing reports as templates
- **Edit Reports** - Modify existing reports seamlessly
- **Search & Filter** - Find reports quickly with powerful search
- **Pagination** - Handle large datasets efficiently

### 🤖 AI-Powered Features
- **Cerebras AI Integration** - Lightning-fast AI recommendations
- **Web Search Enhancement** - AI can search the web for current solutions
- **System Documentation Tool** - AI can answer questions about the app itself
- **Interactive Chat** - Technical assistance via AI chatbot
- **Chat History** - Access and continue previous conversations
- **Streaming Responses** - Real-time AI responses

### 📤 Export Capabilities
- **PDF Export** - Professional PDF reports with formatting
- **DOCX Export** - Microsoft Word compatible documents
- **Proper Formatting** - Headers, bullet points, tables
- **Custom Styling** - Branded reports with logos

### 🎨 User Experience
- **Dark Mode** - System-wide theme toggle
- **Toast Notifications** - User-friendly error and success messages
- **Loading States** - Clear feedback during operations
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Keyboard Navigation** - Accessible interface

## 🛠 Tech Stack

### Frontend
- **React 19** - Latest React features
- **Vite 7.1** - Lightning-fast build tool
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **React Hot Toast** - Beautiful notifications

### Backend & Services
- **Supabase** - PostgreSQL database and authentication
- **Cerebras AI** - AI recommendations (llama3.1-70b model)
- **Tavily API** - Web search for AI context

### Export Libraries
- **jsPDF** - PDF generation
- **docx** - DOCX file creation

## 📦 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git**

You'll also need accounts for:
- [Supabase](https://supabase.com/) - Database and authentication
- [Cerebras AI](https://cerebras.ai/) - AI recommendations
- [Tavily](https://tavily.com/) - Web search API

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/johngachara/it-support-assistant.git
cd it-support-assistant
```

### 2. Install Dependencies

```bash
npm install
```

## 🔧 Environment Configuration

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anonymous_key

# AI Services
VITE_CEREBRAS_API_KEY=your_cerebras_api_key
VITE_TAVILY_API_KEY=your_tavily_api_key
```

### Getting API Keys

#### Supabase
1. Sign up at [supabase.com](https://supabase.com/)
2. Create a new project
3. Go to Settings → API
4. Copy the `URL` and `anon/public` key

#### Cerebras AI
1. Sign up at [cerebras.ai](https://cerebras.ai/)
2. Navigate to API Keys
3. Generate a new API key

#### Tavily
1. Sign up at [tavily.com](https://tavily.com/)
2. Access your dashboard
3. Copy your API key

## 🗄 Database Setup

Run these SQL commands in your Supabase SQL Editor:

### Reports Table
```sql
CREATE TABLE reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    machine_make TEXT,
    machine_model TEXT,
    serial_number TEXT,
    ram TEXT,
    storage TEXT,
    processor TEXT,
    user_complaint TEXT,
    findings JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    report_content TEXT,
    prepared_by TEXT DEFAULT 'IT Admin',
    reviewed_by TEXT,
    is_draft BOOLEAN DEFAULT false,
    draft_step INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_is_draft ON reports(is_draft);
```

### Chats Table
```sql
CREATE TABLE chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    messages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_chats_created_at ON chats(created_at DESC);
```

## 🎯 Running the Application

### Development Mode

```bash
npm run dev
```

Application will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
it-support-assistant/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── chat/           # Chat interface
│   │   ├── dashboard/      # Dashboard widgets
│   │   ├── forms/          # Form components
│   │   ├── layout/         # Layout (Sidebar, Header)
│   │   ├── report/         # Report components
│   │   └── ui/             # Reusable UI components
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom hooks
│   ├── pages/              # Page components
│   ├── services/           # API and service layers
│   │   ├── ai/            # AI services
│   │   ├── auth/          # Authentication
│   │   ├── database/      # Database services
│   │   ├── export/        # PDF/DOCX export
│   │   └── search/        # Web search
│   ├── utils/             # Utility functions
│   └── App.jsx            # Main App component
├── docs/                   # Documentation
└── package.json
```

## 📖 Usage Guide

### Creating Your First Report

1. **Sign In** - Navigate to the app and sign in or create an account
2. **Create Report** - Click "Create Report" from sidebar
3. **Fill Details** - Enter machine information and user complaint
4. **Add Findings** - Document technical findings
5. **Generate Recommendations** - Let AI suggest solutions or add manually
6. **Review & Export** - Preview report and export as PDF/DOCX or submit

### Using Drafts

- Click "Save Draft" at any step
- Find drafts in "All Reports" (blue badge)
- Click "Continue Editing" to resume from saved step

### AI Chat

- Click "New Chat" from sidebar
- Ask IT-related questions
- AI provides solutions with web search capability
- View "Chat History" to access past conversations

## 🐛 Troubleshooting

### Cannot connect to Supabase
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check Supabase project is active

### AI recommendations not generating
- Check `VITE_CEREBRAS_API_KEY` is correct
- Verify API quota is not exceeded

### Session not persisting
- Clear browser cache and cookies
- Check localStorage is enabled

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/)
- [Cerebras AI](https://cerebras.ai/)
- [Tailwind CSS](https://tailwindcss.com/)

---

Made with ❤️ by the IT Support Team
