import React from 'react'
import { NextPageWithLayout } from '../_app'
import Layout from '~/modules/layouts/Layout';

const BudgetPage: NextPageWithLayout = () => {
  return (
    <div>[id]</div>
  )
}

BudgetPage.getLayout = (page: React.ReactNode) => {
    return (
      <>
        <Layout>{page}</Layout>
      </>
    );
  };
  
  BudgetPage.auth = true;

export default BudgetPage