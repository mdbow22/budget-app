import { Prisma, PrismaClient } from "@prisma/client";
import { DateTime } from 'luxon';

const prisma = new PrismaClient();

const seedDB = async () => {
  const newAccountId = await prisma.bankAccount.create({
    data: {
      type: "credit",
      name: "PNC Card",
      initBalance: -4726.76,
      User: {
        connect: {
          id: "clla7inhp0000lfwo25z5bcyy",
        },
      },
    },
    select: {
      id: true,
    },
  });

  const transactions = [
    {
      amount: -225,
      date: DateTime.fromISO("2023-05-30").toJSDate(),
      Category: {
        connectOrCreate: {
            where: {
                name_type: {
                    name: "Health",
                    type: 'debit',
                }
              
            },
            create: {
              name: "Health",
              type: "debit",
            },
          },
      },
      description: "Therapy",
      BankAccount: {
        connect: {
          id: newAccountId.id,
        },
      },
      PayorPayee: {
        connectOrCreate: {
          where: {
            thirdparty_userId: {
              thirdparty: 'Tyler Rogols',
              userId: 'clla7inhp0000lfwo25z5bcyy',
            }
          },
          create: {
            thirdparty: 'Tyler Rogols',
            User: {
              connect: {

                  id: 'clla7inhp0000lfwo25z5bcyy'
                
              }
            }
          }
        }
      },
    },
    {
      amount: -7.56,
      date: DateTime.fromISO("2023-05-31").toJSDate(),
      Category: {
        connectOrCreate: {
            where: {
                name_type: {
                    name: "Hobbies",
                    type: "debit",
                }
              
            },
            create: {
              name: "Hobbies",
              type: "debit",
            },
          },
      },
      PayorPayee: {
        connectOrCreate: {
          where: {
            thirdparty_userId: {
              thirdparty: 'Railway',
              userId: 'clla7inhp0000lfwo25z5bcyy',
            }
          },
          create: {
            thirdparty: 'Railway',
            User: {
              connect: {

                  id: 'clla7inhp0000lfwo25z5bcyy'
                
              }
            }
          }
        }
      },
      description: "Railway Subscription",
      BankAccount: {
        connect: {
          id: newAccountId.id,
        },
      },
    },
    {
      amount: -21.49,
      date: DateTime.fromISO("2023-05-30").toJSDate(),
      Category: {
        connectOrCreate: {
            where: {
                name_type: {
                    name: "Streaming Service",
                    type: "debit",
                }
            },
            create: {
              name: "Streaming Service",
              type: "debit",
            },
          },
      },
      description: "Hulu bill",
      BankAccount: {
        connect: {
          id: newAccountId.id,
        },
      },
      PayorPayee: {
        connectOrCreate: {
          where: {
            thirdparty_userId: {
              thirdparty: 'Hulu',
              userId: 'clla7inhp0000lfwo25z5bcyy',
            }
          },
          create: {
            thirdparty: 'Hulu',
            User: {
              connect: {

                  id: 'clla7inhp0000lfwo25z5bcyy'
                
              }
            }
          }
        }
      },
    },
    {
      amount: 4726.76,
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
      isTransfer: true,
    },
    {
      amount: -5.25,
      date: DateTime.fromISO("2023-06-01").toJSDate(),
      Category: {
        connectOrCreate: {
          where: {
            name_type: {
                name: "Car",
                type: "debit",
            }
          },
          create: {
            name: "Car",
            type: "debit",
          },
        },
      },
      description: "Downtown Parking",
      BankAccount: {
        connect: {
          id: newAccountId.id,
        },
      },
      PayorPayee: {
        connectOrCreate: {
          where: {
            thirdparty_userId: {
              thirdparty: 'ParkWhiz',
              userId: 'clla7inhp0000lfwo25z5bcyy',
            }
          },
          create: {
            thirdparty: 'ParkWhiz',
            User: {
              connect: {
                  id: 'clla7inhp0000lfwo25z5bcyy'
              }
            }
          }
        }
      },
    },
    {
      amount: -224.50,
      date: DateTime.fromISO("2023-06-01").toJSDate(),
      Category: {
        connectOrCreate: {
          where: {
            name_type: {
                name: "Groceries",
                type: "debit",
            }
          },
          create: {
            name: "Groceries",
            type: "debit",
          },
        },
      },
      description: "Weekly Groceries",
      BankAccount: {
        connect: {
          id: newAccountId.id,
        },
      },
      PayorPayee: {
        connectOrCreate: {
          where: {
            thirdparty_userId: {
              thirdparty: 'Kroger',
              userId: 'clla7inhp0000lfwo25z5bcyy',
            }
          },
          create: {
            thirdparty: 'Kroger',
            User: {
              connect: {
                  id: 'clla7inhp0000lfwo25z5bcyy'
              }
            }
          }
        }
      },
    },
    {
      amount: -31.65,
      date: DateTime.fromISO("2023-06-01").toJSDate(),
      Category: {
        connectOrCreate: {
          where: {
            name_type: {
                name: "Household",
                type: "debit",
            }
          },
          create: {
            name: "Household",
            type: "debit",
          },
        },
      },
      description: "Pull-ups",
      BankAccount: {
        connect: {
          id: newAccountId.id,
        },
      },
      PayorPayee: {
        connectOrCreate: {
          where: {
            thirdparty_userId: {
              thirdparty: 'Target',
              userId: 'clla7inhp0000lfwo25z5bcyy',
            }
          },
          create: {
            thirdparty: 'Target',
            User: {
              connect: {
                  id: 'clla7inhp0000lfwo25z5bcyy'
              }
            }
          }
        }
      },
    },
    {
      amount: -1000,
      date: DateTime.fromISO("2023-06-01").toJSDate(),
      Category: {
        connectOrCreate: {
          where: {
            name_type: {
                name: "Divorce",
                type: "debit",
            },
            custom: "clla7inhp0000lfwo25z5bcyy",
          },
          create: {
            name: "Divorce",
            type: "debit",
            User: {
              connect: {
                id: "clla7inhp0000lfwo25z5bcyy",
              }
            }
          },
        },
      },
      description: "Retainer Replenishment",
      BankAccount: {
        connect: {
          id: newAccountId.id,
        },
      },
      PayorPayee: {
        connectOrCreate: {
          where: {
            thirdparty_userId: {
              thirdparty: 'Zeurcher Lawfirm',
              userId: 'clla7inhp0000lfwo25z5bcyy',
            }
          },
          create: {
            thirdparty: 'Zeurcher Lawfirm',
            User: {
              connect: {
                  id: 'clla7inhp0000lfwo25z5bcyy'
              }
            }
          }
        }
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


