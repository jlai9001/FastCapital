export function getFundingPercent(investment) {
  if (!investment) return 0;

  const purchases = Array.isArray(investment.purchases)
    ? investment.purchases
    : [];

  const sharesSold = purchases.reduce(
    (sum, p) => sum + (Number(p?.shares_purchased) || 0),
    0
  );

  const sharesAvailable = Number(investment.shares_available) || 0;
  const totalSharesOffered = sharesSold + sharesAvailable;

  if (totalSharesOffered <= 0) return 0;

  const percent = (sharesSold / totalSharesOffered) * 100;

  return Math.max(0, Math.min(100, Math.round(percent)));
}
