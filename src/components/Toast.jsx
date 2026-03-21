import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Toast.css';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
};

export default function ToastContainer() {
  const { state, dispatch } = useApp();

  return (
    <div className="toast-container">
      <AnimatePresence>
        {state.toasts.map((toast) => {
          const Icon = icons[toast.type] || icons.info;
          return (
            <motion.div
              key={toast.id}
              className={`toast toast--${toast.type}`}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            >
              <Icon size={18} />
              <span className="toast__message">{toast.message}</span>
              <button
                className="toast__close"
                onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
