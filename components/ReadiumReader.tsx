// @ts-nocheck
import React from 'react';
import { requireNativeComponent, Platform, ViewProps } from 'react-native';

type ReadiumReaderProps = ViewProps & {
  source: string; // signed URL or file path
  initialLocator?: string;
  onLocationChange?: (event: { nativeEvent: { locator: string } }) => void;
};

const COMPONENT_NAME = 'ReadiumReaderView';

const NativeReader = Platform.select<any>({
  ios: requireNativeComponent<ReadiumReaderProps>(COMPONENT_NAME),
  android: requireNativeComponent<ReadiumReaderProps>(COMPONENT_NAME),
  default: (props: any) => null,
});

export default function ReadiumReader(props: ReadiumReaderProps) {
  const { source, initialLocator, onLocationChange, ...rest } = props;
  return (
    <NativeReader
      source={source}
      initialLocator={initialLocator}
      onLocationChange={onLocationChange}
      {...rest}
    />
  );
}

