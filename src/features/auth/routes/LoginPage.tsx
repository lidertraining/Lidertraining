import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, type LoginInput } from '../schemas';
import { login } from '../api/login';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { useToast } from '@shared/hooks/useToast';
import { ROUTES } from '@config/routes';

export function LoginPage() {
  const nav = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });

  const onSubmit = async (values: LoginInput) => {
    setSubmitting(true);
    try {
      await login(values);
      toast('Bem-vindo de volta!', 'success', 'waving_hand');
      nav(ROUTES.DASHBOARD);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao entrar', 'error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-page flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="text-center">
        <h1 className="serif text-4xl font-bold">LiderTraining</h1>
        <p className="mt-2 text-sm text-on-3">Plataforma Elite</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
        <Input
          type="email"
          placeholder="Email"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          type="password"
          placeholder="Senha"
          autoComplete="current-password"
          {...register('password')}
          error={errors.password?.message}
        />
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Entrando\u2026' : 'Entrar'}
        </Button>
      </form>

      <p className="text-center text-xs text-on-3">
        Recebeu um convite? Use o link que seu patrocinador enviou.
        <br />
        <Link to={ROUTES.DASHBOARD} className="text-am hover:underline">
          Voltar ao in\u00edcio
        </Link>
      </p>
    </div>
  );
}
