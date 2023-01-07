import React, { useRef, useCallback, useState } from "react";
import { 
  Alert, 
  Pressable, 
  StyleSheet, 
  Text, 
  TextInput, 
  View,
  ActivityIndicator,
 } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../../AppInner"
import DismissKeyboardView from "../components/DismissKeyboardView"
import { useAppDispatch } from "../store";
import axios, {AxiosError} from "axios";
import userSlice from '../slices/user';
import EncryptedStorage from 'react-native-encrypted-storage';
import Config from 'react-native-config';
import { Platform } from "react-native";

type SignInScreenProps = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

function SignIn({navigation}: SignInScreenProps) {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const emailRef = useRef<TextInput | null>(null);
    const passwordRef = useRef<TextInput | null>(null);
    const API_URL = Platform.OS === 'ios' ? 'http://localhost:3105' : Config.API_URL;


    const onChangeEmail = useCallback(text => {
      setEmail(text.trim());
    }, []);
    const onChangePassword = useCallback(text => {
      setPassword(text.trim());
    }, []);
    const onSubmit = useCallback(async () => {
      if (loading) {
        return ;
      }
      if (!email || !email.trim()) {
        return Alert.alert('알림', '이메일을 입력해주세요.');
      }
      if (!password || !password.trim()) {
        return Alert.alert('알림', '비밀번호를 입력해주세요');
      }
      try {
        setLoading(true);
        console.log(`${API_URL}`);
        const response = await axios.post(`${API_URL}/login`, {
          email,
          password,
        });
        console.log(response.data);
        Alert.alert('알림', '로그인 되었습니다.');
        dispatch(
          userSlice.actions.setUser({
            name: response.data.data.name,
            email: response.data.data.email,
            accessToken: response.data.data.accessToken, // 유효기간을 줌
            refreshToken: response.data.data.refreshToken,
          }),
        );
        await EncryptedStorage.setItem( // 비밀 storage에 저장
          'refreshToken', // AsyncStorage는 영구 저장 -> 암호화 안됨 보안에 민감하면 redux or EncryptedStorage에 저장
          response.data.data.refreshToken, // 시간연장용
        );
      } catch (error) {
        const errorResponse = (error as AxiosError).response;
        if (errorResponse) {
          Alert.alert('알림', errorResponse.data.message);
        }
      } finally {
        setLoading(false);
      }
    }, [loading, dispatch, email, password]);
  
  const toSignUp = useCallback(() => {
    navigation.navigate('SignUp');
  }, [navigation]);

  const canGoNext = email && password;
  return (
  <DismissKeyboardView>
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>이메일</Text>
      <TextInput 
      style={styles.textInput}
      onChangeText = {onChangeEmail}
      placeholder="이메일을 입력해주세요"
      importantForAutofill="yes"
      autoComplete="email"
      textContentType="emailAddress"
      value={email}
      keyboardType="email-address"
      returnKeyType="next"
      onSubmitEditing={() => {
        passwordRef.current?.focus();
      }}
      blurOnSubmit={false}
      ref={emailRef}
      clearButtonMode="while-editing" // ios에서 한 번에 지울 수 있게
      />
    </View>
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>비밀번호</Text>
      <TextInput 
      style={styles.textInput}
      value={password}
      placeholder="비밀번호를 입력해주세요(영문,숫자,특수문자)" onChangeText = {onChangePassword}
      secureTextEntry
      importantForAutofill="yes"
      autoComplete="password"
      textContentType="password"
      ref={passwordRef}
      onSubmitEditing={onSubmit}
      />
    </View>
    <View style={styles.buttonZone}>
      <Pressable onPress={onSubmit} style={!canGoNext 
        ? styles.loginButton 
        : StyleSheet.compose(styles.loginButton, styles.loginButtonActive)} 
        disabled={!canGoNext}>
        <Text style = {styles.loginButtonText}>로그인</Text>
      </Pressable>
      <Pressable onPress={toSignUp}>
        <Text>회원가입하기</Text>
      </Pressable>
    </View>
  </DismissKeyboardView>);
}

const styles = StyleSheet.create({
  loginButton: {
    backgroundColor: 'gray',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonZone: {
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
  },
  loginButtonActive: {
    backgroundColor: 'blue',
  },
  textInput: {
    padding: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 20,

  },
  inputWrapper: {
    padding: 20,
  }
});

export default SignIn;