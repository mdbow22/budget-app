import { Prisma, PrismaClient } from "@prisma/client";
import { DateTime } from 'luxon';

const prisma = new PrismaClient();

const seedDB = async () => {

    const transactions = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        AND: [
          {
            date: {
              gte: DateTime.fromISO('2023-04-27').toJSDate(),
            },
           
          },
          {
            date: {
              lte: DateTime.fromISO('2023-08-31').toJSDate(),
            }
          }
        ],
        //accountId: 4,
        isTransfer: false,
      }
    })

    console.log(transactions);

  // const fakeUser = await prisma.user.create({
  //   data: {
  //     name: 'standardCategory'
  //   },
  //   select: {
  //     id: true,
  //   }
  // })

  // const newAccountId = await prisma.bankAccount.create({
  //   data: {
  //     type: "checking",
  //     name: "PNC Checking",
  //     initBalance: 8933.43,
  //     User: {
  //       connect: {
  //         id: "clla7inhp0000lfwo25z5bcyy",
  //       },
  //     },
  //   },
  //   select: {
  //     id: true,
  //   },
  // });

  // const transactions = [
  //   {
  //     amount: 112.90,
  //     date: DateTime.fromISO("2023-05-19").toJSDate(),
  //     Category: {
  //       connectOrCreate: {
  //           where: {
  //               name_type_custom: {
  //                   name: "Other",
  //                   type: 'credit',
  //                   custom: fakeUser.id,
  //               }
              
  //           },
  //           create: {
  //             name: "Other",
  //             type: "credit",
  //             User: {
  //               connect: {
  //                 id: fakeUser.id,
  //               }
  //             },
  //           },
  //         },
  //     },
  //     description: "Payment from Heph",
  //     BankAccount: {
  //       connect: {
  //         id: newAccountId.id,
  //       },
  //     },
  //     PayorPayee: {
  //       connectOrCreate: {
  //         where: {
  //           thirdparty_userId: {
  //             thirdparty: 'Hephaistion Kunkel',
  //             userId: 'clla7inhp0000lfwo25z5bcyy',
  //           }
  //         },
  //         create: {
  //           thirdparty: 'Hephaistion Kunkel',
  //           User: {
  //             connect: {

  //                 id: 'clla7inhp0000lfwo25z5bcyy'
                
  //             }
  //           }
  //         }
  //       }
  //     },
  //   },
  //   {
  //     amount: 1664.62,
  //     date: DateTime.fromISO("2023-05-26").toJSDate(),
  //     Category: {
  //       connectOrCreate: {
  //           where: {
  //               name_type_custom: {
  //                   name: "Salary",
  //                   type: 'credit',
  //                   custom: fakeUser.id,
  //               }
              
  //           },
  //           create: {
  //             name: "Salary",
  //             type: "credit",
  //             User: {
  //               connect: {
  //                 id: fakeUser.id,
  //               }
  //             },
  //           },
  //         },
  //     },
  //     description: "Paycheck",
  //     BankAccount: {
  //       connect: {
  //         id: newAccountId.id,
  //       },
  //     },
  //     PayorPayee: {
  //       connectOrCreate: {
  //         where: {
  //           thirdparty_userId: {
  //             thirdparty: 'KVC Health Systems',
  //             userId: 'clla7inhp0000lfwo25z5bcyy',
  //           }
  //         },
  //         create: {
  //           thirdparty: 'KVC Health Systems',
  //           User: {
  //             connect: {

  //                 id: 'clla7inhp0000lfwo25z5bcyy'
                
  //             }
  //           }
  //         }
  //       }
  //     },
  //   },
  //   {
  //     amount: -61,
  //     date: DateTime.fromISO("2023-05-30").toJSDate(),
  //     Category: {
  //       connectOrCreate: {
  //           where: {
  //               name_type_custom: {
  //                   name: "Other",
  //                   type: 'debit',
  //                   custom: fakeUser.id,
  //               }
              
  //           },
  //           create: {
  //             name: "Other",
  //             type: "debit",
  //             User: {
  //               connect: {
  //                 id: fakeUser.id,
  //               }
  //             },
  //           },
  //         },
  //     },
  //     description: "Payment to Heph",
  //     BankAccount: {
  //       connect: {
  //         id: newAccountId.id,
  //       },
  //     },
  //     PayorPayee: {
  //       connectOrCreate: {
  //         where: {
  //           thirdparty_userId: {
  //             thirdparty: 'Hephaistion Kunkel',
  //             userId: 'clla7inhp0000lfwo25z5bcyy',
  //           }
  //         },
  //         create: {
  //           thirdparty: 'Hephaistion Kunkel',
  //           User: {
  //             connect: {

  //                 id: 'clla7inhp0000lfwo25z5bcyy'
                
  //             }
  //           }
  //         }
  //       }
  //     },
  //   },
  //   {
  //     amount: -4726.76,
  //     date: DateTime.fromISO("2023-05-31").toJSDate(),
  //     Category: {
  //       connectOrCreate: {
  //           where: {
  //               name_type_custom: {
  //                   name: "Bills - Credit Card",
  //                   type: 'debit',
  //                   custom: fakeUser.id,
  //               }
              
  //           },
  //           create: {
  //             name: "Bills - Credit Card",
  //             type: "debit",
  //             User: {
  //               connect: {
  //                 id: fakeUser.id,
  //               }
  //             },
  //           },
  //         },
  //     },
  //     description: "CC Payment",
  //     BankAccount: {
  //       connect: {
  //         id: newAccountId.id,
  //       },
  //     },
  //     isTransfer: true,
  //   },
  //   {
  //     amount: -20,
  //     date: DateTime.fromISO("2023-06-02").toJSDate(),
  //     Category: {
  //       connectOrCreate: {
  //           where: {
  //               name_type_custom: {
  //                   name: "Entertainment",
  //                   type: 'debit',
  //                   custom: fakeUser.id,
  //               }
              
  //           },
  //           create: {
  //             name: "Entertainment",
  //             type: "debit",
  //             User: {
  //               connect: {
  //                 id: fakeUser.id,
  //               }
  //             },
  //           },
  //         },
  //     },
  //     description: "Lottery Tickets",
  //     BankAccount: {
  //       connect: {
  //         id: newAccountId.id,
  //       },
  //     },
  //     PayorPayee: {
  //       connectOrCreate: {
  //         where: {
  //           thirdparty_userId: {
  //             thirdparty: 'Ohio Lottery',
  //             userId: 'clla7inhp0000lfwo25z5bcyy',
  //           }
  //         },
  //         create: {
  //           thirdparty: 'Ohio Lottery',
  //           User: {
  //             connect: {

  //                 id: 'clla7inhp0000lfwo25z5bcyy'
                
  //             }
  //           }
  //         }
  //       }
  //     },
  //   },
  //   {
  //     amount: 0.08,
  //     date: DateTime.fromISO("2023-06-06").toJSDate(),
  //     Category: {
  //       connectOrCreate: {
  //           where: {
  //               name_type_custom: {
  //                   name: "Interest",
  //                   type: 'credit',
  //                   custom: fakeUser.id,
  //               }
              
  //           },
  //           create: {
  //             name: "Interest",
  //             type: "credit",
  //             User: {
  //               connect: {
  //                 id: fakeUser.id,
  //               }
  //             },
  //           },
  //         },
  //     },
  //     description: "Account Interest",
  //     BankAccount: {
  //       connect: {
  //         id: newAccountId.id,
  //       },
  //     },
  //     PayorPayee: {
  //       connectOrCreate: {
  //         where: {
  //           thirdparty_userId: {
  //             thirdparty: 'PNC Bank',
  //             userId: 'clla7inhp0000lfwo25z5bcyy',
  //           }
  //         },
  //         create: {
  //           thirdparty: 'PNC Bank',
  //           User: {
  //             connect: {

  //                 id: 'clla7inhp0000lfwo25z5bcyy'
                
  //             }
  //           }
  //         }
  //       }
  //     },
  //   },
  //   {
  //     amount: 1664.63,
  //     date: DateTime.fromISO("2023-06-09").toJSDate(),
  //     Category: {
  //       connectOrCreate: {
  //           where: {
  //               name_type_custom: {
  //                   name: "Salary",
  //                   type: 'credit',
  //                   custom: fakeUser.id,
  //               }
              
  //           },
  //           create: {
  //             name: "Salary",
  //             type: "credit",
  //             User: {
  //               connect: {
  //                 id: fakeUser.id,
  //               }
  //             },
  //           },
  //         },
  //     },
  //     description: "Paycheck",
  //     BankAccount: {
  //       connect: {
  //         id: newAccountId.id,
  //       },
  //     },
  //     PayorPayee: {
  //       connectOrCreate: {
  //         where: {
  //           thirdparty_userId: {
  //             thirdparty: 'KVC Health Systems',
  //             userId: 'clla7inhp0000lfwo25z5bcyy',
  //           }
  //         },
  //         create: {
  //           thirdparty: 'KVC Health Systems',
  //           User: {
  //             connect: {

  //                 id: 'clla7inhp0000lfwo25z5bcyy'
                
  //             }
  //           }
  //         }
  //       }
  //     },
  //   },
  // ];

  // let newTransactions = [];
  // if (newAccountId.id) {
  //   for (let i = 0; i < transactions.length; i++) {
      
  //       const newTransaction = await prisma.transaction.create({
  //         data: transactions[i]!,
  //         select: {
  //           id: true,
  //         }
  //       });
        
  //       newTransactions.push(newTransaction.id)
  //   }
  // }

  // console.log('Account made: ', newAccountId.id);
  // console.log('Transactions added: ', newTransactions);
};

seedDB();


