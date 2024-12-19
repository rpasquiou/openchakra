import React, { useEffect, useRef } from 'react'
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
    if (!room) {
      return console.warn(`No room for visio`)
    }
    if (!user) {
      return console.warn(`No user for visio`)
    }

    const isTrainee=!(/FORMATEUR/.test(user?.role))

    const domain = 'kmeet.infomaniak.com'; // Replace with your KMeet server domain if self-hosted
    const options = {
      roomName: room,
      parentNode: jitsiContainer.current,
      userInfo: {
        displayName: user.fullname,
        email: user.email,
      },
      configOverwrite: {         
        disableModeratorIndicator: !!isTrainee,
        prejoinPageEnabled: false,		// Désactiver la page de pré-séance
        enableWelcomePage: false,		// Masquer la page d'accueil
        startWithVideoMuted: false,		// Démarrer avec la caméra sactivée
        startWithAudioMuted: false,		// Démarrer avec le micro sactivé
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
        participantsPane: {
          enabled: !isTrainee,
        }
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
    <div style={{ height: '100vh', width: '100%' }} ref={jitsiContainer} />
  )
}

export default Visio
