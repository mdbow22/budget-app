import { type Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";
import { AppProps, type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { NextPage } from "next";
import React from 'react';

// export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
//   getLayout?: (page: React.ReactElement) => React.ReactNode
// }

// type AppPropsWithLayout = AppProps & {
//   Component: NextPageWithLayout
// }

// const MyApp: AppType<{ session: Session | null }> = ({
//   Component,
//   pageProps: { session, ...pageProps },
// }) => {
//   return (
//     <SessionProvider session={session}>
//       <Component {...pageProps} />
//     </SessionProvider>
//   );
// };

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

const MyApp = (({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  const getLayout =
    Component.getLayout ??
    ((page) => {
      return page;
    });

  return getLayout(
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
}) as AppType<{ session: Session | null }>;

export const Auth: React.FC<{ children: any }> = ({ children }) => {
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
