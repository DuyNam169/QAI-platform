import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Khai báo type cho Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              type?: 'standard' | 'icon';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: number;
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              logo_alignment?: 'left' | 'center';
            }
          ) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

/**
 * Hook quản lý toàn bộ luồng Google Sign-In.
 * Tự động load Google SDK và render button vào element được chỉ định.
 */
export function useGoogleAuth() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      try {
        await loginWithGoogle(response.credential);
        navigate('/');
      } catch (err) {
        console.error('Google login thất bại:', err);
        // Để component cha xử lý lỗi – throw để caller catch được
        throw err;
      }
    },
    [loginWithGoogle, navigate]
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn('VITE_GOOGLE_CLIENT_ID chưa được cấu hình');
      return;
    }

    const initGoogle = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          width: buttonRef.current.offsetWidth || 400,
          text: 'continue_with',
          logo_alignment: 'left',
        });
      }
    };

    // Nếu SDK đã load rồi
    if (window.google) {
      initGoogle();
      return;
    }

    // Load Google Identity Services SDK
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);

    return () => {
      // Cleanup: disable auto-select khi unmount
      window.google?.accounts.id.disableAutoSelect();
    };
  }, [handleCredentialResponse]);

  return { buttonRef, isConfigured: !!GOOGLE_CLIENT_ID };
}