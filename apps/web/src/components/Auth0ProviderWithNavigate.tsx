import type { JSX, ReactNode } from 'react';
import { Auth0Provider, type AppState } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { config } from '@/config/environment';
import { DASHBOARD_PATH } from '@/modules/onboarding/constants';

export interface Auth0ProviderWithNavigateProps {
  children: ReactNode;
}

/** Wraps Auth0Provider with a router-aware redirect callback — must render inside BrowserRouter. */
export function Auth0ProviderWithNavigate({
  children,
}: Auth0ProviderWithNavigateProps): JSX.Element {
  const navigate = useNavigate();

  const onRedirectCallback = (appState?: AppState): void => {
    navigate(appState?.returnTo || DASHBOARD_PATH, { replace: true });
  };

  return (
    <Auth0Provider
      domain={config.auth0Domain}
      clientId={config.auth0ClientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        ...(config.auth0Audience ? { audience: config.auth0Audience } : {}),
      }}
      cacheLocation="localstorage"
      useRefreshTokens
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
}
