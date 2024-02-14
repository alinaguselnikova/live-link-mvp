import { RoomServiceClient } from 'livekit-server-sdk';

export function getRoomClient(): RoomServiceClient {
  if (typeof process.env.LIVEKIT_API_KEY === 'undefined') {
    throw new Error('LIVEKIT_API_KEY is not defined');
  }
  return new RoomServiceClient(process.env.LIVEKIT_API_KEY);
}
