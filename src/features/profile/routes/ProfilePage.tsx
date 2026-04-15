import { useAuth } from '@shared/hooks/useAuth';
import { useProfile } from '@shared/hooks/useProfile';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { Avatar } from '@shared/ui/Avatar';

export function ProfilePage() {
  const { signOut } = useAuth();
  const { data: profile } = useProfile();

  return (
    <div className="pt-4">
      <h1 className="serif mb-4 text-2xl font-bold">Perfil</h1>

      <Card variant="surface" className="flex flex-col items-center gap-3 p-6 text-center">
        <Avatar name={profile?.name ?? '?'} size="xl" />
        <div>
          <div className="serif text-xl font-bold">{profile?.name ?? 'Consultor'}</div>
          <div className="text-xs text-on-3">{profile?.level ?? 'Master'}</div>
        </div>
      </Card>

      <div className="mt-6">
        <Button variant="outline" fullWidth onClick={signOut}>
          Sair da conta
        </Button>
      </div>

      <p className="mt-4 text-center text-[11px] text-on-3">
        Scout, streak freeze e configura\u00e7\u00f5es chegam em breve.
      </p>
    </div>
  );
}
