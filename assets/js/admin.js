/* ===========================================
   UTHM Event Management System - Admin JavaScript
   File: assets/js/admin.js
   Description: JavaScript for admin pages
   =========================================== */

// ========== ADMIN DUMMY DATA ==========
let adminEvents = [
    {
        id: 1,
        title: "UTHM Tech Conference 2026",
        description: "Annual technology conference featuring latest innovations in software development, AI, and data science. Join us for keynote speeches, workshops, and networking opportunities.",
        date: "2026-02-15",
        time: "09:00 AM",
        location: "Dewan Kuliah Utama, UTHM",
        image: "assets/images/event1.jpg",
        participants: 45
    },
    {
        id: 2,
        title: "Engineering Innovation Expo",
        description: "Showcase of innovative engineering projects from UTHM students. Discover cutting-edge solutions and creative designs from various engineering disciplines.",
        date: "2026-03-20",
        time: "10:00 AM",
        location: "Faculty of Engineering, UTHM",
        image: "assets/images/event2.jpg",
        participants: 32
    },
    {
        id: 3,
        title: "Career Fair 2026",
        description: "Meet potential employers and explore career opportunities. Connect with industry leaders and learn about internships and job openings.",
        date: "2026-04-10",
        time: "08:30 AM",
        location: "Sports Complex, UTHM",
        image: "assets/images/event3.jpg",
        participants: 78
    }
];

// Dummy participants data
const dummyParticipants = {
    1: [
        { id: 1, name: "Ahmad bin Abdullah", email: "ahmad@student.uthm.edu.my", registrationDate: "2026-01-05" },
        { id: 2, name: "Siti Nurhaliza", email: "siti@student.uthm.edu.my", registrationDate: "2026-01-06" },
        { id: 3, name: "Muhammad Aiman", email: "aiman@student.uthm.edu.my", registrationDate: "2026-01-07" }
    ],
    2: [
        { id: 4, name: "Nurul Aina", email: "nurul@student.uthm.edu.my", registrationDate: "2026-01-05" },
        { id: 5, name: "Hafiz Rahman", email: "hafiz@student.uthm.edu.my", registrationDate: "2026-01-06" }
    ],
    3: [
        { id: 6, name: "Amirah Yasmin", email: "amirah@student.uthm.edu.my", registrationDate: "2026-01-05" },
        { id: 7, name: "Zulkifli Hassan", email: "zul@student.uthm.edu.my", registrationDate: "2026-01-06" },
        { id: 8, name: "Farah Diana", email: "farah@student.uthm.edu.my", registrationDate: "2026-01-07" }
    ]
};

// Current admin user
let currentAdmin = null;

// ========== UTILITY FUNCTIONS ==========

// Check if admin is logged in
function isAdminLoggedIn() {
    // TODO: Firebase Auth integration will be added here
    const admin = sessionStorage.getItem('currentAdmin');
    return admin !== null;
}

// Get current admin
function getCurrentAdmin() {
    // TODO: Firebase Auth integration will be added here
    const adminJSON = sessionStorage.getItem('currentAdmin');
    return adminJSON ? JSON.parse(adminJSON) : null;
}

// Redirect if not logged in
function requireAdminAuth() {
    if (!isAdminLoggedIn()) {
        alert('Please login as admin to access this page.');
        window.location.href = 'admin-login.html';
        return false;
    }
    return true;
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-MY', options);
}

// Get event by ID
function getAdminEventById(eventId) {
    return adminEvents.find(event => event.id === parseInt(eventId));
}

// ========== ADMIN AUTHENTICATION ==========

// Handle admin login
function handleAdminLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showError('Please fill in all fields.');
        return;
    }

    // TODO: Firebase Auth integration will be added here
    // For prototype, accept any admin credentials
    const admin = {
        id: Date.now(),
        email: email,
        name: 'Admin User',
        role: 'admin'
    };
    
    sessionStorage.setItem('currentAdmin', JSON.stringify(admin));
    
    alert('Admin login successful!');
    window.location.href = 'admin-dashboard.html';
}

// Handle admin logout
function handleAdminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // TODO: Firebase Auth integration will be added here
        sessionStorage.removeItem('currentAdmin');
        alert('Logged out successfully.');
        window.location.href = 'admin-login.html';
    }
}

// ========== ADMIN DASHBOARD ==========

// Load admin dashboard
function loadAdminDashboard() {
    if (!requireAdminAuth()) return;
    
    const admin = getCurrentAdmin();
    const welcomeElement = document.getElementById('welcome-message');
    if (welcomeElement) {
        welcomeElement.textContent = `Welcome, ${admin.name}`;
    }
    
    // Display statistics
    displayAdminStats();
    
    // Load events table
    loadAdminEvents();
}

// Display admin statistics
function displayAdminStats() {
    const totalEvents = adminEvents.length;
    const totalParticipants = adminEvents.reduce((sum, event) => sum + event.participants, 0);
    const upcomingEvents = adminEvents.filter(event => new Date(event.date) > new Date()).length;
    
    document.getElementById('total-events').textContent = totalEvents;
    document.getElementById('total-participants').textContent = totalParticipants;
    document.getElementById('upcoming-events').textContent = upcomingEvents;
}

// Load admin events in table
function loadAdminEvents() {
    const tbody = document.getElementById('events-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (adminEvents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No events found.</td></tr>';
        return;
    }
    
    adminEvents.forEach(event => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${event.id}</td>
            <td>${event.title}</td>
            <td>${formatDate(event.date)}</td>
            <td>${event.location}</td>
            <td>${event.participants}</td>
            <td>
                <button onclick="viewEvent(${event.id})" class="btn btn-primary" style="margin-right: 0.5rem;">View</button>
                <button onclick="editEvent(${event.id})" class="btn btn-secondary" style="margin-right: 0.5rem;">Edit</button>
                <button onclick="deleteEvent(${event.id})" class="btn btn-danger">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ========== EVENT CRUD OPERATIONS ==========

// Add new event
function handleAddEvent(event) {
    event.preventDefault();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const location = document.getElementById('location').value;
    const imageFile = document.getElementById('image').files[0];
    
    // Validation
    if (!title || !description || !date || !time || !location) {
        showError('Please fill in all required fields.');
        return;
    }

    // TODO: Firebase Firestore CRUD will be added here
    // TODO: Firebase Storage for image upload will be added here
    
    const newEvent = {
        id: Date.now(),
        title: title,
        description: description,
        date: date,
        time: time,
        location: location,
        image: imageFile ? `assets/images/${imageFile.name}` : 'assets/images/placeholder.jpg',
        participants: 0
    };
    
    adminEvents.push(newEvent);
    
    alert('Event added successfully!');
    window.location.href = 'admin-dashboard.html';
}

// View event details
function viewEvent(eventId) {
    window.location.href = `admin-view-participants.html?id=${eventId}`;
}

// Edit event
function editEvent(eventId) {
    window.location.href = `admin-edit-event.html?id=${eventId}`;
}

// Load event for editing
function loadEditEvent() {
    if (!requireAdminAuth()) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    
    if (!eventId) {
        alert('Event not found.');
        window.location.href = 'admin-dashboard.html';
        return;
    }
    
    const event = getAdminEventById(eventId);
    
    if (!event) {
        alert('Event not found.');
        window.location.href = 'admin-dashboard.html';
        return;
    }
    
    // Populate form
    document.getElementById('event-id').value = event.id;
    document.getElementById('title').value = event.title;
    document.getElementById('description').value = event.description;
    document.getElementById('date').value = event.date;
    document.getElementById('time').value = event.time;
    document.getElementById('location').value = event.location;
    
    // Display current image
    const currentImage = document.getElementById('current-image');
    if (currentImage) {
        currentImage.src = event.image;
        currentImage.onerror = function() { this.src = 'assets/images/placeholder.jpg'; };
    }
}

// Handle edit event form submission
function handleEditEvent(event) {
    event.preventDefault();
    
    const eventId = parseInt(document.getElementById('event-id').value);
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const location = document.getElementById('location').value;
    const imageFile = document.getElementById('image').files[0];
    
    // Validation
    if (!title || !description || !date || !time || !location) {
        showError('Please fill in all required fields.');
        return;
    }

    // TODO: Firebase Firestore CRUD will be added here
    // TODO: Firebase Storage for image upload will be added here
    
    const eventIndex = adminEvents.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
        adminEvents[eventIndex] = {
            ...adminEvents[eventIndex],
            title: title,
            description: description,
            date: date,
            time: time,
            location: location,
            image: imageFile ? `assets/images/${imageFile.name}` : adminEvents[eventIndex].image
        };
        
        alert('Event updated successfully!');
        window.location.href = 'admin-dashboard.html';
    } else {
        showError('Event not found.');
    }
}

// Delete event
function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        return;
    }

    // TODO: Firebase Firestore CRUD will be added here
    
    const eventIndex = adminEvents.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
        adminEvents.splice(eventIndex, 1);
        alert('Event deleted successfully.');
        loadAdminEvents();
    } else {
        alert('Event not found.');
    }
}

// ========== PARTICIPANTS MANAGEMENT ==========

// Load participants for an event
function loadParticipants() {
    if (!requireAdminAuth()) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    
    if (!eventId) {
        alert('Event not found.');
        window.location.href = 'admin-dashboard.html';
        return;
    }
    
    const event = getAdminEventById(eventId);
    
    if (!event) {
        alert('Event not found.');
        window.location.href = 'admin-dashboard.html';
        return;
    }
    
    // Display event title
    const eventTitleElement = document.getElementById('event-title');
    if (eventTitleElement) {
        eventTitleElement.textContent = event.title;
    }
    
    // TODO: Firebase Firestore query to get participants will be added here
    const participants = dummyParticipants[eventId] || [];
    
    renderParticipantsTable(participants);
}

// Render participants table
function renderParticipantsTable(participants) {
    const tbody = document.getElementById('participants-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (participants.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No participants registered yet.</td></tr>';
        return;
    }
    
    participants.forEach((participant, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${participant.name}</td>
            <td>${participant.email}</td>
            <td>${formatDate(participant.registrationDate)}</td>
        `;
        tbody.appendChild(row);
    });
    
    // Update participant count
    const countElement = document.getElementById('participant-count');
    if (countElement) {
        countElement.textContent = participants.length;
    }
}

// ========== IMAGE PREVIEW ==========

// Preview image before upload
function previewImage(input) {
    const preview = document.getElementById('image-preview');
    if (!preview) return;
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

// ========== ERROR HANDLING ==========

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}

// ========== PAGE INITIALIZATION ==========

// Initialize admin pages
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'admin-login.html':
            const loginForm = document.getElementById('admin-login-form');
            if (loginForm) {
                loginForm.addEventListener('submit', handleAdminLogin);
            }
            break;
            
        case 'admin-dashboard.html':
            loadAdminDashboard();
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', handleAdminLogout);
            }
            break;
            
        case 'admin-add-event.html':
            if (!requireAdminAuth()) return;
            const addForm = document.getElementById('add-event-form');
            if (addForm) {
                addForm.addEventListener('submit', handleAddEvent);
            }
            const addImageInput = document.getElementById('image');
            if (addImageInput) {
                addImageInput.addEventListener('change', function() {
                    previewImage(this);
                });
            }
            break;
            
        case 'admin-edit-event.html':
            loadEditEvent();
            const editForm = document.getElementById('edit-event-form');
            if (editForm) {
                editForm.addEventListener('submit', handleEditEvent);
            }
            const editImageInput = document.getElementById('image');
            if (editImageInput) {
                editImageInput.addEventListener('change', function() {
                    previewImage(this);
                });
            }
            break;
            
        case 'admin-view-participants.html':
            loadParticipants();
            break;
    }
});
