import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import LoadingScreen from '../components/LoadingScreen';
import { AppProvider } from '../context/AppContext';

describe('LoadingScreen', () => {
  it('should render with context and onFinish', () => {
    expect(
      render(
        <AppProvider>
          <LoadingScreen onFinish={() => {}} />
        </AppProvider>
      )
    ).toBeTruthy();
  });
});
