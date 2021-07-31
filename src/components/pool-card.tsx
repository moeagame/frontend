import React from "react";
import BigNumber from "bignumber.js";
import { useActiveWeb3React } from "wallet";
import { displayCurrency } from "libs/utils";
import { DepositModal } from "components/modals/deposit-modal";
import { WithdrawModal } from "components/modals/withdraw-modal";
import { useApprovePool, useDepositIntoPool } from "hooks/pools-actions";
import { PoolInfo } from "config/pools";

import {
  Box,
  HStack,
  Heading,
  Badge,
  Stack,
  Button,
  Image,
  Icon,
  Link,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { AiOutlineCalculator } from "react-icons/ai";
import { UnlockButton } from "./unlock-wallet";
import { ROIModal } from "./modals/roi-modal";
import { utils } from "ethers";

// Pool Actions
const DepositButton: React.FC<any> = ({ pool, modalProps, ...props }) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen} {...props} />

      <DepositModal pool={pool} isOpen={isOpen} onClose={onClose} {...modalProps} />
    </>
  );
};

const UnstakeButton: React.FC<any> = ({ pool, ...props }) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen} {...props} />

      <WithdrawModal pool={pool} isOpen={isOpen} onClose={onClose} />
    </>
  );
};

const UserSection: React.FC<{ pool: PoolInfo }> = ({ pool }) => {
  const { account } = useActiveWeb3React();
  const approveMutation = useApprovePool();
  const compoundMutation = useDepositIntoPool();
  const harvestMutation = useDepositIntoPool();

  if (!account) {
    return <UnlockButton />;
  }

  return (
    <Stack spacing={4}>
      <Box align="left">
        <Text mb={1} fontWeight="600" fontSize="sm">
          {displayCurrency(pool.lpStaked, true)} {pool.lpToken} Stacked
        </Text>

        <Stack align="center" direction="row" justify="space-between">
          <Text fontWeight="700" fontSize="2xl">
            {displayCurrency(pool.lpStaked, true)}
          </Text>

          <Stack direction="row">
            {!pool.hasApprovedPool && (
              <Button
                size="sm"
                isLoading={approveMutation.isLoading}
                onClick={() => approveMutation.mutate(pool.pid)}
                bg="gray.700"
                boxShadow="lg"
                _hover={{ bg: "gray.600" }}
              >
                Approve
              </Button>
            )}

            {pool.hasApprovedPool &&
              (Number(pool.lpStaked) > 0 ? (
                <>
                  <UnstakeButton pool={pool} size="sm" bg="gray.700" _hover={{ bg: "gray.600" }}>
                    -
                  </UnstakeButton>

                  <DepositButton
                    pool={pool}
                    size="sm"
                    bg="primary.600"
                    _hover={{ bg: "primary.500" }}
                  >
                    +
                  </DepositButton>
                </>
              ) : (
                <DepositButton pool={pool} size="sm" bg="gray.700" _hover={{ bg: "gray.600" }}>
                  Stake
                </DepositButton>
              ))}
          </Stack>
        </Stack>
      </Box>

      <Box align="left">
        <Text mb={1} fontWeight="600" fontSize="sm">
          Iris Earned
        </Text>

        <Stack align="center" direction="row" justify="space-between">
          <Text fontWeight="700" fontSize="2xl">
            {displayCurrency(pool.irisEarned, true)}
          </Text>

          <Stack direction="row">
            <Button
              isLoading={harvestMutation.isLoading}
              onClick={() => harvestMutation.mutate({ pid: pool.pid, amount: "0" })}
              size="xs"
              bg="gray.700"
              _hover={{ bg: "gray.600" }}
            >
              Harvest
            </Button>

            <Button
              isLoading={compoundMutation.isLoading}
              onClick={() => compoundMutation.mutate({ pid: pool.pid, amount: pool.irisEarned })}
              size="xs"
              bg="gray.700"
              _hover={{ bg: "gray.600" }}
            >
              Compound
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
};

export function APRCalculator() {
  const { isOpen, onClose, onOpen } = useDisclosure();
  return (
    <>
      <Icon onClick={onOpen} mr={1} as={AiOutlineCalculator} />
      <ROIModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}

const imageMapper = {
  iris: "/hermes-logo-1.png",
  weth: "/eth-logo.png",
  wbtc: "/btc-logo.png",
  wmatic: "/matic-logo.png",
  quick: "/quickswap-logo.jpeg",
  usdc: "/usdc-logo.png",
  usdt: "/usdt-logo.png",
  dai: "/dai-logo.png",
};
export const PoolCard: React.FC<{ pool: PoolInfo }> = ({ pool }) => {
  return (
    <Box px={8} py={4} boxShadow="lg" rounded="3xl" bg="accent.500" color="white">
      {/* pool name */}
      <HStack align="center" mb={5} spacing={6}>
        <Image rounded="24px" src={imageMapper[pool.lpToken.toLowerCase()]} boxSize={12} />
        <Heading>{pool.lpToken}</Heading>
      </HStack>

      {/* pool badges */}
      <HStack mb={6} spacing={4}>
        {pool.multiplier && (
          <Badge px={2} rounded="lg" colorScheme="gray">
            {pool.multiplier}x
          </Badge>
        )}

        {!pool.depositFees && (
          <Badge px={2} rounded="lg" colorScheme="green">
            No Fees
          </Badge>
        )}
      </HStack>

      {/* pool details */}
      <Stack mb={6}>
        <Stack direction="row" justify="space-between">
          <Text fontWeight="600" fontSize="sm">
            APR
          </Text>
          <Box display="flex" alignItems="center">
            <APRCalculator />
            <Text fontWeight="700" fontSize="sm">
              {/* TODO:: price */}
              {pool.apr ? `${pool.apr}%` : "N/A"}
            </Text>
          </Box>
        </Stack>

        <Stack direction="row" justify="space-between">
          <Text fontWeight="600" fontSize="sm">
            Earn
          </Text>
          <Text fontWeight="700" fontSize="sm">
            IRIS
          </Text>
        </Stack>

        <Stack direction="row" justify="space-between">
          <Text fontWeight="600" fontSize="sm">
            Deposit Fee
          </Text>
          <Text fontWeight="700" fontSize="sm">
            {pool.depositFees}%
          </Text>
        </Stack>
      </Stack>

      <Stack mb={8}>
        <UserSection pool={pool} />
      </Stack>

      {/* pool extra details */}
      <Box align="left">
        <Heading mb={3} fontSize="xl">
          Details
        </Heading>

        <Stack mb={5}>
          <Stack direction="row" justify="space-between">
            <Text fontWeight="700" fontSize="sm">
              Deposit
            </Text>
            <Link
              href={`https://quickswap.exchange/#/swap/${pool.lpAddress}`}
              isExternal
              fontWeight="700"
              fontSize="sm"
            >
              {pool.lpToken}
            </Link>
          </Stack>

          <Stack direction="row" justify="space-between">
            <Text fontWeight="700" fontSize="sm">
              Total Liquidity
            </Text>
            <Text fontWeight="700" fontSize="sm">
              {displayCurrency(new BigNumber(pool.totalStaked).times(pool.price).toNumber())}
            </Text>
          </Stack>
        </Stack>

        <Link
          href={`https://polygonscan.com/token/${pool.lpAddress}`}
          textDecoration="underline"
          fontWeight="700"
          fontSize="sm"
        >
          View on Matic
        </Link>
      </Box>
    </Box>
  );
};
