import React from "react";
import ReactDOM from "react-dom/client";
import packages from "virtual:monorepo-packages";
// import "normalize.css";
// import "concrete.css";
import "remixicon/fonts/remixicon.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <main>
      <h1>/pkg</h1>
      <p>Packages by Kevin Chavez</p>
      <a href="https://github.com/mrkev/pkg">
        <i className="ri-github-fill"></i> mrkev/pkg
      </a>
      <ul>
        {packages.map((pkg) => {
          const indexPage = pkg.pages.find((p) =>
            p.url.endsWith("/index.html"),
          );
          if (!indexPage) return null;
          const dir = indexPage.url.split("/").at(-2)!;
          return (
            <li key={indexPage.url}>
              <a href={indexPage.url.replace(/\/index\.html$/, "")}>{dir}</a>{" "}
              {pkg.repository && (
                <>
                  (<a href={pkg.repository}>repo</a>)
                </>
              )}
            </li>
          );
        })}
      </ul>
      <footer>
        Built by <a href="http://aykev.dev">Kevin Chavez</a> ·
        <a href="https://twitter.com/aykev">
          <i className="ri-twitter-fill"></i>
        </a>
        <a href="https://github.com/mrkev">
          <i className="ri-github-fill"></i>
        </a>
      </footer>
    </main>
  </React.StrictMode>,
);
