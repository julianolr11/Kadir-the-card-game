import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/update-modal.css';

const translations = {
  pt: {
    title: 'Atualização disponível',
    message: 'Uma nova versão do jogo está disponível. Deseja atualizar agora?',
    update: 'Atualizar',
    cancel: 'Cancelar',
    downloading: 'Baixando atualização...',
    progress: 'Progresso',
    error: 'Erro ao baixar atualização:',
  },
  en: {
    title: 'Update available',
    message: 'A new version of the game is available. Do you want to update now?',
    update: 'Update',
    cancel: 'Cancel',
    downloading: 'Downloading update...',
    progress: 'Progress',
    error: 'Error downloading update:',
  },
};

export default function UpdateModal({
  open, onUpdate, onCancel, progress, error, lang, downloading,
}) {
  const t = translations[lang] || translations.pt;
  if (!open) return null;
  return (
    <div className="update-modal-overlay">
      <div className="update-modal">
        <h2>{t.title}</h2>
        {!downloading && !error && <p>{t.message}</p>}
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
        {!downloading && !error && (
          <div className="update-modal-actions">
            <button type="button" onClick={onUpdate}>{t.update}</button>
            <button type="button" onClick={onCancel}>{t.cancel}</button>
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
