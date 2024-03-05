import { LocalUserChoices } from '@livekit/components-react';
import {
  ExternalE2EEKeyProvider,
  RoomOptions,
  VideoCodec,
  VideoPresets,
} from 'livekit-client';
import React from 'react';

export default function useRoomOptions(
  e2eeEnabled: boolean,
  hq: string | string[] | undefined,
  codec: string | string[] | undefined,
  userChoices: LocalUserChoices,
  keyProvider: ExternalE2EEKeyProvider,
  worker: false| '' |Worker
) {
    let [roomOptions, setRoomOptions] = React.useState<RoomOptions>();
    React.useEffect(() => {
        let videoCodec: VideoCodec | undefined = (
            Array.isArray(codec) ? codec[0] : codec ?? 'vp9'
          ) as VideoCodec;
          if (e2eeEnabled && (videoCodec === 'av1' || videoCodec === 'vp9')) {
            videoCodec = undefined;
          }
          setRoomOptions ( {
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
        },[userChoices, hq, codec]);
    return roomOptions;
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
