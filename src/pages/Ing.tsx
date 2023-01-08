import React, {useEffect, useState} from 'react';
import {Dimensions, Text, View, Alert} from 'react-native';
import NaverMapView, {Marker, Path} from 'react-native-nmap';
import {useSelector} from 'react-redux';
import {RootState} from '../store/reducer';
import Geolocation from '@react-native-community/geolocation';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {LoggedInParamList} from '../../AppInner';
import TMap from '../modules/TMap';

type IngScreenProps = NativeStackScreenProps<LoggedInParamList, 'Delivery'>;

function Ing({navigation}: IngScreenProps) {
  console.dir(navigation);
  const deliveries = useSelector((state: RootState) => state.order.deliveries);
  const [myPosition, setMyPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null); // 처음에는 null이므로

  useEffect(() => {
    Geolocation.getCurrentPosition(
      info => {
        setMyPosition({
          latitude: info.coords.latitude,
          longitude: info.coords.longitude,
        });
      },
      console.error, // 20초안에 위치를 못가져오면 error
      {
        enableHighAccuracy: true,
        timeout: 20000,
      },
    );
  }, []);

  if (!deliveries?.[0]) {
    // 주문 수락한 것이 없을 때
    return (
      // eslint-disable-next-line react-native/no-inline-styles
      <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
        <Text>주문을 먼저 수락해주세요!</Text>
      </View>
    );
  }

  if (!myPosition || !myPosition.latitude) {
    // 내 위치를 불러오지 않았을 때
    return (
      // eslint-disable-next-line react-native/no-inline-styles
      <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
        <Text>내 위치를 로딩 중입니다. 권한을 허용했는지 확인해주세요.</Text>
      </View>
    );
  }

  const {start, end} = deliveries?.[0];

  return (
    <View>
      <View
        style={{
          width: Dimensions.get('window').width, // 화면 가로
          height: Dimensions.get('window').height, // 화면 세로
        }}>
        <NaverMapView
          // eslint-disable-next-line react-native/no-inline-styles
          style={{width: '100%', height: '100%'}}
          center={{
            zoom: 10,
            tilt: 50,
            latitude: (start.latitude + end.latitude) / 2, 
            longitude: (start.longitude + end.longitude) / 2,
            // 출발지와 도착지의 중간지점
          }}>
          {myPosition?.latitude && (
            <Marker // 출발지 Marker
              coordinate={{
                latitude: myPosition.latitude,
                longitude: myPosition.longitude,
              }}
              width={15}
              height={15}
              anchor={{x: 0.5, y: 0.5}}
              caption={{text: '나'}}
              image={require('../assets/red-dot.png')}
            />
          )}
          {myPosition?.latitude && (
            <Path // 연결 해주는 부분
              coordinates={[
                {
                  latitude: myPosition.latitude,
                  longitude: myPosition.longitude,
                },
                {latitude: start.latitude, longitude: start.longitude},
              ]}
              color="orange"
            />
          )}
          <Marker // 도착지 Marker
            coordinate={{
              latitude: start.latitude,
              longitude: start.longitude,
            }}
            width={15}
            height={15}
            anchor={{x: 0.5, y: 0.5}}
            caption={{text: '출발'}}
            image={require('../assets/blue-dot.png')}
            onClick={() => {
              TMap.openNavi(
                '출발지',
                start.longitude.toString(),
                start.latitude.toString(),
                'MOTORCYCLE',
              ).then(data => {
                console.log('TMap callback', data);
                if (!data) {
                  Alert.alert('알림', '티맵을 설치하세요.');
                }
              });
            }}
          />
          <Path
            coordinates={[
              {
                latitude: start.latitude,
                longitude: start.longitude,
              },
              {latitude: end.latitude, longitude: end.longitude},
            ]}
            color="orange"
            onClick={() => {
              TMap.openNavi(
                '도착지',
                end.longitude.toString(),
                end.latitude.toString(),
                'MOTORCYCLE',
              ).then(data => {
                console.log('TMap callback', data);
                if (!data) {
                  Alert.alert('알림', '티맵을 설치하세요.');
                }
              });
            }}
          />
          <Marker
            coordinate={{latitude: end.latitude, longitude: end.longitude}}
            width={15}
            height={15}
            anchor={{x: 0.5, y: 0.5}}
            caption={{text: '도착'}}
            image={require('../assets/green-dot.png')}
            onClick={() => { // click하면 Complete로 이동
              console.log(navigation);
              navigation.push('Complete', {orderId: deliveries[0].orderId});
            }}
          />
        </NaverMapView>
      </View>
    </View>
  );
}

export default Ing;
