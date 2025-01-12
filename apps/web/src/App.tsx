import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        backgroundColor: "blanchedalmond",
      }}
    >
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button
          style={{ display: "block" }}
          onClick={() => {
            (window as any).ReactNativeWebView.postMessage(
              JSON.stringify({
                type: "log",
                message: "Hello from the WebView!",
              })
            );
          }}
        >
          Log to React Native
        </button>

        <button
          style={{ display: "block" }}
          onClick={() => {
            (window as any).ReactNativeWebView.postMessage(
              JSON.stringify({
                type: "alert",
                message: "Alert from the WebView!",
              })
            );
          }}
        >
          Show a native alert
        </button>
        <p style={{ paddingBlock: "1em" }}>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
