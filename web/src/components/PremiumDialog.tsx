import {Icon} from '../components/Icons';
import {PREMIUM_MONTHLY_PENCE, PREMIUM_YEARLY_PENCE, premiumSavingsPence, premiumSavingsPercent, formatPremiumPrice} from '../lib/pricing';

type Props={onClose:()=>void; onAccount:()=>void; signedIn:boolean;};
export function PremiumDialog({onClose,onAccount,signedIn}:Props){
  return <div className="premium-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}>
    <section className="premium-dialog" role="dialog" aria-modal="true" aria-labelledby="premium-heading">
      <button type="button" className="premium-close" onClick={onClose} aria-label="Close premium details"><Icon name="close"/></button>
      <span className="premium-eyebrow">BILLORA PREMIUM</span>
      <div className="premium-glow-icon"><Icon name="sparkle" size={26}/></div>
      <h2 id="premium-heading">Your money. More in control.</h2>
      <p>Get detailed budgets, on-device receipt camera scanning and Billora Together: a Premium joint household for two separate accounts.</p>
      <div className="premium-plan-grid" aria-label="Billora subscription options">
        <div><small>FREE FOREVER</small><strong>£0</strong><span>Bills, debts, savings goals and manual spending</span></div>
        <div className="premium-plan-highlight"><small>PREMIUM MONTHLY</small><strong>{formatPremiumPrice(PREMIUM_MONTHLY_PENCE)}<em>/month</em></strong><span>Weekly budgets, camera scanning and Billora Together for two</span></div>
        <div className="premium-plan-highlight premium-yearly"><small>PREMIUM ANNUAL · SAVE {premiumSavingsPercent}%</small><strong>{formatPremiumPrice(PREMIUM_YEARLY_PENCE)}<em>/year</em></strong><span>Same Premium features · save {formatPremiumPrice(premiumSavingsPence)} versus paying monthly</span></div>
      </div>
      <div className="premium-included">
        <span><Icon name="check"/> Set category budgets by week</span>
        <span><Icon name="check"/> Scan receipts and verify the total</span>
        <span><Icon name="check"/> Know when spending is near a limit</span>
        <span><Icon name="check"/> Billora Together: one joint household, two private accounts</span>
      </div>
      <div className="premium-no-charge">Pricing agreed for launch. Payments are not enabled yet; no subscription or charge will be created.</div>
      {!signedIn?<button className="btn btn-primary premium-primary" onClick={()=>{onClose();onAccount();}}>Create a free account</button>:
        <button className="btn btn-primary premium-primary" onClick={onClose}>Continue with Free</button>}
    </section>
  </div>;
}
