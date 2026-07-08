(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,48161,e=>{"use strict";let t=(0,e.i(56420).default)("circle-check-big",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);e.s(["CheckCircle",0,t],48161)},86206,e=>{"use strict";let t=(0,e.i(56420).default)("smartphone",[["rect",{width:"14",height:"20",x:"5",y:"2",rx:"2",ry:"2",key:"1yt0o3"}],["path",{d:"M12 18h.01",key:"mhygvu"}]]);e.s(["Smartphone",0,t],86206)},68877,e=>{"use strict";let t=(0,e.i(56420).default)("arrow-right",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);e.s(["ArrowRight",0,t],68877)},84026,e=>{"use strict";let t=(0,e.i(56420).default)("shield-check",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);e.s(["ShieldCheck",0,t],84026)},32781,e=>{"use strict";let t=(0,e.i(56420).default)("loader-circle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);e.s(["Loader2",0,t],32781)},51757,83967,e=>{"use strict";var t=e.i(56420);let a=(0,t.default)("circle-check",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);e.s(["CheckCircle2",0,a],51757);let i=(0,t.default)("circle-x",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]]);e.s(["XCircle",0,i],83967)},99847,e=>{"use strict";let t=(0,e.i(56420).default)("circle-alert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);e.s(["AlertCircle",0,t],99847)},45338,e=>{"use strict";var t=e.i(41931);async function a(e,i=0,n=10,r){let o=new URL((0,t.apiUrl)("/transfers"));o.searchParams.append("offset",i.toString()),o.searchParams.append("limit",n.toString()),r&&o.searchParams.append("status",r);let s=await fetch(o.toString(),{headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"}}),l=await s.json();if(!s.ok)throw Error(l.message?.[0]||l.message||l.error||"Failed to fetch transfers");return l}async function i(e,a){let i=await fetch((0,t.apiUrl)("/transfers/send"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(a)}),n=await i.json();if(!i.ok){let e="Failed to process transfer";throw Array.isArray(n.message)?e=n.message.join(", "):n.message?e=n.message:n.error&&(e=n.error),Error(e)}return n}e.s(["getTransfers",0,a,"sendTransfer",0,i])},74544,e=>{"use strict";let t=(0,e.i(56420).default)("clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 6v6l4 2",key:"mmk7yg"}]]);e.s(["Clock",0,t],74544)},44594,e=>{"use strict";let t=(0,e.i(56420).default)("inbox",[["polyline",{points:"22 12 16 12 14 15 10 15 8 12 2 12",key:"o97t9d"}],["path",{d:"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",key:"oot6mr"}]]);e.s(["Inbox",0,t],44594)},90446,e=>{"use strict";var t=e.i(41931);async function a(e){let a=await fetch((0,t.apiUrl)("/contacts"),{method:"GET",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"}});if(!a.ok)throw Error((await a.json().catch(()=>({}))).message||"Failed to fetch contacts");return a.json()}async function i(e,a){let i=await fetch((0,t.apiUrl)("/contacts"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(a)});if(!i.ok)throw Error((await i.json().catch(()=>({}))).message||"Failed to create contact");return i.json()}async function n(e,a,i){let n=await fetch((0,t.apiUrl)(`/contacts/${a}`),{method:"PATCH",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(i)});if(!n.ok)throw Error((await n.json().catch(()=>({}))).message||"Failed to update contact");return{data:await n.json()}}async function r(e,a){let i=await fetch((0,t.apiUrl)(`/contacts/${a}`),{method:"DELETE",headers:{Authorization:`Bearer ${e}`}});if(!i.ok)throw Error((await i.json().catch(()=>({}))).message||"Failed to delete contact");return i.json()}e.s(["createContact",0,i,"deleteContact",0,r,"getContacts",0,a,"updateContact",0,n])},49838,e=>{"use strict";let t={"mainnet-beta":{EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v:"USDC",Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB:"USDT",So11111111111111111111111111111111111111112:"wSOL",DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263:"BONK",JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN:"JUP","2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo":"PYUSD",mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So:"mSOL","7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj":"stSOL",rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof:"RENDER",EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm:"WIF","3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE":"LXR"},devnet:{"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU":"USDC","3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE":"LXR",HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr:"EURC"}};e.s(["TOKEN_REGISTRY",0,t,"getTokenSymbol",0,function(e,a="devnet"){return e&&t[a]?.[e]||null}])},15471,e=>{"use strict";e.s(["getLuxorEnv",0,function(){return"development"}])},61057,e=>{"use strict";var t=e.i(71645),a=e.i(90446),i=e.i(59141);e.s(["useGetContacts",0,function(){let[e,n]=(0,t.useState)(null),[r,o]=(0,t.useState)(!0),[s,l]=(0,t.useState)(!1),[c,d]=(0,t.useState)(null),p=(0,t.useCallback)(async()=>{o(!0),l(!1),d(null);try{let e=i.auth.currentUser;if(!e)throw Error("User not authenticated");let t=await e.getIdToken(),r=await (0,a.getContacts)(t);n(r)}catch(e){l(!0),d(e.message||"Failed to fetch contacts"),n(null)}finally{o(!1)}},[]);return(0,t.useEffect)(()=>{p()},[p]),{data:e,isLoading:r,isError:s,errorMessage:c,refetch:p}}])},15281,e=>{"use strict";let t=(0,e.i(56420).default)("pencil",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]]);e.s(["Pencil",0,t],15281)},16327,e=>{"use strict";let t=(0,e.i(56420).default)("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);e.s(["ChevronDown",0,t],16327)},54449,e=>{"use strict";var t=e.i(41931);async function a(e,a){let i=await fetch((0,t.apiUrl)("/payment-requests"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(a)});if(!i.ok)throw Error((await i.json().catch(()=>({}))).message||"Failed to create payment request");return i.json()}async function i(e,a,i){let n=new URLSearchParams({perspective:a,walletAddress:i}),r=await fetch((0,t.apiUrl)(`/payment-requests?${n}`),{headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"}});if(!r.ok)throw Error((await r.json().catch(()=>({}))).message||"Failed to fetch payment requests");return r.json()}async function n(e,a,i){let n=await fetch((0,t.apiUrl)(`/payment-requests/${a}/resend`),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:i?JSON.stringify(i):void 0});if(!n.ok)throw Error((await n.json().catch(()=>({}))).message||"Failed to resend notification");return n.json()}async function r(e,a,i){let n=await fetch((0,t.apiUrl)(`/payment-requests/${a}/cancel`),{method:"PATCH",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(i)});if(!n.ok){let e=await n.json().catch(()=>({}));throw Error(Array.isArray(e.message)?e.message.join(", "):e.message||"Failed to update payment request")}return n.json()}e.s(["createPaymentRequest",0,a,"listPaymentRequests",0,i,"resendPaymentRequestNotification",0,n,"updatePaymentRequest",0,r])},90065,e=>{"use strict";var t=e.i(71645),a=e.i(54449),i=e.i(59141);e.s(["useCreatePaymentRequest",0,function(){let[e,n]=(0,t.useState)(!1),[r,o]=(0,t.useState)(!1),[s,l]=(0,t.useState)(null);return{mutate:async e=>{n(!0),o(!1),l(null);try{let t=i.auth.currentUser;if(!t)throw Error("User not authenticated");let r=await t.getIdToken(),o=await (0,a.createPaymentRequest)(r,e);return n(!1),{success:!0,data:o.data}}catch(t){let e=t.message||"Failed to create payment request";return o(!0),l(e),n(!1),{success:!1,error:e}}},isLoading:e,isError:r,errorMessage:s}}])},30274,e=>{"use strict";let t=(0,e.i(56420).default)("send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]);e.s(["Send",0,t],30274)},45033,56539,e=>{"use strict";var t=e.i(43476),a=e.i(71645),i=e.i(97053),n=e.i(46932),r=e.i(88653),o=e.i(49838),s=e.i(15471),l=e.i(61057),c=e.i(90065),d=e.i(46696),p=e.i(48161),u=e.i(30274),h=e.i(63676),m=e.i(16327);let f=(0,e.i(56420).default)("chevron-up",[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]]);e.s(["ChevronUp",0,f],56539);let y=(0,i.default)(n.motion.div).withConfig({displayName:"PaymentRequestModal__Overlay",componentId:"sc-dabbe06-0"})`
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
`,g=(0,i.default)(n.motion.div).withConfig({displayName:"PaymentRequestModal__ModalContent",componentId:"sc-dabbe06-1"})`
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
`,x=i.default.button.withConfig({displayName:"PaymentRequestModal__CloseButton",componentId:"sc-dabbe06-2"})`
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
`,b=i.default.h2.withConfig({displayName:"PaymentRequestModal__Title",componentId:"sc-dabbe06-3"})`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #FFFFFF;
  margin: 0 0 8px 0;
  text-align: center;
`,w=i.default.p.withConfig({displayName:"PaymentRequestModal__Subtitle",componentId:"sc-dabbe06-4"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 32px 0;
  text-align: center;
  line-height: 1.5;
`,j=i.default.form.withConfig({displayName:"PaymentRequestModal__Form",componentId:"sc-dabbe06-5"})`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
`,k=i.default.div.withConfig({displayName:"PaymentRequestModal__FieldGroup",componentId:"sc-dabbe06-6"})`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`,C=i.default.span.withConfig({displayName:"PaymentRequestModal__FieldLabel",componentId:"sc-dabbe06-7"})`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 2px;
  display: block;
`,v=i.default.input.withConfig({displayName:"PaymentRequestModal__TextInput",componentId:"sc-dabbe06-8"})`
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
`,F=i.default.select.withConfig({displayName:"PaymentRequestModal__Select",componentId:"sc-dabbe06-9"})`
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

  option {
    background: #0A0A0A;
    color: #FFFFFF;
  }
  
  optgroup {
    background: #0A0A0A;
    color: #60A5FA;
    font-weight: 600;
  }
`,N=i.default.button.withConfig({displayName:"PaymentRequestModal__ToggleLink",componentId:"sc-dabbe06-10"})`
  background: none;
  border: none;
  color: #60A5FA;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  &:hover { text-decoration: underline; }
`,A=i.default.div.withConfig({displayName:"PaymentRequestModal__Divider",componentId:"sc-dabbe06-11"})`
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 16px 0;
  width: 100%;
`,S=i.default.button.withConfig({displayName:"PaymentRequestModal__ActionButton",componentId:"sc-dabbe06-12"})`
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
  gap: 8px;

  &:last-of-type {
    margin-bottom: 0;
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`,T=i.default.button.withConfig({displayName:"PaymentRequestModal__AdvancedToggle",componentId:"sc-dabbe06-13"})`
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
`,R=(0,i.default)(n.motion.div).withConfig({displayName:"PaymentRequestModal__SuccessWrapper",componentId:"sc-dabbe06-14"})`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  padding: 20px 0;
  width: 100%;
`,P=i.default.div.withConfig({displayName:"PaymentRequestModal__SuccessIcon",componentId:"sc-dabbe06-15"})`
  width: 72px;
  height: 72px;
  border-radius: 9999px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #22C55E;
`,E=i.default.div.withConfig({displayName:"PaymentRequestModal__SuccessId",componentId:"sc-dabbe06-16"})`
  font-family: monospace;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 16px;
  word-break: break-all;
  width: 100%;
`,M=i.default.div.withConfig({displayName:"PaymentRequestModal__ErrorBanner",componentId:"sc-dabbe06-17"})`
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 14px;
  padding: 12px 16px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: #FCA5A5;
  width: 100%;
`;e.s(["PaymentRequestModal",0,function({isOpen:e,onClose:i,requesterWallet:n}){let q="development"===(0,s.getLuxorEnv)(),z=q?o.TOKEN_REGISTRY.devnet:o.TOKEN_REGISTRY["mainnet-beta"],{data:O,isLoading:I}=(0,l.useGetContacts)(),{mutate:_,isLoading:B,isError:U,errorMessage:D}=(0,c.useCreatePaymentRequest)(),[L,H]=(0,a.useState)(!1),[$,K]=(0,a.useState)(null),[Y,G]=(0,a.useState)(null),[W,X]=(0,a.useState)(!1),J=Object.keys(z)[0]??"",[Z,V]=(0,a.useState)({payerWallet:"",businessName:"",amount:"",assetMint:J,notificationType:"NONE",targetNotification:"",reference:"",numericalReference:"",expirationDate:""});(0,a.useEffect)(()=>{e&&(G(null),K(null),H(!1),X(!1),V({payerWallet:"",businessName:"",amount:"",assetMint:J,notificationType:"NONE",targetNotification:"",reference:"",numericalReference:"",expirationDate:""}))},[e,J]);let Q=e=>{let{name:t,value:a}=e.target;V(e=>({...e,[t]:a})),"notificationType"===t&&$&&V(e=>({...e,notificationType:a,targetNotification:"EMAIL"===a?$.email||"":"PHONE"===a&&$.telephone||""}))},ee=async e=>{if(e.preventDefault(),!n)return void d.toast.error("No requester wallet configured.");let t=Z.numericalReference?parseInt(Z.numericalReference,10):void 0,a={requesterWallet:n,targetNotificationType:Z.notificationType,amount:Z.amount,assetMint:Z.assetMint,payerWallet:Z.payerWallet};"NONE"!==Z.notificationType&&Z.targetNotification&&(a.targetNotification=Z.targetNotification),Z.reference&&(a.reference=Z.reference),Z.businessName&&(a.businessName=Z.businessName),void 0===t||isNaN(t)||(a.numericalReference=t),Z.expirationDate&&(a.expirationDate=new Date(Z.expirationDate).toISOString());let i=await _(a);i.success&&i.data?(G(i.data.id),d.toast.success("Payment request sent!")):d.toast.error(i.error||"Failed to send payment request.")},et="EMAIL"===Z.notificationType||"PHONE"===Z.notificationType;return(0,t.jsx)(r.AnimatePresence,{children:e&&(0,t.jsx)(y,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:i,children:(0,t.jsxs)(g,{onClick:e=>e.stopPropagation(),initial:{opacity:0,scale:.95,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:20},transition:{type:"spring",bounce:.4,duration:.6},children:[(0,t.jsx)(x,{type:"button",onClick:i,"aria-label":"Close",children:(0,t.jsx)(h.X,{size:18})}),Y?(0,t.jsxs)(R,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{type:"spring",bounce:.4,duration:.7},children:[(0,t.jsx)(P,{children:(0,t.jsx)(p.CheckCircle,{size:36})}),(0,t.jsxs)("div",{children:[(0,t.jsx)(b,{children:"Request Sent!"}),(0,t.jsx)(w,{children:"Your payment request has been created and the payer will be notified."})]}),(0,t.jsx)(E,{children:Y}),(0,t.jsx)(S,{$variant:"primary",type:"button",onClick:i,style:{marginTop:"24px"},children:"Done"})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(b,{children:"Ask for a Payment"}),(0,t.jsx)(w,{children:"Request a payment from another Solana wallet. The payer will receive a notification with the payment details."}),U&&D&&(0,t.jsx)(M,{style:{marginBottom:"20px"},children:D}),(0,t.jsxs)(j,{onSubmit:ee,children:[(0,t.jsxs)(k,{children:[(0,t.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px"},children:[(0,t.jsx)(C,{style:{marginBottom:0},children:"Payer Wallet *"}),(0,t.jsx)(N,{type:"button",onClick:()=>{H(e=>!e),K(null),V(e=>({...e,payerWallet:"",businessName:""}))},children:L?"Enter manually":"Use contact"})]}),L?(0,t.jsxs)(F,{id:"pr-contact-select",value:$?.id??"",onChange:e=>{let t=O?.data.find(t=>t.id===e.target.value)??null;K(t),t&&V(e=>({...e,payerWallet:t.walletAddress,businessName:e.businessName||t.nickname||"",targetNotification:"EMAIL"===e.notificationType?t.email||"":"PHONE"===e.notificationType?t.telephone||"":e.targetNotification}))},required:!0,children:[(0,t.jsx)("option",{value:"",disabled:!0,children:"Select a contact…"}),I?(0,t.jsx)("option",{disabled:!0,children:"Loading contacts…"}):O?.data.map(e=>(0,t.jsx)("option",{value:e.id,children:e.nickname||e.walletAddress},e.id))]}):(0,t.jsx)(v,{id:"pr-payerWallet",name:"payerWallet",value:Z.payerWallet,onChange:Q,placeholder:"Payer's Solana wallet address",required:!0})]}),(0,t.jsxs)("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"},children:[(0,t.jsxs)(k,{children:[(0,t.jsx)(C,{children:"Asset *"}),(0,t.jsx)(F,{id:"pr-assetMint",name:"assetMint",value:Z.assetMint,onChange:Q,required:!0,children:(0,t.jsx)("optgroup",{label:q?"Devnet Tokens":"Mainnet Tokens",children:Object.entries(z).map(([e,a])=>(0,t.jsx)("option",{value:e,children:a},e))})})]}),(0,t.jsxs)(k,{children:[(0,t.jsx)(C,{children:"Amount *"}),(0,t.jsx)(v,{id:"pr-amount",name:"amount",type:"text",inputMode:"decimal",value:Z.amount,onChange:e=>{let t=e.target.value;/^[0-9]*\.?[0-9]*$/.test(t)&&Q(e)},placeholder:"0.00",required:!0})]})]}),(0,t.jsxs)(k,{children:[(0,t.jsx)(C,{children:"Notify Payer Via"}),(0,t.jsxs)(F,{id:"pr-notificationType",name:"notificationType",value:Z.notificationType,onChange:Q,children:[(0,t.jsx)("option",{value:"NONE",children:"None (no notification)"}),(0,t.jsx)("option",{value:"EMAIL",children:"Email"}),(0,t.jsx)("option",{value:"PHONE",children:"Phone / SMS"}),(0,t.jsx)("option",{value:"PUSH",children:"Push Notification"})]})]}),et&&(0,t.jsxs)(k,{children:[(0,t.jsx)(C,{children:"EMAIL"===Z.notificationType?"Email Address *":"Phone Number *"}),(0,t.jsx)(v,{id:"pr-targetNotification",name:"targetNotification",type:"EMAIL"===Z.notificationType?"email":"tel",value:Z.targetNotification,onChange:Q,placeholder:"EMAIL"===Z.notificationType?"payer@example.com":"+1 555 000 0000",required:!0})]}),(0,t.jsx)(A,{}),(0,t.jsxs)(T,{type:"button",onClick:()=>X(!W),children:[W?(0,t.jsx)(f,{size:16}):(0,t.jsx)(m.ChevronDown,{size:16}),"Advanced Options"]}),W&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(k,{children:[(0,t.jsx)(C,{children:"Business Name (Optional)"}),(0,t.jsx)(v,{id:"pr-businessName",name:"businessName",value:Z.businessName,onChange:Q,placeholder:"e.g. Acme Corp"})]}),(0,t.jsxs)(k,{children:[(0,t.jsx)(C,{children:"Reference / Concept (Optional)"}),(0,t.jsx)(v,{id:"pr-reference",name:"reference",value:Z.reference,onChange:Q,placeholder:"e.g. Invoice #1042"})]}),(0,t.jsxs)(k,{children:[(0,t.jsx)(C,{children:"Numerical Reference (6 digits, optional)"}),(0,t.jsx)(v,{id:"pr-numericalReference",name:"numericalReference",type:"number",min:"100000",max:"999999",value:Z.numericalReference,onChange:Q,placeholder:"e.g. 104200"})]}),(0,t.jsxs)(k,{children:[(0,t.jsx)(C,{children:"Expiration Date (Optional)"}),(0,t.jsx)(v,{id:"pr-expirationDate",name:"expirationDate",type:"date",value:Z.expirationDate,onChange:Q,min:new Date().toISOString().split("T")[0]})]})]}),(0,t.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:"12px",width:"100%",marginTop:"16px"},children:[(0,t.jsxs)(S,{$variant:"primary",type:"submit",disabled:B,children:[B?(0,t.jsx)("span",{className:"loader",style:{width:16,height:16}}):(0,t.jsx)(u.Send,{size:16}),B?"Sending…":"Send Request"]}),(0,t.jsx)(S,{$variant:"secondary",type:"button",onClick:i,disabled:B,children:"Cancel"})]})]})]})]})})})}],45033)},70812,e=>{"use strict";let t=(0,e.i(56420).default)("bell",[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}]]);e.s(["Bell",0,t],70812)}]);