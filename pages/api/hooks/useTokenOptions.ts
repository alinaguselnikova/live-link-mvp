import { LocalUserChoices, useToken } from '@livekit/components-react';
import React from 'react';

export default function useTokenOptions(
  userChoices: LocalUserChoices,
  roomName: string,
) {
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

  return token;
}
