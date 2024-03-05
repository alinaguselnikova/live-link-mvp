import React from 'react';
import {
  LiveKitRoom,
  LocalUserChoices,
  PreJoin,
  VideoConference,
  formatChatMessageLinks,
  useToken,
} from '@livekit/components-react';
import { useRouter } from 'next/router';
import { decodePassphrase, useServerUrl } from '../../lib/client-utils';
import {
  DeviceUnsupportedError,
  ExternalE2EEKeyProvider,
  Room,
  RoomConnectOptions,
  RoomOptions,
  VideoCodec,
  VideoPreset,
  VideoPresets,
} from 'livekit-client';

export default function EnterPage() {
  const router = useRouter();
  const { name: roomName } = router.query;

  console.log(roomName);

  const [preJoinChoices, setPreJoinChoices] = React.useState<
    LocalUserChoices | undefined
  >(undefined);

  function handlePreJoinSubmit(values: LocalUserChoices) {
    setPreJoinChoices(values);
  }

  return (
    <main
      data-lk-theme="default"
      style={{
        display: 'grid',
        gap: '1rem',
        justifyContent: 'center',
        placeContent: 'center',
        justifyItems: 'center',
        paddingBottom: '100px',
        overflow: 'auto',
      }}
    >
      {roomName && !Array.isArray(roomName) && preJoinChoices ? (
        <ActiveRoom
          roomName={roomName}
          userChoices={preJoinChoices}
          onLeave={() => {
            router.push('/');
          }}
        ></ActiveRoom>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <PreJoin
            onError={(err) =>
              console.log('error while setting up prejoin', err)
            }
            defaults={{ username: '', videoEnabled: true, audioEnabled: true }}
            onSubmit={handlePreJoinSubmit}
          />
        </div>
      )}
    </main>
  );
}

type ActiveRoomProps = {
  userChoices: LocalUserChoices;
  roomName: string;
  region?: string;
  onLeave?: () => void;
};
const ActiveRoom = ({ roomName, userChoices, onLeave }: ActiveRoomProps) => {
  /** FIXME: unnecessary useMemo */
  const tokenOptions = React.useMemo(() => {
    return {
      userInfo: {
        identity: userChoices.username,
        name: userChoices.username,
      },
    };
  }, [userChoices.username]);
  const token = useToken(
    process.env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT,
    roomName,
    tokenOptions,
  );

  const router = useRouter();
  const { region, hq, codec } = router.query;

  const e2eePassphrase =
    typeof window !== 'undefined' &&
    decodePassphrase(location.hash.substring(1));

  const liveKitUrl = useServerUrl(region as string | undefined);

  const worker =
    typeof window != 'undefined' &&
    e2eePassphrase &&
    new Worker(new URL('livekit-client/e2ee-worker', import.meta.url));

  const e2eeEnabled = !!(e2eePassphrase && worker);
  const keyProvider = new ExternalE2EEKeyProvider();
  /** FIXME: unnecessary useMemo, move all room building logic into hook plz ^_^ */
  const roomOptions = React.useMemo((): RoomOptions => {
    let videoCodec: VideoCodec | undefined = (
      Array.isArray(codec) ? codec[0] : codec ?? 'vp9'
    ) as VideoCodec;
    if (e2eeEnabled && (videoCodec === 'av1' || videoCodec === 'vp9')) {
      videoCodec = undefined;
    }
    return {
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
    };
  }, [userChoices, hq, codec]);

  /** FIXME: instead useMemo use useState+useEffect w/ empty deps array (move into hook) */
  const room = React.useMemo(() => new Room(roomOptions), []);

  if (e2eeEnabled) {
    keyProvider.setKey(decodePassphrase(e2eePassphrase));
    room.setE2EEEnabled(true).catch((e) => {
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

  return (
    <>
      {liveKitUrl && (
        <LiveKitRoom
          room={room}
          token={token}
          serverUrl={liveKitUrl}
          connectOptions={connectOptions}
          video={userChoices.videoEnabled}
          audio={userChoices.audioEnabled}
          onDisconnected={onLeave}
        >
          <VideoConference chatMessageFormatter={formatChatMessageLinks} />
        </LiveKitRoom>
      )}
    </>
  );
};
