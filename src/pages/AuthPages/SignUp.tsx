import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Motor Sights International - Sign Up"
        description="This is the Sign Up page for Motor Sights International"
        image="/motor-sights-international.png"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
