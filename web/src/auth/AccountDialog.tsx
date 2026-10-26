import {useState, type FormEvent} from 'react';
import {supabase, accountsConfigured} from './client';
import {Icon} from '../components/Icons';

type AuthView = 'login'|'signup'|'recover';

function GoogleMark() {
  return <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.2C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.27 5.48-4.78 7.18l7.73 6C44.4 38.02 46.98 31.88 46.98 24.55Z"/><path fill="#FBBC05" d="M10.53 28.58A14.44 14.44 0 0 1 9.75 24c0-1.58.27-3.12.77-4.58l-7.98-6.2A23.84 23.84 0 0 0 0 24c0 3.87.93 7.5 2.56 10.78l7.97-6.2Z"/><path fill="#34A853" d="M24 48c6.47 0 11.9-2.13 15.89-5.8l-7.73-6c-2.15 1.44-4.9 2.3-8.16 2.3-6.26 0-11.57-4.23-13.47-9.92l-7.97 6.2C6.51 42.62 14.62 48 24 48Z"/></svg>;
}
function MicrosoftMark() {
  return <svg width="19" height="19" viewBox="0 0 21 21" aria-hidden="true"><path fill="#f35325" d="M0 0h10v10H0z"/><path fill="#81bc06" d="M11 0h10v10H11z"/><path fill="#05a6f0" d="M0 11h10v10H0z"/><path fill="#ffba08" d="M11 11h10v10H11z"/></svg>;
}
export function AccountDialog({onClose, notice}: {onClose:()=>void;notice:(message:string)=>void}) {
  const [view,setView] = useState<AuthView>('login');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [busy,setBusy] = useState(false);
  const [feedback,setFeedback] = useState('');
  const [reveal,setReveal] = useState(false);
  const choose = (next:AuthView) => {setView(next);setFeedback('');setPassword('');};
  const social = async (provider:'google'|'azure') => {
    if (!supabase) {setFeedback('Account setup is being connected. For now, continue exploring the demo.');return;}
    setBusy(true);setFeedback('');
    const {error} = await supabase.auth.signInWithOAuth({provider,options:{redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`, ...(provider==='azure'?{scopes:'email'}:{})}});
    if (error) {setFeedback(error.message);setBusy(false);}
  };
  const submit = async (event:FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase){setFeedback('Accounts aren’t activated yet. The demo is available without signing in.');return;}
    if (view !== 'recover' && password.length < 8){setFeedback('Use at least 8 characters for your password.');return;}
    setBusy(true);setFeedback('');
    try {
      if(view==='login') {
        const {error} = await supabase.auth.signInWithPassword({email:email.trim(),password});
        if(error) throw error;
        onClose();notice('Welcome back!');
      } else if(view==='signup') {
        const {data,error} = await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:`${window.location.origin}${import.meta.env.BASE_URL}`}});
        if(error) throw error;
        if(data.session){onClose();notice('Your Billora account is ready.');}
        else setFeedback('Check your inbox for a confirmation link before signing in.');
      } else {
        const {error} = await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:`${window.location.origin}${import.meta.env.BASE_URL}`});
        if(error) throw error;
        setFeedback('If an account exists for that email, you’ll receive a reset link shortly.');
      }
    } catch(error) {setFeedback(error instanceof Error?error.message:'We couldn’t complete that request.');}
    finally {setBusy(false);}
  };
  return <div className="auth-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="account-title">
      <div className="auth-showcase">
        <span className="auth-logo"><span className="auth-logo-mark">✦</span> billora<span className="brand-dot">.</span></span>
        <div className="auth-illustration"><div className="auth-glow"/><span className="floating-chip first-chip">↗ &nbsp; One clear picture</span><div className="auth-illustration-card"><small>YOUR FINANCIAL FUTURE</small><strong>Money feels better<br/>when it makes sense.</strong><div className="auth-bars"><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div><span className="floating-chip last-chip">✳ &nbsp; Your pace. Your plan.</span></div>
        <div><h2>Make space for<br/>what matters.</h2><p>All your bills, debts and goals together. Less uncertainty, more forward motion.</p></div>
      </div>
      <div className="auth-body">
        <button type="button" className="auth-close" onClick={onClose} aria-label="Close sign in"><Icon name="close"/></button>
        <span className="auth-eyebrow">YOUR MONEY, MADE SIMPLE</span>
        <h2 id="account-title">{view==='signup'?'Create your account':view==='recover'?'Reset your password':'Welcome to Billora'}</h2>
        <p className="auth-subtitle">{view==='signup'?'Start building a clearer financial future.':view==='recover'?'We’ll send you a secure recovery link.':'Sign in to pick up right where you left off.'}</p>
        {!accountsConfigured && <div className="auth-notice" role="note"><Icon name="info"/><div><strong>Account access is being set up</strong><span>Real sign-ins need a separate secure Billora database and Google/Microsoft provider configuration. You can explore the demo now.</span></div></div>}
        {view !== 'recover' && <><div className="social-stack">
          <button disabled={busy} className="social-login" type="button" onClick={()=>void social('google')}><GoogleMark/><span>Continue with Google</span><span className="social-arrow">↗</span></button>
          <button disabled={busy} className="social-login" type="button" onClick={()=>void social('azure')}><MicrosoftMark/><span>Continue with Microsoft</span><span className="social-arrow">↗</span></button>
        </div><div className="auth-divider"><span>or use your email</span></div></>}
        <form className="auth-form" onSubmit={e=>void submit(e)}>
          <label>Email address<input autoComplete="email" type="email" placeholder="you@example.com" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
          {view!=='recover' && <label>Password<div className="password-wrap"><input minLength={8} autoComplete={view==='signup'?'new-password':'current-password'} type={reveal?'text':'password'} placeholder="At least 8 characters" required value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" className="show-password" onClick={()=>setReveal(v=>!v)} aria-label={reveal?'Hide password':'Show password'}>{reveal?'Hide':'Show'}</button></div></label>}
          {view==='login' && <button className="auth-forgot" type="button" onClick={()=>choose('recover')}>Forgot password?</button>}
          <button type="submit" disabled={busy} className="auth-submit">{busy?'Please wait…':view==='signup'?'Create my account':view==='recover'?'Send reset link':'Sign in securely'} <span>→</span></button>
        </form>
        {feedback && <div className="auth-feedback" role="status">{feedback}</div>}
        <div className="auth-switch">{view==='login'?<>New here? <button onClick={()=>choose('signup')}>Create an account</button></>:<>Already have an account? <button onClick={()=>choose('login')}>Sign in instead</button></>}</div>
        <div className="auth-demo"><button type="button" onClick={onClose}>Explore the demo instead <span>↗</span></button><p>Preview only. Don't enter sensitive financial information yet.</p></div>
      </div>
    </section>
  </div>;
}
