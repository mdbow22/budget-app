import { DateTime } from "luxon";
import React from "react";
import { api } from "~/utils/api";

const SpendByCategory = () => {

    const { data: categorySpend, isLoading } = api.reports.SpendByCategory.useQuery({
        categoryId: 20,
        startDate: DateTime.now().startOf("month").toJSDate(),
        endDate: DateTime.now().endOf("month").toJSDate(),
    })

    const { data: sumOfSpend, isLoading: spendLoading } =
        api.reports.aggregateAccountSpend.useQuery(
          { pastMonths: DateTime.now().startOf("month").toISO() ??
            DateTime.now().startOf("month").toFormat("yyyy-MM-dd")},
         
        );

    //console.log(categorySpend);

  return (
    <div className="w-full p-5">
      <div className="flex gap-10">
        <h1 className="pb-5 text-2xl font-bold">Spend by Category</h1>
        {/* <select className={`select select-bordered select-sm`} onChange={(e) => setChartDate(e.target.value)}>
                {dateOptions.map((d) => {
                  return (
                    <option value={d.value ?? undefined} key={d.value}>
                      {d.label}
                    </option>
                  );
                })}
              </select> */}
      </div>
      <div className="w-full p-5">
        {/* {!isLoading && categorySpend?.map(t => {
            return (
                <div>
                    {t.description} - {t.amount.toNumber()}
                </div>
            )
        })} */}
      </div>
    </div>
  );
};

export default SpendByCategory;
