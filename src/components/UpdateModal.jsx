import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/update-modal.css';

const translations = {
  pt: {
    title: 'Atualização disponível',
    message: 'Uma nova versão do jogo está disponível.',
    version: 'Versão',
    update: 'Atualizar',
    cancel: 'Cancelar',
    downloading: 'Baixando atualização...',
    progress: 'Progresso',
    error: 'Erro ao baixar atualização:',
    whatsnew: 'Novidades da versão',
    closeNotes: 'Fechar',
  },
  en: {
    title: 'Update available',
    message: 'A new version of the game is available.',
    version: 'Version',
    update: 'Update',
    cancel: 'Cancel',
    downloading: 'Downloading update...',
    progress: 'Progress',
    error: 'Error downloading update:',
    whatsnew: 'Release notes',
    closeNotes: 'Close',
  },
};

// Novidades da versão 0.2.8
const updateNotes = {
  pt: [
    '🔧 Sistema de download de atualizações corrigido',
    '🎬 Wallpaper animado agora incluído',
    '🔥 Três novos guardiões adicionados: Arigus, Roenhell e Moar',
    '🖼️ Melhorias na renderização de imagens de cartas de efeito',
    '📚 Layout aprimorado do Bestiário com ícones de elementos',
    '🏷️ Exibição de título da criatura no Bestiário',
    '✅ Correção: Guardião selecionado no DeckBuilder agora persiste corretamente',
    '⚖️ Ajustes de balanceamento: HP dos novos guardiões ajustado',
    '🎨 Interface mais clara e responsiva em todas as resoluções',
  ],
  en: [
    '🔧 Update download system fixed',
    '🎬 Animated wallpaper now included',
    '🔥 Three new guardians added: Arigus, Roenhell, and Moar',
    '🖼️ Improved rendering of effect card images',
    '📚 Enhanced Bestiary layout with element icons',
    '🏷️ Creature title display in Bestiary',
    '✅ Fix: Guardian selected in DeckBuilder now persists correctly',
    '⚖️ Balance adjustments: HP of new guardians adjusted',
    '🎨 Clearer and more responsive interface at all resolutions',
  ],
};

export default function UpdateModal({
  open, onUpdate, onCancel, progress, error, lang, downloading,
}) {
  const t = translations[lang] || translations.pt;
  const notes = updateNotes[lang] || updateNotes.pt;
  const [showNotes, setShowNotes] = useState(false);

  if (!open) return null;

  return (
    <div className="update-modal-overlay">
      <div className="update-modal">
        <h2>{t.title}</h2>

        {!downloading && !error && !showNotes && (
          <>
            <p>{t.message}</p>
            <p style={{ fontSize: '0.9em', color: '#999', marginTop: '8px' }}>{t.version}: 0.2.8</p>
            <div className="update-modal-actions">
              <button
                type="button"
                onClick={() => setShowNotes(true)}
                className="update-btn-primary"
              >
                {t.update}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="update-btn-secondary"
              >
                {t.cancel}
              </button>
            </div>
          </>
        )}

        {!downloading && !error && showNotes && (
          <>
            <h3 style={{ marginTop: '16px', marginBottom: '12px', fontSize: '1.1em' }}>
              {t.whatsnew}
            </h3>
            <div style={{
              textAlign: 'left',
              maxHeight: '280px',
              overflowY: 'auto',
              margin: '12px 0',
              paddingRight: '8px',
              fontSize: '0.95em',
              lineHeight: '1.6',
            }}>
              <ul style={{ margin: '0', paddingLeft: '20px' }}>
                {notes.map((note, idx) => (
                  <li key={idx} style={{ marginBottom: '8px' }}>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
            <div className="update-modal-actions">
              <button
                type="button"
                onClick={onUpdate}
                className="update-btn-primary"
              >
                {t.update}
              </button>
              <button
                type="button"
                onClick={() => setShowNotes(false)}
                className="update-btn-secondary"
              >
                {t.closeNotes}
              </button>
            </div>
          </>
        )}

        {error && <p className="update-modal-error">{t.error} {error}</p>}

        {downloading && (
          <div>
            <p>{t.downloading}</p>
            <div className="update-modal-progress-bar">
              <div
                className="update-modal-progress-bar-inner"
                style={{ width: `${progress || 0}%` }}
              />
            </div>
            <p>{t.progress}: {progress ? progress.toFixed(1) : 0}%</p>
          </div>
        )}

        {error && (
          <div className="update-modal-actions">
            <button type="button" onClick={onCancel}>{t.cancel}</button>
          </div>
        )}
      </div>
    </div>
  );
}

UpdateModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  progress: PropTypes.number,
  error: PropTypes.string,
  lang: PropTypes.oneOf(['pt', 'en']),
  downloading: PropTypes.bool,
};

UpdateModal.defaultProps = {
  progress: 0,
  error: '',
  lang: 'pt',
  downloading: false,
};
