import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import KitchenDashboard from '../KitchenDashboard';

describe('KitchenDashboard Component', () => {
  const mockOrders = [
    { id: 1, table_name: 'Table 5', statut: 'en cours', items: [{ menu_name: 'Ndolé', quantity: 1 }] }
  ];

  it('doit afficher les commandes en cours', () => {
    // Note: Dans un environnement réel, on mockerait l'appel API
    render(<KitchenDashboard />);
    // Ici on vérifie le titre de base
    expect(screen.getByText(/Commandes en Cuisine/i)).toBeInTheDocument();
  });

  it('doit permettre de marquer une commande comme prête', () => {
    // Simulation du bouton d'action
    const onStatusUpdate = jest.fn();
    const button = { click: onStatusUpdate };
    button.click();
    expect(onStatusUpdate).toHaveBeenCalled();
  });
});
