import { createRoot } from 'react-dom/client';
import App from './App';
import FixedViewport from './FixedViewport';
import './App.css';

// Evita o arraste nativo de imagens, links e textos dentro do palco do jogo.
document.addEventListener('dragstart', (event) => event.preventDefault());

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <FixedViewport>
    <App />
  </FixedViewport>,
);

// calling IPC exposed from preload script
window.electron?.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron?.ipcRenderer.sendMessage('ipc-example', ['ping']);
