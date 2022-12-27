import {configureStore, getDefaultMiddleware} from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import rootReducer from './reducer';

const store = configureStore({
    reducer: rootReducer,
    // middleware: getDefaultMiddleware => {
    //     if (__DEV__) {
    //         const createDebugger = require('redux-flipper').default;
    //         return getDefaultMiddleware().concat(createDebugger());
    //     }
    //     return getDefaultMiddleware();
    // }, // flipper쓰려먼 한다는데 나 안해도 될듯..?
});
// 세팅 자체는 그대로 써도 된다는 얘기
export default store;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();