import { requireNativeView } from 'expo';
import * as React from 'react';

import { DoubloonViewProps } from './Doubloon.types';

const NativeView: React.ComponentType<DoubloonViewProps> =
  requireNativeView('Doubloon');

export default function DoubloonView(props: DoubloonViewProps) {
  return <NativeView {...props} />;
}
