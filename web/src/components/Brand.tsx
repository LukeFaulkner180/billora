/** The approved Billora symbol, paired with a high-contrast wordmark for dark UI. */
export function Brand({compact=false, className=''}:{compact?:boolean;className?:string}) {
  return <span className={`billora-brand ${compact?'billora-brand--compact':''} ${className}`}>
    <img src={`${import.meta.env.BASE_URL}billora-symbol.svg`} width={compact?32:42} height={compact?32:42} alt="" decoding="async" />
    <span className="billora-wordmark">Billora<span className="billora-wordmark-dot">.</span></span>
  </span>;
}
