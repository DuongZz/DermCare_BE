import { ISocketClient } from '@/interfaces/socket.interface'
import _ from 'lodash'
import http from 'http'
import { Server } from 'socket.io'
import getCorsOptions from '@/configs/cors.config'
import JwtUtil from '@/utils/jwt.util'
import { ETokenType } from '@/configs/enum.config'
import events from './events'

let socketServer: Server

// Lưu lại client và guests
const clients = new Map<string, ISocketClient>()
const guests = new Set<string>()

export const initSocket = (server: http.Server) => {
  clients.clear()
  guests.clear()

  const io = new Server(server, {
    cors: getCorsOptions(),
  })

  socketServer = io

  // Middleware xác thực token
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      // Không có token thì cho vào room guests
      socket.join('guests')
      socket.data.isGuest = true
      guests.add(socket.id)
    } else {
      // Có token thì xác thực token
      try {
        const payload = await JwtUtil.verifyAT(token)
        if (payload.type !== ETokenType.ACCESS) {
          return next(new Error('Unauthorized'))
        }
        const currentUser = clients.get(payload._id)
        if (currentUser) {
          currentUser.devices.push({
            socket,
            socketId: socket.id,
          })
        } else {
          clients.set(payload._id, {
            userId: payload._id,
            devices: [{ socket, socketId: socket.id }],
          })
        }
        // Join room của user và các role của user
        socket.data.userId = payload._id
        socket.data.isGuest = false
        socket.join([payload._id, ...payload.roles])
      } catch (error: any) {
        return next(error)
      }
    }
    return next()
  })

  io.on('connection', socket => {
    // Handle các sự kiện khác ở đây
    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.data.isGuest) {
        guests.delete(socket.id)
      } else {
        const currentUser = clients.get(socket.data.userId)
        if (currentUser) {
          currentUser.devices = currentUser.devices.filter(
            device => device.socketId !== socket.id
          )
          if (currentUser.devices.length === 0) {
            clients.delete(currentUser.userId)
          }
        }
      }
    })
  })
}

export const SocketManager = {
  getClients() {
    return new Map<string, ISocketClient>(
      _.cloneDeep(Array.from(clients.entries()))
    )
  },
  getGuests() {
    return new Set<string>(_.cloneDeep(Array.from(guests)))
  },
  getServer() {
    return socketServer
  },
}
