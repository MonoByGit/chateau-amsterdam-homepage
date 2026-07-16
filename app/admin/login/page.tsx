import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="a-login-shell">
      <div className="a-card a-login-card">
        <div className="a-login-mark">CA</div>
        <h1 className="a-h1" style={{ fontSize: "1.25rem", textAlign: "center", marginBottom: "1.5rem" }}>
          Chateau Amsterdam
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}
