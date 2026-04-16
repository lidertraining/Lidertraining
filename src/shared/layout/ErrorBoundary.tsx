import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@shared/ui/Button';
import { Icon } from '@shared/ui/Icon';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-sf-void px-6 text-center">
          <Icon name="error" filled className="!text-5xl text-rb" />
          <h1 className="serif text-2xl font-bold">Algo deu errado</h1>
          <p className="max-w-xs text-sm text-on-3">
            Nós registramos o erro. Tente recarregar a página.
          </p>
          <Button onClick={() => window.location.reload()}>Recarregar</Button>
          <button onClick={this.reset} className="text-xs text-on-3 hover:text-on">
            Tentar de novo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
