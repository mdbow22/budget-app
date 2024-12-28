export const formatCurrency = (rawBal: number) => {
    if (rawBal === 0) {
      return "$0.00";
    }

    const stringBal = Math.floor(Math.abs(rawBal)).toString();
    console.log(stringBal);
    const reversedBal = stringBal.includes(".")
      ? stringBal
          .substring(
            0,
            rawBal
              .toString()
              .split("")
              .findIndex((d) => d === ".") ?? rawBal.toString().length
          )
          .split("")
          .reverse()
      : stringBal.split("").reverse();
    const negative = rawBal < 0;
    let cents = rawBal.toString().includes(".")
      ? rawBal.toString().substring(
          rawBal
            .toString()
            .split("")
            .findIndex((e) => e === ".")
        )
      : ".00";
    
    if(cents.length < 3) {
        cents = cents + '0'
    }

    const formattedBal = reversedBal
      .map((digit, index) => {
        if ((index + 1) % 3 === 0 && reversedBal.length > 3) {
          return `,${digit}`;
        }
        return digit;
      })
      .reverse()
      .join("");

    return negative ? `($${formattedBal}${cents})` : `$${formattedBal}${cents}`;
  };