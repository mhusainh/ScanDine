import React from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-coffee-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center border-t-4 border-red-500">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="text-red-600" size={32} />
                        </div>
                        
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Oops! Something went wrong.
                        </h1>
                        
                        <p className="text-gray-600 mb-6">
                            We encountered an unexpected error. The application has crashed.
                        </p>

                        {/* Development details - helpful for "blank screen" debugging */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-gray-100 p-4 rounded-lg text-left mb-6 overflow-auto max-h-48 text-xs font-mono text-gray-700">
                                <p className="font-bold text-red-600 mb-2">{this.state.error.toString()}</p>
                                <pre>{this.state.errorInfo?.componentStack}</pre>
                            </div>
                        )}

                        <button
                            onClick={this.handleReload}
                            className="inline-flex items-center justify-center px-6 py-3 bg-coffee-600 text-white font-medium rounded-lg hover:bg-coffee-700 transition-colors w-full"
                        >
                            <RefreshCcw className="mr-2" size={18} />
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
