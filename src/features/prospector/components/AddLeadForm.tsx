import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateLeadSchema, type CreateLeadInput } from '../schemas';
import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { useCreateLead } from '../hooks/useLeads';

export function AddLeadForm() {
  const { mutateAsync, isPending } = useCreateLead();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLeadInput>({
    resolver: zodResolver(CreateLeadSchema),
    defaultValues: { status: 'frio', source: 'Lista quente' },
  });

  const onSubmit = async (values: CreateLeadInput) => {
    await mutateAsync(values);
    reset({ status: 'frio', source: 'Lista quente', name: '', phone: '' });
  };

  return (
    <Card variant="surface" className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <Icon name="person_add" filled className="!text-[20px] text-am" />
        <h2 className="serif text-base font-bold">Novo lead</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <Input placeholder="Nome" {...register('name')} error={errors.name?.message} />
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="tel"
            placeholder="Telefone (opcional)"
            {...register('phone')}
            error={errors.phone?.message}
          />
          <Select {...register('status')}>
            <option value="frio">Frio</option>
            <option value="morno">Morno</option>
            <option value="quente">Quente</option>
            <option value="fechado">Fechado</option>
          </Select>
        </div>
        <Select {...register('source')}>
          <option>Lista quente</option>
          <option>Instagram</option>
          <option>Indicação</option>
          <option>Evento</option>
          <option>Facebook</option>
          <option>WhatsApp</option>
        </Select>
        <Button type="submit" disabled={isPending} fullWidth>
          {isPending ? 'Adicionando…' : 'Adicionar · +15 XP'}
        </Button>
      </form>
    </Card>
  );
}
