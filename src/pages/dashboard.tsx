import Head from 'next/head'
import React, { ReactElement } from 'react'
import { NextPageWithLayout } from './_app'
import Layout from '~/modules/layouts/Layout'
import { useSession } from 'next-auth/react'

const Dashboard: NextPageWithLayout = () => {

    const { data } = useSession();

  return (
    <>
        <Head>
            <title>Dashboard | {data?.user.name}</title>
        </Head>
        <div className='p-5'>
            <h1 className='text-3xl font-bold'>{data?.user.name}'s Dashboard</h1>
        </div>
    </>
  )
}

Dashboard.getLayout = (page: ReactElement) => {
    return (
        <>
        <Layout>
            {page}
        </Layout>
        </>
    )
}

Dashboard.auth = true;

export default Dashboard