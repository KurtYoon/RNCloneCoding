import SignIn from "./src/pages/SignIn";
import SignUp from "./src/pages/SignUp";
import Orders from "./src/pages/Orders";
import Delivery from "./src/pages/Delivery";
import Settings from "./src/pages/Settings";
import * as React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import { RootState } from "./src/store/reducer";
import useSocket from "./src/hooks/useSocket";
import { useEffect } from "react";
import EncryptedStorage from "react-native-encrypted-storage";
import axios, {AxiosError} from 'axios';
import { Alert } from "react-native";
import userSlice from "./src/slices/user";
import { useAppDispatch } from "./src/store";
import orderSlice from "./src/slices/order";
import Config from "react-native-config";
import usePermissions from "./src/hooks/usePermissions";
import SplashScreen from 'react-native-splash-screen';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

export type LoggedInParamList = {
  Orders: undefined;
  Settings: undefined;
  Delivery: undefined;
  Complete: {orderId: string};
};

export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function AppInner() {
  const dispatch = useAppDispatch();
    const isLoggedIn = useSelector((state: RootState) => !!state.user.email);
    // useSelector을 통해서 slice에서 가져올 수 있음
    // useSelector은 Provider밖에서 사용하지 못한다.
    // 애를 쓰기 위해서 AppInner로 파일을 구분해줌
    const [socket, disconnect] = useSocket();

    usePermissions();
    useEffect(() => {
      //axios.interceptors.request.use() AccessToken을 꺼내와서 사용할 때
      axios.interceptors.response.use(
        response => {
          console.log(response);
          return response;
        },
        async (error) => {
          const {config, response: {status}} = error; // error.response.status를 의미함. error을 구조분해하여 사용
          if (status === 419) { // AccessToken이 만료됐을 때는 자동으로 refresh하도록
            if (error.response.data.code === 'expired') {
              const originalRequest = config;
              const refreshToken = await EncryptedStorage.getItem('resfreshToken');
              const {data} = await axios.post(
                `${Config.API_URL}/refreshToken`,
                {},
                {headers: {authorization: `Bearer ${refreshToken}`}},
              );
              dispatch(userSlice.actions.setAccessToken(data.data.accessToken));
              originalRequest.headers.authorization = `Bearer ${data.data.accessToken}`; // 원래 요청의 AccessToken을 재발급 받은 것으로 교체
              return axios(originalRequest);
            }
          }
          return Promise.reject(error);
        }
      );
    }, [dispatch]);

    useEffect(() => {
      const callback = (data: any) => {
        console.log(data);
        dispatch(orderSlice.actions.addOrder(data));
      };
      if (socket && isLoggedIn) {
        socket.emit('acceptOrder', 'hello');
        socket.on('order', callback);
      }
      return () => {
        if (socket) {
          socket.off('order', callback);
        }
      };
    }, [dispatch, isLoggedIn, socket]);

    useEffect(() => {
      if (!isLoggedIn) {
        console.log('!isLoggedIn', !isLoggedIn);
        disconnect(); // logout일때 disconnect
      }
    }, [isLoggedIn, disconnect]);

    useEffect(() => {
      const getTokenAndRefresh = async () => {
        try {
          const token = await EncryptedStorage.getItem('refreshToken');
          if (!token) {
            SplashScreen.hide();
            return;
          }
          const response = await axios.post(
            `${Config.API_URL}/refreshToken`,
            {},
            {
              headers: {
                authorization: `Bearer ${token}`,
              },
            },
          );
          dispatch(
            userSlice.actions.setUser({
              name: response.data.data.name,
              email: response.data.data.email,
              accessToken: response.data.data.accessToken,
            }),
          );
        } catch (error) {
          console.error(error);
          if ((error as AxiosError).response?.data.code === 'expired') {
            Alert.alert('알림', '다시 로그인 해주세요.');
          }
        } finally {
          SplashScreen.hide();
        }
      };
      getTokenAndRefresh();
    }, [dispatch]);

    return (
        <NavigationContainer>
      {isLoggedIn ? (
        <Tab.Navigator>
          <Tab.Screen
            name="Orders"
            component={Orders}
            options={{
              title: '오더 목록', 
              tabBarIcon: () => <FontAwesome5Icon name="list" size = {20}/>
            }}
          />
          <Tab.Screen
            name="Delivery"
            component={Delivery}
            options={{
              title: '지도',
              headerShown: false,
              tabBarIcon: () => <FontAwesome5Icon name="map" size = {20}/>
            }}
          />
          <Tab.Screen
            name="Settings"
            component={Settings}
            options={{
              title: '내 정보',
              unmountOnBlur: true,
              tabBarIcon: () => <FontAwesomeIcon name="gear" size = {20}/>
            }}
          />
        </Tab.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen
            name="SignIn"
            component={SignIn}
            options={{title: '로그인'}}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{title: '회원가입'}}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
    );
}

export default AppInner;