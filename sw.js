if(!self.define){let s,e={};const i=(i,l)=>(i=new URL(i+".js",l).href,e[i]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=i,s.onload=e,document.head.appendChild(s)}else s=i,importScripts(i),e()})).then((()=>{let s=e[i];if(!s)throw new Error(`Module ${i} didn’t register its module`);return s})));self.define=(l,n)=>{const r=s||("document"in self?document.currentScript.src:"")||location.href;if(e[r])return;let o={};const u=s=>i(s,r),a={module:{uri:r},exports:o,require:u};e[r]=Promise.all(l.map((s=>a[s]||u(s)))).then((s=>(n(...s),o)))}}define(["./workbox-3625d7b0"],(function(s){"use strict";self.skipWaiting(),s.clientsClaim(),s.precacheAndRoute([{url:"404.html",revision:"7f157303ec1855a62588e54207c7af73"},{url:"assets/bird-zamanuha-328d4ca9.svg",revision:null},{url:"assets/dead-35c86ca8.svg",revision:null},{url:"assets/evil-face-8b7eaa36.svg",revision:null},{url:"assets/Game-ef96ebbc.js",revision:null},{url:"assets/game-new-high-score-8104d64c.svg",revision:null},{url:"assets/game-record-d7c6bb6a.svg",revision:null},{url:"assets/game-star-69857334.svg",revision:null},{url:"assets/index-a84b477a.css",revision:null},{url:"assets/index-bb71adfb.js",revision:null},{url:"assets/index-dc60438c.js",revision:null},{url:"assets/infoclosecross-4f847792.svg",revision:null},{url:"assets/Intro-578f684b.js",revision:null},{url:"assets/location-abf7e6c9.svg",revision:null},{url:"assets/LogoWithText-2cdd06be.svg",revision:null},{url:"assets/next-bus-34c10d38.svg",revision:null},{url:"assets/pumpkin-0f1b0e95.svg",revision:null},{url:"assets/question-icon-94800d66.svg",revision:null},{url:"assets/telegram-logo-410f8a61.svg",revision:null},{url:"assets/vendor-9204da30.js",revision:null},{url:"assets/web-5e049272.svg",revision:null},{url:"assets/write-b0e7f1a8.svg",revision:null},{url:"favicon.ico",revision:"33a0cad981644f6a8b7409cc9b15fa26"},{url:"index.html",revision:"69fa8b7d307ec2b56677ef1b9ffcc6b8"},{url:"logo192.png",revision:"964fe194c511a909093f996d89a27098"},{url:"logo512.png",revision:"da3b9289c29e67302b009e7447db00e7"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"favicon.ico",revision:"33a0cad981644f6a8b7409cc9b15fa26"},{url:"manifest.webmanifest",revision:"9e20ae7c725c0697a8c7b2b5dfdf719a"}],{}),s.cleanupOutdatedCaches(),s.registerRoute(new s.NavigationRoute(s.createHandlerBoundToURL("index.html")))}));