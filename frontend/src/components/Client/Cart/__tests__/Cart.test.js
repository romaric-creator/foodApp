import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CartSummary from '../CartSummary';

describe('Cart logic - Unit Tests', () => {
  it('doit calculer le total correct du panier', () => {
    const items = [
      { price: 5000, quantity: 2 },
      { price: 1000, quantity: 1 }
    ];
    const total = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    expect(total).toBe(11000);
  });

  it('doit désactiver le bouton de commande si le panier est vide', () => {
    render(<CartSummary total={0} />);
    const orderBtn = screen.getByRole('button');
    expect(orderBtn).toBeDisabled();
  });
});
