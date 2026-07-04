(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,73474,e=>{"use strict";let t=(0,e.i(56420).default)("trash-2",[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]]);e.s(["Trash2",0,t],73474)},90446,e=>{"use strict";var t=e.i(41931);async function a(e){let a=await fetch((0,t.apiUrl)("/contacts"),{method:"GET",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"}});if(!a.ok)throw Error((await a.json().catch(()=>({}))).message||"Failed to fetch contacts");return a.json()}async function n(e,a){let n=await fetch((0,t.apiUrl)("/contacts"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(a)});if(!n.ok)throw Error((await n.json().catch(()=>({}))).message||"Failed to create contact");return n.json()}async function i(e,a,n){let i=await fetch((0,t.apiUrl)(`/contacts/${a}`),{method:"PATCH",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(n)});if(!i.ok)throw Error((await i.json().catch(()=>({}))).message||"Failed to update contact");return{data:await i.json()}}async function o(e,a){let n=await fetch((0,t.apiUrl)(`/contacts/${a}`),{method:"DELETE",headers:{Authorization:`Bearer ${e}`}});if(!n.ok)throw Error((await n.json().catch(()=>({}))).message||"Failed to delete contact");return n.json()}e.s(["createContact",0,n,"deleteContact",0,o,"getContacts",0,a,"updateContact",0,i])},49838,e=>{"use strict";let t={"mainnet-beta":{EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v:"USDC",Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB:"USDT",So11111111111111111111111111111111111111112:"wSOL",DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263:"BONK",JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN:"JUP","2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo":"PYUSD",mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So:"mSOL","7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj":"stSOL",rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof:"RENDER",EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm:"WIF","3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE":"LXR"},devnet:{"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU":"USDC","3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE":"LXR",HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr:"EURC"}};e.s(["TOKEN_REGISTRY",0,t,"getTokenSymbol",0,function(e,a="devnet"){return e&&t[a]?.[e]||null}])},15471,e=>{"use strict";e.s(["getLuxorEnv",0,function(){return"development"}])},61057,e=>{"use strict";var t=e.i(71645),a=e.i(90446),n=e.i(59141);e.s(["useGetContacts",0,function(){let[e,i]=(0,t.useState)(null),[o,r]=(0,t.useState)(!0),[s,l]=(0,t.useState)(!1),[d,c]=(0,t.useState)(null),p=(0,t.useCallback)(async()=>{r(!0),l(!1),c(null);try{let e=n.auth.currentUser;if(!e)throw Error("User not authenticated");let t=await e.getIdToken(),o=await (0,a.getContacts)(t);i(o)}catch(e){l(!0),c(e.message||"Failed to fetch contacts"),i(null)}finally{r(!1)}},[]);return(0,t.useEffect)(()=>{p()},[p]),{data:e,isLoading:o,isError:s,errorMessage:d,refetch:p}}])},15281,e=>{"use strict";let t=(0,e.i(56420).default)("pencil",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]]);e.s(["Pencil",0,t],15281)},94123,e=>{"use strict";var t=e.i(43476),a=e.i(71645),n=e.i(61057),i=e.i(90446),o=e.i(59141),r=e.i(97053),s=e.i(46932),l=e.i(15281),d=e.i(73474);let c=(0,r.default)(s.motion.div).withConfig({displayName:"ContactsView__PageContainer",componentId:"sc-4edecbae-0"})`
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 64px;
`,p=r.default.div.withConfig({displayName:"ContactsView__HeaderContainer",componentId:"sc-4edecbae-1"})`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
  }
`,u=r.default.h1.withConfig({displayName:"ContactsView__Title",componentId:"sc-4edecbae-2"})`
  font-family: 'Outfit', sans-serif;
  font-size: 48px;
  font-weight: 500;
  letter-spacing: -1.5px;
  color: #FFFFFF;
  margin: 0;

  @media (min-width: 1024px) {
    font-size: 60px;
  }
`,f=r.default.p.withConfig({displayName:"ContactsView__Subtitle",componentId:"sc-4edecbae-3"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;

  @media (min-width: 1024px) {
    font-size: 16px;
  }
`,m=r.default.button.withConfig({displayName:"ContactsView__Button",componentId:"sc-4edecbae-4"})`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

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
    backdrop-filter: blur(12px);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
    }
  `}
`,x=r.default.div.withConfig({displayName:"ContactsView__ContactsGrid",componentId:"sc-4edecbae-5"})`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`,h=(0,r.default)(s.motion.div).withConfig({displayName:"ContactsView__ContactCard",componentId:"sc-4edecbae-6"})`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(40px);
  border-radius: 40px;
  box-shadow: 0 32px 64px -16px rgba(0,0,0,0.6);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  overflow: hidden;
`,g=r.default.h2.withConfig({displayName:"ContactsView__ContactName",componentId:"sc-4edecbae-7"})`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
`,b=r.default.div.withConfig({displayName:"ContactsView__ActionsContainer",componentId:"sc-4edecbae-8"})`
  display: flex;
  align-items: center;
  gap: 8px;
`,y=r.default.button.withConfig({displayName:"ContactsView__IconButton",componentId:"sc-4edecbae-9"})`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`,C=r.default.span.withConfig({displayName:"ContactsView__Badge",componentId:"sc-4edecbae-10"})`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: #60A5FA;
  background: rgba(96, 165, 250, 0.1);
  padding: 4px 8px;
  border-radius: 9999px;
`,w=r.default.div.withConfig({displayName:"ContactsView__DataRow",componentId:"sc-4edecbae-11"})`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,F=r.default.span.withConfig({displayName:"ContactsView__Label",componentId:"sc-4edecbae-12"})`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
`,j=r.default.span.withConfig({displayName:"ContactsView__Value",componentId:"sc-4edecbae-13"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: #EDEDED;
`,k=r.default.span.withConfig({displayName:"ContactsView__OnChainValue",componentId:"sc-4edecbae-14"})`
  font-family: monospace;
  font-size: 13px;
  color: #60A5FA;
  word-break: break-all;
`,v=r.default.div.withConfig({displayName:"ContactsView__EmptyState",componentId:"sc-4edecbae-15"})`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 40px;
  gap: 16px;
`,A=r.default.div.withConfig({displayName:"ContactsView__Spinner",componentId:"sc-4edecbae-16"})`
  width: 48px;
  height: 48px;
  border: 4px solid rgba(96, 165, 250, 0.2);
  border-top-color: #60A5FA;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;function _({contacts:e,isLoading:a,isError:n,onAddContactClick:i,onEditContactClick:o,onDeleteContactClick:r}){return(0,t.jsxs)(c,{initial:{opacity:0,y:40},animate:{opacity:1,y:0},transition:{type:"spring",bounce:.4,duration:.8},children:[(0,t.jsxs)(p,{children:[(0,t.jsxs)("div",{children:[(0,t.jsx)(u,{children:"Contacts"}),(0,t.jsx)(f,{children:"Manage your frequent transaction network on-chain."})]}),(0,t.jsx)(m,{onClick:i,$variant:"primary",children:"Add New Contact"})]}),a?(0,t.jsxs)(v,{children:[(0,t.jsx)(A,{"aria-busy":"true"}),(0,t.jsx)(f,{children:"Loading infrastructure..."})]}):n?(0,t.jsxs)(v,{children:[(0,t.jsx)(u,{as:"h2",style:{fontSize:"24px"},children:"Connection Error"}),(0,t.jsx)(f,{children:"Unable to load contacts. Please verify your connection to the ecosystem."})]}):0===e.length?(0,t.jsxs)(v,{children:[(0,t.jsx)(u,{as:"h2",style:{fontSize:"24px"},children:"No Contacts Yet"}),(0,t.jsx)(f,{children:"Start building your on-chain network. Add liquidity partners and frequent clients."}),(0,t.jsx)(m,{onClick:i,$variant:"secondary",style:{marginTop:"16px"},children:"Add Your First Contact"})]}):(0,t.jsx)(x,{children:e.map((e,a)=>(0,t.jsxs)(h,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:.1*a,duration:.5},children:[(0,t.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start"},children:[(0,t.jsxs)(g,{children:[e.nickname,e.isFavorite&&(0,t.jsx)(C,{children:"Fav"})]}),(0,t.jsxs)(b,{children:[(0,t.jsx)(y,{onClick:()=>o(e),"aria-label":`Edit ${e.nickname}`,title:"Edit Contact",children:(0,t.jsx)(l.Pencil,{size:16})}),(0,t.jsx)(y,{onClick:()=>r(e.id),"aria-label":`Delete ${e.nickname}`,title:"Delete Contact",children:(0,t.jsx)(d.Trash2,{size:16})})]})]}),(0,t.jsxs)(w,{children:[(0,t.jsx)(F,{children:"WALLET ADDRESS"}),(0,t.jsx)(k,{children:e.walletAddress})]}),e.email&&(0,t.jsxs)(w,{children:[(0,t.jsx)(F,{children:"EMAIL"}),(0,t.jsx)(j,{children:e.email})]}),e.telephone&&(0,t.jsxs)(w,{children:[(0,t.jsx)(F,{children:"PHONE"}),(0,t.jsx)(j,{children:e.telephone})]}),(0,t.jsxs)(w,{children:[(0,t.jsx)(F,{children:"PREFERRED ASSET"}),(0,t.jsx)(j,{children:e.symbol||e.mint})]}),e.notes&&(0,t.jsxs)(w,{children:[(0,t.jsx)(F,{children:"NOTES"}),(0,t.jsx)(j,{children:e.notes})]})]},e.id))})]})}var E=e.i(88653),N=e.i(49838),S=e.i(15471);let M=(0,r.default)(s.motion.div).withConfig({displayName:"ContactFormModal__Overlay",componentId:"sc-338c4da8-0"})`
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
`,I=(0,r.default)(s.motion.div).withConfig({displayName:"ContactFormModal__ModalContent",componentId:"sc-338c4da8-1"})`
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
`,z=r.default.h2.withConfig({displayName:"ContactFormModal__Title",componentId:"sc-338c4da8-2"})`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #FFFFFF;
  margin: 0 0 8px 0;
`,T=r.default.p.withConfig({displayName:"ContactFormModal__Subtitle",componentId:"sc-338c4da8-3"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 32px 0;
`,O=r.default.form.withConfig({displayName:"ContactFormModal__Form",componentId:"sc-338c4da8-4"})`
  display: flex;
  flex-direction: column;
  gap: 20px;
`,D=r.default.div.withConfig({displayName:"ContactFormModal__FormGroup",componentId:"sc-338c4da8-5"})`
  display: flex;
  flex-direction: column;
  gap: 8px;
`,R=r.default.label.withConfig({displayName:"ContactFormModal__Label",componentId:"sc-338c4da8-6"})`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.8);
`,L=r.default.input.withConfig({displayName:"ContactFormModal__Input",componentId:"sc-338c4da8-7"})`
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
`,P=r.default.select.withConfig({displayName:"ContactFormModal__Select",componentId:"sc-338c4da8-8"})`
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
`,B=r.default.div.withConfig({displayName:"ContactFormModal__CheckboxGroup",componentId:"sc-338c4da8-9"})`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`,U=r.default.input.withConfig({displayName:"ContactFormModal__Checkbox",componentId:"sc-338c4da8-10"})`
  width: 20px;
  height: 20px;
  cursor: pointer;
`,V=r.default.span.withConfig({displayName:"ContactFormModal__CheckboxLabel",componentId:"sc-338c4da8-11"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  color: #FFFFFF;
`,K=r.default.div.withConfig({displayName:"ContactFormModal__ButtonGroup",componentId:"sc-338c4da8-12"})`
  display: flex;
  gap: 16px;
  margin-top: 16px;
`,G=r.default.button.withConfig({displayName:"ContactFormModal__Button",componentId:"sc-338c4da8-13"})`
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
`,Y=r.default.p.withConfig({displayName:"ContactFormModal__ErrorText",componentId:"sc-338c4da8-14"})`
  color: #F87171;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  margin: 0;
`;function H({isOpen:e,onClose:n,onSuccess:r,initialData:s}){let{mutate:l,isLoading:d,isError:c,errorMessage:p}=function(){let[e,t]=(0,a.useState)(!1),[n,r]=(0,a.useState)(!1),[s,l]=(0,a.useState)(null);return{mutate:async e=>{t(!0),r(!1),l(null);try{let a=o.auth.currentUser;if(!a)throw Error("User not authenticated");let n=await a.getIdToken(),r=await (0,i.createContact)(n,e);return t(!1),r.data}catch(e){return r(!0),l(e.message||"Failed to create contact"),t(!1),null}},isLoading:e,isError:n,errorMessage:s}}(),{mutate:u,isLoading:f,isError:m,errorMessage:x}=function(){let[e,t]=(0,a.useState)(!1),[n,r]=(0,a.useState)(!1),[s,l]=(0,a.useState)(null);return{mutate:async(e,a)=>{t(!0),r(!1),l(null);try{let n=o.auth.currentUser;if(!n)throw Error("User not authenticated");let r=await n.getIdToken(),s=await (0,i.updateContact)(r,e,a);return t(!1),s.data}catch(e){return r(!0),l(e.message||"Failed to update contact"),t(!1),null}},isLoading:e,isError:n,errorMessage:s}}(),h=d||f,[g,b]=(0,a.useState)({nickname:"",walletAddress:"",telephone:"",email:"",mint:"",notes:"",isFavorite:!1});a.default.useEffect(()=>{e&&(s?b({nickname:s.nickname||"",walletAddress:s.walletAddress||"",telephone:s.telephone||"",email:s.email||"",mint:s.mint||"",notes:s.notes||"",isFavorite:s.isFavorite||!1}):b({nickname:"",walletAddress:"",telephone:"",email:"",mint:"",notes:"",isFavorite:!1}))},[e,s]);let y=(0,S.getLuxorEnv)();if(!e)return null;let C=e=>{let{name:t,value:a,type:n}=e.target,i="checkbox"===n?e.target.checked:void 0;b(e=>({...e,[t]:"checkbox"===n?i:a}))},w=async e=>{e.preventDefault(),(s?await u(s.id,g):await l(g))&&r()},F=s?"Update Ecosystem Contact":"Add Ecosystem Contact",j=s?"Modify your network partner details.":"Expand your network for seamless on-chain liquidity routing.";return(0,t.jsx)(E.AnimatePresence,{children:(0,t.jsx)(M,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:n,children:(0,t.jsxs)(I,{onClick:e=>e.stopPropagation(),initial:{opacity:0,scale:.95,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:20},transition:{type:"spring",bounce:.4,duration:.6},children:[(0,t.jsx)(z,{children:F}),(0,t.jsx)(T,{children:j}),(0,t.jsxs)(O,{onSubmit:w,children:[(0,t.jsxs)(D,{children:[(0,t.jsx)(R,{children:"NICKNAME / ALIAS *"}),(0,t.jsx)(L,{name:"nickname",value:g.nickname,onChange:C,placeholder:"e.g. Partner X",required:!0,disabled:h})]}),(0,t.jsxs)(D,{children:[(0,t.jsx)(R,{children:"SOLANA WALLET ADDRESS *"}),(0,t.jsx)(L,{name:"walletAddress",value:g.walletAddress,onChange:C,placeholder:"Enter valid public key",required:!0,disabled:h})]}),(0,t.jsxs)(D,{children:[(0,t.jsx)(R,{children:"PREFERRED TOKEN MINT *"}),(0,t.jsxs)(P,{name:"mint",value:g.mint,onChange:C,required:!0,disabled:h,children:[(0,t.jsx)("option",{value:"",disabled:!0,children:"Select a preferred token..."}),"development"===y?(0,t.jsx)("optgroup",{label:"Devnet",children:Object.entries(N.TOKEN_REGISTRY.devnet).map(([e,a])=>(0,t.jsxs)("option",{value:e,children:[a," (",e.slice(0,4),"...",e.slice(-4),")"]},e))}):(0,t.jsx)("optgroup",{label:"Mainnet Beta",children:Object.entries(N.TOKEN_REGISTRY["mainnet-beta"]).map(([e,a])=>(0,t.jsxs)("option",{value:e,children:[a," (",e.slice(0,4),"...",e.slice(-4),")"]},e))})]})]}),(0,t.jsxs)(D,{children:[(0,t.jsx)(R,{children:"EMAIL (OPTIONAL)"}),(0,t.jsx)(L,{type:"email",name:"email",value:g.email,onChange:C,placeholder:"contact@example.com",disabled:h})]}),(0,t.jsxs)(D,{children:[(0,t.jsx)(R,{children:"PHONE (OPTIONAL)"}),(0,t.jsx)(L,{name:"telephone",value:g.telephone,onChange:C,placeholder:"+1234567890",disabled:h})]}),(0,t.jsxs)(D,{children:[(0,t.jsx)(R,{children:"NOTES (OPTIONAL)"}),(0,t.jsx)(L,{name:"notes",value:g.notes,onChange:C,placeholder:"Payment terms, preferences...",disabled:h})]}),(0,t.jsxs)(B,{as:"label",children:[(0,t.jsx)(U,{type:"checkbox",name:"isFavorite",checked:g.isFavorite,onChange:C,disabled:h}),(0,t.jsx)(V,{children:"Mark as Favorite"})]}),(c||m)&&(0,t.jsx)(Y,{children:p||x}),(0,t.jsxs)(K,{children:[(0,t.jsx)(G,{type:"button",$variant:"secondary",onClick:n,disabled:h,children:"Cancel"}),(0,t.jsx)(G,{type:"submit",$variant:"primary",disabled:h,"aria-busy":h,children:h?"Processing...":s?"Save Changes":"Create Contact"})]})]})]})})})}let $=(0,r.default)(s.motion.div).withConfig({displayName:"DeleteConfirmationModal__Overlay",componentId:"sc-d1950d1f-0"})`
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
`,X=(0,r.default)(s.motion.div).withConfig({displayName:"DeleteConfirmationModal__ModalContent",componentId:"sc-d1950d1f-1"})`
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 32px 64px -16px rgba(0,0,0,0.8);
  border-radius: 40px;
  width: 100%;
  max-width: 400px;
  padding: 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
`,q=r.default.h2.withConfig({displayName:"DeleteConfirmationModal__Title",componentId:"sc-d1950d1f-2"})`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 500;
  letter-spacing: -0.5px;
  color: #FFFFFF;
  margin: 0;
`,J=r.default.p.withConfig({displayName:"DeleteConfirmationModal__Subtitle",componentId:"sc-d1950d1f-3"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 16px 0;
  line-height: 1.5;
`,Z=r.default.div.withConfig({displayName:"DeleteConfirmationModal__ButtonGroup",componentId:"sc-d1950d1f-4"})`
  display: flex;
  gap: 16px;
  width: 100%;
`,W=r.default.button.withConfig({displayName:"DeleteConfirmationModal__Button",componentId:"sc-d1950d1f-5"})`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

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

  ${({$variant:e})=>"danger"===e&&`
    background: transparent;
    color: #F87171;
    border: 1px solid rgba(248, 113, 113, 0.3);
    &:hover:not(:disabled) {
      background: rgba(248, 113, 113, 0.1);
    }
  `}
`;function Q({isOpen:e,isLoading:a,onClose:n,onConfirm:i,title:o="Remove Contact?",message:r="Are you sure you want to remove this contact from your network? This action cannot be undone."}){return e?(0,t.jsx)(E.AnimatePresence,{children:(0,t.jsx)($,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:a?void 0:n,children:(0,t.jsxs)(X,{onClick:e=>e.stopPropagation(),initial:{opacity:0,scale:.95,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:20},transition:{type:"spring",bounce:.4,duration:.6},children:[(0,t.jsx)(q,{children:o}),(0,t.jsx)(J,{children:r}),(0,t.jsxs)(Z,{children:[(0,t.jsx)(W,{type:"button",$variant:"secondary",onClick:n,disabled:a,children:"Cancel"}),(0,t.jsx)(W,{type:"button",$variant:"danger",onClick:i,disabled:a,"aria-busy":a,children:a?"Removing...":"Remove"})]})]})})}):null}e.s(["ContactsContainer",0,function(){let{data:e,isLoading:r,isError:s,refetch:l}=(0,n.useGetContacts)(),{mutate:d,isLoading:c}=function(){let[e,t]=(0,a.useState)(!1),[n,r]=(0,a.useState)(!1),[s,l]=(0,a.useState)(null);return{mutate:async e=>{t(!0),r(!1),l(null);try{let a=o.auth.currentUser;if(!a)throw Error("User not authenticated");let n=await a.getIdToken();return await (0,i.deleteContact)(n,e),t(!1),!0}catch(e){return r(!0),l(e.message||"Failed to delete contact"),t(!1),!1}},isLoading:e,isError:n,errorMessage:s}}(),[p,u]=(0,a.useState)(!1),[f,m]=(0,a.useState)(null),[x,h]=(0,a.useState)(!1),[g,b]=(0,a.useState)(null),y=async()=>{g&&await d(g)&&(h(!1),b(null),l())};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(_,{contacts:e?.data||[],isLoading:r,isError:s,onAddContactClick:()=>{m(null),u(!0)},onEditContactClick:e=>{m(e),u(!0)},onDeleteContactClick:e=>{b(e),h(!0)}}),(0,t.jsx)(H,{isOpen:p,onClose:()=>{u(!1),m(null)},onSuccess:()=>{u(!1),m(null),l()},initialData:f}),(0,t.jsx)(Q,{isOpen:x,isLoading:c,onClose:()=>{h(!1),b(null)},onConfirm:y})]})}],94123)}]);