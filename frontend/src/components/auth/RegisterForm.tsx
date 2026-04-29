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
  const { register } = useAuth();
  const navigate = useNavigate();
  const { lang, toggleLang } = useLanguage();
  const T = translations[lang].register;

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { buttonRef, isConfigured, triggerGoogleSignIn } = useGoogleAuth();

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

  const handleGoogleRegister = () => {
    setError('');
    if (!isConfigured) {
      setError('Google Sign-In chưa được cấu hình. Vui lòng liên hệ quản trị viên.');
      return;
    }
    triggerGoogleSignIn();
  };

  return (
    <div className="auth-page">
      <HeroPanel lang={lang} />

      <div className="auth-right">
        <div className="auth-right-topbar">
          <LangToggle lang={lang} onToggle={toggleLang} />
        </div>

        <div className="auth-right-body">
          <AuthCard>
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

                <GoogleSignInButton
                  label={translations[lang].registerWithGoogle ?? 'Sign up with Google'}
                  divRef={buttonRef}
                  onClick={handleGoogleRegister}
                />

                <OrDivider label={translations[lang].or} />

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