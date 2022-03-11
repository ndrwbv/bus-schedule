import React from "react";
import ReactDOM from "react-dom";
import { YMInitializer } from "react-yandex-metrika";
import ReactGA from "react-ga";

import App from "./App/App";

import "./index.css";

if (process.env.NODE_ENV === "production") {
  ReactGA.initialize("UA-190135319-1");
  ReactGA.pageview(window.location.pathname + window.location.search);
}

ReactDOM.render(
  <React.StrictMode>
    <App />
    {process.env.NODE_ENV === "production" && (
      <YMInitializer accounts={[85705234]} options={{ webvisor: true }} />
    )}
  </React.StrictMode>,
  document.getElementById("root")
);
