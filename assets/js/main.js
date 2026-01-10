/* ===========================================
   ITC Event Management System - Main JavaScript
   File: assets/js/main.js
   Description: Main JavaScript for user-facing pages
   =========================================== */

// Import Firebase services
import { auth, db } from './firebase.js';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    addDoc,
    query,
    where,
    deleteDoc,
    orderBy,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// ========== EVENTS DATA (Loaded from Firestore) ==========
// Events are now loaded dynamically from Firestore
// No more dummy data!

// Current logged-in user
let currentUser = null;

// ========== FIREBASE AUTH STATE LISTENER ==========

/**
 * Firebase Authentication State Listener
 * This listener monitors the user's authentication state
 * and handles automatic redirects based on user role
 */
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    
    if (user) {
        // User is signed in, get their role from Firestore
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                currentUser = {
                    uid: user.uid,
                    email: user.email,
                    ...userData
                };
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }
    
    // Update navigation based on auth state
    updateNavigation();
    
    // Handle dashboard page guard
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'user-dashboard.html') {
        if (user) {
            // User is authenticated, load dashboard
            await loadUserDashboard();
        } else {
            // No user, redirect to login
            alert('Please login to access the dashboard.');
            window.location.href = 'login.html';
        }
    } else if (currentPage === 'login.html' && user) {
        // User just logged in from login page, redirect to dashboard
        window.location.href = 'user-dashboard.html';
    }
});

// ========== UTILITY FUNCTIONS ==========

/**
 * Load all events from Firestore
 * Returns array of events from Firestore events collection
 */
async function loadEventsFromFirestore() {
    try {
        const eventsCol = collection(db, 'events');
        const eventsQuery = query(eventsCol, orderBy('date', 'asc'));
        const eventsSnapshot = await getDocs(eventsQuery);
        
        const events = [];
        eventsSnapshot.forEach((doc) => {
            events.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return events;
    } catch (error) {
        console.error('Error loading events:', error);
        return [];
    }
}

// Format date to readable format
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

// Check if user is logged in
function isLoggedIn() {
    // Firebase Auth provides the current user
    return auth.currentUser !== null;
}

// Get current user
function getCurrentUser() {
    // Return the current authenticated user from Firebase
    return currentUser;
}

// Update navigation based on login status
function updateNavigation() {
    const loginLink = document.querySelector('a[href="login.html"]');
    const registerLink = document.querySelector('a[href="register.html"]');
    
    // Update text/href FIRST based on auth state, THEN make visible
    if (isLoggedIn()) {
        const user = getCurrentUser();
        if (loginLink) {
            loginLink.textContent = 'Dashboard';
            loginLink.href = 'user-dashboard.html';
        }
        if (registerLink) {
            registerLink.textContent = 'Logout';
            registerLink.href = '#';
            registerLink.addEventListener('click', handleLogout);
        }
    } else {
        // Not logged in - reset to default state
        if (loginLink) {
            loginLink.textContent = 'Login';
            loginLink.href = 'login.html';
        }
        if (registerLink) {
            registerLink.textContent = 'Register';
            registerLink.href = 'register.html';
        }
    }
    
    // Remove auth-loading class AFTER text is updated (prevents flicker)
    if (loginLink) loginLink.classList.remove('auth-loading');
    if (registerLink) registerLink.classList.remove('auth-loading');
}

// ========== EVENT LISTING FUNCTIONS ==========

/**
 * Load and render events from Firestore
 * @param {string} containerId - ID of container element
 * @param {number} limit - Optional limit on number of events
 */
async function loadAndRenderEvents(containerId, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '<p class="text-center">Loading events...</p>';
    
    try {
        let events = await loadEventsFromFirestore();
        
        if (limit) {
            events = events.slice(0, limit);
        }
        
        renderEvents(events, containerId);
    } catch (error) {
        console.error('Error loading events:', error);
        container.innerHTML = '<p class="text-center">Error loading events. Please try again.</p>';
    }
}

// Render event cards
function renderEvents(events, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    if (events.length === 0) {
        container.innerHTML = '<p class="text-center">No events available at the moment.</p>';
        return;
    }

    events.forEach(event => {
        const eventCard = createEventCard(event);
        container.appendChild(eventCard);
    });
}

// Create event card element
function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'card';
    
    card.innerHTML = `
        <img src="${event.imageUrl || 'assets/images/placeholder.jpg'}" alt="${event.title}" class="card-image" onerror="this.src='assets/images/placeholder.jpg'">
        <div class="card-content">
            <h3 class="card-title">${event.title}</h3>
            <div class="card-meta">
                <span><strong>📅</strong> ${formatDate(event.date)}</span>
            </div>
            <div class="card-meta">
                <span><strong>📍</strong> ${event.location}</span>
            </div>
            <p class="card-text">${event.description.substring(0, 120)}...</p>
            <a href="event-details.html?id=${event.id}" class="btn btn-primary btn-block">View Details</a>
        </div>
    `;
    
    return card;
}

// ========== EVENT DETAILS FUNCTIONS ==========

/**
 * Load event details from Firestore
 */
async function loadEventDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    
    const contentDiv = document.querySelector('.event-detail-content');
    if (!contentDiv) return;
    
    if (!eventId) {
        contentDiv.innerHTML = '<p>Event not found.</p>';
        return;
    }

    try {
        const event = await getEventById(eventId);
        
        if (!event) {
            contentDiv.innerHTML = '<p>Event not found.</p>';
            return;
        }

        // Display event details
        await displayEventDetails(event);
    } catch (error) {
        console.error('Error loading event details:', error);
        contentDiv.innerHTML = '<p>Error loading event details. Please try again.</p>';
    }
}

/**
 * Display event details
 */
async function displayEventDetails(event) {
    const imageElement = document.getElementById('event-image');
    const titleElement = document.getElementById('event-title');
    const dateElement = document.getElementById('event-date');
    const timeElement = document.getElementById('event-time');
    const locationElement = document.getElementById('event-location');
    const descriptionElement = document.getElementById('event-description');
    const registerBtn = document.getElementById('register-btn');

    if (imageElement) {
        imageElement.src = event.imageUrl || 'assets/images/placeholder.jpg';
        imageElement.alt = event.title;
        imageElement.onerror = function() { this.src = 'assets/images/placeholder.jpg'; };
    }
    if (titleElement) titleElement.textContent = event.title;
    if (dateElement) dateElement.textContent = formatDate(event.date);
    if (timeElement) timeElement.textContent = event.time || 'Not specified';
    if (locationElement) locationElement.textContent = event.location;
    if (descriptionElement) descriptionElement.textContent = event.description;

    // Check if user is already registered
    if (registerBtn) {
        const isRegistered = await checkIfRegistered(event.id);
        
        if (isRegistered) {
            registerBtn.textContent = 'Already Registered';
            registerBtn.disabled = true;
            registerBtn.classList.remove('btn-primary');
            registerBtn.classList.add('btn-success');
        } else {
            registerBtn.addEventListener('click', () => registerForEvent(event.id));
        }
    }
}

// ========== REGISTRATION FUNCTIONS ==========

/**
 * Check if user is registered for event
 * @param {string} eventId - Firestore event document ID
 */
async function checkIfRegistered(eventId) {
    if (!auth.currentUser) return false;
    
    try {
        const registrationsRef = collection(db, 'registrations');
        const q = query(
            registrationsRef,
            where('userId', '==', auth.currentUser.uid),
            where('eventId', '==', eventId)
        );
        
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('Error checking registration:', error);
        return false;
    }
}

/**
 * Register user for event
 * @param {string} eventId - Firestore event document ID
 */
async function registerForEvent(eventId) {
    if (!isLoggedIn()) {
        alert('Please login to register for ITC events.');
        window.location.href = 'login.html';
        return;
    }

    try {
        // Check for duplicate registration
        const alreadyRegistered = await checkIfRegistered(eventId);
        
        if (alreadyRegistered) {
            alert('You are already registered for this ITC event.');
            return;
        }
        
        // Add registration to Firestore
        await addDoc(collection(db, 'registrations'), {
            userId: auth.currentUser.uid,
            eventId: eventId,
            registeredAt: new Date().toISOString()
        });
        
        alert('Successfully registered for the ITC event!');
        location.reload();
        
    } catch (error) {
        console.error('Error registering for event:', error);
        alert('Failed to register for event. Please try again.');
    }
}

/**
 * Cancel event registration
 * @param {string} eventId - Firestore event document ID
 */
async function cancelRegistration(eventId) {
    if (!confirm('Are you sure you want to cancel this ITC event registration?')) {
        return;
    }

    try {
        const registrationsRef = collection(db, 'registrations');
        const q = query(
            registrationsRef,
            where('userId', '==', auth.currentUser.uid),
            where('eventId', '==', eventId)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            alert('Registration not found.');
            return;
        }
        
        // Delete the registration document
        await deleteDoc(querySnapshot.docs[0].ref);
        
        alert('Registration cancelled successfully.');
        location.reload();
        
    } catch (error) {
        console.error('Error cancelling registration:', error);
        alert('Failed to cancel registration. Please try again.');
    }
}

// ========== USER AUTHENTICATION FUNCTIONS ==========

/**
 * Handle User Login
 * Authenticates user with Firebase Auth and redirects based on role
 */
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Basic validation
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
        
        // Check role and redirect accordingly
        if (userData.role === 'admin') {
            // Admin should use admin login page
            showError('Admin users should login through the Admin Login page.');
            await signOut(auth);
            return;
        }
        
        // Success - onAuthStateChanged will handle redirect
        alert('Login successful!');
        
    } catch (error) {
        console.error('Login error:', error);
        
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
 * Handle User Registration
 * Creates new user account with Firebase Auth and stores profile in Firestore
 */
async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showError('Please fill in all fields.');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match.');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters long.');
        return;
    }

    try {
        // Create user with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Store user profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            name: name,
            email: email,
            role: 'user', // Default role is 'user'
            createdAt: new Date().toISOString()
        });
        
        alert('Registration successful! Please login.');
        window.location.href = 'login.html';
        
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific error codes
        if (error.code === 'auth/email-already-in-use') {
            showError('Email is already registered. Please login instead.');
        } else if (error.code === 'auth/invalid-email') {
            showError('Invalid email format.');
        } else if (error.code === 'auth/weak-password') {
            showError('Password is too weak. Use at least 6 characters.');
        } else {
            showError('Registration failed. Please try again.');
        }
    }
}

/**
 * Handle Logout
 * Signs out user from Firebase Auth
 */
async function handleLogout(event) {
    event.preventDefault();
    
    if (confirm('Are you sure you want to logout?')) {
        try {
            await signOut(auth);
            alert('Logged out successfully.');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
            showError('Logout failed. Please try again.');
        }
    }
}

// ========== USER DASHBOARD FUNCTIONS ==========

/**
 * Load User Dashboard
 * Checks authentication and displays user information
 */
async function loadUserDashboard() {
    // This function is now only called after auth state is confirmed by onAuthStateChanged
    // No need to check auth.currentUser here

    try {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        
        if (!userDoc.exists()) {
            alert('User profile not found. Please contact support.');
            await signOut(auth);
            window.location.href = 'login.html';
            return;
        }
        
        const userData = userDoc.data();
        
        // Check if user has correct role
        if (userData.role !== 'user') {
            alert('Access denied. This page is for users only.');
            await signOut(auth);
            window.location.href = 'login.html';
            return;
        }
        
        // Display welcome message
        const welcomeElement = document.getElementById('welcome-message');
        if (welcomeElement) {
            welcomeElement.textContent = `Welcome, ${userData.name}!`;
        }

        await loadUserRegistrations();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Error loading dashboard. Please try again.');
    }
}

/**
 * Load user's registered events from Firestore
 */
async function loadUserRegistrations() {
    const container = document.getElementById('registered-events');
    if (!container) return;
    
    container.innerHTML = '<p class="text-center">Loading your registered events...</p>';
    
    try {
        // Get user's registrations
        const registrationsRef = collection(db, 'registrations');
        const q = query(registrationsRef, where('userId', '==', auth.currentUser.uid));
        const registrationsSnapshot = await getDocs(q);
        
        if (registrationsSnapshot.empty) {
            container.innerHTML = '<p class="text-center">You have not registered for any ITC events yet.</p>';
            return;
        }
        
        // Get event details for each registration
        const registeredEvents = [];
        for (const regDoc of registrationsSnapshot.docs) {
            const regData = regDoc.data();
            const event = await getEventById(regData.eventId);
            
            if (event) {
                registeredEvents.push({
                    ...event,
                    registrationId: regDoc.id,
                    registeredAt: regData.registeredAt
                });
            }
        }
        
        renderUserRegistrations(registeredEvents);
        
    } catch (error) {
        console.error('Error loading registrations:', error);
        container.innerHTML = '<p class="text-center">Error loading your registrations. Please try again.</p>';
    }
}

/**
 * Render user's registered events
 */
function renderUserRegistrations(events) {
    const container = document.getElementById('registered-events');
    if (!container) return;

    container.innerHTML = '';

    if (events.length === 0) {
        container.innerHTML = '<p class="text-center">You have not registered for any ITC events yet.</p>';
        return;
    }

    events.forEach(event => {
        const card = document.createElement('div');
        card.className = 'card';
        
        card.innerHTML = `
            <img src="${event.imageUrl || 'assets/images/placeholder.jpg'}" alt="${event.title}" class="card-image" onerror="this.src='assets/images/placeholder.jpg'">
            <div class="card-content">
                <h3 class="card-title">${event.title}</h3>
                <div class="card-meta">
                    <span><strong>📅</strong> ${formatDate(event.date)}</span>
                </div>
                <div class="card-meta">
                    <span><strong>📍</strong> ${event.location}</span>
                </div>
                <p class="card-text"><small>Registered on: ${formatDate(event.registeredAt)}</small></p>
                <div style="display: flex; gap: 1rem;">
                    <a href="event-details.html?id=${event.id}" class="btn btn-primary" style="flex: 1;">View Details</a>
                    <button onclick="cancelRegistration('${event.id}')" class="btn btn-danger" style="flex: 1;">Cancel</button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// ========== SEARCH FUNCTIONALITY ==========

let allEvents = []; // Store all events for filtering

/**
 * Initialize search functionality
 */
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-search');
    const resultsText = document.getElementById('search-results-text');

    if (!searchInput) return;

    // Handle search input
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.trim();

        // Show/hide clear button
        if (searchTerm) {
            clearBtn.style.display = 'flex';
        } else {
            clearBtn.style.display = 'none';
        }

        // Filter events
        filterEvents(searchTerm);
    });

    // Handle clear button
    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        resultsText.textContent = '';
        resultsText.classList.remove('no-results');
        renderEvents(allEvents, 'events-list');
    });
}

/**
 * Filter events based on search term
 * @param {string} searchTerm - The search query
 */
function filterEvents(searchTerm) {
    const resultsText = document.getElementById('search-results-text');

    if (!searchTerm) {
        renderEvents(allEvents, 'events-list');
        resultsText.textContent = '';
        resultsText.classList.remove('no-results');
        return;
    }

    // Convert search term to lowercase for case-insensitive search
    const term = searchTerm.toLowerCase();

    // Filter events by title, description, or location
    const filteredEvents = allEvents.filter(event => {
        const title = event.title.toLowerCase();
        const description = event.description.toLowerCase();
        const location = event.location.toLowerCase();

        return title.includes(term) ||
               description.includes(term) ||
               location.includes(term);
    });

    // Update results text
    if (filteredEvents.length === 0) {
        resultsText.textContent = `No events found for "${searchTerm}"`;
        resultsText.classList.add('no-results');
    } else if (filteredEvents.length === 1) {
        resultsText.textContent = `Found 1 event matching "${searchTerm}"`;
        resultsText.classList.remove('no-results');
    } else {
        resultsText.textContent = `Found ${filteredEvents.length} events matching "${searchTerm}"`;
        resultsText.classList.remove('no-results');
    }

    // Render filtered events
    renderEvents(filteredEvents, 'events-list');
}

/**
 * Load events and store them for search
 */
async function loadEventsForSearch() {
    const container = document.getElementById('events-list');
    if (!container) return;

    container.innerHTML = '<p class="text-center">Loading events...</p>';

    try {
        allEvents = await loadEventsFromFirestore();
        renderEvents(allEvents, 'events-list');

        // Initialize search after events are loaded
        initializeSearch();
    } catch (error) {
        console.error('Error loading events:', error);
        container.innerHTML = '<p class="text-center">Error loading events. Please try again.</p>';
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
 * Initialize page based on current page
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Update navigation for all pages
    updateNavigation();
    
    // Page-specific initialization
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'index.html':
        case '':
            // Load featured events on homepage (first 3 events)
            await loadAndRenderEvents('featured-events', 3);
            break;
            
        case 'events.html':
            // Load all events with search functionality
            await loadEventsForSearch();
            break;
            
        case 'event-details.html':
            // Load event details
            await loadEventDetails();
            break;
            
        case 'login.html':
            // Setup login form
            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                loginForm.addEventListener('submit', handleLogin);
            }
            break;
            
        case 'register.html':
            // Setup registration form
            const registerForm = document.getElementById('register-form');
            if (registerForm) {
                registerForm.addEventListener('submit', handleRegister);
            }
            break;
            
        case 'user-dashboard.html':
            // Dashboard loading is handled by onAuthStateChanged listener
            // Do not load here to avoid race conditions
            break;
    }
});

// ========== EXPOSE FUNCTIONS FOR ONCLICK HANDLERS ==========
// Make functions available globally for onclick attributes in HTML
window.cancelRegistration = cancelRegistration;
window.handleLogout = handleLogout;
