(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,49838,e=>{"use strict";let t={"mainnet-beta":{EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v:"USDC",Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB:"USDT",So11111111111111111111111111111111111111112:"wSOL",DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263:"BONK",JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN:"JUP","2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo":"PYUSD",mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So:"mSOL","7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj":"stSOL",rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof:"RENDER",EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm:"WIF","3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE":"LXR"},devnet:{"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU":"USDC","3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE":"LXR",HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr:"EURC"}};e.s(["TOKEN_REGISTRY",0,t,"getTokenSymbol",0,function(e,a="devnet"){return e&&t[a]?.[e]||null}])},80629,e=>{"use strict";var t=e.i(41931);async function a(e){let a=await fetch((0,t.apiUrl)(`/api/payments/${e}`)),n=await a.json();if(!a.ok)throw Error(n.error??"Payment not found");return n.data}async function n(e){let a=await fetch((0,t.apiUrl)("/api/payments/verify"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reference:e})}),n=await a.json();if(!a.ok)throw Error(n.error??"Verification failed");return n}async function i(e){let a=await fetch((0,t.apiUrl)("/payment-links"),{headers:{Authorization:`Bearer ${e}`}}),n=await a.json();if(!a.ok)throw Error(n.message??"Failed to load links");return n.data}async function r(e){let a=await fetch((0,t.apiUrl)(`/payment-links/${e}`)),n=await a.json();if(!a.ok)throw Error(n.message??"Failed to load link");return n.data}async function o(e,a){let n=await fetch((0,t.apiUrl)("/payment-links"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(a)}),i=await n.json();if(!n.ok)throw Error(i.message??"Failed to create link");return i.data}async function s(e){let a=await fetch((0,t.apiUrl)("/pos/devices"),{headers:{Authorization:`Bearer ${e}`}}),n=await a.json();if(!a.ok)throw Error(n.message??"Failed to load POS devices");return n.data}async function l(e,a){let n=await fetch((0,t.apiUrl)("/pos/devices"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(a)}),i=await n.json();if(!n.ok)throw Error(i.message??"Failed to register device");return i.data}async function c(e,a){let n=await fetch((0,t.apiUrl)("/transfers/send"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(a)}),i=await n.json();if(!n.ok)throw Error(i.message??i.error??"Failed to send transfer");return i}e.s(["createPaymentLink",0,o,"createPosDevice",0,l,"fetchPayment",0,a,"getPaymentLink",0,r,"listPaymentLinks",0,i,"listPosDevices",0,s,"sendTransfer",0,c,"verifyPayment",0,n])},17724,e=>{"use strict";var t=e.i(71645),a=e.i(49838);e.s(["useTokenPrice",0,function(e){let[n,i]=(0,t.useState)(null),[r,o]=(0,t.useState)(!0),[s,l]=(0,t.useState)(!1),[c,d]=(0,t.useState)(null),u=(0,t.useCallback)(async()=>{if(!e){i(null),o(!1),l(!1),d(null);return}let t=e.trim().toUpperCase();if("USDC"===t||"USDT"===t||"EURC"===t||"PYUSD"===t||"LXR"===t){i(1),o(!1),l(!1),d(null);return}o(!0),l(!1),d(null);try{let n=a.TOKEN_REGISTRY.Devnet||{},r="";if("SOL"===t)r="So11111111111111111111111111111111111111112";else{let e=Object.entries(n).find(([,e])=>e===t);e&&(r=e[0])}if(!r)throw Error(`Token mint not found for currency: ${e}`);let o=await fetch(`https://api.jup.ag/price/v3?ids=${r}`);if(!o.ok)throw Error(`Failed to fetch price from Jupiter: ${o.statusText}`);let s=await o.json(),l=s[r]?.usdPrice;if(null!=l)i(l);else if("SOL"===t)i(140);else throw Error(`Price not found for mint: ${r}`)}catch(e){l(!0),d(e.message||"Failed to fetch token price"),"SOL"===t?i(140):i(null)}finally{o(!1)}},[e]);return(0,t.useEffect)(()=>{u()},[u]),{data:n,isLoading:r,isError:s,errorMessage:c,refetch:u}}])},8734,e=>{"use strict";let t=(0,e.i(56420).default)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);e.s(["Copy",0,t],8734)},82022,e=>{"use strict";let t=(0,e.i(56420).default)("external-link",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);e.s(["ExternalLink",0,t],82022)},11241,e=>{"use strict";let t=(0,e.i(56420).default)("arrow-left",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);e.s(["ArrowLeft",0,t],11241)},68877,e=>{"use strict";let t=(0,e.i(56420).default)("arrow-right",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);e.s(["ArrowRight",0,t],68877)},48161,e=>{"use strict";let t=(0,e.i(56420).default)("circle-check-big",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);e.s(["CheckCircle",0,t],48161)},16182,50932,e=>{"use strict";var t=e.i(41931);async function a(e,a){let n=new URL((0,t.apiUrl)("/solana/balance"));n.searchParams.append("publicKey",a);let i=await fetch(n.toString(),{headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"}}),r=await i.json();if(!i.ok)throw Error(r.message?.[0]||r.message||r.error||"Failed to fetch wallet balance");return r.data}e.s(["getWalletBalance",0,a],16182),e.i(47167);var n=e.i(43476),i=e.i(97053),r=e.i(46932),o=e.i(88653),s=e.i(82022),l=e.i(48161);let c=(0,i.default)(r.motion.div).withConfig({displayName:"PaymentSuccessModal__Overlay",componentId:"sc-da6e7bc6-0"})`
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
`,d=(0,i.default)(r.motion.div).withConfig({displayName:"PaymentSuccessModal__ModalContent",componentId:"sc-da6e7bc6-1"})`
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 32px 64px -16px rgba(0,0,0,0.8);
  border-radius: 40px;
  width: 100%;
  max-width: 500px;
  padding: 40px;
  position: relative;
  text-align: center;
`,u=i.default.div.withConfig({displayName:"PaymentSuccessModal__IconContainer",componentId:"sc-da6e7bc6-2"})`
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
`,h=i.default.h2.withConfig({displayName:"PaymentSuccessModal__Title",componentId:"sc-da6e7bc6-3"})`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #FFFFFF;
  margin: 0 0 8px 0;
`,p=i.default.p.withConfig({displayName:"PaymentSuccessModal__Subtitle",componentId:"sc-da6e7bc6-4"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 32px 0;
`,f=i.default.div.withConfig({displayName:"PaymentSuccessModal__DetailsBox",componentId:"sc-da6e7bc6-5"})`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 24px;
  text-align: left;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`,m=i.default.div.withConfig({displayName:"PaymentSuccessModal__DetailRow",componentId:"sc-da6e7bc6-6"})`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,g=i.default.span.withConfig({displayName:"PaymentSuccessModal__DetailLabel",componentId:"sc-da6e7bc6-7"})`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #60A5FA;
  text-transform: uppercase;
`,y=i.default.span.withConfig({displayName:"PaymentSuccessModal__DetailValue",componentId:"sc-da6e7bc6-8"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  color: #FFFFFF;
  word-break: break-all;
`,x=i.default.button.withConfig({displayName:"PaymentSuccessModal__Button",componentId:"sc-da6e7bc6-9"})`
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
`;e.s(["PaymentSuccessModal",0,function({isOpen:e,onClose:t,data:a,title:i="Transfer Successful",subtitle:r="Your funds have been sent to the network.",doneLabel:b="Done"}){var w;let C;return e&&a?(0,n.jsx)(o.AnimatePresence,{children:(0,n.jsx)(c,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:t,children:(0,n.jsxs)(d,{onClick:e=>e.stopPropagation(),initial:{opacity:0,scale:.95,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:20},transition:{type:"spring",bounce:.4,duration:.6},children:[(0,n.jsx)(u,{children:(0,n.jsx)(l.CheckCircle,{})}),(0,n.jsx)(h,{children:i}),(0,n.jsx)(p,{children:r}),(0,n.jsxs)(f,{children:[(0,n.jsxs)(m,{children:[(0,n.jsx)(g,{children:"AMOUNT"}),(0,n.jsxs)(y,{children:[a.amount," ",a.symbol]})]}),(0,n.jsxs)(m,{children:[(0,n.jsx)(g,{children:"RECIPIENT"}),(0,n.jsx)(y,{children:a.toNickname?`${a.toNickname} (${a.toWallet})`:a.toWallet})]}),a.reference&&(0,n.jsxs)(m,{children:[(0,n.jsx)(g,{children:"REFERENCE"}),(0,n.jsx)(y,{children:a.reference})]}),a.signature&&(0,n.jsxs)(m,{children:[(0,n.jsx)(g,{children:"SIGNATURE"}),(0,n.jsxs)(y,{className:"flex items-center gap-2",children:[a.signature.slice(0,8),"...",a.signature.slice(-8),(0,n.jsx)("a",{href:(w=a.signature,C=`https://explorer.solana.com/tx/${w}`,`${C}?cluster=Devnet`),target:"_blank",rel:"noreferrer",className:"text-blue-400 hover:text-white transition-colors",children:(0,n.jsx)(s.ExternalLink,{size:14})})]})]})]}),(0,n.jsx)(x,{onClick:t,children:b})]})})}):null}],50932)},13222,81831,e=>{"use strict";e.i(47167);var t=e.i(27261),a=e.i(49838);function n(){return"devnet"}function i({recipient:e,amount:t,splToken:a,reference:n,label:r,message:o,memo:s}){let l=new URL(`solana:${e}`);return null!=t&&""!==t&&l.searchParams.append("amount",String(t)),a&&l.searchParams.append("spl-token",a),(n?Array.isArray(n)?n:[n]:[]).forEach(e=>l.searchParams.append("reference",e)),r&&l.searchParams.append("label",r),o&&l.searchParams.append("message",o),s&&l.searchParams.append("memo",s),l.toString()}e.s(["buildOpenAmountQrUrl",0,function(e,t="Luxor Pay"){return i({recipient:e,label:t})},"encodeSolanaPayUrl",0,i,"generatePaymentReference",0,function(){return t.Keypair.generate().publicKey.toBase58()},"getMintForSymbol",0,function(e){let t=e.trim().toUpperCase();if("SOL"===t)return null;let i=n(),r=Object.entries(a.TOKEN_REGISTRY[i]??{}).find(([,e])=>e.toUpperCase()===t);return r?.[0]??null},"getSolanaNetwork",0,n,"parseSolanaPayUrl",0,function(e){let t=e.trim();if(!t.startsWith("solana:"))return null;try{let e=new URL(t.replace("solana:","http://localhost/")),a=e.pathname.replace(/^\//,"");if(!a)return null;return{recipient:a,amount:e.searchParams.get("amount")??void 0,splToken:e.searchParams.get("spl-token")??void 0,references:e.searchParams.getAll("reference"),label:e.searchParams.get("label")??void 0,message:e.searchParams.get("message")??void 0,memo:e.searchParams.get("memo")??void 0}}catch{return null}}],81831);let r=new Set(["luxor pay",""]);function o({recipient:e,amount:t,currency:a="SOL",label:n,chargeRef:i,invoiceRef:r,expiry:s,usdAmount:l,message:c}){let d=new URLSearchParams;return d.set("recipient",e),t&&(d.set("amount",t),d.set("currency",a)),n&&d.set("label",n),i&&d.set("chargeRef",i),r&&d.set("invoiceRef",r),s&&d.set("expiry",s),l&&d.set("usdAmount",l),c&&d.set("message",c),`/pay/qr?${d.toString()}`}e.s(["buildLuxorPayCheckoutPath",0,o,"buildLuxorPayCheckoutPathFromSolanaPay",0,function(e){let t="SOL";return e.splToken&&(t=(0,a.getTokenSymbol)(e.splToken,n())??"SOL"),o({recipient:e.recipient,amount:e.amount,currency:t,label:e.label,chargeRef:e.references[0],message:e.message??e.memo})},"isGenericCheckoutLabel",0,function(e){return!e?.trim()||r.has(e.trim().toLowerCase())}],13222)},28835,e=>{"use strict";let t,a;var n,i,r,o,s,l=e.i(71645),c=Object.defineProperty,d=Object.getOwnPropertySymbols,u=Object.prototype.hasOwnProperty,h=Object.prototype.propertyIsEnumerable,p=(e,t,a)=>t in e?c(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,f=(e,t)=>{for(var a in t||(t={}))u.call(t,a)&&p(e,a,t[a]);if(d)for(var a of d(t))h.call(t,a)&&p(e,a,t[a]);return e},m=(e,t)=>{var a={};for(var n in e)u.call(e,n)&&0>t.indexOf(n)&&(a[n]=e[n]);if(null!=e&&d)for(var n of d(e))0>t.indexOf(n)&&h.call(e,n)&&(a[n]=e[n]);return a};(e=>{let t=class t{constructor(e,a,n,r){if(this.version=e,this.errorCorrectionLevel=a,this.modules=[],this.isFunction=[],e<t.MIN_VERSION||e>t.MAX_VERSION)throw RangeError("Version value out of range");if(r<-1||r>7)throw RangeError("Mask value out of range");this.size=4*e+17;let o=[];for(let e=0;e<this.size;e++)o.push(!1);for(let e=0;e<this.size;e++)this.modules.push(o.slice()),this.isFunction.push(o.slice());this.drawFunctionPatterns();const s=this.addEccAndInterleave(n);if(this.drawCodewords(s),-1==r){let e=1e9;for(let t=0;t<8;t++){this.applyMask(t),this.drawFormatBits(t);const a=this.getPenaltyScore();a<e&&(r=t,e=a),this.applyMask(t)}}i(0<=r&&r<=7),this.mask=r,this.applyMask(r),this.drawFormatBits(r),this.isFunction=[]}static encodeText(a,n){let i=e.QrSegment.makeSegments(a);return t.encodeSegments(i,n)}static encodeBinary(a,n){let i=e.QrSegment.makeBytes(a);return t.encodeSegments([i],n)}static encodeSegments(e,n,r=1,s=40,l=-1,c=!0){let d,u;if(!(t.MIN_VERSION<=r&&r<=s&&s<=t.MAX_VERSION)||l<-1||l>7)throw RangeError("Invalid value");for(d=r;;d++){let a=8*t.getNumDataCodewords(d,n),i=o.getTotalBits(e,d);if(i<=a){u=i;break}if(d>=s)throw RangeError("Data too long")}for(let e of[t.Ecc.MEDIUM,t.Ecc.QUARTILE,t.Ecc.HIGH])c&&u<=8*t.getNumDataCodewords(d,e)&&(n=e);let h=[];for(let t of e)for(let e of(a(t.mode.modeBits,4,h),a(t.numChars,t.mode.numCharCountBits(d),h),t.getData()))h.push(e);i(h.length==u);let p=8*t.getNumDataCodewords(d,n);i(h.length<=p),a(0,Math.min(4,p-h.length),h),a(0,(8-h.length%8)%8,h),i(h.length%8==0);for(let e=236;h.length<p;e^=253)a(e,8,h);let f=[];for(;8*f.length<h.length;)f.push(0);return h.forEach((e,t)=>f[t>>>3]|=e<<7-(7&t)),new t(d,n,f,l)}getModule(e,t){return 0<=e&&e<this.size&&0<=t&&t<this.size&&this.modules[t][e]}getModules(){return this.modules}drawFunctionPatterns(){for(let e=0;e<this.size;e++)this.setFunctionModule(6,e,e%2==0),this.setFunctionModule(e,6,e%2==0);this.drawFinderPattern(3,3),this.drawFinderPattern(this.size-4,3),this.drawFinderPattern(3,this.size-4);let e=this.getAlignmentPatternPositions(),t=e.length;for(let a=0;a<t;a++)for(let n=0;n<t;n++)(0!=a||0!=n)&&(0!=a||n!=t-1)&&(a!=t-1||0!=n)&&this.drawAlignmentPattern(e[a],e[n]);this.drawFormatBits(0),this.drawVersion()}drawFormatBits(e){let t=this.errorCorrectionLevel.formatBits<<3|e,a=t;for(let e=0;e<10;e++)a=a<<1^(a>>>9)*1335;let r=(t<<10|a)^21522;i(r>>>15==0);for(let e=0;e<=5;e++)this.setFunctionModule(8,e,n(r,e));this.setFunctionModule(8,7,n(r,6)),this.setFunctionModule(8,8,n(r,7)),this.setFunctionModule(7,8,n(r,8));for(let e=9;e<15;e++)this.setFunctionModule(14-e,8,n(r,e));for(let e=0;e<8;e++)this.setFunctionModule(this.size-1-e,8,n(r,e));for(let e=8;e<15;e++)this.setFunctionModule(8,this.size-15+e,n(r,e));this.setFunctionModule(8,this.size-8,!0)}drawVersion(){if(this.version<7)return;let e=this.version;for(let t=0;t<12;t++)e=e<<1^(e>>>11)*7973;let t=this.version<<12|e;i(t>>>18==0);for(let e=0;e<18;e++){let a=n(t,e),i=this.size-11+e%3,r=Math.floor(e/3);this.setFunctionModule(i,r,a),this.setFunctionModule(r,i,a)}}drawFinderPattern(e,t){for(let a=-4;a<=4;a++)for(let n=-4;n<=4;n++){let i=Math.max(Math.abs(n),Math.abs(a)),r=e+n,o=t+a;0<=r&&r<this.size&&0<=o&&o<this.size&&this.setFunctionModule(r,o,2!=i&&4!=i)}}drawAlignmentPattern(e,t){for(let a=-2;a<=2;a++)for(let n=-2;n<=2;n++)this.setFunctionModule(e+n,t+a,1!=Math.max(Math.abs(n),Math.abs(a)))}setFunctionModule(e,t,a){this.modules[t][e]=a,this.isFunction[t][e]=!0}addEccAndInterleave(e){let a=this.version,n=this.errorCorrectionLevel;if(e.length!=t.getNumDataCodewords(a,n))throw RangeError("Invalid argument");let r=t.NUM_ERROR_CORRECTION_BLOCKS[n.ordinal][a],o=t.ECC_CODEWORDS_PER_BLOCK[n.ordinal][a],s=Math.floor(t.getNumRawDataModules(a)/8),l=r-s%r,c=Math.floor(s/r),d=[],u=t.reedSolomonComputeDivisor(o);for(let a=0,n=0;a<r;a++){let i=e.slice(n,n+c-o+(a<l?0:1));n+=i.length;let r=t.reedSolomonComputeRemainder(i,u);a<l&&i.push(0),d.push(i.concat(r))}let h=[];for(let e=0;e<d[0].length;e++)d.forEach((t,a)=>{(e!=c-o||a>=l)&&h.push(t[e])});return i(h.length==s),h}drawCodewords(e){if(e.length!=Math.floor(t.getNumRawDataModules(this.version)/8))throw RangeError("Invalid argument");let a=0;for(let t=this.size-1;t>=1;t-=2){6==t&&(t=5);for(let i=0;i<this.size;i++)for(let r=0;r<2;r++){let o=t-r,s=(t+1&2)==0?this.size-1-i:i;!this.isFunction[s][o]&&a<8*e.length&&(this.modules[s][o]=n(e[a>>>3],7-(7&a)),a++)}}i(a==8*e.length)}applyMask(e){if(e<0||e>7)throw RangeError("Mask value out of range");for(let t=0;t<this.size;t++)for(let a=0;a<this.size;a++){let n;switch(e){case 0:n=(a+t)%2==0;break;case 1:n=t%2==0;break;case 2:n=a%3==0;break;case 3:n=(a+t)%3==0;break;case 4:n=(Math.floor(a/3)+Math.floor(t/2))%2==0;break;case 5:n=a*t%2+a*t%3==0;break;case 6:n=(a*t%2+a*t%3)%2==0;break;case 7:n=((a+t)%2+a*t%3)%2==0;break;default:throw Error("Unreachable")}!this.isFunction[t][a]&&n&&(this.modules[t][a]=!this.modules[t][a])}}getPenaltyScore(){let e=0;for(let a=0;a<this.size;a++){let n=!1,i=0,r=[0,0,0,0,0,0,0];for(let o=0;o<this.size;o++)this.modules[a][o]==n?5==++i?e+=t.PENALTY_N1:i>5&&e++:(this.finderPenaltyAddHistory(i,r),n||(e+=this.finderPenaltyCountPatterns(r)*t.PENALTY_N3),n=this.modules[a][o],i=1);e+=this.finderPenaltyTerminateAndCount(n,i,r)*t.PENALTY_N3}for(let a=0;a<this.size;a++){let n=!1,i=0,r=[0,0,0,0,0,0,0];for(let o=0;o<this.size;o++)this.modules[o][a]==n?5==++i?e+=t.PENALTY_N1:i>5&&e++:(this.finderPenaltyAddHistory(i,r),n||(e+=this.finderPenaltyCountPatterns(r)*t.PENALTY_N3),n=this.modules[o][a],i=1);e+=this.finderPenaltyTerminateAndCount(n,i,r)*t.PENALTY_N3}for(let a=0;a<this.size-1;a++)for(let n=0;n<this.size-1;n++){let i=this.modules[a][n];i==this.modules[a][n+1]&&i==this.modules[a+1][n]&&i==this.modules[a+1][n+1]&&(e+=t.PENALTY_N2)}let a=0;for(let e of this.modules)a=e.reduce((e,t)=>e+ +!!t,a);let n=this.size*this.size,r=Math.ceil(Math.abs(20*a-10*n)/n)-1;return i(0<=r&&r<=9),i(0<=(e+=r*t.PENALTY_N4)&&e<=2568888),e}getAlignmentPatternPositions(){if(1==this.version)return[];{let e=Math.floor(this.version/7)+2,t=32==this.version?26:2*Math.ceil((4*this.version+4)/(2*e-2)),a=[6];for(let n=this.size-7;a.length<e;n-=t)a.splice(1,0,n);return a}}static getNumRawDataModules(e){if(e<t.MIN_VERSION||e>t.MAX_VERSION)throw RangeError("Version number out of range");let a=(16*e+128)*e+64;if(e>=2){let t=Math.floor(e/7)+2;a-=(25*t-10)*t-55,e>=7&&(a-=36)}return i(208<=a&&a<=29648),a}static getNumDataCodewords(e,a){return Math.floor(t.getNumRawDataModules(e)/8)-t.ECC_CODEWORDS_PER_BLOCK[a.ordinal][e]*t.NUM_ERROR_CORRECTION_BLOCKS[a.ordinal][e]}static reedSolomonComputeDivisor(e){if(e<1||e>255)throw RangeError("Degree out of range");let a=[];for(let t=0;t<e-1;t++)a.push(0);a.push(1);let n=1;for(let i=0;i<e;i++){for(let e=0;e<a.length;e++)a[e]=t.reedSolomonMultiply(a[e],n),e+1<a.length&&(a[e]^=a[e+1]);n=t.reedSolomonMultiply(n,2)}return a}static reedSolomonComputeRemainder(e,a){let n=a.map(e=>0);for(let i of e){let e=i^n.shift();n.push(0),a.forEach((a,i)=>n[i]^=t.reedSolomonMultiply(a,e))}return n}static reedSolomonMultiply(e,t){if(e>>>8!=0||t>>>8!=0)throw RangeError("Byte out of range");let a=0;for(let n=7;n>=0;n--)a=a<<1^(a>>>7)*285^(t>>>n&1)*e;return i(a>>>8==0),a}finderPenaltyCountPatterns(e){let t=e[1];i(t<=3*this.size);let a=t>0&&e[2]==t&&e[3]==3*t&&e[4]==t&&e[5]==t;return(a&&e[0]>=4*t&&e[6]>=t?1:0)+(a&&e[6]>=4*t&&e[0]>=t?1:0)}finderPenaltyTerminateAndCount(e,t,a){return e&&(this.finderPenaltyAddHistory(t,a),t=0),t+=this.size,this.finderPenaltyAddHistory(t,a),this.finderPenaltyCountPatterns(a)}finderPenaltyAddHistory(e,t){0==t[0]&&(e+=this.size),t.pop(),t.unshift(e)}};function a(e,t,a){if(t<0||t>31||e>>>t!=0)throw RangeError("Value out of range");for(let n=t-1;n>=0;n--)a.push(e>>>n&1)}function n(e,t){return(e>>>t&1)!=0}function i(e){if(!e)throw Error("Assertion error")}t.MIN_VERSION=1,t.MAX_VERSION=40,t.PENALTY_N1=3,t.PENALTY_N2=3,t.PENALTY_N3=40,t.PENALTY_N4=10,t.ECC_CODEWORDS_PER_BLOCK=[[-1,7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],[-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],[-1,13,22,18,26,18,24,18,22,20,24,28,26,24,20,30,24,28,28,26,30,28,30,30,30,30,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],[-1,17,28,22,16,22,28,26,26,24,28,24,28,22,24,24,30,28,28,26,28,30,24,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30]],t.NUM_ERROR_CORRECTION_BLOCKS=[[-1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],[-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49],[-1,1,1,2,2,4,4,6,6,8,8,8,10,12,16,12,17,16,18,21,20,23,23,25,27,29,34,34,35,38,40,43,45,48,51,53,56,59,62,65,68],[-1,1,1,2,4,4,4,5,6,8,8,11,11,16,16,18,16,19,21,25,25,25,34,30,32,35,37,40,42,45,48,51,54,57,60,63,66,70,74,77,81]],e.QrCode=t;let r=class e{constructor(e,t,a){if(this.mode=e,this.numChars=t,this.bitData=a,t<0)throw RangeError("Invalid argument");this.bitData=a.slice()}static makeBytes(t){let n=[];for(let e of t)a(e,8,n);return new e(e.Mode.BYTE,t.length,n)}static makeNumeric(t){if(!e.isNumeric(t))throw RangeError("String contains non-numeric characters");let n=[];for(let e=0;e<t.length;){let i=Math.min(t.length-e,3);a(parseInt(t.substring(e,e+i),10),3*i+1,n),e+=i}return new e(e.Mode.NUMERIC,t.length,n)}static makeAlphanumeric(t){let n;if(!e.isAlphanumeric(t))throw RangeError("String contains unencodable characters in alphanumeric mode");let i=[];for(n=0;n+2<=t.length;n+=2){let r=45*e.ALPHANUMERIC_CHARSET.indexOf(t.charAt(n));a(r+=e.ALPHANUMERIC_CHARSET.indexOf(t.charAt(n+1)),11,i)}return n<t.length&&a(e.ALPHANUMERIC_CHARSET.indexOf(t.charAt(n)),6,i),new e(e.Mode.ALPHANUMERIC,t.length,i)}static makeSegments(t){return""==t?[]:e.isNumeric(t)?[e.makeNumeric(t)]:e.isAlphanumeric(t)?[e.makeAlphanumeric(t)]:[e.makeBytes(e.toUtf8ByteArray(t))]}static makeEci(t){let n=[];if(t<0)throw RangeError("ECI assignment value out of range");if(t<128)a(t,8,n);else if(t<16384)a(2,2,n),a(t,14,n);else if(t<1e6)a(6,3,n),a(t,21,n);else throw RangeError("ECI assignment value out of range");return new e(e.Mode.ECI,0,n)}static isNumeric(t){return e.NUMERIC_REGEX.test(t)}static isAlphanumeric(t){return e.ALPHANUMERIC_REGEX.test(t)}getData(){return this.bitData.slice()}static getTotalBits(e,t){let a=0;for(let n of e){let e=n.mode.numCharCountBits(t);if(n.numChars>=1<<e)return 1/0;a+=4+e+n.bitData.length}return a}static toUtf8ByteArray(e){e=encodeURI(e);let t=[];for(let a=0;a<e.length;a++)"%"!=e.charAt(a)?t.push(e.charCodeAt(a)):(t.push(parseInt(e.substring(a+1,a+3),16)),a+=2);return t}};r.NUMERIC_REGEX=/^[0-9]*$/,r.ALPHANUMERIC_REGEX=/^[A-Z0-9 $%*+.\/:-]*$/,r.ALPHANUMERIC_CHARSET="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";let o=r;e.QrSegment=r})(s||(s={})),i=(n=s||(s={})).QrCode||(n.QrCode={}),(t=class{constructor(e,t){this.ordinal=e,this.formatBits=t}}).LOW=new t(0,1),t.MEDIUM=new t(1,0),t.QUARTILE=new t(2,3),t.HIGH=new t(3,2),i.Ecc=t,o=(r=s||(s={})).QrSegment||(r.QrSegment={}),(a=class{constructor(e,t){this.modeBits=e,this.numBitsCharCount=t}numCharCountBits(e){return this.numBitsCharCount[Math.floor((e+7)/17)]}}).NUMERIC=new a(1,[10,12,14]),a.ALPHANUMERIC=new a(2,[9,11,13]),a.BYTE=new a(4,[8,16,16]),a.KANJI=new a(8,[8,10,12]),a.ECI=new a(7,[0,0,0]),o.Mode=a;var g=s,y={L:g.QrCode.Ecc.LOW,M:g.QrCode.Ecc.MEDIUM,Q:g.QrCode.Ecc.QUARTILE,H:g.QrCode.Ecc.HIGH},x="#FFFFFF",b="#000000";function w(e,t=0){let a=[];return e.forEach(function(e,n){let i=null;e.forEach(function(r,o){if(!r&&null!==i){a.push(`M${i+t} ${n+t}h${o-i}v1H${i+t}z`),i=null;return}if(o===e.length-1){if(!r)return;null===i?a.push(`M${o+t},${n+t} h1v1H${o+t}z`):a.push(`M${i+t},${n+t} h${o+1-i}v1H${i+t}z`);return}r&&null===i&&(i=o)})}),a.join("")}function C(e,t){return e.slice().map((e,a)=>a<t.y||a>=t.y+t.h?e:e.map((e,a)=>(a<t.x||a>=t.x+t.w)&&e))}function E({value:e,level:t,minVersion:a,includeMargin:n,marginSize:i,imageSettings:r,size:o,boostLevel:s}){let c=l.default.useMemo(()=>{let n=(Array.isArray(e)?e:[e]).reduce((e,t)=>(e.push(...g.QrSegment.makeSegments(t)),e),[]);return g.QrCode.encodeSegments(n,y[t],a,void 0,void 0,s)},[e,t,a,s]),{cells:d,margin:u,numCells:h,calculatedImageSettings:p}=l.default.useMemo(()=>{let e=c.getModules(),t=null!=i?Math.max(Math.floor(i),0):4*!!n,a=e.length+2*t,s=function(e,t,a,n){if(null==n)return null;let i=e.length+2*a,r=Math.floor(.1*t),o=i/t,s=(n.width||r)*o,l=(n.height||r)*o,c=null==n.x?e.length/2-s/2:n.x*o,d=null==n.y?e.length/2-l/2:n.y*o,u=null==n.opacity?1:n.opacity,h=null;if(n.excavate){let e=Math.floor(c),t=Math.floor(d),a=Math.ceil(s+c-e),n=Math.ceil(l+d-t);h={x:e,y:t,w:a,h:n}}return{x:c,y:d,h:l,w:s,excavation:h,opacity:u,crossOrigin:n.crossOrigin}}(e,o,t,r);return{cells:e,margin:t,numCells:a,calculatedImageSettings:s}},[c,o,r,n,i]);return{qrcode:c,margin:u,cells:d,numCells:h,calculatedImageSettings:p}}var v=function(){try{new Path2D().addPath(new Path2D)}catch(e){return!1}return!0}();l.default.forwardRef(function(e,t){let{value:a,size:n=128,level:i="L",bgColor:r=x,fgColor:o=b,includeMargin:s=!1,minVersion:c=1,boostLevel:d,marginSize:u,imageSettings:h}=e,p=m(e,["value","size","level","bgColor","fgColor","includeMargin","minVersion","boostLevel","marginSize","imageSettings"]),{style:g}=p,y=m(p,["style"]),N=null==h?void 0:h.src,M=l.default.useRef(null),P=l.default.useRef(null),S=l.default.useCallback(e=>{M.current=e,"function"==typeof t?t(e):t&&(t.current=e)},[t]),[k,R]=l.default.useState(!1),{margin:j,cells:F,numCells:A,calculatedImageSettings:T}=E({value:a,level:i,minVersion:c,boostLevel:d,includeMargin:s,marginSize:u,imageSettings:h,size:n});l.default.useEffect(()=>{if(null!=M.current){let e=M.current,t=e.getContext("2d");if(!t)return;let a=F,i=P.current,s=null!=T&&null!==i&&i.complete&&0!==i.naturalHeight&&0!==i.naturalWidth;s&&null!=T.excavation&&(a=C(F,T.excavation));let l=window.devicePixelRatio||1;e.height=e.width=n*l;let c=n/A*l;t.scale(c,c),t.fillStyle=r,t.fillRect(0,0,A,A),t.fillStyle=o,v?t.fill(new Path2D(w(a,j))):F.forEach(function(e,a){e.forEach(function(e,n){e&&t.fillRect(n+j,a+j,1,1)})}),T&&(t.globalAlpha=T.opacity),s&&t.drawImage(i,T.x+j,T.y+j,T.w,T.h)}}),l.default.useEffect(()=>{R(!1)},[N]);let O=f({height:n,width:n},g),I=null;return null!=N&&(I=l.default.createElement("img",{src:N,key:N,style:{display:"none"},onLoad:()=>{R(!0)},ref:P,crossOrigin:null==T?void 0:T.crossOrigin})),l.default.createElement(l.default.Fragment,null,l.default.createElement("canvas",f({style:O,height:n,width:n,ref:S,role:"img"},y)),I)}).displayName="QRCodeCanvas";var N=l.default.forwardRef(function(e,t){let{value:a,size:n=128,level:i="L",bgColor:r=x,fgColor:o=b,includeMargin:s=!1,minVersion:c=1,boostLevel:d,title:u,marginSize:h,imageSettings:p}=e,g=m(e,["value","size","level","bgColor","fgColor","includeMargin","minVersion","boostLevel","title","marginSize","imageSettings"]),{margin:y,cells:v,numCells:N,calculatedImageSettings:M}=E({value:a,level:i,minVersion:c,boostLevel:d,includeMargin:s,marginSize:h,imageSettings:p,size:n}),P=v,S=null;null!=p&&null!=M&&(null!=M.excavation&&(P=C(v,M.excavation)),S=l.default.createElement("image",{href:p.src,height:M.h,width:M.w,x:M.x+y,y:M.y+y,preserveAspectRatio:"none",opacity:M.opacity,crossOrigin:M.crossOrigin}));let k=w(P,y);return l.default.createElement("svg",f({height:n,width:n,viewBox:`0 0 ${N} ${N}`,ref:t,role:"img"},g),!!u&&l.default.createElement("title",null,u),l.default.createElement("path",{fill:r,d:`M0,0 h${N}v${N}H0z`,shapeRendering:"crispEdges"}),l.default.createElement("path",{fill:o,d:k,shapeRendering:"crispEdges"}),S)});N.displayName="QRCodeSVG",e.s(["QRCodeSVG",0,N])},90446,e=>{"use strict";var t=e.i(41931);async function a(e){let a=await fetch((0,t.apiUrl)("/contacts"),{method:"GET",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"}});if(!a.ok)throw Error((await a.json().catch(()=>({}))).message||"Failed to fetch contacts");return a.json()}async function n(e,a){let n=await fetch((0,t.apiUrl)("/contacts"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(a)});if(!n.ok)throw Error((await n.json().catch(()=>({}))).message||"Failed to create contact");return n.json()}async function i(e,a,n){let i=await fetch((0,t.apiUrl)(`/contacts/${a}`),{method:"PATCH",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(n)});if(!i.ok)throw Error((await i.json().catch(()=>({}))).message||"Failed to update contact");return{data:await i.json()}}async function r(e,a){let n=await fetch((0,t.apiUrl)(`/contacts/${a}`),{method:"DELETE",headers:{Authorization:`Bearer ${e}`}});if(!n.ok)throw Error((await n.json().catch(()=>({}))).message||"Failed to delete contact");return n.json()}e.s(["createContact",0,n,"deleteContact",0,r,"getContacts",0,a,"updateContact",0,i])},15471,e=>{"use strict";e.s(["getLuxorEnv",0,function(){return"development"}])},61057,e=>{"use strict";var t=e.i(71645),a=e.i(90446),n=e.i(59141);e.s(["useGetContacts",0,function(){let[e,i]=(0,t.useState)(null),[r,o]=(0,t.useState)(!0),[s,l]=(0,t.useState)(!1),[c,d]=(0,t.useState)(null),u=(0,t.useCallback)(async()=>{o(!0),l(!1),d(null);try{let e=n.auth.currentUser;if(!e)throw Error("User not authenticated");let t=await e.getIdToken(),r=await (0,a.getContacts)(t);i(r)}catch(e){l(!0),d(e.message||"Failed to fetch contacts"),i(null)}finally{o(!1)}},[]);return(0,t.useEffect)(()=>{u()},[u]),{data:e,isLoading:r,isError:s,errorMessage:c,refetch:u}}])},99847,e=>{"use strict";let t=(0,e.i(56420).default)("circle-alert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);e.s(["AlertCircle",0,t],99847)},45338,e=>{"use strict";var t=e.i(41931);async function a(e,n=0,i=10,r){let o=new URL((0,t.apiUrl)("/transfers"));o.searchParams.append("offset",n.toString()),o.searchParams.append("limit",i.toString()),r&&o.searchParams.append("status",r);let s=await fetch(o.toString(),{headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"}}),l=await s.json();if(!s.ok)throw Error(l.message?.[0]||l.message||l.error||"Failed to fetch transfers");return l}async function n(e,a){let n=await fetch((0,t.apiUrl)("/transfers/send"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(a)}),i=await n.json();if(!n.ok){let e="Failed to process transfer";throw Array.isArray(i.message)?e=i.message.join(", "):i.message?e=i.message:i.error&&(e=i.error),Error(e)}return i}e.s(["getTransfers",0,a,"sendTransfer",0,n])},16327,e=>{"use strict";let t=(0,e.i(56420).default)("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);e.s(["ChevronDown",0,t],16327)},54449,e=>{"use strict";var t=e.i(41931);async function a(e,a){let n=await fetch((0,t.apiUrl)("/payment-requests"),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(a)});if(!n.ok)throw Error((await n.json().catch(()=>({}))).message||"Failed to create payment request");return n.json()}async function n(e,a,n){let i=new URLSearchParams({perspective:a,walletAddress:n}),r=await fetch((0,t.apiUrl)(`/payment-requests?${i}`),{headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"}});if(!r.ok)throw Error((await r.json().catch(()=>({}))).message||"Failed to fetch payment requests");return r.json()}async function i(e,a,n){let i=await fetch((0,t.apiUrl)(`/payment-requests/${a}/resend`),{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:n?JSON.stringify(n):void 0});if(!i.ok)throw Error((await i.json().catch(()=>({}))).message||"Failed to resend notification");return i.json()}async function r(e,a,n){let i=await fetch((0,t.apiUrl)(`/payment-requests/${a}/cancel`),{method:"PATCH",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify(n)});if(!i.ok){let e=await i.json().catch(()=>({}));throw Error(Array.isArray(e.message)?e.message.join(", "):e.message||"Failed to update payment request")}return i.json()}e.s(["createPaymentRequest",0,a,"listPaymentRequests",0,n,"resendPaymentRequestNotification",0,i,"updatePaymentRequest",0,r])},30274,e=>{"use strict";let t=(0,e.i(56420).default)("send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]);e.s(["Send",0,t],30274)},70812,e=>{"use strict";let t=(0,e.i(56420).default)("bell",[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}]]);e.s(["Bell",0,t],70812)},90065,e=>{"use strict";var t=e.i(71645),a=e.i(54449),n=e.i(59141);e.s(["useCreatePaymentRequest",0,function(){let[e,i]=(0,t.useState)(!1),[r,o]=(0,t.useState)(!1),[s,l]=(0,t.useState)(null);return{mutate:async e=>{i(!0),o(!1),l(null);try{let t=n.auth.currentUser;if(!t)throw Error("User not authenticated");let r=await t.getIdToken(),o=await (0,a.createPaymentRequest)(r,e);return i(!1),{success:!0,data:o.data}}catch(t){let e=t.message||"Failed to create payment request";return o(!0),l(e),i(!1),{success:!1,error:e}}},isLoading:e,isError:r,errorMessage:s}}])},45033,56539,e=>{"use strict";var t=e.i(43476),a=e.i(71645),n=e.i(97053),i=e.i(46932),r=e.i(88653),o=e.i(49838),s=e.i(15471),l=e.i(61057),c=e.i(90065),d=e.i(46696),u=e.i(48161),h=e.i(30274),p=e.i(63676),f=e.i(16327);let m=(0,e.i(56420).default)("chevron-up",[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]]);e.s(["ChevronUp",0,m],56539);let g=(0,n.default)(i.motion.div).withConfig({displayName:"PaymentRequestModal__Overlay",componentId:"sc-dabbe06-0"})`
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
`,y=(0,n.default)(i.motion.div).withConfig({displayName:"PaymentRequestModal__ModalContent",componentId:"sc-dabbe06-1"})`
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
`,x=n.default.button.withConfig({displayName:"PaymentRequestModal__CloseButton",componentId:"sc-dabbe06-2"})`
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
`,b=n.default.h2.withConfig({displayName:"PaymentRequestModal__Title",componentId:"sc-dabbe06-3"})`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #FFFFFF;
  margin: 0 0 8px 0;
  text-align: center;
`,w=n.default.p.withConfig({displayName:"PaymentRequestModal__Subtitle",componentId:"sc-dabbe06-4"})`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 32px 0;
  text-align: center;
  line-height: 1.5;
`,C=n.default.form.withConfig({displayName:"PaymentRequestModal__Form",componentId:"sc-dabbe06-5"})`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
`,E=n.default.div.withConfig({displayName:"PaymentRequestModal__FieldGroup",componentId:"sc-dabbe06-6"})`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`,v=n.default.span.withConfig({displayName:"PaymentRequestModal__FieldLabel",componentId:"sc-dabbe06-7"})`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 2px;
  display: block;
`,N=n.default.input.withConfig({displayName:"PaymentRequestModal__TextInput",componentId:"sc-dabbe06-8"})`
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
`,M=n.default.select.withConfig({displayName:"PaymentRequestModal__Select",componentId:"sc-dabbe06-9"})`
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
`,P=n.default.button.withConfig({displayName:"PaymentRequestModal__ToggleLink",componentId:"sc-dabbe06-10"})`
  background: none;
  border: none;
  color: #60A5FA;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  &:hover { text-decoration: underline; }
`,S=n.default.div.withConfig({displayName:"PaymentRequestModal__Divider",componentId:"sc-dabbe06-11"})`
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 16px 0;
  width: 100%;
`,k=n.default.button.withConfig({displayName:"PaymentRequestModal__ActionButton",componentId:"sc-dabbe06-12"})`
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
`,R=n.default.button.withConfig({displayName:"PaymentRequestModal__AdvancedToggle",componentId:"sc-dabbe06-13"})`
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
`,j=(0,n.default)(i.motion.div).withConfig({displayName:"PaymentRequestModal__SuccessWrapper",componentId:"sc-dabbe06-14"})`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  padding: 20px 0;
  width: 100%;
`,F=n.default.div.withConfig({displayName:"PaymentRequestModal__SuccessIcon",componentId:"sc-dabbe06-15"})`
  width: 72px;
  height: 72px;
  border-radius: 9999px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #22C55E;
`,A=n.default.div.withConfig({displayName:"PaymentRequestModal__SuccessId",componentId:"sc-dabbe06-16"})`
  font-family: monospace;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 16px;
  word-break: break-all;
  width: 100%;
`,T=n.default.div.withConfig({displayName:"PaymentRequestModal__ErrorBanner",componentId:"sc-dabbe06-17"})`
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 14px;
  padding: 12px 16px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: #FCA5A5;
  width: 100%;
`;e.s(["PaymentRequestModal",0,function({isOpen:e,onClose:n,requesterWallet:i}){let O="development"===(0,s.getLuxorEnv)(),I=O?o.TOKEN_REGISTRY.devnet:o.TOKEN_REGISTRY["mainnet-beta"],{data:_,isLoading:z}=(0,l.useGetContacts)(),{mutate:L,isLoading:U,isError:B,errorMessage:D}=(0,c.useCreatePaymentRequest)(),[q,$]=(0,a.useState)(!1),[H,Y]=(0,a.useState)(null),[K,G]=(0,a.useState)(null),[V,W]=(0,a.useState)(!1),Q=Object.keys(I)[0]??"",[X,J]=(0,a.useState)({payerWallet:"",businessName:"",amount:"",assetMint:Q,notificationType:"NONE",targetNotification:"",reference:"",numericalReference:"",expirationDate:""});(0,a.useEffect)(()=>{e&&(G(null),Y(null),$(!1),W(!1),J({payerWallet:"",businessName:"",amount:"",assetMint:Q,notificationType:"NONE",targetNotification:"",reference:"",numericalReference:"",expirationDate:""}))},[e,Q]);let Z=e=>{let{name:t,value:a}=e.target;J(e=>({...e,[t]:a})),"notificationType"===t&&H&&J(e=>({...e,notificationType:a,targetNotification:"EMAIL"===a?H.email||"":"PHONE"===a&&H.telephone||""}))},ee=async e=>{if(e.preventDefault(),!i)return void d.toast.error("No requester wallet configured.");let t=X.numericalReference?parseInt(X.numericalReference,10):void 0,a={requesterWallet:i,targetNotificationType:X.notificationType,amount:X.amount,assetMint:X.assetMint,payerWallet:X.payerWallet};"NONE"!==X.notificationType&&X.targetNotification&&(a.targetNotification=X.targetNotification),X.reference&&(a.reference=X.reference),X.businessName&&(a.businessName=X.businessName),void 0===t||isNaN(t)||(a.numericalReference=t),X.expirationDate&&(a.expirationDate=new Date(X.expirationDate).toISOString());let n=await L(a);n.success&&n.data?(G(n.data.id),d.toast.success("Payment request sent!")):d.toast.error(n.error||"Failed to send payment request.")},et="EMAIL"===X.notificationType||"PHONE"===X.notificationType;return(0,t.jsx)(r.AnimatePresence,{children:e&&(0,t.jsx)(g,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:n,children:(0,t.jsxs)(y,{onClick:e=>e.stopPropagation(),initial:{opacity:0,scale:.95,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:20},transition:{type:"spring",bounce:.4,duration:.6},children:[(0,t.jsx)(x,{type:"button",onClick:n,"aria-label":"Close",children:(0,t.jsx)(p.X,{size:18})}),K?(0,t.jsxs)(j,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{type:"spring",bounce:.4,duration:.7},children:[(0,t.jsx)(F,{children:(0,t.jsx)(u.CheckCircle,{size:36})}),(0,t.jsxs)("div",{children:[(0,t.jsx)(b,{children:"Request Sent!"}),(0,t.jsx)(w,{children:"Your payment request has been created and the payer will be notified."})]}),(0,t.jsx)(A,{children:K}),(0,t.jsx)(k,{$variant:"primary",type:"button",onClick:n,style:{marginTop:"24px"},children:"Done"})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(b,{children:"Ask for a Payment"}),(0,t.jsx)(w,{children:"Request a payment from another Solana wallet. The payer will receive a notification with the payment details."}),B&&D&&(0,t.jsx)(T,{style:{marginBottom:"20px"},children:D}),(0,t.jsxs)(C,{onSubmit:ee,children:[(0,t.jsxs)(E,{children:[(0,t.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px"},children:[(0,t.jsx)(v,{style:{marginBottom:0},children:"Payer Wallet *"}),(0,t.jsx)(P,{type:"button",onClick:()=>{$(e=>!e),Y(null),J(e=>({...e,payerWallet:"",businessName:""}))},children:q?"Enter manually":"Use contact"})]}),q?(0,t.jsxs)(M,{id:"pr-contact-select",value:H?.id??"",onChange:e=>{let t=_?.data.find(t=>t.id===e.target.value)??null;Y(t),t&&J(e=>({...e,payerWallet:t.walletAddress,businessName:e.businessName||t.nickname||"",targetNotification:"EMAIL"===e.notificationType?t.email||"":"PHONE"===e.notificationType?t.telephone||"":e.targetNotification}))},required:!0,children:[(0,t.jsx)("option",{value:"",disabled:!0,children:"Select a contact…"}),z?(0,t.jsx)("option",{disabled:!0,children:"Loading contacts…"}):_?.data.map(e=>(0,t.jsx)("option",{value:e.id,children:e.nickname||e.walletAddress},e.id))]}):(0,t.jsx)(N,{id:"pr-payerWallet",name:"payerWallet",value:X.payerWallet,onChange:Z,placeholder:"Payer's Solana wallet address",required:!0})]}),(0,t.jsxs)("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"},children:[(0,t.jsxs)(E,{children:[(0,t.jsx)(v,{children:"Asset *"}),(0,t.jsx)(M,{id:"pr-assetMint",name:"assetMint",value:X.assetMint,onChange:Z,required:!0,children:(0,t.jsx)("optgroup",{label:O?"Devnet Tokens":"Mainnet Tokens",children:Object.entries(I).map(([e,a])=>(0,t.jsx)("option",{value:e,children:a},e))})})]}),(0,t.jsxs)(E,{children:[(0,t.jsx)(v,{children:"Amount *"}),(0,t.jsx)(N,{id:"pr-amount",name:"amount",type:"text",inputMode:"decimal",value:X.amount,onChange:e=>{let t=e.target.value;/^[0-9]*\.?[0-9]*$/.test(t)&&Z(e)},placeholder:"0.00",required:!0})]})]}),(0,t.jsxs)(E,{children:[(0,t.jsx)(v,{children:"Notify Payer Via"}),(0,t.jsxs)(M,{id:"pr-notificationType",name:"notificationType",value:X.notificationType,onChange:Z,children:[(0,t.jsx)("option",{value:"NONE",children:"None (no notification)"}),(0,t.jsx)("option",{value:"EMAIL",children:"Email"}),(0,t.jsx)("option",{value:"PHONE",children:"Phone / SMS"}),(0,t.jsx)("option",{value:"PUSH",children:"Push Notification"})]})]}),et&&(0,t.jsxs)(E,{children:[(0,t.jsx)(v,{children:"EMAIL"===X.notificationType?"Email Address *":"Phone Number *"}),(0,t.jsx)(N,{id:"pr-targetNotification",name:"targetNotification",type:"EMAIL"===X.notificationType?"email":"tel",value:X.targetNotification,onChange:Z,placeholder:"EMAIL"===X.notificationType?"payer@example.com":"+1 555 000 0000",required:!0})]}),(0,t.jsx)(S,{}),(0,t.jsxs)(R,{type:"button",onClick:()=>W(!V),children:[V?(0,t.jsx)(m,{size:16}):(0,t.jsx)(f.ChevronDown,{size:16}),"Advanced Options"]}),V&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(E,{children:[(0,t.jsx)(v,{children:"Business Name (Optional)"}),(0,t.jsx)(N,{id:"pr-businessName",name:"businessName",value:X.businessName,onChange:Z,placeholder:"e.g. Acme Corp"})]}),(0,t.jsxs)(E,{children:[(0,t.jsx)(v,{children:"Reference / Concept (Optional)"}),(0,t.jsx)(N,{id:"pr-reference",name:"reference",value:X.reference,onChange:Z,placeholder:"e.g. Invoice #1042"})]}),(0,t.jsxs)(E,{children:[(0,t.jsx)(v,{children:"Numerical Reference (6 digits, optional)"}),(0,t.jsx)(N,{id:"pr-numericalReference",name:"numericalReference",type:"number",min:"100000",max:"999999",value:X.numericalReference,onChange:Z,placeholder:"e.g. 104200"})]}),(0,t.jsxs)(E,{children:[(0,t.jsx)(v,{children:"Expiration Date (Optional)"}),(0,t.jsx)(N,{id:"pr-expirationDate",name:"expirationDate",type:"date",value:X.expirationDate,onChange:Z,min:new Date().toISOString().split("T")[0]})]})]}),(0,t.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:"12px",width:"100%",marginTop:"16px"},children:[(0,t.jsxs)(k,{$variant:"primary",type:"submit",disabled:U,children:[U?(0,t.jsx)("span",{className:"loader",style:{width:16,height:16}}):(0,t.jsx)(h.Send,{size:16}),U?"Sending…":"Send Request"]}),(0,t.jsx)(k,{$variant:"secondary",type:"button",onClick:n,disabled:U,children:"Cancel"})]})]})]})]})})})}],45033)}]);