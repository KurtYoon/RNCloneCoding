import {createSlice, PayloadAction} from '@reduxjs/toolkit';

// 객체에 대한 타입을 지정할 때  interface를 사용함
export interface Order { // 들어오는 정보를 보고 타입을 지정
    orderId: string;
    state: {
        latitude: number;
        longitude: number;
    };
    end: {
        latitude: number;
        longitude: number;
    };
    price: number;
}

export interface InitialState { // ts는 빈 배열을 싫어함
    orders: Order[];
    deliveries: Order[];
}

const initialState: InitialState = {
    orders: [],
    deliveries: [],
};

const orderSlice = createSlice( {
    name: 'order',
    initialState,
    reducers: {
        addOrder(state, action: PayloadAction<Order>) {
            state.orders.push(action.payload); // any로 뜨면 타입스크립트가 타입추론을 못 하고 있다는 것
        },
        acceptOrder(state, action: PayloadAction<string>) {
            const index = state.orders.findIndex((v) => v.orderId === action.payload);
            if (index > -1) {
                state.deliveries.push(state.orders[index]);
                state.orders.splice(index, 1);
            }
        },
        rejectOrder(state, action: PayloadAction<string>) {
            const index = state.orders.findIndex(v => v.orderId === action.payload);
            if (index > -1) {
                state.orders.splice(index, 1);
            }
            const delivery = state.deliveries.findIndex(
                v => v.orderId === action.payload,
            );
            if (delivery > -1) {
                state.deliveries.splice(delivery, 1);
            }
        },
    },
    extraReducers: builder => {},
});

export default orderSlice;