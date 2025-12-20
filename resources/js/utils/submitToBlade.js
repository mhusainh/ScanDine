import React, { useRef, useEffect } from 'react';

/**
 * Helper to submit form data to a Laravel Blade route
 * This allows using existing backend logic without creating new API endpoints
 */
const submitToBlade = (action, method = 'POST', data = {}) => {
    const form = document.createElement('form');
    form.method = 'POST'; // Browser forms only support GET/POST
    form.action = action;
    form.style.display = 'none';

    // CSRF Token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);
    }

    // Method Spoofing for PUT/DELETE
    if (method !== 'GET' && method !== 'POST') {
        const methodInput = document.createElement('input');
        methodInput.type = 'hidden';
        methodInput.name = '_method';
        methodInput.value = method;
        form.appendChild(methodInput);
    }

    // Add Data Fields
    Object.keys(data).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = data[key];
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
};

export default submitToBlade;
