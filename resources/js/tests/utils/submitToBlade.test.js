import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import submitToBlade from '../../utils/submitToBlade';

describe('submitToBlade', () => {
    let appendChildSpy;
    let removeChildSpy;

    beforeEach(() => {
        // Mock document methods
        appendChildSpy = vi.spyOn(document.body, 'appendChild');
        removeChildSpy = vi.spyOn(document.body, 'removeChild');
        
        // Mock form submit
        HTMLFormElement.prototype.submit = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        document.body.innerHTML = '';
        document.head.innerHTML = '';
    });

    it('creates a form and submits it with POST method', () => {
        submitToBlade('/test-route', 'POST', { name: 'John' });

        const form = appendChildSpy.mock.calls[0][0];
        expect(form.tagName).toBe('FORM');
        expect(form.getAttribute('action')).toBe('/test-route');
        expect(form.getAttribute('method')).toBe('POST');
        
        const input = form.querySelector('input[name="name"]');
        expect(input).toBeTruthy();
        expect(input.value).toBe('John');

        expect(form.submit).toHaveBeenCalled();
        expect(removeChildSpy).toHaveBeenCalledWith(form);
    });

    it('adds CSRF token if meta tag exists', () => {
        // Mock CSRF meta tag
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'csrf-token');
        meta.setAttribute('content', 'test-token');
        document.head.appendChild(meta);

        submitToBlade('/test-route');

        const form = appendChildSpy.mock.calls[0][0];
        const csrfInput = form.querySelector('input[name="_token"]');
        expect(csrfInput).toBeTruthy();
        expect(csrfInput.value).toBe('test-token');
    });

    it('handles method spoofing for PUT/DELETE', () => {
        submitToBlade('/test-route', 'PUT');

        const form = appendChildSpy.mock.calls[0][0];
        const methodInput = form.querySelector('input[name="_method"]');
        expect(methodInput).toBeTruthy();
        expect(methodInput.value).toBe('PUT');
    });
});
