export type Lang = 'vi' | 'en';

export const translations = {
vi: {
    or: 'hoặc',
loading: 'Đang tải...',

// Login Page
login: {
headline: 'Chào mừng trở lại',
subline: 'Đăng nhập để tiếp tục học tập cùng AI',
emailLabel: 'Email hoặc số điện thoại',
emailPlaceholder: 'Nhập email hoặc số điện thoại',
passwordLabel: 'Mật khẩu',
passwordPlaceholder: 'Nhập mật khẩu',
rememberMe: 'Ghi nhớ đăng nhập',
forgotPassword: 'Quên mật khẩu?',
submitBtn: 'Đăng nhập',
orContinueWith: 'hoặc tiếp tục với',
continueGoogle: 'Tiếp tục với Google',
noAccount: 'Chưa có tài khoản?',
signUpLink: 'Đăng ký',
errorInvalid: 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.',
},

// Register Page
register: {
headline: 'Tạo tài khoản',
subline: 'Bắt đầu hành trình học tập thông minh của bạn',
nameLabel: 'Họ và tên',
namePlaceholder: 'Nguyễn Văn A',
emailLabel: 'Email',
emailPlaceholder: 'you@example.com',
passwordLabel: 'Mật khẩu',
passwordPlaceholder: 'Tối thiểu 6 ký tự',
submitBtn: 'Tạo tài khoản',
orContinueWith: 'hoặc đăng ký với',
continueGoogle: 'Tiếp tục với Google',
hasAccount: 'Đã có tài khoản?',
loginLink: 'Đăng nhập',
errorFailed: 'Đăng ký thất bại. Vui lòng thử lại.',
},

// Hero panel
hero: {
tagline: 'Nền tảng học tập AI',
features: [
{ title: 'Tin tức & Cộng đồng y tế', icon: 'heart' },
{ title: 'Trợ lý AI y khoa', icon: 'search' },
{ title: 'Kết nối với bác sĩ', icon: 'user' },
],
},
},

en: {
// Common
or: 'or',
loading: 'Loading...',

// Login Page
login: {
headline: 'Welcome back',
subline: 'Sign in to continue learning with AI',
emailLabel: 'Email or phone number',
emailPlaceholder: 'Enter email or phone number',
passwordLabel: 'Password',
passwordPlaceholder: 'Enter your password',
rememberMe: 'Remember me',
forgotPassword: 'Forgot password?',
submitBtn: 'Sign in',
orContinueWith: 'or continue with',
continueGoogle: 'Continue with Google',
noAccount: "Don't have an account?",
signUpLink: 'Sign up',
errorInvalid: 'Invalid email or password. Please try again.',
},

// Register Page
register: {
headline: 'Create an account',
subline: 'Start your smart learning journey today',
nameLabel: 'Full name',
namePlaceholder: 'John Doe',
emailLabel: 'Email',
emailPlaceholder: 'you@example.com',
passwordLabel: 'Password',
passwordPlaceholder: 'Minimum 6 characters',
submitBtn: 'Create account',
orContinueWith: 'or sign up with',
continueGoogle: 'Continue with Google',
hasAccount: 'Already have an account?',
loginLink: 'Sign in',
errorFailed: 'Registration failed. Please try again.',
},

// Hero panel
hero: {
tagline: 'AI Learning Platform',
features: [
{ title: 'Medical News & Community', icon: 'heart' },
{ title: 'AI Medical Assistant', icon: 'search' },
{ title: 'Connect with Doctors', icon: 'user' },
],
},
},
} as const;

export function t(lang: Lang, key: string): string {
  const keys = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let val: any = translations[lang];
  for (const k of keys) {
    val = val?.[k];
  }
  return typeof val === 'string' ? val : key;
}