import { Socket } from "socket.io";

export interface ISocketClient {
  userId: string
  devices: ISocketDevice[]
}

export interface ISocketDevice {
  socket: Socket
  socketId: string
}
