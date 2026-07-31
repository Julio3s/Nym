import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import BackButton from '../components/BackButton';
import api from '../services/api';

interface ProfileData {
  id: number;
  username: string;
  email: string;
  nom: string;
  prenom: string;
  date_naissance: string | null;
  telephone: string;
  adresse: string;
  ville: string;
  pays: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    api.get('/auth/me/').then((res) => {
      setProfile(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const updateField = (field: keyof ProfileData, value: string) => {
    if (profile) setProfile({ ...profile, [field]: value });
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await api.put('/auth/profile/', profile);
      setProfile(res.data);
      setMessage('Profil mis à jour avec succès');
    } catch {
      setMessage('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setChangingPassword(true);
    setPasswordMessage('');
    try {
      await api.post('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPasswordMessage('Mot de passe modifié avec succès');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordMessage(err.response?.data?.detail || 'Erreur lors du changement');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}>Chargement...</div>;

  return (
    <div className="page-panel page-panel--medium">
      <BackButton to="/" label="← Accueil" />
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>Mon profil</h1>

      <Card style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ marginBottom: 'var(--space-md)' }}>Informations personnelles</h3>
        {message && (
          <p style={{ color: message.includes('succès') ? 'var(--color-success)' : 'var(--color-danger)', marginBottom: 'var(--space-md)' }}>
            {message}
          </p>
        )}

        <div className="responsive-grid-2">
          <Input label="Prénom" value={profile?.prenom || ''} onChange={(e) => updateField('prenom', e.target.value)} />
          <Input label="Nom" value={profile?.nom || ''} onChange={(e) => updateField('nom', e.target.value)} />
        </div>

        <Input label="Nom d'utilisateur" value={profile?.username || ''} onChange={(e) => updateField('username', e.target.value)} />
        <Input label="Email" type="email" value={profile?.email || ''} onChange={(e) => updateField('email', e.target.value)} />

        <Input label="Date de naissance" type="date" value={profile?.date_naissance || ''} onChange={(e) => updateField('date_naissance', e.target.value)} />
        <Input label="Téléphone" type="tel" value={profile?.telephone || ''} onChange={(e) => updateField('telephone', e.target.value)} placeholder="+229 XX XX XX XX" />
        <Input label="Adresse" value={profile?.adresse || ''} onChange={(e) => updateField('adresse', e.target.value)} />

        <div className="responsive-grid-2">
          <Input label="Ville" value={profile?.ville || ''} onChange={(e) => updateField('ville', e.target.value)} />
          <Input label="Pays" value={profile?.pays || 'Bénin'} onChange={(e) => updateField('pays', e.target.value)} />
        </div>

        <Button onClick={handleSave} loading={saving} style={{ width: '100%', marginTop: 'var(--space-md)' }}>
          Enregistrer les modifications
        </Button>
      </Card>

      <Card>
        <h3 style={{ marginBottom: 'var(--space-md)' }}>Changer le mot de passe</h3>
        {passwordMessage && (
          <p style={{ color: passwordMessage.includes('succès') ? 'var(--color-success)' : 'var(--color-danger)', marginBottom: 'var(--space-md)' }}>
            {passwordMessage}
          </p>
        )}
        <Input label="Ancien mot de passe" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
        <Input label="Nouveau mot de passe" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <Button onClick={handleChangePassword} loading={changingPassword} style={{ width: '100%' }}>
          Changer le mot de passe
        </Button>
      </Card>
    </div>
  );
}
