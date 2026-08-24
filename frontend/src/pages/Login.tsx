import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="auth-shell auth-shell--login">
      <div className="auth-card auth-card--login">
        <div className="auth-brand" aria-label="Nym">
          <span className="auth-brand__mark">N</span>
          <span className="auth-brand__name">nym</span>
        </div>
        <div className="auth-heading">
          <p className="auth-eyebrow">Votre espace financier</p>
          <h1>Bon retour.</h1>
          <p>Retrouvez une vue claire sur vos dépenses et vos projets.</p>
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="login-email">Adresse email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="auth-field">
            <div className="auth-field__label-row">
              <label htmlFor="login-password">Mot de passe</label>
              <span className="auth-help-link">Oublié ?</span>
            </div>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button className="auth-submit" type="submit">
            <span>Se connecter</span>
            <span aria-hidden="true">→</span>
          </button>
        </form>
        <p className="auth-footer">
          Pas encore de compte ? <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
