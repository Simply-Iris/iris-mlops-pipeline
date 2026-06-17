# 🌸 Iris MLOps Pipeline

I built this to actually learn Docker properly — not just `docker run hello-world` and call it a day, but a real multi-service system with the kind of plumbing you'd find behind an actual ML product. Iris classification is the "hello world" of ML, which made it perfect: simple enough that the *model* was never the hard part, so all my attention went into the infrastructure around it.

## What's actually going on here

It's not just a model sitting in a notebook. It's a small ecosystem of containers that each do one job and talk to each other:

```
[trainer] → trains model → [shared volume] → [api] → serves predictions
                ↓                                ↓
            [MLflow]                    [Redis cache + PostgreSQL]
                                                  ↓
                                          [React frontend]

[Prometheus] ← scrapes metrics ← [api]
       ↓
[Grafana] → turns metrics into dashboards
```

Train, serve, cache, log, monitor — the whole loop.

## The services

| Service | Job |
|---|---|
| **trainer** | Trains a classifier (Random Forest on `main`, a Neural Network on `neural-network`) and logs everything to MLflow |
| **api** | FastAPI server — `/predict`, `/history`, `/health` |
| **frontend** | React app for making predictions and browsing history without touching curl |
| **redis** | Caches repeated predictions so identical inputs return instantly |
| **postgres** | Every prediction gets logged here, permanently, with timestamps and cache status |
| **mlflow** | Tracks every training run — parameters, metrics, model versions |
| **prometheus** | Scrapes live metrics from the API |
| **grafana** | Pretty dashboards for those metrics |

## Why Iris, though?

Iris is about as basic as datasets get — 150 rows, 4 features, 3 classes. That was deliberate, not a limitation I'm pretending isn't there: I'm running this on an Intel i5 with 8GB of RAM, and the entire point of this project was learning Docker and MLOps tooling, not pushing model performance. A heavier dataset (or a deep learning model with real GPU requirements) would've meant most of my limited RAM going to training instead of running 7+ containers side by side comfortably.

Keeping the model itself trivial meant I could spend my actual compute budget on the infrastructure — Compose, caching, a database, monitoring, CI/CD — which was the actual skill I was after. The architecture here would handle a much heavier model with basically no changes; swap what's inside `trainer/train.py` and everything else (the API, the volume sharing, the caching layer, the tracking) still works exactly the same.

## Branches

- `main` — Random Forest baseline
- `neural-network` — MLPClassifier, with configurable activation functions and per-epoch accuracy logging so you can actually watch it learn in MLflow (something Random Forest can't show you)

## Running it yourself

```bash
git clone https://github.com/Simply-Iris/iris-mlops-pipeline.git
cd iris-mlops-pipeline
cp .env.example .env   # then fill in your own values
docker compose up --build
```

Once it's all up:

| What | Where |
|---|---|
| Frontend | `http://localhost:5173` |
| API docs | `http://localhost:8000/docs` |
| MLflow | `http://localhost:5001` |
| Grafana | `http://localhost:3000` (admin/admin) |
| Prometheus | `http://localhost:9090` |

## Stack

Python · FastAPI · scikit-learn · MLflow · Redis · PostgreSQL · SQLAlchemy · Docker · Docker Compose · React · Prometheus · Grafana · GitHub Actions

## Still on the list

- [ ] Containerise the React frontend properly (multi-stage build, served via nginx)
- [ ] A `model-comparison` branch — RF vs NN side by side, since both already log to MLflow and can be compared there in the meantime
- [ ] JWT auth on the API
- [ ] HTTPS for anything beyond local dev
- [ ] Multi-stage builds across the board to slim the image sizes down (the trainer image is currently a bit chunky)

## CI/CD setup

GitHub Actions builds and pushes both Docker images to Docker Hub automatically on every push to `main` or `neural-network` (`.github/workflows/ci.yml`). To get this running on a fork:

1. Generate a Docker Hub access token: **Account Settings → Security → New Access Token** (give it Read & Write so it can push images, not just pull them).
2. In your GitHub repo, go to **Settings → Secrets and Variables → Actions → New Repository Secret**, and add two *separate* secrets:
   - `DOCKERHUB_USERNAME` — your Docker Hub username
   - `DOCKER_TOKEN` — the access token from step 1
3. Push to `main` or `neural-network` and check the **Actions** tab — it should build the trainer and api images and push them straight to your Docker Hub.

Secrets never get copied if someone forks the repo — they'd need to add their own. That's by design; it's also why the workflow references `${{ secrets.DOCKERHUB_USERNAME }}` instead of a hardcoded username, so the same workflow file works for anyone who clones it.

## A note on secrets

Nothing sensitive is committed — credentials live in a `.env` file that's gitignored. Copy `.env.example`, fill in your own values, and you're set.

---

Built while learning Docker from scratch, mostly at odd hours, with way too many emoji along the way. 🌸
