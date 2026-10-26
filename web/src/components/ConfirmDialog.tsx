import {useEffect,useRef} from 'react';
import {Icon} from './Icons';

export type ConfirmationOptions={title:string;message:string;detail?:string;confirmLabel:string;tone?:'success'|'danger'};
export type ConfirmRequest=(options:ConfirmationOptions,onConfirm:()=>void)=>void;
export type ConfirmationState=ConfirmationOptions&{onConfirm:()=>void};

export function ConfirmDialog({confirmation,onCancel,onAccept}:{
 confirmation:ConfirmationState;onCancel:()=>void;onAccept:()=>void
}) {
  const cancelButton=useRef<HTMLButtonElement>(null);
  useEffect(()=>{cancelButton.current?.focus();},[]);
  return <div className="billora-confirm-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onCancel();}}>
    <section className="billora-confirm-dialog" role="alertdialog" aria-modal="true"
      aria-labelledby="billora-confirm-title" aria-describedby="billora-confirm-description"
      onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();onCancel();}}}>
      <div className={`billora-confirm-icon ${confirmation.tone==='danger'?'is-danger':''}`}><Icon name={confirmation.tone==='danger'?'trash':'receipt'} size={25}/></div>
      <h2 id="billora-confirm-title">{confirmation.title}</h2>
      <p id="billora-confirm-description" className="billora-confirm-message">{confirmation.message}</p>
      {confirmation.detail&&<p className="billora-confirm-detail">{confirmation.detail}</p>}
      <div className="billora-confirm-actions">
        <button ref={cancelButton} type="button" className="billora-secondary-button" onClick={onCancel}>Cancel</button>
        <button type="button" className={`billora-primary-button ${confirmation.tone==='danger'?'is-danger':''}`} onClick={onAccept}>{confirmation.confirmLabel}</button>
      </div>
    </section>
  </div>;
}
