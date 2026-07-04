(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,72779,e=>{"use strict";var t=e.i(54716);e.s(["onAuthStateChanged",()=>t.z])},49838,e=>{"use strict";let t={"mainnet-beta":{EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v:"USDC",Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB:"USDT",So11111111111111111111111111111111111111112:"wSOL",DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263:"BONK",JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN:"JUP","2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo":"PYUSD",mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So:"mSOL","7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj":"stSOL",rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof:"RENDER",EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm:"WIF","3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE":"LXR"},devnet:{"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU":"USDC","3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE":"LXR",HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr:"EURC"}};e.s(["TOKEN_REGISTRY",0,t,"getTokenSymbol",0,function(e,n="devnet"){return e&&t[n]?.[e]||null}])},48161,e=>{"use strict";let t=(0,e.i(56420).default)("circle-check-big",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);e.s(["CheckCircle",0,t],48161)},18566,(e,t,n)=>{t.exports=e.r(76562)},80629,e=>{"use strict";var t=e.i(41931);async function n(e){let n=await fetch((0,t.apiUrl)(`/api/payments/${e}`)),i=await n.json();if(!n.ok)throw Error(i.error??"Payment not found");return i.data}async function i(e){let n=await fetch((0,t.apiUrl)("/api/payments/verify"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reference:e})}),i=await n.json();if(!n.ok)throw Error(i.error??"Verification failed");return i}async function a(e){let n=await fetch((0,t.apiUrl)("/payment-links"),{headers:{Authorization:`Bearer ${e}`}}),i=await n.json();if(!n.ok)throw Error(i.message??"Failed to load links");return i.data}async function r(e){let n=await fetch((0,t.apiUrl)(`/payment-links/${e}`)),i=await n.json();if(!n.ok)throw Error(i.message??"Failed to load link");return i.data}async function o(e,n){let i=await fetch((0,t.apiUrl)("/payment-links"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(n)}),a=await i.json();if(!i.ok)throw Error(a.message??"Failed to create link");return a.data}async function s(e){let n=await fetch((0,t.apiUrl)("/pos/devices"),{headers:{Authorization:`Bearer ${e}`}}),i=await n.json();if(!n.ok)throw Error(i.message??"Failed to load POS devices");return i.data}async function l(e,n){let i=await fetch((0,t.apiUrl)("/pos/devices"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(n)}),a=await i.json();if(!i.ok)throw Error(a.message??"Failed to register device");return a.data}async function c(e,n){let i=await fetch((0,t.apiUrl)("/transfers/send"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(n)}),a=await i.json();if(!i.ok)throw Error(a.message??a.error??"Failed to send transfer");return a}e.s(["createPaymentLink",0,o,"createPosDevice",0,l,"fetchPayment",0,n,"getPaymentLink",0,r,"listPaymentLinks",0,a,"listPosDevices",0,s,"sendTransfer",0,c,"verifyPayment",0,i])},17724,e=>{"use strict";var t=e.i(71645),n=e.i(49838);e.s(["useTokenPrice",0,function(e){let[i,a]=(0,t.useState)(null),[r,o]=(0,t.useState)(!0),[s,l]=(0,t.useState)(!1),[c,d]=(0,t.useState)(null),u=(0,t.useCallback)(async()=>{if(!e){a(null),o(!1),l(!1),d(null);return}let t=e.trim().toUpperCase();if("USDC"===t||"USDT"===t||"EURC"===t||"PYUSD"===t||"LXR"===t){a(1),o(!1),l(!1),d(null);return}o(!0),l(!1),d(null);try{let i=n.TOKEN_REGISTRY.Devnet||{},r="";if("SOL"===t)r="So11111111111111111111111111111111111111112";else{let e=Object.entries(i).find(([,e])=>e===t);e&&(r=e[0])}if(!r)throw Error(`Token mint not found for currency: ${e}`);let o=await fetch(`https://api.jup.ag/price/v3?ids=${r}`);if(!o.ok)throw Error(`Failed to fetch price from Jupiter: ${o.statusText}`);let s=await o.json(),l=s[r]?.usdPrice;if(null!=l)a(l);else if("SOL"===t)a(140);else throw Error(`Price not found for mint: ${r}`)}catch(e){l(!0),d(e.message||"Failed to fetch token price"),"SOL"===t?a(140):a(null)}finally{o(!1)}},[e]);return(0,t.useEffect)(()=>{u()},[u]),{data:i,isLoading:r,isError:s,errorMessage:c,refetch:u}}])},34722,e=>{"use strict";var t=e.i(43476),n=e.i(71645),i=e.i(18566),a=e.i(80629),r=e.i(49838),o=e.i(97053),s=e.i(46932),l=e.i(88653);e.i(51718);var c=e.i(72779),d=e.i(59141),u=e.i(48161),f=e.i(4290),p=e.i(17724);let m=o.default.div.withConfig({displayName:"PageClient__PageWrapper",componentId:"sc-769f7f22-0"})`
  min-height: 100vh;
  background: #000000;
  display: flex;
  flex-direction: column;
`,h=o.default.nav.withConfig({displayName:"PageClient__HeaderNav",componentId:"sc-769f7f22-1"})`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  @media (max-width: 768px) {
    padding: 16px 24px;
  }
`,g=o.default.div.withConfig({displayName:"PageClient__BrandLogo",componentId:"sc-769f7f22-2"})`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    color: #60A5FA;
  }
`,x=o.default.button.withConfig({displayName:"PageClient__HeaderButton",componentId:"sc-769f7f22-3"})`
  background: transparent;
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  padding: 10px 20px;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`,y=o.default.main.withConfig({displayName:"PageClient__MainContent",componentId:"sc-769f7f22-4"})`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`,w=o.default.footer.withConfig({displayName:"PageClient__Footer",componentId:"sc-769f7f22-5"})`
  padding: 24px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
`,b=(0,o.default)(s.motion.div).withConfig({displayName:"PageClient__CheckoutCard",componentId:"sc-769f7f22-6"})`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  text-align: center;
  box-shadow: 0 32px 64px -16px rgba(0,0,0,0.8);
`,C=o.default.div.withConfig({displayName:"PageClient__BusinessName",componentId:"sc-769f7f22-7"})`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #60A5FA;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 8px;
`,F=o.default.div.withConfig({displayName:"PageClient__ProductName",componentId:"sc-769f7f22-8"})`
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 500;
  color: #FFFFFF;
  margin-bottom: 32px;
`,k=o.default.div.withConfig({displayName:"PageClient__AmountText",componentId:"sc-769f7f22-9"})`
  font-family: 'Outfit', sans-serif;
  font-size: 56px;
  font-weight: 500;
  letter-spacing: -2px;
  background: linear-gradient(to right, #60A5FA, #2563EB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
`,j=o.default.div.withConfig({displayName:"PageClient__CurrencyText",componentId:"sc-769f7f22-10"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 40px;
`,P=o.default.button.withConfig({displayName:"PageClient__PayButton",componentId:"sc-769f7f22-11"})`
  background: #FFFFFF;
  color: #000000;
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 16px 32px;
  border-radius: 9999px;
  width: 100%;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #2563EB;
    color: #FFFFFF;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;e.s(["default",0,function(){let{id:o}=(0,i.useParams)(),s=(0,i.useRouter)(),[S,v]=(0,n.useState)(null),[E,N]=(0,n.useState)(null),[A,T]=(0,n.useState)(!0),[L,O]=(0,n.useState)(!1),[z,R]=(0,n.useState)(!1),[_,B]=(0,n.useState)(null),[U,D]=(0,n.useState)(new Date),[Y,K]=(0,n.useState)(null),[I,$]=(0,n.useState)("loading"),{data:H,isLoading:X}=(0,p.useTokenPrice)(S?.currency);(0,n.useEffect)(()=>{e.A(49070).then(({Capacitor:t})=>{t.isNativePlatform()?e.A(64578).then(({Geolocation:e})=>{e.getCurrentPosition({enableHighAccuracy:!0,maximumAge:6e4}).then(e=>{K({latitude:e.coords.latitude,longitude:e.coords.longitude}),$("granted")}).catch(e=>{console.error("Capacitor Geolocation error:",e),$("denied")})}):!("u"<typeof navigator)&&"geolocation"in navigator?navigator.geolocation.getCurrentPosition(e=>{K({latitude:e.coords.latitude,longitude:e.coords.longitude}),$("granted")},e=>{console.error("Geolocation error:",e),$("denied")},{enableHighAccuracy:!0,maximumAge:6e4}):$("denied")})},[]);let G=(()=>{if(!S||!S.amount||null===H)return null;try{return new f.Decimal(S.amount).mul(H).toNumber()}catch{return null}})();(0,n.useEffect)(()=>{let e=(0,c.onAuthStateChanged)(d.auth,e=>{B(e)});return()=>e()},[]),(0,n.useEffect)(()=>{let e=setInterval(()=>D(new Date),1e3);return()=>clearInterval(e)},[]),(0,n.useEffect)(()=>{o&&(T(!0),(0,a.getPaymentLink)(o).then(e=>{v(e),T(!1)}).catch(e=>{N(e instanceof Error?e.message:"Failed to load payment link"),T(!1)}))},[o]);let J=async()=>{if(!_)return void s.push(`/login?mode=login&redirect=/pay/link/${o}`);if(o&&S){O(!0),N(null);try{let e,t=await _.getIdToken();console.log("NEXT_PUBLIC_SOLANA_NETWORK","Devnet");let n="devnet",i=r.TOKEN_REGISTRY[n];if("SOL"!==S.currency){let t=Object.entries(i||{}).find(([e,t])=>t===S.currency);if(t)e=t[0];else throw Error(`Currency ${S.currency} is not supported on ${n}`)}if("granted"!==I||!Y)throw Error("Geolocation permission is required to complete this payment.");await (0,a.sendTransfer)(t,{toWallet:S.merchantWallet,amount:S.amount.toString(),mint:e,reference:`Payment for ${S.name}`,...Y}),R(!0)}catch(e){N(e instanceof Error?e.message:"Could not execute payment")}finally{O(!1)}}};return A?(0,t.jsx)(m,{children:(0,t.jsx)(y,{children:(0,t.jsx)("div",{className:"w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"})})}):E||!S?(0,t.jsx)(m,{children:(0,t.jsx)(y,{children:(0,t.jsx)("div",{className:"glass-panel p-8 max-w-md text-center text-red-400",children:E||"Link not found"})})}):(0,t.jsxs)(m,{children:[(0,t.jsxs)(h,{children:[(0,t.jsxs)(g,{children:["Luxor ",(0,t.jsx)("span",{children:"Pay"})]}),_?(0,t.jsx)(x,{onClick:()=>s.push("/dashboard"),children:"Dashboard"}):(0,t.jsx)(x,{onClick:()=>s.push(`/login?redirect=/pay/link/${o}`),children:"Login / Create Account"})]}),(0,t.jsx)(y,{children:(0,t.jsx)(l.AnimatePresence,{mode:"wait",children:z?(0,t.jsxs)(b,{initial:{opacity:0,scale:.95},animate:{opacity:1,scale:1},transition:{type:"spring",bounce:.4,duration:.8},style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"16px"},children:[(0,t.jsx)(u.CheckCircle,{size:64,color:"#60A5FA"}),(0,t.jsx)(F,{style:{marginBottom:"8px"},children:"Payment Successful!"}),(0,t.jsx)(j,{children:"Your transfer has been confirmed on-chain."}),(0,t.jsx)(P,{onClick:()=>s.push("/dashboard"),children:"Return to Dashboard"})]},"success"):(0,t.jsxs)(b,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},exit:{opacity:0,scale:.95},transition:{type:"spring",bounce:.4,duration:.8},children:[(0,t.jsx)(C,{children:S.businessName||"Merchant Checkout"}),(0,t.jsx)(F,{children:S.name}),(0,t.jsx)(k,{children:null!==G?`$${G.toFixed(2)}`:X?"$...":`$${(parseFloat(String(S.amount||"0"))*(H??0)).toFixed(2)}`}),(0,t.jsxs)(j,{children:[parseFloat(String(S.amount||"0")).toFixed("SOL"===S.currency?9:2)," ",S.currency]}),E&&(0,t.jsx)("div",{className:"mb-4 text-red-400 text-sm",children:E}),"denied"===I&&(0,t.jsx)("div",{className:"mb-4 text-red-400 text-sm",children:"Location access is required to proceed with this payment. Please allow location access in your browser."}),(0,t.jsx)(P,{onClick:J,disabled:L||"granted"!==I,children:_?L?"Processing Payment...":"loading"===I?"Requesting Location...":"denied"===I?"Location Required":"Pay Now":"Login to Pay"})]},"checkout")})}),(0,t.jsxs)(w,{children:[(0,t.jsxs)("p",{children:["Luxor Pay © ",U.getFullYear(),". All rights reserved."]}),(0,t.jsxs)("p",{style:{marginTop:"8px"},children:[U.toLocaleDateString()," ",U.toLocaleTimeString()]})]})]})}])},49070,e=>{e.v(e=>Promise.resolve().then(()=>e(82568)))},64578,e=>{e.v(t=>Promise.all(["static/chunks/0d1ns6obtui6m.js"].map(t=>e.l(t))).then(()=>t(92972)))}]);