import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function formatRegistrationError(error: unknown): string {
  if (!axios.isAxiosError(error) || !error.response?.data) {
    return "Impossible de joindre le serveur. Réessaie dans un instant.";
  }

  const data = error.response.data;
  if (typeof data.detail === 'string') return data.detail;

  if (typeof data === 'object') {
    const messages = Object.entries(data)
      .flatMap(([field, value]) => {
        const label = field === 'username'
          ? "Nom d'utilisateur"
          : field === 'email'
            ? 'Email'
            : field === 'password'
              ? 'Mot de passe'
              : field;
        const details = Array.isArray(value) ? value.join(' ') : String(value);
        return details ? [`${label} : ${details}`] : [];
      });

    if (messages.length) return messages.join(' ');
  }

  return "L'inscription a échoué. Vérifie les informations saisies.";
}

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err: unknown) {
      setError(formatRegistrationError(err));
    }
  };

  return (
    <div className="auth-shell auth-shell--register">
      <div className="auth-card auth-card--register">
        <div className="auth-brand" aria-label="Nym">
          <span className="auth-brand__mark">N</span>
          <span className="auth-brand__name">nym</span>
        </div>
        <div className="auth-heading">
          <p className="auth-eyebrow">Un nouveau départ</p>
          <h1>Créez votre équilibre.</h1>
          <p>Organisez votre argent simplement et avancez avec plus de sérénité.</p>
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="register-username">Nom d'utilisateur</label>
            <input
              id="register-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="auth-field">
            <label htmlFor="register-email">Adresse email</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="auth-field">
            <label htmlFor="register-password">Mot de passe</label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
            <span className="auth-field__hint">8 caractères minimum</span>
          </div>
          <button className="auth-submit" type="submit">
            <span>Créer mon compte</span>
            <span aria-hidden="true">→</span>
          </button>
        </form>
        <p className="auth-footer">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
