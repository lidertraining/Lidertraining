import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { validateInvite } from '../api/validateInvite';
import { signupWithInvite } from '../api/signup';
import { SignupSchema, type SignupInput } from '../schemas';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Card } from '@shared/ui/Card';
import { useToast } from '@shared/hooks/useToast';
import { Logo } from '@shared/ui/Logo';
import { ROUTES } from '@config/routes';

export function InviteLandingPage() {
  const { code = '' } = useParams();
  const nav = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const { data: invite, isLoading } = useQuery({
    queryKey: ['invite', code],
    queryFn: () => validateInvite(code),
    enabled: !!code,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({ resolver: zodResolver(SignupSchema) });

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-on-3">
        Validando convite…
      </div>
    );
  }

  if (!invite?.valid) {
    const reason =
      invite?.reason === 'expired'
        ? 'Este convite expirou'
        : invite?.reason === 'exhausted'
          ? 'Este convite já foi usado'
          : 'Convite inválido ou inexistente';
    return (
      <div className="mx-auto flex min-h-dvh max-w-page flex-col items-center justify-center gap-4 px-6">
        <Card variant="surface" className="w-full p-6 text-center">
          <h2 className="serif mb-2 text-xl font-bold">{reason}</h2>
          <p className="text-sm text-on-3">Fale com seu patrocinador para receber um novo link.</p>
        </Card>
      </div>
    );
  }

  const onSubmit = async (values: SignupInput) => {
    setSubmitting(true);
    try {
      await signupWithInvite({ ...values, code });
      toast('Conta criada! Bem-vindo à equipe', 'success', 'celebration');
      nav(ROUTES.ONBOARDING);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao criar conta', 'error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-page flex-col gap-6 px-6 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo size="lg" />
        <p className="text-sm text-on-3">
          Você foi convidado por{' '}
          <strong className="text-am">{invite.ownerName}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <Input
          type="text"
          placeholder="Seu nome"
          autoComplete="name"
          {...register('name')}
          error={errors.name?.message}
        />
        <Input
          type="email"
          placeholder="E-mail"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          type="tel"
          placeholder="WhatsApp (DDD + número)"
          autoComplete="tel"
          inputMode="numeric"
          {...register('phone')}
          error={errors.phone?.message}
        />
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-on-3 pl-1">Data de nascimento</span>
          <Input
            type="date"
            autoComplete="bday"
            {...register('dataNascimento')}
            error={errors.dataNascimento?.message}
          />
        </label>
        <Input
          type="password"
          placeholder="Senha (mín. 6 caracteres)"
          autoComplete="new-password"
          {...register('password')}
          error={errors.password?.message}
        />
        <Input
          type="password"
          placeholder="Confirmar senha"
          autoComplete="new-password"
          {...register('confirm')}
          error={errors.confirm?.message}
        />
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </form>

      <p className="text-center text-[11px] text-on-3">
        Ao criar uma conta você concorda com os termos da plataforma.
      </p>
    </div>
  );
}
