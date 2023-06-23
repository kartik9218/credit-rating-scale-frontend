import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ArgonControllerProvider } from "context";
import App from "App";

import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <Suspense>
      <ArgonControllerProvider>
        <PerfectScrollbar>
          <App />
        </PerfectScrollbar>
      </ArgonControllerProvider>
    </Suspense>
  </BrowserRouter>
);
