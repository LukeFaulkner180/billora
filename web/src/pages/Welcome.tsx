import {Brand} from '../components/Brand';
import {Icon} from '../components/Icons';
import {PREMIUM_MONTHLY_PENCE, PREMIUM_YEARLY_PENCE, premiumSavingsPence, premiumSavingsPercent, formatPremiumPrice} from '../lib/pricing';

type Props = {
  onDemo:()=>void;
  onSignIn:()=>void;
  onSignUp:()=>void;
  onAccountInfo:()=>void;
};

/** The landing-page example is fictional and never reads the visitor's stored finances. */
const bills = [
  {label:'Rent',date:'1 Nov',amount:'£895.00'},
  {label:'Energy',date:'7 Nov',amount:'£135.00'},
  {label:'Council tax',date:'12 Nov',amount:'£165.00'},
];
const categories = [
  {label:'Groceries',spent:'£62',limit:'£80',pct:77.5},
  {label:'Eating out',spent:'£34',limit:'£40',pct:85},
  {label:'Entertainment',spent:'£18',limit:'£30',pct:60},
];

function FinancePreview() {
  return <div className="fin-preview" aria-label="Example Billora dashboard with fictional financial figures">
    <div className="fin-preview-top"><span className="fin-preview-title"><Icon name="overview" size={16}/> Monthly overview</span><span className="fin-example">EXAMPLE DATA</span></div>
    <div className="fin-preview-primary">
      <div><span className="fin-field-label">Monthly income</span><strong>£2,860.00</strong></div>
      <div className="fin-preview-available"><span>After bills & debt payments</span><strong>£1,240.00</strong></div>
    </div>
    <div className="fin-preview-metrics">
      <div><span>Regular bills</span><strong>£1,245.00</strong><small>Monthly total</small></div>
      <div><span>Debt repayments</span><strong>£375.00</strong><small>Monthly planned</small></div>
    </div>
    <div className="fin-preview-bottom">
      <div className="fin-preview-subhead"><strong>Upcoming bills</strong><span>Next payments</span></div>
      {bills.map(bill=><div className="fin-preview-bill" key={bill.label}><div><span className="fin-bill-symbol"><Icon name="receipt" size={15}/></span><span>{bill.label}</span></div><span className="fin-preview-date">{bill.date}</span><strong>{bill.amount}</strong></div>)}
      <div className="fin-preview-foot"><span><span className="fin-dot"/> Monthly totals are estimates</span><span>Demo view</span></div>
    </div>
  </div>;
}

function SpendPreview() {
  return <div className="fin-mini-spend">
    {categories.map(category=><div className="fin-mini-row" key={category.label}>
      <div><span>{category.label}</span><strong>{category.spent} <small>/ {category.limit}</small></strong></div>
      <div className="fin-track"><span className={category.pct>=80?'is-amber':''} style={{width: category.pct+'%'}}/></div>
    </div>)}
    <span className="fin-example-caption">Example weekly category budgets · Premium</span>
  </div>;
}

export function Welcome({onDemo,onSignIn,onSignUp,onAccountInfo}:Props) {
  return <div className="fin-home" id="top">
    <header className="fin-header">
      <a className="fin-logo" href="#top" aria-label="Billora home"><Brand/></a>
      <nav className="fin-main-nav" aria-label="Main site navigation">
        <a href="#features">Features</a><a href="#how">How it works</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a>
      </nav>
      <div className="fin-header-actions">
        <button className="fin-text-button" type="button" onClick={onSignIn}>Sign in</button>
        <button className="fin-header-cta" type="button" onClick={onDemo}>Try the demo <Icon name="arrow" size={16}/></button>
      </div>
    </header>

    <main>
      <section className="fin-hero fin-container" aria-labelledby="fin-hero-heading">
        <div className="fin-hero-copy">
          <span className="fin-eyebrow">PERSONAL FINANCE, WITHOUT THE SPREADSHEETS</span>
          <h1 id="fin-hero-heading">Your bills, spending and debt.<br/><span>All in one place.</span></h1>
          <p className="fin-lede">Know what's due, see where your money goes and make a plan to pay off what you owe. Billora keeps the numbers organised so you can focus on the decisions.</p>
          <div className="fin-hero-actions">
            <button className="fin-button fin-button-primary" type="button" onClick={onDemo}>Explore the live demo <Icon name="arrow" size={18}/></button>
            <a className="fin-button fin-button-outline" href="#features">See what Billora does</a>
          </div>
          <p className="fin-launch-note"><Icon name="info" size={16}/> Public preview with fictional examples. Email accounts are in testing and paid checkout is not live.</p>
        </div>
        <FinancePreview/>
      </section>

      <div className="fin-capabilities" aria-label="What you can track">
        <div className="fin-container fin-capability-items">
          <span><Icon name="calendar" size={17}/> Bills & due dates</span>
          <span><Icon name="wallet" size={17}/> Spending</span>
          <span><Icon name="trend" size={17}/> Debt progress</span>
          <span><Icon name="piggy" size={17}/> Savings goals</span>
        </div>
      </div>

      <section className="fin-section fin-container" id="features" aria-labelledby="fin-features-heading">
        <div className="fin-section-heading">
          <span className="fin-eyebrow">WHAT YOU CAN DO</span>
          <h2 id="fin-features-heading">The numbers that matter, clearly laid out.</h2>
          <p>Billora brings the everyday pieces of managing money into one dashboard.</p>
        </div>
        <div className="fin-features-grid">
          <article className="fin-feature fin-feature-large">
            <div className="fin-feature-heading"><div className="fin-icon"><Icon name="calendar" size={20}/></div><span>01 / BILLS</span></div>
            <h3>Know what's due before it's due.</h3>
            <p>Add your regular payments, track due dates and see your estimated monthly outgoings.</p>
            <div className="fin-feature-demo fin-upcoming-demo">
              <div className="fin-demo-heading"><strong>Next bills</strong><span>Example</span></div>
              {bills.slice(0,2).map(bill=><div className="fin-demo-bill" key={bill.label}><span>{bill.date}</span><strong>{bill.label}</strong><b>{bill.amount}</b></div>)}
            </div>
          </article>
          <article className="fin-feature fin-feature-large">
            <div className="fin-feature-heading"><div className="fin-icon"><Icon name="card" size={20}/></div><span>02 / DEBT</span></div>
            <h3>See your debts moving down.</h3>
            <p>Record repayments, compare payoff strategies and estimate when each balance could be cleared.</p>
            <div className="fin-feature-demo fin-debt-demo">
              <div className="fin-demo-heading"><strong>Credit card</strong><span>Illustrative</span></div>
              <div className="fin-debt-balance"><strong>£1,900</strong><span>remaining of £3,200</span></div>
              <div className="fin-track"><span style={{width:'40.625%'}}/></div>
              <div className="fin-debt-foot"><span>41% paid off</span><span>Based on entered balances</span></div>
            </div>
          </article>
          <article className="fin-feature">
            <div className="fin-feature-heading"><div className="fin-icon"><Icon name="chart" size={20}/></div><span>03 / SPENDING</span></div>
            <h3>Spot where spending adds up.</h3>
            <p>Log purchases for free. Premium adds weekly category limits and receipt scanning.</p>
            <div className="fin-feature-demo"><SpendPreview/></div>
          </article>
          <article className="fin-feature">
            <div className="fin-feature-heading"><div className="fin-icon"><Icon name="piggy" size={20}/></div><span>04 / SAVINGS</span></div>
            <h3>Keep savings goals visible.</h3>
            <p>Set a target and record progress towards a holiday, emergency fund or another goal.</p>
            <div className="fin-feature-demo fin-savings-demo"><div className="fin-demo-heading"><strong>Emergency fund</strong><span>Example</span></div><div className="fin-savings-amount">£625 <span>of £2,000</span></div><div className="fin-track"><span style={{width:'31.25%'}}/></div><span className="fin-example-caption">31% of goal recorded · No money is moved</span></div>
          </article>
        </div>
      </section>

      <section className="fin-section fin-section-alt" id="how" aria-labelledby="fin-how-heading">
        <div className="fin-container fin-how-grid">
          <div><span className="fin-eyebrow">HOW IT WORKS</span><h2 id="fin-how-heading">Start with what you know.</h2><p>You don't need to connect your bank. Enter your figures manually, see your dashboard take shape and adjust your plan as things change.</p><button className="fin-button fin-button-outline" type="button" onClick={onDemo}>Open the demo <Icon name="arrow" size={17}/></button></div>
          <div className="fin-steps">
            <div><span>01</span><div><h3>Add income, bills and debts</h3><p>Include how often you're paid and when regular payments are due.</p></div></div>
            <div><span>02</span><div><h3>Record spending and savings</h3><p>View daily, weekly, monthly and yearly spending in one place.</p></div></div>
            <div><span>03</span><div><h3>Review your next steps</h3><p>Test repayment plans and follow progress against your goals.</p></div></div>
          </div>
        </div>
      </section>

      <section className="fin-section fin-container" id="pricing" aria-labelledby="fin-pricing-heading">
        <div className="fin-section-heading"><span className="fin-eyebrow">SIMPLE PRICING</span><h2 id="fin-pricing-heading">Start free. Upgrade when it helps.</h2><p>Our Premium prices are set for launch, but subscriptions aren't available to purchase yet.</p></div>
        <div className="fin-price-grid">
          <article className="fin-price-card">
            <span className="fin-price-title">Free</span>
            <div className="fin-price"><strong>£0</strong><span>forever</span></div>
            <p>Everything you need to track the basics.</p>
            <ul><li>Bill and income tracking</li><li>Debt repayment planner</li><li>Manual spending history</li><li>Savings goals</li></ul>
            <button className="fin-button fin-button-outline" type="button" onClick={onDemo}>Try free demo</button>
          </article>
          <article className="fin-price-card fin-price-premium">
            <span className="fin-price-title">Premium monthly</span>
            <div className="fin-price"><strong>{formatPremiumPrice(PREMIUM_MONTHLY_PENCE)}</strong><span>/month</span></div>
            <p>Greater control over everyday spending.</p>
            <ul><li>Everything in Free</li><li>Weekly and category budgets</li><li>Receipt photo scanning</li><li>Budget progress indicators</li></ul>
            <span className="fin-coming">Coming soon · no payments yet</span>
          </article>
          <article className="fin-price-card">
            <span className="fin-price-title">Premium annual <span className="fin-saving-pill">SAVE {premiumSavingsPercent}%</span></span>
            <div className="fin-price"><strong>{formatPremiumPrice(PREMIUM_YEARLY_PENCE)}</strong><span>/year</span></div>
            <p>All Premium features, for less over a year.</p>
            <ul><li>Everything in Premium monthly</li><li>Save {formatPremiumPrice(premiumSavingsPence)} over 12 months</li><li>One annual subscription</li><li>Plan and track in one place</li></ul>
            <span className="fin-coming">Coming soon · no payments yet</span>
          </article>
        </div>
      </section>

      <section className="fin-section fin-section-alt" id="faq" aria-labelledby="fin-faq-heading">
        <div className="fin-container fin-faq-grid"><div><span className="fin-eyebrow">COMMON QUESTIONS</span><h2 id="fin-faq-heading">A few things worth knowing.</h2></div>
          <div className="fin-faq-list">
            <details><summary>Do I need to link my bank account?</summary><p>No. You enter your income, bills, debts and purchases manually. Billora doesn't connect to a bank.</p></details>
            <details><summary>Can I try Billora without signing up?</summary><p>Yes. The interactive demo uses fictional figures so you can explore the experience without an account.</p></details>
            <details><summary>How does receipt scanning work?</summary><p>Premium receipt scanning reads an image on your device and suggests the total. You review the details before saving a purchase. It can make mistakes, so always check the amount.</p></details>
            <details><summary>Is Billora ready for real financial information?</summary><p>Not yet. This is a public preview. Email accounts are in testing; payment processing and final privacy controls are still being completed.</p></details>
          </div>
        </div>
      </section>

      <section className="fin-end fin-container">
        <div><span className="fin-eyebrow">TAKE A LOOK INSIDE</span><h2>See how your money could look in Billora.</h2><p>Explore the dashboard, add sample bills and try the debt planner before registering.</p></div>
        <div className="fin-end-actions"><button type="button" className="fin-button fin-button-primary" onClick={onDemo}>Try the interactive demo <Icon name="arrow" size={18}/></button><button type="button" className="fin-account-link" onClick={onSignUp}>View the account preview</button></div>
      </section>
    </main>
    <footer className="fin-footer"><div className="fin-container fin-footer-inner"><a href="#top" aria-label="Billora home"><Brand compact/></a><p>Billora helps you organise money. It isn't a bank and doesn't provide regulated financial advice.</p><button type="button" onClick={onAccountInfo}>Privacy & release status</button><span>© {new Date().getFullYear()} Billora · Public preview</span></div></footer>
  </div>;
}
