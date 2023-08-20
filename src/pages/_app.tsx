import { type Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";
import type { AppProps, AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import type { NextPage } from "next";
import React from 'react';

export type NextPageWithLayout<
  TProps = Record<string, unknown>,
  TInitialProps = TProps
> = NextPage<TProps, TInitialProps> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
  auth?: boolean;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp: AppType<{session: Session | null }> = (({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  const getLayout =
    Component.getLayout ??
    ((page) => {
      return page;
    });

  return getLayout(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    <SessionProvider session={session}>
      {Component.auth ? (
        <Auth>
          <Component {...pageProps} />
        </Auth>
      ) : (
        <Component {...pageProps} />
      )}
    </SessionProvider>
  );
});

export const Auth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status } = useSession({ required: true });

  if(status === 'loading') {
    return (
      <div className='w-full min-h-screen flex justify-center items-center'>
        <span className='loading loading-spinner loading-lg'></span>
      </div>
    )
  }

  return children;

}

export default api.withTRPC(MyApp);
