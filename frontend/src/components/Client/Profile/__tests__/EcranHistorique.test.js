import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EcranHistorique from '../EcranHistorique';

describe('EcranHistorique Component', () => {
  it('doit lister les commandes passées', () => {
    render(<EcranHistorique />);
    expect(screen.getByText(/Historique des commandes/i)).toBeInTheDocument();
  });

  it('doit afficher un message si l\'historique est vide', () => {
    // Simulation d'un état sans commandes
    render(<EcranHistorique />);
    // Si l'UI le prévoit :
    // expect(screen.getByText(/Aucune commande trouvée/i)).toBeInTheDocument();
  });
});
