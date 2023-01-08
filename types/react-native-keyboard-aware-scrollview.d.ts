declare module 'react-native-keyboard-aware-scrollview' {
  import 'react';
  import {Constructor, ViewProps} from 'react-native';
  class KeyboardAwareScrollViewComponent extends React.Component<ViewProps> {}
  const KeyboardAwareScrollViewBase: KeyboardAwareScrollViewComponent &
    Constructor<any>;
  class KeyboardAwareScrollView extends KeyboardAwareScrollViewComponent {}
  export {KeyboardAwareScrollView};
}

// 타입스크립트를 열심히 공부해야 함 이건
