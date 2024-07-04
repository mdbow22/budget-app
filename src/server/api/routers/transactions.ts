import { DateTime } from "luxon";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import z from "zod";
import type { Decimal } from '@prisma/client/runtime/library';

export type TransactionWIthAccount = {
    id: number;
    accountId: number;
    amount: Decimal;
    date: Date;
    categoryId: number | null;
    description: string | null;
    payorPayee: number | null;
    isTransfer: boolean;
    createdDate: Date;
    removedDate: Date | null;
    BankAccount: {
      id: number;
      name: string;
      userId: string;
      type: string;
      initBalance: Decimal;
      currBalance: Decimal;
      createdDate: Date;
      expireDate: Date | null;
    }
}

export const transactionsRouter = createTRPCRouter({
  getRecentTransactions: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const userTransactions = await ctx.prisma.transaction.findMany({
      skip: 0,
      take: 10,
      where: {
        BankAccount: {
          userId: userId,
        },
        removedDate: null,
      },
      include: {
        BankAccount: {
          select: {
            name: true,
          },
        },
        Category: {
          select: {
            name: true,
          },
        },
        PayorPayee: {
          select: {
            thirdparty: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return userTransactions.map((transaction) => ({
      id: transaction.id,
      accountId: transaction.accountId,
      accountName: transaction.BankAccount.name,
      amount: transaction.amount.toNumber(),
      date: transaction.date,
      categoryId: transaction.categoryId,
      category: transaction.Category?.name,
      thirdParty: transaction.PayorPayee?.thirdparty,
      description: transaction.description,
      createdDate: transaction.createdDate,
      isTransfer: transaction.isTransfer,
    }));
  }),
  getAccountTransactions: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
        cursor: z.number(),
        perPage: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      //make sure user owns account
      const accountOwner = await ctx.prisma.bankAccount.findFirst({
        where: {
          id: input.accountId,
          userId: userId,
        },
        select: {
          id: true,
          name: true,
          currBalance: true,
        }
      });

      if (!accountOwner) {
        throw new Error("Unauthorized Access to Account");
      }

      const transactions = await ctx.prisma.transaction.findMany({
        skip: input.cursor * input.perPage, //page is 0 indexed!
        take: input.perPage,
        where: {
          accountId: input.accountId,
          removedDate: null,
        },
        include: {
          PayorPayee: true,
          Category: true,
        },
        orderBy: [{
          date: 'desc',
        }, {
          createdDate: 'desc',
        }
      ]
      });

      //totalPageCount is not 0 indexed! is basically transactions.length
      const totalPageCount = await ctx.prisma.transaction.count({
        where: {
          accountId: input.accountId,
          removedDate: null,
        },
      });

      return { transactions: transactions.map(trans => ({ ...trans, amount: trans.amount.toNumber()})), accountOwner, totalPageCount: Math.ceil(totalPageCount / input.perPage), currentPage: input.cursor };
    }),
  insertTransaction: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
        amount: z.number(),
        date: z.date(),
        category: z.object({
          name: z.string(),
          categoryId: z.number().optional(),
        }),
        thirdParty: z.string(),
        description: z.string(),
        isTransfer: z.boolean(),
        accountId2: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const categoryWhere = input.category.categoryId
        ? {
            connect: {
              id: input.category.categoryId,
            },
          }
        : {
            create: {
              name: input.category.name,
              type: input.isTransfer ? "trans" : input.amount > 0 ? "credit" : "debit",
              User: {
                connect: {
                  id: userId,
                },
              },
            },
          };

      const payorPayeeWhere = input.isTransfer
        ? undefined
        : {
            connectOrCreate: {
              where: {
                thirdparty_userId: {
                  userId: userId,
                  thirdparty: input.thirdParty,
                },
              },
              create: {
                thirdparty: input.thirdParty,
                User: {
                  connect: {
                    id: userId,
                  },
                },
              },
            },
          };

      //get current account balance so it can be updated
      const accountBal = await ctx.prisma.bankAccount.findUnique({
        where: {
          id: input.accountId,
        },
        select: {
          currBalance: true,
        },
      });

      const newTransaction = await ctx.prisma.bankAccount.update({
        where: {
          id: input.accountId,
        },
        data: {
          currBalance: accountBal ? accountBal.currBalance.toNumber() + input.amount : input.amount,
          transactions: {
            create: {
              amount: input.amount,
              description: input.description,
              isTransfer: input.isTransfer ?? false,
              date: input.date,
              PayorPayee: payorPayeeWhere,
              Category: categoryWhere,
            }
          }
        },
        select: {
          transactions: true,
          currBalance: true,
        }
      });

      newTransaction.transactions.sort((a, b) => DateTime.fromJSDate(a.createdDate) > DateTime.fromJSDate(b.createdDate) ? -1 : 1);

      const transactionCategory = newTransaction.transactions[0]?.categoryId;
      const transactionPayorPayee = newTransaction.transactions[0]?.payorPayee;

      if (input.isTransfer) {
        const accountBal2 = await ctx.prisma.bankAccount.findUnique({
          where: {
            id: input.accountId2,
          },
          select: {
            currBalance: true,
          },
        });

        const secondTrans = await ctx.prisma.bankAccount.update({
          where: {
            id: input.accountId2,
          },
          data: {
            currBalance: accountBal2
              ? accountBal2.currBalance.toNumber() + Math.abs(input.amount)
              : Math.abs(input.amount),
            transactions: {
              create: {
                amount: Math.abs(input.amount),
                payorPayee: transactionPayorPayee,
                categoryId: transactionCategory ?? undefined,
                date: input.date,
                isTransfer: input.isTransfer,
                description: input.description,
              },
            },
          },
        });
      }

      return newTransaction.transactions[0];
    }),
    deleteTransaction: protectedProcedure.input(z.object({
      trans: z.object({
        id: z.number(),
        amount: z.number(),
        isTransfer: z.boolean(),
        date: z.date(),
      }),
      account: z.number(),
    })).mutation(async ({ ctx, input }) => {
      const { trans, account } = input;
      try {
        const accountToUpdate = await ctx.prisma.bankAccount.findUnique({
          where: {
            id: account,
          }
        });
  
        if(!accountToUpdate) {
          throw new Error('cannot find the account attached to transaction');
        }
  
        let otherTransToUpdate: TransactionWIthAccount | null = null;
        if(trans.isTransfer) {
          otherTransToUpdate = await ctx.prisma.transaction.findFirst({
            where: {
              isTransfer: true,
              amount: trans.amount * -1,
              date: trans.date,
              BankAccount: {
                userId: ctx.session.user.id,
              },
              removedDate: null,
            },
            include: {
              BankAccount: true,
            }
          });
  
          if(!otherTransToUpdate) {
            throw new Error('cannot find associated transaction with this transfer')
          }
        }
  
        const deletedTransaction = await ctx.prisma.transaction.update({
          where: {
            id: trans.id,
          },
          data: {
            removedDate: DateTime.now().toJSDate(),
          }
        });
  
        await ctx.prisma.bankAccount.update({
          where: {
            id: account,
          },
          data: {
            currBalance: accountToUpdate.currBalance.toNumber() - trans.amount,
          }
        })

        if(otherTransToUpdate) {
          await ctx.prisma.transaction.update({
            where: {
              id: otherTransToUpdate.id,
            },
            data: {
              removedDate: DateTime.now().toJSDate(),
            }
          })

          await ctx.prisma.bankAccount.update({
            where: {
              id: otherTransToUpdate.BankAccount.id,
            },
            data: {
              currBalance: otherTransToUpdate.BankAccount.currBalance.toNumber() + trans.amount,
            }
          })
        }

        return ({ deletedTransaction })
      } catch (err) {
        console.error(err);
      }
    }),
    editTransaction: protectedProcedure
      .input(z.object({
        id: z.number(),
        amount: z.number(),
        description: z.string(),
        date: z.date(),
        category: z.object({
          id: z.number().optional(),
          name: z.string().optional(),
        }),
        payorPayee: z.object({
          id: z.number().optional(),
          thirdParty: z.string().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {

        const data: {
          amount: number;
          description: string;
          date: Date;
          Category?: any;
          PayorPayee?: any;
        } = {
          amount: input.amount,
          description: input.description,
          date: input.date,
        }

        const origTrans = await ctx.prisma.transaction.findUnique({
          where: {
            id: input.id,
          },
          select: {
            id: true,
            amount: true,
            accountId: true,
            Category: {
              select: {
                name: true,
                id: true,
              }
            },
            PayorPayee: {
              select: {
                thirdparty: true,
                id: true,
              }
            }
          }
        })
        //connect transaction to correct category
        if(origTrans && input.category.id) {
          data.Category = input.category.id !== origTrans.Category?.id ? {
              connect: {
                id: input.category.id,
              }
          } : undefined;
        } else if (!input.category.id) {
          data.Category = {
            create: {
              name: input.category.name,
              type: input.amount > 0 ? "credit" : "debit",
              User: {
                connect: {
                  id: ctx.session.user.id,
                },
              },
            }
          }
        }

        //connect transaction to correct payorPayee
        if(origTrans && (input.payorPayee.id !== origTrans.PayorPayee?.id || !input.payorPayee.id)) {
          data.PayorPayee = {
            connectOrCreate: {
              where: input.payorPayee.id ? {
                id: input.payorPayee.id,
              } : {
                thirdparty_userId: {
                  userId: ctx.session.user.id,
                  thirdparty: input.payorPayee.thirdParty,
                },
              },
              create: {
                thirdparty: input.payorPayee.thirdParty,
                User: {
                  connect: {
                    id: ctx.session.user.id,
                  },
                },
              },
            },
          }
        }

        const updatedTrans = await ctx.prisma.transaction.update({
          where: {
            id: input.id,
          },
          data,
        })

        if(origTrans && input.amount !== origTrans.amount.toNumber()) {

          const difference = input.amount - origTrans.amount.toNumber();

          const currBal = await ctx.prisma.bankAccount.findUnique({
            where: {
              id: origTrans.accountId,
            },
            select: {
              currBalance: true,
            }
          })
          if(currBal) {
            const updatedAccountInfo = await ctx.prisma.bankAccount.update({
              where: {
                id: origTrans.accountId,
              },
              data: {
                currBalance: currBal.currBalance.toNumber() + difference,
              }
            })

            return ({ updatedTrans, updatedAccountInfo })
          }
          
        }

        return ({ updatedTrans });
      })
});
