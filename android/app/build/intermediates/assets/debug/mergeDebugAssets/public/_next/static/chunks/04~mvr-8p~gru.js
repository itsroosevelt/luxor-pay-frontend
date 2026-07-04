(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,49838,e=>{"use strict";let i={"mainnet-beta":{EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v:"USDC",Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB:"USDT",So11111111111111111111111111111111111111112:"wSOL",DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263:"BONK",JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN:"JUP","2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo":"PYUSD",mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So:"mSOL","7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj":"stSOL",rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof:"RENDER",EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm:"WIF","3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE":"LXR"},devnet:{"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU":"USDC","3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE":"LXR",HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr:"EURC"}};e.s(["TOKEN_REGISTRY",0,i,"getTokenSymbol",0,function(e,a="devnet"){return e&&i[a]?.[e]||null}])},80629,e=>{"use strict";var i=e.i(41931);async function a(e){let a=await fetch((0,i.apiUrl)(`/api/payments/${e}`)),t=await a.json();if(!a.ok)throw Error(t.error??"Payment not found");return t.data}async function t(e){let a=await fetch((0,i.apiUrl)("/api/payments/verify"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reference:e})}),t=await a.json();if(!a.ok)throw Error(t.error??"Verification failed");return t}async function n(e){let a=await fetch((0,i.apiUrl)("/payment-links"),{headers:{Authorization:`Bearer ${e}`}}),t=await a.json();if(!a.ok)throw Error(t.message??"Failed to load links");return t.data}async function r(e){let a=await fetch((0,i.apiUrl)(`/payment-links/${e}`)),t=await a.json();if(!a.ok)throw Error(t.message??"Failed to load link");return t.data}async function o(e,a){let t=await fetch((0,i.apiUrl)("/payment-links"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(a)}),n=await t.json();if(!t.ok)throw Error(n.message??"Failed to create link");return n.data}async function s(e){let a=await fetch((0,i.apiUrl)("/pos/devices"),{headers:{Authorization:`Bearer ${e}`}}),t=await a.json();if(!a.ok)throw Error(t.message??"Failed to load POS devices");return t.data}async function d(e,a){let t=await fetch((0,i.apiUrl)("/pos/devices"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(a)}),n=await t.json();if(!t.ok)throw Error(n.message??"Failed to register device");return n.data}async function l(e,a){let t=await fetch((0,i.apiUrl)("/transfers/send"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(a)}),n=await t.json();if(!t.ok)throw Error(n.message??n.error??"Failed to send transfer");return n}e.s(["createPaymentLink",0,o,"createPosDevice",0,d,"fetchPayment",0,a,"getPaymentLink",0,r,"listPaymentLinks",0,n,"listPosDevices",0,s,"sendTransfer",0,l,"verifyPayment",0,t])},15471,e=>{"use strict";e.s(["getLuxorEnv",0,function(){return"development"}])},77071,e=>{"use strict";let i=(0,e.i(56420).default)("plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);e.s(["Plus",0,i],77071)},32781,e=>{"use strict";let i=(0,e.i(56420).default)("loader-circle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);e.s(["Loader2",0,i],32781)},8734,e=>{"use strict";let i=(0,e.i(56420).default)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);e.s(["Copy",0,i],8734)},82022,e=>{"use strict";let i=(0,e.i(56420).default)("external-link",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);e.s(["ExternalLink",0,i],82022)},79188,e=>{"use strict";var i=e.i(43476),a=e.i(71645);e.i(51718);var t=e.i(72779),n=e.i(59141),r=e.i(80629),o=e.i(8734),s=e.i(24007),d=e.i(77071),l=e.i(82022),p=e.i(32781),c=e.i(46696),f=e.i(18566),g=e.i(49838),u=e.i(15471),x=e.i(97053),h=e.i(46932),m=e.i(88653);let y=x.default.div.withConfig({displayName:"page__PageContainer",componentId:"sc-7920fa73-0"})`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`,b=x.default.header.withConfig({displayName:"page__Header",componentId:"sc-7920fa73-1"})`
  padding: 32px 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.01);

  @media (max-width: 768px) {
    padding: 24px;
  }
`,w=x.default.h1.withConfig({displayName:"page__Title",componentId:"sc-7920fa73-2"})`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0 0 8px 0;
  letter-spacing: -1px;
`,j=x.default.p.withConfig({displayName:"page__Subtitle",componentId:"sc-7920fa73-3"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
`,k=x.default.div.withConfig({displayName:"page__ContentLayout",componentId:"sc-7920fa73-4"})`
  padding: 40px;
  max-width: 1024px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 24px;
    gap: 24px;
  }
`,v=(0,x.default)(h.motion.div).withConfig({displayName:"page__GlassCard",componentId:"sc-7920fa73-5"})`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(40px);
  border-radius: 32px;
  padding: 32px;
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.4);

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 24px;
  }
`,F=x.default.h2.withConfig({displayName:"page__FormHeader",componentId:"sc-7920fa73-6"})`
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 24px 0;

  svg {
    color: #60A5FA;
  }
`,C=x.default.div.withConfig({displayName:"page__InputGrid",componentId:"sc-7920fa73-7"})`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`,S=x.default.div.withConfig({displayName:"page__InputGroup",componentId:"sc-7920fa73-8"})`
  display: flex;
  flex-direction: column;
  gap: 8px;
`,N=x.default.label.withConfig({displayName:"page__Label",componentId:"sc-7920fa73-9"})`
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
`,_=x.default.input.withConfig({displayName:"page__Input",componentId:"sc-7920fa73-10"})`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 14px 18px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #60A5FA;
    box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`,z=x.default.select.withConfig({displayName:"page__Select",componentId:"sc-7920fa73-11"})`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 14px 18px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;

  &:focus {
    outline: none;
    border-color: #60A5FA;
  }

  option, optgroup {
    background: #0A0A0A;
    color: #FFFFFF;
  }
`,E=x.default.button.withConfig({displayName:"page__Button",componentId:"sc-7920fa73-12"})`
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  padding: 14px 28px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  ${({$variant:e="primary"})=>"primary"===e&&`
    background: #FFFFFF;
    color: #000000;
    &:hover:not(:disabled) {
      background: #2563EB;
      color: #FFFFFF;
      box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);
    }
  `}

  ${({$variant:e})=>"secondary"===e&&`
    background: rgba(255, 255, 255, 0.05);
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.1);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }
  `}
`,L=x.default.div.withConfig({displayName:"page__LinksList",componentId:"sc-7920fa73-13"})`
  display: flex;
  flex-direction: column;
  gap: 16px;
`,A=(0,x.default)(h.motion.div).withConfig({displayName:"page__LinkItem",componentId:"sc-7920fa73-14"})`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`,I=x.default.div.withConfig({displayName:"page__LinkInfo",componentId:"sc-7920fa73-15"})`
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 0;
  width: 100%;
`,P=x.default.div.withConfig({displayName:"page__IconWrapper",componentId:"sc-7920fa73-16"})`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(96, 165, 250, 0.1);
  color: #60A5FA;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`,T=x.default.div.withConfig({displayName:"page__TextContent",componentId:"sc-7920fa73-17"})`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`,U=x.default.h3.withConfig({displayName:"page__LinkName",componentId:"sc-7920fa73-18"})`
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`,R=x.default.p.withConfig({displayName:"page__LinkDetails",componentId:"sc-7920fa73-19"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  strong {
    font-weight: 600;
    color: #60A5FA;
  }
`,O=x.default.div.withConfig({displayName:"page__ActionsGroup",componentId:"sc-7920fa73-20"})`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;

  @media (max-width: 640px) {
    width: 100%;
    
    button {
      flex: 1;
    }
  }
`,B=x.default.span.withConfig({displayName:"page__UrlSection",componentId:"sc-7920fa73-21"})`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 640px) {
    display: none;
  }
`,D=x.default.div.withConfig({displayName:"page__EmptyState",componentId:"sc-7920fa73-22"})`
  text-align: center;
  padding: 64px 24px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.01);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  p {
    font-family: 'Montserrat', sans-serif;
    font-size: 15px;
    font-weight: 300;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
  }
`,M=x.default.div.withConfig({displayName:"page__LoadingState",componentId:"sc-7920fa73-23"})`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    100% { transform: rotate(360deg); }
  }
`;e.s(["default",0,function(){let e=(0,f.useRouter)(),[x,h]=(0,a.useState)([]),[K,H]=(0,a.useState)(!0),[Y,G]=(0,a.useState)(""),[$,X]=(0,a.useState)(""),[J,q]=(0,a.useState)(""),[Z,W]=(0,a.useState)("USDC"),[V,Q]=(0,a.useState)(!1),[ee,ei]=(0,a.useState)(!1),ea=(0,u.getLuxorEnv)();(0,a.useEffect)(()=>{let e=(0,t.onAuthStateChanged)(n.auth,async e=>{if(e)try{let i=await e.getIdToken(),a=await (0,r.listPaymentLinks)(i);h(a)}catch{c.toast.error("Could not load links")}finally{H(!1)}});return()=>e()},[]);let et=async e=>{e.preventDefault();let i=n.auth.currentUser;if(!i)return;let a=parseFloat(J);if(!Y.trim()||!$.trim()||Number.isNaN(a)||a<=0)return void c.toast.error("Enter valid details for all fields");Q(!0);try{let e=await i.getIdToken(),t=await (0,r.createPaymentLink)(e,{name:Y.trim(),businessName:$.trim(),amount:a,currency:Z});h(e=>[t,...e]),G(""),X(""),q(""),ei(!1),c.toast.success("Payment link created")}catch(e){e instanceof Error&&"MERCHANT_WALLET_REQUIRED"===e.message?c.toast.error("Add your Solana wallet in Settings first"):c.toast.error("Could not create link. Check Firestore rules.")}finally{Q(!1)}};return(0,i.jsxs)(y,{children:[(0,i.jsx)(b,{children:(0,i.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"16px"},children:[(0,i.jsxs)("div",{children:[(0,i.jsx)(w,{children:"Payment Links"}),(0,i.jsx)(j,{children:"Checkout URLs for your website, email, or social."})]}),!ee&&(0,i.jsxs)(E,{$variant:"primary",onClick:()=>ei(!0),children:[(0,i.jsx)(d.Plus,{size:16})," Create Link"]})]})}),(0,i.jsxs)(k,{children:[(0,i.jsx)(m.AnimatePresence,{children:ee&&(0,i.jsx)(v,{initial:{opacity:0,height:0,overflow:"hidden"},animate:{opacity:1,height:"auto",overflow:"visible"},exit:{opacity:0,height:0,overflow:"hidden"},transition:{duration:.3},children:(0,i.jsxs)("form",{onSubmit:et,children:[(0,i.jsxs)(F,{children:[(0,i.jsx)(d.Plus,{size:24})," New Link"]}),(0,i.jsxs)(C,{children:[(0,i.jsxs)(S,{children:[(0,i.jsx)(N,{children:"Product or Service Name"}),(0,i.jsx)(_,{value:Y,onChange:e=>G(e.target.value),placeholder:"e.g. Premium Subscription",required:!0})]}),(0,i.jsxs)(S,{children:[(0,i.jsx)(N,{children:"Business Name"}),(0,i.jsx)(_,{value:$,onChange:e=>X(e.target.value),placeholder:"e.g. Acme Corp",required:!0})]}),(0,i.jsxs)(S,{children:[(0,i.jsx)(N,{children:"Amount"}),(0,i.jsx)(_,{type:"number",step:"any",min:"0.000001",value:J,onChange:e=>q(e.target.value),placeholder:"0.00",required:!0})]}),(0,i.jsxs)(S,{children:[(0,i.jsx)(N,{children:"Currency"}),(0,i.jsxs)(z,{value:Z,onChange:e=>W(e.target.value),children:[(0,i.jsx)("option",{value:"SOL",children:"Solana (SOL)"}),(0,i.jsx)("option",{value:"USDC",children:"USDC"}),(0,i.jsx)("option",{value:"USDT",children:"USDT"}),(0,i.jsx)("option",{value:"EURC",children:"EURC"}),"development"===ea?(0,i.jsx)("optgroup",{label:"Devnet Tokens",children:Object.entries(g.TOKEN_REGISTRY.devnet).map(([e,a])=>(0,i.jsx)("option",{value:a,children:a},a))}):(0,i.jsx)("optgroup",{label:"Mainnet Beta Tokens",children:Object.entries(g.TOKEN_REGISTRY["mainnet-beta"]).map(([e,a])=>(0,i.jsx)("option",{value:a,children:a},a))})]})]})]}),(0,i.jsxs)("div",{style:{display:"flex",justifyContent:"flex-end",gap:"12px"},children:[(0,i.jsx)(E,{type:"button",$variant:"secondary",onClick:()=>ei(!1),disabled:V,children:"Cancel"}),(0,i.jsx)(E,{type:"submit",$variant:"primary",disabled:V,children:V?(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(p.Loader2,{size:18,className:"animate-spin"})," Creating..."]}):(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(d.Plus,{size:18})," Create Link"]})})]})]})})}),K?(0,i.jsxs)(M,{children:[(0,i.jsx)(p.Loader2,{size:24})," Loading links..."]}):0===x.length?(0,i.jsxs)(D,{children:[(0,i.jsx)(s.Link,{size:32,color:"rgba(255, 255, 255, 0.2)"}),(0,i.jsx)("p",{children:"No links yet. Create your first payment link above."})]}):(0,i.jsx)(L,{children:x.map((a,t)=>(0,i.jsxs)(A,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{duration:.3,delay:.05*t},children:[(0,i.jsxs)(I,{children:[(0,i.jsx)(P,{children:(0,i.jsx)(s.Link,{size:24})}),(0,i.jsxs)(T,{children:[(0,i.jsx)(U,{children:a.name}),(0,i.jsxs)(R,{children:[(0,i.jsxs)("strong",{children:[a.amount," ",a.currency]}),(0,i.jsxs)(B,{children:[(0,i.jsx)("span",{style:{color:"rgba(255, 255, 255, 0.2)"},children:"•"}),(0,i.jsxs)("span",{children:["/pay/link/",a.id]})]})]})]})]}),(0,i.jsxs)(O,{children:[(0,i.jsxs)(E,{type:"button",$variant:"secondary",onClick:()=>{var e;return e=a.id,void(navigator.clipboard.writeText(`${window.location.origin}/pay/link/${e}`),c.toast.success("Link copied"))},children:[(0,i.jsx)(o.Copy,{size:16})," Copy"]}),(0,i.jsxs)(E,{type:"button",$variant:"secondary",onClick:()=>e.push(`/dashboard/links/preview/${a.id}`),children:[(0,i.jsx)(l.ExternalLink,{size:16})," Preview"]})]})]},a.id))})]})]})}])}]);