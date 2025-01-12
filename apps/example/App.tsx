import { connectionProps } from "dubloon";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Alert } from "react-native";
import WebView, { type WebViewMessageEvent } from "react-native-webview";

export default function App() {
  const onMessage = React.useCallback(
    ({ nativeEvent: { data } }: WebViewMessageEvent) => {
      interface LogPayload {
        type: "log";
        message: string;
      }
      interface AlertPayload {
        type: "alert";
        message: string;
      }

      type Payload = LogPayload | AlertPayload;

      let parsed: Payload;
      try {
        parsed = JSON.parse(data);
      } catch (error) {
        console.error("[WebView] error parsing message", error);
        return;
      }

      // TODO: validate parsed message

      switch (parsed.type) {
        case "log": {
          console.log(parsed.message);
          break;
        }
        case "alert": {
          Alert.alert(parsed.message);
          break;
        }
      }
    },
    []
  );

  return (
    <>
      <WebView
        webviewDebuggingEnabled={__DEV__}
        javaScriptEnabled={true}
        onMessage={onMessage}
        {...connectionProps({ port: 5173 })}
      />
      <StatusBar backgroundColor="purple" translucent={false} />
    </>
  );
}
