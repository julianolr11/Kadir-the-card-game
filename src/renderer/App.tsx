

import LoadingScreen from '../components/LoadingScreen';
import { AppProvider } from '../context/AppContext';

export default function App() {
  return (
    <AppProvider>
      <LoadingScreen />
    </AppProvider>
  );
}
