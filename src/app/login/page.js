import AuthForm from '@/components/AuthForm';
import { tr } from '@/lib/i18n';

export default function Page() {
  const { t } = tr();
  const L = Object.fromEntries(['login_title', 'register_title', 'name', 'iam', 'email', 'password', 'create_account', 'have_account', 'no_account', 'make_one', 'consent', 'tourist', 'local', 'student', 'expat', 'login'].map((k) => [k, t(k)]));
  return <AuthForm mode="login" L={L} />;
}
