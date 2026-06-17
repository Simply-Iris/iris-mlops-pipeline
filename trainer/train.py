import pandas as pd 
import joblib
import os
import mlflow
import mlflow.sklearn
from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

mlflow.set_tracking_uri("http://mlflow:5000")
mlflow.set_experiment("iris-classifier")

print("loading dataset")
iris = load_iris()
x , y = iris.data, iris.target

X_train, X_test, Y_train, Y_test = train_test_split(x, y, test_size=0.2, random_state=42)
with mlflow.start_run():
    n_estimators = 100
    random_state = 42
    test_size = 0.2

    print("training model(Randomforestclassifier)")
    model = RandomForestClassifier(n_estimators=n_estimators,random_state=random_state)
    model.fit(X_train,Y_train)

    accuracy = model.score(X_test,Y_test)
    
    print (f"Model Accuracy: {accuracy:.2f}")
   
    mlflow.log_param("n_estimators",n_estimators)
    mlflow.log_param("random_state",random_state)
    mlflow.log_param("test_size",test_size)
    mlflow.log_metric("accuracy",accuracy)
    mlflow.sklearn.log_model(model,"random-forest-model")
   
os.makedirs("/model_store", exist_ok=True)
joblib.dump(model, "/model_store/model.pkl")
print("Model saved at /model_store/model.pkl")