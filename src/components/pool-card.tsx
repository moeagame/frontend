import React from "react";
import {
  Box,
  HStack,
  Heading,
  Badge,
  Stack,
  Button,
  Link,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { FiUnlock } from "react-icons/fi";
import { useActiveWeb3React } from "wallet";
import { displayCurrency } from "libs/utils";
import { WalletModal } from "components/wallet/modal";
import { DepositModal } from "components/modals/deposit-modal";
import { WithdrawModal } from "components/modals/withdraw-modal";
import { PoolInfo } from "web3-functions";
import { usePoolInfo } from "hooks/pools-reducer";
import { useApprovePool, useDepositIntoPool, useHarvestRewards } from "hooks/pools";

// Pool Actions
const UnlockButton = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button isFullWidth onClick={onOpen} rightIcon={<FiUnlock />} colorScheme="primary">
        Unlock
      </Button>

      <WalletModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

const DepositButton: React.FC<any> = (props) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { state } = usePoolInfo();

  return (
    <>
      <Button onClick={onOpen} {...props} />

      <DepositModal pool={state[props.pid]} isOpen={isOpen} onClose={onClose} />
    </>
  );
};

const UnstakeButton: React.FC<any> = (props) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { state } = usePoolInfo();

  return (
    <>
      <Button onClick={onOpen} {...props} />

      <WithdrawModal pool={state[props.pid]} isOpen={isOpen} onClose={onClose} />
    </>
  );
};

const UserSection: React.FC<{ pool: PoolInfo }> = ({ pool }) => {
  const { account } = useActiveWeb3React();
  const { requestingApproval, approve } = useApprovePool();

  // use deposit as compound
  const { depositing: compounding, deposit: compound } = useDepositIntoPool();
  // use deposit as harvest
  const { depositing: harvesting, deposit: harvest } = useDepositIntoPool();

  if (!account) {
    return <UnlockButton />;
  }

  return (
    <Stack spacing={4}>
      <Box align="left">
        <Text mb={1} fontWeight="600" fontSize="sm">
          {pool.token} Stacked
        </Text>

        <Stack align="center" direction="row" justify="space-between">
          <Text fontWeight="700" fontSize="2xl">
            {displayCurrency(pool.lpStaked, true)}
          </Text>

          <Stack direction="row">
            {!pool.hasApprovedPool && (
              <Button
                size="sm"
                isLoading={requestingApproval}
                onClick={() => approve(pool.pid)}
                bg="gray.700"
                _hover={{ bg: "gray.600" }}
              >
                Approve
              </Button>
            )}

            {pool.hasApprovedPool &&
              (Number(pool.lpStaked) > 0 ? (
                <>
                  <UnstakeButton pid={pool.pid} size="sm" bg="gray.700" _hover={{ bg: "gray.600" }}>
                    -
                  </UnstakeButton>

                  <DepositButton
                    pid={pool.pid}
                    size="sm"
                    bg="primary.600"
                    _hover={{ bg: "primary.500" }}
                  >
                    +
                  </DepositButton>
                </>
              ) : (
                <DepositButton pid={pool.pid} size="sm" bg="gray.700" _hover={{ bg: "gray.600" }}>
                  stake
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
              isLoading={harvesting}
              onClick={() => harvest(pool.pid, "0")}
              size="xs"
              bg="gray.700"
              _hover={{ bg: "gray.600" }}
            >
              Harvest
            </Button>

            <Button
              isLoading={compounding}
              onClick={() => compound(pool.pid, pool.irisEarned)}
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

export const PoolCard: React.FC<{ pool: PoolInfo }> = ({ pool }) => {
  return (
    <Box px={8} py={4} boxShadow="lg" rounded="3xl" bg="accent.500" color="white">
      {/* pool name */}
      <HStack mb={5} spacing={6}>
        <Heading>{pool.token}</Heading>
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
        {/* <Badge px={2} rounded="lg" colorScheme="red">
            Community
          </Badge> */}
      </HStack>

      {/* pool details */}
      <Stack mb={6}>
        {/* 
        <Stack direction="row" justify="space-between">
          <Text fontWeight="600" fontSize="sm">
            APY
          </Text>
          <Text fontWeight="700" fontSize="sm">
            {Math.trunc(Number(pool.apy))}%
          </Text>
        </Stack>
        */}

        <Stack direction="row" justify="space-between">
          <Text fontWeight="600" fontSize="sm">
            APR
          </Text>
          <Text fontWeight="700" fontSize="sm">
            {Math.trunc(Number(pool.apr))}%
          </Text>
        </Stack>

        <Stack direction="row" justify="space-between">
          <Text fontWeight="600" fontSize="sm">
            Earn
          </Text>
          <Text fontWeight="700" fontSize="sm">
            {pool.earn}
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
            <Text fontWeight="700" fontSize="sm">
              {pool.token}
            </Text>
          </Stack>

          <Stack direction="row" justify="space-between">
            <Text fontWeight="700" fontSize="sm">
              Total Liquidity
            </Text>
            <Text fontWeight="700" fontSize="sm">
              {displayCurrency(pool.totalLiquidity, true)} {pool.token}
            </Text>
          </Stack>
        </Stack>

        <Link href="/" textDecoration="underline" fontWeight="700" fontSize="sm">
          View on Matic
        </Link>
      </Box>
    </Box>
  );
};
