import type {ReactNode} from 'react';
import {Icon} from './Icons';

export function PageHeading({eyebrow, title, description, children}: {eyebrow: string; title: string; description: string; children?: ReactNode}) {
  return <div className="page-heading"><div><div className="page-eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div><div className="actions">{children}</div></div>;
}
export function Button({children, onClick, variant = 'primary', disabled = false}: {children: ReactNode; onClick: () => void; variant?: 'primary'|'secondary'|'quiet'|'danger'; disabled?: boolean}) {
  return <button type="button" disabled={disabled} className={`btn btn-${variant}`} onClick={onClick}>{children}</button>;
}
export function Empty({title, message, children}: {title: string; message: string; children?: ReactNode}) {
  return <div className="empty"><Icon name="sparkle" size={26}/><strong>{title}</strong><p>{message}</p>{children}</div>;
}
export function Modal({title, onClose, children}: {title: string; onClose: () => void; children: ReactNode}) {
  return <div className="modal-backdrop" onMouseDown={e => {if (e.target === e.currentTarget) onClose();}}>
    <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <header className="modal-header"><h2>{title}</h2><button className="icon-btn" type="button" onClick={onClose} aria-label="Close"><Icon name="close"/></button></header>
      <div className="modal-body">{children}</div>
    </section>
  </div>;
}
