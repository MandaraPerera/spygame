import {Component, type ReactNode} from "react";
import {AlertMessage} from "./AlertMessage";

interface ErrorBoundaryProps {
    children: ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = {hasError: false}

    static getDerivedStateFromError(): ErrorBoundaryState {
        return {hasError: true}
    }

    componentDidCatch(error: unknown) {
        console.error(error)
    }

    render() {
        if (this.state.hasError) {
            return (
                <AlertMessage status="error" title="Error" text="Something went wrong."
                              action={{label: "Back to home", onClick: () => window.location.assign("/")}}/>
            )
        }

        return this.props.children
    }
}
