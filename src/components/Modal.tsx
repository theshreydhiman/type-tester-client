import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '420px',
          width: '90%',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
