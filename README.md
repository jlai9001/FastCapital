# Fast Capital

## Getting started

To get started with this project, clone the respository from the development branch using the steps found below.

To run the front in project, use the following command:
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


    \c fastcapital

<!-- Seed Test Data in the fastcapital db -->

\i /data/fastcapitaldata.sql

**Start the FastAPI Server**

<!-- Start fastapi server (defaults to main.py) -->

    fastapi dev

<!-- Start fastapi server (defaults to main.py) -->

    visit [text](http://localhost:8000/docs) to test APIs

## Git Branching Workflow

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

## Authors and acknowledgment

Authors: Tyler McCallum, Bowe Jessop, Daniel Greenberg, Jonathan Lai

## Licenses

N/A

## Project status

If you have run out of energy or time for your project, put a note at the top of the README saying that development has slowed down or stopped completely. Someone may choose to fork your project or volunteer to step in as a maintainer or owner, allowing your project to keep going. You can also make an explicit request for maintainers.
CREATE DATABASE fastcapital
