export const formatCurrency = (rawBal: number) => {
  if (rawBal === 0) {
    return "$0.00";
  }

  const stringBal = Math.abs(rawBal).toString();
  let realBal = "$0.00";
  if (Number.isInteger(rawBal)) {
    realBal =
      rawBal < 0
        ? `(\$${stringBal.toString()}.00)`
        : `\$${stringBal.toString()}.00`;
  } else if (Number.isInteger(rawBal * 10)) {
    realBal =
      rawBal < 0
        ? `(\$${stringBal.toString()}0)`
        : `\$${stringBal.toString()}0`;
  } else {
    realBal = rawBal < 0 ? "($" + stringBal + ")" : "$" + stringBal;
  }
  return realBal;
};
