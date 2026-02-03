import React, { useState } from 'react';

const FeedbackModal = ({ visible, onClose, onSend }) => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  // Integração com Formspree (sem backend, direto do frontend)
  const handleSend = async () => {
    setStatus('sending');
    try {
      const formData = new FormData();
      formData.append('message', message);
      formData.append('email', 'julianolr11@gmail.com');
      // Endpoint correto fornecido pelo usuário
      const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xykjzqra';
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });
      if (res.ok) {
        setStatus('sent');
        if (onSend) onSend(message);
      } else {
        setStatus('error');
      }
    } catch (e) {
      setStatus('error');
    }
  };

  if (!visible) return null;

  return (
    <div style={modalBgStyle}>
      <div style={modalStyle} className="modal-zoom-in">
        <h2
          style={{
            color: '#ffe6b0',
            fontWeight: 700,
            fontSize: 22,
            marginBottom: 18,
            textAlign: 'center',
            letterSpacing: 0.5,
          }}
        >
          Enviar feedback
        </h2>
        <textarea
          style={textareaStyle}
          rows={6}
          placeholder="Digite sua sugestão, bug ou comentário..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          disabled={status === 'sending' || status === 'sent'}
        />
        <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button
            onClick={handleSend}
            style={btnStyle}
            disabled={!message.trim() || status === 'sending' || status === 'sent'}
          >
            {status === 'sending' ? 'Enviando...' : status === 'sent' ? 'Enviado!' : 'Enviar'}
          </button>
          <button onClick={onClose} style={btnStyle} disabled={status === 'sending'}>
            Fechar
          </button>
        </div>
        {status === 'error' && (
          <div style={{ color: '#ff4d4f', marginTop: 12, textAlign: 'center' }}>
            Erro ao enviar. Tente novamente.
          </div>
        )}
        {status === 'sent' && (
          <div style={{ color: '#4caf50', marginTop: 12, textAlign: 'center' }}>
            Feedback enviado com sucesso!
          </div>
        )}
      </div>
    </div>
  );
};

const modalBgStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(30,22,40,0.32)',
  zIndex: 1100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
};
const modalStyle = {
  background: 'rgba(44, 38, 60, 0.38)',
  color: '#f5f5fa',
  padding: '40px 32px',
  borderRadius: '18px',
  minWidth: '340px',
  boxShadow: '0 6px 32px 0 rgba(30,22,40,0.18)',
  fontFamily: 'Poppins, Arial, sans-serif',
  border: '1.5px solid rgba(255,255,255,0.18)',
  textShadow: '0 2px 8px #0007',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
};
const btnStyle = {
  margin: '0 8px',
  padding: '10px 24px',
  fontSize: '1rem',
  borderRadius: '6px',
  border: '2px solid #a87e2d',
  background: 'linear-gradient(90deg, #a87e2d 0%, #ffe6b0 100%)',
  color: '#3a2c4a',
  cursor: 'pointer',
  fontFamily: 'Poppins, Arial, sans-serif',
  boxShadow: '0 2px 12px #000a',
  textShadow: '0 1px 4px #000a',
  transition: 'background 0.2s, color 0.2s',
};
const textareaStyle = {
  width: '100%',
  minHeight: 90,
  borderRadius: 6,
  border: '1.5px solid #a87e2d',
  background: 'rgba(30,22,40,0.85)',
  color: '#ffe6b0',
  fontFamily: 'Poppins, Arial, sans-serif',
  fontSize: 15,
  padding: 10,
  resize: 'vertical',
  outline: 'none',
};

export default FeedbackModal;
