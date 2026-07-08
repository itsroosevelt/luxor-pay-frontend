(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,80629,e=>{"use strict";var i=e.i(41931);async function t(e){let t=await fetch((0,i.apiUrl)(`/api/payments/${e}`)),n=await t.json();if(!t.ok)throw Error(n.error??"Payment not found");return n.data}async function n(e){let t=await fetch((0,i.apiUrl)("/api/payments/verify"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reference:e})}),n=await t.json();if(!t.ok)throw Error(n.error??"Verification failed");return n}async function a(e){let t=await fetch((0,i.apiUrl)("/payment-links"),{headers:{Authorization:`Bearer ${e}`}}),n=await t.json();if(!t.ok)throw Error(n.message??"Failed to load links");return n.data}async function o(e){let t=await fetch((0,i.apiUrl)(`/payment-links/${e}`)),n=await t.json();if(!t.ok)throw Error(n.message??"Failed to load link");return n.data}async function r(e,t){let n=await fetch((0,i.apiUrl)("/payment-links"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(t)}),a=await n.json();if(!n.ok)throw Error(a.message??"Failed to create link");return a.data}async function s(e){let t=await fetch((0,i.apiUrl)("/pos/devices"),{headers:{Authorization:`Bearer ${e}`}}),n=await t.json();if(!t.ok)throw Error(n.message??"Failed to load POS devices");return n.data}async function d(e,t){let n=await fetch((0,i.apiUrl)("/pos/devices"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(t)}),a=await n.json();if(!n.ok)throw Error(a.message??"Failed to register device");return a.data}async function l(e,t){let n=await fetch((0,i.apiUrl)("/transfers/send"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(t)}),a=await n.json();if(!n.ok)throw Error(a.message??a.error??"Failed to send transfer");return a}e.s(["createPaymentLink",0,r,"createPosDevice",0,d,"fetchPayment",0,t,"getPaymentLink",0,o,"listPaymentLinks",0,a,"listPosDevices",0,s,"sendTransfer",0,l,"verifyPayment",0,n])},86206,e=>{"use strict";let i=(0,e.i(56420).default)("smartphone",[["rect",{width:"14",height:"20",x:"5",y:"2",rx:"2",ry:"2",key:"1yt0o3"}],["path",{d:"M12 18h.01",key:"mhygvu"}]]);e.s(["Smartphone",0,i],86206)},11241,e=>{"use strict";let i=(0,e.i(56420).default)("arrow-left",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);e.s(["ArrowLeft",0,i],11241)},81181,e=>{"use strict";var i=e.i(43476),t=e.i(71645),n=e.i(97053),a=e.i(46932),o=e.i(88653),r=e.i(18566),s=e.i(80629),d=e.i(11241);let l=(0,e.i(56420).default)("monitor",[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2",key:"48i651"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21",key:"1svkeh"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21",key:"vw1qmm"}]]);var p=e.i(86206),c=e.i(46696);let x=(0,n.default)(a.motion.div).withConfig({displayName:"PageClient__PageContainer",componentId:"sc-d2319618-0"})`
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 40px;
    gap: 32px;
  }
`,f=n.default.div.withConfig({displayName:"PageClient__Header",componentId:"sc-d2319618-1"})`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`,m=n.default.div.withConfig({displayName:"PageClient__TitleArea",componentId:"sc-d2319618-2"})`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`,g=n.default.button.withConfig({displayName:"PageClient__BackButton",componentId:"sc-d2319618-3"})`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 8px 16px;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`,h=n.default.h1.withConfig({displayName:"PageClient__Title",componentId:"sc-d2319618-4"})`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 32px;
  }
`,u=n.default.div.withConfig({displayName:"PageClient__ToggleContainer",componentId:"sc-d2319618-5"})`
  display: flex;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 4px;
  width: 100%;
  
  @media (min-width: 768px) {
    width: auto;
  }
`,y=n.default.button.withConfig({displayName:"PageClient__ToggleButton",componentId:"sc-d2319618-6"})`
  background: ${({$active:e})=>e?"#FFFFFF":"transparent"};
  color: ${({$active:e})=>e?"#000000":"rgba(255,255,255,0.6)"};
  border: none;
  border-radius: 9999px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;

  &:hover {
    color: ${({$active:e})=>e?"#000000":"#FFFFFF"};
  }
  
  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`,b=n.default.div.withConfig({displayName:"PageClient__ContentGrid",componentId:"sc-d2319618-7"})`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 3fr;
    gap: 32px;
  }
`,w=(0,n.default)(a.motion.div).withConfig({displayName:"PageClient__MetaCard",componentId:"sc-d2319618-8"})`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(40px);
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: fit-content;
  box-shadow: 0 16px 32px -8px rgba(0,0,0,0.4);

  @media (min-width: 768px) {
    padding: 32px;
    border-radius: 40px;
    box-shadow: 0 32px 64px -16px rgba(0,0,0,0.6);
  }
`,k=n.default.div.withConfig({displayName:"PageClient__MetaItem",componentId:"sc-d2319618-9"})`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,j=n.default.span.withConfig({displayName:"PageClient__MetaLabel",componentId:"sc-d2319618-10"})`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: #60A5FA;
`,C=n.default.span.withConfig({displayName:"PageClient__MetaValue",componentId:"sc-d2319618-11"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  word-break: break-all;

  @media (min-width: 768px) {
    font-size: 15px;
  }
`,F=n.default.div.withConfig({displayName:"PageClient__AmountValue",componentId:"sc-d2319618-12"})`
  font-family: 'Outfit', sans-serif;
  font-size: 36px;
  font-weight: 500;
  letter-spacing: -1px;
  background: linear-gradient(to right, #60A5FA, #2563EB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (min-width: 768px) {
    font-size: 48px;
  }
`,v=(0,n.default)(a.motion.div).withConfig({displayName:"PageClient__PreviewArea",componentId:"sc-d2319618-13"})`
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 24px;
  min-height: 400px;
  position: relative;

  @media (min-width: 768px) {
    padding: 40px;
    border-radius: 40px;
    min-height: 600px;
  }
`,P=(0,n.default)(a.motion.div).withConfig({displayName:"PageClient__MockContainer",componentId:"sc-d2319618-14"})`
  width: 100%;
  max-width: ${({$mode:e})=>"mobile"===e?"375px":"500px"};
  min-height: ${({$mode:e})=>"mobile"===e?"600px":"400px"};
  border: ${({$mode:e})=>"mobile"===e?"8px solid #222":"1px solid rgba(255,255,255,0.1)"};
  border-radius: ${({$mode:e})=>"mobile"===e?"32px":"24px"};
  overflow: hidden;
  box-shadow: 0 16px 32px -8px rgba(0,0,0,0.6);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  background: #0A0A0A;
  display: flex;
  flex-direction: column;
  padding: ${({$mode:e})=>"mobile"===e?"32px 20px":"40px 32px"};
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  @media (min-width: 768px) {
    border: ${({$mode:e})=>"mobile"===e?"12px solid #222":"1px solid rgba(255,255,255,0.1)"};
    border-radius: ${({$mode:e})=>"mobile"===e?"40px":"24px"};
    box-shadow: 0 32px 64px -16px rgba(0,0,0,0.8);
    min-height: ${({$mode:e})=>"mobile"===e?"812px":"600px"};
    padding: ${({$mode:e})=>"mobile"===e?"40px 24px":"48px 40px"};
  }
`,_=n.default.div.withConfig({displayName:"PageClient__MockBusiness",componentId:"sc-d2319618-15"})`
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #60A5FA;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 8px;

  @media (min-width: 768px) {
    font-size: 14px;
  }
`,A=n.default.div.withConfig({displayName:"PageClient__MockProduct",componentId:"sc-d2319618-16"})`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 500;
  color: #FFFFFF;
  margin-bottom: 24px;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 32px;
    margin-bottom: 40px;
  }
`,z=n.default.div.withConfig({displayName:"PageClient__MockAmount",componentId:"sc-d2319618-17"})`
  font-family: 'Outfit', sans-serif;
  font-size: 48px;
  font-weight: 500;
  letter-spacing: -2px;
  background: linear-gradient(to right, #60A5FA, #2563EB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 4px;

  @media (min-width: 768px) {
    font-size: 64px;
    margin-bottom: 8px;
  }
`,N=n.default.div.withConfig({displayName:"PageClient__MockCurrency",componentId:"sc-d2319618-18"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 40px;

  @media (min-width: 768px) {
    font-size: 20px;
    margin-bottom: 60px;
  }
`,I=n.default.div.withConfig({displayName:"PageClient__MockButton",componentId:"sc-d2319618-19"})`
  background: #FFFFFF;
  color: #000000;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  padding: 14px 24px;
  border-radius: 9999px;
  width: 100%;
  text-align: center;
  margin-top: auto;
  opacity: 0.8;
  box-sizing: border-box;

  @media (min-width: 768px) {
    font-size: 16px;
    padding: 16px 32px;
  }
`,$=n.default.div.withConfig({displayName:"PageClient__LoadingSpinner",componentId:"sc-d2319618-20"})`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(96, 165, 250, 0.3);
  border-radius: 50%;
  border-top-color: #60A5FA;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;e.s(["default",0,function(){let{id:e}=(0,r.useParams)(),n=(0,r.useRouter)(),[a,O]=(0,t.useState)(null),[S,T]=(0,t.useState)(!0),[B,M]=(0,t.useState)("mobile");return((0,t.useEffect)(()=>{let e=()=>{window.innerWidth<768&&M("mobile")};return e(),window.addEventListener("resize",e),()=>window.removeEventListener("resize",e)},[]),(0,t.useEffect)(()=>{async function i(){try{let i=await (0,s.getPaymentLink)(e);O(i)}catch(e){c.toast.error("Failed to load payment link details"),console.error(e)}finally{T(!1)}}e&&i()},[e]),S)?(0,i.jsx)(x,{style:{justifyContent:"center",alignItems:"center",minHeight:"60vh"},children:(0,i.jsx)($,{})}):a?(0,i.jsxs)(x,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{type:"spring",bounce:.4,duration:.8},children:[(0,i.jsxs)(f,{children:[(0,i.jsxs)(m,{children:[(0,i.jsxs)(g,{onClick:()=>n.back(),children:[(0,i.jsx)(d.ArrowLeft,{size:16})," Back"]}),(0,i.jsx)(h,{children:"Link Preview"})]}),(0,i.jsxs)(u,{children:[(0,i.jsxs)(y,{$active:"desktop"===B,onClick:()=>M("desktop"),children:[(0,i.jsx)(l,{size:16})," Desktop"]}),(0,i.jsxs)(y,{$active:"mobile"===B,onClick:()=>M("mobile"),children:[(0,i.jsx)(p.Smartphone,{size:16})," Mobile"]})]})]}),(0,i.jsxs)(b,{children:[(0,i.jsxs)(w,{children:[(0,i.jsxs)(k,{children:[(0,i.jsx)(j,{children:"Product / Service"}),(0,i.jsx)(C,{children:a.name})]}),(0,i.jsxs)(k,{children:[(0,i.jsx)(j,{children:"Business Name"}),(0,i.jsx)(C,{children:a.businessName||"N/A"})]}),(0,i.jsxs)(k,{children:[(0,i.jsx)(j,{children:"Amount"}),(0,i.jsxs)(F,{children:[a.amount," ",a.currency]})]}),(0,i.jsxs)(k,{children:[(0,i.jsx)(j,{children:"Target Merchant Wallet"}),(0,i.jsx)(C,{style:{fontFamily:"monospace",fontSize:"12px"},children:a.merchantWallet})]}),(0,i.jsxs)(k,{children:[(0,i.jsx)(j,{children:"Created At"}),(0,i.jsx)(C,{children:new Date(a.createdAt).toLocaleString()})]})]}),(0,i.jsx)(v,{children:(0,i.jsx)(o.AnimatePresence,{mode:"wait",children:(0,i.jsxs)(P,{$mode:B,initial:{opacity:0,scale:.95},animate:{opacity:1,scale:1},exit:{opacity:0,scale:.95},transition:{type:"spring",bounce:.2,duration:.6},children:[(0,i.jsx)(_,{children:a.businessName||"Merchant Name"}),(0,i.jsx)(A,{children:a.name}),(0,i.jsx)(z,{children:a.amount}),(0,i.jsx)(N,{children:a.currency}),(0,i.jsx)(I,{children:"Pay Now"})]},B)})})]})]}):(0,i.jsxs)(x,{children:[(0,i.jsx)(f,{children:(0,i.jsxs)(g,{onClick:()=>n.back(),children:[(0,i.jsx)(d.ArrowLeft,{size:16})," Back to Links"]})}),(0,i.jsx)("div",{style:{textAlign:"center",marginTop:"100px",color:"rgba(255,255,255,0.5)"},children:"Payment link not found."})]})}],81181)}]);