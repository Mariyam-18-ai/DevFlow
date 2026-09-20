import type { ReactNode } from "react";

interface ManagementModalProps {
  title: string;
  eyebrow: string;
  message?: string;
  saving?: boolean;
  children: ReactNode;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
}

export function ManagementModal({
  title,
  eyebrow,
  message,
  saving = false,
  children,
  onClose,
  onSubmit,
  submitLabel,
}: ManagementModalProps) {
  return (
    <div className="df-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="df-management-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="management-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="df-management-modal-header">
          <div>
            <span className="df-eyebrow">{eyebrow}</span>
            <h2 id="management-modal-title">{title}</h2>
          </div>
          <button
            type="button"
            className="df-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {message && <div className="df-crud-message">{message}</div>}

        <div className="df-management-modal-body">{children}</div>

        <div className="df-crud-actions">
          <button type="button" className="df-secondary-button" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="df-primary-button" disabled={saving} onClick={onSubmit}>
            {saving ? "Saving…" : submitLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
