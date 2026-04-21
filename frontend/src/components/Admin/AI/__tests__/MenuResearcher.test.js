import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MenuResearcher from '../MenuResearcher';
import api from '../../../config/api';

// Mock de l'API
jest.mock('../../../config/api');

describe('MenuResearcher Component', () => {
  it('doit permettre de saisir un terme de recherche', () => {
    render(<MenuResearcher />);
    const input = screen.getByPlaceholderText(/Ex: Koki, Ndolé/i);
    fireEvent.change(input, { target: { value: 'Ndolé' } });
    expect(input.value).toBe('Ndolé');
  });

  it('doit afficher un indicateur de chargement lors de la recherche', async () => {
    api.post.mockResolvedValueOnce({ data: { name: 'Ndolé', origin: 'Littoral' } });
    render(<MenuResearcher />);
    
    const input = screen.getByPlaceholderText(/Ex: Koki, Ndolé/i);
    const button = screen.getByText('Rechercher');

    fireEvent.change(input, { target: { value: 'Ndolé' } });
    fireEvent.click(button);

    expect(screen.getByText('Recherche...')).toBeInTheDocument();
  });
});
