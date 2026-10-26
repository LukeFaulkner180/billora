import type {FinanceData, Page} from '../types';
import {categoryColours, compactPounds, dateText, dueStatus, monthly, pounds, today, total} from '../lib/money';
import {payoffDate, planDebts} from '../lib/planner';
import {Button, Empty, PageHeading} from '../components/Ui';
import {Icon} from '../components/Icons';
import {AnimatedMoney} from '../components/AnimatedMoney';

export function Overview({data, add, navigate}: {data: FinanceData; add: (kind: 'bill'|'debt') => void; navigate: (page: Page) => void}) {
  const income = total(data.incomes.map(i => monthly(i.amount, i.frequency)));
  const bills = total(data.bills.map(b => monthly(b.amount, b.frequency)));
  const minimums = total(data.debts.filter(d => d.balance > 0).map(d => d.minPayment));
  const remaining = income - bills - minimums;
  const debtTotal = total(data.debts.map(d => d.balance));
  const originalTotal = total(data.debts.map(d => d.originalBalance));
  const progress = originalTotal ? Math.max(0, Math.min(100, Math.round((originalTotal - debtTotal) / originalTotal * 100))) : 100;
  const projection = planDebts(data.debts, data.settings.extraPayment, data.settings.strategy);
  const billTypes = Object.entries(categoryColours).map(([name, colour]) => ({name, colour, amount: total(data.bills.filter(b => b.category === name).map(b => monthly(b.amount, b.frequency)))})).filter(c => c.amount > 0);
  let degrees = 0;
  const donut = bills ? `conic-gradient(${billTypes.map(c => {const from = degrees; degrees += c.amount / bills * 360; return `${c.colour} ${from}deg ${degrees}deg`;}).join(',')})` : 'conic-gradient(#e8eaf3 0deg 360deg)';
  const upcoming = [...data.bills].sort((a,b) => a.nextDue.localeCompare(b.nextDue)).slice(0,5);
  const month = new Date().toLocaleDateString('en-GB', {month: 'long', year:'numeric'});
  return <>
    <PageHeading eyebrow="Your money at a glance" title="Good to see you 👋" description={`Here's a clear picture of your finances for ${month}.`}>
      <Button onClick={() => add('bill')}><Icon name="plus"/> Add a bill</Button>
      <Button variant="secondary" onClick={() => add('debt')}>Add a debt</Button>
    </PageHeading>
    <section className="money-hero" aria-label="Financial overview">
      <div className="money-hero-orb orb-a"/><div className="money-hero-orb orb-b"/>
      <div className="money-hero-copy">
        <div className="hero-kicker"><span className="hero-kicker-dot"/> YOUR MONEY, IN FOCUS</div>
        <h2>Know where you stand.<br/><em>Love where you're going.</em></h2>
        <p>A calmer way to see what's coming in, what's going out and what you're making progress on.</p>
        <div className="hero-actions"><button className="hero-action-main" onClick={()=>navigate('planner')}>Plan my next move <Icon name="arrow"/></button><button className="hero-action-quiet" onClick={()=>navigate('bills')}>See upcoming bills <Icon name="arrow"/></button></div>
      </div>
      <div className="hero-visual" aria-hidden="true"><div className="hero-visual-head"><span>YOUR MONTHLY OUTLOOK</span><span>✧</span></div>
        <div className="hero-visual-balance"><small>After tracked costs</small><strong>{pounds(remaining)}</strong></div>
        <svg viewBox="0 0 335 115" className="hero-chart" preserveAspectRatio="none"><defs><linearGradient id="hero-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#b4ffda" stopOpacity=".35"/><stop offset="1" stopColor="#b4ffda" stopOpacity="0"/></linearGradient></defs><path d="M0 85 C24 92 37 56 68 68 S117 106 146 61 S199 75 230 37 S284 72 335 9 L335 115 L0 115Z" fill="url(#hero-fill)"/><path d="M0 85 C24 92 37 56 68 68 S117 106 146 61 S199 75 230 37 S284 72 335 9" fill="none" stroke="#b4ffda" strokeWidth="3" strokeLinecap="round"/></svg>
        <div className="hero-visual-foot"><span><i/> YOUR PROGRESS</span><strong>{progress}% towards debt-free</strong></div>
      </div>
    </section>
    {data.mode === 'demo' && <div className="newbie-banner"><Icon name="info"/><span>You're viewing <strong>example data</strong>. This demo isn't connected to your bank.</span><button onClick={() => navigate('settings')}>Start with my data</button></div>}
    {data.bills.some(b => b.nextDue < today()) && <div className="alert-list"><div className="alert-line"><Icon name="alert"/><span>Some bills have overdue dates. Check them in My Bills.</span></div></div>}
    <section className="stat-grid" aria-label="Monthly financial summary">
      <Stat title="Monthly income" value={income} note="Monthly equivalent" icon="wallet" />
      <Stat title="Monthly bills" value={bills} note={`${data.bills.length} bills tracked`} icon="receipt" colour="orange" />
      <Stat title="Debt repayments" value={minimums} note="Contractual minimums" icon="card" colour="red" />
      <Stat title="After tracked costs" value={remaining} note="Before food & daily spending" icon="piggy" colour={remaining < 0 ? 'red' : 'green'} />
    </section>
    <div className="dashboard-two">
      <section className="card panel"><div className="panel-heading"><div><h2>Where your bill money goes</h2><p>Monthly equivalents by category</p></div><Icon name="chart"/></div>
        <div className="donut-section"><div className="donut" style={{background: donut}}><div className="donut-middle"><span>Monthly bills</span><strong>{compactPounds(bills)}</strong></div></div><div className="category-legend">{billTypes.length ? billTypes.map(c => <div className="legend-row" key={c.name}><span className="legend-dot" style={{background:c.colour}}/>{c.name}<strong>{pounds(c.amount)}</strong></div>) : <p>No bills yet.</p>}</div></div>
      </section>
      <section className="card panel"><div className="panel-heading"><div><h2>Coming up next</h2><p>Your upcoming bill payments</p></div><button className="text-link" onClick={() => navigate('bills')}>View all <Icon name="arrow"/></button></div>
        {upcoming.length ? <div className="compact-list">{upcoming.map(b => {const status = dueStatus(b.nextDue); return <div className="compact-row" key={b.id}><span className="bill-emblem" style={{background: categoryColours[b.category] + '20',color:categoryColours[b.category]}}><Icon name="receipt"/></span><div className="grow"><strong>{b.name}</strong><small>{dateText(b.nextDue)}</small></div><div className="right"><strong>{pounds(b.amount)}</strong><small className={status.cls}>{status.text}</small></div></div>;})}</div> : <Empty title="No bills yet" message="Add your first bill to see upcoming payments."><Button onClick={() => add('bill')}>Add bill</Button></Empty>}
      </section>
    </div>
    <div className="dashboard-two bottom-two">
      <section className="card panel"><div className="panel-heading"><div><h2>Your debt-free journey</h2><p>Based on balances you've entered</p></div><Icon name="trend"/></div><div className="big-number">{compactPounds(debtTotal)} <span>remaining</span></div><div className="progress-row"><span>Already paid off</span><strong>{progress}%</strong></div><div className="progress-track"><div style={{width: `${progress}%`}}/></div><div className="split-details"><div><small>Projected finish</small><strong>{projection.valid ? payoffDate(projection.months) : 'Not projected'}</strong></div><div><small>Extra per month</small><strong>{pounds(data.settings.extraPayment)}</strong></div></div><button className="text-link" onClick={() => navigate('planner')}>Explore repayment planner <Icon name="arrow"/></button></section>
      <section className="card panel"><div className="panel-heading"><div><h2>A little more clarity</h2><p>Improve your financial picture</p></div><Icon name="sparkle"/></div><div className="tips-list"><div className="tip-item"><strong>Keep your repayments visible</strong><span>Record payments to see balances fall.</span></div><div className="tip-item"><strong>Payday matters</strong><span>Track all income, even four-weekly pay.</span></div><div className="tip-item"><strong>See what could change</strong><span>Try an extra payment in the planner.</span></div></div></section>
    </div>
    <div className="footer-line">Billora preview · Financial estimates are indicative, not financial advice · Account syncing requires activation</div>
  </>;
}
function Stat({title,value,note,icon,colour=''}: {title:string;value:number;note:string;icon:string;colour?:string}) {
  return <div className={`stat-card ${colour}`}><div className="stat-top"><span>{title}</span><span className="stat-icon"><Icon name={icon}/></span></div><div className="stat-number"><AnimatedMoney value={value}/></div><div className="stat-caption">{note}</div></div>;
}
