import PageMeta from "../../components/common/PageMeta";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Motor Sights International - Sign In"
        description="This is the Sign In page for Motor Sights International"
        image="/motor-sights-international.png"
      />
        <SignInForm />
    </>
  );
}
