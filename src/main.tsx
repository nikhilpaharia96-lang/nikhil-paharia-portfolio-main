import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./dark-theme.css";
import { applyTheme, getInitialTheme } from "@/lib/theme";

applyTheme(getInitialTheme());

createRoot(document.getElementById("root")!).render(<App />);
