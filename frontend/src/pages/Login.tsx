import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Email ou mot de passe incorrect');
    } finally {
      setIsSubmitting(false);
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
            <div className="auth-password-input">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                className="auth-password-toggle"
                type="button"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
              </button>
            </div>
          </div>
          <button className="auth-submit" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
            <span>{isSubmitting ? 'Connexion...' : 'Se connecter'}</span>
            {isSubmitting ? <span className="auth-spinner" aria-hidden="true" /> : <span aria-hidden="true">→</span>}
          </button>
        </form>
        <p className="auth-footer">
          Pas encore de compte ? <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
