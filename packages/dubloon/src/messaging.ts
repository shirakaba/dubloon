import * as React from "react";
import { type WebViewMessageEvent } from "react-native-webview";

export function useOnMessage(
  handleMessage: <T extends string, U extends { type: T }>(message: U) => void
) {
  const onMessage = React.useCallback(
    ({ nativeEvent: { data } }: WebViewMessageEvent) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(data);
      } catch (error) {
        console.error("[WebView] error parsing message", error);
        return;
      }

      if (!isPayload(parsed)) {
        return;
      }

      handleMessage(parsed);
    },
    []
  );

  return { onMessage };
}

export type KnownWebViewMessage<T extends string> = { type: T };

function isPayload(value: unknown): value is KnownWebViewMessage<string> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return true;
}
