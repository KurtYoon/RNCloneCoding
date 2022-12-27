import {useCallback} from 'react';
import {io, Socket} from 'socket.io-client';
import Config from 'react-native-config';

let socket: Socket | undefined; // 전역변수화

const useSocket = (): [typeof socket, () => void] => { // 리턴값에 대한 타입 지정, void는 Undefined
    const disconnect = useCallback(() => {
        if (socket) {
            socket.disconnect();
            socket = undefined;
        }
    }, []);
    if (!socket) {
        socket = io(`${Config.API_URL}`, {
            transports: ['websocket'],
        });
    }
    return [socket, disconnect];
}

// 연결을 끊고 싶을 떄 socket이 있으면 disconnect
// socket이 없으면 아랫단에서 만들기

export default useSocket;