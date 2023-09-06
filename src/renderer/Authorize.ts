import { getAccessToken, redirectToAuthCodeFlow } from 'main/authorize-spotify';

export const AuthorizeUser = () => {
  const clientId = '';
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code && !localStorage.getItem('access_token')) {
    redirectToAuthCodeFlow(clientId);
  } else {
    if (localStorage.getItem('access_token')) {
    } else if(code) {
      getAccessToken(clientId, code);
    }
  }
};
