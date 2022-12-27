import {Alert, Dimensions, Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useCallback, useState} from 'react';
import orderSlice, {Order} from '../slices/order';
import { useAppDispatch } from '../store';
import axios, {AxiosError} from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../store/reducer';
import Config from 'react-native-config';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import { LoggedInParamList } from '../../AppInner';
import NaverMapView, { Marker, Path } from 'react-native-nmap';
import getDistanceFromLatLonInKm from '../util';

interface Props {
    item: Order;
}

function EachOrder({item}: Props) {
    const navigation = useNavigation<NavigationProp<LoggedInParamList>>();
    const dispatch = useAppDispatch();
    const accessToken = useSelector((state: RootState) => state.user.accessToken);
    const [detail, setDetail] = useState(false);
    const toggleDetail = useCallback(() => {
      setDetail(prev => !prev);
    }, []);
    const [loading, setLoading] = useState(false);
    const {start, end} = item;

    const onAccept = useCallback(async () => {
      if (!accessToken) {
        return ;
      }
      try {
        setLoading(false);
        await axios.post( // 남이 먼저 수락한 경우 에러가 나도록 처리
          `${Config.API_URL}/accept`,
          {orderId: item.orderId},
          {headers: {authorization: `Bearer ${accessToken}`}},
        );
        dispatch(orderSlice.actions.acceptOrder(item.orderId));
        setLoading(true);
        navigation.navigate('Delivery');
      } catch (error) {
        const errorResponse = (error as AxiosError).response;
        if (errorResponse?.status === 400) { // 400번대와 500번대는 에러
          Alert.alert('알림', errorResponse.data.message);
          dispatch(orderSlice.actions.rejectOrder(item.orderId));
        }
        setLoading(true);
      } 
      dispatch(orderSlice.actions.acceptOrder(item.orderId));
    }, [accessToken, navigation, dispatch, item.orderId]);

    const onReject = useCallback(() => {
      dispatch(orderSlice.actions.rejectOrder(item.orderId));
    }, [dispatch, item.orderId]);
  
    return (
        <View key={item.orderId} style={styles.orderContainer}>
          <Pressable onPress={toggleDetail} style={styles.info}>
            <Text style={styles.eachInfo}>
              {item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원
            </Text>
            <Text style={styles.eachInfo}>
              {getDistanceFromLatLonInKm(
                start.latitude,
                start.longitude,
                end.latitude,
                end.longitude,
              ).toFixed(1)}
              km
            </Text>
            <Text>장충단로</Text>
            <Text>엘리스빌</Text>
          </Pressable>
          {detail ? (
          <View>
            <View
              style={{
                width: Dimensions.get('window').width - 30,
                height: 200,
                marginTop: 10,
              }}>
              <NaverMapView
                style={{width: '100%', height: '100%'}}
                center={{
                  zoom: 10,
                  tilt: 50,
                  latitude: (start.latitude + end.latitude) / 2,
                  longitude: (start.longitude + end.longitude) / 2,
                }}>
                <Marker
                  coordinate={{
                    latitude: start.latitude,
                    longitude: start.longitude,
                  }}
                  pinColor="blue"
                />
                <Path
                  coordinates={[
                  {
                    latitude: start.latitude,
                    longitude: start.longitude,
                  },
                  {latitude: end.latitude, longitude: end.longitude},
                  ]}
                />
                <Marker
                  coordinate={{latitude: end.latitude, longitude: end.longitude}}
                />
                </NaverMapView>
              </View>
            <View style={styles.buttonWrapper}>
              <Pressable onPress={onAccept} disabled={loading} style={styles.acceptButton}>
                <Text style={styles.buttonText}>수락</Text>
              </Pressable>
              <Pressable onPress={onReject} disabled={loading} style={styles.rejectButton}>
                <Text style={styles.buttonText}>거절</Text>
              </Pressable>
            </View>
          </View>
            ): null}
        </View> // 반복문 내부의 컴포넌트는 분할해야함
      )
}

const styles = StyleSheet.create({
    orderContainer: {
      borderRadius: 5,
      margin: 5,
      padding: 10,
      backgroundColor: 'lightgray',
    },
    info: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    eachInfo: {
      // flex: 1,
    },
    buttonWrapper: {
      flexDirection: 'row', // 가로로 버튼 배치
    },
    acceptButton: {
      backgroundColor: 'blue',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomLeftRadius: 5, // 왼쪽에 둥글게
      borderTopLeftRadius: 5,
      flex: 1,
    },
    rejectButton: {
      backgroundColor: 'red',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomRightRadius: 5, // 오른쪽에 둥글게
      borderTopRightRadius: 5,
      flex: 1,
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });

export default EachOrder;
// 최적화를 위한 분할