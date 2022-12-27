import React from 'react';
import {
  TouchableWithoutFeedback,
  Keyboard,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'; // 해당 에러는 타입스크립트가 없는 라이브러리를 사용하기 때문에 오류
// npm i @types/오류뜨는라이브러리 -> 타입 지원을 받는 라이브러리면 설치되고 오류 해결
// KeyboardAwareScrollView와 같은 라이브러리를 잘 사용합시다.

//                                          변수에다가 타입을 넣어준 모습
// Children이 있으면 React.FC를 사용하고, Children이 없으면 function을 사용
// style?인 이유는 style이 있는지 없는지 모르기 때문에 
// react style에 대한 typing은 StyleProp<ViewStyle>로 선언함
const DismissKeyboardView: React.FC<{style?: StyleProp<ViewStyle>}> = ({
    children,
    ...props
}) => (
    // Keyboard.dismiss를 호출하면 키보드가 내려감
    // accessible은 편의를 위한 기능이므로 accessible=false
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAwareScrollView {...props} 
        behavior={Platform.OS === 'android' ? 'position' : 'padding'} // android는 position, ios는 padding처리
        style={props.style}>
            {children}
        </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
);

export default DismissKeyboardView;