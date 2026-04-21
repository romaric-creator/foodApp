import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MenuCard from '../MenuCard';

describe('MenuCard Component', () => {
  const mockPlat = {
    idMenu: 1,
    name: 'Ndolé',
    price: 5000,
    image_url: '...',
    stock_quantity: 10
  };

  it('doit afficher le nom et le prix correct', () => {
    render(<MenuCard item={mockPlat} />);
    expect(screen.getByText('Ndolé')).toBeInTheDocument();
    expect(screen.getByText(/5,000/i)).toBeInTheDocument();
  });

  it('doit afficher une alerte de stock faible ou rupture', () => {
    const outOfStockPlat = { ...mockPlat, stock_quantity: 0 };
    render(<MenuCard item={outOfStockPlat} />);
    expect(screen.getByText(/Indisponible/i)).toBeInTheDocument();
  });
});
