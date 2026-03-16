# Multi-Agent Portfolio Negotiator (MAPN)

**MAPN** is an advanced, AI-driven portfolio management and negotiation system built with Next.js 15. It utilizes a multi-agent AI architecture to simulate institutional-grade investment committees, balancing different mandates such as risk, growth, compliance, and liquidity, backed by real-time market data.

![MAPN Overview](public/mapn-banner.png) *(Placeholder if you have a banner)*

## 🌟 Key Features

*   **Multi-Agent Negotiation Engine**: Four specialized AI agents (Risk, Growth, Compliance, Liquidity) supervised by a central logic (Gemini/Mistral) debate and negotiate portfolio allocations.
*   **Real-Time Market Data**: Integration with **Finnhub** for live stock quotes, market news, and economic calendars.
*   **AI Portfolio Analysis**: Deep-dive analysis and recommendations for your current portfolio holdings, powered by Google Gemini (with Mistral as a fallback).
*   **Trade Execution Simulation**: Execute buy/sell orders with real-time validation and AI oversight.
*   **Database & Authentication**: Fully backed by **Supabase** for secure user authentication, portfolio persistence, and trade logging.
*   **Modern Frontend**: Built with Next.js 15 App Router, React 19, Tailwind CSS v4, Framer Motion, and Shadcn UI components for a premium, responsive experience.

## 🏗 Architecture

```
Frontend (React Components / Web UI)
    ↓
API Routes (/api/*)
    ↓
Database Integration Layer (db-integrations.ts)
    ↓
┌─────────────┬──────────────┬──────────────┐
│  Supabase   │   LLM APIs   │  Market APIs │
│  Database   │ Gemini/Mistral│   Finnhub   │
└─────────────┴──────────────┴──────────────┘
```

## 🛠️ Tech Stack

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Components**: [Shadcn UI](https://ui.shadcn.com/) / Radix UI
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Database & Auth**: [Supabase](https://supabase.com/)
*   **AI / LLMs**: Google Gemini 2.0 Flash, Mistral, HuggingFace
*   **Market Data**: Finnhub API

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   npm, yarn, pnpm, or bun

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd macane
```

### 2. Install Dependencies

```bash
npm install
# or yarn install / pnpm install / bun install
```

### 3. Environment Configuration

Create a `.env.local` file in the root of the project by copying the provided environment download or `.env.example`. You will need API keys for the following services:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# LLM Providers
GEMINI_API_KEY=your_gemini_api_key
MISTRAL_API_KEY=your_mistral_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Market Data
FINNHUB_API_KEY=your_finnhub_api_key
```

### 4. Database Setup

Ensure your Supabase project is set up with the required schemas for user portfolios, negotiations, and mock assets. Use the SQL scripts provided in `scripts/` or the Supabase migration tools.

### 5. Run the Development Server

```bash
npm run dev
# or yarn dev / pnpm dev / bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📡 API Endpoints

The project includes built-in API routes that bridge the frontend, database, AI, and market data:

*   **`GET /api/test-integrations`**: An unauthenticated endpoint to quickly test if Finnhub and Gemini are wired up correctly.
*   **`GET /api/portfolio`**: Requires Auth. Fetches the user's portfolio augmented with live Finnhub market data.
*   **`POST /api/trade`**: Requires Auth. Submits simulated buy/sell orders.
*   **`GET /api/analyze`**: Requires Auth. Provides an AI generated analysis of the user's current holdings.
*   **`POST /api/recommendations`**: Requires Auth. Uses AI to recommend new assets based on market conditions.
*   **`GET /api/market-summary`**: Returns an AI-generated digest of the latest market news.

## 🤖 Multi-Agent Negotiation

At the core of MAPN is the negotiation loop:
1.  **Broadcast**: The current portfolio state and user mandates are sent to the Risk, Growth, Compliance, and Liquidity agents.
2.  **Gather**: Each agent generates a critique or bid based on their specialized prompt block.
3.  **Supervisor**: The master Gemini node aggregates the disparate agent responses, forces consensus, and proposes a new allocation.
4.  **Log**: All agent thoughts and the final resolution are saved to Supabase to be visualized on the frontend.

## 📚 Documentation & Guides

For more detailed information, check out the following internal documentation:
*   `API_INTEGRATION_GUIDE.md`: Deep dive into API endpoints and usage.
*   `AUTH_INTEGRATION.md`: How Supabase SSR Authentication is wired up.
*   `QUICK_START_AUTH.md`: Quick reference for auth flows.
*   `INTEGRATION_COMPLETE.md`: Overview of the recently completed integration layer.

## 📄 License

This project is licensed under the MIT License.
