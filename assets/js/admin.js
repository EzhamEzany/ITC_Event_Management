/* ===========================================
   ITC Event Management System - Admin JavaScript
   File: assets/js/admin.js
   Description: JavaScript for ITC organizer pages
   =========================================== */

// Import Firebase services
import { auth, db } from './firebase.js';
import { 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
    doc,
    getDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// ========== ADMIN DUMMY DATA ==========
let adminEvents = [
    {
        id: 1,
        title: "ITC Tech Talk 2026",
        description: "Annual technology talk featuring latest innovations in software development, AI, and data science. Join ITC for keynote speeches, workshops, and networking opportunities.",
        date: "2026-02-15",
        time: "09:00 AM",
        location: "Dewan Kuliah Utama, UTHM",
        image: "assets/images/event1.jpg",
        participants: 45
    },
    {
        id: 2,
        title: "ITC Coding Workshop",
        description: "Hands-on coding workshop organized by ITC. Learn programming fundamentals and best practices from experienced developers and industry professionals.",
        date: "2026-03-20",
        time: "10:00 AM",
        location: "Computer Lab, Faculty of FSKTM, UTHM",
        image: "assets/images/event2.jpg",
        participants: 32
    },
    {
        id: 3,
        title: "ITC Hackathon 2026",
        description: "24-hour coding competition organized by ITC. Form teams, solve challenges, and win prizes. Perfect for students passionate about technology and innovation.",
        date: "2026-04-10",
        time: "08:30 AM",
        location: "ITC Lab, UTHM",
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

// Admin email whitelist - Only these emails can access admin functions
const ADMIN_EMAILS = [
    'admin@itc.uthm.edu.my',
    'itc@uthm.edu.my',
    'organizer@itc.uthm.edu.my'
];

// ========== FIREBASE AUTH STATE LISTENER ==========

/**
 * Firebase Authentication State Listener for Admin
 * Monitors admin authentication state
 */
onAuthStateChanged(auth, async (user) => {
    currentAdmin = user;
    
    if (user) {
        // Admin is signed in, verify their role
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                currentAdmin = {
                    uid: user.uid,
                    email: user.email,
                    ...userData
                };
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
        }
    }
});

// ========== UTILITY FUNCTIONS ==========

// Check if admin is logged in
function isAdminLoggedIn() {
    // Firebase Auth provides the current user
    return auth.currentUser !== null;
}

// Get current admin
function getCurrentAdmin() {
    // Return the current authenticated admin from Firebase
    return currentAdmin;
}

/**
 * Require Admin Authentication
 * Redirects to login if not authenticated or not an admin
 */
async function requireAdminAuth() {
    if (!auth.currentUser) {
        alert('Please login as ITC organizer to access this page.');
        window.location.href = 'admin-login.html';
        return false;
    }
    
    try {
        // Verify user has admin role
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        
        if (!userDoc.exists()) {
            alert('User profile not found.');
            await signOut(auth);
            window.location.href = 'admin-login.html';
            return false;
        }
        
        const userData = userDoc.data();
        
        // Check if user has admin role OR is in admin email whitelist
        if (userData.role !== 'admin' && !ADMIN_EMAILS.includes(auth.currentUser.email)) {
            alert('Access denied. This page is for ITC organizers only.');
            await signOut(auth);
            window.location.href = 'admin-login.html';
            return false;
        }
        
        return true;
        
    } catch (error) {
        console.error('Error verifying admin:', error);
        alert('Authentication error. Please try again.');
        window.location.href = 'admin-login.html';
        return false;
    }
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

/**
 * Handle Admin Login
 * Authenticates admin with Firebase Auth and verifies admin role
 */
async function handleAdminLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showError('Please fill in all fields.');
        return;
    }

    try {
        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
            showError('User profile not found. Please contact support.');
            await signOut(auth);
            return;
        }
        
        const userData = userDoc.data();
        
        // Check if user has admin role OR is in admin email whitelist
        if (userData.role !== 'admin' && !ADMIN_EMAILS.includes(email)) {
            showError('Access denied. Only ITC organizers can login here.');
            await signOut(auth);
            return;
        }
        
        // Redirect to admin dashboard
        alert('ITC organizer login successful!');
        window.location.href = 'admin-dashboard.html';
        
    } catch (error) {
        console.error('Admin login error:', error);
        
        // Handle specific error codes
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            showError('Invalid email or password.');
        } else if (error.code === 'auth/invalid-email') {
            showError('Invalid email format.');
        } else if (error.code === 'auth/too-many-requests') {
            showError('Too many failed login attempts. Please try again later.');
        } else {
            showError('Login failed. Please try again.');
        }
    }
}

/**
 * Handle Admin Logout
 * Signs out admin from Firebase Auth
 */
async function handleAdminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            await signOut(auth);
            alert('Logged out successfully.');
            window.location.href = 'admin-login.html';
        } catch (error) {
            console.error('Logout error:', error);
            alert('Logout failed. Please try again.');
        }
    }
}

// ========== ADMIN DASHBOARD ==========

/**
 * Load Admin Dashboard
 * Verifies admin authentication and displays dashboard data
 */
async function loadAdminDashboard() {
    // Verify admin authentication
    const isAuthorized = await requireAdminAuth();
    if (!isAuthorized) return;
    
    try {
        // Get admin data from Firestore
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Display welcome message
            const welcomeElement = document.getElementById('welcome-message');
            if (welcomeElement) {
                welcomeElement.textContent = `Welcome, ${userData.name || 'ITC Organizer'}`;
            }
        }
        
        // Display statistics
        displayAdminStats();
        
        // Load events table
        loadAdminEvents();
        
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        showError('Error loading dashboard. Please try again.');
    }
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
    
    alert('ITC event added successfully!');
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
        
        alert('ITC event updated successfully!');
        window.location.href = 'admin-dashboard.html';
    } else {
        showError('Event not found.');
    }
}

// Delete event
function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this ITC event? This action cannot be undone.')) {
        return;
    }

    // TODO: Firebase Firestore CRUD will be added here
    
    const eventIndex = adminEvents.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
        adminEvents.splice(eventIndex, 1);
        alert('ITC event deleted successfully.');
        loadAdminEvents();
    } else {
        alert('Event not found.');
    }
}

// ========== PARTICIPANTS MANAGEMENT ==========

/**
 * Load Participants for an Event
 * Displays list of registered participants
 */
async function loadParticipants() {
    // Verify admin authentication
    const isAuthorized = await requireAdminAuth();
    if (!isAuthorized) return;
    
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
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No participants registered for this ITC event yet.</td></tr>';
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

/**
 * Initialize Admin Pages
 * Sets up event listeners and loads page-specific content
 */
document.addEventListener('DOMContentLoaded', async function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'admin-login.html':
            const loginForm = document.getElementById('admin-login-form');
            if (loginForm) {
                loginForm.addEventListener('submit', handleAdminLogin);
            }
            break;
            
        case 'admin-dashboard.html':
            await loadAdminDashboard();
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', handleAdminLogout);
            }
            break;
            
        case 'admin-add-event.html':
            const isAuthAdd = await requireAdminAuth();
            if (!isAuthAdd) return;
            
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
            const isAuthEdit = await requireAdminAuth();
            if (!isAuthEdit) return;
            
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
            await loadParticipants();
            break;
    }
});
