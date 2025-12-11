import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/react';
import CardPreview from '../components/CardPreview';

describe('CardPreview', () => {
  it('should render and open story panel', () => {
    const onClose = jest.fn();
    const { getByLabelText, getByText } = render(<CardPreview onClose={onClose} />);
    // Seta para abrir história
    const arrowBtn = getByLabelText('Ver história da criatura');
    fireEvent.click(arrowBtn);
    // Painel de história deve aparecer
    expect(getByText('Origem de Ashfang')).toBeInTheDocument();
    // Seta para fechar história
    const closeArrow = getByLabelText('Fechar história da criatura');
    fireEvent.click(closeArrow);
    // Card deve continuar visível
    expect(getByText('Ashfang')).toBeInTheDocument();
  });
});
