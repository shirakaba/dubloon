import { NativeModule, requireNativeModule } from 'expo';

import { DoubloonModuleEvents } from './Doubloon.types';

declare class DoubloonModule extends NativeModule<DoubloonModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<DoubloonModule>('Doubloon');
