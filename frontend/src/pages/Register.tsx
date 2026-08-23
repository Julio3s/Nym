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
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Inscription</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nom d'utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: '100%', padding: 8, margin: '8px 0' }}
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: 8, margin: '8px 0' }}
            />
          </div>
          <div>
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              style={{ width: '100%', padding: 8, margin: '8px 0' }}
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: 10, marginTop: 10 }}>
            S'inscrire
          </button>
        </form>
        <p style={{ marginTop: 16 }}>
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
