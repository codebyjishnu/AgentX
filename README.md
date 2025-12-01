# AgentX
AgentX is an intelligent multi-agent system that transforms natural language instructions into fully functional mini-applications.

# AgentX Backend

An **AI-powered code generation platform** that enables users to describe applications in natural language and receive fully functional Next.js applications generated in real-time sandboxed environments.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AgentX Backend                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────────┐  │
│  │   FastAPI    │───▶│   Services   │───▶│         Workflows            │  │
│  │   API Layer  │    │    Layer     │    │  (Orchestration Layer)       │  │
│  └──────────────┘    └──────────────┘    └──────────────────────────────┘  │
│         │                   │                         │                     │
│         ▼                   ▼                         ▼                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────────┐  │
│  │  PostgreSQL  │    │   SSE/RT     │    │       AI Agents              │  │
│  │  Database    │    │  Streaming   │    │  (Google ADK + Gemini)       │  │
│  └──────────────┘    └──────────────┘    └──────────────────────────────┘  │
│                                                       │                     │
│                                                       ▼                     │
│                                          ┌──────────────────────────────┐  │
│                                          │      E2B Sandbox             │  │
│                                          │   (Isolated Execution)       │  │
│                                          └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
backend/
├── main.py                    # Application entry point
├── requirements.txt           # Python dependencies
├── alembic/                   # Database migrations
│   ├── env.py
│   └── versions/              # Migration scripts
├── app/
│   ├── api/
│   │   └── router.py          # API route definitions
│   ├── agents/
│   │   ├── code_agent.py      # AI code generation agent
│   │   └── system_prompts.py  # LLM instruction prompts
│   ├── core/
│   │   ├── config.py          # App configuration (env vars)
│   │   └── database.py        # Async database connection
│   ├── models/
│   │   └── database.py        # SQLAlchemy ORM models
│   ├── schemas/
│   │   └── project.py         # Pydantic request/response schemas
│   ├── services/
│   │   ├── agent_service.py   # Project & chat management
│   │   └── sandbox_service.py # E2B sandbox operations
│   └── workflows/
│       └── code_workflow.py   # Code generation orchestration
```

## 🔧 Core Components

### 1. **API Layer** (`app/api/`)
RESTful endpoints built with FastAPI:
- `GET /project/new` – Create a new project
- `GET /project/{id}/details` – Retrieve project with message history
- `POST /project/{id}/chat` – Send a message and stream AI responses (SSE)

### 2. **Database Models** (`app/models/`)
PostgreSQL-backed persistence using SQLAlchemy async:
- **Project** – Container for a code generation session
- **Message** – User/assistant conversation history
- **Fragment** – Generated code artifacts (files, sandbox URL)
- **Usage** – API usage tracking

### 3. **AI Agents** (`app/agents/`)
Powered by **Google ADK** (Agent Development Kit) with **Gemini 2.5 Pro**:
- **CodeAgent** – Senior software engineer persona that generates Next.js applications
- Equipped with tools: `_run_terminal`, `_create_or_update_files`, `_read_files`

### 4. **Sandbox Service** (`app/services/sandbox_service.py`)
Integrates with **E2B** (Cloud sandbox platform):
- Creates isolated execution environments
- Runs terminal commands (`npm install`, etc.)
- Manages file operations in the sandbox
- Returns live preview URLs (port 3000)

### 5. **Code Workflow** (`app/workflows/code_workflow.py`)
Orchestrates the end-to-end code generation process:
1. Creates/connects to an E2B sandbox
2. Initializes the CodeAgent with sandbox tools
3. Runs the agent loop via Google ADK Runner
4. Returns sandbox URL + generated files

### 6. **Streaming Responses** (`app/services/agent_service.py`)
Server-Sent Events (SSE) for real-time updates:
- `MESSAGE` – Status/thinking updates
- `FILE_CREATION` – New file being created
- `FILE_UPDATE` – Existing file modified
- `COMPLETE` – Workflow finished with sandbox URL
- `ERROR` – Error occurred

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | FastAPI |
| Database | PostgreSQL (async via psycopg) |
| ORM | SQLAlchemy 2.0 (async) |
| Migrations | Alembic |
| AI/LLM | Google ADK + Gemini 2.5 Pro |
| Sandboxing | E2B (Cloud-based sandboxes) |
| Validation | Pydantic v2 |

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- PostgreSQL database
- E2B API key
- Google AI API key

### Installation

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (create .env file)
DATABASE_URL=postgresql+psycopg://user:pass@localhost:5432/agentx
E2B_API_KEY=your_e2b_key
GOOGLE_API_KEY=your_google_key

# Run database migrations
alembic upgrade head

# Start the server
uvicorn main:app --reload
```

## 📡 API Usage Example

```bash
# Create a new project
curl http://localhost:8000/project/new

# Send a code generation request (streams SSE)
curl -X POST http://localhost:8000/project/{project_id}/chat \
  -H "Content-Type: application/json" \
  -d '{"content": "Build a Netflix-style homepage with dark mode"}'
```

## 🔮 How It Works

1. **User Request** → User describes what they want to build
2. **Project Creation** → System creates a project and stores the message
3. **Sandbox Initialization** → E2B sandbox spins up with Next.js 15 pre-configured
4. **Agent Execution** → Gemini-powered agent analyzes the request
5. **Code Generation** → Agent uses tools to create/update files in the sandbox
6. **Real-time Streaming** → Progress updates sent via SSE to the frontend
7. **Preview URL** → User receives a live preview URL of their generated app

---

## 🔨 The Build: How This Was Created

### Development Philosophy
This project follows a **modular, async-first architecture** designed for scalability and real-time AI interactions. The goal was to create a system where an AI agent could safely generate and execute code in isolated environments.

### Key Architectural Decisions

#### 1. **Async Everything**
The entire backend is built on Python's `asyncio` ecosystem:
- **FastAPI** – Natively async web framework, perfect for concurrent AI requests
- **SQLAlchemy 2.0 async** – Non-blocking database operations with `AsyncSession`
- **asyncpg + psycopg** – Async PostgreSQL drivers for high-performance queries
- **E2B AsyncSandbox** – Async sandbox operations for non-blocking code execution

This allows handling multiple concurrent code generation sessions without blocking.

#### 2. **Google ADK for Agent Orchestration**
Chose **Google Agent Development Kit (ADK)** over alternatives like LangChain for several reasons:
- Native integration with Gemini models
- Clean tool definition pattern (simple Python functions as tools)
- Built-in session management via `InMemorySessionService`
- Runner-based execution loop that handles the agent's thought-action cycle

```python
# Agent creation pattern used
agent = Agent(
    name="code_generator",
    model="gemini-2.5-pro",
    instruction=PROMPT,
    tools=[self._run_terminal, self._create_or_update_files, self._read_files]
)
runner = Runner(agent=agent, app_name=APP_NAME, session_service=session_service)
```

#### 3. **E2B for Sandboxed Execution**
**E2B (e2b.dev)** provides cloud-based sandboxes that are:
- **Isolated** – Each user gets their own container
- **Pre-configured** – Custom template `agentX-test` with Next.js 15.3.3 ready
- **Persistent** – Sandboxes can be reconnected to via `sandbox_id`
- **Live Preview** – Built-in port forwarding for instant preview URLs

The sandbox service wraps E2B's API:
```python
# Core sandbox operations
await sandbox.commands.run(command)           # Terminal execution
await sandbox.files.write(path, content)       # File creation
await sandbox.files.read(path)                 # File reading
sandbox.get_host(3000)                         # Get preview URL
```

#### 4. **Server-Sent Events (SSE) for Streaming**
Instead of WebSockets, SSE was chosen for real-time updates because:
- Simpler implementation (standard HTTP)
- Auto-reconnection built into browsers
- One-way stream is sufficient (server → client)
- Works through proxies/load balancers easily

```python
# Streaming response pattern
return StreamingResponse(
    self.start_workflow(message.content),
    media_type="text/event-stream",
    headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
)
```

#### 5. **Prompt Engineering for Code Quality**
The system prompt (`system_prompts.py`) is carefully crafted to ensure:
- **Production-quality code** – No TODOs, placeholders, or stubs
- **Proper tool usage** – Agent must use `_run_terminal` for npm installs
- **Shadcn UI conventions** – Correct import paths and component APIs
- **Safety rules** – Never run `npm run dev` (already running), use relative paths
- **Structured output** – Must end with `<task_summary>` tag

### Tools & Libraries Used

| Category | Tool | Why |
|----------|------|-----|
| **Web Framework** | FastAPI | Async-native, auto-docs, Pydantic integration |
| **Database** | PostgreSQL | Robust, JSON support, proven at scale |
| **ORM** | SQLAlchemy 2.0 | Modern async support, type hints, declarative models |
| **Migrations** | Alembic | Industry standard, works seamlessly with SQLAlchemy |
| **AI Framework** | Google ADK | Clean agent abstraction, native Gemini support |
| **LLM** | Gemini 2.5 Pro | Strong coding capabilities, large context window |
| **Multi-Model** | LiteLLM | Swap models easily (OpenAI, Anthropic, etc.) |
| **Sandboxing** | E2B | Cloud sandboxes, pre-built templates, fast spin-up |
| **Validation** | Pydantic v2 | Fast, type-safe, native FastAPI integration |
| **Config** | pydantic-settings | Environment variable management with validation |

### Database Schema Design

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Project   │──────▶│   Message   │──────▶│  Fragment   │
├─────────────┤  1:N  ├─────────────┤  1:1  ├─────────────┤
│ id (UUID)   │       │ id (UUID)   │       │ id (UUID)   │
│ name        │       │ content     │       │ sandbox_url │
│ created_at  │       │ role (enum) │       │ title       │
│ updated_at  │       │ type (enum) │       │ files (JSON)│
└─────────────┘       │ project_id  │       │ message_id  │
                      └─────────────┘       └─────────────┘
```

- **Project** – Top-level container for a generation session
- **Message** – Conversation history (USER/ASSISTANT roles)
- **Fragment** – Generated artifacts linked to assistant messages
- **Usage** – Track API consumption per key

### Development Workflow

1. **Database First** – Defined models in SQLAlchemy, generated migrations with Alembic
2. **API Contract** – Defined Pydantic schemas for request/response validation
3. **Service Layer** – Built business logic separate from routes
4. **Agent Development** – Iterated on prompts and tools in isolation
5. **Integration** – Connected workflow → agent → sandbox pipeline
6. **Streaming** – Added SSE for real-time frontend updates

### Custom E2B Sandbox Template
A custom sandbox template (`agentX-test`) was created with:
- Next.js 15.3.3 pre-installed
- All Shadcn UI components available at `@/components/ui/*`
- Tailwind CSS configured with dark mode
- Development server auto-started on port 3000
- Hot reload enabled for instant preview updates

