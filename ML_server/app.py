import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
import io
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from tensorflow import keras
from PIL import Image


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

@app.route('/predict', methods=['POST'])
def predict():
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


if __name__ == '__main__':
  app.run(debug=True)  
# os.environ['CUDA_VISIBLE_DEVICES'] = '-1'

# if tf.test.gpu_device_name():
#     print('GPU found')
# else:
#     print("No GPU found")