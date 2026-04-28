import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { translations } from '../../i18n/translations';
import {
  HeroPanel,
  AuthCard,
  BrandLogo,
  LangToggle,
  OrDivider,
  Field,
  SubmitBtn,
  ErrorAlert,
  GoogleSignInButton,
} from './AuthShared';
import './auth.css';

export default function RegisterForm() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { lang, toggleLang } = useLanguage();
  const T = translations[lang].register;

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // buttonRef is used by GIS to inject the real Google button (hidden).
  // We always show our custom Google button instead.
  const { buttonRef } = useGoogleAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ email, password, displayName });
      navigate('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : T.errorFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : T.errorFailed);
    }
  };

  return (
    <div className="auth-page">
      {/* Left: hero panel */}
      <HeroPanel lang={lang} />

      {/* Right: form panel */}
      <div className="auth-right">
        {/* Top bar */}
        <div className="auth-right-topbar">
          <LangToggle lang={lang} onToggle={toggleLang} />
        </div>

        <div className="auth-right-body">
          <AuthCard>
            {/* Card header */}
            <div className="auth-card-header">
              <div className="auth-card-logo">
                <BrandLogo size={32} />
                <span className="auth-card-logo-name">QAI</span>
              </div>
              <h2 className="auth-card-title">{T.headline}</h2>
              <p className="auth-card-subtitle">{T.subline}</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-form-body">
                <ErrorAlert message={error} />

                {/* Google Sign-Up — always visible */}
                <GoogleSignInButton
                  label={translations[lang].registerWithGoogle ?? 'Sign up with Google'}
                  divRef={buttonRef}
                  onClick={handleGoogleRegister}
                />

                <OrDivider label={translations[lang].or} />

                {/* Display name */}
                <Field
                  label={T.nameLabel}
                  id="reg-name"
                  type="text"
                  value={displayName}
                  onChange={setDisplayName}
                  placeholder={T.namePlaceholder}
                  required
                  minLength={2}
                  autoComplete="name"
                />

                {/* Email */}
                <Field
                  label={T.emailLabel}
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder={T.emailPlaceholder}
                  required
                  autoComplete="email"
                />

                {/* Password */}
                <div className="auth-field">
                  <label htmlFor="reg-password" className="auth-field-label">
                    {T.passwordLabel}
                  </label>
                  <div className="auth-field-input-wrap">
                    <input
                      id="reg-password"
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={T.passwordPlaceholder}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="auth-field-input"
                      style={{ paddingRight: '44px' }}
                    />
                    <div className="auth-field-suffix">
                      <button
                        type="button"
                        className="auth-toggle-pw"
                        onClick={() => setShowPw((v) => !v)}
                        tabIndex={-1}
                        aria-label={showPw ? 'Hide password' : 'Show password'}
                      >
                        {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <SubmitBtn loading={loading} label={T.submitBtn} />

              {/* Bottom link */}
              <p className="auth-bottom-link">
                {T.hasAccount}
                <Link to="/login">{T.loginLink}</Link>
              </p>
            </form>
          </AuthCard>
        </div>
      </div>
    </div>
  );
}