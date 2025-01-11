import { connectionProps } from "doubloon";
import WebView from "react-native-webview";

export default function App() {
  return (
    <WebView
      webviewDebuggingEnabled={__DEV__}
      {...connectionProps({ port: 5173 })}
    />
  );
}
