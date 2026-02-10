import PageMeta from "../../components/common/PageMeta";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Motor Sights International | Parts Catalogs - Sign In"
        description="Motor Sights International | Parts Catalogs - Sign In Page"
        image="/motor-sights-international.png"
      />
        <SignInForm />
    </>
  );
}
