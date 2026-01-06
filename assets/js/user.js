/* ===========================================
   ITC Event Management System - User Utilities
   File: assets/js/user.js
   Description: Additional user-specific utilities
   =========================================== */

// Import Firebase services (available if needed for future use)
import { auth, db } from './firebase.js';

// ========== FORM VALIDATION UTILITIES ==========

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password strength
function validatePassword(password) {
    return {
        minLength: password.length >= 6,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password)
    };
}

// Display password strength
function updatePasswordStrength(password) {
    const strength = validatePassword(password);
    const strengthIndicator = document.getElementById('password-strength');
    
    if (!strengthIndicator) return;
    
    let strengthText = '';
    let strengthClass = '';
    
    const score = Object.values(strength).filter(Boolean).length;
    
    if (score === 0) {
        strengthText = '';
        strengthClass = '';
    } else if (score <= 2) {
        strengthText = 'Weak';
        strengthClass = 'text-danger';
    } else if (score === 3) {
        strengthText = 'Medium';
        strengthClass = 'text-warning';
    } else {
        strengthText = 'Strong';
        strengthClass = 'text-success';
    }
    
    strengthIndicator.textContent = strengthText ? `Password Strength: ${strengthText}` : '';
    strengthIndicator.className = strengthClass;
}

// ========== SEARCH AND FILTER UTILITIES ==========

/**
 * Search events by title or description
 * Note: This utility function can be used with events loaded from Firestore
 * @param {Array} events - Array of event objects
 * @param {string} query - Search query string
 */
function searchEvents(events, query) {
    if (!query || !events) return events || [];
    
    query = query.toLowerCase();
    return events.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
    );
}

// Filter events by date range
function filterEventsByDate(events, startDate, endDate) {
    return events.filter(event => {
        const eventDate = new Date(event.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start && eventDate < start) return false;
        if (end && eventDate > end) return false;
        return true;
    });
}

// Sort events
function sortEvents(events, sortBy) {
    const sorted = [...events];
    
    switch(sortBy) {
        case 'date-asc':
            sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'date-desc':
            sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'title-asc':
            sorted.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            sorted.sort((a, b) => b.title.localeCompare(a.title));
            break;
        default:
            break;
    }
    
    return sorted;
}

// ========== NOTIFICATION UTILITIES ==========

// Show success notification
function showSuccess(message) {
    showNotification(message, 'success');
}

// Show info notification
function showInfo(message) {
    showNotification(message, 'info');
}

// Show warning notification
function showWarning(message) {
    showNotification(message, 'warning');
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ========== LOCAL STORAGE UTILITIES ==========

// Save to local storage
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

// Get from local storage
function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
}

// Remove from local storage
function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

// ========== DATE & TIME UTILITIES ==========

// Check if event is upcoming
function isUpcoming(eventDate) {
    return new Date(eventDate) > new Date();
}

// Check if event is past
function isPast(eventDate) {
    return new Date(eventDate) < new Date();
}

// Get days until event
function getDaysUntilEvent(eventDate) {
    const today = new Date();
    const event = new Date(eventDate);
    const diffTime = event - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Format time ago
function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    
    return 'just now';
}

// ========== EXPORT FOR USE IN OTHER SCRIPTS ==========

// This file provides utility functions that can be used alongside main.js and admin.js
// No additional initialization needed - functions are available globally
