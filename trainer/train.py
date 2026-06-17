from sklearn.ensemble import RandomForestClassifier
import pandas as pd 
import joblib
import os
import mlflow
import mlflow.sklearn
import warnings
from sklearn.datasets import load_iris
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.exceptions import ConvergenceWarning

warnings.filterwarnings("ignore",category=ConvergenceWarning)

mlflow.set_tracking_uri("http://mlflow:5000")
mlflow.set_experiment("iris-nn")

print("loading dataset")
iris = load_iris()
x , y = iris.data, iris.target

X_train, X_test, Y_train, Y_test = train_test_split(x, y, test_size=0.2, random_state=42)
with mlflow.start_run():
    hidden_layers = (64,32)
    max_iter = 500
    learning_rate = 0.001
    test_size = 0.2
    random_state = 42

    print("training model(MLPClassifier)")
    for epoch in range(1,max_iter+1):
        model = MLPClassifier(
            hidden_layer_sizes=hidden_layers,
            max_iter=epoch,
            learning_rate_init=learning_rate,
            random_state=random_state,
            activation='relu',
            warm_start=True
        )

        model.fit(X_train,Y_train)
        accuracy = model.score(X_test,Y_test)
        mlflow.log_metric("accuracy",accuracy,step=epoch)
    
    print (f"Model Accuracy: {accuracy:.2f}")
   
    mlflow.log_param("hidden_layers",hidden_layers)
    mlflow.log_param("max_iter",max_iter)
    mlflow.log_param("learning_rate",learning_rate)
    mlflow.log_param("random_state",random_state)
    mlflow.sklearn.log_model(model,"MLP_Model")
   
os.makedirs("/model_store", exist_ok=True)
joblib.dump(model, "/model_store/model.pkl")
print("Model saved at /model_store/model.pkl")