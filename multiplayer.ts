
/**
 * Mock Realtime Service for Online Multiplayer.
 * Uses BroadcastChannel to sync state between two tabs/windows.
 */
export class MultiplayerService {
  private channel: BroadcastChannel | null = null;
  private onMessageCallback: (data: any) => void = () => {};

  constructor(roomCode: string) {
    this.channel = new BroadcastChannel(`dala_room_${roomCode}`);
    this.channel.onmessage = (event) => {
      this.onMessageCallback(event.data);
    };
  }

  onMessage(callback: (data: any) => void) {
    this.onMessageCallback = callback;
  }

  send(data: any) {
    if (this.channel) {
      this.channel.postMessage(data);
    }
  }

  close() {
    this.channel?.close();
  }
}

export const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
};
