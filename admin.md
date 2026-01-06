# Admin (ITC Event Organizer) Module Documentation

---

## 1. Admin Role Definition

In the ITC Event Management System, the **Admin** represents an **ITC Event Organizer** rather than a system-wide administrator.  
The Admin is responsible only for managing events organised by the Information Technology Club (ITC) and monitoring participant registrations related to those events.

The Admin does **not** manage system-level configurations, user accounts, or backend infrastructure. This role separation ensures a clear and manageable scope for the system.

---

## 2. Admin Responsibilities

The Admin (ITC Event Organizer) is responsible for:
- Creating new ITC events
- Updating existing event information
- Deleting events when necessary
- Uploading event posters or images
- Viewing participant registrations for events

The Admin does **not** have access to:
- Other admins’ data
- System analytics or logs
- User account management (except viewing participant lists)

---

## 3. Admin Access and Authentication

### 3.1 Login Requirement
Admins must log in using registered credentials to access the Admin Dashboard.

### 3.2 Role-Based Access Control
The system differentiates Admin and User roles using a role attribute stored in the database.  
Only users with the **admin role** can access Admin-related pages and functionalities.

---

## 4. Admin Pages Overview

### 4.1 Admin Login Page
The Admin Login Page allows ITC organisers to authenticate and access the Admin Dashboard.

**Key Features:**
- Email and password login
- Input validation
- Error messages for invalid credentials

---

### 4.2 Admin Dashboard Page
The Admin Dashboard acts as the main control panel for ITC event organisers.

**Displayed Information:**
- List of all ITC events created by the admin
- Summary of participant count for each event

**Functions:**
- Navigate to Add Event page
- Edit existing events
- Delete events
- View registered participants

---

### 4.3 Add Event Page
This page allows the Admin to create new ITC events.

**Input Fields:**
- Event title
- Event description
- Event date and time
- Event location
- Event poster/image upload

**Validation:**
- Required fields must be filled
- Date must be valid
- Image format validation

---

### 4.4 Edit Event Page
This page allows the Admin to modify existing ITC event details.

**Editable Information:**
- Event title
- Description
- Date and time
- Location
- Event image

---

### 4.5 Manage Events Page
This page displays all ITC events managed by the Admin.

**Functions:**
- View event details
- Edit event
- Delete event

---

### 4.6 View Participants Page
This page allows the Admin to view a list of registered participants for a selected ITC event.

**Displayed Information:**
- Participant name
- Email address
- Registration date

This page is read-only and does not allow modification of user data.

---

## 5. Admin Module CRUD Operations

| Entity | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| Event | Add new event | View event list | Edit event details | Remove event |
| Registration | – | View participants | – | – |

---

## 6. Security Considerations

The Admin module includes basic security measures:
- Authentication required for all admin pages
- Role validation before accessing admin functions
- Input validation to prevent invalid data entry
- Sanitisation of user input before database storage

---

## 7. Limitations of Admin Role

To maintain a focused project scope, the Admin role does not include:
- User account management
- System configuration management
- Analytics or reporting features
- Multi-admin privilege hierarchy

These limitations ensure the system remains practical, manageable, and suitable for academic project requirements.

---

## 8. Summary

The Admin (ITC Event Organizer) module enables authorised users to efficiently manage ITC events. By limiting the Admin role to event-related operations, the system maintains a clear structure, improves usability, and aligns with the project scope and development timeline.

---
