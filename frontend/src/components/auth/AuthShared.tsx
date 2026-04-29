/**
 * Shared auth UI building blocks.
 * Used by both LoginForm and RegisterForm.
 * Brand: QAI — AI Content & Social Publishing Platform
 */

import { type ReactNode } from 'react';
import type { Lang } from '../../i18n/translations';

// ─── Brand logo ──────────────────────────────────────────────────────────────
export function BrandLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-label="QAI logo">
      <rect width="40" height="40" rx="10" fill="#0F766E" />
      {/* Q shape */}
      <circle cx="17" cy="18" r="7" stroke="#CCFBF1" strokeWidth="2.5" fill="none" />
      <line x1="22" y1="23" x2="27" y2="28" stroke="#CCFBF1" strokeWidth="2.5" strokeLinecap="round" />
      {/* AI spark */}
      <circle cx="28" cy="12" r="3" fill="#2DD4BF" />
      <path d="M28 9v1M28 14v1M25 12h1M30 12h1" stroke="#0F766E" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Language toggle ──────────────────────────────────────────────────────────
export function LangToggle({ lang, onToggle }: { lang: Lang; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="auth-lang-toggle"
      aria-label="Toggle language"
      title={lang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      <span>{lang.toUpperCase()}</span>
    </button>
  );
}

// ─── Hero panel ───────────────────────────────────────────────────────────────
interface HeroPanelProps {
  lang: Lang;
}

const FEATURES = {
  vi: [
    { icon: PenIcon,       label: 'Viết content AI — Blog, caption, kịch bản' },
    { icon: CalendarIcon,  label: 'Lên lịch & đăng bài tự động đa nền tảng' },
    { icon: BarChartIcon,  label: 'Phân tích hiệu suất & tối ưu engagement' },
    { icon: SparkIcon,     label: 'Tái sử dụng nội dung — 1 bài thành 10 định dạng' },
  ],
  en: [
    { icon: PenIcon,       label: 'AI Writing — Blog posts, captions, scripts' },
    { icon: CalendarIcon,  label: 'Schedule & auto-post across all platforms' },
    { icon: BarChartIcon,  label: 'Analytics & engagement optimization' },
    { icon: SparkIcon,     label: 'Content repurposing — 1 piece, 10 formats' },
  ],
};

const TAGLINE = {
  vi: { line1: 'Tạo content.', line2: 'Lên lịch.', line3: 'Lan toả.' },
  en: { line1: 'Create.', line2: 'Schedule.', line3: 'Amplify.' },
};

const APP_NAME = 'QAI';

export function HeroPanel({ lang }: HeroPanelProps) {
  const features = FEATURES[lang];
  const tag = TAGLINE[lang];
  return (
    <div className="auth-hero">
      <div className="auth-hero-blob blob-1" aria-hidden />
      <div className="auth-hero-blob blob-2" aria-hidden />

      {/* Top brand */}
      <div className="auth-hero-brand">
        <BrandLogo size={34} />
        <span className="auth-hero-brand-name">{APP_NAME}</span>
      </div>

      {/* Center copy */}
      <div className="auth-hero-copy">
        <div className="auth-hero-badge">
          {lang === 'vi' ? 'AI Content Platform' : 'AI Content Platform'}
        </div>
        <h1 className="auth-hero-h1">
          {tag.line1}<br />
          <em>{tag.line2}</em><br />
          {tag.line3}
        </h1>
        <p className="auth-hero-sub">
          {lang === 'vi'
            ? 'Từ ý tưởng đến bài đăng — trong vài giây. Kết nối Facebook, Instagram, TikTok, LinkedIn và hơn thế nữa.'
            : 'From idea to published post — in seconds. Connect Facebook, Instagram, TikTok, LinkedIn and more.'}
        </p>
      </div>

      {/* Feature pills */}
      <div className="auth-hero-features">
        {features.map(({ icon: Icon, label }) => (
          <div key={label} className="auth-hero-feature-pill">
            <div className="auth-hero-feature-icon">
              <Icon />
            </div>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="auth-hero-fade" aria-hidden />
    </div>
  );
}

// ─── Auth card wrapper ────────────────────────────────────────────────────────
export function AuthCard({ children }: { children: ReactNode }) {
  return <div className="auth-card">{children}</div>;
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function OrDivider({ label }: { label: string }) {
  return (
    <div className="auth-divider" role="separator">
      <span>{label}</span>
    </div>
  );
}

// ─── Google Sign-In button ────────────────────────────────────────────────────
interface GoogleSignInButtonProps {
  label: string;
  divRef: React.RefObject<HTMLDivElement | null>;
  onClick?: () => void;
}

export function GoogleSignInButton({ label, divRef, onClick }: GoogleSignInButtonProps) {
  return (
    <div className="auth-google-wrapper">
      <div ref={divRef} style={{ display: 'none' }} />
      <button
        className="auth-google-btn"
        type="button"
        aria-label={label}
        onClick={onClick}
      >
        <GoogleIcon />
        <span>{label}</span>
      </button>
    </div>
  );
}

// ─── Form field ───────────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  suffix?: ReactNode;
}

export function Field({
  label, id, type = 'text', value, onChange, placeholder,
  required, minLength, autoComplete, suffix,
}: FieldProps) {
  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-field-label">{label}</label>
      <div className="auth-field-input-wrap">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className="auth-field-input"
        />
        {suffix && <div className="auth-field-suffix">{suffix}</div>}
      </div>
    </div>
  );
}

// ─── Submit button ────────────────────────────────────────────────────────────
export function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading} className="auth-submit-btn">
      {loading ? <Spinner /> : label}
    </button>
  );
}

// ─── Error alert ─────────────────────────────────────────────────────────────
export function ErrorAlert({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="auth-error" role="alert">
      <AlertIcon />
      <span>{message}</span>
    </div>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────
function PenIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L9.1 9.1 2 12l7.1 2.9L12 22l2.9-7.1L22 12l-7.1-2.9L12 2z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="auth-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}