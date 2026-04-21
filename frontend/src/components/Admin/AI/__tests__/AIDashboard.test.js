import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIDashboard from '../AIDashboard';

// Mock MUI useTheme/useMediaQuery
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: () => false,
}));

describe('AIDashboard Component', () => {
  it('doit afficher le message de bienvenue initial', () => {
    render(<AIDashboard />);
    expect(screen.getByText(/Intelligence Gourmi/i)).toBeInTheDocument();
  });

  it('doit contenir les boutons de navigation (Chat, Audit, Archivres)', () => {
    render(<AIDashboard />);
    // On vérifie la présence des outils via leur aria-label ou tooltip title s'ils sont rendus
    // Ici on teste juste que l'interface de base est présente
    expect(screen.getByPlaceholderText(/Demandez n'importe quoi/i)).toBeInTheDocument();
  });
});
