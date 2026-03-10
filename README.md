UniVoy – Study Abroad Consultancy Web Application
Overview

UniVoy is a web-based Study Abroad Consultancy Management System developed using the MERN Stack (MongoDB, Express.js, React.js, Node.js).
The platform connects students, consultants, and administrators to streamline the process of applying to international universities.

Students can search for universities, create profiles, submit applications with documents, and track their application status. Consultants verify applications and assist with the admission process, while administrators manage users, consultants, and the university database.

This system simplifies the study abroad admission workflow and improves communication between all stakeholders.

Features
Student Portal

Student Registration & Login

Multi-step Profile Form

Upload Documents (Passport, Certificates, etc.)

Search Universities

Apply for Programs

Track Application Status

Profile Completion Percentage

Consultant Portal

Consultant Login

View Assigned Students

Review Student Applications

Verify Documents

Update Application Status

Communicate with Admin

Admin Portal

Admin Login

Manage Students

Manage Consultants

Assign Consultants to Students

View Student Profiles

Manage University Database

Update Application Status

Tech Stack
Frontend

React.js

Material UI (MUI)

JavaScript

HTML5

CSS3

Backend

Node.js

Express.js

Database

MongoDB

MongoDB Atlas (Cloud Database)

Other Tools

Git & GitHub

REST APIs

LocalStorage (for temporary frontend data handling)

Project Architecture

The system is divided into three main modules:

Student Module

Profile creation

Application submission

Document uploads

Consultant Module

Student verification

Application processing

Admin Module

System management

Consultant assignment

University database management

Folder Structure
UniVoy
│
├── frontend
│   ├── components
│   ├── pages
│   ├── dashboard
│   └── forms
│
├── backend
│   ├── models
│   ├── controllers
│   ├── routes
│   └── server.js
│
└── README.md
Installation
1 Clone the repository
git clone https://github.com/your-username/univoy.git
2 Navigate to project folder
cd univoy
3 Install dependencies

Frontend

npm install

Backend

cd backend
npm install
Run the Project

Start backend server

npm start

Start frontend

npm run dev
Future Improvements

Online Payment Integration

Real-time Notifications

University Recommendation System

Chat System between Students and Consultants

Email Notifications

Document Verification System

Author

Mian Ahmad Affaq

Final Year Project – BS Information Technology

License

This project is developed for educational purposes.
