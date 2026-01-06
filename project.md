# ITC Event Management System  
**Course:** BIT21503 – Web Development  
**Project Type:** Group Project (Website Development)  

---

## 1. Project Overview

The **ITC Event Management System** is a web-based application developed to manage, promote, and coordinate events organised by the **Information Technology Club (ITC)** under the Faculty of Computer Science and Information Technology, Universiti Tun Hussein Onn Malaysia (UTHM).  

The system provides a centralised platform for ITC event organisers to publish and manage events, while allowing students and staff to view and register for events online.

This project aims to replace traditional event promotion methods such as posters, emails, and social media messages with a structured, efficient, and accessible web system dedicated to ITC activities.

---

## 2. Objectives

The main objectives of this project are:
- To develop a dynamic website using HTML, CSS, and JavaScript.
- To implement a backend system for user authentication and data management.
- To allow ITC organisers to manage events using CRUD operations.
- To allow users to register for and manage their event participation.
- To store and manage event data using a database.
- To ensure the website is responsive, secure, and user-friendly.

---

## 3. User Roles

The system consists of two main user roles:

### 3.1 Admin (ITC Organizer)
Admins represent **ITC committee members or event organisers**. They are responsible for managing ITC event content and monitoring registrations.

**Admin responsibilities:**
- Log in to the system
- Create new ITC events
- Update existing event details
- Delete events
- Upload event images or posters
- View registered participants for each event

---

### 3.2 User (Student / Staff)
Users represent **UTHM students or staff members** who wish to participate in ITC-organised events.

**User responsibilities:**
- Register and log in to the system
- View available ITC events
- View detailed event information
- Register for events
- Cancel event registration
- View registered events through a personal dashboard

---

## 4. System Modules

### 4.1 Authentication Module
This module manages access control to the system.

**Functions:**
- User registration
- User login
- Logout
- Role-based access (Admin or User)

---

### 4.2 Event Management Module (Admin)
This module allows ITC organisers to manage event information.

**Functions:**
- Add event
- Edit event
- Delete event
- Upload event images
- Set event date, time, and location

---

### 4.3 Event Listing Module
This module allows users to browse available ITC events.

**Functions:**
- Display list of upcoming events
- View event details such as description, date, venue, and poster

---

### 4.4 Event Registration Module (User)
This module allows users to participate in ITC events.

**Functions:**
- Register for an event
- Prevent duplicate registrations
- Cancel event registration
- Store registration records in the database

---

### 4.5 User Dashboard Module
This module provides a personalised interface for users.

**Functions:**
- View registered ITC events
- Manage event participation
- Access event details

---

### 4.6 Admin Dashboard Module
This module provides management tools for ITC organisers.

**Functions:**
- View all ITC events
- View number of participants per event
- Manage event content

---

### 4.7 Multimedia Content Module
This module enhances the user experience through multimedia elements.

**Functions:**
- Event posters and images
- Banner images on homepage
- Embedded videos (optional)

---

## 5. Database Design (Firebase – NoSQL)

The system uses **Firebase Cloud Firestore** as the backend database.  
Although Firestore does not use traditional tables, the data structure follows relational concepts using collections and document references.

### 5.1 Collections

#### users
- user_id (document ID)
- name
- email
- role (admin / user)

#### events
- event_id (document ID)
- title
- description
- date
- location
- image_url

#### registrations
- registration_id (document ID)
- user_id (reference)
- event_id (reference)
- registration_date

---

## 6. CRUD Operations

| Module | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| Users | Register | Login/Profile | Update profile (optional) | – |
| Events (Admin) | Add event | View events | Edit event | Delete event |
| Registrations | Register event | View registrations | Cancel registration | Remove registration |

---

## 7. System Workflow

### User Flow
1. User registers an account
2. User logs in
3. User browses available ITC events
4. User views event details
5. User registers for an event
6. User views registered events in dashboard

### Admin Flow
1. Admin logs in
2. Admin creates an ITC event
3. Admin edits or deletes event details
4. Admin views registered participants

---

## 8. Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Firebase Authentication, Firebase Cloud Firestore
- **Hosting / Deployment:** Faculty server
- **Version Control:** GitHub

---

## 9. Conclusion

The ITC Event Management System provides a structured and efficient platform for managing events organised by the Information Technology Club. By integrating frontend technologies with a cloud-based backend, the system improves event visibility, participation tracking, and overall ITC event management efficiency. The project demonstrates essential web development concepts including CRUD operations, database integration, authentication, responsive design, and security practices.

---
