(this["webpackJsonpbus-schedule"]=this["webpackJsonpbus-schedule"]||[]).push([[0],{23:function(n,e,t){},41:function(n,e,t){"use strict";t.r(e);var i,c,a,r,s,o,d,u,l,j,b,x,p,h,O,g,f,v,m,w,k,D,y=t(0),S=t.n(y),I=t(7),F=t.n(I),M=(t(23),t(4)),C=t(2),T=t(3),E=t(6),H=t(17),q="#F4F4F4",z=[{label:"\u0412. \u041c\u0430\u044f\u043a\u043e\u0432\u0441\u043a\u043e\u0433\u043e",value:"\u0412. \u041c\u0430\u044f\u043a\u043e\u0432\u0441\u043a\u043e\u0433\u043e"},{label:"\u0441\u043e\u0441\u043d\u043e\u0432\u044b\u0439 \u0431\u043e\u0440",value:"\u0441\u043e\u0441\u043d\u043e\u0432\u044b\u0439 \u0431\u043e\u0440"}],B={1:{"\u0412. \u041c\u0430\u044f\u043a\u043e\u0432\u0441\u043a\u043e\u0433\u043e":["6:37","07:07","07:22","07:42","08:17","09:12","09:42","10:12","10:42","11:22","12:07","12:57","13:32","14:42","15:52","16:52","17:22","17:52","18:22","18:52","19:42","20:22","21:01"],"\u0441\u043e\u0441\u043d\u043e\u0432\u044b\u0439 \u0431\u043e\u0440":[]},2:{"\u0412. \u041c\u0430\u044f\u043a\u043e\u0432\u0441\u043a\u043e\u0433\u043e":["6:37","07:07","07:22","07:42","08:17","09:12","09:42","10:12","10:42","11:22","12:07","12:57","13:32","14:42","15:52","16:52","17:22","17:52","18:22","18:52","19:42","20:22","21:01"],"\u0441\u043e\u0441\u043d\u043e\u0432\u044b\u0439 \u0431\u043e\u0440":[]},3:{"\u0412. \u041c\u0430\u044f\u043a\u043e\u0432\u0441\u043a\u043e\u0433\u043e":["6:37","07:07","07:22","07:42","08:17","09:12","09:42","10:12","10:42","11:22","12:07","12:57","13:32","14:42","15:52","16:52","17:22","17:52","18:22","18:52","19:42","20:22","21:01"],"\u0441\u043e\u0441\u043d\u043e\u0432\u044b\u0439 \u0431\u043e\u0440":[]},4:{"\u0412. \u041c\u0430\u044f\u043a\u043e\u0432\u0441\u043a\u043e\u0433\u043e":["6:37","07:07","07:22","07:42","08:17","09:12","09:42","10:12","10:42","11:22","12:07","12:57","13:32","14:42","15:52","16:52","17:22","17:52","18:22","18:52","19:42","20:22","21:01"],"\u0441\u043e\u0441\u043d\u043e\u0432\u044b\u0439 \u0431\u043e\u0440":[]},5:{"\u0412. \u041c\u0430\u044f\u043a\u043e\u0432\u0441\u043a\u043e\u0433\u043e":["6:37","07:07","07:22","07:42","08:17","09:12","09:42","10:12","10:42","11:22","12:07","12:57","13:32","14:42","15:52","16:52","17:22","17:52","18:22","18:52","19:42","20:22","21:01"],"\u0441\u043e\u0441\u043d\u043e\u0432\u044b\u0439 \u0431\u043e\u0440":[]},6:{"\u0412. \u041c\u0430\u044f\u043a\u043e\u0432\u0441\u043a\u043e\u0433\u043e":["07:07","08:17","09:12","10:12","11:22","12:07","12:57","13:32","14:42","15:52","16:52","17:52","18:52","19:42"],"\u0441\u043e\u0441\u043d\u043e\u0432\u044b\u0439 \u0431\u043e\u0440":[]},0:{"\u0412. \u041c\u0430\u044f\u043a\u043e\u0432\u0441\u043a\u043e\u0433\u043e":["08:17","09:12","10:12","11:22","12:07","12:57","14:42","15:52","16:52","17:52","18:52","19:42"],"\u0441\u043e\u0441\u043d\u043e\u0432\u044b\u0439 \u0431\u043e\u0440":[]}},A=function(n){if(!n)return{hours:null,minutes:null};var e,t=Math.abs(n.getTime()-(new Date).getTime())/1e3/60;return e=t,{hours:Math.trunc(e/60),minutes:Math.round(e%60)}},J=t.p+"static/media/green-heart.4f9f3b02.svg",L=t.p+"static/media/bus-stop.3189510d.svg",N=t.p+"static/media/next-bus.d9e4ed7a.svg",V=t.p+"static/media/upcoming-bus.2b458b3e.svg",_=t.p+"static/media/write.4065a583.svg",G=t(1),K=T.a.div(i||(i=Object(C.a)(["\n  padding: 8px 17px;\n  border-radius: 30px;\n  background-color: ",";\n  color: ",";\n\n  & + & {\n    margin-left: 12px;\n  }\n"])),(function(n){return n.active?"#336CFF":q}),(function(n){return n.active?"white":"black"})),P=T.a.div(c||(c=Object(C.a)(["\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n"]))),Q=function(n){var e=n.stopList,t=n.activeId;return Object(G.jsx)(P,{children:e.map((function(n){return Object(G.jsx)(K,{active:n.id===t,children:n.label},n.id)}))})},R=T.a.div(a||(a=Object(C.a)(["\n  width: ",";\n  height: ",";\n"])),(function(n){return"".concat(n.w,"px")}),(function(n){return"".concat(n.h,"px")})),U=T.a.div(r||(r=Object(C.a)(["\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 14px;\n"]))),W=T.a.h1(s||(s=Object(C.a)(["\n  font-size: 17px;\n  font-weight: normal;\n  margin-left: 8px;\n"]))),X=T.a.div(o||(o=Object(C.a)(["\n  display: flex;\n  align-items: center;\n"]))),Y=function(n){var e=n.text,t=n.imgSrc,i=n.children,c=void 0===i?null:i;return Object(G.jsxs)(U,{children:[Object(G.jsxs)(X,{children:[Object(G.jsx)(R,{w:23,h:23,children:Object(G.jsx)(E.a,{src:t,width:23,height:23,uniquifyIDs:!0})}),Object(G.jsx)(W,{children:"string"===typeof e?e:Object(G.jsx)(e,{})})]}),c&&Object(G.jsx)(X,{children:c})]})},Z=t.p+"static/media/telegram-logo.b27302a3.svg",$=T.a.button(d||(d=Object(C.a)(["\n  display: flex;\n  align-items: center;\n  padding: 8px;\n  color: #26a4e3;\n  border: 1px solid #26a4e3;\n  background-color: white;\n  border-radius: 6px;\n"]))),nn=T.a.p(u||(u=Object(C.a)(["\n  color: #26a4e3;\n  margin: 0 0 0 10px;\n"]))),en=function(){return Object(G.jsxs)($,{children:[Object(G.jsx)(R,{w:20,h:20,children:Object(G.jsx)(E.a,{src:Z,width:20,height:20,title:"Menu",uniquifyIDs:!0})}),Object(G.jsx)(nn,{children:"\u041d\u0430\u043f\u0438\u0441\u0430\u0442\u044c \u0432 \u0442\u0435\u043b\u0435\u0433\u0440\u0430\u043c"})]})},tn=T.a.div(l||(l=Object(C.a)(["\n  padding: 15px;\n"]))),cn=T.a.div(j||(j=Object(C.a)(["\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n\n  padding: 15px 17px;\n  background-color: ",";\n  border-radius: 6px;\n"])),q),an=T.a.div(b||(b=Object(C.a)([""]))),rn=T.a.div(x||(x=Object(C.a)(["\n  font-size: 18px;\n  margin-left: 19px;\n"]))),sn=T.a.p(p||(p=Object(C.a)([""]))),on=T.a.span(h||(h=Object(C.a)(["\n  font-weight: bold;\n"]))),dn=T.a.div(O||(O=Object(C.a)(["\n  padding: 22px 26px;\n  background-color: ",";\n  border-radius: 6px;\n"])),q),un=T.a.div(g||(g=Object(C.a)(["\n  & + & {\n    margin-top: 8px;\n  }\n"]))),ln=T.a.button(f||(f=Object(C.a)(["\n  width: 100%;\n  border: none;\n  border-radius: 6px;\n  background-color: ",";\n  color: ",";\n  padding: 12px 17px;\n\n  & + & {\n    margin-left: 10px;\n  }\n"])),(function(n){return n.active?"#336CFF":q}),(function(n){return n.active?"white":"black"})),jn=T.a.button(v||(v=Object(C.a)(["\n  width: 100%;\n  border: none;\n  border-radius: 6px;\n  background-color: ",";\n  color: white;\n  padding: 12px 17px;\n\n  margin-top: 8px;\n"])),(function(n){return"add"===n.status?"#6BD756":"#D75656"})),bn=T.a.div(m||(m=Object(C.a)(["\n  display: flex;\n  align-items: center;\n"]))),xn=T.a.div(w||(w=Object(C.a)(["\n  & + & {\n    margin-top: 44px;\n  }\n"]))),pn=T.a.p(k||(k=Object(C.a)(["\n  margin: 0;\n  color: #b2b2b2;\n  font-size: 12px;\n  a {\n    color: inherit;\n  }\n\n  & + & {\n    margin-top: 12px;\n  }\n"]))),hn=T.a.div(D||(D=Object(C.a)(["\n  padding-left: 31px;\n"]))),On=(new Date).getDay();var gn=function(){var n=S.a.useState("\u0412. \u041c\u0430\u044f\u043a\u043e\u0432\u0441\u043a\u043e\u0433\u043e"),e=Object(M.a)(n,2),t=e[0],i=e[1],c=S.a.useState({hours:0,minutes:0}),a=Object(M.a)(c,2),r=a[0],s=a[1],o=S.a.useState([]),d=Object(M.a)(o,2),u=d[0],l=d[1],j=S.a.useState(null),b=Object(M.a)(j,2),x=b[0],p=b[1],h=S.a.useState(0),O=Object(M.a)(h,2),g=O[0],f=O[1],v=S.a.useState("in"),m=Object(M.a)(v,2),w=m[0],k=m[1],D=S.a.useState([]),y=Object(M.a)(D,2);return y[0],y[1],S.a.useEffect((function(){var n=setInterval((function(){return f(Date.now())}),1e3);return function(){clearInterval(n)}}),[g]),S.a.useEffect((function(){var n=function(n){for(var e=null,t=0;t<n.length;t++){var i=n[t].split(":").map((function(n){return parseInt(n,10)})),c=(new Date).setHours(i[0],i[1]);c-(new Date).getTime()>0&&(e?e.getTime()-c>0&&(e=new Date(c)):e=new Date(c))}return e}(B[On][t]);(null===n||void 0===n?void 0:n.getMinutes())!==(null===x||void 0===x?void 0:x.getMinutes())&&(null===n||void 0===n?void 0:n.getHours())!==(null===x||void 0===x?void 0:x.getHours())&&(l(function(n){for(var e=[],t=0;t<n.length;t++){var i=n[t].split(":").map((function(n){return parseInt(n,10)}));(new Date).setHours(i[0],i[1])-(new Date).getTime()>0&&e.push(n[t])}return e}(B[On][t])),p(n))}),[g,x,t]),S.a.useEffect((function(){var n=A(x);s(n)}),[g,x]),Object(G.jsxs)(tn,{children:[Object(G.jsx)(xn,{children:Object(G.jsxs)(bn,{children:[Object(G.jsx)(ln,{active:"in"===w,onClick:function(){return k("in")},children:"\u0432 \u0441\u0442\u043e\u0440\u043e\u043d\u0443 \u043f\u0430\u0440\u043a\u0430"}),Object(G.jsx)(ln,{active:"out"===w,onClick:function(){return k("out")},children:"\u0438\u0437 \u043f\u0430\u0440\u043a\u0430"})]})}),Object(G.jsxs)(xn,{children:[Object(G.jsx)(Y,{text:"\u041c\u043e\u0438 \u043e\u0441\u0442\u0430\u043d\u043e\u0432\u043a\u0438",imgSrc:J}),Object(G.jsx)(Q,{stopList:[{id:"d",label:"\u0412. \u043c\u0430\u044f\u043a"},{id:"v",label:"\u0422\u0413\u0423"}],activeId:"d"})]}),Object(G.jsxs)(xn,{children:[Object(G.jsx)(Y,{text:"\u041e\u0441\u0442\u0430\u043d\u043e\u0432\u043a\u0430",imgSrc:L,children:Object(G.jsx)(H.a,{options:z,onChange:function(n){return i(null===n||void 0===n?void 0:n.value)},defaultValue:z[0]})}),Object(G.jsxs)(cn,{children:[Object(G.jsx)(R,{w:39,h:39,children:Object(G.jsx)(E.a,{src:N,width:39,height:39,uniquifyIDs:!0})}),Object(G.jsx)(rn,{children:null===r.hours&&null===r.minutes?Object(G.jsxs)(sn,{children:["\u0410\u0432\u0442\u043e\u0431\u0443\u0441 \u043d\u0430 \u043e\u0441\u0442\u0430\u043d\u043e\u0432\u043a\u0443 ",Object(G.jsx)("b",{children:t})," \u0441\u0435\u0433\u043e\u0434\u043d\u044f \u043d\u0435 \u043f\u0440\u0438\u0435\u0434\u0435\u0442"]}):Object(G.jsxs)(sn,{children:["\u0421\u043b\u0435\u0434\u0443\u044e\u0449\u0438\u0439 \u0430\u0432\u0442\u043e\u0431\u0443\u0441 \u043f\u0440\u0438\u0435\u0434\u0435\u0442 \u0447\u0435\u0440\u0435\u0437"," ",Object(G.jsxs)(on,{children:[0===r.hours?"":"".concat(r.hours,"\u0447 "),r.minutes,"\u043c"]})]})})]})]}),Object(G.jsxs)(xn,{children:[Object(G.jsx)(Y,{text:"\u0415\u0449\u0451 \u0430\u0432\u0442\u043e\u0431\u0443\u0441\u044b \u043d\u0430 \u0441\u0435\u0433\u043e\u0434\u043d\u044f",imgSrc:V}),Object(G.jsx)(dn,{children:0===u.length?"\u0410\u0432\u0442\u043e\u0431\u0443\u0441\u043e\u0432 \u043d\u0430 \u0441\u0435\u0433\u043e\u0434\u043d\u044f \u043d\u0435\u0442":u.map((function(n){return Object(G.jsx)(un,{children:n},n)}))}),Object(G.jsx)(jn,{status:"add",onClick:function(){},children:"\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043e\u0441\u0442\u0430\u043d\u043e\u0432\u043a\u0443 \u0432 \u0438\u0437\u0431\u0440\u0430\u043d\u043d\u043e\u0435"})]}),Object(G.jsxs)(xn,{children:[Object(G.jsx)(Y,{text:function(){return Object(G.jsxs)(G.Fragment,{children:["\u0423\u0432\u0438\u0434\u0435\u043b\u0438 \u043e\u0448\u0438\u0431\u043a\u0443?",Object(G.jsx)("br",{}),"\u0415\u0441\u0442\u044c \u043f\u0440\u0435\u0434\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u043f\u043e \u0443\u043b\u0443\u0447\u0448\u0435\u043d\u0438\u044e?"]})},imgSrc:_}),Object(G.jsx)(hn,{children:Object(G.jsx)(en,{})})]}),Object(G.jsx)(xn,{children:Object(G.jsxs)(an,{children:[Object(G.jsxs)(pn,{children:["\u0420\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u0432\u0437\u044f\u0442\u043e \u0441 \u0441\u0430\u0439\u0442\u0430"," ",Object(G.jsx)("a",{href:"http://www.tomskavtotrans.ru/60",target:"_blank",rel:"noreferrer",children:"tomskavtotrans.ru"})]}),Object(G.jsx)(pn,{children:"\xa9 Andrew Boev"})]})})]})};var fn=function(){return Object(G.jsx)("div",{className:"App",children:Object(G.jsx)(gn,{})})};F.a.render(Object(G.jsx)(S.a.StrictMode,{children:Object(G.jsx)(fn,{})}),document.getElementById("root"))}},[[41,1,2]]]);
//# sourceMappingURL=main.68867a26.chunk.js.map