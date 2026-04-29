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

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { lang, toggleLang } = useLanguage();
  const T = translations[lang].login;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // triggerGoogleSignIn triggers the GIS prompt; buttonRef holds the hidden GIS button
  const { buttonRef, isConfigured, triggerGoogleSignIn } = useGoogleAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch {
      setError(T.errorInvalid);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
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
                  label={translations[lang].loginWithGoogle ?? 'Continue with Google'}
                  divRef={buttonRef}
                  onClick={handleGoogleLogin}
                />

                <OrDivider label={translations[lang].or} />

                <Field
                  label={T.emailLabel}
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder={T.emailPlaceholder}
                  required
                  autoComplete="email"
                />

                <div className="auth-field">
                  <div className="auth-password-row">
                    <label htmlFor="login-password" className="auth-field-label">
                      {T.passwordLabel}
                    </label>
                    <Link to="/forgot-password" className="auth-forgot-link">
                      {T.forgotPassword}
                    </Link>
                  </div>
                  <div className="auth-field-input-wrap">
                    <input
                      id="login-password"
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={T.passwordPlaceholder}
                      required
                      autoComplete="current-password"
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

                <label className="auth-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>{T.rememberMe}</span>
                </label>
              </div>

              <SubmitBtn loading={loading} label={T.submitBtn} />

              <p className="auth-bottom-link">
                {T.noAccount}
                <Link to="/register">{T.signUpLink}</Link>
              </p>
            </form>
          </AuthCard>
        </div>
      </div>
    </div>
  );
}