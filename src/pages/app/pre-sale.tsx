import React from "react";
import ReactGA from "react-ga";

import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  approveFenixContract,
  getPresaleInfo,
  getRedeemInfo,
  purchaseFenix,
  swapFenix,
} from "web3-functions";
import { useFenix, useRedeem, useIrisToken } from "hooks/contracts";
import { blockToTimestamp, displayCurrency } from "libs/utils";
import { useCurrentBlockNumber } from "hooks/wallet";
import { useActiveWeb3React } from "wallet";

import { AppLayout } from "components/layout";
import { BuyMaticModal } from "components/modals/buy-matic-modal";
import { SwapFenixModal } from "components/modals/swap-fenix-modal";
import { UnlockButton } from "components/wallet/unlock-wallet";

import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Link,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useTimer } from "hooks/timer";

const PresaleCard = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const toast = useToast();

  const queryClient = useQueryClient();
  const fenixContract = useFenix();
  const currentBlock = useCurrentBlockNumber();
  const { account } = useActiveWeb3React();

  const presaleInfo = useQuery(["presale-info", currentBlock], async () => {
    return getPresaleInfo(fenixContract, currentBlock);
  });

  const purchaseFenixMutation = useMutation(
    (amount: string) => purchaseFenix(fenixContract, amount),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries("presale-info");
        await queryClient.invalidateQueries(["tokenBalance", account, fenixContract.address]);
        onClose();
      },

      onError: ({ data, message }) => {
        toast({
          status: "error",
          position: "top-right",
          title: "Error purchasing FENIX",
          description: data?.message || message,
          isClosable: true,
        });
        onClose();
      },
    }
  );

  const timeToStartPresale = presaleInfo.data?.presaleStartBlock.sub(currentBlock || 0).toNumber();
  const timeToEndPresale = presaleInfo.data?.presaleEndBlock.sub(currentBlock || 0).toNumber();

  const presaleStartTimer = useTimer(blockToTimestamp(timeToStartPresale || 0));
  const presaleEndsTimer = useTimer(blockToTimestamp(timeToEndPresale || 0));

  return (
    <>
      <Stack
        h="100%"
        justify="space-between"
        px={8}
        py={8}
        spacing={6}
        boxShadow="lg"
        rounded="3xl"
        bg="accent.500"
        color="white"
      >
        <Box>
          {/* pool name */}
          <HStack mb={6}>
            <Heading>Fenix pre-sale contract</Heading>
          </HStack>

          {/* pool details */}
          <Stack mb={6}>
            <Stack direction="row" justify="space-between">
              <Text fontWeight="600" fontSize="sm">
                Fenix remaining
              </Text>

              <Skeleton isLoaded={!!presaleInfo.data?.fenixRemaining}>
                <Text fontWeight="700" fontSize="sm">
                  {displayCurrency(presaleInfo.data?.fenixRemaining, true)}
                </Text>
              </Skeleton>
            </Stack>

            <Stack direction="row" justify="space-between">
              <Text fontWeight="600" fontSize="sm">
                FENIX/MATIC Ratio
              </Text>

              <Skeleton isLoaded={!!presaleInfo.data?.fenixPrice}>
                <Text fontWeight="700" fontSize="sm">
                  {displayCurrency(presaleInfo.data?.fenixPrice, true)} : 1
                </Text>
              </Skeleton>
            </Stack>

            <Stack direction="row" justify="space-between">
              <Text fontWeight="600" fontSize="sm">
                Max Fenix available
              </Text>

              <Skeleton isLoaded={!!presaleInfo.data?.maxFenix}>
                <Text fontWeight="700" fontSize="sm">
                  {displayCurrency(presaleInfo.data?.maxFenix, true)}
                </Text>
              </Skeleton>
            </Stack>

            <Stack direction="row" justify="space-between">
              <Text fontWeight="600" fontSize="sm">
                Max Fenix to be purchased
              </Text>
              <Skeleton isLoaded={!!presaleInfo.data?.maxFenixToPurchase}>
                <Text fontWeight="700" fontSize="sm">
                  {displayCurrency(presaleInfo.data?.maxFenixToPurchase, true)}
                </Text>
              </Skeleton>
            </Stack>

            <Stack direction="row" justify="space-between">
              <Text fontWeight="600" fontSize="sm">
                Presale starts
              </Text>
              <Skeleton isLoaded={!!presaleInfo.data}>
                <Text fontWeight="700" fontSize="sm">
                  {presaleStartTimer || `Block ${presaleInfo.data?.presaleStartBlock.toNumber()}`}
                </Text>
              </Skeleton>
            </Stack>

            <Stack direction="row" justify="space-between">
              <Text fontWeight="600" fontSize="sm">
                Presale ends
              </Text>
              <Skeleton isLoaded={!!presaleInfo.data}>
                <Text fontWeight="700" fontSize="sm">
                  {presaleEndsTimer || `Block ${presaleInfo.data?.presaleEndBlock.toNumber()}`}
                </Text>
              </Skeleton>
            </Stack>
          </Stack>
        </Box>

        {/* actions */}
        <Stack mt="auto" mb={8}>
          <Button
            isFullWidth
            onClick={onOpen}
            isDisabled={
              presaleInfo.data?.presaleStartBlock > 0 || presaleInfo.data?.presaleEndBlock < 0
            }
            bg="gray.700"
            size="lg"
            fontSize="md"
            _hover={{ bg: "gray.600" }}
          >
            Buy FENIX with MATIC
          </Button>
        </Stack>
      </Stack>

      <BuyMaticModal
        isOpen={isOpen}
        onClose={onClose}
        isLoading={purchaseFenixMutation.isLoading}
        onPurchase={purchaseFenixMutation.mutateAsync}
      />
    </>
  );
};

const RedeemCard = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const toast = useToast();

  const queryClient = useQueryClient();
  const { account } = useActiveWeb3React();
  const currentBlock = useCurrentBlockNumber();
  const redeemContract = useRedeem();
  const fenixContract = useFenix();
  const irisContract = useIrisToken();

  const redeemInfo = useQuery(["redeem-info", currentBlock], async () => {
    return getRedeemInfo(redeemContract, fenixContract, irisContract, currentBlock, account);
  });

  const approveMutation = useMutation(
    async () => {
      if (!account) throw new Error("No connected account");
      await approveFenixContract(fenixContract);
    },

    {
      onSuccess: () => {
        queryClient.invalidateQueries("redeem-info");
        queryClient.invalidateQueries("presale-info");

        ReactGA.event({
          category: "Approval",
          action: `Approving FENIX`,
          label: "FENIX",
        });
      },

      onError: ({ data, message }) => {
        console.error(`[approveFenix][error] general error `, {
          data,
        });

        toast({
          title: "Error approving token",
          description: data?.message || message,
          status: "error",
          position: "top-right",
          isClosable: true,
        });
      },
    }
  );

  const swapFenixMutation = useMutation((amount: string) => swapFenix(redeemContract, amount), {
    onSuccess: async (_, amount) => {
      await queryClient.invalidateQueries(["tokenBalance", account, fenixContract.address]);

      ReactGA.event({
        category: "Pre-Sale",
        action: `Swap Fenix for IRIS`,
        value: parseInt(amount, 10),
      });

      onClose();
    },

    onError: ({ data, message }) => {
      toast({
        status: "error",
        position: "top-right",
        title: "Error swapping FENIX",
        description: data?.message || message,
        isClosable: true,
      });
    },
  });

  const redeemTimer = useTimer(blockToTimestamp(redeemInfo.data?.blockToRedeem || 0));

  return (
    <>
      <Stack
        h="100%"
        justify="space-between"
        px={8}
        py={8}
        spacing={6}
        boxShadow="lg"
        rounded="3xl"
        bg="accent.500"
        color="white"
      >
        <Box>
          <HStack mb={6}>
            <Heading>Redeem IRIS</Heading>
          </HStack>

          {/* pool details */}
          <Stack>
            <Stack direction="row" justify="space-between">
              <Text fontWeight="600" fontSize="sm">
                Iris Balance
              </Text>
              <Skeleton isLoaded={!!redeemInfo.data}>
                <Text fontWeight="700" fontSize="sm">
                  {displayCurrency(redeemInfo.data?.redeemBalance, true)} IRIS
                </Text>
              </Skeleton>
            </Stack>

            <Stack direction="row" justify="space-between">
              <Text fontWeight="600" fontSize="sm">
                Rate (FENIX:IRIS)
              </Text>
              <Text fontWeight="700" fontSize="sm">
                1 : 1
              </Text>
            </Stack>

            <Stack direction="row" justify="space-between">
              <Text fontWeight="600" fontSize="sm">
                Redeem starts
              </Text>
              <Skeleton isLoaded={redeemTimer}>
                <Text fontWeight="700" fontSize="sm">
                  {redeemTimer}
                </Text>
              </Skeleton>
            </Stack>
          </Stack>
        </Box>

        {/* actions */}
        <Stack justifySelf="flex-end">
          {!account ? (
            <UnlockButton />
          ) : !redeemInfo.data?.hasApprovedPool ? (
            <Button
              isFullWidth
              isLoading={approveMutation.isLoading}
              onClick={() => approveMutation.mutate()}
              size="lg"
              fontSize="md"
              bg="gray.700"
              _hover={{ bg: "gray.600" }}
            >
              Approve
            </Button>
          ) : (
            <Button
              isFullWidth
              onClick={onOpen}
              isDisabled={redeemInfo.data?.blockToRedeem > 0}
              size="lg"
              fontSize="md"
              bg="gray.700"
              _hover={{ bg: "gray.600" }}
            >
              Swap FENIX for IRIS
            </Button>
          )}
        </Stack>
      </Stack>

      <SwapFenixModal
        isLoading={swapFenixMutation.isLoading}
        onSwap={swapFenixMutation.mutateAsync}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  );
};

const Page: React.FC = () => {
  return (
    <AppLayout>
      <Stack align="center" spacing={10} py={10}>
        <Container align="center" maxWidth="container.lg">
          <Stack mb={7} spacing={5}>
            <Heading fontSize="3xl">Hermes Timeline</Heading>

            <Stack>
              <Text fontSize="sm">
                <del>1. Pre-sale starts at block #17694679</del>
              </Text>

              <Text fontSize="sm">
                <del>2. Pre-sale ends at block #17812497</del>
              </Text>

              <Text fontSize="sm">
                <del>3. Liquidity added on Quickswap at block #17891042</del>
              </Text>

              <Text fontSize="sm">4. Swap opens (swap FENIX to IRIS ) at block #17894314</Text>

              <Text fontSize="sm">5. Farming starts (Masterchef) at block #17969588</Text>
            </Stack>

            <Text fontSize="sm">
              For more details visit:{" "}
              <Link
                isExternal
                color="blue.600"
                href="https://hermes-defi.gitbook.io/hermes-finance/launch/pre-sale-fenix-2"
              >
                https://hermes-defi.gitbook.io/hermes-finance/launch/pre-sale-fenix-2
              </Link>
            </Text>

            <Text fontSize="sm">
              The volatility of the blocks in Polygon is very high. We recommend reviewing them to
              check the times.
            </Text>

            <Stack>
              <Heading fontSize="xl">How To</Heading>

              <Text fontSize="sm">
                1. Purchase FENIX with MATIC using the FENIX token Pre-sale Contract
              </Text>

              <Text fontSize="sm">
                2. Swap FENIX for IRIS using the Reedem Contract (Swap Contract)
              </Text>
            </Stack>
          </Stack>

          <Stack wrap="wrap" spacing="40px" direction="row" justify="center" alignItems="center">
            {/* <PresaleCard /> */}
            {/* <Box w="md">
              <RedeemCard />
            </Box> */}
          </Stack>
        </Container>
      </Stack>
    </AppLayout>
  );
};

export default Page;
