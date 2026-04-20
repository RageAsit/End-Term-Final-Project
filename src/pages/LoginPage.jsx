import AuthForm from '../components/AuthForm';
import AuthLayout from '../components/AuthLayout';

function LoginPage() {
  return (
    <AuthLayout
      asideCopy="Track expenses, model card rules, and get transparent transaction-by-transaction recommendations that help you maximize rewards without mental math."
      asideTitle="Make every swipe reward-aware."
      subtitle="Access your personalized reward optimizer."
      title="Welcome back"
      footer={null}
    >
      <AuthForm mode="login" />
    </AuthLayout>
  );
}

export default LoginPage;
