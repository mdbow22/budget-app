import React, { useMemo, useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Label, Pie, PieChart } from "recharts";
import { api } from "~/utils/api";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { TooltipProvider } from "@radix-ui/react-tooltip";

const CategorySpendPieChart: React.FC = () => {
  const [categoriesIgnored, setCategoriesIgnored] = useState<string[]>([]);
  const { data: pieChartData, isLoading: pieChartLoading } =
    api.reports.monthlyCatSpendPieChart.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });

  const totalSpend = useMemo(() => {
    return pieChartData
      ?.filter((dat) => !categoriesIgnored.includes(dat.category))
      ?.reduce((a, b) => {
        return a + b.amount;
      }, 0);
  }, [categoriesIgnored, pieChartData]);

  const pieChartConfig = pieChartData?.reduce((a, b) => {
    return { ...a, [b.category]: { label: b.category, color: b.fill } };
  }, {} as any);

  const handleShowHideCategory = (category: string) => {
    if (categoriesIgnored.includes(category)) {
      setCategoriesIgnored((prev) => prev.filter((cat) => cat !== category));
    } else {
      setCategoriesIgnored((prev) => [...prev, category]);
    }
  };

  return (
    <>
      <h2 className="text-lg font-bold">Monthly Spend by Category</h2>

      {!pieChartLoading && (
        <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
          <div className="w-full">
            <ChartContainer
              config={pieChartConfig}
              className="min-h-[300px] w-full"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Pie
                  data={pieChartData?.filter(
                    (dat) => !categoriesIgnored.includes(dat.category)
                  )}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={80}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-2xl font-bold"
                            >
                              {"$" + totalSpend?.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Total Spent
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
          <div className="grid w-full grid-cols-2 gap-2">
            <TooltipProvider>
              {pieChartData?.map((category) => {
                return (
                  <div
                    key={category.category}
                    className="flex items-center gap-2"
                  >
                    <div
                      className={`h-6 w-6 rounded border-2 border-black`}
                      style={{ backgroundColor: category.fill }}
                    />
                    <Tooltip>
                      <TooltipTrigger
                        onClick={() =>
                          handleShowHideCategory(category.category)
                        }
                        className={`${
                          categoriesIgnored.includes(category.category) &&
                          "line-through"
                        }`}
                      >
                        {category.category}
                      </TooltipTrigger>
                      <TooltipContent>
                        {"$" + category.amount.toLocaleString()}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                );
              })}
            </TooltipProvider>
          </div>
        </div>
      )}
    </>
  );
};

export default CategorySpendPieChart;
