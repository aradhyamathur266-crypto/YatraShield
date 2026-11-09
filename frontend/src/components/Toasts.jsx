import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function Toasts({ toasts }) {
  return (
    <div className="toast-wrap" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.type === "success" ? <CheckCircle2 /> : <AlertTriangle />}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
