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
import useRoomOptions from '../api/hooks/useRoomOptions';

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
    <main data-lk-theme="default" className="w-full h-full flex justify-center">
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
          // style={{
          //   display: 'flex',
          //   justifyContent: 'center',
          // }}
          className='w-full h-screen flex'
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

  let [tokenOptions, setTokenOptions] = React.useState<object | undefined>({});

  React.useEffect(() => {
    setTokenOptions({
      userInfo: {
        identity: userChoices.username,
        name: userChoices.username,
      },
    });
  }, [userChoices.username]);

  const token = useToken(
    process.env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT,
    roomName,
    tokenOptions,
  );

 
  const roomOptions = useRoomOptions(userChoices);

  return (
    <>
      {roomOptions.liveKitUrl && (
        <LiveKitRoom
          room={roomOptions.room}
          token={token}
          serverUrl={roomOptions.liveKitUrl}
          connectOptions={roomOptions.connectOptions}
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

