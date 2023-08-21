import React, { useState } from 'react'
import type { NextPageWithLayout } from './_app'
import Layout from '~/modules/layouts/Layout';

const NewAccount: NextPageWithLayout = () => {

  const [step, setStep] = useState(1);

  return (
    <div className="p-5">
        <h1 className="text-2xl font-bold">Let&apos;s make a new account!</h1>
        <ul className='steps steps-vertical mt-10'>
          <li className={`step ${step >= 1 && 'step-primary'}`}>
            <div className='form-control'>
              <label className='label'>
                <h2 className='text-xl font-bold text-primary'>What do you want to call the account?</h2>
              </label>
              <input type='text' className='input input-bordered input-sm' />
            </div>
          </li>
          <li className={`step ${step >= 2 ? 'step-primary' : 'text-base-300'}`}>
            <h2 className='text-xl font-bold'>What kind of account is it?</h2>
          </li>
          <li className={`step ${step >= 3 ? 'step-primary' : 'text-base-300'}`}>
            <h2 className='text-xl font-bold'>What&apos;s the starting balance?</h2>
          </li>
          <li className={`step ${step >= 2 ? 'step-primary' : 'text-base-300'}`}>
            <h2 className='text-xl font-bold'>Should we add a couple transactions?</h2>
          </li>
        </ul>
    </div>
  )
}

NewAccount.getLayout = (page: React.ReactNode) => {
    return (
      <>
        <Layout>{page}</Layout>
      </>
    );
  };

NewAccount.auth = true;

export default NewAccount;