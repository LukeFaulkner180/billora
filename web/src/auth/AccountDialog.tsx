import {useEffect, useState, type FormEvent} from 'react';
import {supabase,billoraAuthRedirect} from './client';
import {Icon} from '../components/Icons';
import {Brand} from '../components/Brand';

type AuthView = 'login'|'signup'|'recover';

export function AccountDialog({onClose, notice, initialView='login'}: {onClose:()=>void;notice:(message:string)=>void;initialView?: 'login'|'signup'}) {
  const [view,setView] = useState<AuthView>(initialView);
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [confirmPassword,setConfirmPassword] = useState('');
  const [busy,setBusy] = useState(false);
  const [feedback,setFeedback] = useState('');
  const [reveal,setReveal] = useState(false);
  const choose = (next:AuthView) => {setView(next);setFeedback('');setPassword('');setConfirmPassword('');};
  useEffect(()=>{
    const previous=document.body.style.overflow;document.body.style.overflow='hidden';
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose();};
    document.addEventListener('keydown',escape);
    return ()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',escape);};
  },[onClose]);
  const submit = async (event:FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase){setFeedback('Accounts aren’t activated yet. The demo is available without signing in.');return;}
    if (view !== 'recover' && password.length < 8){setFeedback('Use at least 8 characters for your password.');return;}
    if (view==='signup'&&password!==confirmPassword){setFeedback('Your passwords do not match.');return;}
    setBusy(true);setFeedback('');
    try {
      if(view==='login') {
        const {error} = await supabase.auth.signInWithPassword({email:email.trim(),password});
        if(error) throw error;
        onClose();notice('Welcome back!');
      } else if(view==='signup') {
        const {data,error} = await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:billoraAuthRedirect()}});
        if(error) throw error;
        if(data.session){onClose();notice('Your Billora account is ready.');}
        else setFeedback('Check your inbox for a confirmation link before signing in.');
      } else {
        const {error} = await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:billoraAuthRedirect(true)});
        if(error) throw error;
        setFeedback('If an account exists for that email, you’ll receive a reset link shortly.');
      }
    } catch(error) {setFeedback(error instanceof Error?error.message:'We couldn’t complete that request.');}
    finally {setBusy(false);}
  };
  return <div className="auth-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="account-title">
      <div className="auth-showcase">
        <span className="auth-logo"><Brand/></span>
        <div className="billora-auth-finance-visual"><small>EXAMPLE MONTHLY SUMMARY</small><div><span>Income</span><strong>£2,860</strong></div><div><span>Regular bills</span><strong>£1,245</strong></div><div><span>Debt repayments</span><strong>£375</strong></div></div>
        <div><h2>Keep your finances<br/>in one place.</h2><p>Bills, spending and debts. Organised and easy to review.</p></div>
      </div>
      <div className="auth-body">
        <button type="button" className="auth-close" onClick={onClose} aria-label="Close sign in"><Icon name="close"/></button>
        <span className="auth-eyebrow">YOUR MONEY, MADE SIMPLE</span>
        <h2 id="account-title">{view==='signup'?'Create your account':view==='recover'?'Reset your password':'Welcome to Billora'}</h2>
        <p className="auth-subtitle">{view==='signup'?'Start building a clearer financial future.':view==='recover'?'We’ll send you a secure recovery link.':'Sign in to pick up right where you left off.'}</p>
        <div className="billora-beta-notice" role="note"><Icon name="shield"/><span>Account testing is underway. Until privacy and deletion controls are complete, use sample financial figures only.</span></div>
        <p className="billora-email-intro">Start with email and password. Other sign-in options will be added once configured.</p>
        <form className="auth-form" onSubmit={e=>void submit(e)}>
          <label>Email address<input autoComplete="email" type="email" placeholder="you@example.com" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
          {view!=='recover' && <label>Password<div className="password-wrap"><input minLength={8} autoComplete={view==='signup'?'new-password':'current-password'} type={reveal?'text':'password'} placeholder="At least 8 characters" required value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" className="show-password" onClick={()=>setReveal(v=>!v)} aria-label={reveal?'Hide password':'Show password'}>{reveal?'Hide':'Show'}</button></div></label>}
          {view==='signup'&&<label>Confirm password<input minLength={8} autoComplete="new-password" type={reveal?'text':'password'} placeholder="Confirm your new password" required value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/></label>}
          {view==='login' && <button className="auth-forgot" type="button" onClick={()=>choose('recover')}>Forgot password?</button>}
          <button type="submit" disabled={busy} className="auth-submit">{busy?'Please wait…':view==='signup'?'Create my account':view==='recover'?'Send reset link':'Sign in securely'} <span>→</span></button>
        </form>
        {feedback && <div className="auth-feedback" role="status">{feedback}</div>}
        <div className="auth-switch">{view==='login'?<>New here? <button onClick={()=>choose('signup')}>Create an account</button></>:<>Already have an account? <button onClick={()=>choose('login')}>Sign in instead</button></>}</div>
        <div className="auth-demo"><button type="button" onClick={onClose}>Explore the demo instead <span>↗</span></button><p>Accounts are in beta testing. Do not enter sensitive financial information yet.</p></div>
      </div>
    </section>
  </div>;
}
