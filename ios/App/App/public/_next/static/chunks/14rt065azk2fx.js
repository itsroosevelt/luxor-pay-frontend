(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,82022,e=>{"use strict";let t=(0,e.i(56420).default)("external-link",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);e.s(["ExternalLink",0,t],82022)},49838,e=>{"use strict";let t={"mainnet-beta":{EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v:"USDC",Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB:"USDT",So11111111111111111111111111111111111111112:"wSOL",DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263:"BONK",JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN:"JUP","2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo":"PYUSD",mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So:"mSOL","7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj":"stSOL",rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof:"RENDER",EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm:"WIF","3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE":"LXR"},devnet:{"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU":"USDC","3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE":"LXR",HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr:"EURC"}};e.s(["TOKEN_REGISTRY",0,t,"getTokenSymbol",0,function(e,i="devnet"){return e&&t[i]?.[e]||null}])},18566,(e,t,i)=>{t.exports=e.r(76562)},80629,e=>{"use strict";var t=e.i(41931);async function i(e){let i=await fetch((0,t.apiUrl)(`/api/payments/${e}`)),a=await i.json();if(!i.ok)throw Error(a.error??"Payment not found");return a.data}async function a(e){let i=await fetch((0,t.apiUrl)("/api/payments/verify"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reference:e})}),a=await i.json();if(!i.ok)throw Error(a.error??"Verification failed");return a}async function n(e){let i=await fetch((0,t.apiUrl)("/payment-links"),{headers:{Authorization:`Bearer ${e}`}}),a=await i.json();if(!i.ok)throw Error(a.message??"Failed to load links");return a.data}async function r(e){let i=await fetch((0,t.apiUrl)(`/payment-links/${e}`)),a=await i.json();if(!i.ok)throw Error(a.message??"Failed to load link");return a.data}async function o(e,i){let a=await fetch((0,t.apiUrl)("/payment-links"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(i)}),n=await a.json();if(!a.ok)throw Error(n.message??"Failed to create link");return n.data}async function s(e){let i=await fetch((0,t.apiUrl)("/pos/devices"),{headers:{Authorization:`Bearer ${e}`}}),a=await i.json();if(!i.ok)throw Error(a.message??"Failed to load POS devices");return a.data}async function l(e,i){let a=await fetch((0,t.apiUrl)("/pos/devices"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(i)}),n=await a.json();if(!a.ok)throw Error(n.message??"Failed to register device");return n.data}async function c(e,i){let a=await fetch((0,t.apiUrl)("/transfers/send"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(i)}),n=await a.json();if(!a.ok)throw Error(n.message??n.error??"Failed to send transfer");return n}e.s(["createPaymentLink",0,o,"createPosDevice",0,l,"fetchPayment",0,i,"getPaymentLink",0,r,"listPaymentLinks",0,n,"listPosDevices",0,s,"sendTransfer",0,c,"verifyPayment",0,a])},17724,e=>{"use strict";var t=e.i(71645),i=e.i(49838);e.s(["useTokenPrice",0,function(e){let[a,n]=(0,t.useState)(null),[r,o]=(0,t.useState)(!0),[s,l]=(0,t.useState)(!1),[c,d]=(0,t.useState)(null),u=(0,t.useCallback)(async()=>{if(!e){n(null),o(!1),l(!1),d(null);return}let t=e.trim().toUpperCase();if("USDC"===t||"USDT"===t||"EURC"===t||"PYUSD"===t||"LXR"===t){n(1),o(!1),l(!1),d(null);return}o(!0),l(!1),d(null);try{let a=i.TOKEN_REGISTRY.Devnet||{},r="";if("SOL"===t)r="So11111111111111111111111111111111111111112";else{let e=Object.entries(a).find(([,e])=>e===t);e&&(r=e[0])}if(!r)throw Error(`Token mint not found for currency: ${e}`);let o=await fetch(`https://api.jup.ag/price/v3?ids=${r}`);if(!o.ok)throw Error(`Failed to fetch price from Jupiter: ${o.statusText}`);let s=await o.json(),l=s[r]?.usdPrice;if(null!=l)n(l);else if("SOL"===t)n(140);else throw Error(`Price not found for mint: ${r}`)}catch(e){l(!0),d(e.message||"Failed to fetch token price"),"SOL"===t?n(140):n(null)}finally{o(!1)}},[e]);return(0,t.useEffect)(()=>{u()},[u]),{data:a,isLoading:r,isError:s,errorMessage:c,refetch:u}}])},68877,e=>{"use strict";let t=(0,e.i(56420).default)("arrow-right",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);e.s(["ArrowRight",0,t],68877)},84026,e=>{"use strict";let t=(0,e.i(56420).default)("shield-check",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);e.s(["ShieldCheck",0,t],84026)},72779,e=>{"use strict";var t=e.i(54716);e.s(["onAuthStateChanged",()=>t.z])},50751,e=>{"use strict";var t=e.i(41931);async function i(e){let i,a=e.trim();if(!a)return null;try{i=await fetch((0,t.apiUrl)(`/merchants/wallet/${encodeURIComponent(a)}`),{headers:{"Content-Type":"application/json"}})}catch{return null}if(404===i.status)return null;let n=await i.json().catch(()=>({}));return i.ok?n.data??n:null}async function a(e){let i;try{i=await fetch((0,t.apiUrl)("/merchants/me"),{headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"}})}catch{return null}if(404===i.status)return null;let a=await i.json().catch(()=>({}));return i.ok?a.data??a:(i.status,null)}async function n(e,i){let a;try{a=await fetch((0,t.apiUrl)("/merchants"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(i)})}catch{throw Error("Unable to reach API")}let n=await a.json().catch(()=>({}));if(!a.ok)throw Error(n.message??"Failed to create merchant profile");return n.data??n}async function r(e,t){try{let i=await a(e);return i||(i=await n(e,{email:t,businessName:"",merchantWallet:"",solanaToken:""})),i}catch{return null}}async function o(e,i){let a;try{a=await fetch((0,t.apiUrl)("/merchants/me"),{method:"PATCH",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(i)})}catch{throw Error("Unable to reach API")}let n=await a.json().catch(()=>({}));if(!a.ok)throw Error(n.message??"Failed to update merchant profile");return n.data??n}e.s(["ensureMerchantProfile",0,r,"getMerchantProfile",0,a,"getMerchantProfileByWallet",0,i,"updateMerchantProfile",0,o])},99847,e=>{"use strict";let t=(0,e.i(56420).default)("circle-alert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);e.s(["AlertCircle",0,t],99847)},48161,e=>{"use strict";let t=(0,e.i(56420).default)("circle-check-big",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);e.s(["CheckCircle",0,t],48161)},90446,e=>{"use strict";var t=e.i(41931);async function i(e){let i=await fetch((0,t.apiUrl)("/contacts"),{method:"GET",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"}});if(!i.ok)throw Error((await i.json().catch(()=>({}))).message||"Failed to fetch contacts");return i.json()}async function a(e,i){let a=await fetch((0,t.apiUrl)("/contacts"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(i)});if(!a.ok)throw Error((await a.json().catch(()=>({}))).message||"Failed to create contact");return a.json()}async function n(e,i,a){let n=await fetch((0,t.apiUrl)(`/contacts/${i}`),{method:"PATCH",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(a)});if(!n.ok)throw Error((await n.json().catch(()=>({}))).message||"Failed to update contact");return{data:await n.json()}}async function r(e,i){let a=await fetch((0,t.apiUrl)(`/contacts/${i}`),{method:"DELETE",headers:{Authorization:`Bearer ${e}`}});if(!a.ok)throw Error((await a.json().catch(()=>({}))).message||"Failed to delete contact");return a.json()}e.s(["createContact",0,a,"deleteContact",0,r,"getContacts",0,i,"updateContact",0,n])},13222,81831,e=>{"use strict";e.i(47167);var t=e.i(27261),i=e.i(49838);function a(){return"devnet"}function n({recipient:e,amount:t,splToken:i,reference:a,label:r,message:o,memo:s}){let l=new URL(`solana:${e}`);return null!=t&&""!==t&&l.searchParams.append("amount",String(t)),i&&l.searchParams.append("spl-token",i),(a?Array.isArray(a)?a:[a]:[]).forEach(e=>l.searchParams.append("reference",e)),r&&l.searchParams.append("label",r),o&&l.searchParams.append("message",o),s&&l.searchParams.append("memo",s),l.toString()}e.s(["buildOpenAmountQrUrl",0,function(e,t="Luxor Pay"){return n({recipient:e,label:t})},"encodeSolanaPayUrl",0,n,"generatePaymentReference",0,function(){return t.Keypair.generate().publicKey.toBase58()},"getMintForSymbol",0,function(e){let t=e.trim().toUpperCase();if("SOL"===t)return null;let n=a(),r=Object.entries(i.TOKEN_REGISTRY[n]??{}).find(([,e])=>e.toUpperCase()===t);return r?.[0]??null},"getSolanaNetwork",0,a,"parseSolanaPayUrl",0,function(e){let t=e.trim();if(!t.startsWith("solana:"))return null;try{let e=new URL(t.replace("solana:","http://localhost/")),i=e.pathname.replace(/^\//,"");if(!i)return null;return{recipient:i,amount:e.searchParams.get("amount")??void 0,splToken:e.searchParams.get("spl-token")??void 0,references:e.searchParams.getAll("reference"),label:e.searchParams.get("label")??void 0,message:e.searchParams.get("message")??void 0,memo:e.searchParams.get("memo")??void 0}}catch{return null}}],81831);let r=new Set(["luxor pay",""]);function o({recipient:e,amount:t,currency:i="SOL",label:a,chargeRef:n,invoiceRef:r,expiry:s,usdAmount:l,message:c}){let d=new URLSearchParams;return d.set("recipient",e),t&&(d.set("amount",t),d.set("currency",i)),a&&d.set("label",a),n&&d.set("chargeRef",n),r&&d.set("invoiceRef",r),s&&d.set("expiry",s),l&&d.set("usdAmount",l),c&&d.set("message",c),`/pay/qr?${d.toString()}`}e.s(["buildLuxorPayCheckoutPath",0,o,"buildLuxorPayCheckoutPathFromSolanaPay",0,function(e){let t="SOL";return e.splToken&&(t=(0,i.getTokenSymbol)(e.splToken,a())??"SOL"),o({recipient:e.recipient,amount:e.amount,currency:t,label:e.label,chargeRef:e.references[0],message:e.message??e.memo})},"isGenericCheckoutLabel",0,function(e){return!e?.trim()||r.has(e.trim().toLowerCase())}],13222)},16182,50932,e=>{"use strict";var t=e.i(41931);async function i(e,i){let a=new URL((0,t.apiUrl)("/solana/balance"));a.searchParams.append("publicKey",i);let n=await fetch(a.toString(),{headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"}}),r=await n.json();if(!n.ok)throw Error(r.message?.[0]||r.message||r.error||"Failed to fetch wallet balance");return r.data}e.s(["getWalletBalance",0,i],16182),e.i(47167);var a=e.i(43476),n=e.i(97053),r=e.i(46932),o=e.i(88653),s=e.i(82022),l=e.i(48161);let c=(0,n.default)(r.motion.div).withConfig({displayName:"PaymentSuccessModal__Overlay",componentId:"sc-da6e7bc6-0"})`
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
`,d=(0,n.default)(r.motion.div).withConfig({displayName:"PaymentSuccessModal__ModalContent",componentId:"sc-da6e7bc6-1"})`
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 32px 64px -16px rgba(0,0,0,0.8);
  border-radius: 40px;
  width: 100%;
  max-width: 500px;
  padding: 40px;
  position: relative;
  text-align: center;
`,u=n.default.div.withConfig({displayName:"PaymentSuccessModal__IconContainer",componentId:"sc-da6e7bc6-2"})`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(96, 165, 250, 0.1);
  color: #60A5FA;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px auto;

  svg {
    width: 40px;
    height: 40px;
  }
`,p=n.default.h2.withConfig({displayName:"PaymentSuccessModal__Title",componentId:"sc-da6e7bc6-3"})`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #FFFFFF;
  margin: 0 0 8px 0;
`,f=n.default.p.withConfig({displayName:"PaymentSuccessModal__Subtitle",componentId:"sc-da6e7bc6-4"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 32px 0;
`,h=n.default.div.withConfig({displayName:"PaymentSuccessModal__DetailsBox",componentId:"sc-da6e7bc6-5"})`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 24px;
  text-align: left;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`,m=n.default.div.withConfig({displayName:"PaymentSuccessModal__DetailRow",componentId:"sc-da6e7bc6-6"})`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,g=n.default.span.withConfig({displayName:"PaymentSuccessModal__DetailLabel",componentId:"sc-da6e7bc6-7"})`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #60A5FA;
  text-transform: uppercase;
`,x=n.default.span.withConfig({displayName:"PaymentSuccessModal__DetailValue",componentId:"sc-da6e7bc6-8"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  color: #FFFFFF;
  word-break: break-all;
`,y=n.default.button.withConfig({displayName:"PaymentSuccessModal__Button",componentId:"sc-da6e7bc6-9"})`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 14px 24px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  background: #FFFFFF;
  color: #000000;
  width: 100%;
  transition: all 0.2s;

  &:hover {
    background: #2563EB;
    color: #FFFFFF;
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;e.s(["PaymentSuccessModal",0,function({isOpen:e,onClose:t,data:i,title:n="Transfer Successful",subtitle:r="Your funds have been sent to the network.",doneLabel:b="Done"}){var w;let F;return e&&i?(0,a.jsx)(o.AnimatePresence,{children:(0,a.jsx)(c,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:t,children:(0,a.jsxs)(d,{onClick:e=>e.stopPropagation(),initial:{opacity:0,scale:.95,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:20},transition:{type:"spring",bounce:.4,duration:.6},children:[(0,a.jsx)(u,{children:(0,a.jsx)(l.CheckCircle,{})}),(0,a.jsx)(p,{children:n}),(0,a.jsx)(f,{children:r}),(0,a.jsxs)(h,{children:[(0,a.jsxs)(m,{children:[(0,a.jsx)(g,{children:"AMOUNT"}),(0,a.jsxs)(x,{children:[i.amount," ",i.symbol]})]}),(0,a.jsxs)(m,{children:[(0,a.jsx)(g,{children:"RECIPIENT"}),(0,a.jsx)(x,{children:i.toNickname?`${i.toNickname} (${i.toWallet})`:i.toWallet})]}),i.reference&&(0,a.jsxs)(m,{children:[(0,a.jsx)(g,{children:"REFERENCE"}),(0,a.jsx)(x,{children:i.reference})]}),i.signature&&(0,a.jsxs)(m,{children:[(0,a.jsx)(g,{children:"SIGNATURE"}),(0,a.jsxs)(x,{className:"flex items-center gap-2",children:[i.signature.slice(0,8),"...",i.signature.slice(-8),(0,a.jsx)("a",{href:(w=i.signature,F=`https://explorer.solana.com/tx/${w}`,`${F}?cluster=Devnet`),target:"_blank",rel:"noreferrer",className:"text-blue-400 hover:text-white transition-colors",children:(0,a.jsx)(s.ExternalLink,{size:14})})]})]})]}),(0,a.jsx)(y,{onClick:t,children:b})]})})}):null}],50932)},66345,e=>{"use strict";e.i(47167);var t=e.i(43476),i=e.i(71645),a=e.i(18566),n=e.i(97053),r=e.i(46932),o=e.i(88653);e.i(51718);var s=e.i(72779),l=e.i(59141),c=e.i(80629),d=e.i(90446),u=e.i(13222),p=e.i(50751),f=e.i(16182);function h(e){let t=e.trim();if(!t||"."===t||t.endsWith("."))return null;let i=Number(t);return!Number.isFinite(i)||i<=0?null:i}let m=/lamports|simulation failed|transfer failed|custom program error|program log|error code|0x[0-9a-f]{4,}|blockhash not found|transaction simulation|insufficient funds/i;var g=e.i(49838),x=e.i(50932),y=e.i(4290),b=e.i(17724),w=e.i(68877),F=e.i(84026),C=e.i(99847);let j=n.default.div.withConfig({displayName:"PayQrClient__PageWrapper",componentId:"sc-3b50cd9e-0"})`
  min-height: 100vh;
  background: #0A0A0A;
  display: flex;
  flex-direction: column;
  color: #EDEDED;
`,k=n.default.nav.withConfig({displayName:"PayQrClient__HeaderNav",componentId:"sc-3b50cd9e-1"})`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  @media (max-width: 768px) {
    padding: 16px 24px;
  }
`,P=n.default.div.withConfig({displayName:"PayQrClient__BrandLogo",componentId:"sc-3b50cd9e-2"})`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    background: linear-gradient(to right, #60A5FA, #2563EB);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 700;
  }
`,S=n.default.button.withConfig({displayName:"PayQrClient__HeaderButton",componentId:"sc-3b50cd9e-3"})`
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

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`,v=n.default.main.withConfig({displayName:"PayQrClient__MainContent",componentId:"sc-3b50cd9e-4"})`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
`,A=(0,n.default)(r.motion.div).withConfig({displayName:"PayQrClient__CheckoutCard",componentId:"sc-3b50cd9e-5"})`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(40px);
  border-radius: 40px;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.6);

  @media (max-width: 480px) {
    padding: 24px;
    border-radius: 32px;
  }
`,N=n.default.h1.withConfig({displayName:"PayQrClient__HeaderTitle",componentId:"sc-3b50cd9e-6"})`
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #FFFFFF;
  margin: 0 0 8px 0;
  text-align: center;
`,E=n.default.p.withConfig({displayName:"PayQrClient__HeaderSubtitle",componentId:"sc-3b50cd9e-7"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 32px 0;
  text-align: center;
  line-height: 1.5;
`,z=n.default.div.withConfig({displayName:"PayQrClient__CardSection",componentId:"sc-3b50cd9e-8"})`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 24px;
  min-width: 0;
  box-sizing: border-box;
`,_=n.default.span.withConfig({displayName:"PayQrClient__Label",componentId:"sc-3b50cd9e-9"})`
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #60A5FA;
  text-transform: uppercase;
  margin-bottom: 12px;
`,T=n.default.div.withConfig({displayName:"PayQrClient__InfoRow",componentId:"sc-3b50cd9e-10"})`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`,I=n.default.span.withConfig({displayName:"PayQrClient__InfoLabel",componentId:"sc-3b50cd9e-11"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
`,L=n.default.span.withConfig({displayName:"PayQrClient__InfoValue",componentId:"sc-3b50cd9e-12"})`
  font-family: monospace;
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
`,O=n.default.span.withConfig({displayName:"PayQrClient__RecipientNameValue",componentId:"sc-3b50cd9e-13"})`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  flex: 1;
`,R=n.default.div.withConfig({displayName:"PayQrClient__AmountContainer",componentId:"sc-3b50cd9e-14"})`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  margin-bottom: 32px;
`,U=n.default.span.withConfig({displayName:"PayQrClient__CurrencyBadge",componentId:"sc-3b50cd9e-15"})`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #60A5FA;
  background: rgba(96, 165, 250, 0.1);
  padding: 4px 12px;
  border-radius: 9999px;
  margin-top: 8px;
`,M=n.default.button.withConfig({displayName:"PayQrClient__ActionButton",componentId:"sc-3b50cd9e-16"})`
  width: 100%;
  padding: 16px;
  border-radius: 9999px;
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

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
    }
  `}

  ${({$variant:e})=>"secondary"===e&&`
    background: transparent;
    color: #60A5FA;
    border: 1px solid rgba(255, 255, 255, 0.2);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.05);
    }
  `}
`,B=n.default.div.withConfig({displayName:"PayQrClient__ErrorBox",componentId:"sc-3b50cd9e-17"})`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 16px;
  padding: 16px;
  color: #F87171;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
`,D=n.default.div.withConfig({displayName:"PayQrClient__InputWrapper",componentId:"sc-3b50cd9e-18"})`
  display: flex;
  gap: 12px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
`,$=n.default.input.withConfig({displayName:"PayQrClient__NumberInput",componentId:"sc-3b50cd9e-19"})`
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 14px 16px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 500;
  text-align: center;
  transition: all 0.2s;

  @media (min-width: 480px) {
    font-size: 24px;
    padding: 14px 20px;
  }

  &:focus {
    outline: none;
    border-color: #60A5FA;
    box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.2);
  }
`,Q=n.default.select.withConfig({displayName:"PayQrClient__DropdownSelect",componentId:"sc-3b50cd9e-20"})`
  flex-shrink: 0;
  width: 110px;
  max-width: 38%;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 14px 12px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #60A5FA;
  }

  option {
    background: #0A0A0A;
    color: #FFFFFF;
  }
`,W=n.default.div.withConfig({displayName:"PayQrClient__NetworkBadge",componentId:"sc-3b50cd9e-21"})`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #60A5FA;
  background: rgba(96, 165, 250, 0.08);
  border: 1px solid rgba(96, 165, 250, 0.15);
  padding: 6px 12px;
  border-radius: 9999px;
  width: fit-content;
  margin: 0 auto 24px auto;
`,G=n.default.div.withConfig({displayName:"PayQrClient__Spinner",componentId:"sc-3b50cd9e-22"})`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;function H(e,t){return e.trim().toLowerCase()===t.trim().toLowerCase()}e.s(["default",0,function(){let n=(0,a.useRouter)(),r=(0,a.useSearchParams)(),K=r.get("recipient")??"",Y=r.get("amount"),q=r.get("currency")??"SOL",J=r.get("label")??"",X=r.get("invoiceRef")??"",V=r.get("expiry")??"",Z=r.get("usdAmount"),ee=r.get("message")??"",et=!!Y,[ei,ea]=(0,i.useState)(""),[en,er]=(0,i.useState)(q),[eo,es]=(0,i.useState)(null),[el,ec]=(0,i.useState)(!1),[ed,eu]=(0,i.useState)(null),[ep,ef]=(0,i.useState)(null),[eh,em]=(0,i.useState)(null),[eg,ex]=(0,i.useState)(null),[ey,eb]=(0,i.useState)(()=>Date.now()),[ew,eF]=(0,i.useState)(""),[eC,ej]=(0,i.useState)(null),[ek,eP]=(0,i.useState)("loading");(0,i.useEffect)(()=>{e.A(49070).then(({Capacitor:t})=>{t.isNativePlatform()?e.A(64578).then(({Geolocation:e})=>{e.getCurrentPosition({enableHighAccuracy:!0,maximumAge:6e4}).then(e=>{ej({latitude:e.coords.latitude,longitude:e.coords.longitude}),eP("granted")}).catch(e=>{console.error("Capacitor Geolocation error:",e),eP("denied")})}):!("u"<typeof navigator)&&"geolocation"in navigator?navigator.geolocation.getCurrentPosition(e=>{ej({latitude:e.coords.latitude,longitude:e.coords.longitude}),eP("granted")},e=>{console.error("Geolocation error:",e),eP("denied")},{enableHighAccuracy:!0,maximumAge:6e4}):eP("denied")})},[]),(0,i.useEffect)(()=>{eF(new Date().toLocaleDateString(void 0,{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"}))},[]),(0,i.useEffect)(()=>{let e=setInterval(()=>eb(Date.now()),1e3);return()=>clearInterval(e)},[]);let eS=(0,i.useMemo)(()=>{if(!V)return!1;let e=parseInt(V,10);return!isNaN(e)&&ey>e},[V,ey]),ev=et?Y??"":ei,eA=et?q:en,{data:eN,isLoading:eE}=(0,b.useTokenPrice)(eA),ez=(()=>{if(Z){let e=parseFloat(Z);if(!isNaN(e)&&e>0)return e}if(!ev||null===eN)return null;try{return new y.Decimal(ev).mul(eN).toNumber()}catch{return null}})(),e_=r.toString(),eT=e_?`/pay/qr?${e_}`:"/pay/qr",eI=`/login?mode=login&redirect=${encodeURIComponent(eT)}`;(0,i.useEffect)(()=>{let e=(0,s.onAuthStateChanged)(l.auth,e=>{es(e)});return()=>e()},[]),(0,i.useEffect)(()=>{if(!eo||!K)return void em(null);let e=!1;return(async()=>{try{let t=await eo.getIdToken(),{data:i}=await (0,d.getContacts)(t),a=i.find(e=>H(e.walletAddress,K));e||em(a?.nickname?.trim()||null)}catch{e||em(null)}})(),()=>{e=!0}},[eo,K]),(0,i.useEffect)(()=>{if(!K||!(0,u.isGenericCheckoutLabel)(J))return void ex(null);let e=!1;return(async()=>{if(eo)try{let t=await eo.getIdToken(),i=await (0,p.getMerchantProfile)(t),a=i?.merchantWallet?.trim(),n=i?.businessName?.trim();if(a&&n&&H(a,K)&&!e)return void ex(n)}catch{}try{let t=await (0,p.getMerchantProfileByWallet)(K);e||ex(t?.businessName?.trim()||null)}catch{e||ex(null)}})(),()=>{e=!0}},[eo,K,J]);let eL=async()=>{if(!eo)return void n.push(eI);if(!K)return void ef("Recipient wallet address is missing");let e=h(ev);if(null===e)return void ef("Enter a valid amount greater than zero");ec(!0),ef(null);try{let t,i=await eo.getIdToken(),a=g.TOKEN_REGISTRY.devnet||{};if("SOL"!==eA){let e=Object.entries(a).find(([,e])=>e===eA);if(!e)return void ef("Currency not available on this network");t=e[0]}let n=await (0,p.getMerchantProfile)(i),r=n?.merchantWallet?.trim();if(r){let a=await (0,f.getWalletBalance)(i,r);if("SOL"===eA){let t=parseFloat(a.solBalance);if(e>t)return void ef("Insufficient balance")}else{let i=a.tokens.find(e=>e.symbol===eA||t&&e.mint===t),n=parseFloat(i?.uiAmount??"0");if(e>n)return void ef("Insufficient balance")}}let o=X.trim()?`Invoice ${X.trim()}: ${J}`:`Direct QR payment: ${J}`;if("granted"!==ek||!eC)throw Error("Geolocation permission is required to complete this payment.");let s=(await (0,c.sendTransfer)(i,{toWallet:K,amount:ev,mint:t,reference:o,...eC})).data;eu({amount:s?.amount??ev,symbol:s?.symbol??eA,toWallet:s?.toWallet??K,toNickname:s?.toNickname??eh??eg??((0,u.isGenericCheckoutLabel)(J)?null:J.trim()),signature:s?.signature??null,reference:s?.reference??(X||null)})}catch(t){let e;console.error("Payment execution failed:",t),ef((e=(t instanceof Error?t.message:"string"==typeof t?t:"").trim())?/insufficient lamports|insufficient funds|saldo insuficiente/i.test(e)?"Saldo insuficiente":/simulation failed|transfer failed|custom program error|blockhash not found|transaction.*(failed|canceled|cancelled)/i.test(e)||e.length>80||m.test(e)?"Transferencia fallida":e:"Transferencia fallida")}finally{ec(!1)}},eO=e=>`${e.slice(0,6)}...${e.slice(-6)}`,eR=(0,u.isGenericCheckoutLabel)(J)?eh||eg||(K?eO(K):"—"):J.trim(),eU=(0,u.isGenericCheckoutLabel)(J)?eg?`Payment to ${eg}`:"Direct payment with Luxor Pay":J.trim();return(0,t.jsxs)(j,{children:[(0,t.jsxs)(k,{children:[(0,t.jsxs)(P,{children:["Luxor ",(0,t.jsx)("span",{children:"Pay"})]}),eo?(0,t.jsx)(S,{onClick:()=>n.push("/dashboard"),children:"Dashboard"}):(0,t.jsx)(S,{onClick:()=>n.push(eI),children:"Sign In / Create Account"})]}),(0,t.jsx)(v,{children:(0,t.jsx)(o.AnimatePresence,{mode:"wait",children:(0,t.jsxs)(A,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},exit:{opacity:0,y:-20},transition:{duration:.3},children:[(0,t.jsx)(N,{children:"Confirm Payment"}),(0,t.jsx)(E,{children:eU}),(0,t.jsxs)(W,{children:[(0,t.jsx)(F.ShieldCheck,{size:14}),"Solana ","Devnet"]}),eS&&(0,t.jsxs)(B,{children:[(0,t.jsx)(C.AlertCircle,{size:20,style:{flexShrink:0}}),(0,t.jsx)("div",{children:"This payment request has expired."})]}),ep&&(0,t.jsxs)(B,{children:[(0,t.jsx)(C.AlertCircle,{size:20,style:{flexShrink:0}}),(0,t.jsx)("div",{children:ep})]}),"denied"===ek&&(0,t.jsxs)(B,{children:[(0,t.jsx)(C.AlertCircle,{size:20,style:{flexShrink:0}}),(0,t.jsx)("div",{children:"Location access is required to proceed with this payment. Please allow location access in your browser."})]}),(0,t.jsx)(R,{children:et?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(_,{children:"Amount to Pay"}),(0,t.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",margin:"8px 0"},children:[(0,t.jsx)("span",{style:{fontFamily:"Outfit, sans-serif",fontSize:"48px",fontWeight:500,background:"linear-gradient(to right, #60A5FA, #2563EB)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"-1.5px",display:"block",textAlign:"center"},children:null!==ez?`$${ez.toFixed(2)}`:eE?"$...":`$${(parseFloat(ev||"0")*(eN??0)).toFixed(2)}`}),(0,t.jsxs)("div",{style:{fontFamily:"Montserrat, sans-serif",fontSize:"16px",fontWeight:300,color:"rgba(255, 255, 255, 0.6)",marginTop:"6px"},children:[parseFloat(ev||"0").toFixed("SOL"===eA?9:2)," ",eA]}),(0,t.jsx)(U,{style:{marginTop:"12px"},children:eA})]})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(_,{children:"Amount to Pay"}),(0,t.jsxs)(D,{children:[(0,t.jsx)($,{type:"text",inputMode:"decimal",placeholder:"0.00",value:ei,onChange:e=>{let t=e.target.value;/^[0-9]*\.?[0-9]*$/.test(t)&&ea(t)}}),(0,t.jsxs)(Q,{value:en,onChange:e=>er(e.target.value),children:[(0,t.jsx)("option",{value:"SOL",children:"SOL"}),(0,t.jsx)("option",{value:"USDC",children:"USDC"}),(0,t.jsx)("option",{value:"LXR",children:"LXR"})]})]}),null!==ez&&parseFloat(ev||"0")>0&&(0,t.jsxs)("div",{style:{fontFamily:"Montserrat, sans-serif",fontSize:"14px",fontWeight:300,color:"rgba(255, 255, 255, 0.6)",textAlign:"center",marginTop:"12px"},children:["≈ $",ez.toFixed(2)," USD"]})]})}),(0,t.jsxs)(z,{children:[(0,t.jsx)(_,{children:"Payment Details"}),(0,t.jsxs)(T,{children:[(0,t.jsx)(I,{children:"Payee"}),(0,t.jsx)(O,{title:eR,children:eR})]}),K&&(0,t.jsxs)(T,{children:[(0,t.jsx)(I,{children:"Wallet"}),(0,t.jsx)(L,{title:K,children:eO(K)})]}),(0,t.jsxs)(T,{children:[(0,t.jsx)(I,{children:"Method"}),(0,t.jsx)(L,{children:"Luxor Pay Custodial"})]}),X&&(0,t.jsxs)(T,{children:[(0,t.jsx)(I,{children:"Invoice / Ref"}),(0,t.jsx)(L,{title:X,children:X})]}),ew&&(0,t.jsxs)(T,{children:[(0,t.jsx)(I,{children:"Date"}),(0,t.jsx)(L,{children:ew})]}),ee&&(0,t.jsxs)(T,{children:[(0,t.jsx)(I,{children:"Description"}),(0,t.jsx)(L,{title:ee,children:ee})]}),eo&&(0,t.jsxs)(T,{children:[(0,t.jsx)(I,{children:"Luxor Account"}),(0,t.jsx)(L,{children:eo.email})]})]}),(0,t.jsx)(M,{type:"button",$variant:"primary",disabled:eS||"granted"!==ek||!!eo&&(el||null===h(ev)),onClick:eL,children:eo?el?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(G,{})," Processing..."]}):"loading"===ek?"Requesting Location...":"denied"===ek?"Location Required":(0,t.jsxs)(t.Fragment,{children:["Confirm Payment ",(0,t.jsx)(w.ArrowRight,{size:18})]}):"Sign In to Pay"})]},"checkout")})}),(0,t.jsx)(x.PaymentSuccessModal,{isOpen:null!==ed,onClose:()=>n.push("/dashboard"),data:ed})]})}],66345)},49070,e=>{e.v(e=>Promise.resolve().then(()=>e(82568)))},64578,e=>{e.v(t=>Promise.all(["static/chunks/0d1ns6obtui6m.js"].map(t=>e.l(t))).then(()=>t(92972)))}]);