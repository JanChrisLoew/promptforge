import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-canvas-base p-6 transition-colors duration-300">
                    <div className="max-w-md w-full bg-canvas-card border border-color-border rounded-2xl p-8 shadow-xl text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-accent-1/10 rounded-full flex items-center justify-center text-accent-1">
                                <AlertCircle size={32} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-txt-primary">Something went wrong</h1>
                            <p className="text-txt-secondary text-sm">
                                The application encountered an unexpected error. Don't worry, your prompts are safely stored in your browser.
                            </p>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full flex items-center justify-center gap-2 bg-accent-3 hover:bg-[#007da0] text-white py-3 px-4 rounded-xl font-bold transition-all shadow-md active:scale-95"
                        >
                            <RefreshCw size={18} /> Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
