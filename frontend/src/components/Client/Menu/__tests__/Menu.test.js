import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategoryBar from '../CategoryBar';

describe('Client Menu - UI Tests', () => {
  const categories = [
    { idCat: 1, name: 'Entrées' },
    { idCat: 2, name: 'Plats' }
  ];

  it('doit afficher toutes les catégories de la carte', () => {
    render(<CategoryBar categories={categories} activeCategory={1} />);
    expect(screen.getByText('Entrées')).toBeInTheDocument();
    expect(screen.getByText('Plats')).toBeInTheDocument();
  });

  it('doit changer de catégorie lors du clic', () => {
    const onSelect = jest.fn();
    render(<CategoryBar categories={categories} activeCategory={1} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Plats'));
    expect(onSelect).toHaveBeenCalled();
  });
});
