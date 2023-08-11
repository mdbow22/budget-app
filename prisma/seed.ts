import { Prisma, PrismaClient } from "@prisma/client";
import { DateTime } from 'luxon';

const prisma = new PrismaClient();

const seedDB = async () => {
  const newAccountId = await prisma.bankAccount.create({
    data: {
      type: "checking",
      name: "PNC Checking",
      initBalance: 8933.43,
      User: {
        connect: {
          id: "cll51xnwb0000lf74a4dv822q",
        },
      },
    },
    select: {
      id: true,
    },
  });

  const transactions = [
    {
      amount: 112.9,
      date: DateTime.fromISO("2023-05-19").toJSDate(),
      Category: {
        connectOrCreate: {
            where: {
                name_type: {
                    name: "Other",
                    type: 'credit',
                }
              
            },
            create: {
              name: "Other",
              type: "credit",
            },
          },
      },
      description: "Payment from Heph",
      BankAccount: {
        connect: {
          id: newAccountId.id,
        },
      },
    },
    {
      amount: 1664.62,
      date: DateTime.fromISO("2023-05-26").toJSDate(),
      Category: {
        connectOrCreate: {
            where: {
                name_type: {
                    name: "Salary",
                    type: "credit",
                }
              
            },
            create: {
              name: "Salary",
              type: "credit",
            },
          },
      },
      description: "Paycheck",
      BankAccount: {
        connect: {
          id: newAccountId.id,
        },
      },
    },
    {
      amount: -61,
      date: DateTime.fromISO("2023-05-30").toJSDate(),
      Category: {
        connectOrCreate: {
            where: {
                name_type: {
                    name: "Other",
                    type: "debit",
                }
            },
            create: {
              name: "Other",
              type: "debit",
            },
          },
      },
      description: "Payment to Heph",
      BankAccount: {
        connect: {
          id: newAccountId.id,
        },
      },
    },
    {
      amount: -4726.76,
      date: DateTime.fromISO("2023-05-31").toJSDate(),
      Category: {
        connectOrCreate: {
          where: {
            name_type: {
                name: "Bills - Credit Card",
                type: "debit",
            }
          },
          create: {
            name: "Bills - Credit Card",
            type: "debit",
          },
        },
      },
      description: "Credit Card Payment",
      BankAccount: {
        connect: {
          id: newAccountId.id,
        },
      },
    },
    {
      amount: -20,
      date: DateTime.fromISO("2023-06-02").toJSDate(),
      Category: {
        connectOrCreate: {
          where: {
            name_type: {
                name: "Entertainment",
                type: "debit",
            }
          },
          create: {
            name: "Entertainment",
            type: "debit",
          },
        },
      },
      description: "Lottery Tickets",
      BankAccount: {
        connect: {
          id: newAccountId.id,
        },
      },
    },
  ];

  let newTransactions = [];
  if (newAccountId.id) {
    for (let i = 0; i < transactions.length; i++) {
      
        const newTransaction = await prisma.transaction.create({
          data: transactions[i]!,
          select: {
            id: true,
          }
        });
        
        newTransactions.push(newTransaction.id)
    }
  }

  console.log('Account made: ', newAccountId.id);
  console.log('Transactions added: ', newTransactions);
};

seedDB();


