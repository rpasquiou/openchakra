import { background } from '@chakra-ui/react';
import React, { useEffect, useRef } from 'react'
import {Helmet} from 'react-helmet'
import { useUserContext } from '../context/user';

const style=`
#meet-container {
  width: 80%;
  height: 80%;
  border: 2px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}`
// TODO: DIsplay "Source needed" in Studio only
const Visio = ({room, ...props}) => {
  
  const {user}=useUserContext()

  const jitsiContainer = useRef(null)

  useEffect(() => {
    const domain = 'kmeet.infomaniak.com'; // Replace with your KMeet server domain if self-hosted
    const options = {
      roomName: room,
      parentNode: jitsiContainer.current,
      userInfo: {
        displayName: user?.fullname,
        email: user?.email,
      },
      configOverwrite: {         
        prejoinPageEnabled: false,		// Désactiver la page de pré-séance
        enableWelcomePage: false,		// Masquer la page d'accueil
        startWithVideoMuted: true,		// Démarrer avec la caméra désactivée
        startWithAudioMuted: true,		// Démarrer avec le micro désactivé
        disableInviteFunctions: true,		// Désactiver les invitations
        showBranding: false,  			// Désactive le branding (logo, liens, etc.)
        toolbarButtons: [
          'microphone', 'camera', 'chat', 'raisehand', 'whiteboard', 'tileview', 'desktop',
          'settings', 'audioonly', 'filmstrip',
          'hangup', 'select-background', 'security', 'participants-pane', 'noisesuppression',
        ],

        deeplinking: {
            disabled: true,
            hideLogo: true,
        },
        
        disableProfile: true,      // Désactiver les profils utilisateurs dans menu paramètre
        readOnlyName: true,        // Empêche la modification du nom de l'utilisateur
        gravatar: {
            disabled: true,        // Désactiver les avatars générés automatiquement
        },
      },
    }

    let api

    if (window.JitsiMeetExternalAPI) {
      api = new window.JitsiMeetExternalAPI(domain, options);
    }

    // Handle cleanup when component unmounts
    return () => api?.dispose();
  }, [room, user]);

  return (
    <>
      <Helmet>
      <script src="https://meet.jit.si/external_api.js"></script>
      </Helmet>
      <div style={{ height: '100vh', width: '100%' }} ref={jitsiContainer} />
    </>
  )
}

export default Visio
