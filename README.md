# Fast Capital

    "Invest in local businesses. Empower communities. Grow your wealth."

## Authors

Tyler McCallum (https://gitlab.com/tyler.mccallum9), Bowe Jessop (https://gitlab.com/Erlsong), Daniel Greenberg (https://gitlab.com/danielrgreenberg1), Jonathan Lai (https://gitlab.com/jlai9001)

## Concept

The Fast Capital project was concieved as a web-application that allows users to offer and purchase shares in start-up businesses.
This would be marketed and targeted towards those passionate about local communities, and incentivise support with tangible benefits.

## MVP: We will consider our product functionally successful if these stories are fullfilled.

**Investor User Stories**

1. As an investor, I want to view available investment offers so that I can evaluate opportunities to invest.
2. As an investor, I want to select a specific investment opportunity so that I can explore its details further.
3. As an investor, I want to purchase an investment so that I can allocate funds and participate in the opportunity.
4. As an investor, I want to view my investment portfolio so that I can track my holdings and performance over time.
5. As a new investor, I want to create an account so that I can access and manage my investments.
6. As a returning investor, I want to log in so that I can securely access my investment dashboard.
   **Business Owner User Stories**
7. As a business owner, I want to create a business account so that I can raise capital through investment opportunities.
8. As a business owner, I want to create a new investment opportunity so that I can attract investor funding for my business.

## Implemented Core Features

1. View available investment offers.
2. Inspect investment details.
3. Simulate the purchase of an investment.
4. View a personally instanced portfolio unique to the user.

## App in Action

## Techstack

| Category          | Technology       | Purpose / Role                                    | Notes                                 |
| ----------------- | ---------------- | ------------------------------------------------- | ------------------------------------- |
| **Web Framework** | FastAPI          | API framework for building async RESTful services | Type-hinted, auto-docs, async support |
| **Web Server**    | Uvicorn + uvloop | ASGI server to run FastAPI                        | High-performance, async event loop    |
| **ASGI Layer**    | Starlette        | ASGI toolkit used internally by FastAPI           | Supports routing, sessions, etc.      |

| **Database** | PostgreSQL | Relational database | Used with Docker + psycopg |
| **ORM** | SQLAlchemy 2.x | ORM for interacting with PostgreSQL | Fully async-capable |
| **DB Driver** | psycopg (v3) | PostgreSQL database adapter | Modern async-native PostgreSQL client |

| **Validation** | Pydantic v2 | Data validation and parsing | Used in FastAPI models (request/response) |
| | email-validator | Email address format validation | For user-related data |

| **Authentication** | bcrypt | Password hashing | Industry-standard hashing method |

| **Templating** | Jinja2 | Optional HTML rendering (emails/templates) | Used for sending emails or templated responses |

| **HTTP Clients** | httpx | Async HTTP client | For calling external APIs from backend |

| **File Handling** | python-multipart | Parses multipart/form-data | Required for file upload endpoints |

| **Env Config** | python-dotenv | Loads .env variables | Keeps secrets and config cleanly managed |

| **CLI & Utilities** | typer | Build interactive CLI apps | Used by fastapi-cli, type-safe like FastAPI |
| | fastapi-cli | Scaffolding / dev tool for FastAPI | Speeds up development |
| | click | CLI argument parser (used by Typer) | Underlying library used by Typer |

| **Testing** | pytest | Python testing framework | Lightweight, widely adopted |

| **Developer Tools** | rich / rich-toolkit | Pretty terminal output, logging | Enhances logs, debugging, CLI formatting |

| **Timezone Support** | pytz, tzdata | Timezone handling and conversion | Used with pandas, datetime, etc. |

| **Miscellaneous** | anyio, sniffio | Async event loop and context detection | FastAPI and httpx dependencies |
| | watchfiles | Watches files and reloads dev server | Hot reload support with Uvicorn |

## Getting Started

To get started with this project, clone the respository from the development branch and follow the steps found below.

To run the frontend in project, use the following command:
cd client
npm run dev

To run the backend project:

**Start your venv**
cd server
source .venv/bin/activate

**Install Dependencies**
pip install -r requirements.txt

npm install @mui/material @emotion/react @emotion/styled @mui/x-charts axios

**Start the DB**

<!-- Show running containers -->

    docker ps

<!-- Kill and remove any running containers -->

    docker kill $(docker ps -q)
    docker rm $(docker ps -aq)
    docker rmi $(docker images -q)

<!-- Start up a new container and connect to the default DB -->

    docker-compose up -d
    docker exec -it postgres_db psql -U postgres

<!-- Create and switch to the fastcapital DB -->

    CREATE DATABASE fastcapital
    \c fastcapital

<!-- Seed Test Data in the fastcapital db -->

\i /data/fastcapitaldata.sql

**Start the FastAPI Server**

<!-- Start fastapi server (defaults to main.py) -->

    fastapi dev

<!-- Start fastapi server (defaults to main.py) -->

    visit [text](http://localhost:8000/docs) to test APIs

<!--Visit frontend server -->

    open your preferred internet-browser, and navigate to (http://localhost:5173)

## Visit Deployed Site

(https://fastcapitaltest-3157d1.gitlab.io/)

## Git Branching Workflow

Project member designated as product owner creates feature wireframes and feature tickets.
Tickets are categorized as such: To do, ready for development, development in progress, testing, peer review, done.

Members are expected to take a ticket and make a branch. Unless urgent, merges to dev occur three times a day: before work, during lunch, before leaving.
Project members are expected to keep their feature branch consistent with dev branch after scheduled merges.
When a member is done developing their feature, they request a merge to dev, then take a new ticket.

We follow a simple feature‑branch workflow:

1.  **Sync your local `dev`**
    git checkout dev
    git pull origin dev

2.  Create a new feature branch
    Use the ticket/card name from the Trello board and ticket description to create a new feature branch.

    git checkout -b feature/1234-login-page

3.  Work & commit locally
    Use the ticket/card name from the Trello board and ticket description to create a new feature branch.

    git add .
    git commit -m "FEAT(1234): Add login page UI"

4.  Push your feature branch
    Once you're ready to push your feature, use the following command:
    git push origin feature/1234-login-page

5.  Keeping your branch up to date
    Periodically pull in the latest from dev to avoid large conflicts: # Fetch and update dev
    git fetch origin
    git checkout dev
    git pull origin dev

        # Merge or rebase into your feature branch
        git checkout feature/1234-login-page
        git merge dev
        # —or—
        git rebase dev

        # Resolve conflicts if any, then:
        git push origin feature/1234-login-page

6.  Open a merge request:
    On GitLab, create an MR from feature/<ticket-or-desc> → main.
    • Assign reviewers.
    • Link any related issues (e.g. Closes #<issue-number>).

7.  Sprint End Release:
    At the end of each sprint, the release engineer will:

# Merge the fully tested dev branch into main

git checkout main
git pull origin main
git merge --no-ff dev
git push origin main

8. Clean up
   git branch -d feature/1234-login-page # delete local
   git push origin --delete feature/1234-login-page # delete remote

# We're all in this together

If you have run out of energy or time for your project, put a note at the top of the README saying that development has slowed down or stopped completely. Someone may choose to fork your project or volunteer to step in as a maintainer or owner, allowing your project to keep going. You can also make an explicit request for maintainers.

## Trello Board

(https://trello.com/b/jVt44EQv/fast-capital)

## GitLab Commit

(https://gitlab.com/fastcapital/fastcapitaltest/-/commits/dev)

## Lessons Learned

1. Ensuring consistency in workflow is vital for consistent code.
2. If you expect your work will relate to someone else's work, communicate your expectations.
3. Git is complex.
4. Try to account for as many database entities and attributes as possible to minimalize refactoring.
5. Be ready to refactor.

## Potential Future Features

In the future, users should be able to:

1. View investments based off a chosen location.
2. Mark offers as "complete" to finalize an accord.

## Licenses

N/A
