import{s as l,h as d,j as t,S as ne,F as he,u as X,m as me,r as u,L as ge}from"./vendor.fa1a4161.js";import{l as pe,b as xe,L as Se,A as D,B as be,G as we,a as Ee,W as Te}from"./index.aad76f67.js";import{G as S,a as Ce,T as C,M as L,H as ye,b as J,c as K,d as Ie,e as ve}from"./index.e48b268e.js";const Q=4,Me=3,x=4,Y=0,Z=0,ee=1,te=!1,se=500,Ne="/assets/game-star.69857334.svg",Ge="/assets/game-new-high-score.8104d64c.svg",Be=l.div`
	position: relative;

	display: flex;
	align-items: center;
	justify-content: center;

	color: white;
	width: ${e=>e.isBig?"110px":"60px"};
	height: ${e=>e.isBig?"110px":"60px"};

	border-radius: 50%;
	background: rgba(0, 0, 0, 0.4);

	font-weight: 900;
	font-size: ${e=>e.isBig?"46px":"26px"};
	line-height: 26px;
	z-index: 0;

	&::after {
		content: '';
		position: absolute;
		width: ${e=>e.isBig?"140px":"75px"};
		height: ${e=>e.isBig?"140px":"75px"};

		border-radius: 50%;
		background: rgba(0, 0, 0, 0.2);
		z-index: 0;
	}
`,De=l.div`
	z-index: 4;
`,Le=l.span`
	position: absolute;
	bottom: -20px;
	right: -20px;
	font-weight: 700;
	font-size: 22px;
	line-height: 27px;
	color: rgba(255, 255, 255, 0.8);

	animation-duration: 0.5s;
	animation-name: ${e=>e.animate?"fadeup":"inherit"};

	@keyframes fadeup {
		0% {
			color: rgba(255, 255, 255, 0);
		}

		50% {
			color: rgba(255, 255, 255, 0.8);
		}

		100% {
			color: rgba(255, 255, 255, 0);
		}
	}
`,ke=l.div`
	position: absolute;
	top: 10px;
	right: ${e=>e.isBig?"-55px":"-31px"};
	z-index: 4;

	/* animation: ${e=>e.isBig?"scale infinite 2s":"unset"};

	@keyframes scale {
		0% {
			transform: scale(1.1);
		}

		50% {
			transform: scale(1);
		}

		100% {
			transform: scale(1.1);
		}
	} */
`,oe=({score:e,plusNumber:s,isBig:r,isNewHighScore:i=!1})=>{const n=r?85:45;return d(Be,{isBig:!!r,children:[t(De,{children:e}),t(Le,{animate:s.length!==0,children:s}),t(ke,{isBig:!!r,children:t(ne,{src:i?Ge:Ne,width:n,height:n,uniquifyIDs:!0})})]})},Ae="/assets/game-record.d7c6bb6a.svg",ue=l.div`
	display: flex;
	justify-content: ${e=>e.isColumn?"center":"space-between"};
	flex-direction: ${e=>e.isColumn?"column":"row"};
	align-items: center;
	height: 100%;
`,$=l.div`
	position: relative;

	display: flex;
	flex-direction: column;
	text-align: center;

	background: rgba(0, 0, 0, 0.22);
	border-radius: 3px;
	padding: 4px;
	color: white;

	height: 47px;

	max-width: 58px;

	&::after {
		content: '';
		position: absolute;
		top: 3px;
		left: 0;
		width: 85%;
		height: 1px;
		margin: 0 6px;

		background: rgba(255, 255, 255, 0.14);
		border-radius: 19px;
	}
`,H=l.div`
	margin-bottom: 2px;
	font-size: 13px;
	font-weight: 300;
`,W=l.div`
	z-index: 4;
	font-size: 16px;
	font-weight: 900;
`,Re=l.div`
	display: flex;
	justify-content:center;
`,$e=l.div`
	display: flex;
	margin-top: 40px;
`,He=({score:e,plusNumber:s,level:r,isNewHighScore:i,bestScore:n})=>d(ue,{isColumn:!0,children:[t(oe,{score:e,plusNumber:s,isBig:!0,isNewHighScore:i}),d($e,{children:[d($,{style:{marginRight:"8px"},children:[t(H,{children:"\u0443\u0440\u043E\u0432\u0435\u043D\u044C"}),t(W,{children:r})]}),t(ae,{score:n})]})]}),ae=({score:e})=>e==null?t(he,{}):d($,{children:[t(H,{children:"\u0440\u0435\u043A\u043E\u0440\u0434"}),d(Re,{children:[t(W,{style:{marginRight:"2px"},children:e}),t(ne,{src:Ae,width:19,height:19,uniquifyIDs:!0})]})]}),R=e=>{const{score:s,plusNumber:r,level:i,isGameOver:n,bestScore:g,isNewHighScore:b}=e;return n?t(He,{...e}):d(ue,{isColumn:!!n,children:[t(ae,{score:g}),t(oe,{score:s,plusNumber:r,isBig:n,isNewHighScore:!!b}),d($,{style:{marginLeft:"2px"},children:[t(H,{children:"\u0443\u0440\u043E\u0432\u0435\u043D\u044C"}),t(W,{children:i})]})]})},We=l.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;

	/* height: ${e=>e.fullHeight?"100%":"unset"}; */
`,ze=({score:e,level:s,plusNumber:r="",title:i=null,isGameOver:n=!1,bestScore:g})=>{const b=X(pe),f=X(xe);return d(We,{fullHeight:n,children:[f?t(S,{children:t(Ce,{to:"/",lowLight:!n,children:t(Se,{busStop:"\u0412. \u041C\u0430\u044F\u043A\u043E\u0432\u0441\u043A\u043E\u0433\u043E",left:b})})}):null,d(S,{children:[i&&n?t(S,{children:t(C,{children:i})}):null,t(S,{children:t(R,{plusNumber:r,score:e,bestScore:g,level:s,isGameOver:n})})]}),i&&!n?t(S,{children:t(C,{children:i})}):null]})};function Fe(e){let s=e.length,r;for(;s!==0;)r=Math.floor(Math.random()*s),s--,[e[s],e[r]]=[e[r],e[s]];return e}const re=(e=0,s=23)=>{let r=Math.ceil(e),i=Math.floor(s);return Math.floor(Math.random()*(i-r+1))+r},ie=()=>{let e=re(0,59);return e<10&&(e=`0${e}`),`${re(6,23)}:${e}`},k=e=>{let s=[],r=ie(),i=0;for(let n=0;n<e;n++)Math.floor(n/2)===i?s.push({id:n,text:r,selected:!1,destroyed:!1}):(i=Math.floor(n/2),r=ie(),s.push({id:n,text:r,selected:!1,destroyed:!1}));return Fe(s)},A=(e,s=.25)=>{const r=+new Date(e+s*6e4)-+new Date;let i={minutes:0,seconds:0};return i={minutes:Math.floor(r/1e3/60%60),seconds:Math.floor(r/1e3%60)},i},Oe=l.div`
	height: 5px;
	width: 100%;
	background: rgba(0, 0, 0, 0.19);
	border-radius: 50;
	margin: 50;

	position: absolute;
	top: 0;
	left: 0;
`,_e=l.div`
	height: 100%;
	width: 0;
	background-color: ${e=>e.bgcolor};
	border-radius: inherit;
	text-align: right;

	transition: width 0.3s ease-in-out;
`;l.span`
	padding: 5;
	color: white;
	font-weight: bold;
`;const je=({bgcolor:e,completed:s})=>t(Oe,{children:t(_e,{bgcolor:e,style:{width:`${s}%`}})}),Pe=e=>e>=14?x*6:e>=12?x*5:e>=9?x*4:e>=5?x*3:e>=2?x*2:(e>=1,x),Ve=localStorage.getItem("devMode")==="1",Je=()=>{const[e]=me(),[s,r]=u.exports.useState(k(Q)),[i,n]=u.exports.useState(Y),[g,b]=u.exports.useState(Z),[f,z]=u.exports.useState(ee),[h,y]=u.exports.useState(te),[I,ce]=u.exports.useState(new Date().getTime()),[a,F]=u.exports.useState(A(I)),[E,v]=u.exports.useState(!0),[O,M]=u.exports.useState(!0),[N,_]=u.exports.useState(!1),[T,j]=u.exports.useState(!1),[w,le]=u.exports.useState(localStorage.getItem("score")?Number(localStorage.getItem("score")):0),[G,P]=u.exports.useState(!1);u.exports.useEffect(()=>{G&&h&&(localStorage.setItem("score",i.toString()),le(i))},[G,h,i]),u.exports.useEffect(()=>{i>w&&P(!0),!h&&g>Me&&y(!0)},[g,h,i,w]),u.exports.useEffect(()=>{!h&&a.seconds===0&&y(!0)},[a,h]),u.exports.useEffect(()=>{if(a.seconds===0)return;const o=setTimeout(()=>{F(A(I,f*.11))},10);return()=>clearTimeout(o)},[a,f,I]);const V=()=>{y(te),F(A(new Date().getTime(),.15)),r(k(Q)),n(Y),z(ee),b(Z),ce(new Date().getTime()),v(!0),M(!0),j(!1),P(!1),D("game.newGame")},de=o=>{o.destroyed||o.selected||r(p=>{const m=p.find(c=>c.selected),B=m?p.find(c=>m.text===c.text&&m.id!==c.id&&o.id===c.id):void 0,q=m&&!B,U=m&&B;return q&&(b(c=>c+1),M(!0)),U&&n(c=>c+1),p.map(c=>q?{...c,selected:!1}:U&&(c.id===m.id||B.id===c.id)?{...c,selected:!1,destroyed:!0}:c.id===o.id?{...c,selected:!0}:c)})};u.exports.useEffect(()=>{let o=null;return E&&(o=setTimeout(()=>{v(!1),!T&&j(!0)},se)),()=>clearTimeout(o)},[E,T]),u.exports.useEffect(()=>{let o=null;return O&&(o=setTimeout(()=>{M(!1)},se)),()=>clearTimeout(o)},[O]),u.exports.useEffect(()=>{let o=null;return N&&(o=setTimeout(()=>{_(!1)},500)),()=>clearTimeout(o)},[N]),u.exports.useEffect(()=>{if(s.every(p=>p.destroyed===!0)){z(m=>m+1);const p=Pe(f);r(k(p)),v(!0),D("game.newLevel")}},[s,f]),u.exports.useEffect(()=>{_(!0)},[i]);const fe=()=>a.seconds===0||a.seconds===1?100:a.seconds===2?95:a.seconds===3?80:a.seconds===4?70:a.seconds===5?60:a.seconds===6?50:a.seconds===7?40:a.seconds===8?30:a.seconds===9?20:a.seconds===10?10:a.seconds*60/100;return G&&h?t(L,{isWin:!1,bg:ye,children:d(J,{children:[t(S,{children:t(C,{children:"\u041D\u043E\u0432\u044B\u0439 \u0440\u0435\u043A\u043E\u0440\u0434"})}),t(R,{plusNumber:"",score:w,level:f,isGameOver:!0,isNewHighScore:!0}),t(K,{onClick:V,children:"\u0418\u0433\u0440\u0430\u0442\u044C \u0435\u0449\u0435"})]})}):h&&!Ve?t(L,{isWin:!1,bg:Ie,children:d(J,{children:[t(be,{children:t(ge,{to:`/?${e.toString()}`,onClick:()=>D("game.backToSchedule"),children:"\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u044E"})}),t(S,{children:t(C,{children:"\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u043C?"})}),t(R,{plusNumber:"",score:i,bestScore:w,level:f,isGameOver:h}),t(K,{onClick:V,children:"\u0418\u0433\u0440\u0430\u0442\u044C \u0435\u0449\u0435"})]})}):t(L,{isWin:T?E:!1,children:d(ve,{children:[t(je,{completed:fe(),bgcolor:"#F48400"}),t(ze,{plusNumber:N&&T?"+1":"",score:i,miss:g,level:f,timeLeft:a,bestScore:w}),t(we,{animate:E,children:s.map(o=>t(Ee,{onClick:()=>de(o),selected:o.selected,destroyed:o.destroyed,children:o.text},o.id))}),t(Te,{children:"\u0412\u044B\u0431\u0438\u0440\u0430\u0439 \u043E\u0434\u0438\u043D\u0430\u043A\u043E\u0432\u044B\u0435 \u0431\u043B\u043E\u043A\u0438 \u043F\u043E\u043A\u0430 \u0432\u0441\u0435 \u043D\u0435 \u0437\u0430\u043A\u043E\u043D\u0447\u0430\u0442\u0441\u044F"})]})})};export{Je as default};
