import React, {useCallback} from 'react';
import { FlatList, View } from 'react-native';
import { Order } from '../slices/order';
import { useSelector } from 'react-redux';
import { RootState } from '../store/reducer';
import EachOrder from '../components/EachOrder';

function Orders() {
  const orders = useSelector((state: RootState) => state.order.orders); // redux에 있는 것은 useSelector로 가져오기
 // 한국 숫자 세자리마다 콤마 찍어주는 정규표현식
  const renderItem = useCallback(({item}: {item:Order}) => {
  return <EachOrder item={item}/>;
 }, []);

  return (
    <View>
      <FlatList
        data={orders}
        keyExtractor={item => item.orderId}
        renderItem={renderItem}/>
    </View>
  );
}

export default Orders;