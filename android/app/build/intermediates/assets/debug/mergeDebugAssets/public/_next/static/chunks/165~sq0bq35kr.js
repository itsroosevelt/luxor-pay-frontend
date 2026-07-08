(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,30257,e=>{"use strict";var t=e.i(43476),a=e.i(71645),i=e.i(22016);e.i(51718);var n=e.i(72779),o=e.i(59141),r=e.i(50751),s=e.i(80629),l=e.i(54449),d=e.i(15471),c=e.i(24007),p=e.i(4139),f=e.i(52330),u=e.i(68877),x=e.i(30274),h=e.i(56420);let g=(0,h.default)("qr-code",[["rect",{width:"5",height:"5",x:"3",y:"3",rx:"1",key:"1tu5fj"}],["rect",{width:"5",height:"5",x:"16",y:"3",rx:"1",key:"1v8r4q"}],["rect",{width:"5",height:"5",x:"3",y:"16",rx:"1",key:"1x03jg"}],["path",{d:"M21 16h-3a2 2 0 0 0-2 2v3",key:"177gqh"}],["path",{d:"M21 21v.01",key:"ents32"}],["path",{d:"M12 7v3a2 2 0 0 1-2 2H7",key:"8crl2c"}],["path",{d:"M3 12h.01",key:"nlz23k"}],["path",{d:"M12 3h.01",key:"n36tog"}],["path",{d:"M12 16v.01",key:"133mhm"}],["path",{d:"M16 12h1",key:"1slzba"}],["path",{d:"M21 12v.01",key:"1lwtk9"}],["path",{d:"M12 21v-1",key:"1880an"}]]);var m=e.i(70812),b=e.i(97053),y=e.i(46932);let w=(0,h.default)("eye",[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]),j=(0,h.default)("eye-off",[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]);var v=e.i(99847),F=e.i(41120);let k=(0,h.default)("coins",[["path",{d:"M13.744 17.736a6 6 0 1 1-7.48-7.48",key:"bq4yh3"}],["path",{d:"M15 6h1v4",key:"11y1tn"}],["path",{d:"m6.134 14.768.866-.5 2 3.464",key:"17snzx"}],["circle",{cx:"16",cy:"8",r:"6",key:"14bfc9"}]]),C=b.createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500&family=Outfit:wght@400;500;700&display=swap');
`,_=(0,b.default)(y.motion.div).withConfig({displayName:"WalletBalanceView__CardContainer",componentId:"sc-611adfd7-0"})`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(40px);
  border-radius: 24px;
  box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.5);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
  overflow: hidden;

  @media (min-width: 768px) {
    border-radius: 40px;
    box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.6);
    padding: 24px 32px;
    gap: 24px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at top right, rgba(37, 99, 235, 0.12), transparent 40%);
    pointer-events: none;
    z-index: 0;
  }
`,N=b.default.div.withConfig({displayName:"WalletBalanceView__ContentWrapper",componentId:"sc-611adfd7-1"})`
  position: relative;
  z-index: 1;
`,A=b.default.div.withConfig({displayName:"WalletBalanceView__HeaderRow",componentId:"sc-611adfd7-2"})`
  display: flex;
  justify-content: space-between;
  align-items: center;
`,S=b.default.h2.withConfig({displayName:"WalletBalanceView__Title",componentId:"sc-611adfd7-3"})`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  @media (min-width: 768px) {
    font-size: 24px;
    font-weight: 500;
    letter-spacing: -0.5px;
    color: #FFFFFF;
    text-transform: none;
    gap: 12px;
  }
`,M=b.default.button.withConfig({displayName:"WalletBalanceView__IconButton",componentId:"sc-611adfd7-4"})`
  background: transparent;
  border: none;
  border-radius: 9999px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    color: #60A5FA;
    background: rgba(96, 165, 250, 0.1);
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  @media (min-width: 768px) {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #60A5FA;
    &:hover:not(:disabled) {
      background: rgba(37, 99, 235, 0.2);
      color: #FFFFFF;
    }
  }
`,I=b.default.p.withConfig({displayName:"WalletBalanceView__BalanceLabel",componentId:"sc-611adfd7-5"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.12em;

  @media (min-width: 768px) {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 8px 0;
    letter-spacing: 0.1em;
  }
`,O=b.default.div.withConfig({displayName:"WalletBalanceView__PrimaryBalance",componentId:"sc-611adfd7-6"})`
  font-family: monospace;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  background: linear-gradient(to right, #60A5FA, #2563EB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.1;

  @media (min-width: 768px) {
    font-size: 48px;
    letter-spacing: -1px;
    line-height: 1;
  }
`,z=b.default.div.withConfig({displayName:"WalletBalanceView__TokenList",componentId:"sc-611adfd7-7"})`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;

  @media (min-width: 768px) {
    gap: 12px;
    margin-top: 16px;
  }
`,R=b.default.div.withConfig({displayName:"WalletBalanceView__TokenRow",componentId:"sc-611adfd7-8"})`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.04);

  @media (min-width: 768px) {
    padding: 12px 16px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
`,T=b.default.div.withConfig({displayName:"WalletBalanceView__TokenInfo",componentId:"sc-611adfd7-9"})`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (min-width: 768px) {
    gap: 12px;
  }
`,Q=b.default.div.withConfig({displayName:"WalletBalanceView__TokenIconCircle",componentId:"sc-611adfd7-10"})`
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.15), rgba(37, 99, 235, 0.15));
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 9px;
  color: #60A5FA;

  @media (min-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 12px;
    background: linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(37, 99, 235, 0.2));
  }
`,P=b.default.span.withConfig({displayName:"WalletBalanceView__TokenSymbol",componentId:"sc-611adfd7-11"})`
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: rgba(237, 237, 237, 0.85);

  @media (min-width: 768px) {
    font-size: 16px;
    color: #EDEDED;
  }
`,$=b.default.span.withConfig({displayName:"WalletBalanceView__TokenAmount",componentId:"sc-611adfd7-12"})`
  font-family: monospace;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);

  @media (min-width: 768px) {
    font-size: 16px;
    color: #FFFFFF;
  }
`,B=b.default.div.withConfig({displayName:"WalletBalanceView__ErrorContainer",componentId:"sc-611adfd7-13"})`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 20px;
  color: #FCA5A5;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
`,L=b.keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`,E=b.default.div.withConfig({displayName:"WalletBalanceView__SkeletonBox",componentId:"sc-611adfd7-14"})`
  width: ${({$width:e})=>e||"100%"};
  height: ${({$height:e})=>e||"24px"};
  border-radius: ${({$borderRadius:e})=>e||"8px"};
  background: linear-gradient(90deg, rgba(37, 99, 235, 0.1) 25%, rgba(96, 165, 250, 0.2) 50%, rgba(37, 99, 235, 0.1) 75%);
  background-size: 200% 100%;
  animation: ${L} 2s infinite;
`,W=b.default.div.withConfig({displayName:"WalletBalanceView__ControlsContainer",componentId:"sc-611adfd7-15"})`
  display: flex;
  gap: 8px;
`;function q({data:e,isLoading:i,isError:n,errorMessage:o,refetch:r,isPrivacyMode:s,togglePrivacyMode:l}){let[d,c]=(0,a.useState)(!1);(0,a.useEffect)(()=>{c(!0)},[]);let p=e=>d&&s?"••••••••":e;return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(C,{}),(0,t.jsx)(_,{...{initial:{opacity:0,y:40},animate:{opacity:1,y:0},transition:{type:"spring",bounce:.4,duration:.8}},children:(0,t.jsxs)(N,{children:[(0,t.jsxs)(A,{children:[(0,t.jsxs)(S,{children:[(0,t.jsx)(k,{size:14,className:"text-blue-400",style:{opacity:.7}}),"Wallet Balance"]}),(0,t.jsxs)(W,{children:[(0,t.jsx)(M,{onClick:l,"aria-label":s?"Show balance":"Hide balance",title:"Toggle Privacy Mode",children:s?(0,t.jsx)(j,{size:18}):(0,t.jsx)(w,{size:18})}),(0,t.jsx)(M,{onClick:r,disabled:i,"aria-label":"Refresh balance",title:"Refresh balance","aria-busy":i,children:(0,t.jsx)(F.RefreshCw,{size:18,className:i?"animate-spin":""})})]})]}),(0,t.jsxs)("div",{style:{marginTop:"14px"},children:[(0,t.jsx)(I,{children:"Total Solana"}),i?(0,t.jsx)(E,{$width:"160px",$height:"32px",$borderRadius:"8px"}):n?(0,t.jsxs)(B,{children:[(0,t.jsx)(v.AlertCircle,{size:20}),(0,t.jsx)("span",{children:o||"Unable to load balance."})]}):(0,t.jsxs)(O,{children:[p(e?.solBalance||"0.00")," SOL"]})]}),!i&&!n&&e?.tokens&&e.tokens.length>0&&(0,t.jsxs)(z,{children:[(0,t.jsx)(I,{style:{marginTop:"16px"},children:"Tokens"}),e.tokens.map((e,a)=>{let i=e.symbol||"SPL";return(0,t.jsxs)(R,{children:[(0,t.jsxs)(T,{children:[(0,t.jsx)(Q,{children:i.slice(0,2).toUpperCase()}),(0,t.jsx)(P,{children:i})]}),(0,t.jsx)($,{children:p(e.uiAmount)})]},e.mint+a)})]}),i&&(0,t.jsxs)(z,{children:[(0,t.jsx)(I,{style:{marginTop:"8px"},children:"Tokens"}),(0,t.jsx)(E,{$height:"36px",$borderRadius:"10px"}),(0,t.jsx)(E,{$height:"36px",$borderRadius:"10px"})]})]})})]})}var D=e.i(16182);function U({merchantWallet:e}){let{data:i,isLoading:n,isError:r,errorMessage:s,refetch:l,isPrivacyMode:d,togglePrivacyMode:c}=function(e){let[t,i]=(0,a.useState)(null),[n,r]=(0,a.useState)(!0),[s,l]=(0,a.useState)(!1),[d,c]=(0,a.useState)(null),[p,f]=(0,a.useState)(!1),u=(0,a.useCallback)(()=>{f(e=>!e)},[]),x=(0,a.useCallback)(async()=>{if(!e){i(null),r(!1),l(!1),c(null);return}r(!0),l(!1),c(null);try{let t=o.auth.currentUser;if(!t)throw Error("User not authenticated");let a=await t.getIdToken(),n=await (0,D.getWalletBalance)(a,e);i(n)}catch(e){l(!0),c(e.message||"Failed to fetch balance"),i(null)}finally{r(!1)}},[e]);return(0,a.useEffect)(()=>{x()},[x]),{data:t,isLoading:n,isError:s,errorMessage:d,refetch:x,isPrivacyMode:p,togglePrivacyMode:u}}(e);return e?(0,t.jsx)(q,{data:i,isLoading:n,isError:r,errorMessage:s,refetch:l,isPrivacyMode:d,togglePrivacyMode:c}):null}var V=e.i(88653),G=e.i(49838),H=e.i(61057),Y=e.i(45338),K=e.i(87886),X=e.i(46696);let Z=(0,b.default)(y.motion.div).withConfig({displayName:"TransferModal__Overlay",componentId:"sc-dba3d153-0"})`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`,J=(0,b.default)(y.motion.div).withConfig({displayName:"TransferModal__ModalContent",componentId:"sc-dba3d153-1"})`
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 32px 64px -16px rgba(0,0,0,0.8);
  border-radius: 40px;
  width: 100%;
  max-width: 500px;
  padding: 40px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
`,ee=b.default.h2.withConfig({displayName:"TransferModal__Title",componentId:"sc-dba3d153-2"})`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #FFFFFF;
  margin: 0 0 8px 0;
`,et=b.default.p.withConfig({displayName:"TransferModal__Subtitle",componentId:"sc-dba3d153-3"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 32px 0;
`,ea=b.default.form.withConfig({displayName:"TransferModal__Form",componentId:"sc-dba3d153-4"})`
  display: flex;
  flex-direction: column;
  gap: 20px;
`,ei=b.default.div.withConfig({displayName:"TransferModal__FormGroup",componentId:"sc-dba3d153-5"})`
  display: flex;
  flex-direction: column;
  gap: 8px;
`,en=b.default.label.withConfig({displayName:"TransferModal__Label",componentId:"sc-dba3d153-6"})`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.8);
`,eo=b.default.input.withConfig({displayName:"TransferModal__Input",componentId:"sc-dba3d153-7"})`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  transition: all 0.2s;

  &:focus-visible {
    outline: none;
    border-color: #60A5FA;
    box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`,er=b.default.select.withConfig({displayName:"TransferModal__Select",componentId:"sc-dba3d153-8"})`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;

  &:focus-visible {
    outline: none;
    border-color: #60A5FA;
    box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
  }

  & option {
    background: #0A0A0A;
    color: #FFFFFF;
  }
  
  & optgroup {
    background: #0A0A0A;
    color: #60A5FA;
    font-weight: 600;
  }
`,es=b.default.div.withConfig({displayName:"TransferModal__ButtonGroup",componentId:"sc-dba3d153-9"})`
  display: flex;
  gap: 16px;
  margin-top: 16px;
`,el=b.default.button.withConfig({displayName:"TransferModal__Button",componentId:"sc-dba3d153-10"})`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 14px 24px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  flex: 1;

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({$variant:e="primary"})=>"primary"===e&&`
    background: #FFFFFF;
    color: #000000;
    &:hover:not(:disabled) {
      background: #2563EB;
      color: #FFFFFF;
    }
  `}

  ${({$variant:e})=>"secondary"===e&&`
    background: transparent;
    color: #60A5FA;
    border: 1px solid rgba(255, 255, 255, 0.2);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
    }
  `}
`,ed=b.default.button.withConfig({displayName:"TransferModal__ToggleLink",componentId:"sc-dba3d153-11"})`
  background: none;
  border: none;
  color: #60A5FA;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    text-decoration: underline;
  }
`;function ec({isOpen:e,onClose:i,onSuccess:n}){let{data:r,isLoading:s}=(0,H.useGetContacts)(),{mutate:l,isLoading:c,isError:p,errorMessage:f}=function(){let[e,t]=(0,a.useState)(!1),[i,n]=(0,a.useState)(!1),[r,s]=(0,a.useState)(null),{latitude:l,longitude:d}=(0,K.useGeolocation)();return{mutate:async e=>{t(!0),n(!1),s(null);try{let a=o.auth.currentUser;if(!a)throw Error("User not authenticated");let i={...e,...null!==l&&null!==d?{latitude:l,longitude:d}:{}},n=await a.getIdToken(),r=await (0,Y.sendTransfer)(n,i);return t(!1),{success:!0,data:r.data}}catch(a){let e=a.message||"Failed to process transfer";return n(!0),s(e),t(!1),{success:!1,error:e}}},isLoading:e,isError:i,errorMessage:r}}(),[u,x]=(0,a.useState)(!1),[h,g]=(0,a.useState)({walletAddress:"",token:"SOL",amount:"",reference:""}),m=(0,d.getLuxorEnv)();if(!e)return null;let b=e=>{let{name:t,value:a}=e.target;g(e=>({...e,[t]:a}))},y=async e=>{e.preventDefault();let t=null;if(u&&r){let e=r.data.find(e=>e.walletAddress===h.walletAddress);e&&e.nickname&&(t=e.nickname)}let a={toWallet:h.walletAddress,amount:h.amount};"SOL"!==h.token&&(a.mint=h.token),t&&(a.toNickname=t),h.reference&&(a.reference=h.reference);let{success:o,data:s,error:d}=await l(a);o&&s?(X.toast.success("Transfer sent successfully!"),g({walletAddress:"",token:"SOL",amount:"",reference:""}),x(!1),i(),n&&n(s)):X.toast.error(d||"Transfer failed")};return(0,t.jsx)(V.AnimatePresence,{children:(0,t.jsx)(Z,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:i,children:(0,t.jsxs)(J,{onClick:e=>e.stopPropagation(),initial:{opacity:0,scale:.95,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:20},transition:{type:"spring",bounce:.4,duration:.6},children:[(0,t.jsx)(ee,{children:"Transfer Funds"}),(0,t.jsx)(et,{children:"Send crypto directly to another Solana address."}),(0,t.jsxs)(ea,{onSubmit:y,children:[(0,t.jsxs)(ei,{children:[(0,t.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[(0,t.jsx)(en,{children:"DESTINATION ADDRESS *"}),(0,t.jsx)(ed,{type:"button",onClick:()=>x(!u),children:u?"Enter manually":"Choose contact"})]}),u?(0,t.jsxs)(er,{name:"walletAddress",value:h.walletAddress,onChange:b,required:!0,children:[(0,t.jsx)("option",{value:"",disabled:!0,children:"Select a contact..."}),s?(0,t.jsx)("option",{disabled:!0,children:"Loading contacts..."}):r?.data.map(e=>(0,t.jsx)("option",{value:e.walletAddress,children:e.nickname||e.walletAddress},e.id))]}):(0,t.jsx)(eo,{name:"walletAddress",value:h.walletAddress,onChange:b,placeholder:"Enter recipient's Solana address",required:!0})]}),(0,t.jsxs)(ei,{children:[(0,t.jsx)(en,{children:"ASSET TO SEND *"}),(0,t.jsxs)(er,{name:"token",value:h.token,onChange:b,required:!0,children:[(0,t.jsx)("option",{value:"SOL",children:"Solana (SOL)"}),"development"===m?(0,t.jsx)("optgroup",{label:"Devnet Tokens",children:Object.entries(G.TOKEN_REGISTRY.devnet).map(([e,a])=>(0,t.jsx)("option",{value:e,children:a},e))}):(0,t.jsx)("optgroup",{label:"Mainnet Beta Tokens",children:Object.entries(G.TOKEN_REGISTRY["mainnet-beta"]).map(([e,a])=>(0,t.jsx)("option",{value:e,children:a},e))})]})]}),(0,t.jsxs)(ei,{children:[(0,t.jsx)(en,{children:"AMOUNT *"}),(0,t.jsx)(eo,{type:"number",step:"any",min:"0",name:"amount",value:h.amount,onChange:b,placeholder:"0.00",required:!0})]}),(0,t.jsxs)(ei,{children:[(0,t.jsx)(en,{children:"REFERENCE (OPTIONAL)"}),(0,t.jsx)(eo,{name:"reference",value:h.reference,onChange:b,placeholder:"Payment for services..."})]}),(0,t.jsxs)(es,{children:[(0,t.jsx)(el,{type:"button",$variant:"secondary",onClick:i,disabled:c,children:"Cancel"}),(0,t.jsx)(el,{type:"submit",$variant:"primary",disabled:c,"aria-busy":c,children:c?"Processing...":"Transfer"})]})]})]})})})}var ep=e.i(50932);function ef({isOpen:e,onClose:a,transferData:i}){return i?(0,t.jsx)(ep.PaymentSuccessModal,{isOpen:e,onClose:a,data:{amount:i.amount,symbol:i.symbol||"SOL",toWallet:i.toWallet,toNickname:i.toNickname,signature:i.signature,reference:i.reference}}):null}var eu=e.i(45033),ex=e.i(28835),eh=e.i(18566),eg=e.i(13222),em=e.i(81831);let eb=/^[1-9A-HJ-NP-Za-km-z]{32,44}$/,ey="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js",ew=b.default.div.withConfig({displayName:"QrCameraScanner__CameraContainer",componentId:"sc-b2ae1ab5-0"})`
  width: 100%;
  aspect-ratio: 4 / 3;
  position: relative;
  background: #000;
  border-radius: ${({$borderRadius:e=24})=>e}px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin: ${({$margin:e="0 0 24px 0"})=>e};
`,ej=b.default.video.withConfig({displayName:"QrCameraScanner__VideoElement",componentId:"sc-b2ae1ab5-1"})`
  width: 100%;
  height: 100%;
  object-fit: cover;
`,ev=b.default.div.withConfig({displayName:"QrCameraScanner__ScanOverlay",componentId:"sc-b2ae1ab5-2"})`
  position: absolute;
  top: 15%;
  left: 15%;
  right: 15%;
  bottom: 15%;
  border: 2px dashed #60a5fa;
  border-radius: 16px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: #60a5fa;
    box-shadow: 0 0 10px #2563eb;
    animation: qrScanAnimation 2.5s linear infinite;
  }

  @keyframes qrScanAnimation {
    0% {
      top: 0%;
    }
    50% {
      top: 100%;
    }
    100% {
      top: 0%;
    }
  }
`;function eF({enabled:e,onDetect:i,cameraErrorMessage:n,borderRadius:o,margin:r}){let{videoRef:s,canvasRef:l,error:d}=function({enabled:e,onDetect:t,cameraErrorMessage:i="No se pudo acceder a la cámara. Asegúrate de dar los permisos necesarios."}){let n=(0,a.useRef)(null),o=(0,a.useRef)(null),r=(0,a.useRef)(null),[s,l]=(0,a.useState)(null),d=(0,a.useRef)(t);d.current=t;let c=(0,a.useCallback)(()=>{r.current&&(r.current.getTracks().forEach(e=>e.stop()),r.current=null)},[]);return(0,a.useEffect)(()=>{if(!e){c(),l(null);return}let t=!1,a=0;return async function(){try{if(await (window.jsQR?Promise.resolve():new Promise((e,t)=>{let a=document.querySelector(`script[src="${ey}"]`);if(a)return window.jsQR?void e():(a.addEventListener("load",()=>e()),void a.addEventListener("error",()=>t(Error("Failed to load jsQR"))));let i=document.createElement("script");i.src=ey,i.async=!0,i.onload=()=>e(),i.onerror=()=>t(Error("Failed to load jsQR")),document.head.appendChild(i)})),t)return;l(null);let e=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});if(t)return void e.getTracks().forEach(e=>e.stop());r.current=e;let i=n.current;if(!i)return;i.srcObject=e,i.setAttribute("playsinline","true"),await i.play(),a=requestAnimationFrame(function e(){if(t||!r.current)return;let i=o.current,s=n.current;if(!i||!s||s.readyState!==s.HAVE_ENOUGH_DATA){a=requestAnimationFrame(e);return}let l=i.getContext("2d");if(!l){a=requestAnimationFrame(e);return}i.height=s.videoHeight,i.width=s.videoWidth,l.drawImage(s,0,0,i.width,i.height);let p=l.getImageData(0,0,i.width,i.height),f=window.jsQR?.(p.data,p.width,p.height,{inversionAttempts:"dontInvert"});if(f?.data){c(),d.current(f.data.trim());return}a=requestAnimationFrame(e)})}catch(e){console.error(e),t||l(i)}}(),()=>{t=!0,cancelAnimationFrame(a),c()}},[e,c,i]),{videoRef:n,canvasRef:o,error:s,stopCamera:c}}({enabled:e,onDetect:i,cameraErrorMessage:n});return d?(0,t.jsx)("div",{style:{color:"#F87171",marginBottom:"24px",textAlign:"center"},children:d}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(ew,{$borderRadius:o,$margin:r,children:[(0,t.jsx)(ej,{ref:s}),(0,t.jsx)(ev,{})]}),(0,t.jsx)("canvas",{ref:l,style:{display:"none"}})]})}let ek=(0,h.default)("camera",[["path",{d:"M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",key:"18u6gg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]]);var eC=e.i(11241),e_=e.i(63676),eN=e.i(8734);let eA=(0,h.default)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);var eS=e.i(82022),eM=e.i(16327),eI=e.i(56539),eO=e.i(17724);let ez=(0,b.default)(y.motion.div).withConfig({displayName:"QrOperationsModal__Overlay",componentId:"sc-ead193f5-0"})`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 12px;
  }
`,eR=(0,b.default)(y.motion.div).withConfig({displayName:"QrOperationsModal__ModalContent",componentId:"sc-ead193f5-1"})`
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 32px 64px -16px rgba(0,0,0,0.8);
  border-radius: 40px;
  width: 100%;
  max-width: ${({$wide:e})=>e?"880px":"480px"};
  padding: 40px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: ${({$wide:e})=>e?"stretch":"center"};

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 24px;
  }
`,eT=b.default.button.withConfig({displayName:"QrOperationsModal__CloseButton",componentId:"sc-ead193f5-2"})`
  position: absolute;
  top: 24px;
  right: 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
  }
`,eQ=b.default.h2.withConfig({displayName:"QrOperationsModal__Title",componentId:"sc-ead193f5-3"})`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #FFFFFF;
  margin: 0 0 8px 0;
  text-align: center;
`,eP=b.default.p.withConfig({displayName:"QrOperationsModal__Subtitle",componentId:"sc-ead193f5-4"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 32px 0;
  text-align: center;
  line-height: 1.5;
`,e$=b.default.button.withConfig({displayName:"QrOperationsModal__OptionButton",componentId:"sc-ead193f5-5"})`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 24px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  margin-bottom: 16px;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(96, 165, 250, 0.4);
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  &:last-of-type {
    margin-bottom: 0;
  }
`,eB=b.default.div.withConfig({displayName:"QrOperationsModal__IconWrapper",componentId:"sc-ead193f5-6"})`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(96, 165, 250, 0.1);
  color: #60A5FA;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`,eL=b.default.div.withConfig({displayName:"QrOperationsModal__OptionTextWrapper",componentId:"sc-ead193f5-7"})`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,eE=b.default.span.withConfig({displayName:"QrOperationsModal__OptionTitle",componentId:"sc-ead193f5-8"})`
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #FFFFFF;
`,eW=b.default.span.withConfig({displayName:"QrOperationsModal__OptionDesc",componentId:"sc-ead193f5-9"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
`,eq=b.default.div.withConfig({displayName:"QrOperationsModal__ReceiveLayout",componentId:"sc-ead193f5-10"})`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  width: 100%;
  align-items: start;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
`,eD=b.default.div.withConfig({displayName:"QrOperationsModal__ReceiveHeader",componentId:"sc-ead193f5-11"})`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  min-width: 0;

  @media (max-width: 768px) {
    order: 1;
    width: 100%;
  }
`,eU=b.default.div.withConfig({displayName:"QrOperationsModal__ReceiveConfigSection",componentId:"sc-ead193f5-12"})`
  display: flex;
  flex-direction: column;
  min-width: 0;
  grid-column: 1;
  grid-row: 2;

  @media (max-width: 768px) {
    order: 5;
    width: 100%;
  }
`,eV=b.default.div.withConfig({displayName:"QrOperationsModal__ReceiveVisualWrapper",componentId:"sc-ead193f5-13"})`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  width: 100%;
  grid-column: 2;
  grid-row: 2;

  @media (max-width: 768px) {
    display: flex;
    order: 2;
    gap: 24px;
  }
`,eG=b.default.div.withConfig({displayName:"QrOperationsModal__ReceiveQrSection",componentId:"sc-ead193f5-14"})`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`,eH=b.default.div.withConfig({displayName:"QrOperationsModal__ReceiveInfoSection",componentId:"sc-ead193f5-15"})`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    margin-bottom: 0;
  }
`,eY=b.default.div.withConfig({displayName:"QrOperationsModal__InfoBox",componentId:"sc-ead193f5-16"})`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
`,eK=b.default.div.withConfig({displayName:"QrOperationsModal__InfoRow",componentId:"sc-ead193f5-17"})`
  display: flex;
  justify-content: space-between;
  align-items: center;
`,eX=b.default.span.withConfig({displayName:"QrOperationsModal__InfoLabel",componentId:"sc-ead193f5-18"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
`,eZ=b.default.span.withConfig({displayName:"QrOperationsModal__InfoValue",componentId:"sc-ead193f5-19"})`
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #FFFFFF;
`,eJ=b.default.span.withConfig({displayName:"QrOperationsModal__InfoValueBlue",componentId:"sc-ead193f5-20"})`
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #60A5FA;
`,e0=b.default.div.withConfig({displayName:"QrOperationsModal__InfoDivider",componentId:"sc-ead193f5-21"})`
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 16px 0;
  width: 100%;
`,e5=b.default.div.withConfig({displayName:"QrOperationsModal__ReceiveAddressSection",componentId:"sc-ead193f5-22"})`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`,e1=(0,b.default)(eQ).withConfig({displayName:"QrOperationsModal__ReceiveTitle",componentId:"sc-ead193f5-23"})`
  text-align: left;
`,e2=(0,b.default)(eP).withConfig({displayName:"QrOperationsModal__ReceiveSubtitle",componentId:"sc-ead193f5-24"})`
  text-align: left;
  margin-bottom: 24px;
`,e3=b.default.div.withConfig({displayName:"QrOperationsModal__QrContainer",componentId:"sc-ead193f5-25"})`
  background: #FFFFFF;
  padding: 28px;
  border-radius: 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16px 32px rgba(0,0,0,0.5);
  width: 100%;
  max-width: 380px;

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 20px;
  }
`,e6=b.default.span.withConfig({displayName:"QrOperationsModal__AddressLabel",componentId:"sc-ead193f5-26"})`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
  text-transform: uppercase;
`,e4=(0,b.default)(e6).withConfig({displayName:"QrOperationsModal__RightAddressLabel",componentId:"sc-ead193f5-27"})`
  align-self: flex-start;
  width: 100%;
`,e9=b.default.div.withConfig({displayName:"QrOperationsModal__AddressWrapper",componentId:"sc-ead193f5-28"})`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(96, 165, 250, 0.1);
  border: 1px dashed rgba(96, 165, 250, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  width: 100%;
  margin-bottom: 24px;
`,e8=b.default.span.withConfig({displayName:"QrOperationsModal__AddressText",componentId:"sc-ead193f5-29"})`
  font-family: monospace;
  font-size: 15px;
  color: #60A5FA;
  word-break: break-all;
  flex: 1;
  text-align: left;
`,e7=b.default.div.withConfig({displayName:"QrOperationsModal__PaymentLinkActions",componentId:"sc-ead193f5-30"})`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
  max-width: 380px;
  margin-bottom: 16px;
`,te=b.default.div.withConfig({displayName:"QrOperationsModal__QrTypeSelector",componentId:"sc-ead193f5-31"})`
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  padding: 4px;
  margin-bottom: 16px;
  width: 100%;
  max-width: 380px;
  box-sizing: border-box;
`,tt=b.default.button.withConfig({displayName:"QrOperationsModal__QrTypeButton",componentId:"sc-ead193f5-32"})`
  flex: 1;
  padding: 8px 12px;
  border-radius: 9999px;
  border: none;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({$active:e})=>e?"#FFFFFF":"transparent"};
  color: ${({$active:e})=>e?"#000000":"rgba(255, 255, 255, 0.6)"};

  &:hover {
    color: ${({$active:e})=>e?"#000000":"#FFFFFF"};
    background: ${({$active:e})=>e?"#FFFFFF":"rgba(255, 255, 255, 0.05)"};
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`,ta=b.default.button.withConfig({displayName:"QrOperationsModal__IconButton",componentId:"sc-ead193f5-33"})`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: ${({$copied:e})=>e?"#10B981":"#FFFFFF"};
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`,ti=b.default.button.withConfig({displayName:"QrOperationsModal__BackNav",componentId:"sc-ead193f5-34"})`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
  margin-bottom: 24px;
  align-self: flex-start;
  padding: 0;

  &:hover {
    color: #FFFFFF;
  }
`,tn=b.default.button.withConfig({displayName:"QrOperationsModal__ActionButton",componentId:"sc-ead193f5-35"})`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 14px 24px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;

  &:last-of-type {
    margin-bottom: 0;
  }

  ${({$variant:e="primary"})=>"primary"===e&&`
    background: #FFFFFF;
    color: #000000;
    &:hover {
      background: #2563EB;
      color: #FFFFFF;
    }
  `}

  ${({$variant:e})=>"secondary"===e&&`
    background: transparent;
    color: #60A5FA;
    border: 1px solid rgba(255, 255, 255, 0.2);
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `}
`,to=b.default.div.withConfig({displayName:"QrOperationsModal__ConfigFields",componentId:"sc-ead193f5-36"})`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`,tr=b.default.div.withConfig({displayName:"QrOperationsModal__InputRow",componentId:"sc-ead193f5-37"})`
  display: flex;
  gap: 12px;
  width: 100%;
`,ts=b.default.input.withConfig({displayName:"QrOperationsModal__TextInput",componentId:"sc-ead193f5-38"})`
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 14px 18px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #60A5FA;
    box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`,tl=(0,b.default)(ts).withConfig({displayName:"QrOperationsModal__AmountInput",componentId:"sc-ead193f5-39"})`
  flex: 1;
  width: auto;
`,td=b.default.select.withConfig({displayName:"QrOperationsModal__TokenSelect",componentId:"sc-ead193f5-40"})`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 14px 18px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 110px;

  &:focus {
    outline: none;
    border-color: #60A5FA;
  }

  option {
    background: #0A0A0A;
    color: #FFFFFF;
  }
`,tc=b.default.span.withConfig({displayName:"QrOperationsModal__FieldLabel",componentId:"sc-ead193f5-41"})`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
  display: block;
`,tp=b.default.div.withConfig({displayName:"QrOperationsModal__FieldGroup",componentId:"sc-ead193f5-42"})`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`,tf=b.default.div.withConfig({displayName:"QrOperationsModal__InfoField",componentId:"sc-ead193f5-43"})`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 14px 18px;
  color: rgba(255, 255, 255, 0.9);
  font-family: ${({$mono:e})=>e?"monospace":"'Outfit', sans-serif"};
  font-size: ${({$mono:e})=>e?"13px":"15px"};
  word-break: break-all;
`,tu=b.default.select.withConfig({displayName:"QrOperationsModal__ContactSelect",componentId:"sc-ead193f5-44"})`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 14px 18px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;

  &:focus {
    outline: none;
    border-color: #60A5FA;
    box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  option {
    background: #0A0A0A;
    color: #FFFFFF;
  }
`,tx=b.default.button.withConfig({displayName:"QrOperationsModal__AdvancedToggle",componentId:"sc-ead193f5-45"})`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 0;
  transition: color 0.2s;

  &:hover {
    color: #FFFFFF;
  }
`,th=b.default.p.withConfig({displayName:"QrOperationsModal__NoteText",componentId:"sc-ead193f5-46"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.4);
  margin: 4px 0 0 0;
  line-height: 1.4;
`;function tg({isOpen:e,onClose:i,merchantWallet:n,recipientLabel:o,initialMode:r="select",onCreatePaymentRequest:s}){let l=(0,eh.useRouter)(),[d,c]=(0,a.useState)("select"),[p,f]=(0,a.useState)(""),[u,h]=(0,a.useState)("USDC"),[m,b]=(0,a.useState)(""),[y,w]=(0,a.useState)(!1),[j,v]=(0,a.useState)(!1),[F,k]=(0,a.useState)("link"),[C,_]=(0,a.useState)(()=>window.location.origin),[N,A]=(0,a.useState)("never"),[S,M]=(0,a.useState)(!1);(0,a.useEffect)(()=>{_(window.location.origin)},[]),(0,a.useEffect)(()=>{e&&(c(r),f(""),h("USDC"),b(""),w(!1),v(!1),k("link"),A("never"))},[e,r]);let I=n?.trim()||null,O=(0,a.useMemo)(()=>o?.trim()||void 0,[o]),{data:z}=(0,eO.useTokenPrice)(u),R=(0,a.useMemo)(()=>{if(!p||isNaN(parseFloat(p))||0>=parseFloat(p))return"";let e=z??1,t=parseFloat(p)/e,a="SOL"===u?9:2;return t.toFixed(a)},[p,z,u]),T=(0,a.useMemo)(()=>{if(p&&parseFloat(p)>0)return(0,em.generatePaymentReference)()},[p]),Q=(0,a.useMemo)(()=>"never"===N?null:Date.now()+(({"5m":3e5,"15m":9e5,"1h":36e5,"1d":864e5})[N]||0),[N]),P=(0,a.useMemo)(()=>{if(!I)return null;let e={recipient:I,label:O};return R&&parseFloat(R)>0&&(e.amount=R,e.currency=u,e.chargeRef=T,e.usdAmount=p),Q&&(e.expiry=Q.toString()),m.trim()&&(e.message=m.trim()),e},[I,O,R,u,T,Q,p,m]),$=(0,a.useMemo)(()=>P?(0,eg.buildLuxorPayCheckoutPath)(P):null,[P]),B=(0,a.useMemo)(()=>$&&C?`${C}${$}`:null,[$,C]),L=(0,a.useMemo)(()=>{if(!I)return"";let e="SOL"!==u?(0,em.getMintForSymbol)(u):null;try{return(0,em.encodeSolanaPayUrl)({recipient:I,amount:R||void 0,splToken:e,label:O,message:m.trim()||void 0,reference:T||void 0})}catch(e){return console.error("Error encoding solana pay url:",e),I}},[I,R,u,O,m,T]);if(!e)return null;let E=async()=>{if(B)try{await navigator.clipboard.writeText(B),w(!0),X.toast.success("Payment link copied"),setTimeout(()=>w(!1),2e3)}catch{X.toast.error("Could not copy the link")}},W=async()=>{if(I)try{await navigator.clipboard.writeText(I),v(!0),X.toast.success("Address copied"),setTimeout(()=>v(!1),2e3)}catch{X.toast.error("Could not copy the address")}},q=()=>{$&&window.open($,"_blank","noopener,noreferrer")};return(0,t.jsx)(V.AnimatePresence,{children:(0,t.jsx)(ez,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:i,children:(0,t.jsxs)(eR,{$wide:"receive"===d,onClick:e=>e.stopPropagation(),initial:{opacity:0,scale:.95,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:20},transition:{type:"spring",bounce:.4,duration:.6},children:[(0,t.jsx)(eT,{onClick:i,children:(0,t.jsx)(e_.X,{size:18})}),"select"===d&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(eQ,{children:"QR Operations"}),(0,t.jsx)(eP,{children:"Choose whether you want to create a QR charge to receive money or read a QR payment code to send."}),(0,t.jsxs)(e$,{onClick:()=>c("receive"),children:[(0,t.jsx)(eB,{children:(0,t.jsx)(g,{size:28})}),(0,t.jsxs)(eL,{children:[(0,t.jsx)(eE,{children:"Create a QR charge"}),(0,t.jsx)(eW,{children:"Show your QR to receive direct payments or links"})]})]}),(0,t.jsxs)(e$,{onClick:()=>c("scan"),children:[(0,t.jsx)(eB,{children:(0,t.jsx)(ek,{size:28})}),(0,t.jsxs)(eL,{children:[(0,t.jsx)(eE,{children:"Read a QR code"}),(0,t.jsx)(eW,{children:"Scan charge codes to pay instantly"})]})]}),s&&(0,t.jsxs)(e$,{onClick:()=>{i(),s()},children:[(0,t.jsx)(eB,{children:(0,t.jsx)(x.Send,{size:28})}),(0,t.jsxs)(eL,{children:[(0,t.jsx)(eE,{children:"Create a payment request"}),(0,t.jsx)(eW,{children:"Send a payment request to a user"})]})]})]}),"receive"===d&&(0,t.jsxs)(eq,{children:[(0,t.jsxs)(eD,{children:["receive"!==r&&(0,t.jsxs)(ti,{onClick:()=>c("select"),children:[(0,t.jsx)(eC.ArrowLeft,{size:16})," Back"]}),(0,t.jsx)(e1,{children:"Create QR Charge"}),(0,t.jsx)(e2,{children:"Show this QR to receive deposits to your wallet. Leave the amount empty for an open charge."})]}),(0,t.jsx)(eV,{children:I&&B?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(eG,{children:[(0,t.jsxs)(e7,{children:[(0,t.jsx)(ta,{type:"button",$copied:y,onClick:E,title:y?"Copied":"Copy link","aria-label":"Copy payment link",children:y?(0,t.jsx)(eA,{size:14}):(0,t.jsx)(eN.Copy,{size:14})}),(0,t.jsx)(ta,{type:"button",onClick:q,disabled:!$,title:"Open payment page","aria-label":"Open payment page",children:(0,t.jsx)(eS.ExternalLink,{size:14})})]}),(0,t.jsxs)(te,{children:[(0,t.jsx)(tt,{type:"button",$active:"link"===F,onClick:()=>k("link"),children:"Universal Link"}),(0,t.jsx)(tt,{type:"button",$active:"wallet"===F,onClick:()=>k("wallet"),children:"Solana Native (Fastest)"})]}),(0,t.jsx)(e3,{children:(0,t.jsx)(ex.QRCodeSVG,{value:"link"===F?B||"":L,size:320,level:"H",includeMargin:!1,style:{width:"100%",height:"auto",maxWidth:"320px"}},"link"===F?B:L)})]}),p&&parseFloat(p)>0&&(0,t.jsx)(eH,{children:(0,t.jsxs)(eY,{children:[(0,t.jsxs)(eK,{children:[(0,t.jsx)(eX,{children:"Amount in USD"}),(0,t.jsxs)(eZ,{children:["$",parseFloat(p).toFixed(2)]})]}),(0,t.jsx)(e0,{}),(0,t.jsxs)(eK,{children:[(0,t.jsx)(eX,{children:"Scan and pay"}),(0,t.jsx)(eJ,{children:R?`${R} ${u}`:`... ${u}`})]})]})}),(0,t.jsxs)(e5,{children:[(0,t.jsx)(e4,{children:"Your deposit address"}),(0,t.jsxs)(e9,{children:[(0,t.jsx)(e8,{children:I}),(0,t.jsx)(ta,{type:"button",$copied:j,onClick:W,title:j?"Copied":"Copy address","aria-label":"Copy deposit address",children:j?(0,t.jsx)(eA,{size:14}):(0,t.jsx)(eN.Copy,{size:14})})]})]})]}):null}),(0,t.jsxs)(eU,{children:[(0,t.jsxs)(to,{children:[o&&(0,t.jsxs)(tp,{children:[(0,t.jsx)(tc,{children:"Business Name"}),(0,t.jsx)(tf,{children:o})]}),I&&(0,t.jsxs)(tp,{children:[(0,t.jsx)(tc,{children:"Receiving Wallet Address"}),(0,t.jsx)(tf,{$mono:!0,children:I})]}),(0,t.jsxs)(tp,{children:[(0,t.jsx)(tc,{children:"Amount in USD"}),(0,t.jsx)(ts,{type:"text",inputMode:"decimal",placeholder:"0.00",value:p,onChange:e=>{let t=e.target.value;/^[0-9]*\.?[0-9]*$/.test(t)&&f(t)}})]}),(0,t.jsxs)(tp,{children:[(0,t.jsx)(tc,{children:"Pay in"}),(0,t.jsxs)(tr,{children:[(0,t.jsx)(tl,{type:"text",readOnly:!0,placeholder:"0.00",value:R,style:{background:"rgba(255, 255, 255, 0.02)",color:"rgba(255, 255, 255, 0.8)"},"aria-label":"Converted amount"}),(0,t.jsxs)(td,{value:u,onChange:e=>h(e.target.value),"aria-label":"Currency",children:[(0,t.jsx)("option",{value:"USDC",children:"USDC"}),(0,t.jsx)("option",{value:"SOL",children:"SOL"}),(0,t.jsx)("option",{value:"LXR",children:"LXR"})]})]}),(0,t.jsx)(th,{children:"This is the current equivalent value. Cryptocurrency prices fluctuate."})]}),(0,t.jsxs)(tx,{type:"button",onClick:()=>M(!S),children:[S?(0,t.jsx)(eI.ChevronUp,{size:16}):(0,t.jsx)(eM.ChevronDown,{size:16}),"Advanced Options"]}),S&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(tp,{children:[(0,t.jsx)(tc,{children:"Description (optional)"}),(0,t.jsx)(ts,{type:"text",placeholder:"Charge description",value:m,onChange:e=>b(e.target.value),maxLength:120,"aria-label":"Charge description"})]}),(0,t.jsxs)(tp,{children:[(0,t.jsx)(tc,{children:"Expiration Time"}),(0,t.jsxs)(tu,{value:N,onChange:e=>A(e.target.value),"aria-label":"Select Expiration",children:[(0,t.jsx)("option",{value:"never",children:"Never Expires"}),(0,t.jsx)("option",{value:"5m",children:"5 Minutes"}),(0,t.jsx)("option",{value:"15m",children:"15 Minutes"}),(0,t.jsx)("option",{value:"1h",children:"1 Hour"}),(0,t.jsx)("option",{value:"1d",children:"1 Day"})]})]})]})]}),!(I&&B)&&(0,t.jsx)("div",{style:{marginBottom:"24px",color:"#F87171"},children:"No configured address found. Add it in Settings."}),(0,t.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:"12px",width:"100%"},children:[(0,t.jsx)(tn,{type:"button",$variant:"primary",onClick:q,disabled:!$,children:"Open Payment Link"}),(0,t.jsx)(tn,{type:"button",$variant:"secondary",onClick:()=>{"receive"===r?i():c("select")},children:"Cancel"})]})]})]}),"scan"===d&&(0,t.jsxs)(t.Fragment,{children:["scan"!==r&&(0,t.jsxs)(ti,{onClick:()=>c("select"),children:[(0,t.jsx)(eC.ArrowLeft,{size:16})," Back"]}),(0,t.jsx)(eQ,{children:"Pay with QR"}),(0,t.jsx)(eP,{children:"Align the Luxor Pay or Solana Pay QR code within the frame to pay."}),(0,t.jsx)(eF,{enabled:e&&"scan"===d,onDetect:function(e){let t=function(e){let t,a,i,n=e.trim();if(n.includes("/pay/qr"))try{let e=n.startsWith("http")?new URL(n):new URL(n,"https://placeholder.local");return{type:"qr_direct",url:e.pathname+e.search}}catch{return{type:"qr_direct",url:n.startsWith("/")?n:`/pay/qr?${n}`}}if(n.includes("/pay/link/")){let e=n.split("/pay/link/"),t=e[e.length-1].split("?")[0];if(t)return{type:"link",linkId:t}}if(n.startsWith("lx_"))return{type:"link",linkId:n};if(n.includes("/pay/")){let e=n.split("/pay/"),t=e[e.length-1].split("?")[0];if(t&&"link"!==t)return{type:"reference",reference:t}}if(n.startsWith("solana:")){let e=(0,em.parseSolanaPayUrl)(n);if(e&&eb.test(e.recipient))return{type:"qr_direct",url:(0,eg.buildLuxorPayCheckoutPathFromSolanaPay)(e)}}if(/^[a-zA-Z0-9_-]{10,100}$/.test(n))return{type:"reference",reference:n};let o=(t=n.trim(),a=(0,em.parseSolanaPayUrl)(t),i=a?.recipient??t,!a&&i.startsWith("solana:")&&(i=i.split("?")[0].replace("solana:","")),eb.test(i)?i:null);return o?{type:"qr_direct",url:(0,eg.buildLuxorPayCheckoutPath)({recipient:o})}:{type:"invalid",url:n}}(e);switch(t.type){case"qr_direct":l.push(t.url),X.toast.success("QR checkout detected"),i();return;case"link":l.push(`/pay/link/${t.linkId}`),X.toast.success("Payment link detected"),i();return;case"reference":l.push(`/pay/${t.reference}`),X.toast.success("Payment reference detected"),i();return;case"wallet":l.push(`/pay/qr?recipient=${t.address}`),X.toast.success("Merchant wallet detected. Opening checkout."),i();return;default:X.toast.error("Invalid payment QR code")}}}),(0,t.jsx)(tn,{type:"button",$variant:"secondary",onClick:()=>{"scan"===r?i():c("select")},children:"Cancel"})]})]})})})}let tm=(0,h.default)("hand-coins",[["path",{d:"M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17",key:"geh8rc"}],["path",{d:"m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9",key:"1fto5m"}],["path",{d:"m2 16 6 6",key:"1pfhp9"}],["circle",{cx:"16",cy:"9",r:"2.9",key:"1n0dlu"}],["circle",{cx:"6",cy:"5",r:"3",key:"151irh"}]]),tb=(0,b.default)(y.motion.div).withConfig({displayName:"ReceiveModal__Overlay",componentId:"sc-1cbde5f7-0"})`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`,ty=(0,b.default)(y.motion.div).withConfig({displayName:"ReceiveModal__ModalContent",componentId:"sc-1cbde5f7-1"})`
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 32px 64px -16px rgba(0,0,0,0.8);
  border-radius: 40px;
  width: 100%;
  max-width: 440px;
  padding: 40px;
  position: relative;
`,tw=b.default.h2.withConfig({displayName:"ReceiveModal__Title",componentId:"sc-1cbde5f7-2"})`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0 0 8px 0;
  text-align: center;
`,tj=b.default.p.withConfig({displayName:"ReceiveModal__Subtitle",componentId:"sc-1cbde5f7-3"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 32px 0;
  text-align: center;
  line-height: 1.5;
`,tv=b.default.div.withConfig({displayName:"ReceiveModal__QrContainer",componentId:"sc-1cbde5f7-4"})`
  background: #FFFFFF;
  padding: 24px;
  border-radius: 32px;
  width: fit-content;
  margin: 0 auto 32px auto;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
`,tF=b.default.span.withConfig({displayName:"ReceiveModal__AddressLabel",componentId:"sc-1cbde5f7-5"})`
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #60A5FA;
  margin-bottom: 8px;
  text-align: center;
`,tk=b.default.div.withConfig({displayName:"ReceiveModal__AddressWrapper",componentId:"sc-1cbde5f7-6"})`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 12px 16px;
  margin-bottom: 32px;
`,tC=b.default.span.withConfig({displayName:"ReceiveModal__Address",componentId:"sc-1cbde5f7-7"})`
  font-family: monospace;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`,t_=b.default.button.withConfig({displayName:"ReceiveModal__CopyButton",componentId:"sc-1cbde5f7-8"})`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: ${({$copied:e})=>e?"#10B981":"#FFFFFF"};
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
`,tN=b.default.div.withConfig({displayName:"ReceiveModal__ButtonGroup",componentId:"sc-1cbde5f7-9"})`
  display: flex;
  flex-direction: column;
  gap: 12px;
`,tA=b.default.button.withConfig({displayName:"ReceiveModal__Button",componentId:"sc-1cbde5f7-10"})`
  width: 100%;
  padding: 14px;
  border-radius: 9999px;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  ${({$variant:e="primary"})=>"primary"===e&&`
    background: #FFFFFF;
    color: #000000;
    &:hover {
      background: #2563EB;
      color: #FFFFFF;
    }
  `}

  ${({$variant:e})=>"secondary"===e&&`
    background: transparent;
    color: #60A5FA;
    border: 1px solid rgba(255, 255, 255, 0.2);
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `}
`;function tS({isOpen:e,onClose:i,merchantWallet:n,title:o="Receive Funds",subtitle:r="Show this QR code to accept direct payments.",showCreateLinkButton:s=!0,onAskForPayment:l,qrValue:d}){let c=(0,eh.useRouter)(),[p,f]=(0,a.useState)(!1);if(!e)return null;let u=d??(n?(0,em.buildOpenAmountQrUrl)(n,o):null);return(0,t.jsx)(V.AnimatePresence,{children:(0,t.jsx)(tb,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:i,children:(0,t.jsxs)(ty,{onClick:e=>e.stopPropagation(),initial:{opacity:0,scale:.95,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:0},transition:{type:"spring",bounce:.4,duration:.6},children:[(0,t.jsx)(tw,{children:o}),(0,t.jsx)(tj,{children:r}),n&&u?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(tv,{children:(0,t.jsx)(ex.QRCodeSVG,{value:u,size:200,level:"H",includeMargin:!1})}),(0,t.jsx)(tF,{children:"YOUR DEPOSIT ADDRESS"}),(0,t.jsxs)(tk,{children:[(0,t.jsx)(tC,{children:n}),(0,t.jsx)(t_,{type:"button",$copied:p,onClick:()=>{n&&navigator.clipboard.writeText(n).then(()=>{f(!0),setTimeout(()=>f(!1),2e3)})},title:p?"Copied!":"Copy address","aria-label":"Copy deposit address",children:p?(0,t.jsx)(eA,{size:14}):(0,t.jsx)(eN.Copy,{size:14})})]})]}):(0,t.jsx)("div",{style:{marginBottom:"32px",color:"#F87171"},children:"No active wallet found. Please configure your wallet in settings first."}),(0,t.jsxs)(tN,{children:[s&&(0,t.jsx)(tA,{type:"button",$variant:"primary",onClick:()=>{i(),c.push("/dashboard/links")},children:"Create Payment Link"}),(0,t.jsxs)(tA,{type:"button",$variant:"primary",onClick:()=>{i(),l?.()},children:[(0,t.jsx)(tm,{size:18,style:{marginRight:"8px",flexShrink:0}}),"Ask for a Payment"]}),(0,t.jsx)(tA,{type:"button",$variant:"secondary",onClick:i,children:"Close"})]})]})})})}function tM({label:e,value:a,href:n,isText:o}){return(0,t.jsxs)(i.default,{href:n,className:"glass-panel p-6 hover:bg-white/[0.04] transition-colors block",children:[(0,t.jsx)("p",{className:"text-gray-400 text-sm mb-2",children:e}),(0,t.jsx)("p",{className:o?"text-xl font-bold text-primary":"text-3xl font-bold",children:a})]})}function tI({href:e,icon:a,title:n,description:o}){return(0,t.jsxs)(i.default,{href:e,className:"glass-panel p-5 flex items-center justify-between gap-4 hover:bg-white/[0.04] transition-colors",children:[(0,t.jsxs)("div",{className:"flex items-center gap-4",children:[(0,t.jsx)("div",{className:"w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary",children:(0,t.jsx)(a,{size:20})}),(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"font-semibold",children:n}),(0,t.jsx)("p",{className:"text-sm text-gray-400",children:o})]})]}),(0,t.jsx)(u.ArrowRight,{className:"text-gray-500 shrink-0",size:18})]})}e.s(["default",0,function(){let[e,h]=(0,a.useState)({links:0,pos:0,hasWallet:!1}),[b,y]=(0,a.useState)(null),[w,j]=(0,a.useState)(null),[v,F]=(0,a.useState)(!1),[k,C]=(0,a.useState)(!1),[_,N]=(0,a.useState)(!1),[A,S]=(0,a.useState)(!1),[M,I]=(0,a.useState)(0),[O,z]=(0,a.useState)(!1),[R,T]=(0,a.useState)(null);return(0,a.useEffect)(()=>{let e=(0,n.onAuthStateChanged)(o.auth,async e=>{if(e)try{let t=await e.getIdToken(),[a,i,n]=await Promise.all([(0,s.listPaymentLinks)(t),(0,s.listPosDevices)(t),(0,r.getMerchantProfile)(t)]),o=n?.merchantWallet||null;if(h({links:a.length,pos:i.length,hasWallet:!!o}),y(o),j(n?.businessName?.trim()||null),o){(0,d.getLuxorEnv)();let e=(await (0,l.listPaymentRequests)(t,"payer",o)).data.filter(e=>"PENDING"===e.status);I(e.length)}}catch(e){console.error(e)}});return()=>e()},[]),(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("header",{className:"p-6 md:p-10 border-b border-white/5 bg-white/[0.01] flex flex-col md:flex-row md:justify-between md:items-end gap-4",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("h1",{className:"text-2xl font-bold mb-1",style:{fontFamily:"Outfit, sans-serif"},children:"Overview"}),(0,t.jsx)("p",{className:"text-gray-400 text-sm",style:{fontFamily:"Montserrat, sans-serif"},children:"Your Solana payment platform — links, POS, and API in one place."})]}),(0,t.jsxs)("div",{className:"flex flex-wrap gap-3",children:[(0,t.jsxs)("button",{onClick:()=>C(!0),className:"flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-blue-400/30 text-blue-400 font-medium hover:bg-white/5 transition-colors",style:{fontFamily:"Outfit, sans-serif"},children:[(0,t.jsx)(g,{size:18})," Receive"]}),(0,t.jsxs)("button",{onClick:()=>F(!0),className:"flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-medium hover:bg-blue-600 hover:text-white transition-colors",style:{fontFamily:"Outfit, sans-serif"},children:[(0,t.jsx)(x.Send,{size:18})," Send"]})]})]}),(0,t.jsxs)("div",{className:"p-6 md:p-10 max-w-5xl mx-auto space-y-8",children:[!e.hasWallet&&(0,t.jsx)("div",{className:"glass-panel p-4 border border-amber-500/30 bg-amber-500/5 text-sm",children:(0,t.jsxs)("p",{className:"text-amber-200",children:["Add your Solana wallet in"," ",(0,t.jsx)(i.default,{href:"/dashboard/settings",className:"underline font-medium",children:"Settings"})," ","to accept payments on links and POS."]})}),(0,t.jsx)(U,{merchantWallet:b}),M>0&&(0,t.jsxs)(i.default,{href:"/dashboard/requests",className:"flex items-center justify-between gap-4 p-4 rounded-2xl border transition-colors",style:{background:"rgba(96,165,250,0.06)",borderColor:"rgba(96,165,250,0.2)",textDecoration:"none"},children:[(0,t.jsxs)("div",{className:"flex items-center gap-3",children:[(0,t.jsx)("div",{style:{width:"36px",height:"36px",borderRadius:"9999px",background:"rgba(96,165,250,0.12)",border:"1px solid rgba(96,165,250,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:(0,t.jsx)(m.Bell,{size:16,style:{color:"#60A5FA"}})}),(0,t.jsxs)("div",{children:[(0,t.jsxs)("p",{style:{fontFamily:"Outfit, sans-serif",fontSize:"14px",fontWeight:500,color:"#FFFFFF",margin:0},children:[M," payment request",1!==M?"s":""," waiting for your action"]}),(0,t.jsx)("p",{style:{fontFamily:"Montserrat, sans-serif",fontSize:"12px",color:"rgba(255,255,255,0.45)",margin:0,fontWeight:300},children:"Review and pay or decline"})]})]}),(0,t.jsx)(u.ArrowRight,{size:16,style:{color:"#60A5FA",flexShrink:0}})]}),(0,t.jsxs)("div",{className:"grid md:grid-cols-3 gap-4",children:[(0,t.jsx)(tM,{label:"Payment links",value:e.links,href:"/dashboard/links"}),(0,t.jsx)(tM,{label:"POS devices",value:e.pos,href:"/dashboard/pos"}),(0,t.jsx)(tM,{label:"API",value:"Ready",href:"/dashboard/developers",isText:!0})]}),(0,t.jsxs)("section",{children:[(0,t.jsx)("h2",{className:"text-lg font-semibold mb-4",children:"Quick start"}),(0,t.jsxs)("div",{className:"grid gap-3",children:[(0,t.jsx)(tI,{href:"/dashboard/links",icon:c.Link,title:"Create a payment link",description:"Share a checkout URL on your website or social media."}),(0,t.jsx)(tI,{href:"/dashboard/pos",icon:p.Terminal,title:"Connect a POS terminal",description:"Register hardware and charge with your API key."}),(0,t.jsx)(tI,{href:"/dashboard/developers",icon:f.Code2,title:"Get API keys",description:"Integrate Luxor Pay like Stripe — REST on the same domain."})]})]})]}),(0,t.jsx)(ec,{isOpen:v,onClose:()=>F(!1),onSuccess:e=>{T(e),z(!0)}}),(0,t.jsx)(tS,{isOpen:_,onClose:()=>N(!1),merchantWallet:b,onAskForPayment:()=>S(!0)}),(0,t.jsx)(eu.PaymentRequestModal,{isOpen:A,onClose:()=>S(!1),requesterWallet:b}),(0,t.jsx)(ef,{isOpen:O,onClose:()=>z(!1),transferData:R}),(0,t.jsx)(tg,{isOpen:k,onClose:()=>C(!1),merchantWallet:b,recipientLabel:w,initialMode:"select",onCreatePaymentRequest:()=>S(!0)})]})}],30257)}]);