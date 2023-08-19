import type { GetServerSideProps, NextPage } from 'next';
import { getServerSession } from 'next-auth';
import { signIn } from "next-auth/react";
import Head from "next/head";
import { authOptions } from '~/server/auth';

//how this should work: if !session => load homepage, if session => redirect to user dashboard
//this can't happen until: sign in is set up, and dashboard page is built.

export const getServerSideProps: GetServerSideProps = async (context) => {

  const session = await getServerSession(context.req, context.res, authOptions);

  if(session) {
    return ({
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    })
  }

  return ({
    props: {
      authenticated: false,
    }
  })
}


const Home: NextPage = () => {

  return (
    <>
      <Head>
        <title>Brand Name Here</title>
        <meta name="description" content="Own Your Own Finances" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex min-h-screen flex-col items-center bg-base-100">
        <section className="flex h-1/2 justify-center overflow-hidden bg-base-200 shadow-md shadow-zinc-600/30">
          <div className="grid w-2/3 grid-cols-2 overflow-hidden">
            <div className="flex h-full flex-col justify-center">
              <div>
                <h1 className="text-4xl font-bold text-primary">
                  Your Money, Your Way.
                </h1>
                <h2 className="text-lg">
                  We put you back in control of organizing your money. People
                  are more in tune with their finances, when they control how it
                  looks from the description of what you bought, to the
                  categories you want to use to organize everything.
                </h2>
              </div>

              <div className="pt-5">
                <button className="btn btn-primary rounded-full px-8 text-base-100 shadow active:shadow-inner"
                  onClick={() => void signIn()}
                >
                  Login
                </button>
              </div>
            </div>
            <div className="relative flex justify-center">
              <div
                className="mockup-phone border"
                style={{ position: "relative", top: "50px" }}
              >
                <div className="camera" style={{ width: "117px" }}></div>
                <div className="display">
                  <div
                    className="artboard artboard-demo phone-1"
                    style={{ width: "250px", height: "444px" }}
                  >
                    Hi.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-10">
          <ul className="steps w-full pb-5">
            <li className="step step-primary">
              <div className="card mt-5 w-1/4 bg-base-200 shadow-md shadow-zinc-600/30">
                Blah
              </div>
            </li>
            <li className="step step-primary">
              <div className="card w-1/4 bg-base-200 shadow-md shadow-zinc-600/30">
                Blah
              </div>
            </li>
            <li className="step step-primary">
              <div className="card w-1/4 bg-base-200 shadow-md shadow-zinc-600/30">
                Blah
              </div>
            </li>
          </ul>
        </section>
      </main>
      <footer className="footer bg-secondary p-3 text-neutral-content">
        <h1 className="w-full justify-center font-bold">
          Copyright &copy; 2023
        </h1>
      </footer>
    </>
  );
}

export default Home;

// function AuthShowcase() {
//   const { data: sessionData } = useSession();

//   const { data: secretMessage } = api.example.getSecretMessage.useQuery(
//     undefined, // no input
//     { enabled: sessionData?.user !== undefined }
//   );

//   return (
//     <div className="flex flex-col items-center justify-center gap-4">
//       <p className="text-center text-2xl text-white">
//         {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
//         {secretMessage && <span> - {secretMessage}</span>}
//       </p>
//       <button
//         className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
//         onClick={sessionData ? () => void signOut() : () => void signIn()}
//       >
//         {sessionData ? "Sign out" : "Sign in"}
//       </button>
//     </div>
//   );
// }

