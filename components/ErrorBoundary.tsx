'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback: (props: { error: Error; reset: () => void }) => ReactNode
}

interface State {
  error: Error | null
}

/**
 * ErrorBoundary — Class Component (React non ha ancora hook per questo).
 *
 * Cattura gli errori lanciati da use() dentro il sottoalbero,
 * inclusi i rejection delle Promise passate a use().
 *
 * Il prop `fallback` è una render function che riceve l'errore
 * e una funzione `reset` per riprovare (resetta lo stato interno).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return this.props.fallback({ error: this.state.error, reset: this.reset })
    }
    return this.props.children
  }
}
