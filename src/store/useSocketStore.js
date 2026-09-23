import { create } from "zustand";

const useSocketStore = create((set) => ({
  socket: null,
  isConnected: false,
  setSocket: (socket) => set({ socket }),
  setConnected: (isConnected) => set({ isConnected }),
}));

export default useSocketStore;
