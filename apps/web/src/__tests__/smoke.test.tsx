import { render, screen } from '@testing-library/react';
import { App } from '../App';

// Mock localStorage to simulate no auth token
beforeEach(() => {
  localStorage.clear();
});

test('renders Login when no token', () => {
  render(<App />);
  // Should show the login/register page brand h1
  const headings = screen.getAllByText(/make it!/i);
  expect(headings.length).toBeGreaterThan(0);
  // Specifically the h1 brand heading
  expect(screen.getByRole('heading', { name: /make it!/i })).toBeInTheDocument();
});
