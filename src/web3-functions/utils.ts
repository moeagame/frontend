import BigNumberJS from "bignumber.js";
import { blocksPerDay, secondsPerBlock, secondsPerYear } from "config/constants";

export function compound(r, n = 365, t = 1, c = 1) {
  return (1 + (r * c) / n) ** (n * t) - 1;
}

const getFarmWithTradingFeesApy = ({
  farmApr,
  tradingApr,
  compoundingsPerYear,
  t,
  shareAfterPerformanceFee,
}) => {
  const farmApy = farmApr ? compound(farmApr, compoundingsPerYear, t, shareAfterPerformanceFee) : 0;
  const tradingApy = tradingApr ? compound(tradingApr, compoundingsPerYear, t, 1) : 0; // no fee on trading
  const finalAPY = (1 + farmApy) * (1 + tradingApy) - 1;
  return finalAPY;
};

async function getTradingFeeApr(address: string, lpFee: number, amm: string) {
  try {
    const url = {
      dfyn: "https://api.thegraph.com/subgraphs/name/ss-sonic/dfyn-v5",
      quickswap: "https://api.thegraph.com/subgraphs/name/sameepsi/quickswap06",
    };

    const resp = await fetch(url[amm], {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `{
          pairDayDatas(first: 1, orderBy: date, orderDirection: desc, where: { pairAddress: "${address}" }) {
            id
            dailyVolumeUSD
            reserveUSD
          }
        }`,
      }),
    });

    const { data } = await resp.json();
    const pairDayData = data.pairDayDatas[0];

    return new BigNumberJS(pairDayData.dailyVolumeUSD)
      .times(lpFee)
      .times(365)
      .dividedBy(pairDayData.reserveUSD);
  } catch (err) {
    console.log(err);
    return new BigNumberJS("0");
  }
}

export function getPoolApr(
  rewardTokenPrice: number,
  poolRewardsPerWeek: number,
  poolTokenPrice: number,
  totalStaked: number
) {
  const rewardPerWeekInUSD = poolRewardsPerWeek * rewardTokenPrice;
  const totalStakedInUSD = totalStaked * poolTokenPrice;
  const weeklyAPR = (rewardPerWeekInUSD / totalStakedInUSD) * 100;
  const dailyAPR = weeklyAPR / 7;
  const yearlyAPR = weeklyAPR * 52;

  return {
    weeklyAPR,
    dailyAPR,
    yearlyAPR,
  };
}

export async function getVaultApy({
  address,
  multiplier,
  tokenPerBlock,
  totalAllocPoints,
  depositFees,
  performanceFee,
  rewardToken,
  stakeToken,
  totalStakedInFarm,
}: any) {
  const BASE_HPY = 4890;
  const QUICK_LPF = 0.0025;
  const PERFORMANCE_FEE = performanceFee;
  const SHARE_AFTER_PERFORMANCE_FEE = 1 - PERFORMANCE_FEE;

  // get trading apr of farm
  const tradingFeeApr = await getTradingFeeApr(address, QUICK_LPF, "quickswap");

  // get farm apr from masterChef
  const totalStakedInUSD = new BigNumberJS(totalStakedInFarm).times(stakeToken.price);
  const poolBlockRewards = new BigNumberJS(tokenPerBlock)
    .times(multiplier)
    .dividedBy(totalAllocPoints)
    .times(1 - (depositFees ?? 0));

  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
  const yearlyRewardsInUsd = yearlyRewards
    .times(rewardToken.price)
    .dividedBy(`1e${rewardToken.decimals}`);

  const simpleApr = yearlyRewardsInUsd.dividedBy(totalStakedInUSD);

  // get the apr breakdown for farm
  const vaultApr = simpleApr.toNumber() * SHARE_AFTER_PERFORMANCE_FEE;
  const vaultApy = compound(simpleApr, BASE_HPY, 1, SHARE_AFTER_PERFORMANCE_FEE);

  // calculate total apy
  const totalApy = getFarmWithTradingFeesApy({
    farmApr: simpleApr.toNumber(),
    tradingApr: tradingFeeApr.toNumber(),
    compoundingsPerYear: BASE_HPY,
    t: 1,
    shareAfterPerformanceFee: SHARE_AFTER_PERFORMANCE_FEE,
  });

  // console.log({
  //   totalApy: totalApy,
  //   vaultApy: vaultApy,
  //   vaultApr,
  //   poolBlockRewards: poolBlockRewards.valueOf(),
  //   yearlyRewardsInUsd: yearlyRewardsInUsd.valueOf(),
  //   yearlyRewards: yearlyRewards.valueOf(),
  //   tradingFeeApr: tradingFeeApr.valueOf(),
  // });

  return {
    tradingApr: tradingFeeApr.toNumber(),
    vaultApr,
    vaultApy,
    totalApy,
  };
}

export async function getVaultDualApy({
  address,
  stakePrice,
  totalStakedInFarm,
  token0RewardRate,
  token0Price,
  token0Decimals,
  token1RewardRate,
  token1Price,
  token1Decimals,
  performanceFee,
}: any) {
  const BASE_HPY = 4890;
  const DFYN_LPF = 0.003;
  const PERFORMANCE_FEE = performanceFee;
  const SHARE_AFTER_PERFORMANCE_FEE = 1 - PERFORMANCE_FEE;

  // get trading apr of farm
  const tradingFeeApr = await getTradingFeeApr(address, DFYN_LPF, "dfyn");

  // get farm apr
  const token0yearlyRewards = new BigNumberJS(token0RewardRate)
    .times(3)
    .times(blocksPerDay)
    .times(365);
  const token0TotalRewardsInUsd = token0yearlyRewards
    .times(token0Price)
    .dividedBy(`1e${token0Decimals}`);

  const token1yearlyRewards = new BigNumberJS(token1RewardRate)
    .times(3)
    .times(blocksPerDay)
    .times(365);
  const token1TotalRewardsInUsd = token1yearlyRewards
    .times(token1Price)
    .dividedBy(`1e${token1Decimals}`);

  const totalRewardsInUsd = token0TotalRewardsInUsd.plus(token1TotalRewardsInUsd);
  const totalStakedInUsd = new BigNumberJS(totalStakedInFarm).times(stakePrice);

  const simpleApr = totalRewardsInUsd.dividedBy(totalStakedInUsd);

  // get breakdown apr
  // get the apr breakdown for farm
  const vaultApr = simpleApr.toNumber() * SHARE_AFTER_PERFORMANCE_FEE;
  const vaultApy = compound(simpleApr, BASE_HPY, 1, SHARE_AFTER_PERFORMANCE_FEE);

  // calculate total apy
  const totalApy = getFarmWithTradingFeesApy({
    farmApr: simpleApr.toNumber(),
    tradingApr: tradingFeeApr.toNumber(),
    compoundingsPerYear: BASE_HPY,
    t: 1,
    shareAfterPerformanceFee: SHARE_AFTER_PERFORMANCE_FEE,
  });

  return {
    tradingApr: tradingFeeApr.toNumber(),
    vaultApr,
    vaultApy,
    totalApy,
  };
}
