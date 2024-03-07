import {
  encodePassphrase,
  generateRoomId,
  randomString,
} from '@/lib/client-utils';
import { useRouter } from 'next/router';
import React from 'react';

function StartingPage() {
  const router = useRouter();
  const [e2ee, setE2ee] = React.useState(false);
  const [sharedPassphrase, setSharedPassphrase] = React.useState(
    randomString(64),
  );
  const startMeeting = () => {
    if (e2ee) {
      router.push(
        `/rooms/${generateRoomId()}#${encodePassphrase(sharedPassphrase)}`,
      );
    } else {
      router.push(`/rooms/${generateRoomId()}`);
    }
  };
  return (
    <main className="w-full h-full flex flex-col justify-center items-center">
      <div className="flex flex-col justify-center items-center gap-8">
      <h1 className="text-4xl">LiveLink Demo Version</h1>
      <button className="border rounded-lg border-gray-300 bg-gray-50 px-8 py-2 text-xl flex items-center justify-center hover:scale-110 transition duration-100" onClick={startMeeting}>
        Start Meeting
      </button>
      <div className="encryption-container">
        <input
          id="use-e2ee"
          type="checkbox"
          checked={e2ee}
          onChange={(ev) => setE2ee(ev.target.checked)}
        ></input>
        <label className="encryption" htmlFor="use-e2ee">
          Enable end-to-end encryption
        </label>
      </div>
      {e2ee && (
        <div>
          <label htmlFor="passphrase">Passphrase</label>
          <input
            id="passphrase"
            type="password"
            value={sharedPassphrase}
            onChange={(ev) => setSharedPassphrase(ev.target.value)}
          />
        </div>
      )}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <div>
      <StartingPage />
    </div>
  );
}
