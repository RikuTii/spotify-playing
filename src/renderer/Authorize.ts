import { getAccessToken, redirectToAuthCodeFlow } from 'main/authorize-spotify';

export const AuthorizeUser = () => {
  const clientId = '5313b75baba342288d5e3a01dba242c0';
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code && !localStorage.getItem('access_token')) {
    redirectToAuthCodeFlow(clientId);
  } else {
    if (localStorage.getItem('access_token')) {
    } else {
      getAccessToken(clientId, code ?? '');
    }
  }
};
