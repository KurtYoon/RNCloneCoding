import {createSlice, PayloadAction} from '@reduxjs/toolkit';

// store -> root reducer(state) -> user slice, order slice

// 각 Action은 정해져있고 State를 설계해야함

// action: State를 바꾸는 동작 / 행위
// dispatch: 그 액션을 실제로 실행하는 함수
// reducer: 액션이 실제로 실행되면 State를 바꾸는 로직 -> 익숙해지기 전엔 미리 만들어놓기

const initialState = {
  name: '',
  email: '', // 초기상태
  accessToken: '',
  money: 0,
  refreshToken: '',
}; // global states

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      // state는 현재 state를 어떻게 바꿀지, payload만 있으면 값 하나, payload.~~형태는 객체 형태로
      state.email = action.payload.email;
      state.name = action.payload.name; // 상태를 어떻게 바꿔줄지 -> reducer (비동기 Action)
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    setName(state, action) {
      state.name = action.payload;
    },
    setEmail(state, action) {
      state.email = action.payload;
    },
    setMoney(state, action: PayloadAction<number>) {
      state.money = action.payload;
    },
    setAccessToken(state, action) {
      state.accessToken = action.payload;
    },
  },
  extraReducers: builder => {}, // 비동기 Action 만들 때
});

export default userSlice;
