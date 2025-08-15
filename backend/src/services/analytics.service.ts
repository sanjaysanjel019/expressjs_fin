import mongoose, { PipelineStage } from "mongoose";
import { DateRangeEnum, DateRangeEnumPreset } from "../enums/date-range.enum";
import TransactionModel, {
  TransactionTypeEnum,
} from "../models/transaction.model";
import { getDateRange, calculatePercentageChange } from "../utils/helper";
import { differenceInDays, subDays, subYears } from "date-fns";
import { convertToDollarsUnit } from "../utils/format-currency";

// export const summaryAnalyticsService = async (
//   userId: string,
//   preset: DateRangeEnumPreset,
//   customFrom: Date | undefined,
//   customTo: Date | undefined
// ) => {
//   const dateRange = getDateRange(preset, customFrom, customTo);
//   const { from, to, value: rangeValue } = dateRange;

//   console.log("From", from, "To", to, "Value", rangeValue, "Preset", preset);

//   const currentPeriodPipeline: PipelineStage[] = [
//     {
//       $match: {
//         userId: new mongoose.Types.ObjectId(userId),
//         ...(from &&
//           to && {
//             date: {
//               $gte: from,
//               $lte: to,
//             },
//           }),
//       },
//     },
//     // {
//     //   $group: {
//     //     _id: null,
//     //     totalIncome: {
//     //       $sum: {
//     //         $cond: [
//     //           { $eq: ["$type", TransactionTypeEnum.INCOME] },
//     //           { $abs: "$amount" },
//     //           0,
//     //         ],
//     //       },
//     //     },
//     //     totalExpenses: {
//     //       $sum: {
//     //         $cond: [
//     //           { $eq: ["$type", TransactionTypeEnum.EXPENSE] },
//     //           { $abs: "$amount" },
//     //           0,
//     //         ],
//     //       },
//     //     },

//     //     transactionCount: { $sum: 1 },
//     //   },
//     // },
//     // {
//     //   $project: {
//     //     _id: 0,
//     //     totalIncome: 1,
//     //     totalExpenses: 1,
//     //     transactionCount: 1,

//     //     availableBalance: { $subtract: ["$totalIncome", "$totalExpenses"] },

//     //     savingData: {
//     //       $let: {
//     //         vars: {
//     //           income: { $ifNull: ["$totalIncome", 0] },
//     //           expenses: { $ifNull: ["$totalExpenses", 0] },
//     //         },
//     //         in: {
//     //           // ((income - expenses) / income) * 100;
//     //           savingsPercentage: {
//     //             $cond: [
//     //               { $lte: ["$$income", 0] },
//     //               0,
//     //               {
//     //                 $multiply: [
//     //                   {
//     //                     $divide: [
//     //                       { $subtract: ["$$income", "$$expenses"] },
//     //                       "$$income",
//     //                     ],
//     //                   },
//     //                   100,
//     //                 ],
//     //               },
//     //             ],
//     //           },

//     //           //Expense Ratio = (expenses / income) * 100
//     //           expenseRatio: {
//     //             $cond: [
//     //               { $lte: ["$$income", 0] },
//     //               0,
//     //               {
//     //                 $multiply: [
//     //                   {
//     //                     $divide: ["$$expenses", "$$income"],
//     //                   },
//     //                   100,
//     //                 ],
//     //               },
//     //             ],
//     //           },
//     //         },
//     //       },
//     //     },
//     //   },
//     // },
//   ];
//   const [current] = await TransactionModel.aggregate(currentPeriodPipeline);

//   console.log(current, "Current Data 💥💥");
//   const {
//     totalIncome = 0,
//     totalExpenses = 0,
//     availableBalance = 0,
//     transactionCount = 0,
//     savingData = {
//       expenseRatio: 0,
//       savingsPercentage: 0,
//     },
//   } = current || {};

//   let percentageChange: any = {
//     income: 0,
//     expenses: 0,
//     balance: 0,
//     previousPeriodFrom: null,
//     previousPeriodTo: null,
//     previousValues: {
//       incomeAmount: 0,
//       expenseAmount: 0,
//       balanceAmount: 0,
//     },
//   };

//   if (from && to && rangeValue !== DateRangeEnum.ALL_TIME) {
//     const period = differenceInDays(to, from) + 1;
//     console.log(
//       `Difference in days(to,from)-- ${differenceInDays(to, from)}`,
//       period,
//       "period"
//     );

//     const isYearly = [
//       DateRangeEnum.LAST_YEAR,
//       DateRangeEnum.THIS_YEAR,
//     ].includes(rangeValue);

//     const prevPeriodFrom = isYearly ? subYears(from, 1) : subDays(from, period);
//     const prevPeriodTo = isYearly ? subYears(to, 1) : subDays(to, period);

  

//     const previousPeriodPipeline = [
//       {
//         $match: {
//           userId: new mongoose.Types.ObjectId(userId),
//           ...(from &&
//             to && {
//               date: {
//                 $gte: prevPeriodFrom,
//                 $lte: prevPeriodTo,
//               },
//             }),
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalIncome: {
//             $sum: {
//               $cond: [
//                 { $eq: ["$type", TransactionTypeEnum.INCOME] },
//                 { $abs: "$amount" },
//                 0,
//               ],
//             },
//           },
//           totalExpenses: {
//             $sum: {
//               $cond: [
//                 { $eq: ["$type", TransactionTypeEnum.EXPENSE] },
//                 { $abs: "$amount" },
//                 0,
//               ],
//             },
//           },
//         },
//       },
//     ];
//     const [previous] = await TransactionModel.aggregate(previousPeriodPipeline);
//     console.log(previous, "Previous Data");

//     if (previous) {
//       const prevIncome = previous.totalIncome || 0;
//       const prevExpenses = previous.totalExpenses || 0;
//       const prevBalance = prevIncome - prevExpenses;

//       const currentIncome = totalIncome;
//       const currentExpenses = totalExpenses;
//       const currentBalance = availableBalance;
//       percentageChange = {
//         income: calculatePercentageChange(totalIncome, prevIncome),
//         expenses: calculatePercentageChange(totalExpenses, prevExpenses),
//         balance: calculatePercentageChange(prevBalance, prevExpenses),
//         previousPeriodFrom: prevPeriodFrom,
//         previousPeriodTo: prevPeriodTo,
//         previousValues: {
//           incomeAmount: prevIncome,
//           expenseAmount: prevExpenses,
//           balanceAmount: prevBalance,
//         },
//       };
//     }
//   }

//   return {
//     availableBalance: convertToDollarsUnit(availableBalance),
//     totalIncome: convertToDollarsUnit(totalIncome),
//     totalExpenses: convertToDollarsUnit(totalExpenses),
//     savingsRate: {
//       percentage: parseFloat(savingData.savingsPercentage),
//       expenseRatio: parseFloat(savingData.expenseRatio),
//     },
//     transactionCount,
//     percentageChange: {
//       ...percentageChange,
//       previousValues: {
//         incomeAmount: convertToDollarsUnit(
//           percentageChange.previousValues.incomeAmount
//         ),
//         expenseAmount: convertToDollarsUnit(
//           percentageChange.previousValues.expenseAmount
//         ),
//         balanceAmount: convertToDollarsUnit(
//           percentageChange.previousValues.balanceAmount
//         ),
//       },
//     },
//     preset:{
//       ...dateRange,
//       value : rangeValue || DateRangeEnum.ALL_TIME,
//       label:dateRange?.label || "All Time"
//     }
//   };
// };


export const chartAnalyticsService = async (
  userId: string,
  dateRangePreset?: DateRangeEnumPreset,
  customFrom?: Date,
  customTo?: Date
) => {

  const range = getDateRange(dateRangePreset, customFrom, customTo);

  const { from, to, value: rangeValue } = range;
  const filter :any = {
    userId: new mongoose.Types.ObjectId(userId),
    ...(from && to && {
      date:{
        $gte:from,
        $lte:to
      }
    })
  }

  const result = await TransactionModel.aggregate([
    {$match:filter},
    // Group the transaction by date (yyyy-mm-dd)
    {
      $group:{
        _id:{
          $dateToString:{
            format:"%Y-%m-%d",
            date:"$date"
          }
        },
        income : {
          $sum:{
            $cond:[
              {$eq:["$type",TransactionTypeEnum.INCOME]},
              {$abs:"$amount"},0
            ]
          }
        },
        expenses : {
          $sum:{
            $cond:[
              {$eq:["$type",TransactionTypeEnum.EXPENSE]},
              {$abs:"$amount"},0
            ]
          }
        },
        incomeCount:{
          $sum:{
            $cond:[
              {$eq:["$type",TransactionTypeEnum.INCOME]},1,0
            ]
          }
        },
        expensesCount:{
          $sum:{
            $cond:[
              {$eq:["$type",TransactionTypeEnum.EXPENSE]},1,0
            ]
          }
        }
      }
    },{
      $sort:{ _id:1}
    },
    {
      $project:{
        _id:0,
        date:"$_id",
        income:1,
        expenses:1,
        incomeCount:1,
        expensesCount:1,
      }
    },
    {
      $group:{
        _id:null,
        chartData:{
          $push:"$$ROOT"
        },
        totalIncomeCount:{$sum:"$incomeCount"},
        totalExpensesCount:{$sum:"$expensesCount"}
      }
    },{
      $project:{
        _id:0,
        chartData:1,
        totalIncomeCount:1,
        totalExpensesCount:1
      }
    }
  ]);

  const transformedData = (result[0]?.chartData || []).map((item:any)=>({
    date:item.date,
    income:convertToDollarsUnit(item.income),
    expenses:convertToDollarsUnit(item.expenses),
  }));

  return {
    chartData:transformedData,
    totalIncomeCount:result[0]?.totalIncomeCount || {},
    totalExpensesCount:result[0]?.totalExpensesCount || {},
  }

}

export const summaryAnalyticsService = async (
  userId: string,
  dateRangePreset?: DateRangeEnumPreset,
  customFrom?: Date,
  customTo?: Date
) => {
  const range = getDateRange(dateRangePreset, customFrom, customTo);

  const { from, to, value: rangeValue } = range;

  
  const currentPeriodPipeline: PipelineStage[] = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        ...(from &&
          to && {
            date: {
              $gte: from,
              $lte: to,
            },
          }),
      },
    },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [
              { $eq: ["$type", TransactionTypeEnum.INCOME] },
              { $abs: "$amount" },
              0,
            ],
          },
        },
        totalExpenses: {
          $sum: {
            $cond: [
              { $eq: ["$type", TransactionTypeEnum.EXPENSE] },
              { $abs: "$amount" },
              0,
            ],
          },
        },

        transactionCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        totalIncome: 1,
        totalExpenses: 1,
        transactionCount: 1,

        availableBalance: { $subtract: ["$totalIncome", "$totalExpenses"] },

        savingData: {
          $let: {
            vars: {
              income: { $ifNull: ["$totalIncome", 0] },
              expenses: { $ifNull: ["$totalExpenses", 0] },
            },
            in: {
              // ((income - expenses) / income) * 100;
              savingsPercentage: {
                $cond: [
                  { $lte: ["$$income", 0] },
                  0,
                  {
                    $multiply: [
                      {
                        $divide: [
                          { $subtract: ["$$income", "$$expenses"] },
                          "$$income",
                        ],
                      },
                      100,
                    ],
                  },
                ],
              },

              //Expense Ratio = (expenses / income) * 100
              expenseRatio: {
                $cond: [
                  { $lte: ["$$income", 0] },
                  0,
                  {
                    $multiply: [
                      {
                        $divide: ["$$expenses", "$$income"],
                      },
                      100,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    },
  ];

  const [current] = await TransactionModel.aggregate(currentPeriodPipeline);

  const {
    totalIncome = 0,
    totalExpenses = 0,
    availableBalance = 0,
    transactionCount = 0,
    savingData = {
      expenseRatio: 0,
      savingsPercentage: 0,
    },
  } = current || {};

  console.log(current, "current");

  let percentageChange: any = {
    income: 0,
    expenses: 0,
    balance: 0,
    prevPeriodFrom: null,
    prevPeriodTo: null,
    previousValues: {
      incomeAmount: 0,
      expenseAmount: 0,
      balanceAmount: 0,
    },
  };

  if (from && to && rangeValue !== DateRangeEnum.ALL_TIME) {
    //last 30 days  previous las 30 days,

    const period = differenceInDays(to, from) + 1;
    console.log(`${differenceInDays(to, from)}`, period, "period");

    const isYearly = [
      DateRangeEnum.LAST_YEAR,
      DateRangeEnum.THIS_YEAR,
    ].includes(rangeValue);

    const prevPeriodFrom = isYearly ? subYears(from, 1) : subDays(from, period);

    const prevPeriodTo = isYearly ? subYears(to, 1) : subDays(to, period);
    console.log(prevPeriodFrom, prevPeriodTo, "Prev date");

    const prevPeriodPipeline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: {
            $gte: prevPeriodFrom,
            $lte: prevPeriodTo,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [
                { $eq: ["$type", TransactionTypeEnum.INCOME] },
                { $abs: "$amount" },
                0,
              ],
            },
          },
          totalExpenses: {
            $sum: {
              $cond: [
                { $eq: ["$type", TransactionTypeEnum.EXPENSE] },
                { $abs: "$amount" },
                0,
              ],
            },
          },
        },
      },
    ];

    const [previous] = await TransactionModel.aggregate(prevPeriodPipeline);

    console.log(previous, "Prvious Data");
    if (previous) {
      const prevIncome = previous.totalIncome || 0;
      const prevExpenses = previous.totalExpenses || 0;
      const prevBalance = prevIncome - prevExpenses;

      const currentIncome = totalIncome;
      const currentExpenses = totalExpenses;
      const currentBalance = availableBalance;

      percentageChange = {
        income: calculatePercentageChange(prevIncome, currentIncome),
        expenses: calculatePercentageChange(prevExpenses, currentExpenses),
        balance: calculatePercentageChange(prevBalance, currentBalance),
        prevPeriodFrom: prevPeriodFrom,
        prevPeriodTo: prevPeriodTo,
        previousValues: {
          incomeAmount: prevIncome,
          expenseAmount: prevExpenses,
          balanceAmount: prevBalance,
        },
      };
    }
  }

  return {
    availableBalance: convertToDollarsUnit(availableBalance),
    totalIncome: convertToDollarsUnit(totalIncome),
    totalExpenses: convertToDollarsUnit(totalExpenses),
    savingRate: {
      percentage: parseFloat(savingData.savingsPercentage.toFixed(2)),
      expenseRatio: parseFloat(savingData.expenseRatio.toFixed(2)),
    },
    transactionCount,
    percentageChange: {
      ...percentageChange,
      previousValues: {
        incomeAmount: convertToDollarsUnit(
          percentageChange.previousValues.incomeAmount
        ),
        expenseAmount: convertToDollarsUnit(
          percentageChange.previousValues.expenseAmount
        ),
        balanceAmount: convertToDollarsUnit(
          percentageChange.previousValues.balanceAmount
        ),
      },
    },
    preset: {
      ...range,
      value: rangeValue || DateRangeEnum.ALL_TIME,
      label: range?.label || "All Time",
    },
  };
};