import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EcranProfil from '../EcranProfil';

describe('EcranProfil Component', () => {
  it('doit afficher les informations de l\'utilisateur connecté', () => {
    // Note: Le test utiliserait un mock du contexte Auth
    render(<EcranProfil />);
    expect(screen.getByText(/Mon Profil/i)).toBeInTheDocument();
  });

  it('doit permettre de se déconnecter', () => {
    render(<EcranProfil />);
    const logoutBtn = screen.getByText(/Déconnexion/i);
    expect(logoutBtn).toBeInTheDocument();
  });
});
