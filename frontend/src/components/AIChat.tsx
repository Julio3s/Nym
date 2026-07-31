import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import Button from './Button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const historique = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await api.post('/chat/', { message: userMsg, historique });
      const data = res.data;
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);

      if (data.action) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: '🔄 Les données ont été mises à jour. Rafraîchissez la page pour voir les changements.' },
          ]);
        }, 500);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Désolé, une erreur est survenue.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="chat-toggle"
        title="Assistant IA"
        aria-label="Assistant IA"
      >
        {open ? '✕' : '🤖'}
      </button>

      {open && (
        <div className="chat-panel">
          <div style={{
            padding: 'var(--space-md)',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            fontWeight: 600,
            fontSize: 'var(--font-size-base)',
          }}>
            🤖 Conseiller Financier IA
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
          }}>
            {messages.length === 0 && (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 40 }}>
                Posez une question sur vos finances !
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                  color: msg.role === 'user' ? 'white' : 'var(--color-text)',
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: 1.4,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div style={{
                alignSelf: 'flex-start',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--font-size-sm)',
              }}>
                🤔 Réflexion...
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div style={{
            padding: 'var(--space-sm)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            gap: 'var(--space-sm)',
          }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question..."
              disabled={loading}
              style={{
                flex: 1,
                minWidth: 0,
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--font-size-sm)',
                outline: 'none',
              }}
            />
            <Button size="sm" onClick={sendMessage} disabled={loading || !input.trim()}>
              Envoyer
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
