import { encodePassphrase, generateRoomId, randomString } from '@/lib/client-utils';
import {useRouter} from 'next/router';
import React from 'react';
import {Roboto} from 'next/font/google'


function StartingPage() {
  const router = useRouter();
  const [e2ee, setE2ee] = React.useState(false);
  const [sharedPassphrase, setSharedPassphrase] = React.useState(randomString(64));
  const startMeeting = () => {
    if (e2ee) {
      router.push(`/rooms/${generateRoomId()}#${encodePassphrase(sharedPassphrase)}`);
    } else {
      router.push(`/rooms/${generateRoomId()}`);
    };
  }
    return (
      <div className='enter'>
        <h1 className='heading'>
          LiveLink Demo Version
        </h1>
        <button className='enter-button' onClick={startMeeting}>
          Start Meeting
        </button>
        <div className="encryption-container">
        <input 
        id="use-e2ee"
        type="checkbox"
        checked={e2ee}
        onChange={(ev) => setE2ee(ev.target.checked)}>
        </input>
        <label className='encryption' htmlFor="use-e2ee">Enable end-to-end encryption</label>
        </div>
        {e2ee && (
        <div>
        <label htmlFor='passphrase'>Passphrase</label>
        <input 
          id="passphrase"
          type="password"
          value={sharedPassphrase}
          onChange={(ev) => setSharedPassphrase(ev.target.value)}
          />
        </div>
      )}
        </div>
    )
  }


export default function Home() {
  return (
        <div>
          <StartingPage />
        </div>
  );
}
