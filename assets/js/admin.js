/* ===========================================
   ITC Event Management System - Admin JavaScript
   File: assets/js/admin.js
   Description: JavaScript for ITC organizer pages
   =========================================== */

// Import Firebase services
import { auth, db, storage } from './firebase.js';
import { 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
    doc,
    getDoc,
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import {
    ref,
    uploadBytes,
    getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';

// ========== EVENTS DATA (Loaded from Firestore) ==========
// Events are now loaded dynamically from Firestore
// No more dummy data!

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
    
    // Handle page guards for all admin pages
    const currentPage = window.location.pathname.split('/').pop();
    
    // Admin-only pages that require authentication
    const adminPages = [
        'admin-dashboard.html',
        'admin-add-event.html',
        'admin-edit-event.html',
        'admin-view-participants.html'
    ];
    
    if (adminPages.includes(currentPage)) {
        if (user) {
            // User is authenticated, verify admin role
            const isAuthorized = await requireAdminAuth();
            if (isAuthorized) {
                // Trigger page-specific initialization
                initializeAdminPage(currentPage);
            }
        } else {
            // No user, redirect to login
            alert('Please login as ITC organizer to access this page.');
            window.location.href = 'admin-login.html';
        }
    } else if (currentPage === 'admin-login.html' && user) {
        // Admin just logged in from login page, verify role and redirect
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                // Check if user has admin role OR is in admin email whitelist
                if (userData.role === 'admin' || ADMIN_EMAILS.includes(user.email)) {
                    window.location.href = 'admin-dashboard.html';
                }
            }
        } catch (error) {
            console.error('Error verifying admin:', error);
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

/**
 * Get event by ID from Firestore
 * @param {string} eventId - Firestore document ID
 */
async function getEventById(eventId) {
    try {
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (eventDoc.exists()) {
            return {
                id: eventDoc.id,
                ...eventDoc.data()
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting event:', error);
        return null;
    }
}

/**
 * Upload event image to Firebase Storage
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<string>} - Download URL of uploaded image
 */
async function uploadEventImage(imageFile) {
    if (!imageFile) {
        return null;
    }
    
    try {
        // Create unique filename with timestamp
        const timestamp = Date.now();
        const sanitizedFileName = imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const filename = `events/${timestamp}_${sanitizedFileName}`;
        
        // Create storage reference
        const storageRef = ref(storage, filename);
        
        // Upload file to Firebase Storage
        await uploadBytes(storageRef, imageFile);
        
        // Get download URL
        const downloadURL = await getDownloadURL(storageRef);
        
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image. Please try again.');
    }
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
        
        // Success - onAuthStateChanged will handle redirect
        alert('ITC organizer login successful!');
        
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
    // This function is now only called after auth state is confirmed by onAuthStateChanged
    // No need to verify auth again here
    
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
        
        // Display statistics and load events
        await displayAdminStats();
        await loadAdminEvents();
        
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        showError('Error loading dashboard. Please try again.');
    }
}

/**
 * Display admin statistics from Firestore
 */
async function displayAdminStats() {
    try {
        // Get all events
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        const totalEvents = eventsSnapshot.size;
        
        // Get all registrations
        const registrationsSnapshot = await getDocs(collection(db, 'registrations'));
        const totalParticipants = registrationsSnapshot.size;
        
        // Count upcoming events
        const today = new Date().toISOString().split('T')[0];
        let upcomingEvents = 0;
        eventsSnapshot.forEach((doc) => {
            const eventData = doc.data();
            if (eventData.date >= today) {
                upcomingEvents++;
            }
        });
        
        // Update display
        const totalEventsEl = document.getElementById('total-events');
        const totalParticipantsEl = document.getElementById('total-participants');
        const upcomingEventsEl = document.getElementById('upcoming-events');
        
        if (totalEventsEl) totalEventsEl.textContent = totalEvents;
        if (totalParticipantsEl) totalParticipantsEl.textContent = totalParticipants;
        if (upcomingEventsEl) upcomingEventsEl.textContent = upcomingEvents;
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

/**
 * Load admin events from Firestore into table
 */
async function loadAdminEvents() {
    const tbody = document.getElementById('events-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Loading events...</td></tr>';
    
    try {
        // Get all events ordered by date
        const eventsQuery = query(collection(db, 'events'), orderBy('date', 'desc'));
        const eventsSnapshot = await getDocs(eventsQuery);
        
        tbody.innerHTML = '';
        
        if (eventsSnapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No events found.</td></tr>';
            return;
        }
        
        // Get participant counts for each event
        let eventIndex = 1;
        for (const eventDoc of eventsSnapshot.docs) {
            const eventData = eventDoc.data();
            
            // Count participants for this event
            const registrationsQuery = query(
                collection(db, 'registrations'),
                where('eventId', '==', eventDoc.id)
            );
            const registrationsSnapshot = await getDocs(registrationsQuery);
            const participantCount = registrationsSnapshot.size;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${eventIndex++}</td>
                <td>${eventData.title}</td>
                <td>${formatDate(eventData.date)}</td>
                <td>${eventData.location}</td>
                <td>${participantCount}</td>
                <td>
                    <button onclick="viewParticipants('${eventDoc.id}')" class="btn btn-primary" style="margin-right: 0.5rem;">View</button>
                    <button onclick="editEvent('${eventDoc.id}')" class="btn btn-secondary" style="margin-right: 0.5rem;">Edit</button>
                    <button onclick="deleteEvent('${eventDoc.id}')" class="btn btn-danger">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        }
        
    } catch (error) {
        console.error('Error loading events:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Error loading events. Please try again.</td></tr>';
    }
}

// ========== EVENT CRUD OPERATIONS ==========

/**
 * Add new event to Firestore
 */
async function handleAddEvent(event) {
    event.preventDefault();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const location = document.getElementById('location').value;
    const imageFile = document.getElementById('image').files[0];
    
    // Validation
    if (!title || !description || !date || !location) {
        showError('Please fill in all required fields.');
        return;
    }

    try {
        // Default placeholder image
        let imageUrl = 'assets/images/placeholder.jpg';
        
        // Upload image to Firebase Storage if provided
        if (imageFile) {
            imageUrl = await uploadEventImage(imageFile);
        }
        
        // Create event object
        const eventData = {
            title: title,
            description: description,
            date: date,
            time: time || '',
            location: location,
            imageUrl: imageUrl,
            createdBy: auth.currentUser.uid,
            createdAt: new Date().toISOString()
        };
        
        // Add to Firestore
        await addDoc(collection(db, 'events'), eventData);
        
        alert('ITC event added successfully!');
        window.location.href = 'admin-dashboard.html';
        
    } catch (error) {
        console.error('Error adding event:', error);
        showError('Failed to add event. Please try again.');
    }
}

/**
 * Navigate to view participants page
 */
function viewParticipants(eventId) {
    window.location.href = `admin-view-participants.html?id=${eventId}`;
}

/**
 * Navigate to edit event page
 */
function editEvent(eventId) {
    window.location.href = `admin-edit-event.html?id=${eventId}`;
}

/**
 * Load event for editing from Firestore
 */
async function loadEditEvent() {
    const isAuthorized = await requireAdminAuth();
    if (!isAuthorized) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    
    if (!eventId) {
        alert('Event not found.');
        window.location.href = 'admin-dashboard.html';
        return;
    }
    
    try {
        const event = await getEventById(eventId);
        
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
        
        // Populate time field if it exists
        const timeInput = document.getElementById('time');
        if (timeInput && event.time) {
            timeInput.value = event.time;
        }
        
        document.getElementById('location').value = event.location;
        
        // Display current image
        const currentImage = document.getElementById('current-image');
        if (currentImage) {
            currentImage.src = event.imageUrl || 'assets/images/placeholder.jpg';
            currentImage.onerror = function() { this.src = 'assets/images/placeholder.jpg'; };
        }
        
    } catch (error) {
        console.error('Error loading event:', error);
        alert('Error loading event. Please try again.');
        window.location.href = 'admin-dashboard.html';
    }
}

/**
 * Handle edit event form submission with Firestore update
 */
async function handleEditEvent(event) {
    event.preventDefault();
    
    const eventId = document.getElementById('event-id').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const location = document.getElementById('location').value;
    const imageFile = document.getElementById('image').files[0];
    
    // Validation
    if (!title || !description || !date || !location) {
        showError('Please fill in all required fields.');
        return;
    }

    try {
        // Get current event data
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        
        if (!eventDoc.exists()) {
            showError('Event not found.');
            return;
        }
        
        // Prepare update data
        const updateData = {
            title: title,
            description: description,
            date: date,
            time: time || '',
            location: location,
            updatedAt: new Date().toISOString()
        };
        
        // Upload new image to Firebase Storage if provided
        if (imageFile) {
            updateData.imageUrl = await uploadEventImage(imageFile);
        }
        
        // Update in Firestore
        await updateDoc(doc(db, 'events', eventId), updateData);
        
        alert('ITC event updated successfully!');
        window.location.href = 'admin-dashboard.html';
        
    } catch (error) {
        console.error('Error updating event:', error);
        showError('Failed to update event. Please try again.');
    }
}

/**
 * Delete event from Firestore
 */
async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this ITC event? This action cannot be undone.')) {
        return;
    }

    try {
        // Delete event document
        await deleteDoc(doc(db, 'events', eventId));
        
        // Also delete all registrations for this event
        const registrationsQuery = query(
            collection(db, 'registrations'),
            where('eventId', '==', eventId)
        );
        const registrationsSnapshot = await getDocs(registrationsQuery);
        
        // Delete each registration
        const deletePromises = registrationsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        alert('ITC event deleted successfully.');
        location.reload();
        
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event. Please try again.');
    }
}

// ========== PARTICIPANTS MANAGEMENT ==========

/**
 * Load Participants for an Event from Firestore
 * Displays list of registered participants with their details
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
    
    try {
        // Get event details
        const event = await getEventById(eventId);
        
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
        
        // Get registrations for this event
        const registrationsQuery = query(
            collection(db, 'registrations'),
            where('eventId', '==', eventId)
        );
        const registrationsSnapshot = await getDocs(registrationsQuery);
        
        // Get participant details
        const participants = [];
        for (const regDoc of registrationsSnapshot.docs) {
            const regData = regDoc.data();
            
            // Get user details from users collection
            const userDoc = await getDoc(doc(db, 'users', regData.userId));
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                participants.push({
                    name: userData.name,
                    email: userData.email,
                    registeredAt: regData.registeredAt
                });
            }
        }
        
        renderParticipantsTable(participants);
        
    } catch (error) {
        console.error('Error loading participants:', error);
        alert('Error loading participants. Please try again.');
    }
}

/**
 * Render participants table
 */
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
            <td>${formatDate(participant.registeredAt)}</td>
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
 * Initialize page-specific content after auth is confirmed
 * Called by onAuthStateChanged AFTER admin role is verified
 */
async function initializeAdminPage(currentPage) {
    switch(currentPage) {
        case 'admin-dashboard.html':
            await loadAdminDashboard();
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', handleAdminLogout);
            }
            break;
            
        case 'admin-add-event.html':
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
            await loadEditEvent();
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
}

/**
 * Setup non-authenticated pages
 * Handles pages that don't require admin auth
 */
document.addEventListener('DOMContentLoaded', async function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Only handle login page in DOMContentLoaded
    // Admin pages are initialized by onAuthStateChanged
    if (currentPage === 'admin-login.html') {
        const loginForm = document.getElementById('admin-login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleAdminLogin);
        }
    }
});

// ========== EXPOSE FUNCTIONS FOR ONCLICK HANDLERS ==========
// Make functions available globally for onclick attributes in HTML
window.viewParticipants = viewParticipants;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;
