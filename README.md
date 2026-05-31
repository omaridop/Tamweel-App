# Tamweel (تمويل) — Enterprise AI Credit Scoring Platform

> **Empowering the Financially Invisible.** An Advanced AI-Driven Credit Scoring Engine & Risk Management Ecosystem for the Informal Economy in Jordan and the MENA Region.

Developed for showcase at the **AI Expo Jordan 2026** and the **Fintech Rally Hackathon**.

---

## 📋 Table of Contents

1.  [Executive Summary & Vision](#executive-summary--vision)
2.  [High-Level Architecture](#high-level-architecture)
3.  [Core Technical Components Deep Dive](#core-technical-components-deep-dive)
    *   [Backend & API Layer (FastAPI)](#backend--api-layer-fastapi)
    *   [Tamweel Neural Engine (Anthropic Claude RAG)](#tamweel-neural-engine-anthropic-claude-rag)
    *   [Data Ingestion Pipeline (Semantic Chunking & Embedding)](#data-ingestion-pipeline-semantic-chunking--embedding)
    *   [Mock Data Generation Suite](#mock-data-generation-suite)
    *   [Frontend Architecture (React + Vite + Tailwind v4)](#frontend-architecture-react--vite--tailwind-v4)
4.  [Database Schema & Vector Store Setup](#database-schema--vector-store-setup)
5.  [Environment Variables & Configuration](#environment-variables--configuration)
6.  [Comprehensive Installation & Setup Guide](#comprehensive-installation--setup-guide)
7.  [Advanced Verification Scenarios (The Boss Fight Test)](#advanced-verification-scenarios-the-boss-fight-test)
8.  [Security & Production Hardening Guidelines](#security--production-hardening-guidelines)

---

## 🎯 Executive Summary & Vision

Traditional financial systems in the MENA region often exclude a significant portion of the active workforce due to their strict reliance on formal documentation, such as salary slips or established credit histories. **Tamweel (تمويل)** addresses this critical challenge by redefining creditworthiness through an advanced AI-driven platform.

Our solution enables individuals in the informal economy—including freelancers, gig workers, app drivers, and home-business owners—to securely leverage their digital financial footprints. By integrating data from **e-wallets (ZainCash, CliQ)** and **utility bill indicators (eFAWATEERcom)**, Tamweel's proprietary **Nexus Engine** performs real-time **Pattern Recognition** and **Vector RAG (Retrieval-Augmented Generation)**. This process analyzes regulatory frameworks and alternative data streams to generate an instant, highly accurate, and legally compliant **Trust Score**.

### Value Proposition:

*   **B2C Application**: Provides thin-file or no-file users with immediate credit evaluations, enhanced financial visibility, and an interactive AI Advisor to guide them in improving their credit score over time.
*   **B2B Portal**: Offers commercial banks and institutional investors a sophisticated, dark-themed risk dashboard. This portal includes an **AI Copilot**, geospatial heatmaps, and predictive analytics, enabling safe lending to previously underserved markets.

---

## 🏗️ High-Level Architecture

The Tamweel platform is built upon a decoupled, asynchronous Microservices Architecture, meticulously optimized for real-time inference and robust security. The diagram below illustrates the primary components and their interactions:

```text
┌────────────────────────────────┐       ┌─────────────────────────────────┐
│        React Frontend          │       │         React Frontend          │
│      (B2C Mobile Client)       │       │    (B2B Corporate Dashboard)    │
└───────────────┬────────────────┘       └────────────────┬────────────────┘
                │                                         │
                └───────────────────┬─────────────────────┘
                                    │ HTTP / JSON (Axios + ngrok/Replit)
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           FastAPI Core Gateway                          │
│     - CORS Middleware Configuration                                      │
│     - Pydantic Type-Safe Request Validations                             │
│     - Asynchronous Endpoint Routing (/api/chat)                          │
└───────────────────────────────────┬──────────────────────────────────────┘
                                    │
       ┌────────────────────────────┴────────────────────────────┐
       ▼                                                         ▼
┌─────────────────────────────────────────┐   ┌──────────────────────────────────────────┐
│      Tamweel Neural Engine (Nexus)      │   │       Semantic Retrieval Engine          │
│   - Anthropic Claude Sonnet 3.5 API     │   │   - LangChain HuggingFace Embeddings     │
│   - Proxy Logic for Thin-File Profiles  │   │   - Model: all-MiniLM-L6-v2 (384-dim)    │
│   - Behavioral Pattern Recognition      │   │   - Cosine Vector Matching (RPC Match)   │
└──────────────────┬──────────────────────┘   └──────────────────┬───────────────────────┘
                   │                                             │
                   └───────────────────────┬─────────────────────┘
                                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          Supabase Backend Cloud                          │
│   - Vector Database Store (`knowledge_base_vectors`)                    │
│   - Core User Relational Storage (`profiles`)                             │
│   - Secure RPC Infrastructure for Match Optimization                     │
└──────────────────────────────────────────────────────────────────────────┘
```

This architecture ensures scalability, maintainability, and efficient data flow across the entire platform.

---

## 💻 Core Technical Components Deep Dive

### 1. Backend & API Layer (FastAPI)

The backend is developed using **FastAPI**, selected for its exceptional asynchronous performance, high speed, and automatic generation of OpenAPI schemas. This framework forms the robust core of the platform's API services.

*   **CORS Middleware**: Configured with wildcard allocations (`allow_origins=[
"]`) to ensure seamless cross-origin integration between localized developer instances, Replit environments, and front-end Vite bundles.
*   **Type Safety Protocols**: Employs a robust `AnalysisRequest` schema, inheriting from Pydantic's `BaseModel`. The `customer_data` block is specifically engineered using typing primitives (`Union[dict, list, Any, None] = None`) to natively handle single-user evaluation data models or bulk corporate analytical records without serialization overhead.

### 2. Tamweel Neural Engine (Anthropic Claude RAG)

The neurological intelligence of the platform is powered by **Anthropic Claude 3.5 Sonnet**, serving as the **Nexus Elite V4 core protocol**.

*   **Credit Analysis Protocol (`get_credit_analysis`)**: Operates on a specialized prompt configuration with strict structural formatting, enforcing low temperature calculations (`temperature=0.1`). This approach produces deterministically formatted, clean bullet points detailing the user's specific financial standing, credit risks, and an analytical score, devoid of standard AI conversational "fluff."
*   **Proxy Financial Logic**: Incorporates pre-baked proxy heuristics designed to parse thin-file datasets. If data attributes are missing, the neural engine cross-examines historical transaction behaviors and infers reliable occupancy profiles to establish initial trust.
*   **Strategic Advisor Core (`get_answer_from_rag`)**: Integrates deep context extraction directly with the legal retrieval layer to ensure regulatory parameters are thoroughly checked before returning responses.

### 3. Data Ingestion Pipeline (Semantic Chunking & Embedding)

This automated pipeline is responsible for populating the system's vector-driven regulatory knowledge base.

*   **Semantic Chunking**: Leverages the `RecursiveCharacterTextSplitter` from LangChain to segment complex financial laws into manageable semantic fragments. Priority cutting is optimized explicitly for regional content layout, targeting paragraphs first, followed by strict period breaks, Arabic commas (،), and blank spacing.
*   **Vector Vectorization**: Processes text fragments through the `all-MiniLM-L6-v2` HuggingFace Embeddings model, mapping data to a dense 384-dimensional space.
*   **Reliability Engineering**: Features automated batch processing (`BATCH_SIZE = 100`) combined with comprehensive exception-handling blocks, ensuring uninterrupted uploading to Supabase even if individual formatting errors occur in source documentation.

### 4. Mock Data Generation Suite (`generate_mock_data.py`)

A highly optimized simulation script that creates hyper-realistic financial profiles meticulously mapped to Jordanian demographics.

*   **Profile Personas**: Generates mock citizens (e.g., matching common names like Ahmad, Sarah, Mahmoud combined with Al-Khalidi, Al-Majali, etc.) classified into distinct socioeconomic groups: Freelancers, Gig App Drivers, and Home Businesses.
*   **Financial Synthetics**: Simulates varied income distributions, CliQ peer-to-peer transfers, ZainCash transaction logs, regular eFAWATEERcom utility bills, and loan histories.
*   **Supabase Synced**: Automatically uploads simulated personas into the remote `profiles` table while simultaneously dumping standard formatted `.json` objects into the local environment for isolated offline testing.

### 5. Frontend Architecture (tamweel-ui)

A pristine, state-of-the-art Single Page Application (SPA) structured around **React** and **Vite**, offering maximum bundle efficiency and instantaneous hot-module replacement.

*   **Tailwind CSS v4 Integration**: Built utilizing the latest Tailwind compiled structure, leveraging a native Vite plugin configuration for rapid styling rendering. Includes a custom dark corporate theme (`dark: '#0f172a'`, `card: '#1e293b'`) optimized for presentation displays and financial review terminals.
*   **Data Visualization (recharts)**: Incorporated for high-performance financial graphing, real-time heatmaps, and credit scoring dials, providing corporate banking users with clear visual insights.
*   **Animation Engineering (framer-motion)**: Implements professional component transition curves, replicating high-end native mobile animations during user profile switching or score recalculations.
*   **Iconography (lucide-react)**: Provides clean, structural vector icon packs representing financial attributes, risk flags, and verification parameters.

---

## 🗄️ Database Schema & Vector Store Setup

To replicate the production environment in Supabase, execute the following SQL scripts within your Supabase SQL Editor.

### 1. Vector Extensions Setup

Enable support for vector operations and matching:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Knowledge Base Vectors Table

This table stores vectorized financial rules, local banking compliance documents, and central bank regulations.

```sql
CREATE TABLE knowledge_base_vectors (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    embedding VECTOR(384),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Vector Match Function (RPC Setup)

This stored procedure enables optimized semantic searches via cosine similarity metrics.

```sql
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding VECTOR(384),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    knowledge_base_vectors.id,
    knowledge_base_vectors.content,
    knowledge_base_vectors.metadata,
    1 - (knowledge_base_vectors.embedding <=> query_embedding) AS similarity
  FROM knowledge_base_vectors
  WHERE 1 - (knowledge_base_vectors.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge_base_vectors.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### 4. Profiles Table Schema

This table tracks client identities generated by the system:

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone_number TEXT,
    national_id TEXT UNIQUE,
    profile_type TEXT, -- Freelancer, Driver, MicroBusiness
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## ⚙️ Environment Variables & Configuration

The application separates concerns across backend and frontend environment structures. Create these files in their respective root directories.

### Backend Configurations (`backend/.env`)

```ini, toml
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-service-role-or-anon-key
CLAUDE_API_KEY=your-anthropic-claude-api-key
```

**Note**: In `ai_engine.py`, the active production model identifier is configured to `MODEL_NAME = "claude-sonnet-4-6"`. For development cost savings, consider swapping this with `claude-3-5-sonnet-20241022` or `claude-3-haiku-20240307`.

### Frontend Configurations (`frontend/.env`)

```ini, toml
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-public-key
VITE_API_URL=https://your-fastapi-ngrok-url.ngrok-free.dev
```

---

## 🚀 Comprehensive Installation & Setup Guide

### Section A: Backend Deployment

1.  **Clone the Repository Structure**:

    ```bash
    git clone https://github.com/your-username/tamweel.git
    cd tamweel/backend
    ```

2.  **Initialize Isolated Virtual Environment**:

    ```bash
    python -m venv venv
    # Activation on Linux/macOS:
    source venv/bin/activate
    # On Windows:
    .\venv\Scripts\activate
    ```

3.  **Install Compulsory Architecture Dependencies**:

    ```bash
    pip install --upgrade pip
    pip install fastapi uvicorn anthropic supabase langchain-huggingface langchain-text-splitters python-dotenv pydantic
    ```

4.  **Populate Knowledge Vectors (RAG Population)**:

    Place your raw financial guidance texts or central bank compliance files inside a `knowledge_base` folder, then run:

    ```bash
    python ingest_data.py
    ```

5.  **Fire Up the Mock Database Population Engine**:

    ```bash
    python generate_mock_data.py
    ```

6.  **Launch Production API Core Terminal**:

    ```bash
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```

### Section B: Frontend Client Deployment

1.  **Navigate to the UI workspace**:

    ```bash
    cd ../frontend
    ```

2.  **Install Frontend Dependencies**:

    ```bash
    npm install
    ```

3.  **Launch Local Vite Development Engine**:

    ```bash
    npm run dev
    ```

    The UI interface will instantly map to local host portals (typically `http://localhost:5173`). Use this link to test your client flows.

---

## 🧪 Advanced Verification Scenarios (The Boss Fight Test)

To evaluate the extreme boundaries of our platform's adherence to regional compliance, international user guidelines, and security parameters, execute our complex simulation module:

```bash
python test_chat.py
```

### The Analytical Prompt Scenario Executed:

> "I am a Syrian national residing in Jordan holding an active UNHCR Refugee Verification Card. I operate an un-registered freelance development business with highly volatile income streams (ranging from 150 JOD to 400 JOD monthly). My current Tamweel Credit Trust Score is 55. I am requesting a micro-loan of 500 JOD disbursed directly to my eFAWATEERcom linked portfolio. Under local personal privacy rules, I demand that all my raw historical alternative financial records be completely erased from your servers immediately upon final loan settlement."

### Expected System Verification Output:

*   **Legal Validation**: The RAG system queries the database, verifying financial guidelines regarding UNHCR document validations for non-citizens under Central Bank of Jordan frameworks.
*   **Volatility Smoothing**: The engine applies alternative pattern heuristics, analyzing utility patterns to smooth income variance.
*   **Data Protection Compliance**: Evaluates local personal data privacy law guarantees (the right to data erasure upon contract fulfillment) and returns a structural confidence score (e.g., Confidence Score: 92%).

---

## 🛡️ Security & Production Hardening Guidelines

*   **API Key Isolation (Critical Warning)**:
    Never remove the `.env` entry inside your `.gitignore` configuration. If service keys or private Claude credentials are accidentally committed to GitHub, invalidate and rotate them immediately within your service dashboards.

*   **Supabase Row-Level Security (RLS)**:
    Enable strict RLS tables on the `profiles` table within production environments, ensuring frontend users cannot read alternative financial records matching other individual IDs.

*   **API Production Execution**:
    When running the backend FastAPI infrastructure in production environments, disable the hot-reloading feature to optimize efficiency:

    ```bash
    uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
    ```
