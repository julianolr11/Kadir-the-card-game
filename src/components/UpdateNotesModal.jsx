import React from 'react';
import PropTypes from 'prop-types';
import '../styles/update-modal.css';

const translations = {
  pt: {
    title: 'Novidades da versão',
    close: 'Fechar',
  },
  en: {
    title: 'Release notes',
    close: 'Close',
  },
};

export default function UpdateNotesModal({ open, notes, lang, onClose }) {
  const t = translations[lang] || translations.pt;
  if (!open) return null;
  return (
    <div className="update-modal-overlay">
      <div className="update-modal">
        <h2>{t.title}</h2>
        <div style={{ textAlign: 'left', maxHeight: 320, overflowY: 'auto', margin: '16px 0' }}>
          <div dangerouslySetInnerHTML={{ __html: notes }} />
        </div>
        <div className="update-modal-actions">
          <button type="button" onClick={onClose}>{t.close}</button>
        </div>
      </div>
    </div>
  );
}

UpdateNotesModal.propTypes = {
  open: PropTypes.bool.isRequired,
  notes: PropTypes.string,
  lang: PropTypes.oneOf(['pt', 'en']),
  onClose: PropTypes.func.isRequired,
};

UpdateNotesModal.defaultProps = {
  notes: '',
  lang: 'pt',
};
