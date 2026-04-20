import AuthForm from '../components/AuthForm';
import AuthLayout from '../components/AuthLayout';

function SignupPage() {
  return (
    <AuthLayout
      asideCopy="Build your card portfolio, capture real reward constraints, and let SmartSpend AI recommend the best card for each expense with premium clarity."
      asideTitle="Start optimizing rewards like a fintech power user."
      subtitle="Create your SmartSpend AI account."
      title="Create account"
      footer={null}
    >
      <AuthForm mode="signup" />
    </AuthLayout>
  );
}

export default SignupPage;
