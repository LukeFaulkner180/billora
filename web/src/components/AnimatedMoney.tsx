import {useEffect,useState} from 'react';
import {pounds} from '../lib/money';

/** Cosmetic animation only. The correct value is always available to assistive tech. */
export function AnimatedMoney({value}:{value:number}){
  const [shown,setShown]=useState(value);
  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setShown(value);return;}
    let frame=0;
    const initial=performance.now();
    const duration=900;
    const animate=(now:number)=>{
      const progress=Math.min(1,(now-initial)/duration);
      const ease=1-Math.pow(1-progress,3);
      setShown(value*ease);
      if(progress<1)frame=window.requestAnimationFrame(animate);
    };
    frame=window.requestAnimationFrame(animate);
    return ()=>window.cancelAnimationFrame(frame);
  },[value]);
  return <span aria-label={pounds(value)}>{pounds(shown)}</span>;
}
