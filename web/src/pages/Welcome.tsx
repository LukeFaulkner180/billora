import {Brand} from '../components/Brand';
import {Icon} from '../components/Icons';
import {PREMIUM_MONTHLY_PENCE, PREMIUM_YEARLY_PENCE, premiumSavingsPence, premiumSavingsPercent, formatPremiumPrice} from '../lib/pricing';

type Props = {
  onDemo:()=>void;
  onSignIn:()=>void;
  onSignUp:()=>void;
  onAccountInfo:()=>void;
};
const features=[
  {icon:'calendar',number:'01',title:'All your bills. One clear place.',description:'See what is due, when it is due and what each month really costs. Weekly, four-weekly and monthly pay all make sense here.'},
  {icon:'card',number:'02',title:'Know where your debt stands.',description:'Track loans and credit cards, record repayments and watch each outstanding balance head in the right direction.'},
  {icon:'trend',number:'03',title:'Make a plan you can actually see.',description:'Explore repayment scenarios and compare debt strategies with easy-to-follow forecasts — without complicated spreadsheets.'},
];
const formatGBP=(n:number)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
export function Welcome({onDemo,onSignIn,onSignUp,onAccountInfo}:Props){
  return <div className="welcome-page" id="top">
    <header className="welcome-header">
      <a href="#top" className="welcome-logo" aria-label="Billora, home"><Brand/></a>
      <nav aria-label="Welcome navigation" className="welcome-links">
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <a href="#how-it-works">How it works</a>
      </nav>
      <div className="welcome-account-actions">
        <button type="button" className="welcome-login" onClick={onSignIn}>Sign in</button>
        <button type="button" className="welcome-primary welcome-signup" onClick={onSignUp}>Get started <span aria-hidden="true">↗</span></button>
      </div>
    </header>
    <main>
      <section className="welcome-hero">
        <div className="welcome-ambient welcome-ambient-one" aria-hidden="true"/>
        <div className="welcome-ambient welcome-ambient-two" aria-hidden="true"/>
        <div className="welcome-hero-inner">
          <div className="welcome-copy">
            <span className="welcome-pill"><span aria-hidden="true"/> YOUR MONEY, MADE CLEARER</span>
            <h1>Less money stress.<br/><em>More money sense.</em></h1>
            <p>Meet your new place for bills, loans and a brighter financial plan. Everything you need to see what goes out, what is left and what comes next.</p>
            <div className="welcome-hero-actions">
              <button type="button" className="welcome-primary welcome-main-cta" onClick={onSignUp}>Create an account <span aria-hidden="true">↗</span></button>
              <button type="button" className="welcome-demo-btn" onClick={onDemo}><Icon name="overview"/> Try the interactive demo</button>
            </div>
            <div className="welcome-promise"><span><Icon name="shield"/> Your data stays yours</span><span><Icon name="trend"/> Plan at your own pace</span></div>
            <p className="welcome-preview-note">Preview release: accounts are being activated. The demo uses fictional information; please don't enter sensitive details yet.</p>
          </div>
          <div className="welcome-device-wrap" aria-label="Example Billora dashboard showing fictional monthly finances">
            <div className="welcome-device-halo" aria-hidden="true"/>
            <div className="welcome-window">
              <div className="welcome-window-head"><Brand compact/><span className="welcome-sample-badge">EXAMPLE DATA</span></div>
              <div className="welcome-window-greeting">Your money, at a glance <span>✦</span></div>
              <div className="welcome-window-sub">OCTOBER OVERVIEW</div>
              <div className="welcome-window-amount">{formatGBP(2860)}<small>Monthly income</small></div>
              <div className="welcome-window-stats">
                <div><span>Monthly bills</span><strong>£1,245</strong><i className="welcome-mini-line mint"/></div>
                <div><span>Debt repayments</span><strong>£375</strong><i className="welcome-mini-line blue"/></div>
              </div>
              <div className="welcome-chart-box"><div className="welcome-chart-label"><strong>Your monthly picture</strong><span>Example</span></div><div className="welcome-bars" aria-hidden="true">{[42,58,49,69,53,78,64,87,72,93,81,98].map((height,index)=><i key={index} style={{height:`${height}%`}} />)}</div><div className="welcome-chart-axis"><span>JAN</span><span>JUN</span><span>DEC</span></div></div>
              <div className="welcome-window-goal"><div><span>On your way to debt-free</span><strong>42% complete</strong></div><div className="welcome-goal-track"><i/></div></div>
            </div>
            <div className="welcome-float-card"><span className="welcome-float-icon"><Icon name="trend"/></span><div><small>Making progress</small><strong>One payment at a time</strong></div></div>
          </div>
        </div>
      </section>
      <section className="welcome-proof" aria-label="The Billora approach"><span>BUILT FOR REAL LIFE</span><span>Recurring bills</span><span>Debt goals</span><span>Visual money insights</span><span>Payday planning</span></section>
      <section className="welcome-features welcome-section" id="features"><div className="welcome-section-heading"><span className="welcome-section-kicker">EVERYTHING IN ONE PLACE</span><h2>A clearer view of your money.<br/><em>A calmer way forward.</em></h2><p>Practical tools for everyday finances. No complicated setup, no confusing jargon.</p></div><div className="welcome-feature-grid">{features.map(feature=><article className="welcome-feature" key={feature.number}><div className="welcome-feature-top"><span className="welcome-feature-icon"><Icon name={feature.icon}/></span><small>{feature.number}</small></div><h3>{feature.title}</h3><p>{feature.description}</p><span className="welcome-feature-line"/></article>)}</div></section>
      <section className="welcome-pricing welcome-section" id="pricing" aria-labelledby="pricing-heading">
        <div className="welcome-section-heading"><span className="welcome-section-kicker">SIMPLE PRICING</span><h2 id="pricing-heading">Get organised for free.<br/><em>Go further with Premium.</em></h2><p>Pricing for our upcoming paid launch. No checkout or payment is currently available.</p></div>
        <div className="welcome-pricing-grid">
          <article className="welcome-pricing-card"><span>FREE FOREVER</span><h3>£0</h3><p>Track bills, debts, savings goals and everyday purchases manually.</p><button type="button" onClick={onDemo}>Explore the demo <span aria-hidden="true">↗</span></button></article>
          <article className="welcome-pricing-card is-premium"><span>PREMIUM MONTHLY</span><h3>{formatPremiumPrice(PREMIUM_MONTHLY_PENCE)}<small>/month</small></h3><p>Weekly budgets, spending-category limits, alerts and receipt scanning.</p><div className="welcome-pricing-soon">Coming soon · not yet accepting payments</div></article>
          <article className="welcome-pricing-card is-premium"><span>PREMIUM ANNUAL · SAVE {premiumSavingsPercent}%</span><h3>{formatPremiumPrice(PREMIUM_YEARLY_PENCE)}<small>/year</small></h3><p>All the same Premium features. Save {formatPremiumPrice(premiumSavingsPence)} over 12 monthly payments.</p><div className="welcome-pricing-soon">Coming soon · not yet accepting payments</div></article>
        </div>
      </section>
      <section className="welcome-how welcome-section" id="how-it-works"><div className="welcome-how-inner"><div><span className="welcome-section-kicker">BUILT AROUND YOU</span><h2>Better money habits,<br/><em>one small step at a time.</em></h2><p>Start by listing what you owe and what you pay. Billora turns the information into something you can understand and act on.</p><button type="button" className="welcome-demo-btn" onClick={onDemo}>Explore Billora's demo <span aria-hidden="true">→</span></button></div><div className="welcome-steps"><div><span>01</span><strong>Add your bills and income</strong><p>Keep regular expenses together in one place.</p></div><div><span>02</span><strong>See the full picture</strong><p>Watch where money goes, what is due, and what is left.</p></div><div><span>03</span><strong>Plan your next move</strong><p>Make progress on debts with an achievable repayment plan.</p></div></div></div></section>
      <section className="welcome-cta-section"><div className="welcome-cta-glow" aria-hidden="true"/><span className="welcome-section-kicker">A FRESH START WITH MONEY</span><h2>It's time to feel<br/><em>more in control.</em></h2><p>Explore your future money dashboard before creating an account.</p><div className="welcome-cta-buttons"><button type="button" className="welcome-primary" onClick={onSignUp}>Create account <span aria-hidden="true">↗</span></button><button type="button" className="welcome-demo-btn" onClick={onDemo}>Try the demo</button></div></section>
    </main>
    <footer className="welcome-footer"><a href="#top" aria-label="Billora home"><Brand compact/></a><div><span>Billora · Personal finance, made clearer.</span><button type="button" onClick={onAccountInfo}>Privacy and release status</button></div><small>© {new Date().getFullYear()} Billora. Prototype preview.</small></footer>
  </div>;
}
