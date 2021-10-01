import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { YMInitializer } from "react-yandex-metrika";
// import reportWebVitals from './reportWebVitals';

console.log(process.env.NODE_ENV)
ReactDOM.render(
  <React.StrictMode>
    <App />
    {process.env.NODE_ENV === "production" && (
        <YMInitializer accounts={[85705234]} options={{ webvisor: true }} />
      )}
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log);
