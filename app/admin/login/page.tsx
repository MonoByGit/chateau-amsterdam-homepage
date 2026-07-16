import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-6">Chateau Amsterdam — Admin</h1>
        <LoginForm />
      </div>
    </main>
  );
}
