import { combineReducers } from 'redux';

import userSlice from '../slices/user';
import orderSlice from '../slices/order';

// 전체 상태
const rootReducer = combineReducers( {
    user: userSlice.reducer,
    order: orderSlice.reducer, // reducer로 어떤 slice를 사용할 건지 지정
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;