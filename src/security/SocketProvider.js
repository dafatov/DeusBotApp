import {io} from "socket.io-client";
import {createContext, useContext, useEffect, useRef} from "react";
import {isLocalhost} from "../utils/string";

const SocketContext = createContext({});

export const SocketProvider = ({children}) => {
  const socket = useRef(null);

  useEffect(() => {socket.current = io(`http${isLocalhost() ? '' : 's'}://${process.env.REACT_APP_SERVER_URI}`);}, [])

  return (
    <SocketContext.Provider
      value={socket}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext).current;