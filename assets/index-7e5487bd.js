import{s as e,L as a}from"./vendor-0722fa4b.js";const n="linear-gradient(180.17deg, #9C45C4 0.15%, #723CB7 26.11%, #336CFF 99.85%);",r="linear-gradient(180.17deg, #5F55FF 0.15%, #6070FF 56.75%, #BB78F0 99.85%);",s="linear-gradient(359.69deg, #EA9836 0.28%, #F5C460 77.47%, #FFE066 99.75%)",d=e(a)`
	color: #0364f6;
	text-decoration: underline;
	opacity: ${t=>t.lowLight?"0.5":"1"};
`,f=e.div`
	margin-bottom: ${t=>t.marginBottom?`${t.marginBottom} px`:"32px"};
`,x=e.h1`
	font-weight: 700;
	font-size: 32px;

	text-align: center;
	color: #ffffff;

	text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.13);
`,g=e.button`
	position: relative;
	width: 100%;

	padding: 20px;

	font-weight: 600;
	font-size: 20px;
	color: #ffffff;

	background: linear-gradient(89.43deg, #0f2fff 0.93%, #7a31cf 80.37%);
	box-shadow: 0px 2px 0px 1px rgba(0, 0, 0, 0.27);
	border-radius: 8px;

	&::after {
		content: '';
		position: absolute;
		top: 3px;
		left: 0;
		width: 95%;
		height: 4px;
		margin: 0 6px;

		background: rgba(255, 255, 255, 0.14);
		border-radius: 19px;
	}
`,p=e.div`
	display: flex;
	justify-content: center;
	background: ${t=>t.bg?t.bg:n};
	height: 100%;
`,o=e.div`
	z-index: 999;
	max-width: 550px;
	width: 100%;

	display: flex;
	flex-direction: column;
	height: 100%;
	padding: 35px 32px 25px 32px;
	justify-content: space-between;

	font-family: 'Inter', 'Roboto', sans-serif;
`,c=e(o)``;export{f as G,s as H,p as M,x as T,d as a,c as b,g as c,r as d,o as e};
