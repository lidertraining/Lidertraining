interface HeroGreetingProps {
  name: string;
}

function salutationFor(date: Date): string {
  const h = date.getHours();
  if (h < 6) return 'Boa madrugada';
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function HeroGreeting({ name }: HeroGreetingProps) {
  const greeting = salutationFor(new Date());
  return (
    <div className="animate-fade-up">
      <div className="text-sm text-on-3">{greeting},</div>
      <h1 className="serif text-3xl font-bold text-on">{name} 💎</h1>
    </div>
  );
}
