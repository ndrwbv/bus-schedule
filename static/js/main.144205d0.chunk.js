(this["webpackJsonpbus-schedule"]=this["webpackJsonpbus-schedule"]||[]).push([[0],{17:function(e,t,n){},21:function(e,t,n){"use strict";n.r(t);var a,r,s,u,c,i,o,l=n(0),d=n.n(l),j=n(9),b=n.n(j),f=(n(17),n(4)),h=n(2),v=n(3),O={monday:{"\u043c\u0430\u044f\u043a\u043e\u0432\u0441\u043a\u043e\u0433\u043e":["6:37","07:07","07:22","07:42","08:17","09:12","09:42","10:12","10:42","11:22","12:07","12:57","13:32","14:42","15:52","16:52","17:22","17:52","18:22","18:52","19:42","20:22","21:01"],"\u0441\u043e\u0441\u043d\u043e\u0432\u044b\u0439 \u0431\u043e\u0440":[]},tuesday:{"\u043c\u0430\u044f\u043a\u043e\u0432\u0441\u043a\u043e\u0433\u043e":["6:37","07:07","07:22","07:42","08:17","09:12","09:42","10:12","10:42","11:22","12:07","12:57","13:32","14:42","15:52","16:52","17:22","17:52","18:22","18:52","19:42","20:22","21:01"],"\u0441\u043e\u0441\u043d\u043e\u0432\u044b\u0439 \u0431\u043e\u0440":[]},wednesday:{"\u043c\u0430\u044f\u043a\u043e\u0432\u0441\u043a\u043e\u0433\u043e":["6:37","07:07","07:22","07:42","08:17","09:12","09:42","10:12","10:42","11:22","12:07","12:57","13:32","14:42","15:52","16:52","17:22","17:52","18:22","18:52","19:42","20:22","21:01"],"\u0441\u043e\u0441\u043d\u043e\u0432\u044b\u0439 \u0431\u043e\u0440":[]},thursday:{"\u043c\u0430\u044f\u043a\u043e\u0432\u0441\u043a\u043e\u0433\u043e":["6:37","07:07","07:22","07:42","08:17","09:12","09:42","10:12","10:42","11:22","12:07","12:57","13:32","14:42","15:52","16:52","17:22","17:52","18:22","18:52","19:42","20:22","21:01"],"\u0441\u043e\u0441\u043d\u043e\u0432\u044b\u0439 \u0431\u043e\u0440":[]},friday:{"\u043c\u0430\u044f\u043a\u043e\u0432\u0441\u043a\u043e\u0433\u043e":["6:37","07:07","07:22","07:42","08:17","09:12","09:42","10:12","10:42","11:22","12:07","12:57","13:32","14:42","15:52","16:52","17:22","17:52","18:22","18:52","19:42","20:22","21:01"],"\u0441\u043e\u0441\u043d\u043e\u0432\u044b\u0439 \u0431\u043e\u0440":[]},saturday:{"\u043c\u0430\u044f\u043a\u043e\u0432\u0441\u043a\u043e\u0433\u043e":["07:07","08:17","09:12","10:12","11:22","12:07","12:57","13:32","14:42","15:52","16:52","17:52","18:52","19:42"],"\u0441\u043e\u0441\u043d\u043e\u0432\u044b\u0439 \u0431\u043e\u0440":[]},sunday:{"\u043c\u0430\u044f\u043a\u043e\u0432\u0441\u043a\u043e\u0433\u043e":["08:17","09:12","10:12","11:22","12:07","12:57","14:42","15:52","16:52","17:52","18:52","19:42"],"\u0441\u043e\u0441\u043d\u043e\u0432\u044b\u0439 \u0431\u043e\u0440":[]}},p=function(e){if(!e)return{hours:null,minutes:null};var t,n=Math.abs(e.getTime()-(new Date).getTime())/1e3/60;return t=n,{hours:Math.trunc(t/60),minutes:Math.round(t%60)}},g=n(1),m=v.a.div(a||(a=Object(h.a)(["\n  padding: 20px;\n  background-color: #0000ff21;\n"]))),x=v.a.div(r||(r=Object(h.a)(["\n  padding: 20px;\n  background-color: #ffc80021;\n"]))),w=v.a.div(s||(s=Object(h.a)(["\n  font-size: 25px;\n  font-weight: normal;\n"]))),y=v.a.p(u||(u=Object(h.a)([""]))),D=v.a.span(c||(c=Object(h.a)(["\n  font-weight: bold;\n  margin-left: 8px;\n"]))),k=v.a.div(i||(i=Object(h.a)(["\n  padding: 20px;\n  background-color: #00ff5a21;\n"]))),M=v.a.p(o||(o=Object(h.a)([""])));var S=function(){var e=d.a.useState("\u043c\u0430\u044f\u043a\u043e\u0432\u0441\u043a\u043e\u0433\u043e"),t=Object(f.a)(e,1)[0],n=d.a.useState({hours:0,minutes:0}),a=Object(f.a)(n,2),r=a[0],s=a[1],u=d.a.useState([]),c=Object(f.a)(u,2),i=c[0],o=c[1],l=d.a.useState(null),j=Object(f.a)(l,2),b=j[0],h=j[1],v=d.a.useState(0),S=Object(f.a)(v,2),I=S[0],T=S[1];return d.a.useEffect((function(){console.log("in interval");var e=setInterval((function(){return T(Date.now())}),1e3);return function(){clearInterval(e)}}),[I]),d.a.useEffect((function(){var e=function(e){for(var t=null,n=0;n<e.length;n++){var a=e[n].split(":").map((function(e){return parseInt(e,10)})),r=(new Date).setHours(a[0],a[1]);r-(new Date).getTime()>0&&(t?t.getTime()-r>0&&(t=new Date(r)):t=new Date(r))}return t}(O.saturday[t]);console.log("date",new Date,e,O.saturday[t]),(null===e||void 0===e?void 0:e.getMinutes())!==(null===b||void 0===b?void 0:b.getMinutes())&&(null===e||void 0===e?void 0:e.getHours())!==(null===b||void 0===b?void 0:b.getHours())&&(o(function(e){for(var t=[],n=0;n<e.length;n++){var a=e[n].split(":").map((function(e){return parseInt(e,10)}));(new Date).setHours(a[0],a[1])-(new Date).getTime()>0&&t.push(e[n])}return t}(O.saturday[t])),h(e))}),[I,b,t]),d.a.useEffect((function(){var e=p(b);s(e)}),[I,b]),Object(g.jsxs)(g.Fragment,{children:[Object(g.jsx)(m,{children:Object(g.jsx)(w,{children:null===r.hours&&null===r.minutes?Object(g.jsxs)(y,{children:["\u0410\u0432\u0442\u043e\u0431\u0443\u0441 \u043d\u0430 \u043e\u0441\u0442\u0430\u043d\u043e\u0432\u043a\u0443 ",Object(g.jsx)("b",{children:t})," \u0441\u0435\u0433\u043e\u0434\u043d\u044f \u043d\u0435 \u043f\u0440\u0438\u0435\u0434\u0435\u0442"]}):Object(g.jsxs)(y,{children:["\u0421\u043b\u0435\u0434\u0443\u044e\u0449\u0438\u0439 \u0430\u0432\u0442\u043e\u0431\u0443\u0441 \u043f\u0440\u0438\u0435\u0434\u0435\u0442 \u0447\u0435\u0440\u0435\u0437",Object(g.jsxs)(D,{children:[r.hours,"\u0447 ",r.minutes,"\u043c"]})]})})}),Object(g.jsxs)(k,{children:[Object(g.jsx)(y,{children:"\u0412\u0440\u0435\u043c\u044f \u043d\u0430 \u0441\u0435\u0433\u043e\u0434\u043d\u044f:"}),i.map((function(e){return Object(g.jsx)(M,{children:e})}))]}),Object(g.jsx)(x,{children:Object(g.jsx)("a",{href:"http://www.tomskavtotrans.ru/60",target:"_blank",rel:"noreferrer",children:"\u0420\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u0435"})})]})};var I=function(){return Object(g.jsx)("div",{className:"App",children:Object(g.jsx)(S,{})})};b.a.render(Object(g.jsx)(d.a.StrictMode,{children:Object(g.jsx)(I,{})}),document.getElementById("root"))}},[[21,1,2]]]);
//# sourceMappingURL=main.144205d0.chunk.js.map