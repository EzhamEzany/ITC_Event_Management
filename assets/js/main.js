/* ===========================================
   UTHM Event Management System - Main JavaScript
   File: assets/js/main.js
   Description: Main JavaScript for user-facing pages
   =========================================== */

// ========== DUMMY DATA FOR PROTOTYPE ==========
const dummyEvents = [
    {
        id: 1,
        title: "UTHM Tech Conference 2026",
        description: "Annual technology conference featuring latest innovations in software development, AI, and data science. Join us for keynote speeches, workshops, and networking opportunities.",
        date: "2026-02-15",
        time: "09:00 AM",
        location: "Dewan Kuliah Utama, UTHM",
        image: "assets/images/event1.jpg",
        registered: false
    },
    {
        id: 2,
        title: "Engineering Innovation Expo",
        description: "Showcase of innovative engineering projects from UTHM students. Discover cutting-edge solutions and creative designs from various engineering disciplines.",
        date: "2026-03-20",
        time: "10:00 AM",
        location: "Faculty of Engineering, UTHM",
        image: "assets/images/event2.jpg",
        registered: false
    },
    {
        id: 3,
        title: "Career Fair 2026",
        description: "Meet potential employers and explore career opportunities. Connect with industry leaders and learn about internships and job openings.",
        date: "2026-04-10",
        time: "08:30 AM",
        location: "Sports Complex, UTHM",
        image: "assets/images/event3.jpg",
        registered: false
    },
    {
        id: 4,
        title: "Cultural Night Festival",
        description: "Celebrate diversity with performances, traditional food, and cultural exhibitions from various communities. Experience the rich tapestry of Malaysian culture.",
        date: "2026-05-05",
        time: "06:00 PM",
        location: "Outdoor Arena, UTHM",
        image: "assets/images/event4.jpg",
        registered: false
    }
];

// Current logged-in user (dummy data)
let currentUser = null;

// Registered events for user
let userRegistrations = [];

// ========== UTILITY FUNCTIONS ==========

// Format date to readable format
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-MY', options);
}

// Get event by ID
function getEventById(eventId) {
    return dummyEvents.find(event => event.id === parseInt(eventId));
}

// Check if user is logged in
function isLoggedIn() {
    // TODO: Firebase Auth integration will be added here
    // For now, check if currentUser exists in sessionStorage
    const user = sessionStorage.getItem('currentUser');
    return user !== null;
}

// Get current user
function getCurrentUser() {
    // TODO: Firebase Auth integration will be added here
    const userJSON = sessionStorage.getItem('currentUser');
    return userJSON ? JSON.parse(userJSON) : null;
}

// Update navigation based on login status
function updateNavigation() {
    const loginLink = document.querySelector('a[href="login.html"]');
    const registerLink = document.querySelector('a[href="register.html"]');
    
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
    }
}

// ========== EVENT LISTING FUNCTIONS ==========

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
        <img src="${event.image}" alt="${event.title}" class="card-image" onerror="this.src='assets/images/placeholder.jpg'">
        <div class="card-content">
            <h3 class="card-title">${event.title}</h3>
            <div class="card-meta">
                <span><strong>📅</strong> ${formatDate(event.date)}</span>
                <span><strong>🕐</strong> ${event.time}</span>
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

// Load event details
function loadEventDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    
    if (!eventId) {
        document.querySelector('.event-detail-content').innerHTML = '<p>Event not found.</p>';
        return;
    }

    const event = getEventById(eventId);
    
    if (!event) {
        document.querySelector('.event-detail-content').innerHTML = '<p>Event not found.</p>';
        return;
    }

    // Display event details
    displayEventDetails(event);
}

// Display event details
function displayEventDetails(event) {
    const imageElement = document.getElementById('event-image');
    const titleElement = document.getElementById('event-title');
    const dateElement = document.getElementById('event-date');
    const timeElement = document.getElementById('event-time');
    const locationElement = document.getElementById('event-location');
    const descriptionElement = document.getElementById('event-description');
    const registerBtn = document.getElementById('register-btn');

    if (imageElement) {
        imageElement.src = event.image;
        imageElement.alt = event.title;
        imageElement.onerror = function() { this.src = 'assets/images/placeholder.jpg'; };
    }
    if (titleElement) titleElement.textContent = event.title;
    if (dateElement) dateElement.textContent = formatDate(event.date);
    if (timeElement) timeElement.textContent = event.time;
    if (locationElement) locationElement.textContent = event.location;
    if (descriptionElement) descriptionElement.textContent = event.description;

    // Check if user is already registered
    const isRegistered = checkIfRegistered(event.id);
    
    if (registerBtn) {
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

// Check if user is registered for event
function checkIfRegistered(eventId) {
    // TODO: Firebase Firestore integration will be added here
    const registrations = JSON.parse(localStorage.getItem('userRegistrations') || '[]');
    const user = getCurrentUser();
    if (!user) return false;
    
    return registrations.some(reg => 
        reg.eventId === eventId && reg.userId === user.id
    );
}

// Register for event
function registerForEvent(eventId) {
    if (!isLoggedIn()) {
        alert('Please login to register for events.');
        window.location.href = 'login.html';
        return;
    }

    // TODO: Firebase Firestore CRUD will be added here
    const user = getCurrentUser();
    const registrations = JSON.parse(localStorage.getItem('userRegistrations') || '[]');
    
    // Check for duplicate registration
    const alreadyRegistered = registrations.some(reg => 
        reg.eventId === eventId && reg.userId === user.id
    );
    
    if (alreadyRegistered) {
        alert('You are already registered for this event.');
        return;
    }
    
    // Add registration
    const registration = {
        id: Date.now(),
        userId: user.id,
        eventId: eventId,
        registrationDate: new Date().toISOString()
    };
    
    registrations.push(registration);
    localStorage.setItem('userRegistrations', JSON.stringify(registrations));
    
    alert('Successfully registered for the event!');
    location.reload();
}

// Cancel event registration
function cancelRegistration(eventId) {
    if (!confirm('Are you sure you want to cancel this registration?')) {
        return;
    }

    // TODO: Firebase Firestore CRUD will be added here
    const user = getCurrentUser();
    let registrations = JSON.parse(localStorage.getItem('userRegistrations') || '[]');
    
    registrations = registrations.filter(reg => 
        !(reg.eventId === eventId && reg.userId === user.id)
    );
    
    localStorage.setItem('userRegistrations', JSON.stringify(registrations));
    
    alert('Registration cancelled successfully.');
    location.reload();
}

// ========== USER AUTHENTICATION FUNCTIONS ==========

// Handle user login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Basic validation
    if (!email || !password) {
        showError('Please fill in all fields.');
        return;
    }

    // TODO: Firebase Auth integration will be added here
    // For now, create dummy user
    const user = {
        id: Date.now(),
        email: email,
        name: email.split('@')[0],
        role: 'user'
    };
    
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    
    alert('Login successful!');
    window.location.href = 'user-dashboard.html';
}

// Handle user registration
function handleRegister(event) {
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

    // TODO: Firebase Auth integration will be added here
    // For now, simulate registration
    alert('Registration successful! Please login.');
    window.location.href = 'login.html';
}

// Handle logout
function handleLogout(event) {
    event.preventDefault();
    
    if (confirm('Are you sure you want to logout?')) {
        // TODO: Firebase Auth integration will be added here
        sessionStorage.removeItem('currentUser');
        alert('Logged out successfully.');
        window.location.href = 'index.html';
    }
}

// ========== USER DASHBOARD FUNCTIONS ==========

// Load user dashboard
function loadUserDashboard() {
    if (!isLoggedIn()) {
        alert('Please login to access the dashboard.');
        window.location.href = 'login.html';
        return;
    }

    const user = getCurrentUser();
    const welcomeElement = document.getElementById('welcome-message');
    if (welcomeElement) {
        welcomeElement.textContent = `Welcome, ${user.name}!`;
    }

    loadUserRegistrations();
}

// Load user registrations
function loadUserRegistrations() {
    const user = getCurrentUser();
    const registrations = JSON.parse(localStorage.getItem('userRegistrations') || '[]');
    
    const userRegs = registrations.filter(reg => reg.userId === user.id);
    const registeredEvents = userRegs.map(reg => {
        const event = getEventById(reg.eventId);
        return { ...event, registrationId: reg.id, registrationDate: reg.registrationDate };
    }).filter(event => event !== undefined);

    renderUserRegistrations(registeredEvents);
}

// Render user registrations
function renderUserRegistrations(events) {
    const container = document.getElementById('registered-events');
    if (!container) return;

    container.innerHTML = '';

    if (events.length === 0) {
        container.innerHTML = '<p class="text-center">You have not registered for any events yet.</p>';
        return;
    }

    events.forEach(event => {
        const card = document.createElement('div');
        card.className = 'card';
        
        card.innerHTML = `
            <img src="${event.image}" alt="${event.title}" class="card-image" onerror="this.src='assets/images/placeholder.jpg'">
            <div class="card-content">
                <h3 class="card-title">${event.title}</h3>
                <div class="card-meta">
                    <span><strong>📅</strong> ${formatDate(event.date)}</span>
                    <span><strong>🕐</strong> ${event.time}</span>
                </div>
                <div class="card-meta">
                    <span><strong>📍</strong> ${event.location}</span>
                </div>
                <p class="card-text"><small>Registered on: ${formatDate(event.registrationDate)}</small></p>
                <div style="display: flex; gap: 1rem;">
                    <a href="event-details.html?id=${event.id}" class="btn btn-primary" style="flex: 1;">View Details</a>
                    <button onclick="cancelRegistration(${event.id})" class="btn btn-danger" style="flex: 1;">Cancel</button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
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

// Initialize page based on current page
document.addEventListener('DOMContentLoaded', function() {
    // Update navigation for all pages
    updateNavigation();
    
    // Page-specific initialization
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'index.html':
        case '':
            // Load featured events on homepage
            renderEvents(dummyEvents.slice(0, 3), 'featured-events');
            break;
            
        case 'events.html':
            // Load all events
            renderEvents(dummyEvents, 'events-list');
            break;
            
        case 'event-details.html':
            // Load event details
            loadEventDetails();
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
            // Load user dashboard
            loadUserDashboard();
            break;
    }
});
