import { connectionProps } from "dubloon";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import WebView from "react-native-webview";

export default function App() {
  return (
    <>
      <WebView
        webviewDebuggingEnabled={__DEV__}
        {...connectionProps({ port: 5173 })}
      />
      <StatusBar backgroundColor="purple" translucent={false} />
    </>
  );
}
