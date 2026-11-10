import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <section className="rounded-[2rem] border border-brand/10 bg-white/90 p-8 shadow-[0_20px_60px_rgba(29,92,58,0.08)] backdrop-blur">
      <h1 className="font-display text-3xl font-extrabold text-brand-deep">
        Вход
      </h1>
      <p className="mt-2 text-sm text-muted">
        Войдите, чтобы открыть дневник питания и персональные нормы.
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </section>
  );
}
