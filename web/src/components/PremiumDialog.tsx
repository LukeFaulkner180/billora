import {Icon} from '../components/Icons';

type Props={onClose:()=>void; onAccount:()=>void; signedIn:boolean;};
export function PremiumDialog({onClose,onAccount,signedIn}:Props){
  return <div className="premium-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}>
    <section className="premium-dialog" role="dialog" aria-modal="true" aria-labelledby="premium-heading">
      <button type="button" className="premium-close" onClick={onClose} aria-label="Close premium details"><Icon name="close"/></button>
      <span className="premium-eyebrow">BILLORA PREMIUM</span>
      <div className="premium-glow-icon"><Icon name="sparkle" size={26}/></div>
      <h2 id="premium-heading">Your money. More in control.</h2>
      <p>Get detailed budgets, category-by-category spending limits and receipt photo scanning, all in Billora's midnight experience.</p>
      <div className="premium-plan-grid">
        <div><small>FREE FOREVER</small><strong>£0</strong><span>Bills, debts, savings goals and manual spending</span></div>
        <div className="premium-plan-highlight"><small>PREMIUM</small><strong>Coming soon</strong><span>Weekly budgets, category targets, receipt scanning and advanced alerts</span></div>
      </div>
      <div className="premium-included">
        <span><Icon name="check"/> Set category budgets by week</span>
        <span><Icon name="check"/> Scan receipts and verify the total</span>
        <span><Icon name="check"/> Know when spending is near a limit</span>
      </div>
      <div className="premium-no-charge">Payments are not enabled yet. No subscription or payment will be created.</div>
      {!signedIn?<button className="btn btn-primary premium-primary" onClick={()=>{onClose();onAccount();}}>Create a free account</button>:
        <button className="btn btn-primary premium-primary" onClick={onClose}>Continue with Free</button>}
    </section>
  </div>;
}
