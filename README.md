# Opti-Gluco: Non-Invasive Blood Glucose Monitoring System
Opti-Gluco is an innovative non-invasive blood glucose monitoring system that enables users to measure their blood sugar levels without the need for painful finger pricking. This project was developed as the main project for my MCA degree, with the aim of providing a convenient and continuous glucose monitoring solution.

## How it Works
The system utilizes a laser light that passes through the user's blood when they place their finger on the device. The transmitted light is then captured as images, which are analyzed using a Convolutional Neural Network (CNN) model for image processing. By analyzing these images, the system can accurately determine the user's current blood glucose level and provide the sugar level range as output.

## Technologies Used
- Hardware: Raspberry Pi
- Operating System: Raspbian OS
- Back-end: Node.js, Express.js
- Front-end: React Native (for user interface)
- Image Processing: Convolutional Neural Network (CNN)

## --Versions
- node: v18.16.0
- expo: 50.0.7

## Key Features
- Non-invasive and continuous glucose monitoring
- Eliminates the need for finger pricking
- Accurate blood glucose level measurements
- User-friendly interface for easy monitoring
- Utilizes advanced image processing techniques (CNN)
- Portable and compact design

## Backend
In this project three servers are developed for implementing backend functionalities.
1. NodeJS server called as Main server act as bridge between the IoT device and the user.
2. Another Nodejs server integrated on the IoT device for enable the communication between user and the device.
3. Third one is a flask server for handle the machine learning side of the project.

## Frontend
In this project frontend is done with React-native andd through this mobile app the user can easily interact with the system.

## Databases
In this project PostgreSQL and SQLite 3 are used as databases. 
 - postgreSQL is used in main server
 - SQLite is used in server integrated in the IoT device.
 - Sequelize is used as ORM

## Getting Started
To get started with opti-gluco, follow the instructions in this Installation Guide. 
- First install all the project dependencies for each servers.
- Each servers are in the following folders
   1. MainServer
   2. IotServer
   3. ML-server
- Install project dependencies by using the command npm install
To start the React native application
- First entered into the SampleApp folder
- Install the project Dependencies
- Install and set up the expo-cli as per the expo's documentation

## Run the Project
- Power the IoT device
- Start all the node servers using the command >> npm start
- Start the Flask server using the command >> python app.py
- Start the Expo using the command >> npx expo start
