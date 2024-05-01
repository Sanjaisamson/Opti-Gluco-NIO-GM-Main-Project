import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
import io
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from tensorflow import keras
from PIL import Image
import pandas as pd 
from sklearn.model_selection import train_test_split 
from sklearn.linear_model import LogisticRegression 
from sklearn.metrics import accuracy_score, confusion_matrix 

app = Flask(__name__)


def load_model():
  model = tf.keras.models.load_model('C:\\Users\\SANJAI\\OneDrive\\Documents\\Main_Project\\ML_server\\opti_gluco_model.h5', compile=False)
  model.compile()
  return model

def preprocess_img(buffer_data):
   image_bytes = bytes(buffer_data)
   image_array = np.frombuffer(image_bytes, dtype=np.uint8)
   byte_io = io.BytesIO(image_array)
   preprocessed_image = tf.keras.preprocessing.image.load_img(byte_io, target_size=(224, 224))
   img_array = tf.keras.preprocessing.image.img_to_array(preprocessed_image)
   img_array = np.expand_dims(img_array, axis=0)
   processed_img = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
   return processed_img

@app.route('/sugar-level', methods=['POST'])
def sugarLevel():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 
    model = load_model()
    buffer_data = data["bufferdata"]
    extracted_buffer_data = buffer_data["data"]
    processed_img = preprocess_img(extracted_buffer_data)
    predictions = model.predict(processed_img)
    class_labels = {
        0: "111-125",
        1: "85-95",
        2: "96-110"
    }
    predicted_class = np.argmax(predictions)
    predicted_label = class_labels[predicted_class]

    print("Predicted category:", predicted_label)

    return jsonify(predicted_label)

@app.route('/prediction', methods=['POST'])
def predict():
    print("call reached")
    result = 0
    data = request.get_json()
    gender = int(data['gender'])
    age = int(data['age'])
    hypertension = int(data['hypertension_status'])
    heart_disease = int(data['heartdisease_status'])
    smoking_history = int(data['smoking_status'])
    bmi	= float(data['BMI_Value'])
    HbA1c_level	= float(data['HbA1c'])
    blood_glucose_level = int(data['sugar_level'])
    print("data", gender)
    data = pd.read_csv("C:\\Users\\SANJAI\\OneDrive\\Documents\\diabetes_prediction_dataset(edited).csv")
    x = data[['gender','age','hypertension','heart_disease','smoking_history','bmi','HbA1c_level','blood_glucose_level']]
    y = data['diabetes']
    x_train,x_test,y_train,y_test = train_test_split(x,y,test_size=0.2,stratify=y, random_state=1)
    model = LogisticRegression()
    model.fit(x_train,y_train)
    input_data = (gender,age,hypertension,heart_disease,smoking_history,bmi,HbA1c_level,blood_glucose_level)
    input_data_narray = np.asarray(input_data)
    input_reshaped = input_data_narray.reshape(1, -1)
    prediction = model.predict(input_reshaped)
    print("prediction",prediction)
    if prediction[0] == 1 :
       result = 1
    else :
       result = 0
    return jsonify(result)
if __name__ == '__main__':
  app.run(debug=True)  
# os.environ['CUDA_VISIBLE_DEVICES'] = '-1'

# if tf.test.gpu_device_name():
#     print('GPU found')
# else:
#     print("No GPU found")