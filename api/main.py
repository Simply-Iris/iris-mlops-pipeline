from fastapi import FastAPI , HTTPException
from pydantic import BaseModel
import joblib
import os
import numpy as np
import redis 
import json
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime
from prometheus_fastapi_instrumentator import Instrumentator
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
Instrumentator().instrument(app).expose(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "/model_store/model.pkl"

if not os.path.exists(MODEL_PATH):
    raise RuntimeError("model not found, please check if trainer has completed its job")

model = joblib.load(MODEL_PATH)
print("Model has been loaded Successfully")

cache = redis.Redis(host="redis", port=6379, decode_responses=True)

DATABASE_URL = (f"postgresql://{os.getenv('POSTGRES_USER')}:"
                f"{os.getenv('POSTGRES_PASSWORD')}@postgres:5432/"
                f"{os.getenv('POSTGRES_DB')}"
)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer,primary_key=True)
    sepal_length = Column(Float)
    sepal_width = Column(Float)
    petal_length = Column(Float)
    petal_width = Column(Float)
    prediction = Column(String)
    confidence = Column(Float)
    cached = Column(Boolean)
    timestamp = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

class IrisFeatures(BaseModel):
    sepal_length: float
    sepal_width: float
    petal_length: float
    petal_width: float

LABELS = {0: "Iris-setosa", 1: "Iris-versicolor", 2: "Iris-virginica"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
@app.get("/history")
def history():
    db = SessionLocal()
    try:
        records = db.query(Prediction).order_by(Prediction.timestamp.desc()).limit(20).all()
        return [
            { 
                "id": r.id,
                "prediction": r.prediction,
                "confidence": r.confidence,
                "cached": r.cached,
                "timestamp": r.timestamp,
                "features": {
                    "sepal_length" : r.sepal_length,
                    "sepal_width" : r.sepal_width,
                    "petal_length" : r.petal_length,
                    "petal_width" : r.petal_width
                }
            }
            for r in records
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
@app.post("/predict")
def predict(features : IrisFeatures):
    try:
        cache_key = f"{features.sepal_length}-{features.sepal_width}-{features.petal_length}-{features.petal_width}"
        
        cached = cache.get(cache_key)

        if cached:
            result= json.loads(cached)
            result["cached"] = True
        else:
            input_array = np.array([[
                features.sepal_length,
                features.sepal_width,
                features.petal_length,
                features.petal_width
            ]])

            prediction = model.predict(input_array)[0]
            probabilty = model.predict_proba(input_array)[0].max()

            result = {
                "prediction" : LABELS[prediction],
                "confidence" : round(float(probabilty),4),
                "cached" : False
            }

            cache.setex(cache_key,3600,json.dumps(result))
        
        db = SessionLocal()
        try:
            record = Prediction(
                sepal_length = features.sepal_length,
                sepal_width = features.sepal_width,
                petal_length = features.petal_length,
                petal_width = features.petal_width,
                prediction = result["prediction"],
                confidence = result["confidence"],
                cached = result["cached"]
            )
            db.add(record)
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            db.close()
            
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))