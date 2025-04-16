import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateEvent from '../pages/CreateEvent';

describe('CreateEvent Component', () => {
    test('renders Create Event form with all required fields', () => {
        render(
            <BrowserRouter>
                <CreateEvent />
            </BrowserRouter>
        );

        // Check for heading specifically
        expect(screen.getByRole('heading', { name: /Create Event/i })).toBeInTheDocument();

        // Check for form fields
        expect(screen.getByLabelText(/Event Title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Sport/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Maximum Players/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Location/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Date and Time/i)).toBeInTheDocument();

        // Check for submit button specifically
        expect(screen.getByRole('button', { name: /Create Event/i })).toBeInTheDocument();
    });
});