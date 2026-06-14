# RIDE-DISPATCHER AI Service

A Python FastAPI microservice providing machine-learning–powered endpoints for the RIDE-DISPATCHER platform.

---

## Features

| Endpoint | Model | Description |
|---|---|---|
| `POST /ai/fare/predict` | Random Forest | Fare estimation (INR) with surge |
| `POST /ai/dispatch/rank` | KD-Tree / Haversine | Driver ranking with ETA |
| `POST /ai/demand/forecast` | XGBoost | Ride demand by area & time |
| `POST /ai/sentiment/analyze` | TF-IDF + Logistic Regression | Review sentiment |
| `POST /ai/fraud/check` | Isolation Forest | User fraud/anomaly detection |
| `POST /ai/fraud/driver-performance` | Weighted scoring | Driver KPI grading |

---

## Project Structure

```
ai-service/
├── app/
│   ├── main.py              # FastAPI app, startup, CORS
│   ├── config.py            # Environment-based settings
│   ├── models/              # ML model classes (train + predict)
│   │   ├── fare_predictor.py
│   │   ├── smart_dispatch.py
│   │   ├── demand_forecaster.py
│   │   ├── sentiment_analyzer.py
│   │   ├── fraud_detector.py
│   │   └── driver_performance.py
│   ├── routers/             # FastAPI route handlers
│   │   ├── fare.py
│   │   ├── dispatch.py
│   │   ├── demand.py
│   │   ├── sentiment.py
│   │   └── fraud.py
│   ├── schemas/
│   │   └── requests.py      # Pydantic request/response models
│   └── utils/
│       ├── preprocessing.py # Haversine, encoding, surge helpers
│       └── model_loader.py  # Singleton model registry
├── trained_models/          # Auto-created joblib model files
├── data/
│   └── generate_sample_data.py  # Synthetic Surat ride CSV generator
├── requirements.txt
├── Dockerfile
└── README.md
```

---

## Quick Start (Local)

### 1. Install dependencies

```bash
cd ai-service
pip install -r requirements.txt
```

### 2. Run the service

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Models are **trained automatically on first startup** if `.joblib` files are not found in `trained_models/`.

### 3. Open API docs

- Swagger UI: http://localhost:8000/docs
- ReDoc:       http://localhost:8000/redoc
- Health:      http://localhost:8000/health

---

## Docker

```bash
# Build
docker build -t ride-dispatcher-ai .

# Run
docker run -p 8000:8000 ride-dispatcher-ai
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `HOST` | `0.0.0.0` | Bind address |
| `PORT` | `8000` | Listen port |
| `MODEL_DIR` | `trained_models/` | Where joblib model files are stored |
| `LOG_LEVEL` | `info` | Python logging level |
| `DATABASE_URL` | *(PostgreSQL URL)* | Passed through for downstream use |
| `AUTO_TRAIN_ON_STARTUP` | `true` | Train missing models at startup |

---

## API Examples

### Fare Prediction

```bash
curl -X POST http://localhost:8000/ai/fare/predict \
  -H "Content-Type: application/json" \
  -d '{
    "distance_km": 8.5,
    "ride_type": "cab",
    "hour_of_day": 18,
    "day_of_week": 4,
    "pickup_area": "Adajan",
    "traffic_factor": 1.4
  }'
```

### Driver Dispatch

```bash
curl -X POST http://localhost:8000/ai/dispatch/rank \
  -H "Content-Type: application/json" \
  -d '{
    "pickup_lat": 21.17,
    "pickup_lng": 72.83,
    "ride_type": "auto",
    "available_drivers": [
      {"id": "D001", "lat": 21.175, "lng": 72.835, "rating": 4.8, "completion_rate": 0.95},
      {"id": "D002", "lat": 21.160, "lng": 72.820, "rating": 4.2, "completion_rate": 0.88}
    ]
  }'
```

### Fraud Check

```bash
curl -X POST http://localhost:8000/ai/fraud/check \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "U12345",
    "cancellation_rate": 0.75,
    "booking_frequency": 15.0,
    "avg_distance": 0.3,
    "payment_failures": 8,
    "account_age_days": 3
  }'
```

### Sentiment Analysis

```bash
curl -X POST http://localhost:8000/ai/sentiment/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Excellent driver, very punctual and clean vehicle!"}'
```

---

## Synthetic Data Generation

```bash
python data/generate_sample_data.py
# → data/surat_rides.csv  (1000 rows)
```

---

## Tech Stack

- **FastAPI** 0.104 – async REST framework
- **scikit-learn** 1.3 – Random Forest, Isolation Forest, TF-IDF + LR
- **XGBoost** 2.0 – demand forecasting
- **joblib** – model persistence
- **Pydantic** v2 – request/response validation
- **uvicorn** – ASGI server
