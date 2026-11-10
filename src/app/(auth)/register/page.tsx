import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <section className="rounded-[2rem] border border-brand/10 bg-white/90 p-8 shadow-[0_20px_60px_rgba(29,92,58,0.08)] backdrop-blur">
      <h1 className="font-display text-3xl font-extrabold text-brand-deep">
        Регистрация
      </h1>
      <p className="mt-2 text-sm text-muted">
        Создайте аккаунт — дальше заполним анкету и рассчитаем нормы питания.
      </p>
      <div className="mt-8">
        <RegisterForm />
      </div>
    </section>
  );
}
