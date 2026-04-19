import { Component, type ReactNode } from 'react';
import { ServerErrorPage } from '@/pages/Error/ServerErrorPage';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) return <ServerErrorPage />;
        return this.props.children;
    }
}
