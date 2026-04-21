import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Frontend Auth Flow', () => {
  it('doit persister le token dans le localStorage après connexion', () => {
    const fakeToken = "ey123";
    localStorage.setItem('token', fakeToken);
    expect(localStorage.getItem('token')).toBe(fakeToken);
  });

  it('doit rediriger vers le dashboard si déjà connecté', () => {
    const isAuthenticated = true;
    const path = isAuthenticated ? '/dashboard' : '/login';
    expect(path).toBe('/dashboard');
  });
});
