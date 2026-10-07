import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, CircleAlert, X } from 'lucide-react'

type ToastMessage = { id: number; message: string; kind: 'success' | 'error' }
type ToastContextValue = { notify: (message: string, kind?: ToastMessage['kind']) => void }

const ToastContext = createContext<ToastContextValue | null>(null)
let nextToastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const dismiss = useCallback((id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)), [])
  const notify = useCallback((message: string, kind: ToastMessage['kind'] = 'success') => {
    const id = ++nextToastId
    setToasts((current) => [...current, { id, message, kind }])
    window.setTimeout(() => dismiss(id), 4200)
  }, [dismiss])

  return <ToastContext.Provider value={{ notify }}>
    {children}
    <div className="toast-stack" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => <div className={`toast-message ${toast.kind}`} key={toast.id} role={toast.kind === 'error' ? 'alert' : 'status'}>
        {toast.kind === 'success' ? <CheckCircle2 size={17}/> : <CircleAlert size={17}/>}
        <span>{toast.message}</span>
        <button onClick={() => dismiss(toast.id)} aria-label="Dismiss notification"><X size={15}/></button>
      </div>)}
    </div>
  </ToastContext.Provider>
}

export function useToast() {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast must be used inside ToastProvider')
  return value
}
