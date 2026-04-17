import type { FIRDados } from '../firTypes';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Textarea } from '@shared/ui/Textarea';
import { Input } from '@shared/ui/Input';

interface Props {
  dados: FIRDados;
  setDados: (d: FIRDados) => void;
}

const MARCOS = [
  { key: '1m' as const, label: '1 mês', icon: 'flag' },
  { key: '3m' as const, label: '3 meses', icon: 'trending_up' },
  { key: '6m' as const, label: '6 meses', icon: 'rocket_launch' },
  { key: '1a' as const, label: '1 ano', icon: 'military_tech' },
  { key: '2a' as const, label: '2 anos', icon: 'auto_awesome' },
];

export function FIRStepSonho({ dados, setDados }: Props) {
  const setMarco = (key: keyof FIRDados['marcos'], value: string) => {
    setDados({ ...dados, marcos: { ...dados.marcos, [key]: value } });
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDados({ ...dados, sonhoImagem: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="serif text-xl font-bold">O que te move</h2>
        <p className="mt-1 text-sm text-on-2">
          Não é sobre dinheiro — é sobre o que o dinheiro possibilita.
          Escreva sem censura. Esse texto vai te sustentar nos dias difíceis.
        </p>
      </div>

      {/* Sonho em texto */}
      <Card variant="surface-sm" className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <Icon name="favorite" filled className="!text-[18px] text-am" />
          <div className="text-sm font-semibold">Seu sonho em palavras</div>
        </div>
        <Textarea
          value={dados.sonhoTexto}
          onChange={(e) => setDados({ ...dados, sonhoTexto: e.target.value })}
          rows={4}
          placeholder="Daqui a 3 anos eu quero estar..."
        />
      </Card>

      {/* Imagem do sonho */}
      <Card variant="surface-sm" className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <Icon name="image" filled className="!text-[18px] text-gd" />
          <div className="flex-1">
            <div className="text-sm font-semibold">Imagem do sonho</div>
            <div className="text-[10px] text-on-3">
              Uma foto que represente o que você quer. Vai pro papel de parede.
            </div>
          </div>
        </div>
        {dados.sonhoImagem ? (
          <div className="relative">
            <img
              src={dados.sonhoImagem}
              alt="Meu sonho"
              className="h-40 w-full rounded-card object-cover"
            />
            <button
              onClick={() => setDados({ ...dados, sonhoImagem: null })}
              className="tap absolute right-2 top-2 rounded-full bg-sf-void/80 p-1"
            >
              <Icon name="close" className="!text-[16px] text-on-3" />
            </button>
          </div>
        ) : (
          <label className="tap flex cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed border-sf-top p-6 text-on-3 hover:border-am/40">
            <Icon name="add_photo_alternate" className="!text-[28px]" />
            <span className="text-[11px]">Toque pra escolher uma imagem</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </label>
        )}
      </Card>

      {/* Timeline de marcos */}
      <Card variant="surface-sm" className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-2">
          <Icon name="timeline" filled className="!text-[18px] text-am" />
          <div className="text-sm font-semibold">Onde você quer estar</div>
        </div>
        <div className="flex flex-col gap-3">
          {MARCOS.map((m) => (
            <div key={m.key} className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sf-top">
                <Icon name={m.icon} filled className="!text-[14px] text-am" />
              </div>
              <div className="flex-1">
                <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-on-3">
                  Em {m.label}
                </div>
                <Input
                  value={dados.marcos[m.key]}
                  onChange={(e) => setMarco(m.key, e.target.value)}
                  placeholder="Ex: R$ 2.000/mês de renda extra"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
