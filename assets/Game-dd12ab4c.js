import{j as u,a as t,F as he,l as me,b as ge,L as pe,A as k,B as xe,G as Se,c as be,W as we}from"./index-292f19ee.js";import{s as d,S as ne,u as X,k as Te,r as a,L as ye}from"./vendor-40dc9cc5.js";import{G as S,a as Ie,T as I,M as L,H as ve,b as J,c as K,d as Me,e as Ce}from"./index-511e703d.js";const Q=4,Ee=3,x=4,Y=0,Z=0,ee=1,te=!1,se=500,Ne="/assets/game-star-69857334.svg",Ge="/assets/game-new-high-score-8104d64c.svg",$e=d.div`
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
`,ke=d.div`
	z-index: 4;
`,Le=d.span`
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
`,Re=d.div`
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
`,oe=({score:e,plusNumber:s,isBig:i,isNewHighScore:r=!1})=>{const n=i?85:45;return u($e,{isBig:!!i,children:[t(ke,{children:e}),t(Le,{animate:s.length!==0,children:s}),t(Re,{isBig:!!i,children:t(ne,{src:r?Ge:Ne,width:n,height:n,uniquifyIDs:!0})})]})},Be="/assets/game-record-d7c6bb6a.svg",ae=d.div`
	display: flex;
	justify-content: ${e=>e.isColumn?"center":"space-between"};
	flex-direction: ${e=>e.isColumn?"column":"row"};
	align-items: center;
	height: 100%;
`,D=d.div`
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
`,W=d.div`
	margin-bottom: 2px;
	font-size: 13px;
	font-weight: 300;
`,z=d.div`
	z-index: 4;
	font-size: 16px;
	font-weight: 900;
`,He=d.div`
	display: flex;
	justify-content:center;
`,De=d.div`
	display: flex;
	margin-top: 40px;
`,We=({score:e,plusNumber:s,level:i,isNewHighScore:r,bestScore:n})=>u(ae,{isColumn:!0,children:[t(oe,{score:e,plusNumber:s,isBig:!0,isNewHighScore:r}),u(De,{children:[u(D,{style:{marginRight:"8px"},children:[t(W,{children:"уровень"}),t(z,{children:i})]}),t(ce,{score:n})]})]}),ce=({score:e})=>e==null?t(he,{}):u(D,{children:[t(W,{children:"рекорд"}),u(He,{children:[t(z,{style:{marginRight:"2px"},children:e}),t(ne,{src:Be,width:19,height:19,uniquifyIDs:!0})]})]}),H=e=>{const{score:s,plusNumber:i,level:r,isGameOver:n,bestScore:g,isNewHighScore:b}=e;return n?t(We,{...e}):u(ae,{isColumn:!!n,children:[t(ce,{score:g}),t(oe,{score:s,plusNumber:i,isBig:n,isNewHighScore:!!b}),u(D,{style:{marginLeft:"2px"},children:[t(W,{children:"уровень"}),t(z,{children:r})]})]})},ze=d.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;

	/* height: ${e=>e.fullHeight?"100%":"unset"}; */
`,Oe=({score:e,level:s,plusNumber:i="",title:r=null,isGameOver:n=!1,bestScore:g})=>{const b=X(me),f=X(ge);return u(ze,{fullHeight:n,children:[f?t(S,{children:t(Ie,{to:"/",lowLight:!n,children:t(pe,{busStop:"В. Маяковского",left:b})})}):null,u(S,{children:[r&&n?t(S,{children:t(I,{children:r})}):null,t(S,{children:t(H,{plusNumber:i,score:e,bestScore:g,level:s,isGameOver:n})})]}),r&&!n?t(S,{children:t(I,{children:r})}):null]})};function _e(e){let s=e.length,i;for(;s!==0;)i=Math.floor(Math.random()*s),s--,[e[s],e[i]]=[e[i],e[s]];return e}const ie=(e=0,s=23)=>{let i=Math.ceil(e),r=Math.floor(s);return Math.floor(Math.random()*(r-i+1))+i},re=()=>{let e=ie(0,59);return e<10&&(e=`0${e}`),`${ie(6,23)}:${e}`},R=e=>{let s=[],i=re(),r=0;for(let n=0;n<e;n++)Math.floor(n/2)===r?s.push({id:n,text:i,selected:!1,destroyed:!1}):(r=Math.floor(n/2),i=re(),s.push({id:n,text:i,selected:!1,destroyed:!1}));return _e(s)},B=(e,s=.25)=>{const i=+new Date(e+s*6e4)-+new Date;let r={minutes:0,seconds:0};return r={minutes:Math.floor(i/1e3/60%60),seconds:Math.floor(i/1e3%60)},r},Ae=d.div`
	height: 5px;
	width: 100%;
	background: rgba(0, 0, 0, 0.19);
	border-radius: 50;
	margin: 50;

	position: absolute;
	top: 0;
	left: 0;
`,je=d.div`
	height: 100%;
	width: 0;
	background-color: ${e=>e.bgcolor};
	border-radius: inherit;
	text-align: right;

	transition: width 0.3s ease-in-out;
`;d.span`
	padding: 5;
	color: white;
	font-weight: bold;
`;const Pe=({bgcolor:e,completed:s})=>t(Ae,{children:t(je,{bgcolor:e,style:{width:`${s}%`}})}),Ve=e=>e>=14?x*6:e>=12?x*5:e>=9?x*4:e>=5?x*3:e>=2?x*2:(e>=1,x),Fe=localStorage.getItem("devMode")==="1",Je=()=>{const[e]=Te(),[s,i]=a.useState(R(Q)),[r,n]=a.useState(Y),[g,b]=a.useState(Z),[f,O]=a.useState(ee),[h,v]=a.useState(te),[M,le]=a.useState(new Date().getTime()),[c,_]=a.useState(B(M)),[T,C]=a.useState(!0),[A,E]=a.useState(!0),[N,j]=a.useState(!1),[y,P]=a.useState(!1),[w,de]=a.useState(localStorage.getItem("score")?Number(localStorage.getItem("score")):0),[G,V]=a.useState(!1);a.useEffect(()=>{G&&h&&(localStorage.setItem("score",r.toString()),de(r))},[G,h,r]),a.useEffect(()=>{r>w&&V(!0),!h&&g>Ee&&v(!0)},[g,h,r,w]),a.useEffect(()=>{!h&&c.seconds===0&&v(!0)},[c,h]),a.useEffect(()=>{if(c.seconds===0)return;const o=setTimeout(()=>{_(B(M,f*.11))},10);return()=>clearTimeout(o)},[c,f,M]);const F=()=>{v(te),_(B(new Date().getTime(),.15)),i(R(Q)),n(Y),O(ee),b(Z),le(new Date().getTime()),C(!0),E(!0),P(!1),V(!1),k("game.newGame")},ue=o=>{o.destroyed||o.selected||i(p=>{const m=p.find(l=>l.selected),$=m?p.find(l=>m.text===l.text&&m.id!==l.id&&o.id===l.id):void 0,q=m&&!$,U=m&&$;return q&&(b(l=>l+1),E(!0)),U&&n(l=>l+1),p.map(l=>q?{...l,selected:!1}:U&&(l.id===m.id||$.id===l.id)?{...l,selected:!1,destroyed:!0}:l.id===o.id?{...l,selected:!0}:l)})};a.useEffect(()=>{let o=null;return T&&(o=setTimeout(()=>{C(!1),!y&&P(!0)},se)),()=>clearTimeout(o)},[T,y]),a.useEffect(()=>{let o=null;return A&&(o=setTimeout(()=>{E(!1)},se)),()=>clearTimeout(o)},[A]),a.useEffect(()=>{let o=null;return N&&(o=setTimeout(()=>{j(!1)},500)),()=>clearTimeout(o)},[N]),a.useEffect(()=>{if(s.every(p=>p.destroyed===!0)){O(m=>m+1);const p=Ve(f);i(R(p)),C(!0),k("game.newLevel")}},[s,f]),a.useEffect(()=>{j(!0)},[r]);const fe=()=>c.seconds===0||c.seconds===1?100:c.seconds===2?95:c.seconds===3?80:c.seconds===4?70:c.seconds===5?60:c.seconds===6?50:c.seconds===7?40:c.seconds===8?30:c.seconds===9?20:c.seconds===10?10:c.seconds*60/100;return G&&h?t(L,{isWin:!1,bg:ve,children:u(J,{children:[t(S,{children:t(I,{children:"Новый рекорд"})}),t(H,{plusNumber:"",score:w,level:f,isGameOver:!0,isNewHighScore:!0}),t(K,{onClick:F,children:"Играть еще"})]})}):h&&!Fe?t(L,{isWin:!1,bg:Me,children:u(J,{children:[t(xe,{children:t(ye,{to:`/?${e.toString()}`,onClick:()=>k("game.backToSchedule"),children:"Вернуться к расписанию"})}),t(S,{children:t(I,{children:"Продолжим?"})}),t(H,{plusNumber:"",score:r,bestScore:w,level:f,isGameOver:h}),t(K,{onClick:F,children:"Играть еще"})]})}):t(L,{isWin:y?T:!1,children:u(Ce,{children:[t(Pe,{completed:fe(),bgcolor:"#F48400"}),t(Oe,{plusNumber:N&&y?"+1":"",score:r,miss:g,level:f,timeLeft:c,bestScore:w}),t(Se,{animate:T,children:s.map(o=>t(be,{onClick:()=>ue(o),$selected:o.selected,$destroyed:o.destroyed,children:o.text},o.id))}),t(we,{children:"Выбирай одинаковые блоки пока все не закончатся"})]})})};export{Je as default};
