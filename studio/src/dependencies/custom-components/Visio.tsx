import React, { useEffect, useRef, useState } from 'react';
import { useUserContext } from '../context/user';

const Visio = ({ room, ...props }) => {
  const { user } = useUserContext();
  const jitsiContainer = useRef(null)
  const [api, setApi] = useState(null)
  const [toggle, setToggle] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (!room || !user) {
      console.warn(`Missing required data: room=${room}, user=${!!user}`);
      return;
    }

    const isTrainer = /FORMATEUR/.test(user.role);

    const domain = 'kmeet.infomaniak.com'; // Your Jitsi server
    const options = {
      roomName: room,
      parentNode: jitsiContainer.current,
      userInfo: {
        displayName: `${user.fullname}(${isTrainer? 'T':'A'})`,
        email: user.email,
      },
      configOverwrite: {
        disableModeratorIndicator: !isTrainer,
        prejoinPageEnabled: false,
        enableWelcomePage: false,
        startWithVideoMuted: false,
        startWithAudioMuted: false,
        disableInviteFunctions: true,
        showBranding: false,
        toolbarButtons: [
          'microphone', 'camera', 'chat', 'raisehand', 'whiteboard', 'tileview', 'desktop',
          'settings', 'audioonly', 'filmstrip', 'hangup', 'select-background', 'security',
          'participants-pane', 'noisesuppression',
        ],
        deeplinking: {
          disabled: true,
        },
        disableProfile: true,
        readOnlyName: true,
        gravatar: {
          disabled: true,
        },
        participantsPane: {
          enabled: isTrainer,
        },
      },
    };

    let localApi;

    if (window.JitsiMeetExternalAPI) {
      localApi = new window.JitsiMeetExternalAPI(domain, options);
      setApi(localApi);

      localApi.addListener('videoConferenceLeft', () => {
        console.log('Leaving room')
        localApi.dispose()
        setApi(null)
        setLeaving(true)
        window.close()
      });

      if (!isTrainer) {
        localApi.addListener('videoConferenceJoined', async () => {
          const { rooms } = await localApi.getRoomsInfo();
          const mainRoom = rooms.find((room) => room.isMainRoom);
          if (!mainRoom?.participants.find(p => /\(T\)$/.test(p.displayName))) {
            console.log('Only trainee in the room, leaving...');
            localApi.dispose();
            setApi(null);
            setTimeout(() => setToggle(!toggle), 1000)
          }
        });
      }
    }

    // Cleanup function
    return () => {
      if (localApi) {
        console.log('Disposing Jitsi API');
        localApi.dispose();
      }
    };
  }, [room, user, toggle]);

  return (
    <div style={{ height: '100vh', width: '100%' }} ref={jitsiContainer}>
      {!api && !leaving && <p>En attente de connexion du formateur...</p>}
    </div>
  )
};

export default Visio;
