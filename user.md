# User (Student / Staff) Module Documentation

---

## 1. User Role Definition

In the UTHM Event Management System, a **User** represents a **student or staff member of Universiti Tun Hussein Onn Malaysia (UTHM)** who wishes to view, register for, and participate in campus events.

The User role is designed for **event participation**, not event management. Users interact with the system mainly to explore available events and manage their own registrations.

---

## 2. User Responsibilities

Users are responsible for:
- Creating a personal account
- Logging into the system
- Viewing available events
- Viewing detailed event information
- Registering for events
- Cancelling event registration if necessary
- Viewing registered events through their dashboard

Users do **not** have permission to:
- Create, edit, or delete events
- View other users’ personal data
- Access admin or organiser functionalities

---

## 3. User Access and Authentication

### 3.1 User Registration
Users must register an account before accessing system features.

**Required information:**
- Name
- Email address
- Password

All inputs are validated before account creation.

---

### 3.2 User Login
Registered users log in using their email and password to access user-specific features such as event registration and dashboard access.

---

## 4. User Pages Overview

### 4.1 User Registration Page
This page allows new users to create an account.

**Key Features:**
- Registration form
- Input validation
- Error handling for duplicate accounts or invalid inputs

---

### 4.2 User Login Page
This page allows users to authenticate and access the system.

**Key Features:**
- Email and password login
- Validation and error messages
- Redirect to User Dashboard after successful login

---

### 4.3 Home Page
The Home Page displays an overview of available events.

**Displayed Content:**
- Featured events
- Event posters or banners
- Brief event descriptions

---

### 4.4 Event Listing Page
This page displays a list of all available events.

**Functions:**
- View upcoming events
- Navigate to event detail pages

---

### 4.5 Event Details Page
This page provides detailed information about a selected event.

**Displayed Information:**
- Event title
- Description
- Date and time
- Location
- Event poster or image

**Action:**
- Register for the event (if logged in)

---

### 4.6 User Dashboard Page
The User Dashboard provides a personalised view for each user.

**Functions:**
- View registered events
- Access event details
- Cancel event registration

This dashboard helps users track their event participation efficiently.

---

## 5. User Module CRUD Operations

| Entity | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| User Account | Register account | View profile | – | – |
| Registration | Register event | View registered events | – | Cancel registration |

---

## 6. User Workflow

1. User registers an account
2. User logs into the system
3. User browses available events
4. User views event details
5. User registers for an event
6. User views registered events in the User Dashboard
7. User cancels registration if needed

---

## 7. Security Considerations

The User module includes the following security measures:
- Authentication required to register for events
- Input validation to prevent invalid or malicious data
- Role-based access control to restrict admin functionalities
- Protection of user data through controlled access

---

## 8. Limitations of User Role

To maintain system security and structure, users are restricted from:
- Managing event content
- Viewing other users’ registration data
- Accessing administrative pages

These limitations ensure proper separation between users and event organisers.

---

## 9. Summary

The User module provides students and staff with a simple and efficient interface to explore and participate in campus events. By focusing on event discovery and registration, the module enhances user engagement while maintaining a secure and well-structured system design.

---
