import React from "react";
import ReactDOM from "react-dom/client";
import Readme from "./Readme.md";
// import "normalize.css";
// import "concrete.css";
import "remixicon/fonts/remixicon.css";
import "./index.css";

console.log(Readme);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <main dangerouslySetInnerHTML={{ __html: Readme.html }}></main>
  </React.StrictMode>
);
