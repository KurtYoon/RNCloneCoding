import React, {useCallback, useEffect} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import axios, {AxiosError} from 'axios';
import Config from 'react-native-config';
import {useAppDispatch} from '../store';
import userSlice from '../slices/user';
import {useSelector} from 'react-redux';
import {RootState} from '../store/reducer';
import EncryptedStorage from 'react-native-encrypted-storage';
import orderSlice, {Order} from '../slices/order';
import FastImage from 'react-native-fast-image';
import {Platform} from 'react-native';

function Settings() {
  const money = useSelector((state: RootState) => state.user.money);
  const name = useSelector((state: RootState) => state.user.name);
  const completes = useSelector((state: RootState) => state.order.completes);
  const accessToken = useSelector((state: RootState) => state.user.accessToken);
  const dispatch = useAppDispatch();
  const API_URL =
    Platform.OS === 'ios' ? 'http://localhost:3105' : Config.API_URL;

  useEffect(() => {
    async function getMoney() {
      const response = await axios.get<{data: {data: number}}>(
        `${API_URL}/showmethemoney`,
        {
          headers: {authorization: `Bearer ${accessToken}`},
        },
      );
      dispatch(userSlice.actions.setMoney(response.data.data)); // 서버로 부터 데이터를 받아올 때 타입을 지정해야 함
    }
    getMoney();
  }, [dispatch, accessToken, API_URL]);

  useEffect(() => {
    async function getCompletes() {
      const response = await axios.get<{data: Order[]}>(
        `${API_URL}/completes`,
        {
          headers: {authorization: `Bearer ${accessToken}`},
        },
      );
      dispatch(orderSlice.actions.setCompletes(response.data.data));
    }
    getCompletes();
  }, [dispatch, accessToken, API_URL]);

  const onLogout = useCallback(async () => {
    try {
      await axios.post(
        `${API_URL}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      Alert.alert('알림', '로그아웃 되었습니다.');
      dispatch(
        userSlice.actions.setUser({
          name: '',
          email: '',
          accessToken: '',
        }),
      );
      await EncryptedStorage.removeItem('refreshToken');
    } catch (error) {
      const errorResponse = (error as AxiosError).response;
      console.error(errorResponse);
    }
  }, [accessToken, dispatch, API_URL]);

  const renderItem = useCallback(({item}: {item: Order}) => {
      return (
        <FastImage
          source={{uri: `${API_URL}/${item.image}`}}
          resizeMode="cover"
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            height: Dimensions.get('window').width / 3 - 10,
            width: Dimensions.get('window').width / 3 - 10,
            margin: 5,
          }}
        />
      );
    },
    [API_URL],
  ); // 반복문에 함수가 들어간다면 Component를 따로 빼기

  return (
    <View>
      <View style={styles.money}>
        <Text style={styles.moneyText}>
          {name}님의 수익금{' '}
          <Text style={{fontWeight: 'bold'}}>
            {money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          </Text>
          원
        </Text>
      </View>
      <View>
        <FlatList data={completes} numColumns={3} renderItem={renderItem} />
      </View>
      <View style={styles.buttonZone}>
        <Pressable
          style={StyleSheet.compose(
            styles.loginButton,
            styles.loginButtonActive,
          )}
          onPress={onLogout}>
          <Text style={styles.loginButtonText}>로그아웃</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  money: {
    padding: 20,
  },
  moneyText: {
    fontSize: 16,
  },
  buttonZone: {
    alignItems: 'center',
    paddingTop: 20,
  },
  loginButton: {
    backgroundColor: 'gray',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  loginButtonActive: {
    backgroundColor: 'blue',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default Settings;