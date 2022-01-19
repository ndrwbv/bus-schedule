import React from "react";
import ReactDOM from "react-dom";
import { YMInitializer } from "react-yandex-metrika";

import App from "./App";

import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <App />
    {process.env.NODE_ENV === "production" && (
      <YMInitializer accounts={[85705234]} options={{ webvisor: true }} />
    )}
  </React.StrictMode>,
  document.getElementById("root")
);
