import Link from 'next/link';
import React from 'react'
import { api } from '~/utils/api';

const SideNav: React.FC<{ openModal: () => void; }> = ({openModal}) => {

    const { data, isLoading } = api.accounts.getAllAccounts.useQuery({
        includeBal: true,
      });
      
  return (
    <ul className="menu menu-lg h-full w-72 bg-base-200 text-base-content">
          <li>
            <Link href="/dashboard">Dashboard</Link>
          </li>
          <li>
            <details open>
              <summary>Accounts</summary>
              <ul>
                {!isLoading &&
                  data?.map((account) => {
                    return (
                      <li key={account.id}>
                        <Link
                          href={`/accounts/${account.id}`}
                          className="justify-between text-base"
                        >
                          <div>{account.name}</div>
                          <div>(${account.currBalance})</div>
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </details>
          </li>
          <li>
            <a>Budgets</a>
          </li>
          <li>
            <a>Goals</a>
          </li>
          <li className="mt-auto w-full items-center">
            <a
              className="w-full grid-cols-1 text-center"
              onClick={() => openModal()}
            >
              New Transaction
            </a>
          </li>
        </ul>
  )
}

export default SideNav