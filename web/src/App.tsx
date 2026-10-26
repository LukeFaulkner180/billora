import {useEffect, useState} from 'react';
import type {User} from '@supabase/supabase-js';
import type {Bill, Debt, FinanceData, Income, Page} from './types';
import {advanceBill, makeId, pounds, round, today} from './lib/money';
import {emptyData, initialData, saveData} from './lib/storage';
import {Icon} from './components/Icons';
import {Brand} from './components/Brand';
import {Welcome} from './pages/Welcome';
import {FinanceForm, newEntityId, readCategory, readFrequency} from './components/FinanceForm';
import type {Mode} from './components/FinanceForm';
import {Overview} from './pages/Overview';
import {Bills} from './pages/Bills';
import {Debts} from './pages/Debts';
import {Planner} from './pages/Planner';
import {Settings} from './pages/Settings';
import {Budget} from './pages/Budget';
import {AccountDialog} from './auth/AccountDialog';
import {accountsConfigured,supabase} from './auth/client';
import {loadCloudData,saveCloudData} from './auth/cloud';
import {hasPremiumEntitlement,loadPremiumBudgets,savePremiumBudgets} from './auth/premium';
import {PremiumDialog} from './components/PremiumDialog';

const pages: Record<Page,{name:string,short:string,icon:string}> = {
  overview:{name:'Overview',short:'Home',icon:'overview'},budget:{name:'Budget & spending',short:'Budget',icon:'wallet'},bills:{name:'My bills',short:'Bills',icon:'calendar'},debts:{name:'My debts',short:'Debts',icon:'card'},planner:{name:'Debt-free planner',short:'Planner',icon:'trend'},settings:{name:'Settings & income',short:'Settings',icon:'settings'},
};
const pageFromHash = ():Page => window.location.hash.slice(1) in pages ? window.location.hash.slice(1) as Page : 'overview';
// Direct links: /billora/?auth=login and /billora/?auth=signup.
type AccountView = 'login'|'signup';
const accountViewFromUrl = ():AccountView|null => {
  const value = new URLSearchParams(window.location.search).get('auth');
  return value==='login'||value==='signup' ? value : null;
};
export default function App() {
  const [page,setPage]=useState<Page>(pageFromHash);
  const [showDemo,setShowDemo]=useState(()=>new URLSearchParams(window.location.search).get('demo')==='1');
  const [showReleaseInfo,setShowReleaseInfo]=useState(false);
  const [data,setData]=useState<FinanceData>(initialData);
  const [dataOwner,setDataOwner]=useState('local');
  const [mode,setMode]=useState<Mode|null>(null);
  const [toast,setToast]=useState('');
  const [showAccount,setShowAccount]=useState(()=>accountViewFromUrl()!==null);
  const [accountView,setAccountView]=useState<AccountView>(()=>accountViewFromUrl()||'login');
  const [user,setUser]=useState<User|null>(null);
  const [cloudReady,setCloudReady]=useState(false);
  const [cloudError,setCloudError]=useState('');
  const [syncStatus,setSyncStatus]=useState<'idle'|'saving'|'saved'|'error'>('idle');
  const [authLoading,setAuthLoading]=useState(accountsConfigured);
  const [premiumAccess,setPremiumAccess]=useState(false);
  const [showPremium,setShowPremium]=useState(false);
  const userId=user?.id;
  const notify=(message:string)=>setToast(message);

  useEffect(()=>{
    const handler=()=>setPage(pageFromHash());
    window.addEventListener('hashchange',handler);
    return ()=>window.removeEventListener('hashchange',handler);
  },[]);
  useEffect(()=>{if(!toast)return;const t=window.setTimeout(()=>setToast(''),4200);return()=>window.clearTimeout(t);},[toast]);
  useEffect(()=>{
    const syncAccountUrl=()=>{const params=new URLSearchParams(window.location.search);const view=accountViewFromUrl();setShowAccount(Boolean(view));setShowDemo(params.get('demo')==='1');if(view)setAccountView(view);};
    window.addEventListener('popstate',syncAccountUrl);
    return ()=>window.removeEventListener('popstate',syncAccountUrl);
  },[]);
  useEffect(()=>{
    if(!supabase)return;
    let mounted=true;
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
      if(!mounted)return;
      setUser(session?.user??null);setAuthLoading(false);
    });
    void supabase.auth.getSession().then(({data:result,error})=>{
      if(!mounted)return;
      if(error)notify('Sign in session could not be restored.');
      setUser(result.session?.user??null);setAuthLoading(false);
    });
    return ()=>{mounted=false;subscription.unsubscribe();};
  },[]);
  useEffect(()=>{
    let cancelled=false;
    setCloudReady(false);
    setCloudError('');
    setSyncStatus('idle');
    setPremiumAccess(false);
    if(!userId){setData(initialData());setDataOwner('local');return;}
    setData(emptyData());setDataOwner('loading');
    void Promise.all([loadCloudData(userId),hasPremiumEntitlement(userId)])
      .then(async ([result,allowed])=>{
        const premiumBudgets=allowed?await loadPremiumBudgets(userId):{weeklyBudget:0,categoryBudgets:{}};
        if(cancelled)return;
        setPremiumAccess(allowed);
        setData({...result,categoryBudgets:premiumBudgets.categoryBudgets,settings:{...result.settings,weeklyBudget:premiumBudgets.weeklyBudget}});
        setDataOwner(userId);setCloudReady(true);setSyncStatus('saved');
      }).catch(error=>{
        if(cancelled)return;
        setCloudError(error instanceof Error?error.message:'Could not load your finance data.');
        setSyncStatus('error');
      });
    return ()=>{cancelled=true;};
  },[userId]);
  useEffect(()=>{
    if(userId){
      if(!cloudReady || cloudError || data.mode!=='personal' || dataOwner!==userId)return;
      setSyncStatus('saving');
      let cancelled=false;
      const timeout=window.setTimeout(()=>{
        const actions:Promise<void>[]=[saveCloudData(userId,data)];
        if(premiumAccess)actions.push(savePremiumBudgets(userId,{weeklyBudget:data.settings.weeklyBudget,categoryBudgets:data.categoryBudgets}));
        void Promise.all(actions).then(()=>{
          if(!cancelled)setSyncStatus('saved');
        }).catch(error=>{
          if(cancelled)return;
          setSyncStatus('error');
          notify(error instanceof Error ? `Sync failed: ${error.message}` : 'Sync failed. Export a backup and check your connection.');
        });
      },850);
      return ()=>{cancelled=true;window.clearTimeout(timeout);};
    }
    if(!authLoading && dataOwner==='local' && !saveData(data))notify('Unable to save locally. Export a backup.');
  },[data,userId,cloudReady,cloudError,authLoading,dataOwner,premiumAccess]);

  const update=(fn:(prev:FinanceData)=>FinanceData)=>{
    if(userId&&!cloudReady){notify('Account data is still loading.');return;}
    setData(current=>({...fn(current),mode:'personal'}));
  };
  const navigate=(next:Page)=>{window.location.hash=next;setPage(next);window.scrollTo({top:0,behavior:'smooth'});};
  const add=(kind:'bill'|'debt'|'income')=>setMode({kind});
  const edit=(kind:'bill'|'debt'|'income',id:string)=>{
    const item=kind==='bill'?data.bills.find(b=>b.id===id):kind==='debt'?data.debts.find(d=>d.id===id):data.incomes.find(i=>i.id===id);
    if(!item)return;
    if(kind==='bill')setMode({kind,item:item as Bill});
    if(kind==='debt')setMode({kind,item:item as Debt});
    if(kind==='income')setMode({kind,item:item as Income});
  };
  const remove=(kind:'bill'|'debt'|'income',id:string)=>{
    if(!window.confirm(`Delete this ${kind}? This can't be undone.`))return;
    update(current=>({...current,bills:kind==='bill'?current.bills.filter(x=>x.id!==id):current.bills,debts:kind==='debt'?current.debts.filter(x=>x.id!==id):current.debts,incomes:kind==='income'?current.incomes.filter(x=>x.id!==id):current.incomes}));
    notify('Item deleted.');
  };
  const markBillPaid=(id:string)=>{
    const bill=data.bills.find(b=>b.id===id);
    if(!bill||!window.confirm(`Record ${pounds(bill.amount)} paid for ${bill.name} (due ${bill.nextDue})?`))return;
    update(current=>({...current,bills:current.bills.map(b=>b.id===id?{...b,payments:[...b.payments,{amount:b.amount,date:today(),due:b.nextDue}],nextDue:advanceBill(b)}:b)}));
    notify('Bill marked as paid.');
  };
  const submit=(openMode:Mode,raw:Record<string,string>)=>{
    const money=(key:string)=>round(Math.max(0,Number(raw[key])||0));
    const existing=openMode.item;
    if(openMode.kind==='bill'){
      const bill:Bill={id:existing?.id||newEntityId(),name:raw.name.trim().slice(0,100),amount:money('amount'),frequency:readFrequency(raw.frequency),category:readCategory(raw.category),nextDue:raw.nextDue,anchorDay:Number(raw.nextDue.slice(8)),payments:openMode.item?.payments||[]};
      update(prev=>({...prev,bills:existing?prev.bills.map(b=>b.id===bill.id?bill:b):[...prev.bills,bill]}));
    }else if(openMode.kind==='debt'){
      const balance=money('balance');
      const debt:Debt={id:existing?.id||makeId(),name:raw.name.trim().slice(0,100),balance,originalBalance:Math.max(balance,money('originalBalance')||balance),apr:Math.min(100,money('apr')),minPayment:money('minPayment'),promoEnd:raw.promoEnd||'',payments:openMode.item?.payments||[]};
      update(prev=>({...prev,debts:existing?prev.debts.map(d=>d.id===debt.id?debt:d):[...prev.debts,debt]}));
    }else if(openMode.kind==='income'){
      const income:Income={id:existing?.id||makeId(),name:raw.name.trim().slice(0,100),amount:money('amount'),frequency:readFrequency(raw.frequency)};
      update(prev=>({...prev,incomes:existing?prev.incomes.map(i=>i.id===income.id?income:i):[...prev.incomes,income]}));
    }else{
      const requested=money('amount');
      const payment=Math.min(openMode.item.balance,requested);
      if(payment<=0){notify('Enter a payment greater than £0.');return;}
      update(prev=>({...prev,debts:prev.debts.map(d=>d.id===openMode.item.id?{...d,balance:round(Math.max(0,d.balance-payment)),payments:[...d.payments,{amount:payment,date:raw.date||today()}]}:d)}));
    }
    notify(openMode.kind==='payment'?'Repayment recorded.':'Changes saved.');setMode(null);
  };
  const navButton=(id:Page,mobile=false)=><button type="button" key={id} className={`${mobile?'':'nav-item '} ${page===id?'is-active':''}`} onClick={()=>navigate(id)} aria-current={page===id?'page':undefined}><span className={mobile?'':'nav-icon'}><Icon name={pages[id].icon}/></span>{mobile?<small>{pages[id].short}</small>:pages[id].name}</button>;
  const openAccount=(view:AccountView='login')=>{
    setAccountView(view);setShowAccount(true);
    const url=new URL(window.location.href);url.searchParams.set('auth',view);
    window.history.replaceState(null,'',url.toString());
  };
  const closeAccount=()=>{
    setShowAccount(false);
    const url=new URL(window.location.href);url.searchParams.delete('auth');
    window.history.replaceState(null,'',url.toString());
  };
  const openDemo=()=>{
    setShowDemo(true);setShowAccount(false);
    const url=new URL(window.location.href);url.searchParams.set('demo','1');url.searchParams.delete('auth');
    window.history.pushState(null,'',url.toString());window.scrollTo({top:0,behavior:'smooth'});
  };
  const goHome=()=>{
    if(user)return;
    setShowDemo(false);setShowAccount(false);setPage('overview');
    const url=new URL(window.location.href);url.searchParams.delete('demo');url.searchParams.delete('auth');url.hash='';
    window.history.pushState(null,'',url.toString());window.scrollTo({top:0,behavior:'smooth'});
  };
  const signOut=async()=>{if(!supabase)return;const {error}=await supabase.auth.signOut();if(error)notify(error.message);else{closeAccount();notify('Signed out.');}};
  const accountModal = showAccount&&(user?<div className="auth-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)closeAccount();}}><section className="signed-dialog" role="dialog" aria-modal="true" aria-label="Your Billora account"><button className="auth-close" onClick={closeAccount} aria-label="Close"><Icon name="close"/></button><div className="signed-badge"><Icon name="shield"/></div><h2>Your own little money space.</h2><p>Signed in as <strong>{user.email}</strong></p><div className="signed-state">{syncStatus==='saved'?'✓ Your account data is synced':syncStatus==='saving'?'Saving your changes…':syncStatus==='error'?'Your changes could not be saved — please keep this page open.':'Loading your finance data…'}</div><button className="auth-submit" type="button" onClick={()=>void signOut()}>Sign out <span>↗</span></button></section></div>:<AccountDialog key={accountView} initialView={accountView} onClose={closeAccount} notice={notify}/>);
  if(authLoading) return <div className="welcome-loading" role="status"><Brand/><p>Preparing your money space…</p></div>;
  if(!user && !showDemo) return <>
    <Welcome onDemo={openDemo} onSignIn={()=>openAccount('login')} onSignUp={()=>openAccount('signup')} onAccountInfo={()=>setShowReleaseInfo(true)}/>
    {accountModal}
    {showPremium&&<PremiumDialog onClose={()=>setShowPremium(false)} signedIn={Boolean(user)} onAccount={()=>openAccount('signup')}/>}
    {showReleaseInfo&&<div className="auth-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowReleaseInfo(false);}}><section className="welcome-release-dialog" role="dialog" aria-modal="true" aria-labelledby="release-note-heading"><button className="auth-close" onClick={()=>setShowReleaseInfo(false)} aria-label="Close"><Icon name="close"/></button><h2 id="release-note-heading">Your privacy matters.</h2><p>This is an early public preview, not a fully launched financial service. The demo uses fictional examples and browser-only storage. Do not enter real private financial information here.</p><p>Real sign-in, personal cloud storage, privacy terms and account deletion are being prepared. We'll clearly announce when secure accounts are live.</p><button className="welcome-demo-btn" onClick={()=>{setShowReleaseInfo(false);openDemo();}}>Explore the demo</button></section></div>}
    {toast&&<div className="toast is-visible" role="status">{toast}</div>}
  </>;
  return <div className="app-shell">
    <aside className="sidebar" aria-label="Main menu">
      <button className="brand" type="button" onClick={()=>navigate('overview')} aria-label="Billora overview"><Brand/></button>
      <div className="sidebar-caption">A better relationship with money.</div><button type="button" className="site-link" onClick={goHome}><Icon name="arrow"/> View welcome page</button>
      <div className="nav-intro">YOUR WORKSPACE</div>
      <nav className="nav-list">{(['overview','budget','bills','debts','planner'] as Page[]).map(id=>navButton(id))}</nav>
      <div className="nav-intro lower">ACCOUNT</div><nav className="nav-list">{navButton('settings')}</nav>
      <div className="sidebar-bottom">
        {!premiumAccess&&<button className="sidebar-premium-link" type="button" onClick={()=>setShowPremium(true)}><Icon name="sparkle"/> Discover Billora Premium <Icon name="arrow"/></button>}
        <div className="help-card"><span className="help-sparkle">✦</span><strong>Make money feel lighter.</strong><p>Little steps today. More freedom tomorrow.</p><div className="help-progress"><span/></div></div>
        <button className="sidebar-account" type="button" onClick={()=>openAccount()}><span className="sidebar-avatar">{user?.email?.[0]?.toUpperCase()||'B'}</span><span><strong>{user?'My Billora account':'Create an account'}</strong><small>{user?.email||'Keep track of your progress'}</small></span><Icon name="arrow"/></button>
      </div>
    </aside>
    <main className="main"><header className="topbar"><button className="mobile-brand" type="button" onClick={goHome} aria-label="Visit Billora welcome page"><Brand compact/></button><div className="breadcrumb"><span>My money</span><span className="crumb-arrow">/</span><strong>{pages[page].name}</strong></div><div className="topbar-actions"><span className={`demo-pill ${user?'sync-badge':''}`}><span/>{user?syncStatus==='saved'?'Synced securely':syncStatus==='saving'?'Saving…':syncStatus==='error'?'Sync issue':'Loading data…':'Preview mode'}</span>{!user&&<button type="button" className="header-create" onClick={()=>openAccount('signup')}>Sign up</button>}<button type="button" className="account-trigger" aria-label={user?'Manage account':'Sign in to Billora'} onClick={()=>openAccount()}><span className="user-avatar">{user?.email?.[0]?.toUpperCase()||'B'}</span><span className="account-trigger-text">{user?'My account':'Sign in'} <Icon name="arrow"/></span></button></div></header>
      <div className="content" aria-live="polite">
        {userId && (!cloudReady||cloudError)?<div className="cloud-state"><div className="cloud-state-icon"><Icon name="shield"/></div><h2>{cloudError?'Unable to load your finances':'Opening your secure account…'}</h2><p>{cloudError?`Your financial data has not been overwritten. ${cloudError}`:'Checking your securely saved bills and repayments.'}</p>{cloudError&&<button className="btn btn-secondary" onClick={()=>void loadCloudData(userId).then(result=>{setData(result);setDataOwner(userId);setCloudReady(true);setCloudError('');}).catch(error=>setCloudError(error instanceof Error?error.message:'Try again later.'))}>Try again</button>}</div>:<>
          {page==='overview'&&<Overview data={data} add={kind=>add(kind)} navigate={navigate} openSignup={()=>openAccount('signup')} signedIn={Boolean(user)}/>} 
          {page==='budget'&&<Budget data={data} update={update} notify={notify} premium={premiumAccess} onUpgrade={()=>setShowPremium(true)}/>}
          {page==='bills'&&<Bills data={data} add={()=>add('bill')} edit={id=>edit('bill',id)} remove={id=>remove('bill',id)} pay={markBillPaid}/>}
          {page==='debts'&&<Debts data={data} add={()=>add('debt')} edit={id=>edit('debt',id)} remove={id=>remove('debt',id)} pay={id=>{const debt=data.debts.find(d=>d.id===id);if(debt)setMode({kind:'payment',item:debt});}}/>}
          {page==='planner'&&<Planner data={data} onChange={settings=>update(prev=>({...prev,settings}))}/>}
          {page==='settings'&&<Settings data={data} add={()=>add('income')} edit={id=>edit('income',id)} remove={id=>remove('income',id)} replace={value=>setData({...value,mode:'personal'})} cloud={Boolean(userId)} notify={notify}/>}
        </>}
      </div>
    </main>
    <nav className="mobile-nav" aria-label="Mobile menu">{(Object.keys(pages) as Page[]).map(id=>navButton(id,true))}</nav>
    {mode&&<FinanceForm key={`${mode.kind}-${mode.item?.id||'new'}`} mode={mode} close={()=>setMode(null)} save={submit}/>}
    {accountModal}
    {showPremium&&<PremiumDialog onClose={()=>setShowPremium(false)} signedIn={Boolean(user)} onAccount={()=>openAccount('signup')}/>}
    {toast&&<div className="toast is-visible" role="status">{toast}</div>}
  </div>;
}
