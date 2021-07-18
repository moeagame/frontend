import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
  Stack,
  Text,
  Button,
  Link,
} from "@chakra-ui/react";
import { truncateAddress } from "libs/utils";
import { FiCopy } from "react-icons/fi";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useWeb3React } from "@web3-react/core";

export const AccountModal: React.FC<{ isOpen: boolean; onClose: () => void }> = (props) => {
  const { account, connector } = useWeb3React();

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} isCentered>
      <ModalOverlay />
      <ModalContent rounded="2xl">
        <ModalCloseButton />
        <ModalHeader fontSize="md">Account</ModalHeader>

        <ModalBody pb={6}>
          <Stack spacing={4} borderWidth="1px" borderColor="gray.300" px={3} py={4} rounded="xl">
            <Stack align="center" justify="space-between" direction="row">
              <Text color="gray.600" fontSize="sm">
                Connected to MetaMask
              </Text>
              <Button
                onClick={() => connector.deactivate()}
                size="xs"
                variant="outline"
                colorScheme="secondary"
              >
                Disconnect
              </Button>
            </Stack>

            <Text fontWeight="bold" fontSize="2xl">
              {truncateAddress(account, 4)}
            </Text>

            <Stack spacing={2} direction="row" align="center">
              <Button color="gray.600" leftIcon={<FiCopy />} size="sm" variant="ghost">
                Copy address
              </Button>

              <Link isExternal color="gray.600" fontSize="sm">
                <ExternalLinkIcon mx="2px" />
                View on explorer
              </Link>
            </Stack>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
