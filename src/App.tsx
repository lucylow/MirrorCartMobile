import { useState, useEffect } from "react";

// ════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════
type Screen =
  | "welcome" | "quiz" | "profile"
  | "home" | "dashboard" | "dark-home" | "offline"
  | "camera" | "ar-permission" | "ar-calibrate" | "ar-pose" | "ar-loading"
  | "ar-mirror" | "fit-check" | "complete-look" | "outfit-score"
  | "ar-tracking-lost" | "ar-poor-light" | "ar-unsupported"
  | "discover" | "product" | "retailers" | "reasoning"
  | "lookbuilder" | "compare"
  | "social"
  | "cart" | "checkout" | "confirmation" | "tracking"
  | "wardrobe" | "saved" | "chat" | "notifications" | "settings";

// ════════════════════════════════════════════════════════════
// TOKENS
// ════════════════════════════════════════════════════════════
const T = {
  ivory: "#FAF8F4", ivoryDark: "#F2EFE8", ivoryMid: "#EAE7DF",
  charcoal: "#1C1C1E", charcoalMid: "#3A3A3C",
  muted: "#6B6B70", gold: "#C9A84C", goldLight: "#E8D49A", goldPale: "#F7F1E0",
  sage: "#7A9E87", rose: "#D4756A", sky: "#6BA3C9", lavender: "#9B87B8",
  border: "rgba(201,168,76,0.14)", borderLight: "rgba(255,255,255,0.12)",
  shadow: "0 4px 20px rgba(28,28,30,0.07)", shadowMd: "0 8px 32px rgba(28,28,30,0.12)",
  shadowLg: "0 24px 64px rgba(28,28,30,0.18)",
  darkBg: "#0E0E10", darkCard: "#1C1C1E", darkCard2: "#2C2C2E", darkCard3: "#3A3A3C",
};
const goldGrad = "linear-gradient(135deg, #C9A84C, #A07C2E)";
const darkGrad = "linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)";

// ════════════════════════════════════════════════════════════
// ICONS
// ════════════════════════════════════════════════════════════
const I = {
  home: (a?: boolean) => <svg width="22" height="22" viewBox="0 0 24 24" fill={a?"#C9A84C":"none"} stroke={a?"#C9A84C":"#6B6B70"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
  search: (a?: boolean) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?"#C9A84C":"#6B6B70"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>,
  camera: (a?: boolean) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?"#C9A84C":"#6B6B70"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  heart: (a?: boolean) => <svg width="22" height="22" viewBox="0 0 24 24" fill={a?"#C9A84C":"none"} stroke={a?"#C9A84C":"#6B6B70"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  bag: (a?: boolean) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?"#C9A84C":"#6B6B70"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  sparkle: (c="#C9A84C", s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>,
  arR: (c="currentColor") => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  arL: (c="currentColor") => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  check: (c=T.sage) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  x: (c="currentColor") => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  bell: (a?: boolean) => <svg width="20" height="20" viewBox="0 0 24 24" fill={a?"#C9A84C":"none"} stroke={a?"#C9A84C":"#6B6B70"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>,
  share: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  download: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  star: (f?: boolean) => <svg width="14" height="14" viewBox="0 0 24 24" fill={f?"#C9A84C":"none"} stroke="#C9A84C" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  rotate: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  layers: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  sliders: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>,
  zap: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  wifi: (off?: boolean) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={off?"#D4756A":"currentColor"} strokeWidth="2" strokeLinecap="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>{off ? <line x1="2" y1="2" x2="22" y2="22"/> : <circle cx="12" cy="20" r="1" fill="currentColor"/>}</svg>,
  lock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
};

// ════════════════════════════════════════════════════════════
// PRIMITIVES
// ════════════════════════════════════════════════════════════
const Notch = () => <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50" style={{width:120,height:34,background:"#000",borderRadius:"0 0 20px 20px"}} />;

const StatusBar = ({dark, time="9:41"}:{dark?:boolean; time?:string}) => (
  <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-8" style={{height:44,paddingTop:10}}>
    <span className="text-xs font-semibold" style={{color:dark?"rgba(250,248,244,0.9)":T.charcoal}}>{time}</span>
    <div className="flex items-center gap-1.5">
      <div style={{width:14,height:10,background:dark?"rgba(250,248,244,0.8)":T.charcoal,borderRadius:2}}/>
      <div style={{width:12,height:10,background:dark?"rgba(250,248,244,0.5)":T.muted,borderRadius:1}}/>
    </div>
  </div>
);

const BackBtn = ({onPress, dark}:{onPress:()=>void; dark?:boolean}) => (
  <button onClick={onPress} className="haptic w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
    style={{background:dark?"rgba(255,255,255,0.12)":"#fff",border:dark?"1px solid rgba(255,255,255,0.12)":`1px solid ${T.border}`,boxShadow:dark?"none":T.shadow}}>
    {I.arL(dark?"#fff":T.charcoal)}
  </button>
);

function Btn({label,variant="primary",onPress,size="md",disabled,icon}:{label:string;variant?:"primary"|"secondary"|"ghost"|"danger"|"dark";onPress?:()=>void;size?:"sm"|"md"|"lg";disabled?:boolean;icon?:React.ReactNode}) {
  const pad = size==="sm"?"px-4 py-2":size==="lg"?"py-4 px-6":"py-3.5 px-5";
  const fs = size==="sm"?"text-xs":"text-sm";
  const styles:Record<string,React.CSSProperties> = {
    primary:{background:disabled?"rgba(201,168,76,0.28)":goldGrad,color:T.ivory,boxShadow:disabled?"none":"0 6px 20px rgba(201,168,76,0.32)"},
    secondary:{background:"#fff",color:T.charcoal,border:`1px solid ${T.border}`,boxShadow:T.shadow},
    ghost:{background:"transparent",color:T.muted},
    danger:{background:"rgba(212,117,106,0.1)",color:T.rose,border:"1px solid rgba(212,117,106,0.25)"},
    dark:{background:T.darkCard2,color:T.ivory,border:"1px solid rgba(255,255,255,0.08)"},
  };
  return (
    <button onClick={onPress} disabled={disabled} className={`haptic rounded-2xl font-semibold tracking-wide transition-all ${pad} ${fs} w-full flex items-center justify-center gap-2`} style={styles[variant]}>
      {icon}{label}
    </button>
  );
}

function Chip({label,active,onPress,dark}:{label:string;active?:boolean;onPress?:()=>void;dark?:boolean}) {
  return (
    <button onClick={onPress} className="haptic whitespace-nowrap text-xs px-4 py-2 rounded-full flex-shrink-0 font-medium transition-all"
      style={{background:active?(dark?T.gold:T.charcoal):(dark?"rgba(255,255,255,0.1)":T.ivory),color:active?T.ivory:(dark?"rgba(250,248,244,0.7)":T.muted),border:active?"none":(dark?"1px solid rgba(255,255,255,0.1)":`1px solid rgba(107,107,112,0.18)`)}}>
      {label}
    </button>
  );
}

const SkeletonCard = ({w="100%",h=180}:{w?:number|string;h?:number}) => <div className="skeleton rounded-2xl flex-shrink-0" style={{width:w,height:h}} />;

function Toast({msg,type="success",visible}:{msg:string;type?:"success"|"error"|"info";visible:boolean}) {
  if(!visible) return null;
  const bg = type==="success"?T.charcoal:type==="error"?T.rose:T.charcoalMid;
  return (
    <div className="toast-in absolute top-16 left-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl" style={{background:bg,boxShadow:T.shadowMd}}>
      <span style={{color:T.gold,fontWeight:700,fontSize:14}}>{type==="success"?"✦":"!"}</span>
      <p className="text-sm font-medium" style={{color:T.ivory}}>{msg}</p>
    </div>
  );
}

function SegControl({options,active,onChange,dark}:{options:string[];active:string;onChange:(v:string)=>void;dark?:boolean}) {
  return (
    <div className="flex rounded-2xl p-1" style={{background:dark?"rgba(255,255,255,0.08)":T.ivoryDark}}>
      {options.map(o=>(
        <button key={o} onClick={()=>onChange(o)} className="haptic flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{background:active===o?(dark?T.darkCard3:"#fff"):"transparent",color:active===o?(dark?T.ivory:T.charcoal):(dark?"rgba(250,248,244,0.4)":T.muted),boxShadow:active===o&&!dark?T.shadow:"none"}}>
          {o}
        </button>
      ))}
    </div>
  );
}

function BottomSheet({open,onClose,title,children,height=480,dark}:{open:boolean;onClose:()=>void;title?:string;children:React.ReactNode;height?:number;dark?:boolean}) {
  if(!open) return null;
  return (
    <>
      <div className="sheet-overlay" onClick={onClose}/>
      <div className="slide-up absolute bottom-0 left-0 right-0 rounded-t-3xl" style={{background:dark?T.darkCard:T.ivory,height,boxShadow:"0 -8px 40px rgba(28,28,30,0.18)",zIndex:90}}>
        <div className="flex flex-col items-center pt-3 pb-2">
          <div className="rounded-full" style={{width:36,height:4,background:dark?"rgba(255,255,255,0.15)":T.ivoryDark}}/>
        </div>
        {title && <p className="font-serif text-lg px-6 pb-3" style={{color:dark?T.ivory:T.charcoal}}>{title}</p>}
        <div className="overflow-y-auto scroll-hide" style={{maxHeight:height-60}}>{children}</div>
      </div>
    </>
  );
}

function ProgressBar({value,max=100,color=T.gold,dark}:{value:number;max?:number;color?:string;dark?:boolean}) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{height:4,background:dark?"rgba(255,255,255,0.1)":T.ivoryDark}}>
      <div className="rounded-full transition-all duration-700" style={{width:`${Math.min((value/max)*100,100)}%`,height:4,background:color}}/>
    </div>
  );
}

function Avatar({src,size=40,border}:{src:string;size?:number;border?:boolean}) {
  return <img src={src} alt="av" className="rounded-full object-cover flex-shrink-0" style={{width:size,height:size,border:border?`2px solid ${T.gold}`:"none"}}/>;
}

function BottomNav({current,onNav,dark}:{current:Screen;onNav:(s:Screen)=>void;dark?:boolean}) {
  const tabs:[Screen,string,(a:boolean)=>React.ReactNode][] = [
    ["home","Home",a=>I.home(a)],["discover","Search",a=>I.search(a)],["camera","Try-On",a=>I.camera(a)],["saved","Saved",a=>I.heart(a)],["cart","Cart",a=>I.bag(a)],
  ];
  return (
    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around px-2 pb-6 pt-3 z-30"
      style={{background:dark?"rgba(14,14,16,0.95)":"rgba(250,248,244,0.96)",backdropFilter:"blur(16px)",borderTop:`1px solid ${dark?"rgba(255,255,255,0.07)":T.border}`}}>
      {tabs.map(([id,label,icon])=>(
        <button key={id} onClick={()=>onNav(id)} className="haptic flex flex-col items-center gap-1" style={{minWidth:56}}>
          {icon(current===id)}
          <span className="text-xs" style={{color:current===id?T.gold:(dark?"rgba(250,248,244,0.4)":T.muted),fontWeight:current===id?600:400}}>{label}</span>
        </button>
      ))}
    </div>
  );
}

const GlassPanel = ({children,style,dark=true}:{children:React.ReactNode;style?:React.CSSProperties;dark?:boolean}) => (
  <div style={{background:dark?"rgba(0,0,0,0.38)":"rgba(250,248,244,0.82)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:dark?"1px solid rgba(255,255,255,0.1)":`1px solid ${T.border}`,...style}}>
    {children}
  </div>
);

function ScoreRing({score,size=90,dark}:{score:number;size?:number;dark?:boolean}) {
  const r = 38; const c = 2*Math.PI*r; const offset = c - (score/100)*c;
  return (
    <div className="relative flex items-center justify-center" style={{width:size,height:size}}>
      <svg width={size} height={size} viewBox="0 0 88 88" style={{transform:"rotate(-90deg)"}}>
        <circle cx="44" cy="44" r={r} fill="none" stroke={dark?"rgba(255,255,255,0.08)":"rgba(201,168,76,0.15)"} strokeWidth="6"/>
        <circle cx="44" cy="44" r={r} fill="none" stroke={T.gold} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset} style={{transition:"stroke-dashoffset 1s cubic-bezier(.16,1,.3,1)"}}/>
      </svg>
      <div className="absolute flex flex-col items-center">
        <p className="font-serif" style={{fontSize:size>80?22:16,color:dark?T.ivory:T.charcoal,lineHeight:1}}>{score}</p>
        <p style={{fontSize:9,color:T.gold,fontWeight:700,letterSpacing:"0.06em"}}>SCORE</p>
      </div>
    </div>
  );
}

const WeatherWidget = ({dark}:{dark?:boolean}) => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{background:dark?"rgba(255,255,255,0.07)":T.goldPale,border:`1px solid ${dark?"rgba(255,255,255,0.08)":"rgba(201,168,76,0.2)"}`}}>
    <span style={{fontSize:18}}>⛅</span>
    <div>
      <p className="text-xs font-semibold" style={{color:dark?T.ivory:T.charcoal}}>24°C · Paris</p>
      <p style={{fontSize:10,color:dark?"rgba(250,248,244,0.5)":T.muted}}>Partly cloudy · Outdoor OK</p>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════
// SCREENS
// ════════════════════════════════════════════════════════════

function WelcomeScreen({onNext}:{onNext:()=>void}) {
  return (
    <div className="relative w-full h-full flex flex-col" style={{background:T.ivory}}>
      <Notch/><StatusBar/>
      <div className="relative" style={{height:520}}>
        <img src="https://images.unsplash.com/photo-1731589802397-6a1088d63630?w=390&h=520&fit=crop&auto=format" alt="Hero" className="w-full h-full object-cover"/>
        <div className="absolute inset-0" style={{background:"linear-gradient(to bottom,rgba(0,0,0,0.05),rgba(250,248,244,0) 40%,#FAF8F4 100%)"}}/>
        <div className="absolute top-12 left-0 right-0 flex justify-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{background:"rgba(0,0,0,0.36)",backdropFilter:"blur(10px)"}}>
            <span style={{color:T.gold,fontSize:18}}>✦</span>
            <span className="font-serif text-lg" style={{color:T.ivory}}>MirrorCart</span>
          </div>
        </div>
        <div className="absolute bottom-6 right-5 px-3 py-1.5 rounded-full" style={{background:"rgba(201,168,76,0.9)"}}>
          <span style={{fontSize:10,color:T.ivory,fontWeight:700,letterSpacing:"0.1em"}}>AR POWERED</span>
        </div>
      </div>
      <div className="flex-1 px-7 pt-3">
        <h1 className="font-serif" style={{fontSize:36,color:T.charcoal,lineHeight:1.15}}>Your personal<br/><span className="italic" style={{color:T.gold}}>AI stylist</span></h1>
        <p className="mt-2 text-sm leading-relaxed" style={{color:T.muted}}>Try on thousands of looks instantly. Shop smarter with your AI wardrobe agent.</p>
        <div className="flex flex-col gap-3 mt-6">
          <Btn label="Get Started — It's Free" onPress={onNext} size="lg"/>
          <Btn label="Sign In" variant="secondary"/>
        </div>
      </div>
    </div>
  );
}

const quizSteps = [
  {q:"What describes your style?",opts:["Minimal & clean","Bold & expressive","Relaxed & casual","Polished & classic"]},
  {q:"Which occasions matter most?",opts:["Work & meetings","Social & evenings","Weekend & travel","Events & occasions"]},
  {q:"Budget per item?",opts:["Under $50","$50–$150","$150–$400","$400+"]},
  {q:"Favourite colour palette?",opts:["Neutrals & earth","Monochrome","Rich & jewel-toned","Pastels & soft"]},
];

function QuizScreen({onNext}:{onNext:()=>void}) {
  const [step,setStep]=useState(0);
  const [picks,setPicks]=useState<string[]>([]);
  const pick=(opt:string)=>{const n=[...picks];n[step]=opt;setPicks(n);if(step<quizSteps.length-1){setTimeout(()=>setStep(step+1),260);}else{setTimeout(onNext,400);}};
  return (
    <div className="flex flex-col h-full" style={{background:T.ivory}}><Notch/><StatusBar/>
      <div className="flex-1 flex flex-col px-7 pt-14">
        <div className="flex items-center gap-3 mt-4 mb-8"><ProgressBar value={step} max={quizSteps.length}/><span className="text-xs flex-shrink-0" style={{color:T.muted}}>{step+1}/{quizSteps.length}</span></div>
        <div className="fade-up" key={step}>
          <p className="text-xs font-bold mb-2" style={{color:T.gold,letterSpacing:"0.1em"}}>STYLE QUIZ</p>
          <h2 className="font-serif text-2xl mb-7" style={{color:T.charcoal,lineHeight:1.25}}>{quizSteps[step].q}</h2>
          <div className="flex flex-col gap-3">
            {quizSteps[step].opts.map(opt=>(
              <button key={opt} onClick={()=>pick(opt)} className="haptic w-full text-left px-5 py-4 rounded-2xl transition-all"
                style={{background:picks[step]===opt?T.charcoal:"#fff",color:picks[step]===opt?T.goldLight:T.charcoal,border:`1px solid ${picks[step]===opt?"transparent":T.border}`,boxShadow:picks[step]===opt?T.shadowMd:T.shadow,fontWeight:500,fontSize:14}}>
                {picks[step]===opt&&<span style={{color:T.gold,marginRight:8}}>✦</span>}{opt}
              </button>
            ))}
          </div>
        </div>
        {step>0&&<button className="mt-6 self-start text-sm" style={{color:T.muted}} onClick={()=>setStep(step-1)}>← Back</button>}
      </div>
    </div>
  );
}

function ProfileScreen({onNext}:{onNext:()=>void}) {
  const [bodyType,setBodyType]=useState("Hourglass");
  const [skinTone,setSkinTone]=useState(2);
  const [toast,setToast]=useState(false);
  const save=()=>{setToast(true);setTimeout(()=>{setToast(false);onNext();},1500);};
  const tones=["#FDEBD0","#F4C6A0","#E0A87C","#C68642","#8B5E3C","#3B2210"];
  return (
    <div className="flex flex-col h-full" style={{background:T.ivory}}><Notch/><StatusBar/><Toast msg="Profile saved ✦" visible={toast}/>
      <div className="flex-1 overflow-y-auto scroll-hide pt-14 pb-6">
        <div className="px-7 pt-4">
          <p className="text-xs font-bold mb-1" style={{color:T.gold,letterSpacing:"0.1em"}}>STEP 2 OF 2</p>
          <h2 className="font-serif text-2xl mt-1 mb-6" style={{color:T.charcoal}}>Your fit profile</h2>
          <div className="flex justify-center mb-7">
            <div className="relative">
              <div className="rounded-full overflow-hidden" style={{width:96,height:96,border:`3px solid ${T.gold}`}}>
                <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=96&h=96&fit=crop&auto=format" alt="" className="w-full h-full object-cover"/>
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center" style={{background:goldGrad}}><span style={{color:T.ivory}}>+</span></button>
            </div>
          </div>
          {[{label:"HEIGHT",opts:["5'2\"","5'4\"","5'6\"","5'7\"","5'9\"","5'11\""]},{label:"SIZE",opts:["XS","S","M","L","XL","XXL"]}].map(f=>(
            <div key={f.label} className="mb-4">
              <p className="text-xs font-bold mb-2" style={{color:T.muted,letterSpacing:"0.06em"}}>{f.label}</p>
              <div className="flex gap-2 overflow-x-auto scroll-hide pb-1">
                {f.opts.map((o,i)=>(
                  <button key={o} className="haptic flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium"
                    style={{background:i===3?T.charcoal:"#fff",color:i===3?T.goldLight:T.charcoal,border:`1px solid ${T.border}`}}>{o}</button>
                ))}
              </div>
            </div>
          ))}
          <div className="mb-4">
            <p className="text-xs font-bold mb-2" style={{color:T.muted,letterSpacing:"0.06em"}}>BODY TYPE</p>
            <div className="flex gap-2 flex-wrap">
              {["Petite","Slim","Athletic","Hourglass","Curvy","Plus"].map(b=>(
                <button key={b} onClick={()=>setBodyType(b)} className="haptic px-4 py-2 rounded-xl text-sm font-medium"
                  style={{background:bodyType===b?T.charcoal:"#fff",color:bodyType===b?T.goldLight:T.charcoal,border:`1px solid ${T.border}`}}>{b}</button>
              ))}
            </div>
          </div>
          <div className="mb-7">
            <p className="text-xs font-bold mb-3" style={{color:T.muted,letterSpacing:"0.06em"}}>SKIN TONE</p>
            <div className="flex gap-3">{tones.map((t,i)=>(<button key={i} onClick={()=>setSkinTone(i)} className="haptic rounded-full" style={{width:40,height:40,background:t,border:skinTone===i?`3px solid ${T.gold}`:"3px solid transparent",boxShadow:skinTone===i?`0 0 0 2px ${T.gold}`:"none"}}/>))}</div>
          </div>
          <Btn label="Save & Start Styling →" onPress={save} size="lg"/>
        </div>
      </div>
    </div>
  );
}

function HomeScreen({onNav}:{onNav:(s:Screen)=>void}) {
  const [loading,setLoading]=useState(true);
  useEffect(()=>{const t=setTimeout(()=>setLoading(false),1100);return()=>clearTimeout(t);},[]);
  const outfits=[{label:"Day Off",img:"https://images.unsplash.com/photo-1659522761084-79196b64abe4?w=180&h=240&fit=crop&auto=format",match:96},{label:"Power Lunch",img:"https://images.unsplash.com/photo-1612731486606-2614b4d74921?w=180&h=240&fit=crop&auto=format",match:91},{label:"Gallery Night",img:"https://images.unsplash.com/photo-1629511565591-a1d494ad6c58?w=180&h=240&fit=crop&auto=format",match:88}];
  return (
    <div className="flex flex-col h-full" style={{background:T.ivory}}><Notch/><StatusBar/>
      <div className="flex-1 overflow-y-auto scroll-hide pt-14 pb-28">
        <div className="px-6 pt-4 flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold" style={{color:T.gold,letterSpacing:"0.1em"}}>GOOD MORNING</p>
            <h2 className="font-serif text-2xl" style={{color:T.charcoal}}>Let's style, Zara</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>onNav("notifications")} className="haptic relative w-10 h-10 rounded-full flex items-center justify-center" style={{background:"#fff",border:`1px solid ${T.border}`}}>
              {I.bell()}<div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{background:T.gold}}/>
            </button>
            <button onClick={()=>onNav("settings")}><Avatar src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=48&h=48&fit=crop&auto=format" size={40} border/></button>
          </div>
        </div>
        <button onClick={()=>onNav("dashboard")} className="haptic mx-6 mb-4 px-4 py-3 rounded-2xl flex items-center justify-between" style={{background:darkGrad,boxShadow:T.shadowMd}}>
          <div className="flex items-center gap-3">
            {I.sparkle(T.gold,14)}
            <div>
              <p className="text-xs font-bold" style={{color:T.gold,letterSpacing:"0.08em"}}>AI STYLE DASHBOARD</p>
              <p className="text-xs" style={{color:"rgba(250,248,244,0.6)"}}>Weather · Budget · Wardrobe insight</p>
            </div>
          </div>
          {I.arR("#C9A84C")}
        </button>
        <div className="mx-6 mb-4 flex items-center gap-3 px-4 py-3 rounded-2xl" style={{background:"#fff",border:`1px solid ${T.border}`,boxShadow:T.shadow}}>
          {I.sparkle()}<input placeholder="Ask your AI stylist anything…" className="flex-1 text-sm bg-transparent outline-none" style={{color:T.charcoal}} onFocus={()=>onNav("chat")}/>
        </div>
        <div className="flex gap-2 px-6 mb-5 overflow-x-auto scroll-hide">
          {["Summer wedding","Job interview","Date night","Weekend casual"].map(p=><Chip key={p} label={p} onPress={()=>onNav("chat")}/>)}
        </div>
        <div className="mx-6 mb-5 rounded-3xl overflow-hidden" style={{background:darkGrad,boxShadow:T.shadowMd}}>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">{I.sparkle(T.gold,12)}<span className="text-xs font-bold" style={{color:T.gold,letterSpacing:"0.1em"}}>AI STYLIST PICK</span></div>
            <p className="text-sm leading-relaxed" style={{color:"rgba(250,248,244,0.88)"}}>Based on your wardrobe & today's 24°C, I've curated a <strong style={{color:T.goldLight}}>linen blazer moment</strong>.</p>
            <div className="flex gap-4 mt-4">
              <button onClick={()=>onNav("ar-mirror")} className="haptic flex items-center gap-1.5 text-sm font-bold" style={{color:T.gold}}>Try it on {I.arR(T.gold)}</button>
              <button onClick={()=>onNav("chat")} className="text-sm" style={{color:"rgba(250,248,244,0.4)"}}>Ask AI →</button>
            </div>
          </div>
        </div>
        <div className="px-6 mb-5">
          <div className="flex justify-between items-center mb-3"><h3 className="font-serif text-lg" style={{color:T.charcoal}}>Curated for You</h3><button className="text-xs font-bold" style={{color:T.gold}} onClick={()=>onNav("discover")}>See all</button></div>
          <div className="flex gap-3 overflow-x-auto scroll-hide pb-1">
            {loading?[1,2,3].map(i=><SkeletonCard key={i} w={148} h={200}/>):outfits.map(o=>(
              <button key={o.label} onClick={()=>onNav("ar-mirror")} className="haptic flex-shrink-0 rounded-2xl overflow-hidden relative" style={{width:148,height:200,boxShadow:T.shadowMd}}>
                <img src={o.img} alt={o.label} className="w-full h-full object-cover"/>
                <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(28,28,30,0.72),transparent 55%)"}}/>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-xs font-semibold" style={{color:T.ivory}}>{o.label}</p>
                  <div className="flex items-center gap-1 mt-0.5">{I.sparkle(T.gold,11)}<span className="text-xs" style={{color:T.goldLight}}>{o.match}% match</span></div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="mx-6 grid grid-cols-3 gap-3">
          {[{v:"47",l:"Saved"},{v:"94",l:"Style Score"},{v:"3",l:"Orders"}].map(s=>(
            <div key={s.l} className="rounded-2xl p-3 text-center" style={{background:"#fff",border:`1px solid ${T.border}`,boxShadow:T.shadow}}>
              <p className="font-serif text-2xl gold-text">{s.v}</p>
              <p className="text-xs" style={{color:T.muted}}>{s.l}</p>
            </div>
          ))}
        </div>
        <div className="px-6 mt-4 flex gap-3">
          <button onClick={()=>onNav("dark-home")} className="haptic flex-1 py-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2" style={{background:T.charcoal,color:T.ivory}}>🌙 Dark Mode</button>
          <button onClick={()=>onNav("offline")} className="haptic flex-1 py-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2" style={{background:T.ivoryDark,color:T.muted,border:`1px solid ${T.border}`}}>📶 Offline</button>
        </div>
      </div>
      <BottomNav current="home" onNav={onNav}/>
    </div>
  );
}

function DashboardScreen({onNav}:{onNav:(s:Screen)=>void}) {
  const [occ,setOcc]=useState("All");
  const occasions=["All","Work","Evening","Weekend","Formal","Casual"];
  const budget=350; const spent=188;
  return (
    <div className="flex flex-col h-full" style={{background:T.charcoal}}>
      <Notch/><StatusBar dark/>
      <div className="flex-1 overflow-y-auto scroll-hide pt-14 pb-28">
        <div className="px-6 pt-4 flex items-center justify-between mb-5">
          <div><p className="text-xs font-bold" style={{color:T.gold,letterSpacing:"0.1em"}}>AI STYLE DASHBOARD</p><h2 className="font-serif text-2xl" style={{color:T.ivory}}>Your Style Intel</h2></div>
          <BackBtn onPress={()=>onNav("home")} dark/>
        </div>
        <div className="px-6 mb-4 flex gap-3">
          <WeatherWidget dark/>
          <div className="flex-1 px-3 py-2 rounded-xl flex items-center gap-2" style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.08)"}}>
            <span style={{fontSize:16}}>🗓</span>
            <div><p className="text-xs font-semibold" style={{color:T.ivory}}>Gallery opening</p><p style={{fontSize:10,color:"rgba(250,248,244,0.45)"}}>8pm · Formal-casual</p></div>
          </div>
        </div>
        <div className="mx-6 mb-4 p-5 rounded-3xl" style={{background:"rgba(201,168,76,0.1)",border:"1px solid rgba(201,168,76,0.22)"}}>
          <div className="flex items-center gap-4">
            <ScoreRing score={94} dark/>
            <div className="flex-1">
              <p className="font-serif text-lg" style={{color:T.ivory}}>Today's Style Score</p>
              <p className="text-xs mt-1" style={{color:"rgba(250,248,244,0.55)"}}>Your wardrobe is in the 94th percentile for today's gallery look.</p>
              <button onClick={()=>onNav("ar-mirror")} className="haptic mt-3 flex items-center gap-1.5 text-sm font-bold" style={{color:T.gold}}>Try on today's pick {I.arR(T.gold)}</button>
            </div>
          </div>
        </div>
        <div className="mx-6 mb-4 p-4 rounded-2xl" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.07)"}}>
          <div className="flex justify-between items-center mb-3"><p className="text-sm font-semibold" style={{color:T.ivory}}>Monthly Budget</p><p className="font-serif text-lg" style={{color:T.goldLight}}>${spent} <span style={{color:"rgba(250,248,244,0.35)",fontSize:12}}>/ ${budget}</span></p></div>
          <ProgressBar value={spent} max={budget} color={T.gold} dark/>
          <div className="flex justify-between mt-2"><p style={{fontSize:10,color:"rgba(250,248,244,0.4)"}}>Spent</p><p style={{fontSize:10,color:T.sage}}>${budget-spent} remaining</p></div>
        </div>
        <div className="mx-6 mb-4 p-4 rounded-2xl" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.07)"}}>
          <div className="flex justify-between items-center mb-3"><p className="text-sm font-semibold" style={{color:T.ivory}}>Wardrobe Utilization</p><p className="font-serif text-lg" style={{color:T.goldLight}}>68%</p></div>
          <div className="flex gap-1 mb-2">{Array.from({length:20}).map((_,i)=><div key={i} className="flex-1 rounded-sm" style={{height:24,background:i<14?T.gold:"rgba(255,255,255,0.08)"}}/>)}</div>
          <p style={{fontSize:10,color:"rgba(250,248,244,0.4)"}}>You wear 34 of 50 items regularly.</p>
          <button onClick={()=>onNav("wardrobe")} className="haptic mt-1 text-xs font-bold" style={{color:T.gold}}>View wardrobe →</button>
        </div>
        <div className="px-6 mb-3"><p className="text-xs font-bold mb-3" style={{color:"rgba(250,248,244,0.4)",letterSpacing:"0.08em"}}>LOOKS BY OCCASION</p>
          <div className="flex gap-2 overflow-x-auto scroll-hide pb-1">{occasions.map(o=><Chip key={o} label={o} active={occ===o} onPress={()=>setOcc(o)} dark/>)}</div>
        </div>
        <div className="flex gap-3 px-6 overflow-x-auto scroll-hide pb-4">
          {[{label:"Gallery Edit",img:"https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?w=160&h=220&fit=crop&auto=format",score:96},{label:"After-Hours",img:"https://images.unsplash.com/photo-1629511565591-a1d494ad6c58?w=160&h=220&fit=crop&auto=format",score:91},{label:"Effortless Day",img:"https://images.unsplash.com/photo-1659522761084-79196b64abe4?w=160&h=220&fit=crop&auto=format",score:87}].map(l=>(
            <button key={l.label} onClick={()=>onNav("ar-mirror")} className="haptic flex-shrink-0 rounded-2xl overflow-hidden relative" style={{width:155,boxShadow:T.shadowMd}}>
              <div className="relative" style={{height:210}}>
                <img src={l.img} alt={l.label} className="w-full h-full object-cover"/>
                <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(28,28,30,0.8),transparent 50%)"}}/>
                <div className="absolute bottom-2 left-3"><p className="text-xs font-semibold" style={{color:T.ivory}}>{l.label}</p><div className="flex items-center gap-1">{I.sparkle(T.gold,10)}<span style={{fontSize:10,color:T.goldLight}}>{l.score}%</span></div></div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <BottomNav current="home" onNav={onNav} dark/>
    </div>
  );
}

function DarkHomeScreen({onNav}:{onNav:(s:Screen)=>void}) {
  return (
    <div className="flex flex-col h-full" style={{background:T.darkBg}}><Notch/><StatusBar dark/>
      <div className="flex-1 overflow-y-auto scroll-hide pt-14 pb-28">
        <div className="px-6 pt-4 flex items-center justify-between mb-4">
          <div><p className="text-xs font-bold" style={{color:T.gold,letterSpacing:"0.1em"}}>GOOD EVENING</p><h2 className="font-serif text-2xl" style={{color:T.ivory}}>Let's style, Zara</h2></div>
          <div className="flex items-center gap-2">
            <button className="haptic relative w-10 h-10 rounded-full flex items-center justify-center" style={{background:T.darkCard2,border:"1px solid rgba(255,255,255,0.07)"}}>{I.bell()}<div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{background:T.gold}}/></button>
            <Avatar src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=48&h=48&fit=crop&auto=format" size={40} border/>
          </div>
        </div>
        <div className="mx-6 mb-4 flex items-center gap-3 px-4 py-3 rounded-2xl" style={{background:T.darkCard2,border:"1px solid rgba(255,255,255,0.07)"}}>
          {I.sparkle()}<input placeholder="Ask your AI stylist…" className="flex-1 text-sm bg-transparent outline-none" style={{color:"rgba(250,248,244,0.6)"}} onFocus={()=>onNav("chat")}/>
        </div>
        <div className="flex gap-2 px-6 mb-5 overflow-x-auto scroll-hide">{["Date night","Black tie","Cocktail","Night out"].map(p=><Chip key={p} label={p} dark/>)}</div>
        <div className="mx-6 mb-5 p-5 rounded-3xl" style={{background:`linear-gradient(135deg, #2C2C2E, #1C1C1E)`,border:"1px solid rgba(201,168,76,0.2)"}}>
          <div className="flex items-center gap-2 mb-2">{I.sparkle(T.gold,12)}<span className="text-xs font-bold" style={{color:T.gold,letterSpacing:"0.1em"}}>TONIGHT'S PICK</span></div>
          <p className="text-sm" style={{color:"rgba(250,248,244,0.85)"}}>Gallery opening tonight — I'm thinking your <strong style={{color:T.goldLight}}>black silk midi</strong> with gold accessories.</p>
          <button onClick={()=>onNav("ar-mirror")} className="haptic mt-4 flex items-center gap-2 text-sm font-bold" style={{color:T.gold}}>Try on in AR {I.arR(T.gold)}</button>
        </div>
        <div className="px-6 grid grid-cols-2 gap-3 mb-4">
          {[{label:"Black Silk Midi",img:"https://images.unsplash.com/photo-1629511565591-a1d494ad6c58?w=200&h=240&fit=crop&auto=format",match:97},{label:"Gold Blazer",img:"https://images.unsplash.com/photo-1612731486606-2614b4d74921?w=200&h=240&fit=crop&auto=format",match:92}].map(item=>(
            <button key={item.label} onClick={()=>onNav("ar-mirror")} className="haptic rounded-2xl overflow-hidden relative" style={{height:200}}>
              <img src={item.img} alt={item.label} className="w-full h-full object-cover"/>
              <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(0,0,0,0.8),transparent 50%)"}}/>
              <div className="absolute bottom-3 left-3"><p className="text-xs font-semibold" style={{color:T.ivory}}>{item.label}</p><div className="flex items-center gap-1">{I.sparkle(T.gold,10)}<span style={{fontSize:10,color:T.goldLight}}>{item.match}%</span></div></div>
            </button>
          ))}
        </div>
        <button onClick={()=>onNav("home")} className="haptic mx-6 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2" style={{background:T.darkCard2,color:T.muted,border:"1px solid rgba(255,255,255,0.07)"}}>☀️ Switch to Light Mode</button>
      </div>
      <BottomNav current="home" onNav={onNav} dark/>
    </div>
  );
}

function OfflineScreen({onNav}:{onNav:(s:Screen)=>void}) {
  const [retrying,setRetrying]=useState(false);
  const retry=()=>{setRetrying(true);setTimeout(()=>{setRetrying(false);onNav("home");},2000);};
  return (
    <div className="flex flex-col h-full items-center justify-center px-8" style={{background:T.ivory}}><Notch/>
      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{background:T.ivoryDark,border:`1px solid ${T.border}`}}>{I.wifi(true)}</div>
      <h2 className="font-serif text-2xl text-center mb-2" style={{color:T.charcoal}}>You're offline</h2>
      <p className="text-sm text-center leading-relaxed mb-8" style={{color:T.muted}}>No internet connection. Your saved looks and wardrobe are still available.</p>
      <div className="w-full mb-6 flex gap-3 overflow-x-auto scroll-hide pb-2">
        {[{label:"Saved Looks",icon:"♡",count:"47"},{label:"Wardrobe",icon:"👗",count:"34 items"},{label:"Wishlist",icon:"⭐",count:"12"}].map(c=>(
          <div key={c.label} className="flex-shrink-0 p-3 rounded-2xl text-center" style={{width:110,background:"#fff",border:`1px solid ${T.border}`,boxShadow:T.shadow}}>
            <p style={{fontSize:24}}>{c.icon}</p><p className="text-sm font-semibold mt-1" style={{color:T.charcoal}}>{c.count}</p><p style={{fontSize:10,color:T.muted}}>{c.label}</p>
          </div>
        ))}
      </div>
      <div className="w-full flex flex-col gap-3">
        <button onClick={retry} className="haptic w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2" style={{background:goldGrad,color:T.ivory}}>
          {retrying?<><span className="spin-fast inline-block w-4 h-4 rounded-full" style={{border:"2px solid rgba(250,248,244,0.3)",borderTopColor:T.ivory}}/>Retrying…</>:<>↺ Retry Connection</>}
        </button>
        <button onClick={()=>onNav("saved")} className="haptic w-full py-3 rounded-2xl text-sm font-semibold" style={{background:T.ivoryDark,color:T.charcoal}}>Browse Saved Offline</button>
      </div>
    </div>
  );
}

function CameraScreen({onNav}:{onNav:(s:Screen)=>void}) {
  return (
    <div className="flex flex-col h-full" style={{background:"#0A0A0A"}}><Notch/><StatusBar dark/>
      <div className="relative flex-1">
        <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=390&h=700&fit=crop&auto=format" alt="" className="w-full h-full object-cover" style={{opacity:.55,filter:"brightness(0.65) saturate(0.8)"}}/>
        <div className="absolute inset-0">
          {[["top-20 left-8","t-l"],["top-20 right-8","t-r"],["bottom-28 left-8","b-l"],["bottom-28 right-8","b-r"]].map(([pos,id])=>(
            <div key={id} className={`absolute ${pos}`} style={{width:32,height:32,borderRadius:4,
              borderTop:id.startsWith("t")?"2px solid":"none",borderBottom:id.startsWith("b")?"2px solid":"none",
              borderLeft:id.endsWith("l")?"2px solid":"none",borderRight:id.endsWith("r")?"2px solid":"none",
              borderColor:T.gold}}/>
          ))}
          <div className="ar-scan" style={{background:`linear-gradient(90deg,transparent,${T.gold},transparent)`}}/>
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
            <div className="px-4 py-2 rounded-full" style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)"}}><p className="text-xs" style={{color:"rgba(250,248,244,0.8)"}}>Stand 1.5m away · Keep arms relaxed</p></div>
          </div>
        </div>
        <div className="absolute pt-12 px-6 top-0 left-0 right-0 flex items-center justify-between" style={{background:"linear-gradient(to bottom,rgba(0,0,0,0.6),transparent)"}}>
          <p className="font-serif text-lg" style={{color:T.ivory}}>AR Try-On</p>
          <div className="flex gap-2">{["⚡","↺"].map(icon=><button key={icon} className="haptic w-9 h-9 rounded-full flex items-center justify-center" style={{background:"rgba(255,255,255,0.14)"}}><span style={{color:T.ivory}}>{icon}</span></button>)}</div>
        </div>
        <div className="absolute top-20 left-1/2 -translate-x-1/2">
          <div className="flex rounded-full" style={{background:"rgba(0,0,0,0.4)",backdropFilter:"blur(8px)",padding:3}}>
            {["Live","Upload"].map((t,i)=><button key={t} className="haptic px-5 py-1.5 rounded-full text-xs font-bold" style={{background:i===0?T.gold:"transparent",color:i===0?T.ivory:"rgba(250,248,244,0.5)"}}>{t}</button>)}
          </div>
        </div>
      </div>
      <div className="px-6 pt-4 pb-6" style={{background:"#0A0A0A"}}>
        <div className="flex gap-3 mb-5 overflow-x-auto scroll-hide pb-1">
          {[{l:"Blazer",img:"https://images.unsplash.com/photo-1612731486606-2614b4d74921?w=80&h=80&fit=crop&auto=format",a:true},{l:"Dress",img:"https://images.unsplash.com/photo-1659522761084-79196b64abe4?w=80&h=80&fit=crop&auto=format"},{l:"Coat",img:"https://images.unsplash.com/photo-1731589802397-6a1088d63630?w=80&h=80&fit=crop&auto=format"},{l:"+ Add",img:null}].map(g=>(
            <div key={g.l} className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className="rounded-xl overflow-hidden" style={{width:56,height:56,border:g.a?`2px solid ${T.gold}`:"2px solid rgba(255,255,255,0.1)"}}>
                {g.img?<img src={g.img} alt={g.l} className="w-full h-full object-cover"/>:<div className="w-full h-full flex items-center justify-center" style={{background:"rgba(201,168,76,0.08)"}}><span style={{color:T.gold,fontSize:22}}>+</span></div>}
              </div>
              <span style={{fontSize:10,color:g.a?T.gold:"rgba(250,248,244,0.4)"}}>{g.l}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <button className="haptic w-12 h-12 rounded-full flex items-center justify-center" style={{background:"rgba(255,255,255,0.08)"}}><span style={{fontSize:20}}>🖼</span></button>
          <button onClick={()=>onNav("ar-permission")} className="pulse-gold haptic rounded-full flex items-center justify-center" style={{width:72,height:72,background:T.gold}}>
            <div className="rounded-full" style={{width:60,height:60,border:"3px solid rgba(250,248,244,0.35)"}}/>
          </button>
          <button onClick={()=>onNav("ar-mirror")} className="haptic w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold" style={{background:"rgba(201,168,76,0.15)",border:`1px solid rgba(201,168,76,0.3)`,color:T.gold}}>AR</button>
        </div>
      </div>
    </div>
  );
}

function ARPermissionScreen({onNext}:{onNext:()=>void}) {
  return (
    <div className="flex flex-col h-full items-center justify-center px-8" style={{background:T.darkBg}}><Notch/>
      <div className="success-ring w-24 h-24 rounded-full flex items-center justify-center mb-8" style={{background:"rgba(201,168,76,0.1)",border:`2px solid rgba(201,168,76,0.3)`}}>
        <span style={{fontSize:44}}>📷</span>
      </div>
      <h2 className="font-serif text-2xl text-center mb-3" style={{color:T.ivory}}>Camera Access</h2>
      <p className="text-sm text-center leading-relaxed mb-8" style={{color:"rgba(250,248,244,0.55)"}}>MirrorCart needs camera access to apply real-time AR garment overlays. Your feed stays on-device — never stored or shared.</p>
      <div className="w-full flex flex-col gap-3 mb-5"><Btn label="Allow Camera Access" onPress={onNext}/><Btn label="Maybe Later" variant="ghost"/></div>
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{background:"rgba(201,168,76,0.07)",border:"1px solid rgba(201,168,76,0.15)"}}>
        <span style={{color:T.gold,fontSize:12}}>🔒</span><p className="text-xs" style={{color:"rgba(250,248,244,0.4)"}}>Privacy-first · On-device ML · No cloud storage</p>
      </div>
    </div>
  );
}

function ARCalibrateScreen({onNext}:{onNext:()=>void}) {
  const [phase,setPhase]=useState(0);
  const phases=["Initialising camera…","Detecting environment…","Calibrating AR anchors…","Measuring light levels…","Ready!"];
  useEffect(()=>{if(phase<phases.length-1){const t=setTimeout(()=>setPhase(p=>p+1),700);return()=>clearTimeout(t);}else{setTimeout(onNext,500);}},[phase]);
  return (
    <div className="flex flex-col h-full items-center justify-center" style={{background:"#000"}}><Notch/>
      <div className="relative mb-10" style={{width:240,height:240}}>
        <div className="absolute inset-0 rounded-3xl overflow-hidden"><img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=240&h=240&fit=crop&auto=format" alt="" className="w-full h-full object-cover opacity-25"/></div>
        {[["top-0 left-0","border-t-2 border-l-2"],["top-0 right-0","border-t-2 border-r-2"],["bottom-0 left-0","border-b-2 border-l-2"],["bottom-0 right-0","border-b-2 border-r-2"]].map(([pos,border],i)=>(
          <div key={i} className={`absolute ${pos} ${border} transition-all duration-500`} style={{width:34,height:34,borderColor:phase>=2?T.gold:"rgba(250,248,244,0.3)",borderRadius:4}}/>
        ))}
        <div className="ar-scan" style={{background:`linear-gradient(90deg,transparent,${T.gold},transparent)`}}/>
        {phase>=1&&(<div className="absolute inset-0 flex items-center justify-center"><div className="radar" style={{width:80,height:80,borderRadius:"50%",background:"conic-gradient(from 0deg, rgba(201,168,76,0), rgba(201,168,76,0.3), rgba(201,168,76,0))"}}/></div>)}
      </div>
      <div className="flex items-center justify-center gap-2 mb-4"><div className="spin-slow w-4 h-4 rounded-full" style={{border:"2px solid rgba(201,168,76,0.2)",borderTopColor:T.gold}}/><p className="text-sm font-medium fade-up" key={phase} style={{color:T.ivory}}>{phases[phase]}</p></div>
      <div className="flex justify-center gap-2">{phases.map((_,i)=><div key={i} className="rounded-full transition-all duration-300" style={{width:i===phase?20:6,height:6,background:i<=phase?T.gold:"rgba(201,168,76,0.2)"}}/>)}</div>
    </div>
  );
}

function ARPoseScreen({onNext}:{onNext:()=>void}) {
  const [detected,setDetected]=useState(false);
  const [alignment,setAlignment]=useState<"good"|"right"|"far">("far");
  useEffect(()=>{const t1=setTimeout(()=>setAlignment("right"),800);const t2=setTimeout(()=>setAlignment("good"),1600);const t3=setTimeout(()=>{setDetected(true);setTimeout(onNext,900);},2400);return()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);};},[]);
  const alignMsg:{[k:string]:string}={far:"Move closer to the camera",right:"Step slightly left",good:"Perfect! Hold still…"};
  const alignColor:{[k:string]:string}={far:T.rose,right:"#E8A84C",good:T.sage};
  return (
    <div className="flex flex-col h-full" style={{background:"#000"}}><Notch/><StatusBar dark/>
      <div className="relative flex-1">
        <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=390&h=700&fit=crop&auto=format" alt="" className="w-full h-full object-cover opacity-65"/>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 390 700" fill="none">
          <ellipse cx="195" cy="135" rx="38" ry="42" stroke={detected?T.gold:"rgba(250,248,244,0.35)"} strokeWidth="1.5" strokeDasharray={detected?"0":"6 4"} className="transition-all duration-500"/>
          <line x1="195" y1="177" x2="195" y2="395" stroke={detected?T.gold:"rgba(250,248,244,0.3)"} strokeWidth="1.5" strokeDasharray={detected?"0":"6 4"}/>
          <line x1="195" y1="225" x2="125" y2="315" stroke={detected?T.gold:"rgba(250,248,244,0.3)"} strokeWidth="1.5"/>
          <line x1="195" y1="225" x2="265" y2="315" stroke={detected?T.gold:"rgba(250,248,244,0.3)"} strokeWidth="1.5"/>
          <line x1="175" y1="395" x2="162" y2="555" stroke={detected?T.gold:"rgba(250,248,244,0.3)"} strokeWidth="1.5"/>
          <line x1="215" y1="395" x2="228" y2="555" stroke={detected?T.gold:"rgba(250,248,244,0.3)"} strokeWidth="1.5"/>
          <rect x="100" y="80" width="190" height="520" rx="16" stroke={detected?T.gold:"rgba(250,248,244,0.18)"} strokeWidth="1" strokeDasharray="8 6"/>
        </svg>
        {detected&&[[195,135],[195,225],[125,315],[265,315],[195,395],[162,555],[228,555]].map(([x,y],i)=>(
          <div key={i} className="anchor absolute" style={{left:x-5,top:y-5,width:10,height:10,background:T.gold,boxShadow:`0 0 10px ${T.gold}`,animationDelay:`${i*0.15}s`}}/>
        ))}
        <div className="absolute top-16 left-0 right-0 flex justify-center">
          <GlassPanel style={{borderRadius:24,padding:"8px 16px"}}>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{background:alignColor[alignment]}}/><p className="text-sm font-medium" style={{color:T.ivory}}>{alignMsg[alignment]}</p></div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

function ARLoadingScreen({onNext}:{onNext:()=>void}) {
  const [progress,setProgress]=useState(0);
  useEffect(()=>{const i=setInterval(()=>{setProgress(p=>{if(p>=100){clearInterval(i);setTimeout(onNext,250);return 100;}return p+7;});},90);return()=>clearInterval(i);},[]);
  const steps=["Uploading garment mesh…","Mapping fabric texture…","Calibrating fit model…","Applying depth shadows…","Rendering AR overlay…"];
  return (
    <div className="flex flex-col h-full items-center justify-center px-8" style={{background:"#000"}}><Notch/>
      <div className="relative mb-8"><div className="spin-slow rounded-full" style={{width:80,height:80,border:"3px solid rgba(201,168,76,0.12)",borderTopColor:T.gold}}/><div className="absolute inset-0 flex items-center justify-center"><span style={{color:T.gold,fontSize:28}}>✦</span></div></div>
      <p className="font-serif text-xl text-center mb-2" style={{color:T.ivory}}>Preparing Your Look</p>
      <p className="text-xs text-center mb-8 fade-up" key={Math.floor(progress/20)} style={{color:"rgba(250,248,244,0.45)"}}>{steps[Math.min(Math.floor(progress/20),steps.length-1)]}</p>
      <div className="w-full rounded-full mb-3" style={{height:3,background:"rgba(201,168,76,0.12)"}}><div className="rounded-full transition-all duration-75" style={{width:`${progress}%`,height:3,background:`linear-gradient(90deg,${T.gold},${T.goldLight})`}}/></div>
      <p className="text-xs" style={{color:T.gold}}>{progress}%</p>
    </div>
  );
}

function ARTrackingLostScreen({onNav}:{onNav:(s:Screen)=>void}) {
  return (
    <div className="flex flex-col h-full" style={{background:"#000"}}><Notch/><StatusBar dark/>
      <div className="relative flex-1">
        <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=390&h=700&fit=crop&auto=format" alt="" className="w-full h-full object-cover opacity-20"/>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 glow" style={{background:"rgba(212,117,106,0.15)",border:"2px solid rgba(212,117,106,0.4)"}}><span style={{fontSize:40}}>⚠</span></div>
          <h2 className="font-serif text-2xl text-center mb-3" style={{color:T.ivory}}>Tracking Lost</h2>
          <p className="text-sm text-center leading-relaxed mb-8" style={{color:"rgba(250,248,244,0.55)"}}>The AR system lost your body position. Step back and ensure you're fully in frame.</p>
          <div className="w-full flex flex-col gap-3">
            <button onClick={()=>onNav("ar-pose")} className="haptic w-full py-4 rounded-2xl text-sm font-bold" style={{background:goldGrad,color:T.ivory}}>↺ Recalibrate</button>
            <button onClick={()=>onNav("ar-mirror")} className="haptic w-full py-3 rounded-2xl text-sm font-semibold" style={{color:"rgba(250,248,244,0.45)"}}>Continue without tracking</button>
          </div>
          <div className="mt-6 flex gap-3">{["Step back","Better light","Face camera"].map(tip=><div key={tip} className="flex-1 px-3 py-2 rounded-xl text-center" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><p style={{fontSize:10,color:"rgba(250,248,244,0.45)"}}>{tip}</p></div>)}</div>
        </div>
      </div>
    </div>
  );
}

function ARPoorLightScreen({onNav}:{onNav:(s:Screen)=>void}) {
  const [adjusted,setAdjusted]=useState(false);
  return (
    <div className="flex flex-col h-full" style={{background:"#000"}}><Notch/><StatusBar dark/>
      <div className="relative flex-1">
        <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=390&h=700&fit=crop&auto=format" alt="" className="w-full h-full object-cover" style={{opacity:.15,filter:"brightness(0.4)"}}/>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{background:"rgba(232,212,154,0.12)",border:"2px solid rgba(232,212,154,0.35)"}}><span style={{fontSize:40}}>💡</span></div>
          <h2 className="font-serif text-2xl text-center mb-3" style={{color:T.ivory}}>Low Light Detected</h2>
          <p className="text-sm text-center leading-relaxed mb-6" style={{color:"rgba(250,248,244,0.55)"}}>Lighting is too dim for accurate AR garment placement.</p>
          <div className="w-full mb-6 p-4 rounded-2xl" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.07)"}}>
            <div className="flex justify-between mb-2"><p className="text-xs" style={{color:"rgba(250,248,244,0.45)"}}>Light Level</p><p className="text-xs font-semibold" style={{color:adjusted?T.sage:T.rose}}>{adjusted?"Good":"Too dim"}</p></div>
            <div className="w-full rounded-full" style={{height:6,background:"rgba(255,255,255,0.1)"}}><div className="rounded-full transition-all duration-700" style={{width:adjusted?"75%":"25%",height:6,background:adjusted?T.sage:T.rose}}/></div>
          </div>
          <div className="w-full flex flex-col gap-3">
            <button onClick={()=>setAdjusted(true)} className="haptic w-full py-4 rounded-2xl text-sm font-bold" style={{background:goldGrad,color:T.ivory}}>⚡ Enable Flash Fill</button>
            <button onClick={()=>onNav("ar-mirror")} className="haptic w-full py-3 rounded-2xl text-sm" style={{background:"rgba(255,255,255,0.07)",color:"rgba(250,248,244,0.6)"}}>Try Anyway</button>
          </div>
          {adjusted&&<p className="text-xs mt-4 text-center" style={{color:T.sage}}>✓ Light compensation active — continuing in 2s…</p>}
        </div>
      </div>
    </div>
  );
}

function ARUnsupportedScreen({onNav}:{onNav:(s:Screen)=>void}) {
  return (
    <div className="flex flex-col h-full" style={{background:"#000"}}><Notch/><StatusBar dark/>
      <div className="relative flex-1">
        <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=390&h=700&fit=crop&auto=format" alt="" className="w-full h-full object-cover opacity-25"/>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{background:"rgba(107,163,201,0.12)",border:"2px solid rgba(107,163,201,0.35)"}}><span style={{fontSize:40}}>🧍</span></div>
          <h2 className="font-serif text-2xl text-center mb-3" style={{color:T.ivory}}>Pose Not Supported</h2>
          <p className="text-sm text-center leading-relaxed mb-6" style={{color:"rgba(250,248,244,0.55)"}}>MirrorCart needs a front-facing, full-body view for accurate garment placement.</p>
          <div className="grid grid-cols-3 gap-3 mb-7 w-full">
            {[{label:"✓ Front facing",ok:true},{label:"✗ Side profile",ok:false},{label:"✓ Full body",ok:true}].map(tip=>(
              <div key={tip.label} className="px-2 py-3 rounded-xl text-center" style={{background:tip.ok?"rgba(122,158,135,0.12)":"rgba(212,117,106,0.12)",border:`1px solid ${tip.ok?"rgba(122,158,135,0.25)":"rgba(212,117,106,0.25)"}`}}>
                <p style={{fontSize:10,color:tip.ok?T.sage:T.rose,fontWeight:600}}>{tip.label}</p>
              </div>
            ))}
          </div>
          <Btn label="↺ Try Again" onPress={()=>onNav("ar-pose")}/>
          <button onClick={()=>onNav("camera")} className="haptic mt-3 w-full py-3 text-sm" style={{color:"rgba(250,248,244,0.35)"}}>Back to camera</button>
        </div>
      </div>
    </div>
  );
}

function ARMirrorScreen({onNav}:{onNav:(s:Screen)=>void}) {
  const [beforeAfter,setBeforeAfter]=useState(false);
  const [saved,setSaved]=useState(false);
  const [garmentIdx,setGarmentIdx]=useState(0);
  const [activeColor,setActiveColor]=useState(0);
  const [showControls,setShowControls]=useState(false);
  const [showReasoning,setShowReasoning]=useState(false);
  const [showComplete,setShowComplete]=useState(false);
  const [showFitCheck,setShowFitCheck]=useState(false);
  const [showLayering,setShowLayering]=useState(false);
  const [snapped,setSnapped]=useState(false);
  const [score]=useState(94);
  const [zoomIn,setZoomIn]=useState(false);
  const [swipeHint,setSwipeHint]=useState(true);
  const [tapRegion,setTapRegion]=useState<string|null>(null);
  const [showScore,setShowScore]=useState(true);
  const [layers,setLayers]=useState([{l:"Blazer",on:true},{l:"Blouse",on:true},{l:"Trousers",on:false},{l:"Belt",on:false},{l:"Accessories",on:false}]);

  const garments=[
    {name:"Linen Tailored Blazer",brand:"ZARA",price:"$89.99",orig:"$129",sizes:["XS","S","M","L"],colors:["#C9A84C","#1C1C1E","#8B7355","#7A9E87"],img:"https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?w=390&h=700&fit=crop&auto=format"},
    {name:"Silk Slip Dress",brand:"& OTHER STORIES",price:"$120",orig:"$150",sizes:["XS","S","M","L","XL"],colors:["#1C1C1E","#D4756A","#E8D49A","#7A9E87"],img:"https://images.unsplash.com/photo-1509631179647-0177331693ae?w=390&h=700&fit=crop&auto=format"},
    {name:"Trench Coat",brand:"MANGO",price:"$195",orig:"$240",sizes:["XS","S","M","L"],colors:["#8B7355","#1C1C1E","#F4C6A0"],img:"https://images.unsplash.com/photo-1605714048976-892f6b95320e?w=390&h=700&fit=crop&auto=format"},
  ];
  const g=garments[garmentIdx];
  const swipe=(dir:number)=>{setSwipeHint(false);setGarmentIdx(i=>(i+dir+garments.length)%garments.length);setActiveColor(0);};
  const snap=()=>{setSnapped(true);setTimeout(()=>setSnapped(false),500);setTimeout(()=>onNav("social"),600);};
  const tapClothing=(region:string)=>{setTapRegion(region);setTimeout(()=>setTapRegion(null),1500);};

  return (
    <div className="flex flex-col h-full" style={{background:"#000"}}><Notch/><StatusBar dark/>
      <div className="relative flex-1 overflow-hidden">
        <img src={beforeAfter?garments[garmentIdx].img:"https://images.unsplash.com/photo-1583459193858-028092aa76ad?w=390&h=700&fit=crop&auto=format"} alt="AR view"
          className="w-full h-full object-cover transition-all duration-300"
          style={{filter:beforeAfter?"brightness(0.8) saturate(0.85)":"brightness(0.92)",transform:zoomIn?"scale(1.18)":"scale(1)",transition:"all 0.35s cubic-bezier(.16,1,.3,1)"}}/>
        {snapped&&<div className="absolute inset-0 bg-white" style={{opacity:.85,zIndex:99}}/>}
        {!beforeAfter&&(
          <>
            <div className="absolute float" style={{top:"22%",left:"28%",width:"44%",height:"40%",background:"rgba(50,46,42,0.42)",borderRadius:24,backdropFilter:"blur(0.5px)",boxShadow:"0 20px 60px rgba(0,0,0,0.35) inset"}}/>
            <div className="absolute" style={{top:"60%",left:"25%",width:"50%",height:"6%",background:"rgba(0,0,0,0.2)",borderRadius:"50%",filter:"blur(12px)"}}/>
            {[[34,25],[63,23],[50,55],[32,60],[67,58],[50,72]].map(([x,y],i)=>(
              <div key={i} className="anchor absolute" style={{left:`${x}%`,top:`${y}%`,width:8,height:8,background:T.gold,boxShadow:`0 0 8px ${T.gold}`,animationDelay:`${i*0.2}s`}}/>
            ))}
          </>
        )}
        {[{label:"Top",top:"25%",left:"30%",w:"40%",h:"20%"},{label:"Bottom",top:"52%",left:"32%",w:"36%",h:"18%"}].map(region=>(
          <button key={region.label} onClick={()=>tapClothing(region.label)} className="absolute" style={{top:region.top,left:region.left,width:region.w,height:region.h,background:"transparent",zIndex:10}}>
            {tapRegion===region.label&&<div className="fade-up absolute inset-0 flex items-center justify-center"><div className="px-3 py-1.5 rounded-xl" style={{background:"rgba(201,168,76,0.9)"}}><p className="text-xs font-bold" style={{color:T.ivory}}>✦ {region.label} selected</p></div></div>}
          </button>
        ))}
        {swipeHint&&<div className="absolute flex justify-center" style={{bottom:"52%",left:0,right:0}}><div className="px-4 py-2 rounded-full" style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)"}}><p style={{fontSize:11,color:"rgba(250,248,244,0.65)"}}>← Swipe to change →</p></div></div>}
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 pt-14 pb-5 px-5 flex items-center justify-between" style={{background:"linear-gradient(to bottom,rgba(0,0,0,0.7),transparent)"}}>
          <button onClick={()=>onNav("camera")} className="haptic w-10 h-10 rounded-full flex items-center justify-center glass" style={{border:"1px solid rgba(255,255,255,0.12)"}}>{I.arL("#fff")}</button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-dark" style={{border:"1px solid rgba(255,255,255,0.1)"}}><div className="w-2 h-2 rounded-full" style={{background:T.sage}}/><span className="text-xs font-semibold" style={{color:T.ivory}}>AR Live</span></div>
          <div className="flex gap-2">
            <button onClick={()=>setSaved(true)} className="haptic w-10 h-10 rounded-full flex items-center justify-center glass" style={{border:"1px solid rgba(255,255,255,0.12)",background:saved?"rgba(201,168,76,0.7)":"rgba(255,255,255,0.08)"}}>{saved?I.check(T.ivory):<span style={{color:T.ivory,fontSize:16}}>♡</span>}</button>
            <button onClick={snap} className="haptic w-10 h-10 rounded-full flex items-center justify-center glass" style={{border:"1px solid rgba(255,255,255,0.12)"}}><span style={{color:T.ivory,fontSize:15}}>📸</span></button>
          </div>
        </div>
        {/* Before/After */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2">
          <div className="flex rounded-full overflow-hidden glass-dark" style={{border:"1px solid rgba(255,255,255,0.1)",padding:3}}>
            {["After","Before"].map((label,i)=>(
              <button key={label} onClick={()=>setBeforeAfter(i===1)} className="haptic px-5 py-1 rounded-full text-xs font-bold"
                style={{background:(i===0?!beforeAfter:beforeAfter)?T.gold:"transparent",color:(i===0?!beforeAfter:beforeAfter)?T.ivory:"rgba(250,248,244,0.55)"}}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {/* Left controls */}
        <div className="absolute left-3 flex flex-col gap-2" style={{top:"38%"}}>
          {[{icon:"←",fn:()=>swipe(-1)},{icon:"⊕",fn:()=>setZoomIn(!zoomIn)},{icon:I.rotate(),fn:()=>{}},{icon:I.layers(),fn:()=>setShowLayering(true)}].map((btn,i)=>(
            <button key={i} onClick={btn.fn} className="haptic w-11 h-11 rounded-full flex items-center justify-center"
              style={{background:"rgba(0,0,0,0.4)",backdropFilter:"blur(14px)",border:"1px solid rgba(255,255,255,0.12)",color:T.ivory,fontSize:16}}>
              {btn.icon}
            </button>
          ))}
        </div>
        {/* Right controls */}
        <div className="absolute right-3 flex flex-col gap-2" style={{top:"38%"}}>
          {[{icon:"→",fn:()=>swipe(1)},{icon:I.sliders(),fn:()=>setShowControls(!showControls)},{icon:I.zap(),fn:()=>setShowFitCheck(true)},{icon:"🔍",fn:()=>setShowScore(!showScore)}].map((btn,i)=>(
            <button key={i} onClick={btn.fn} className="haptic w-11 h-11 rounded-full flex items-center justify-center"
              style={{background:"rgba(0,0,0,0.4)",backdropFilter:"blur(14px)",border:"1px solid rgba(255,255,255,0.12)",color:T.ivory,fontSize:16}}>
              {btn.icon}
            </button>
          ))}
        </div>
        {/* Score ring */}
        {showScore&&<button onClick={()=>onNav("outfit-score")} className="absolute pop-in" style={{top:"32%",right:58}}>
          <GlassPanel style={{borderRadius:20,padding:"8px 10px",border:"1px solid rgba(201,168,76,0.3)"}}><ScoreRing score={score} size={72} dark/></GlassPanel>
        </button>}
        {/* Adjustments panel */}
        {showControls&&<div className="absolute fade-up" style={{top:"25%",left:"50%",transform:"translateX(-50%)",width:200,zIndex:20}}>
          <GlassPanel style={{borderRadius:20,padding:16}}>
            <p className="text-xs font-bold mb-3 text-center" style={{color:T.goldLight,letterSpacing:"0.08em"}}>ADJUSTMENTS</p>
            {[{l:"Scale",v:75},{l:"Rotation",v:50},{l:"Opacity",v:90},{l:"Light",v:75}].map(adj=>(
              <div key={adj.l} className="mb-3">
                <div className="flex justify-between mb-1"><p style={{fontSize:10,color:"rgba(250,248,244,0.55)"}}>{adj.l}</p><p style={{fontSize:10,color:T.gold,fontWeight:600}}>{adj.v}%</p></div>
                <div className="w-full rounded-full overflow-hidden" style={{height:3,background:"rgba(255,255,255,0.1)"}}><div className="rounded-full" style={{width:`${adj.v}%`,height:3,background:T.gold}}/></div>
              </div>
            ))}
            <button onClick={()=>setShowControls(false)} className="haptic w-full py-1.5 rounded-xl text-xs font-semibold mt-1" style={{background:"rgba(201,168,76,0.15)",color:T.gold}}>Done</button>
          </GlassPanel>
        </div>}
        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pt-8 pb-5" style={{background:"linear-gradient(to top,rgba(0,0,0,0.9) 65%,transparent)"}}>
          <div className="flex justify-center gap-1.5 mb-4">{garments.map((_,i)=><div key={i} className="rounded-full transition-all duration-300" style={{width:i===garmentIdx?20:6,height:6,background:i===garmentIdx?T.gold:"rgba(250,248,244,0.25)"}}/>)}</div>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-bold" style={{color:T.gold,letterSpacing:"0.08em"}}>{g.brand}</p>
              <p className="font-serif text-lg" style={{color:T.ivory}}>{g.name}</p>
              <div className="flex items-center gap-2 mt-0.5"><p className="text-sm font-bold" style={{color:T.ivory}}>{g.price}</p><p className="text-xs line-through" style={{color:"rgba(250,248,244,0.35)"}}>{g.orig}</p></div>
            </div>
            <div className="flex gap-1.5">{g.sizes.map(sz=><button key={sz} className="haptic w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{background:sz==="S"?T.gold:"rgba(255,255,255,0.12)",color:sz==="S"?T.ivory:"rgba(250,248,244,0.7)"}}>{sz}</button>)}</div>
          </div>
          <div className="flex gap-2 mb-4">{g.colors.map((c,i)=><button key={i} onClick={()=>setActiveColor(i)} className="haptic rounded-full" style={{width:24,height:24,background:c,border:activeColor===i?`2.5px solid ${T.gold}`:"2.5px solid transparent"}}/>)}</div>
          <div className="flex gap-2 mb-3">
            <button onClick={()=>setShowFitCheck(true)} className="haptic flex-1 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1" style={{background:"rgba(255,255,255,0.1)",color:T.ivory,border:"1px solid rgba(255,255,255,0.15)"}}>{I.zap()} AI Fit</button>
            <button onClick={()=>setShowComplete(true)} className="haptic flex-1 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1" style={{background:"rgba(255,255,255,0.1)",color:T.ivory,border:"1px solid rgba(255,255,255,0.15)"}}>{I.sparkle(T.gold,10)} Complete</button>
            <button onClick={()=>setShowReasoning(true)} className="haptic flex-1 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1" style={{background:"rgba(255,255,255,0.1)",color:T.ivory,border:"1px solid rgba(255,255,255,0.15)"}}>💡 Why?</button>
          </div>
          <button onClick={()=>onNav("cart")} className="haptic w-full py-3.5 rounded-2xl text-sm font-bold" style={{background:goldGrad,color:T.ivory,boxShadow:"0 6px 24px rgba(201,168,76,0.42)"}}>Shop This Look · {g.price}</button>
        </div>
      </div>
      {/* AI Fit Check sheet */}
      <BottomSheet open={showFitCheck} onClose={()=>setShowFitCheck(false)} title="AI Fit Check" height={440} dark>
        <div className="px-6 pb-4">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl" style={{background:"rgba(201,168,76,0.1)",border:"1px solid rgba(201,168,76,0.2)"}}>{I.sparkle(T.gold,14)}<p className="text-sm" style={{color:T.ivory}}>Based on your profile — <strong style={{color:T.goldLight}}>Size S is your perfect fit.</strong></p></div>
          {[{l:"Shoulders",match:98,note:"Sits precisely"},{l:"Chest",match:96,note:"1cm ease"},{l:"Waist",match:92,note:"Relaxed fit"},{l:"Hip",match:88,note:"Loose through hip"},{l:"Length",match:94,note:"Hip-grazing"}].map(m=>(
            <div key={m.l} className="flex items-center gap-3 mb-3">
              <p className="text-xs w-16 flex-shrink-0" style={{color:"rgba(250,248,244,0.5)"}}>{m.l}</p>
              <div className="flex-1 rounded-full overflow-hidden" style={{height:4,background:"rgba(255,255,255,0.08)"}}><div className="rounded-full" style={{width:`${m.match}%`,height:4,background:m.match>=95?T.sage:m.match>=88?T.gold:T.rose}}/></div>
              <p className="text-xs w-20 flex-shrink-0" style={{color:"rgba(250,248,244,0.4)"}}>{m.note}</p>
            </div>
          ))}
          <div className="mt-4 grid grid-cols-2 gap-2"><Btn label="Try Larger Size" variant="dark"/><Btn label="Add to Cart · S" onPress={()=>onNav("cart")}/></div>
        </div>
      </BottomSheet>
      {/* Complete the Look sheet */}
      <BottomSheet open={showComplete} onClose={()=>setShowComplete(false)} title="Complete the Look" height={480} dark>
        <div className="px-6 pb-4">
          <p className="text-xs mb-4" style={{color:"rgba(250,248,244,0.45)"}}>AI-matched pieces to complete this outfit</p>
          {[{label:"Wide-Leg Trousers",brand:"COS",price:"$95",img:"https://images.unsplash.com/photo-1629511565591-a1d494ad6c58?w=80&h=80&fit=crop&auto=format",match:96},{label:"Silk Blouse",brand:"& Other Stories",price:"$75",img:"https://images.unsplash.com/photo-1659522761084-79196b64abe4?w=80&h=80&fit=crop&auto=format",match:91},{label:"Gold Slingbacks",brand:"Mango",price:"$119",img:"https://images.unsplash.com/photo-1662532577856-e8ee8b138a8b?w=80&h=80&fit=crop&auto=format",match:88}].map(item=>(
            <div key={item.label} className="flex items-center gap-3 mb-3 p-3 rounded-2xl" style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)"}}>
              <img src={item.img} alt={item.label} className="rounded-xl object-cover" style={{width:52,height:52}}/>
              <div className="flex-1"><p className="text-sm font-medium" style={{color:T.ivory}}>{item.label}</p><p className="text-xs" style={{color:"rgba(250,248,244,0.4)"}}>{item.brand}</p><div className="flex items-center gap-1 mt-0.5">{I.sparkle(T.gold,10)}<span style={{fontSize:10,color:T.gold}}>{item.match}% match</span></div></div>
              <div className="flex flex-col items-end gap-1.5"><p className="text-sm font-bold" style={{color:T.ivory}}>{item.price}</p><button className="haptic text-xs px-3 py-1 rounded-lg font-bold" style={{background:"rgba(201,168,76,0.2)",color:T.gold}}>Try</button></div>
            </div>
          ))}
          <Btn label="Add All to Cart · $289" onPress={()=>onNav("cart")}/>
        </div>
      </BottomSheet>
      {/* AI Reasoning sheet */}
      <BottomSheet open={showReasoning} onClose={()=>setShowReasoning(false)} title="Why This Matches You" height={500} dark>
        <div className="px-6 pb-4">
          <div className="flex items-center gap-4 mb-5"><ScoreRing score={94} size={72} dark/><div><p className="text-sm font-bold" style={{color:T.ivory}}>94 / 100 Style Match</p><p className="text-xs mt-1" style={{color:"rgba(250,248,244,0.45)"}}>Exceptional fit for your profile</p></div></div>
          {[{icon:"👤",label:"Body Type Match",detail:"Hourglass silhouette — notched lapel blazers define your waist perfectly.",score:96},{icon:"🎨",label:"Colour Harmony",detail:"Camel is a true neutral for your warm skin tone.",score:94},{icon:"🗓",label:"Occasion Fit",detail:"Gallery opening · formal-casual: blazer hits exactly right.",score:91},{icon:"💰",label:"Value Score",detail:"31% below retail. In stock in your size. Free returns.",score:88},{icon:"📈",label:"Trend Alignment",detail:"Tailored linen trending +47% in your city this season.",score:85}].map(r=>(
            <div key={r.label} className="flex items-start gap-3 mb-4">
              <span style={{fontSize:20}}>{r.icon}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1"><p className="text-sm font-semibold" style={{color:T.ivory}}>{r.label}</p><p className="text-xs font-bold" style={{color:T.gold}}>{r.score}%</p></div>
                <p style={{fontSize:11,color:"rgba(250,248,244,0.5)",lineHeight:1.5}}>{r.detail}</p>
                <div className="mt-1.5 w-full rounded-full overflow-hidden" style={{height:2.5,background:"rgba(255,255,255,0.08)"}}><div className="rounded-full" style={{width:`${r.score}%`,height:2.5,background:T.gold}}/></div>
              </div>
            </div>
          ))}
          <div className="mt-4 p-3 rounded-2xl" style={{background:"rgba(201,168,76,0.08)",border:"1px solid rgba(201,168,76,0.15)"}}>
            <p className="text-xs font-bold mb-1" style={{color:T.gold}}>✦ TRY THIS INSTEAD</p>
            <p style={{fontSize:11,color:"rgba(250,248,244,0.5)"}}>For a cooler tone: COS Oversized Blazer in slate — 91% match, $105.</p>
          </div>
        </div>
      </BottomSheet>
      {/* Layering sheet */}
      <BottomSheet open={showLayering} onClose={()=>setShowLayering(false)} title="Outfit Layers" height={380} dark>
        <div className="px-6 pb-4">
          {layers.map((item,i)=>(
            <div key={item.l} className="flex items-center justify-between py-3.5" style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
              <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:"rgba(255,255,255,0.06)"}}><span style={{fontSize:14}}>👕</span></div><p className="text-sm font-medium" style={{color:T.ivory}}>{item.l}</p></div>
              <button onClick={()=>{const n=[...layers];n[i]={...n[i],on:!n[i].on};setLayers(n);}} className="haptic w-12 h-6 rounded-full relative" style={{background:item.on?T.gold:"rgba(255,255,255,0.1)"}}>
                <div className="absolute top-1 rounded-full w-4 h-4" style={{background:"#fff",left:item.on?"calc(100% - 20px)":4,transition:"left 0.2s"}}/>
              </button>
            </div>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}

function FitCheckScreen({onNav}:{onNav:(s:Screen)=>void}) {
  return (
    <div className="flex flex-col h-full" style={{background:T.darkBg}}><Notch/><StatusBar dark/>
      <div className="flex-1 overflow-y-auto scroll-hide pt-14 pb-8">
        <div className="px-6 pt-4 flex items-center gap-3 mb-5"><BackBtn onPress={()=>onNav("ar-mirror")} dark/><h2 className="font-serif text-xl" style={{color:T.ivory}}>AI Fit Check</h2></div>
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?w=200&h=380&fit=crop&auto=format" alt="Fit preview" className="rounded-3xl object-cover" style={{width:200,height:360}}/>
            {[{label:"S ✓",top:"18%",left:"78%",color:T.sage},{label:"Waist ✓",top:"46%",left:"-28%",color:T.gold},{label:"Hip ✓",top:"62%",left:"75%",color:T.sage}].map(m=>(
              <div key={m.label} className="absolute fade-up px-2 py-1 rounded-lg" style={{top:m.top,left:m.left,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)"}}><p style={{fontSize:10,color:m.color,fontWeight:700,whiteSpace:"nowrap"}}>{m.label}</p></div>
            ))}
          </div>
        </div>
        <div className="mx-6 mb-4 p-4 rounded-2xl" style={{background:T.darkCard2}}><div className="flex items-center gap-2 mb-3">{I.sparkle(T.gold,12)}<p className="text-xs font-bold" style={{color:T.gold,letterSpacing:"0.08em"}}>FIT VERDICT</p></div><p className="text-sm leading-relaxed" style={{color:"rgba(250,248,244,0.8)"}}>Size <strong style={{color:T.goldLight}}>S is your ideal fit</strong>. Shoulder seams align, chest has appropriate ease, and length grazes your hip perfectly.</p></div>
        {[{l:"Shoulders",v:98},{l:"Chest",v:96},{l:"Waist",v:91},{l:"Hip",v:87},{l:"Length",v:94}].map(m=>(
          <div key={m.l} className="mx-6 flex items-center gap-3 mb-3"><p className="text-xs w-16" style={{color:"rgba(250,248,244,0.45)"}}>{m.l}</p><div className="flex-1 rounded-full overflow-hidden" style={{height:5,background:"rgba(255,255,255,0.08)"}}><div className="rounded-full" style={{width:`${m.v}%`,height:5,background:m.v>=95?T.sage:m.v>=88?T.gold:T.rose}}/></div><p className="text-xs font-bold w-8 text-right" style={{color:T.gold}}>{m.v}%</p></div>
        ))}
        <div className="px-6 mt-5 flex gap-3"><Btn label="Try Size M" variant="dark"/><Btn label="Shop Size S" onPress={()=>onNav("cart")}/></div>
      </div>
    </div>
  );
}

function OutfitScoreScreen({onNav}:{onNav:(s:Screen)=>void}) {
  const [animate,setAnimate]=useState(false);
  useEffect(()=>{setTimeout(()=>setAnimate(true),200);},[]);
  const dims=[{l:"Style Match",v:94,c:T.gold},{l:"Fit Score",v:91,c:T.sage},{l:"Trend Align",v:87,c:T.sky},{l:"Occasion Fit",v:96,c:T.lavender},{l:"Value",v:82,c:T.rose}];
  return (
    <div className="flex flex-col h-full" style={{background:T.darkBg}}><Notch/><StatusBar dark/>
      <div className="flex-1 overflow-y-auto scroll-hide pt-14 pb-8">
        <div className="px-6 pt-4 flex items-center gap-3 mb-6"><BackBtn onPress={()=>onNav("ar-mirror")} dark/><h2 className="font-serif text-xl" style={{color:T.ivory}}>Live Outfit Score</h2></div>
        <div className="flex justify-center mb-6">
          <div className="relative">
            <svg width="200" height="200" viewBox="0 0 200 200" style={{transform:"rotate(-90deg)"}}>
              <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(201,168,76,0.12)" strokeWidth="12"/>
              <circle cx="100" cy="100" r="80" fill="none" stroke={T.gold} strokeWidth="12" strokeLinecap="round"
                strokeDasharray="502" strokeDashoffset={animate?502*(1-0.94):502} style={{transition:"stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1)"}}/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-serif" style={{fontSize:52,color:T.ivory,lineHeight:1}}>94</p>
              <p className="text-xs font-bold" style={{color:T.gold,letterSpacing:"0.12em"}}>STYLE SCORE</p>
              <p style={{fontSize:10,color:"rgba(250,248,244,0.4)",marginTop:2}}>Exceptional</p>
            </div>
          </div>
        </div>
        <div className="px-6 mb-5">{dims.map((d,i)=>(
          <div key={d.l} className="flex items-center gap-3 mb-3">
            <p className="text-xs w-20 flex-shrink-0" style={{color:"rgba(250,248,244,0.5)"}}>{d.l}</p>
            <div className="flex-1 rounded-full overflow-hidden" style={{height:6,background:"rgba(255,255,255,0.08)"}}><div className="rounded-full" style={{width:animate?`${d.v}%`:0,height:6,background:d.c,transition:`width 1s cubic-bezier(.16,1,.3,1) ${i*0.1}s`}}/></div>
            <p className="text-xs font-bold w-8 text-right" style={{color:d.c}}>{d.v}</p>
          </div>
        ))}</div>
        <div className="px-6 grid grid-cols-2 gap-3 mb-5">{[{l:"vs Your Average",v:"+12pts"},{l:"vs This Season",v:"Top 6%"},{l:"vs Your Budget",v:"31% saved"},{l:"Rewear Potential",v:"High"}].map(c=>(
          <div key={c.l} className="p-3 rounded-2xl" style={{background:T.darkCard2,border:"1px solid rgba(255,255,255,0.06)"}}><p style={{fontSize:10,color:"rgba(250,248,244,0.4)"}}>{c.l}</p><p className="font-serif text-lg mt-0.5" style={{color:T.gold}}>{c.v}</p></div>
        ))}</div>
        <div className="px-6 flex gap-3"><Btn label="Share Score" variant="dark" onPress={()=>onNav("social")}/><Btn label="Shop the Look" onPress={()=>onNav("cart")}/></div>
      </div>
    </div>
  );
}

function SocialScreen({onNav}:{onNav:(s:Screen)=>void}) {
  const [privateMode,setPrivateMode]=useState(false);
  const [watermark,setWatermark]=useState(true);
  const [downloading,setDownloading]=useState(false);
  const doDownload=()=>{setDownloading(true);setTimeout(()=>setDownloading(false),1800);};
  const platforms=["Instagram","TikTok","Pinterest","Threads","WhatsApp","Snapchat"];
  const emojis=["📷","🎵","📌","🔗","💬","👻"];
  return (
    <div className="flex flex-col h-full" style={{background:T.charcoal}}><Notch/><StatusBar dark/>
      <div className="flex-1 overflow-y-auto scroll-hide pt-14 pb-8">
        <div className="px-6 pt-4 flex items-center gap-3 mb-5"><BackBtn onPress={()=>onNav("ar-mirror")} dark/><h2 className="font-serif text-xl" style={{color:T.ivory}}>Share Your Look</h2></div>
        <div className="mx-6 mb-5 rounded-3xl overflow-hidden relative" style={{height:360,boxShadow:T.shadowLg}}>
          <img src="https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?w=390&h=360&fit=crop&auto=format" alt="Look" className="w-full h-full object-cover"/>
          <div className="absolute inset-0" style={{background:"linear-gradient(to bottom,rgba(0,0,0,0.15),rgba(28,28,30,0.75) 100%)"}}/>
          <div className="absolute top-4 right-4 grid grid-cols-2 gap-1" style={{width:80}}>
            {["https://images.unsplash.com/photo-1612731486606-2614b4d74921?w=40&h=40&fit=crop&auto=format","https://images.unsplash.com/photo-1662532577856-e8ee8b138a8b?w=40&h=40&fit=crop&auto=format"].map((src,i)=>(
              <img key={i} src={src} alt="" className="rounded-lg object-cover" style={{width:38,height:38}}/>
            ))}
          </div>
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full" style={{background:"rgba(201,168,76,0.9)"}}><span style={{fontSize:11,color:T.ivory,fontWeight:700}}>✦ 94 STYLE SCORE</span></div>
          <div className="absolute bottom-0 left-0 right-0 p-4"><p className="font-serif text-xl" style={{color:T.ivory}}>Linen Blazer · Gallery Edit</p><p style={{fontSize:11,color:"rgba(250,248,244,0.55)"}}>{watermark?"via MirrorCart AR ✦ · ":""}Zara · $89.99</p></div>
          {privateMode&&<div className="absolute inset-0 flex items-center justify-center" style={{background:"rgba(14,14,16,0.82)",backdropFilter:"blur(12px)"}}>
            <div className="text-center"><div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{background:"rgba(201,168,76,0.12)",border:`1px solid ${T.gold}`}}>{I.lock()}</div><p className="text-sm font-semibold" style={{color:T.ivory}}>Private Mode</p><p style={{fontSize:10,color:"rgba(250,248,244,0.4)",marginTop:4}}>Only you can see this snapshot</p></div>
          </div>}
        </div>
        <div className="px-6 mb-5 flex flex-col gap-3">
          {[{l:"Private Mode",sub:"Only visible to you",on:privateMode,fn:()=>setPrivateMode(!privateMode)},{l:"MirrorCart Watermark",sub:"Show app credit on image",on:watermark,fn:()=>setWatermark(!watermark)}].map(opt=>(
            <div key={opt.l} className="flex items-center justify-between p-4 rounded-2xl" style={{background:T.darkCard2,border:"1px solid rgba(255,255,255,0.07)"}}>
              <div><p className="text-sm font-medium" style={{color:T.ivory}}>{opt.l}</p><p style={{fontSize:10,color:"rgba(250,248,244,0.35)"}}>{opt.sub}</p></div>
              <button onClick={opt.fn} className="haptic w-12 h-6 rounded-full relative" style={{background:opt.on?T.gold:"rgba(255,255,255,0.1)"}}>
                <div className="absolute top-1 rounded-full w-4 h-4" style={{background:"#fff",left:opt.on?"calc(100% - 20px)":4,transition:"left 0.2s"}}/>
              </button>
            </div>
          ))}
        </div>
        <div className="px-6 mb-5">
          <p className="text-xs font-bold mb-3" style={{color:"rgba(250,248,244,0.35)",letterSpacing:"0.08em"}}>SHARE TO</p>
          <div className="grid grid-cols-3 gap-3">{platforms.map((p,i)=>(
            <button key={p} className="haptic flex flex-col items-center gap-2 py-3 rounded-2xl" style={{background:T.darkCard2,border:"1px solid rgba(255,255,255,0.06)"}}>
              <span style={{fontSize:24}}>{emojis[i]}</span><p style={{fontSize:10,color:"rgba(250,248,244,0.55)"}}>{p}</p>
            </button>
          ))}</div>
        </div>
        <div className="px-6">
          <button onClick={doDownload} className="haptic w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2" style={{background:goldGrad,color:T.ivory}}>
            {downloading?<><span className="spin-fast inline-block w-4 h-4 rounded-full" style={{border:"2px solid rgba(250,248,244,0.3)",borderTopColor:T.ivory}}/>Saving…</>:<>{I.download()} Save to Camera Roll</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function DiscoverScreen({onNav}:{onNav:(s:Screen)=>void}) {
  const [query,setQuery]=useState(""); const [filter,setFilter]=useState("All"); const [loading,setLoading]=useState(false); const [toast,setToast]=useState(false);
  const filters=["All","Blazers","Dresses","Outerwear","Accessories","Denim"];
  const items=[{label:"Tailored Blazer",brand:"Zara",price:"$89",img:"https://images.unsplash.com/photo-1612731486606-2614b4d74921?w=200&h=260&fit=crop&auto=format",match:94},{label:"Slip Dress",brand:"& Other Stories",price:"$120",img:"https://images.unsplash.com/photo-1659522761084-79196b64abe4?w=200&h=260&fit=crop&auto=format",match:89},{label:"Trench Coat",brand:"Mango",price:"$195",img:"https://images.unsplash.com/photo-1731589802397-6a1088d63630?w=200&h=260&fit=crop&auto=format",match:85},{label:"Power Suit",brand:"COS",price:"$280",img:"https://images.unsplash.com/photo-1629511565591-a1d494ad6c58?w=200&h=260&fit=crop&auto=format",match:82},{label:"Red Dress",brand:"Reformation",price:"$218",img:"https://images.unsplash.com/photo-1662532577856-e8ee8b138a8b?w=200&h=260&fit=crop&auto=format",match:79},{label:"Green Blazer",brand:"Arket",price:"$340",img:"https://images.unsplash.com/photo-1627292441194-0280c19e74e4?w=200&h=260&fit=crop&auto=format",match:76}];
  return (
    <div className="flex flex-col h-full" style={{background:T.ivory}}><Notch/><StatusBar/><Toast msg="Added to wishlist ✦" visible={toast}/>
      <div className="flex-1 overflow-y-auto scroll-hide pt-14 pb-28">
        <div className="px-6 pt-4 pb-3"><h2 className="font-serif text-2xl mb-4" style={{color:T.charcoal}}>Discover</h2>
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{background:"#fff",border:`1px solid ${T.border}`,boxShadow:T.shadow}}>
            {I.search()}<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search styles, brands, occasions…" className="flex-1 text-sm bg-transparent outline-none" style={{color:T.charcoal}}/>
            {query&&<button onClick={()=>setQuery("")} style={{color:T.muted}}>{I.x()}</button>}
          </div>
        </div>
        <div className="flex gap-2 px-6 mb-4 overflow-x-auto scroll-hide">{filters.map(f=><Chip key={f} label={f} active={filter===f} onPress={()=>{setFilter(f);setLoading(true);setTimeout(()=>setLoading(false),700);}}/>)}</div>
        <div className="mx-6 mb-4 px-4 py-3 rounded-2xl flex items-center gap-3" style={{background:T.goldPale,border:`1px solid rgba(201,168,76,0.22)`}}>{I.sparkle()}<p className="text-xs" style={{color:T.charcoal}}><strong>Trending:</strong> <span style={{color:T.gold}}>Linen blazers +47% this week</span></p></div>
        <div className="grid grid-cols-2 gap-3 px-6">{loading?[1,2,3,4,5,6].map(i=><SkeletonCard key={i} h={230}/>):items.map(item=>(
          <button key={item.label} onClick={()=>onNav("product")} className="haptic rounded-2xl overflow-hidden text-left" style={{boxShadow:T.shadow}}>
            <div className="relative" style={{height:190}}>
              <img src={item.img} alt={item.label} className="w-full h-full object-cover"/>
              <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(28,28,30,0.68),transparent 55%)"}}/>
              <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold" style={{background:"rgba(201,168,76,0.9)",color:T.ivory}}>AR</div>
              <button onClick={e=>{e.stopPropagation();setToast(true);setTimeout(()=>setToast(false),2000);}} className="haptic absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center" style={{background:"rgba(0,0,0,0.4)"}}><span style={{color:T.ivory,fontSize:13}}>♡</span></button>
              <div className="absolute bottom-2 left-2 right-2"><p className="text-xs font-semibold" style={{color:T.ivory}}>{item.label}</p><div className="flex justify-between mt-0.5"><p className="text-xs" style={{color:"rgba(250,248,244,0.6)"}}>{item.brand}</p><p className="text-xs font-bold" style={{color:T.goldLight}}>{item.price}</p></div></div>
            </div>
            <div className="px-3 py-2 flex justify-between" style={{background:"#fff"}}><div className="flex items-center gap-1">{I.sparkle(T.gold,10)}<span className="text-xs" style={{color:T.gold}}>{item.match}%</span></div><button onClick={e=>{e.stopPropagation();onNav("ar-mirror");}} className="haptic text-xs font-bold px-2 py-1 rounded-lg" style={{background:T.goldPale,color:T.gold}}>Try AR</button></div>
          </button>
        ))}</div>
      </div>
      <BottomNav current="discover" onNav={onNav}/>
    </div>
  );
}

function ProductScreen({onNav}:{onNav:(s:Screen)=>void}) {
  const [selSize,setSelSize]=useState("S"); const [selColor,setSelColor]=useState(0); const [tab,setTab]=useState("Details");
  const [wishlisted,setWishlisted]=useState(false); const [alertSet,setAlertSet]=useState(false); const [toast,setToast]=useState(false);
  const colors=["#C9A84C","#1C1C1E","#8B7355","#E8D49A","#7A9E87"];
  const imgs=["https://images.unsplash.com/photo-1612731486606-2614b4d74921?w=390&h=400&fit=crop&auto=format","https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?w=390&h=400&fit=crop&auto=format","https://images.unsplash.com/photo-1629511565591-a1d494ad6c58?w=390&h=400&fit=crop&auto=format"];
  const [imgIdx,setImgIdx]=useState(0);
  const addCart=()=>{setToast(true);setTimeout(()=>{setToast(false);onNav("cart");},1300);};
  return (
    <div className="flex flex-col h-full" style={{background:T.ivory}}><Notch/><StatusBar/><Toast msg={`Size ${selSize} added to cart ✦`} visible={toast}/>
      <div className="flex-1 overflow-y-auto scroll-hide pt-14 pb-24">
        <div className="relative" style={{height:380}}>
          <img src={imgs[imgIdx]} alt="Product" className="w-full h-full object-cover"/>
          <div className="absolute top-14 left-5 right-5 flex justify-between"><BackBtn onPress={()=>onNav("discover")}/><button onClick={()=>setWishlisted(!wishlisted)} className="haptic w-10 h-10 rounded-full flex items-center justify-center" style={{background:"#fff",border:`1px solid ${T.border}`}}><span style={{color:wishlisted?T.gold:T.muted,fontSize:18}}>{wishlisted?"♥":"♡"}</span></button></div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">{imgs.map((_,i)=><button key={i} onClick={()=>setImgIdx(i)} className="rounded-full transition-all" style={{width:i===imgIdx?20:6,height:6,background:i===imgIdx?T.gold:"rgba(255,255,255,0.6)"}}/>)}</div>
          <button onClick={()=>onNav("ar-mirror")} className="haptic absolute bottom-4 right-4 flex items-center gap-1.5 px-4 py-2 rounded-full" style={{background:"rgba(0,0,0,0.65)",backdropFilter:"blur(8px)"}}><span style={{color:T.gold,fontSize:11,fontWeight:700}}>✦ AR TRY-ON</span></button>
        </div>
        <div className="px-6 pt-4">
          <div className="flex items-start justify-between mb-1">
            <div><div className="flex items-center gap-2"><p className="text-xs font-bold" style={{color:T.gold,letterSpacing:"0.1em"}}>ZARA</p><span className="text-xs px-2 py-0.5 rounded-full" style={{background:T.goldPale,color:T.gold,fontWeight:700}}>Official</span></div><h2 className="font-serif text-2xl mt-0.5" style={{color:T.charcoal}}>Linen Tailored Blazer</h2></div>
            <div className="text-right"><p className="font-serif text-2xl" style={{color:T.charcoal}}>$89.99</p><p className="text-xs line-through" style={{color:T.muted}}>$129.00</p></div>
          </div>
          <div className="flex items-center gap-2 mb-3"><div className="flex gap-0.5">{[1,2,3,4,5].map(s=><span key={s}>{I.star(s<=4)}</span>)}</div><span className="text-xs" style={{color:T.muted}}>4.2 (218)</span><button onClick={()=>onNav("retailers")} className="haptic text-xs font-bold ml-auto" style={{color:T.gold}}>5 retailers →</button></div>
          <button onClick={()=>setAlertSet(!alertSet)} className="haptic w-full flex items-center justify-between px-4 py-3 rounded-2xl mb-4" style={{background:alertSet?"rgba(122,158,135,0.1)":"rgba(212,117,106,0.08)",border:`1px solid ${alertSet?"rgba(122,158,135,0.25)":"rgba(212,117,106,0.2)"}`}}>
            <div className="flex items-center gap-2"><span style={{fontSize:16}}>🔔</span><div><p className="text-xs font-semibold" style={{color:alertSet?T.sage:T.rose}}>{alertSet?"Price alert set":"Set price drop alert"}</p><p style={{fontSize:10,color:T.muted}}>We'll notify you if it drops below $75</p></div></div>
            {alertSet&&<span style={{color:T.sage,fontSize:14}}>✓</span>}
          </button>
          <div className="mb-4"><p className="text-xs font-bold mb-2" style={{color:T.muted,letterSpacing:"0.06em"}}>COLOUR</p><div className="flex gap-3">{colors.map((c,i)=><button key={i} onClick={()=>setSelColor(i)} className="haptic rounded-full" style={{width:32,height:32,background:c,border:selColor===i?`3px solid ${T.gold}`:"3px solid transparent",boxShadow:selColor===i?`0 0 0 2px ${T.gold}`:"none"}}/>)}</div></div>
          <div className="mb-4"><div className="flex justify-between items-center mb-2"><p className="text-xs font-bold" style={{color:T.muted,letterSpacing:"0.06em"}}>SIZE</p><button className="haptic text-xs font-bold" style={{color:T.gold}}>Size guide</button></div><div className="flex gap-2">{["XS","S","M","L","XL"].map(sz=><button key={sz} onClick={()=>setSelSize(sz)} className="haptic flex-1 py-3 rounded-2xl text-sm font-bold" style={{background:selSize===sz?T.charcoal:"#fff",color:selSize===sz?T.goldLight:T.charcoal,border:`1px solid ${T.border}`}}>{sz}</button>)}</div></div>
          <div className="mb-4"><SegControl options={["Details","Fit","Reviews"]} active={tab} onChange={setTab}/></div>
          {tab==="Details"&&<div className="fade-up"><p className="text-sm leading-relaxed mb-3" style={{color:T.muted}}>Crafted from 100% linen with a relaxed yet tailored silhouette. Features notched lapels and a single-button closure.</p><div className="grid grid-cols-2 gap-2">{[["Material","100% Linen"],["Fit","Relaxed Tailored"],["Length","Hip"],["Care","Dry clean"]].map(([k,v])=><div key={k} className="p-3 rounded-xl" style={{background:T.ivoryDark}}><p className="text-xs" style={{color:T.muted}}>{k}</p><p className="text-xs font-semibold mt-0.5" style={{color:T.charcoal}}>{v}</p></div>)}</div></div>}
          {tab==="Fit"&&<div className="fade-up"><div className="p-4 rounded-2xl mb-3" style={{background:T.goldPale,border:`1px solid rgba(201,168,76,0.25)`}}><div className="flex items-center gap-2 mb-2">{I.sparkle()}<p className="text-xs font-bold" style={{color:T.gold}}>AI FIT</p></div><p className="text-sm" style={{color:T.charcoal}}>Size <strong>S</strong> — shoulder seams align perfectly.</p></div></div>}
          {tab==="Reviews"&&<div className="fade-up">{[{name:"Priya M.",r:5,t:"Incredible fit. The linen drapes beautifully."},{name:"Aiko T.",r:4,t:"Love the cut. Slightly longer than expected."}].map(rv=><div key={rv.name} className="mb-3 p-4 rounded-2xl" style={{background:"#fff",border:`1px solid ${T.border}`}}><div className="flex justify-between mb-1"><p className="text-sm font-semibold" style={{color:T.charcoal}}>{rv.name}</p><div className="flex gap-0.5">{[1,2,3,4,5].map(s=><span key={s}>{I.star(s<=rv.r)}</span>)}</div></div><p className="text-xs" style={{color:T.muted}}>{rv.t}</p></div>)}</div>}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-6 py-4" style={{background:"rgba(250,248,244,0.97)",backdropFilter:"blur(12px)",borderTop:`1px solid ${T.border}`}}>
        <div className="flex gap-3"><Btn label="Try On" variant="secondary" onPress={()=>onNav("ar-mirror")}/><Btn label="Add to Cart" onPress={addCart}/></div>
      </div>
    </div>
  );
}

function RetailersScreen({onNav}:{onNav:(s:Screen)=>void}) {
  const retailers=[{name:"Zara.com",price:"$89.99",delivery:"Free · 2–4 days",stock:"In stock",rating:4.5,official:true,badge:"Best Price"},{name:"ASOS",price:"$92",delivery:"Free · 1–3 days",stock:"3 left",rating:4.2,official:false,badge:"Fastest"},{name:"Nordstrom",price:"$89.99",delivery:"$8 · 3–5 days",stock:"In stock",rating:4.6,official:false,badge:null},{name:"Farfetch",price:"$99",delivery:"Free · 5–7 days",stock:"In stock",rating:4.0,official:false,badge:null},{name:"Net-a-Porter",price:"$105",delivery:"Free · 1–2 days",stock:"Limited",rating:4.8,official:false,badge:"Premium"}];
  return (
    <div className="flex flex-col h-full" style={{background:T.ivory}}><Notch/><StatusBar/>
      <div className="flex-1 overflow-y-auto scroll-hide pt-14 pb-6">
        <div className="px-6 pt-4 flex items-center gap-3 mb-4"><BackBtn onPress={()=>onNav("product")}/><h2 className="font-serif text-xl" style={{color:T.charcoal}}>Where to Buy</h2></div>
        <div className="mx-6 mb-4 p-4 rounded-2xl" style={{background:darkGrad}}><div className="flex items-center gap-2 mb-1">{I.sparkle(T.gold,12)}<span className="text-xs font-bold" style={{color:T.gold,letterSpacing:"0.08em"}}>AGENT PICK</span></div><p className="text-sm" style={{color:"rgba(250,248,244,0.85)"}}>Best deal: <strong style={{color:T.goldLight}}>Zara.com</strong> — official, free returns, ships in 2 days.</p></div>
        <div className="px-6 mb-3"><SegControl options={["Best Price","Fastest","Trusted"]} active="Best Price" onChange={()=>{}}/></div>
        <div className="px-6 flex flex-col gap-3">{retailers.map((r,i)=>(
          <button key={r.name} onClick={()=>onNav("cart")} className="haptic flex items-center gap-3 p-4 rounded-2xl text-left" style={{background:"#fff",border:i===0?`1.5px solid ${T.gold}`:`1px solid ${T.border}`,boxShadow:i===0?T.shadowMd:T.shadow}}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:T.ivoryDark}}><span style={{fontWeight:800,fontSize:10,color:T.charcoal}}>{r.name.slice(0,4).toUpperCase()}</span></div>
            <div className="flex-1"><div className="flex items-center gap-2"><p className="text-sm font-semibold" style={{color:T.charcoal}}>{r.name}</p>{r.official&&<span className="text-xs px-2 py-0.5 rounded-full" style={{background:T.goldPale,color:T.gold,fontWeight:700}}>Official</span>}{r.badge&&<span className="text-xs px-2 py-0.5 rounded-full" style={{background:"rgba(122,158,135,0.15)",color:T.sage,fontWeight:700}}>{r.badge}</span>}</div><p className="text-xs" style={{color:T.muted}}>{r.delivery}</p><div className="flex items-center gap-1 mt-0.5">{I.star(true)}<span className="text-xs" style={{color:T.muted}}>{r.rating}</span><span className="text-xs ml-2 font-semibold" style={{color:r.stock.includes("3")?T.rose:T.sage}}>{r.stock}</span></div></div>
            <div className="text-right"><p className="font-serif text-lg" style={{color:T.charcoal}}>{r.price}</p><p className="text-xs font-bold" style={{color:T.gold}}>Shop →</p></div>
          </button>
        ))}</div>
      </div>
    </div>
  );
}

function LookBuilderScreen({onNav}:{onNav:(s:Screen)=>void}) {
  const [prompt,setPrompt]=useState("Effortless Parisian chic for a gallery opening");
  const [gen,setGen]=useState(true); const [generating,setGenerating]=useState(false);
  const generate=()=>{setGenerating(true);setGen(false);setTimeout(()=>{setGenerating(false);setGen(true);},2000);};
  const pieces=[{label:"Camel Blazer",brand:"Zara",price:"$89",img:"https://images.unsplash.com/photo-1612731486606-2614b4d74921?w=120&h=120&fit=crop&auto=format"},{label:"Wide-Leg Trousers",brand:"COS",price:"$95",img:"https://images.unsplash.com/photo-1629511565591-a1d494ad6c58?w=120&h=120&fit=crop&auto=format"},{label:"Silk Blouse",brand:"& Other Stories",price:"$75",img:"https://images.unsplash.com/photo-1659522761084-79196b64abe4?w=120&h=120&fit=crop&auto=format"},{label:"Leather Mules",brand:"Mango",price:"$120",img:"https://images.unsplash.com/photo-1662532577856-e8ee8b138a8b?w=120&h=120&fit=crop&auto=format"}];
  return (
    <div className="flex flex-col h-full" style={{background:T.ivory}}><Notch/><StatusBar/>
      <div className="flex-1 overflow-y-auto scroll-hide pt-14 pb-28">
        <div className="px-6 pt-4"><p className="text-xs font-bold" style={{color:T.gold,letterSpacing:"0.1em"}}>AI LOOK BUILDER</p><h2 className="font-serif text-2xl mt-1" style={{color:T.charcoal}}>Build your look</h2></div>
        <div className="mx-6 mt-4 rounded-2xl overflow-hidden" style={{border:`1px solid ${T.border}`,background:"#fff",boxShadow:T.shadow}}>
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">{I.sparkle()}<span className="text-xs font-bold" style={{color:T.gold}}>Describe your look</span></div>
          <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} className="w-full px-4 pb-2 text-sm bg-transparent outline-none resize-none" style={{color:T.charcoal,minHeight:60}}/>
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto scroll-hide">{["Make it cheaper","Add red accessories","More casual","Warmer palette","Office-ready","Evening twist"].map(c=><Chip key={c} label={c} onPress={()=>setPrompt(c)}/>)}</div>
        </div>
        <div className="px-6 mt-3">
          <button onClick={generate} className="haptic w-full py-4 rounded-2xl text-sm font-bold" style={{background:generating?"rgba(201,168,76,0.3)":goldGrad,color:T.ivory}}>
            {generating?<span className="flex items-center justify-center gap-2"><span className="spin-fast inline-block w-4 h-4 rounded-full" style={{border:"2px solid rgba(250,248,244,0.3)",borderTopColor:T.ivory}}/>Generating…</span>:"✦ Generate Look with AI"}
          </button>
        </div>
        {gen&&!generating&&<div className="fade-up">
          <div className="mx-6 mt-5 rounded-3xl overflow-hidden" style={{boxShadow:T.shadowMd}}><img src="https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?w=360&h=220&fit=crop&auto=format" alt="Generated look" className="w-full object-cover" style={{height:200}}/><div className="p-4" style={{background:T.charcoal}}><div className="flex items-center gap-2 mb-1">{I.sparkle()}<span className="text-xs font-bold" style={{color:T.gold,letterSpacing:"0.08em"}}>AI CURATED</span></div><p className="font-serif text-base" style={{color:T.ivory}}>"Effortless Parisian Chic"</p><p className="text-xs mt-1" style={{color:"rgba(250,248,244,0.45)"}}>4 pieces · Total $379</p></div></div>
          <div className="px-6 mt-5">{pieces.map(p=><div key={p.label} className="flex items-center gap-3 p-3 rounded-2xl mb-2" style={{background:"#fff",border:`1px solid ${T.border}`,boxShadow:T.shadow}}><img src={p.img} alt={p.label} className="rounded-xl object-cover" style={{width:52,height:52}}/><div className="flex-1"><p className="text-sm font-medium" style={{color:T.charcoal}}>{p.label}</p><p className="text-xs" style={{color:T.muted}}>{p.brand}</p></div><div className="flex flex-col items-end gap-1"><p className="text-sm font-semibold" style={{color:T.charcoal}}>{p.price}</p><button className="haptic text-xs font-bold" style={{color:T.gold}}>Swap</button></div></div>)}
          <div className="mt-4 p-4 rounded-2xl" style={{background:T.charcoal}}><div className="flex justify-between mb-3"><p className="text-sm" style={{color:"rgba(250,248,244,0.55)"}}>Total</p><p className="font-serif text-xl" style={{color:T.goldLight}}>$379</p></div><Btn label="Compare & Shop →" onPress={()=>onNav("compare")}/></div></div>
        </div>}
      </div>
      <BottomNav current="lookbuilder" onNav={onNav}/>
    </div>
  );
}

function CompareScreen({onNav}:{onNav:(s:Screen)=>void}) {
  const [sel,setSel]=useState<number|null>(null);
  const looks=[{label:"Parisian Chic",price:"$379",fit:94,img:"https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?w=200&h=300&fit=crop&auto=format",tags:["Gallery","Evening"]},{label:"Street Luxe",price:"$285",fit:87,img:"https://images.unsplash.com/photo-1731589802397-6a1088d63630?w=200&h=300&fit=crop&auto=format",tags:["Casual","Day"]},{label:"Power Suit",price:"$460",fit:91,img:"https://images.unsplash.com/photo-1629511565591-a1d494ad6c58?w=200&h=300&fit=crop&auto=format",tags:["Work","Formal"]}];
  return (
    <div className="flex flex-col h-full" style={{background:T.ivory}}><Notch/><StatusBar/>
      <div className="flex-1 overflow-y-auto scroll-hide pt-14 pb-28">
        <div className="px-6 pt-4 mb-4"><p className="text-xs font-bold" style={{color:T.gold,letterSpacing:"0.1em"}}>COMPARE</p><h2 className="font-serif text-2xl mt-0.5" style={{color:T.charcoal}}>Which vibe speaks?</h2></div>
        <div className="flex gap-3 px-6 overflow-x-auto scroll-hide pb-2">{looks.map((look,i)=>(
          <button key={look.label} onClick={()=>setSel(i)} className="haptic flex-shrink-0 rounded-3xl overflow-hidden" style={{width:178,border:sel===i?`2px solid ${T.gold}`:"2px solid transparent",boxShadow:sel===i?T.shadowMd:T.shadow,transform:sel===i?"scale(1.02)":"scale(1)"}}>
            <div className="relative" style={{height:255}}><img src={look.img} alt={look.label} className="w-full h-full object-cover"/><div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(28,28,30,0.78),transparent 55%)"}}/>
              {sel===i&&<div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center" style={{background:T.gold}}>{I.check(T.ivory)}</div>}
              <div className="absolute bottom-3 left-3 right-3"><p className="text-sm font-semibold" style={{color:T.ivory}}>{look.label}</p><p className="text-xs" style={{color:"rgba(250,248,244,0.6)"}}>{look.price}</p><div className="flex items-center gap-1 mt-1"><div className="flex-1 rounded-full" style={{height:3,background:"rgba(255,255,255,0.2)"}}><div className="rounded-full" style={{width:`${look.fit}%`,height:3,background:T.gold}}/></div><span className="text-xs" style={{color:T.goldLight}}>{look.fit}%</span></div></div>
            </div>
            <div className="px-3 py-2 flex gap-1 flex-wrap" style={{background:"#fff"}}>{look.tags.map(tag=><span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{background:T.ivoryDark,color:T.charcoalMid}}>{tag}</span>)}</div>
          </button>
        ))}</div>
        <div className="mx-6 mt-5 rounded-2xl overflow-hidden" style={{border:`1px solid ${T.border}`,background:"#fff"}}>
          <div className="px-4 py-3" style={{borderBottom:`1px solid ${T.border}`}}><p className="text-sm font-semibold" style={{color:T.charcoal}}>AI Breakdown</p></div>
          {[["Match",["94%","87%","91%"]],["Budget",["On budget","Saves $94","$81 over"]],["Occasion",["Gallery","Daily","Office"]],["Trend",["↑ High","↑ Very","→ Stable"]]].map(([label,vals])=>(
            <div key={label as string} className="grid px-4 py-3" style={{gridTemplateColumns:"70px 1fr 1fr 1fr",borderBottom:`1px solid ${T.border}`}}>
              <p className="text-xs" style={{color:T.muted}}>{label as string}</p>
              {(vals as string[]).map((v,i)=><p key={i} className="text-xs text-center font-bold" style={{color:sel===i?T.gold:T.charcoal}}>{v}</p>)}
            </div>
          ))}
        </div>
        <div className="px-6 mt-5">
          <button onClick={()=>onNav("cart")} className="haptic w-full py-4 rounded-2xl text-sm font-bold" style={{background:sel!==null?goldGrad:"rgba(107,107,112,0.1)",color:sel!==null?T.ivory:T.muted}}>
            {sel!==null?`Shop "${looks[sel].label}" →`:"Select a look to continue"}
          </button>
        </div>
      </div>
      <BottomNav current="lookbuilder" onNav={onNav}/>
    </div>
  );
}

function CartScreen({onNav}:{onNav:(s:Screen)=>void}) {
  const [items,setItems]=useState([{id:1,label:"Linen Tailored Blazer",brand:"Zara",size:"S",price:89.99,img:"https://images.unsplash.com/photo-1612731486606-2614b4d74921?w=120&h=120&fit=crop&auto=format"},{id:2,label:"Wide-Leg Trousers",brand:"COS",size:"S",price:95,img:"https://images.unsplash.com/photo-1629511565591-a1d494ad6c58?w=120&h=120&fit=crop&auto=format"},{id:3,label:"Leather Slingback",brand:"Mango",size:"38",price:119.99,img:"https://images.unsplash.com/photo-1662532577856-e8ee8b138a8b?w=120&h=120&fit=crop&auto=format"}]);
  const total=items.reduce((s,i)=>s+i.price,0);
  return (
    <div className="flex flex-col h-full" style={{background:T.ivory}}><Notch/><StatusBar/>
      <div className="flex-1 overflow-y-auto scroll-hide pt-14 pb-28">
        <div className="px-6 pt-4 flex items-center justify-between mb-4"><h2 className="font-serif text-2xl" style={{color:T.charcoal}}>Your Cart</h2><span className="text-xs font-bold px-3 py-1 rounded-full" style={{background:T.goldPale,color:T.gold}}>{items.length} items</span></div>
        <div className="mx-6 mb-4 rounded-2xl overflow-hidden" style={{background:darkGrad}}>
          <div className="px-4 pt-3 pb-2 flex items-center gap-2">{I.sparkle(T.gold,12)}<span className="text-xs font-bold" style={{color:T.gold,letterSpacing:"0.1em"}}>AGENTIC SHOPPING</span></div>
          <div className="flex gap-2 px-4 pb-2 overflow-x-auto scroll-hide">{["Make it cheaper","Add red accessories","Find in my size","Ship by Friday"].map(c=><button key={c} className="haptic whitespace-nowrap text-xs px-3 py-1.5 rounded-full flex-shrink-0" style={{background:"rgba(201,168,76,0.15)",color:T.gold,border:"1px solid rgba(201,168,76,0.25)"}}>{c}</button>)}</div>
        </div>
        <div className="mx-6 mb-4 px-4 py-3 rounded-2xl flex items-start gap-3" style={{background:T.goldPale,border:`1px solid rgba(201,168,76,0.22)`}}>
          {I.sparkle()}<p className="text-xs leading-relaxed" style={{color:T.charcoal}}><strong>Agent:</strong> Save $24 by swapping the Mango mule for COS — free delivery, same style. <span style={{color:T.gold,fontWeight:700}}>Apply swap?</span></p>
        </div>
        <div className="px-6 flex flex-col gap-3">
          {items.map(item=>(
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl" style={{background:"#fff",border:`1px solid ${T.border}`,boxShadow:T.shadow}}>
              <img src={item.img} alt={item.label} className="rounded-xl object-cover" style={{width:60,height:60}}/>
              <div className="flex-1"><p className="text-sm font-medium" style={{color:T.charcoal}}>{item.label}</p><p className="text-xs" style={{color:T.muted}}>{item.brand} · Size {item.size}</p><button onClick={()=>onNav("ar-mirror")} className="haptic text-xs mt-1 font-bold" style={{color:T.gold}}>Try On →</button></div>
              <div className="flex flex-col items-end gap-2"><p className="text-sm font-semibold" style={{color:T.charcoal}}>${item.price.toFixed(2)}</p><button onClick={()=>setItems(items.filter(i=>i.id!==item.id))} style={{color:T.muted}}>{I.x()}</button></div>
            </div>
          ))}
          <div className="p-4 rounded-2xl" style={{background:"#fff",border:`1px solid ${T.border}`}}>
            {[["Subtotal",`$${total.toFixed(2)}`],["Delivery","Free"],["AI Styling","Waived ✦"]].map(([l,v])=>(
              <div key={l} className="flex justify-between mb-2"><p className="text-xs" style={{color:T.muted}}>{l}</p><p className="text-xs font-semibold" style={{color:l!=="Subtotal"?T.sage:T.charcoal}}>{v}</p>
            ))}
            <div className="my-2" style={{borderTop:`1px solid ${T.border}`}}/>
            <div className="flex justify-between"><p className="text-sm font-semibold" style={{color:T.charcoal}}>Total</p><p className="font-serif text-lg gold-text">${total.toFixed(2)}</p></div>
          </div>
          <Btn label={`Checkout · $${total.toFixed(2)}`} onPress={()=>onNav("checkout")} size="lg"/>
        </div>
      </div>
      <BottomNav current="cart" onNav={onNav}/>
    </div>
  );
}

function CheckoutScreen({onNav}:{onNav:(s:Screen)=>void}) {
  const [step,setStep]=useState(0); const [proc,setProc]=useState(false);
  const place=()=>{setProc(true);setTimeout(()=>{setProc(false);onNav("confirmation");},2200);};
  return (
    <div className="flex flex-col h-full" style={{background:T.ivory}}><Notch/><StatusBar/>
      <div className="flex-1 overflow-y-auto scroll-hide pt-14 pb-24">
        <div className="px-6 pt-4 flex items-center gap-4 mb-6"><BackBtn onPress={()=>step>0?setStep(step-1):onNav("cart")}/>
          <div className="flex-1"><p className="font-serif text-xl" style={{color:T.charcoal}}>Checkout</p>
            <div className="flex gap-2 mt-2">{["Delivery","Payment","Review"].map((s,i)=>(
              <div key={s} className="flex items-center gap-1.5"><div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{background:i<=step?T.gold:T.ivoryDark,color:i<=step?T.ivory:T.muted}}>{i<step?"✓":i+1}</div><span className="text-xs" style={{color:i===step?T.charcoal:T.muted,fontWeight:i===step?600:400}}>{s}</span>{i<2&&<div className="w-5" style={{height:1,background:i<step?T.gold:T.ivoryDark}}/>}</div>
            ))}</div>
          </div>
        </div>
        {step===0&&<div className="fade-up px-6">
          <p className="text-xs font-bold mb-4" style={{color:T.muted,letterSpacing:"0.08em"}}>DELIVERY ADDRESS</p>
          {[["Full Name","Zara Malik"],["Street","14 Rue du Faubourg St-Honoré"],["City","Paris"],["Postcode","75008"]].map(([l,v])=>(
            <div key={l} className="mb-3"><p className="text-xs mb-1" style={{color:T.muted}}>{l}</p><div className="px-4 py-3 rounded-2xl" style={{background:"#fff",border:`1px solid ${T.border}`}}><p className="text-sm" style={{color:T.charcoal}}>{v}</p></div></div>
          ))}
          <div className="mt-3 mb-5">{[["Free delivery","2–4 days","$0"],["Express","Next day","$9.95"]].map(([n,s,p])=>(
            <div key={n} className="flex items-center justify-between p-3 rounded-2xl mb-2" style={{background:n==="Free delivery"?T.goldPale:"#fff",border:`1px solid ${n==="Free delivery"?"rgba(201,168,76,0.3)":T.border}`}}>
              <div><p className="text-sm font-semibold" style={{color:T.charcoal}}>{n}</p><p className="text-xs" style={{color:T.muted}}>{s}</p></div>
              <p className="text-sm font-semibold" style={{color:n==="Free delivery"?T.sage:T.charcoal}}>{p}</p>
            </div>
          ))}</div>
          <Btn label="Continue to Payment →" onPress={()=>setStep(1)} size="lg"/>
        </div>}
        {step===1&&<div className="fade-up px-6">
          <div className="p-5 rounded-2xl mb-4" style={{background:darkGrad}}><div className="flex justify-between mb-6"><span className="font-serif text-sm" style={{color:"rgba(250,248,244,0.6)"}}>•••• •••• •••• 4242</span><span className="text-xs font-bold" style={{color:T.goldLight}}>VISA</span></div><div className="flex justify-between"><span className="text-xs" style={{color:"rgba(250,248,244,0.4)"}}>ZARA MALIK</span><span className="text-xs" style={{color:"rgba(250,248,244,0.4)"}}>12/27</span></div></div>
          <div className="flex gap-3 mb-4">{["Apple Pay","Google Pay"].map(m=><button key={m} className="haptic flex-1 py-3 rounded-2xl text-sm font-semibold" style={{background:"#fff",border:`1px solid ${T.border}`,color:T.charcoal}}>{m==="Apple Pay"?"🍎 ":"G "}{m}</button>)}</div>
          <div className="mb-4 p-3 rounded-2xl flex items-center gap-3" style={{background:T.ivoryDark}}><span style={{fontSize:16}}>🎟</span><input placeholder="Promo code…" className="flex-1 text-sm bg-transparent outline-none" style={{color:T.charcoal}}/><button className="haptic text-xs font-bold px-3 py-1.5 rounded-lg" style={{background:T.gold,color:T.ivory}}>Apply</button></div>
          <Btn label="Review Order →" onPress={()=>setStep(2)} size="lg"/>
        </div>}
        {step===2&&<div className="fade-up px-6">
          <p className="text-xs font-bold mb-4" style={{color:T.muted,letterSpacing:"0.08em"}}>ORDER REVIEW</p>
          {[{l:"Linen Blazer",p:"$89.99",img:"https://images.unsplash.com/photo-1612731486606-2614b4d74921?w=80&h=80&fit=crop&auto=format"},{l:"Wide-Leg Trousers",p:"$95.00",img:"https://images.unsplash.com/photo-1629511565591-a1d494ad6c58?w=80&h=80&fit=crop&auto=format"}].map(item=>(
            <div key={item.l} className="flex gap-3 mb-3 p-3 rounded-2xl" style={{background:"#fff",border:`1px solid ${T.border}`}}><img src={item.img} alt={item.l} className="rounded-xl object-cover" style={{width:52,height:52}}/><div className="flex-1"><p className="text-sm font-medium" style={{color:T.charcoal}}>{item.l}</p></div><p className="text-sm font-semibold" style={{color:T.charcoal}}>{item.p}</p></div>
          ))}
          <div className="p-4 rounded-2xl mb-5" style={{background:T.ivoryDark}}>{[["Delivery","14 Rue du Faubourg"],["Payment","Visa •••• 4242"],["Total","$304.98"]].map(([k,v])=><div key={k} className="flex justify-between mb-2"><p className="text-xs" style={{color:T.muted}}>{k}</p><p className="text-xs font-bold" style={{color:k==="Total"?T.gold:T.charcoal}}>{v}</p></div>)}</div>
          {proc?<button className="haptic w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2" style={{background:goldGrad,color:T.ivory}}><span className="spin-fast inline-block w-4 h-4 rounded-full" style={{border:"2px solid rgba(250,248,244,0.3)",borderTopColor:T.ivory}}/>Processing…</button>:<Btn label="Place Order · $304.98" onPress={place} size="lg"/>}
        </div>}
      </div>
    </div>
  );
}

function ConfirmationScreen({onNav}:{onNav:(s:Screen)=>void}) {
  return (
    <div className="flex flex-col h-full items-center justify-center px-8" style={{background:T.ivory}}><Notch/>
      <div className="relative mb-8">
        <div className="success-ring w-28 h-28 rounded-full flex items-center justify-center" style={{background:"rgba(122,158,135,0.1)",border:`2px solid ${T.sage}`}}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={T.sage} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" className="check-draw"/></svg>
        </div>
        {[["-22px","-12px"],["-30px","28px"],["-8px","50px"],["20px","-24px"],["32px","38px"]].map(([x,y],i)=>(<div key={i} className="absolute float" style={{top:`calc(50% + ${y})`,left:`calc(50% + ${x})`,width:8,height:8,background:T.gold,borderRadius:"50%",animationDelay:`${i*0.3}s`,opacity:.65}}/>))}
      </div>
      <p className="font-serif text-3xl text-center mb-2" style={{color:T.charcoal}}>Order Confirmed!</p>
      <p className="text-sm text-center mb-1" style={{color:T.muted}}>Your look is on its way, Zara.</p>
      <p className="text-xs font-bold mb-8" style={{color:T.gold}}>ORDER #MC-2024-8847</p>
      <div className="w-full p-5 rounded-2xl mb-6" style={{background:"#fff",border:`1px solid ${T.border}`,boxShadow:T.shadow}}>
        {[["Estimated delivery","Thursday, 29 Aug"],["Carrier","Chronopost Express"],["Track","Tap below →"]].map(([k,v])=><div key={k} className="flex justify-between mb-3 last:mb-0"><p className="text-xs" style={{color:T.muted}}>{k}</p><p className="text-xs font-semibold" style={{color:T.charcoal}}>{v}</p></div>)}
      </div>
      <div className="w-full flex flex-col gap-3"><Btn label="Track My Order" onPress={()=>onNav("tracking")} size="lg"/><Btn label="Share Your Look" variant="secondary" onPress={()=>onNav("social")}/><Btn label="Continue Shopping" variant="ghost" onPress={()=>onNav("home")}/></div>
    </div>
  );
}

function TrackingScreen({onNav}:{onNav:(s:Screen)=>void}) {
  const steps=[{label:"Order Placed",time:"Today, 09:41",done:true},{label:"Payment Confirmed",time:"Today, 09:42",done:true},{label:"Preparing Order",time:"Today, 11:00",done:true},{label:"Out for Delivery",time:"Thu 29 Aug",done:false},{label:"Delivered",time:"Thu 29 Aug",done:false}];
  return (
    <div className="flex flex-col h-full" style={{background:T.ivory}}><Notch/><StatusBar/>
      <div className="flex-1 overflow-y-auto scroll-hide pt-14 pb-8">
        <div className="px-6 pt-4 flex items-center gap-3 mb-5"><BackBtn onPress={()=>onNav("confirmation")}/><h2 className="font-serif text-xl" style={{color:T.charcoal}}>Track Order</h2></div>
        <div className="mx-6 mb-5 rounded-3xl overflow-hidden relative" style={{height:190,background:"#E8E4DB"}}><img src="https://images.unsplash.com/photo-1580250729659-e5cb6c5c110d?w=360&h=190&fit=crop&auto=format" alt="" className="w-full h-full object-cover opacity-25"/><div className="absolute inset-0 flex items-center justify-center"><div className="flex flex-col items-center"><div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 pulse-gold" style={{background:T.goldPale,border:`2px solid ${T.gold}`}}><span style={{fontSize:22}}>📦</span></div><p className="text-xs font-semibold" style={{color:T.charcoal}}>En Route · Est. 14:30</p></div></div></div>
        <div className="px-6 mb-5 p-4 rounded-2xl flex items-center justify-between" style={{background:T.goldPale,border:`1px solid rgba(201,168,76,0.25)`}}><div><p className="text-xs" style={{color:T.muted}}>Reference</p><p className="text-sm font-bold" style={{color:T.charcoal}}>MC-2024-8847</p></div><button className="haptic text-xs font-bold px-3 py-1.5 rounded-xl" style={{background:T.gold,color:T.ivory}}>Copy</button></div>
        <div className="px-6">{steps.map((s,i)=>(
          <div key={s.label} className="flex gap-4 mb-4">
            <div className="flex flex-col items-center"><div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{background:s.done?T.gold:T.ivoryDark,border:s.done?"none":`1.5px solid ${T.border}`}}>{s.done?I.check(T.ivory):<div className="w-2 h-2 rounded-full" style={{background:i===steps.findIndex(ts=>!ts.done)?T.gold:T.border}}/>}</div>{i<steps.length-1&&<div className="w-0.5 flex-1 mt-1" style={{minHeight:24,background:i<steps.findIndex(ts=>!ts.done)?T.gold:T.ivoryDark}}/>}</div>
            <div className="pb-4"><p className="text-sm font-semibold" style={{color:s.done?T.charcoal:T.muted}}>{s.label}</p><p className="text-xs" style={{color:T.muted}}>{s.time}</p></div>
          </div>
        ))}</div>
      </div>
    </div>
  );
}

function WardrobeScreen({onNav}:{onNav:(s:Screen)=>void}) {
  const [scanning,setScanning]=useState(false); const [scanned,setScanned]=useState(12); const [cat,setCat]=useState("All");
  const items=[{label:"White Oxford",cat:"Tops",img:"https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=120&h=120&fit=crop&auto=format",times:14},{label:"Black Trench",cat:"Outerwear",img:"https://images.unsplash.com/photo-1604882767135-b41fac508fff?w=120&h=120&fit=crop&auto=format",times:8},{label:"Cream Blazer",cat:"Tops",img:"https://images.unsplash.com/photo-1612731486606-2614b4d74921?w=120&h=120&fit=crop&auto=format",times:6},{label:"Linen Trousers",cat:"Bottoms",img:"https://images.unsplash.com/photo-1629511565591-a1d494ad6c58?w=120&h=120&fit=crop&auto=format",times:5},{label:"Slip Dress",cat:"Tops",img:"https://images.unsplash.com/photo-1659522761084-79196b64abe4?w=120&h=120&fit=crop&auto=format",times:3},{label:"Rack",cat:"Outerwear",img:"https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=120&h=120&fit=crop&auto=format",times:2}];
  const startScan=()=>{setScanning(true);let c=scanned;const iv=setInterval(()=>{c++;setScanned(c);if(c>=24){clearInterval(iv);setScanning(false);}},180);};
  return (
    <div className="flex flex-col h-full" style={{background:T.ivory}}><Notch/><StatusBar/>
      <div className="flex-1 overflow-y-auto scroll-hide pt-14 pb-28">
        <div className="px-6 pt-4 flex items-center gap-3 mb-4"><BackBtn onPress={()=>onNav("home")}/><h2 className="font-serif text-xl" style={{color:T.charcoal}}>My Wardrobe</h2></div>
        <div className="mx-6 mb-4 p-5 rounded-3xl relative overflow-hidden" style={{background:darkGrad,boxShadow:T.shadowMd}}>
          {scanning&&<div className="ar-scan" style={{background:`linear-gradient(90deg,transparent,${T.gold},transparent)`}}/>}
          <div className="flex items-center justify-between mb-3"><div><p className="text-xs font-bold" style={{color:T.gold,letterSpacing:"0.1em"}}>WARDROBE AI</p><p className="font-serif text-lg" style={{color:T.ivory}}>{scanned} items</p></div><div className={`w-16 h-16 rounded-full flex items-center justify-center ${scanning?"spin-slow":""}`} style={{border:"2px solid rgba(201,168,76,0.3)",borderTopColor:T.gold}}><span style={{color:T.gold,fontSize:22}}>⟳</span></div></div>
          <button onClick={startScan} disabled={scanning} className="haptic w-full py-2.5 rounded-xl text-sm font-bold" style={{background:scanning?"rgba(201,168,76,0.2)":T.gold,color:T.ivory}}>{scanning?"Scanning…":"Scan More Items"}</button>
        </div>
        <div className="flex gap-2 px-6 mb-4 overflow-x-auto scroll-hide">{["All","Tops","Bottoms","Outerwear","Shoes","Accessories"].map(c=><Chip key={c} label={c} active={cat===c} onPress={()=>setCat(c)}/>)}</div>
        <div className="grid grid-cols-3 gap-2 px-6">
          {items.filter(i=>cat==="All"||i.cat===cat).map(item=>(
            <div key={item.label} className="rounded-2xl overflow-hidden relative" style={{boxShadow:T.shadow}}>
              <img src={item.img} alt={item.label} className="w-full object-cover" style={{height:110}}/>
              <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(28,28,30,0.72),transparent 50%)"}}/>
              <div className="absolute bottom-2 left-2 right-2"><p style={{fontSize:9,fontWeight:700,color:T.ivory}}>{item.label}</p><p style={{fontSize:8,color:"rgba(250,248,244,0.55)"}}>×{item.times}</p></div>
              <button onClick={()=>onNav("ar-mirror")} className="haptic absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{background:"rgba(201,168,76,0.85)"}}><span style={{color:T.ivory,fontSize:9,fontWeight:800}}>AR</span></button>
            </div>
          ))}
          <button onClick={startScan} className="haptic rounded-2xl flex flex-col items-center justify-center gap-1" style={{height:110,border:"1.5px dashed rgba(201,168,76,0.4)",background:T.goldPale}}><span style={{color:T.gold,fontSize:24}}>+</span><span style={{fontSize:10,color:T.gold}}>Add</span></button>
        </div>
      </div>
      <BottomNav current="home" onNav={onNav}/>
    </div>
  );
}

function SavedScreen({onNav}:{onNav:(s:Screen)=>void}) {
  const [view,setView]=useState("Outfits");
  const saved=[{label:"Parisian Chic",img:"https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?w=200&h=260&fit=crop&auto=format",date:"Today"},{label:"Street Edit",img:"https://images.unsplash.com/photo-1731589802397-6a1088d63630?w=200&h=260&fit=crop&auto=format",date:"Yesterday"},{label:"Gallery Look",img:"https://images.unsplash.com/photo-1629511565591-a1d494ad6c58?w=200&h=260&fit=crop&auto=format",date:"2d ago"},{label:"Summer",img:"https://images.unsplash.com/photo-1659522761084-79196b64abe4?w=200&h=260&fit=crop&auto=format",date:"3d ago"},{label:"Power Suit",img:"https://images.unsplash.com/photo-1662532577856-e8ee8b138a8b?w=200&h=260&fit=crop&auto=format",date:"5d ago"},{label:"Casual",img:"https://images.unsplash.com/photo-1627292441194-0280c19e74e4?w=200&h=260&fit=crop&auto=format",date:"1w ago"}];
  return (
    <div className="flex flex-col h-full" style={{background:T.ivory}}><Notch/><StatusBar/>
      <div className="flex-1 overflow-y-auto scroll-hide pt-14 pb-28">
        <div className="px-6 pt-4 mb-4"><h2 className="font-serif text-2xl" style={{color:T.charcoal}}>Saved</h2></div>
        <div className="px-6 mb-4"><SegControl options={["Outfits","Items","Snapshots"]} active={view} onChange={setView}/></div>
        {view==="Snapshots"
          ?<div className="flex flex-col items-center py-16 px-8"><div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{background:T.ivoryDark}}><span style={{fontSize:36}}>📸</span></div><p className="font-serif text-xl text-center" style={{color:T.charcoal}}>No snapshots yet</p><p className="text-sm text-center mt-1 mb-6" style={{color:T.muted}}>Capture AR try-ons and they'll appear here.</p><Btn label="Open Camera" onPress={()=>onNav("camera")}/></div>
          :<div className="grid grid-cols-2 gap-3 px-6">{saved.map(item=>(<button key={item.label} onClick={()=>onNav("ar-mirror")} className="haptic rounded-2xl overflow-hidden relative" style={{boxShadow:T.shadow}}><div className="relative" style={{height:210}}><img src={item.img} alt={item.label} className="w-full h-full object-cover"/><div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(28,28,30,0.7),transparent 50%)"}}/>
            <button className="haptic absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{background:"rgba(201,168,76,0.9)"}}><span style={{color:T.ivory,fontSize:14}}>♥</span></button>
            <div className="absolute bottom-3 left-3"><p className="text-sm font-semibold" style={{color:T.ivory}}>{item.label}</p><p className="text-xs" style={{color:"rgba(250,248,244,0.6)"}}>{item.date}</p></div></div></button>))}</div>
        }
      </div>
      <BottomNav current="saved" onNav={onNav}/>
    </div>
  );
}

function ChatScreen({onNav}:{onNav:(s:Screen)=>void}) {
  const [input,setInput]=useState(""); const [typing,setTyping]=useState(false);
  const [msgs,setMsgs]=useState([{role:"ai",text:"Hi Zara! I'm your personal stylist. What are we working on today?"},{role:"user",text:"I need an outfit for a rooftop dinner tomorrow."},{role:"ai",text:"Rooftop dinner — beautiful! I'm thinking a silk slip dress layered with your camel blazer. Let me pull some options…"}]);
  const send=()=>{if(!input.trim())return;const m=input;setInput("");setMsgs(prev=>[...prev,{role:"user",text:m}]);setTyping(true);setTimeout(()=>{setMsgs(prev=>[...prev,{role:"ai",text:"Great choice! Also recommend block-heeled sandals for the terrace — want me to find some in your budget?"}]);setTyping(false);},1800);};
  return (
    <div className="flex flex-col h-full" style={{background:T.ivory}}><Notch/>
      <div className="pt-14 px-5 pb-3 flex items-center gap-3" style={{background:"#fff",borderBottom:`1px solid ${T.border}`}}>
        <BackBtn onPress={()=>onNav("home")}/>
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background:goldGrad}}><span style={{color:T.ivory,fontSize:18}}>✦</span></div>
        <div className="flex-1"><p className="text-sm font-semibold" style={{color:T.charcoal}}>AI Stylist</p><div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full" style={{background:T.sage}}/><p className="text-xs" style={{color:T.sage}}>Online</p></div></div>
      </div>
      <div className="flex-1 overflow-y-auto scroll-hide px-5 py-4 flex flex-col gap-3">
        {msgs.map((m,i)=>(
          <div key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"} items-end gap-2`}>
            {m.role==="ai"&&<div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-1" style={{background:goldGrad}}><span style={{color:T.ivory,fontSize:12}}>✦</span></div>}
            <div className="max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed fade-up"
              style={{background:m.role==="user"?T.charcoal:"#fff",color:m.role==="user"?T.ivory:T.charcoal,borderBottomRightRadius:m.role==="user"?4:20,borderBottomLeftRadius:m.role==="ai"?4:20,border:m.role==="ai"?`1px solid ${T.border}`:"none",boxShadow:T.shadow}}>
              {m.text}
            </div>
          </div>
        ))}
        {typing&&<div className="flex items-end gap-2"><div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{background:goldGrad}}><span style={{color:T.ivory,fontSize:12}}>✦</span></div><div className="px-4 py-3 rounded-2xl flex items-center gap-1.5" style={{background:"#fff",border:`1px solid ${T.border}`}}><div className="w-2 h-2 rounded-full dot-1" style={{background:T.muted}}/><div className="w-2 h-2 rounded-full dot-2" style={{background:T.muted}}/><div className="w-2 h-2 rounded-full dot-3" style={{background:T.muted}}/></div></div>}
        <button onClick={()=>onNav("ar-mirror")} className="haptic text-left px-4 py-3 rounded-2xl max-w-xs" style={{background:T.goldPale,border:`1px solid rgba(201,168,76,0.25)`}}>
          <p className="text-xs font-bold mb-1" style={{color:T.gold}}>✦ TRY IT ON</p><p className="text-xs" style={{color:T.charcoal}}>Silk Slip Dress + Camel Blazer — tap to try in AR</p>
        </button>
      </div>
      <div className="flex gap-2 px-5 pb-2 overflow-x-auto scroll-hide">{["Find the dress","Show me shoes","What bag?","Try this on"].map(r=><Chip key={r} label={r} onPress={()=>setInput(r)}/>)}</div>
      <div className="flex items-center gap-3 px-5 py-3" style={{background:"#fff",borderTop:`1px solid ${T.border}`}}>
        <button onClick={()=>onNav("camera")} className="haptic w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{background:T.ivoryDark}}><span style={{fontSize:16}}>📷</span></button>
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{background:T.ivoryDark}}><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask your stylist…" className="flex-1 text-sm bg-transparent outline-none" style={{color:T.charcoal}}/></div>
        <button onClick={send} className="haptic w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{background:input?goldGrad:T.ivoryDark}}><span style={{color:input?T.ivory:T.muted,fontSize:16}}>↑</span></button>
      </div>
    </div>
  );
}

function NotificationsScreen() {
  const notifs=[{icon:"✦",l:"AI Stylist",msg:"Found 3 new looks for your gallery opening brief.",time:"2m",unread:true},{icon:"📦",l:"Order Update",msg:"Order #MC-8847 is out for delivery. Est. 2–4pm.",time:"1h",unread:true},{icon:"🔔",l:"Price Drop",msg:"Tailored Blazer on your wishlist dropped to $72 (−19%)",time:"3h",unread:true},{icon:"🔥",l:"Trending",msg:"Linen blazers trending +47% in your city this week.",time:"5h",unread:false},{icon:"🎉",l:"New Feature",msg:"AR outfit layering is live — stack multiple garments!",time:"1d",unread:false}];
  return (
    <div className="flex flex-col h-full" style={{background:T.ivory}}><Notch/><StatusBar/>
      <div className="flex-1 overflow-y-auto scroll-hide pt-14 pb-8">
        <div className="px-6 pt-4 flex items-center justify-between mb-5"><h2 className="font-serif text-2xl" style={{color:T.charcoal}}>Notifications</h2><button className="haptic text-xs font-bold" style={{color:T.gold}}>Mark all read</button></div>
        <div className="px-6 flex flex-col gap-2">{notifs.map((n,i)=>(
          <div key={i} className="flex items-start gap-3 p-4 rounded-2xl" style={{background:n.unread?"#fff":T.ivoryDark,border:n.unread?`1px solid ${T.border}`:"none",boxShadow:n.unread?T.shadow:"none"}}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{background:n.unread?T.goldPale:T.ivoryDark,fontSize:18}}>{n.icon}</div>
            <div className="flex-1"><div className="flex justify-between"><p className="text-sm font-semibold" style={{color:T.charcoal}}>{n.l}</p><p className="text-xs flex-shrink-0 ml-2" style={{color:T.muted}}>{n.time}</p></div><p className="text-xs leading-relaxed mt-0.5" style={{color:T.muted}}>{n.msg}</p></div>
            {n.unread&&<div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{background:T.gold}}/>}
          </div>
        ))}</div>
      </div>
    </div>
  );
}

function SettingsScreen({onNav}:{onNav:(s:Screen)=>void}) {
  const [notifOn,setNotifOn]=useState(true); const [ar,setAr]=useState(true); const [dark,setDark]=useState(false); const [haptic,setHaptic]=useState(true);
  const Toggle=({on,fn}:{on:boolean;fn:()=>void})=><button onClick={fn} className="haptic w-12 h-6 rounded-full relative flex-shrink-0" style={{background:on?T.gold:T.ivoryDark}}><div className="absolute top-1 rounded-full w-4 h-4 transition-all" style={{background:"#fff",left:on?"calc(100% - 20px)":4,boxShadow:"0 1px 4px rgba(0,0,0,0.15)"}}/></button>;
  return (
    <div className="flex flex-col h-full" style={{background:T.ivory}}><Notch/><StatusBar/>
      <div className="flex-1 overflow-y-auto scroll-hide pt-14 pb-8">
        <div className="px-6 pt-4 mb-5"><h2 className="font-serif text-2xl" style={{color:T.charcoal}}>Settings</h2></div>
        <div className="mx-6 mb-5 p-4 rounded-3xl flex items-center gap-4" style={{background:darkGrad,boxShadow:T.shadowMd}}>
          <Avatar src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=64&h=64&fit=crop&auto=format" size={52} border/>
          <div className="flex-1"><p className="font-serif text-lg" style={{color:T.ivory}}>Zara Malik</p><p className="text-xs" style={{color:"rgba(250,248,244,0.45)"}}>Member since Aug 2024</p><div className="flex items-center gap-1 mt-1">{I.sparkle()}<span className="text-xs" style={{color:T.gold}}>Premium Stylist</span></div></div>
        </div>
        {[{title:"Account",items:[{l:"Body Profile",sub:"5'7\" · S · Hourglass",icon:"📐",fn:()=>onNav("profile")},{l:"Linked Cards",sub:"Visa •••• 4242",icon:"💳",fn:()=>{}}]},{title:"Preferences",items:[{l:"Notifications",sub:"Price drops, tips, orders",icon:"🔔",toggle:notifOn,tfn:()=>setNotifOn(!notifOn)},{l:"AR Hints",sub:"Pose and lighting guidance",icon:"✦",toggle:ar,tfn:()=>setAr(!ar)},{l:"Haptic Feedback",sub:"Tactile button response",icon:"📳",toggle:haptic,tfn:()=>setHaptic(!haptic)},{l:"Dark Mode",sub:"Easier on the eyes at night",icon:"🌙",toggle:dark,tfn:()=>{setDark(!dark);onNav("dark-home");}}]}].map(section=>(
          <div key={section.title} className="px-6 mb-4">
            <p className="text-xs font-bold mb-2" style={{color:T.muted,letterSpacing:"0.08em"}}>{section.title.toUpperCase()}</p>
            <div className="rounded-2xl overflow-hidden" style={{background:"#fff",border:`1px solid ${T.border}`}}>
              {section.items.map((item,i)=>(
                <div key={item.l} className="flex items-center gap-3 px-4 py-3.5" style={{borderBottom:i<section.items.length-1?`1px solid ${T.border}`:"none"}}>
                  <span style={{fontSize:18}}>{item.icon}</span>
                  <div className="flex-1"><p className="text-sm font-medium" style={{color:T.charcoal}}>{item.l}</p>{item.sub&&<p className="text-xs" style={{color:T.muted}}>{item.sub}</p>}</div>
                  {"toggle" in item&&item.toggle!==undefined?<Toggle on={item.toggle} fn={item.tfn||(() => {})}/>:<button onClick={item.fn} style={{color:T.muted}}>›</button>}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="px-6"><button className="haptic w-full py-3 rounded-2xl text-sm font-semibold" style={{background:"rgba(212,117,106,0.08)",color:T.rose,border:"1px solid rgba(212,117,106,0.2)"}}>Sign Out</button><p className="text-center text-xs mt-4" style={{color:T.muted}}>MirrorCart v3.0 · © 2026</p></div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PHONE SHELL
// ════════════════════════════════════════════════════════════
function PhoneShell({children,screen}:{children:React.ReactNode;screen:Screen}) {
  const isDark=["ar-mirror","camera","ar-permission","ar-calibrate","ar-pose","ar-loading","ar-tracking-lost","ar-poor-light","ar-unsupported","outfit-score","social","fit-check","dark-home"].includes(screen);
  return (
    <div className="relative mx-auto overflow-hidden" style={{width:390,height:844,borderRadius:52,background:isDark?T.darkBg:T.ivory,boxShadow:"0 52px 100px rgba(28,28,30,0.3), 0 0 0 1px rgba(28,28,30,0.06), inset 0 0 0 1px rgba(255,255,255,0.1)"}}>
      <div className="absolute inset-0 overflow-hidden" style={{borderRadius:52}}>{children}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// NAVIGATION CONFIG
// ════════════════════════════════════════════════════════════
const LABELS: Record<Screen,string> = {
  welcome:"Welcome",quiz:"Style Quiz",profile:"Body Profile",
  home:"Home",dashboard:"AI Dashboard","dark-home":"Dark Mode",offline:"Offline",
  camera:"Camera","ar-permission":"AR Permission","ar-calibrate":"AR Calibrate","ar-pose":"Pose Detection","ar-loading":"Garment Loading","ar-mirror":"AR Mirror","fit-check":"AI Fit Check","complete-look":"Complete Look","outfit-score":"Outfit Score","ar-tracking-lost":"Tracking Lost","ar-poor-light":"Poor Light","ar-unsupported":"Unsupported Pose",
  discover:"Discover",product:"Product Detail",retailers:"Retailers",reasoning:"AI Reasoning",
  lookbuilder:"Look Builder",compare:"Compare",
  social:"Social Share",
  cart:"Cart",checkout:"Checkout",confirmation:"Confirmed",tracking:"Tracking",
  wardrobe:"Wardrobe",saved:"Saved",chat:"AI Chat",notifications:"Notifications",settings:"Settings",
};

const GROUPS:{label:string;screens:Screen[]}[] = [
  {label:"Onboarding",screens:["welcome","quiz","profile"]},
  {label:"Home",screens:["home","dashboard","dark-home","offline"]},
  {label:"AR Experience",screens:["camera","ar-permission","ar-calibrate","ar-pose","ar-loading","ar-mirror","fit-check","outfit-score","ar-tracking-lost","ar-poor-light","ar-unsupported"]},
  {label:"Discovery",screens:["discover","product","retailers"]},
  {label:"Look Tools",screens:["lookbuilder","compare","social"]},
  {label:"Commerce",screens:["cart","checkout","confirmation","tracking"]},
  {label:"Account",screens:["wardrobe","saved","chat","notifications","settings"]},
];

// ════════════════════════════════════════════════════════════
// APP ROOT
// ════════════════════════════════════════════════════════════
export default function App() {
  const [screen,setScreen]=useState<Screen>("welcome");
  const nav=(s:Screen)=>setScreen(s);

  const renderScreen=()=>{
    switch(screen){
      case "welcome": return <WelcomeScreen onNext={()=>nav("quiz")}/>;
      case "quiz": return <QuizScreen onNext={()=>nav("profile")}/>;
      case "profile": return <ProfileScreen onNext={()=>nav("home")}/>;
      case "home": return <HomeScreen onNav={nav}/>;
      case "dashboard": return <DashboardScreen onNav={nav}/>;
      case "dark-home": return <DarkHomeScreen onNav={nav}/>;
      case "offline": return <OfflineScreen onNav={nav}/>;
      case "camera": return <CameraScreen onNav={nav}/>;
      case "ar-permission": return <ARPermissionScreen onNext={()=>nav("ar-calibrate")}/>;
      case "ar-calibrate": return <ARCalibrateScreen onNext={()=>nav("ar-pose")}/>;
      case "ar-pose": return <ARPoseScreen onNext={()=>nav("ar-loading")}/>;
      case "ar-loading": return <ARLoadingScreen onNext={()=>nav("ar-mirror")}/>;
      case "ar-mirror": return <ARMirrorScreen onNav={nav}/>;
      case "fit-check": return <FitCheckScreen onNav={nav}/>;
      case "complete-look": return <ARMirrorScreen onNav={nav}/>;
      case "outfit-score": return <OutfitScoreScreen onNav={nav}/>;
      case "ar-tracking-lost": return <ARTrackingLostScreen onNav={nav}/>;
      case "ar-poor-light": return <ARPoorLightScreen onNav={nav}/>;
      case "ar-unsupported": return <ARUnsupportedScreen onNav={nav}/>;
      case "discover": return <DiscoverScreen onNav={nav}/>;
      case "product": return <ProductScreen onNav={nav}/>;
      case "retailers": return <RetailersScreen onNav={nav}/>;
      case "reasoning": return <ARMirrorScreen onNav={nav}/>;
      case "lookbuilder": return <LookBuilderScreen onNav={nav}/>;
      case "compare": return <CompareScreen onNav={nav}/>;
      case "social": return <SocialScreen onNav={nav}/>;
      case "cart": return <CartScreen onNav={nav}/>;
      case "checkout": return <CheckoutScreen onNav={nav}/>;
      case "confirmation": return <ConfirmationScreen onNav={nav}/>;
      case "tracking": return <TrackingScreen onNav={nav}/>;
      case "wardrobe": return <WardrobeScreen onNav={nav}/>;
      case "saved": return <SavedScreen onNav={nav}/>;
      case "chat": return <ChatScreen onNav={nav}/>;
      case "notifications": return <NotificationsScreen/>;
      case "settings": return <SettingsScreen onNav={nav}/>;
      default: return <HomeScreen onNav={nav}/>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-5 px-4" style={{background:"linear-gradient(145deg,#EDE8DE 0%,#F5F3EE 50%,#E8DFC8 100%)",minHeight:"100vh"}}>
      <div className="mb-5 w-full max-w-3xl">
        {GROUPS.map(group=>(
          <div key={group.label} className="mb-3">
            <p className="text-xs font-bold mb-1.5 px-1" style={{color:"#8B7355",letterSpacing:"0.08em"}}>{group.label.toUpperCase()}</p>
            <div className="flex flex-wrap gap-1.5">
              {group.screens.map(s=>(
                <button key={s} onClick={()=>setScreen(s)} className="haptic text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                  style={{background:screen===s?T.charcoal:"rgba(255,255,255,0.7)",color:screen===s?T.goldLight:"#6B6B70",border:screen===s?"none":"1px solid rgba(139,115,85,0.2)",boxShadow:screen===s?"0 4px 12px rgba(28,28,30,0.2)":"none",fontWeight:screen===s?700:400}}>
                  {LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <PhoneShell screen={screen}>{renderScreen()}</PhoneShell>
      <p className="mt-5 text-xs text-center" style={{color:"#8B7355",letterSpacing:"0.06em"}}>MirrorCart v3 · {LABELS[screen]} · Navigate in-screen or via picker above</p>
    </div>
  );
}
