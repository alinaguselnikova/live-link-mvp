import { decodePassphrase, useServerUrl } from '@/lib/client-utils';
import { LocalUserChoices } from '@livekit/components-react';
import {
  DeviceUnsupportedError,
  ExternalE2EEKeyProvider,
  Room,
  RoomConnectOptions,
  RoomOptions,
  VideoCodec,
  VideoPresets,
} from 'livekit-client';
import { useRouter } from 'next/router';
import React from 'react';

export default function useRoomOptions(
  userChoices: LocalUserChoices
) {
    const router = useRouter();
    const { region, hq, codec } = router.query;
  
    const e2eePassphrase =
      typeof window !== 'undefined' &&
      decodePassphrase(location.hash.substring(1));
  
    const liveKitUrl = useServerUrl(region as string | undefined);
  
    const worker =
      typeof window !== 'undefined' &&
      e2eePassphrase &&
      new Worker(new URL('livekit-client/e2ee-worker', import.meta.url));
  
    const e2eeEnabled = !!(e2eePassphrase && worker);
    const keyProvider = new ExternalE2EEKeyProvider();

  let [roomOptions, setRoomOptions] = React.useState<RoomOptions>();
  React.useEffect(() => {
    let videoCodec: VideoCodec | undefined = (
      Array.isArray(codec) ? codec[0] : codec ?? 'vp9'
    ) as VideoCodec;
    if (e2eeEnabled && (videoCodec === 'av1' || videoCodec === 'vp9')) {
      videoCodec = undefined;
    }
    setRoomOptions({
      videoCaptureDefaults: {
        deviceId: userChoices.videoDeviceId ?? undefined,
        resolution: hq === 'true' ? VideoPresets.h2160 : VideoPresets.h720,
      },
      publishDefaults: {
        dtx: false,
        videoSimulcastLayers:
          hq === 'true'
            ? [VideoPresets.h1080, VideoPresets.h720]
            : [VideoPresets.h540, VideoPresets.h216],
        red: !e2eeEnabled,
        videoCodec,
      },
      audioCaptureDefaults: {
        deviceId: userChoices.audioDeviceId ?? undefined,
      },
      adaptiveStream: { pixelDensity: 'screen' },
      dynacast: true,
      e2ee: e2eeEnabled
        ? {
            keyProvider,
            worker,
          }
        : undefined,
      // I think you'll kill me for this
    } as RoomOptions);
  }, [userChoices, hq, codec]);

  let [room, setRoom] = React.useState<Room>();
  React.useEffect(() => {
    setRoom(new Room(roomOptions));
  }, []);

  if (e2eeEnabled) {
    keyProvider.setKey(decodePassphrase(e2eePassphrase));
    room!.setE2EEEnabled(true).catch((e) => {
      if (e instanceof DeviceUnsupportedError) {
        alert(
          `You're trying to join an encrypted meeting, but your browser does not support it. Please update it to the latest version and try again.`,
        );
        console.error(e);
      }
    });
  }

  const connectOptions = React.useMemo((): RoomConnectOptions => {
    return {
      autoSubscribe: true,
    };
  }, []);

  return( {
    liveKitUrl,
    room,
    connectOptions
  });
  //

  //const roomOptions = React.useMemo((): RoomOptions => {
  //     let videoCodec: VideoCodec | undefined = (
  //       Array.isArray(codec) ? codec[0] : codec ?? 'vp9'
  //     ) as VideoCodec;
  //     if (e2eeEnabled && (videoCodec === 'av1' || videoCodec === 'vp9')) {
  //       videoCodec = undefined;
  //     }
  //     return {
  //       videoCaptureDefaults: {
  //         deviceId: userChoices.videoDeviceId ?? undefined,
  //         resolution: hq === 'true' ? VideoPresets.h2160 : VideoPresets.h720,
  //       },
  //       publishDefaults: {
  //         dtx: false,
  //         videoSimulcastLayers:
  //           hq === 'true'
  //             ? [VideoPresets.h1080, VideoPresets.h720]
  //             : [VideoPresets.h540, VideoPresets.h216],
  //         red: !e2eeEnabled,
  //         videoCodec,
  //       },
  //       audioCaptureDefaults: {
  //         deviceId: userChoices.audioDeviceId ?? undefined,
  //       },
  //       adaptiveStream: { pixelDensity: 'screen' },
  //       dynacast: true,
  //       e2ee: e2eeEnabled
  //         ? {
  //             keyProvider,
  //             worker,
  //           }
  //         : undefined,
  //     // I think you'll kill me for this
  //     } as RoomOptions;
  //   }, [userChoices, hq, codec]);
}
