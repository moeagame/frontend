import React from "react";
import {
  Badge,
  Box,
  Collapse,
  Container,
  Flex,
  Heading,
  Icon,
  IconButton,
  Image,
  Link,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
  Slide,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon, CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import { Wallet } from "components/wallet";
import { Global } from "@emotion/react";
import { NavItem, NAV_ITEMS } from "./nav-config";
import { displayCurrency } from "libs/utils";
import { useIrisPrice } from "hooks/prices";

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={Link}
        href={href ?? "#"}
        justify={"space-between"}
        align={"center"}
        _hover={{
          textDecoration: "none",
        }}
      >
        <Text fontWeight={600} color={useColorModeValue("gray.600", "gray.200")}>
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={"all .25s ease-in-out"}
            transform={isOpen ? "rotate(180deg)" : ""}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: "0!important" }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={"solid"}
          borderColor={useColorModeValue("gray.200", "gray.700")}
          align={"start"}
        >
          {children &&
            children.map((child) => (
              <Link key={child.label} py={2} href={child.href}>
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

const Navigation = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { data: irisPrice } = useIrisPrice();

  return (
    <Box>
      <Flex minH="60px" py={5} align="center">
        {/* drawer icon */}
        <Flex ml={-2} display={{ base: "flex", md: "none" }}>
          <IconButton
            onClick={onToggle}
            icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
            variant={"ghost"}
            aria-label={"Toggle Navigation"}
          />
        </Flex>

        {/* mobile logo and token price */}
        <Flex flex={1}>
          {/* logo */}
          <Stack
            display={{ base: "flex", md: "none" }}
            align="center"
            justify="center"
            direction="row"
          >
            <Image boxSize="40px" src="/hermes-logo-1.png" alt="Hermes Logo" />
            <Heading
              fontSize={{ base: "3xl", md: "4xl" }}
              color={useColorModeValue("gray.800", "white")}
            >
              Hermes
            </Heading>
          </Stack>

          {/* token price */}
          <Badge
            display={{ base: "none", md: "block" }}
            colorScheme="secondary"
            fontSize="lg"
            size="lg"
            py={2}
            px={10}
            rounded="xl"
          >
            <Skeleton isLoaded={!!irisPrice}>{displayCurrency(irisPrice as string)}</Skeleton>
          </Badge>
        </Flex>

        {/* desktop navigation */}
        <Flex flex={5} display={{ base: "none", md: "flex" }} justify="center" align="center">
          <Stack flex={1} justify="flex-end" direction={"row"} spacing={4}>
            {NAV_ITEMS.slice(0, 4).map((navItem: NavItem) => (
              <Box key={navItem.label}>
                <Popover trigger="hover" placement="bottom">
                  <PopoverTrigger>
                    <Link
                      p={2}
                      href={navItem.href ?? ""}
                      color="gray.600"
                      isExternal={navItem.isExternal}
                      _hover={{
                        textDecoration: "none",
                        color: "gray.800",
                      }}
                      {...(navItem.decorate
                        ? {
                            color: "secondary.600",
                            fontWeight: "bold",
                          }
                        : {})}
                    >
                      {navItem.label}
                      {navItem.children && <ChevronDownIcon />}
                    </Link>
                  </PopoverTrigger>

                  {navItem.children && (
                    <PopoverContent
                      w="auto"
                      border={0}
                      boxShadow="xl"
                      bg="white"
                      p={4}
                      rounded="xl"
                    >
                      <Stack>
                        {navItem.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            role={"group"}
                            display={"block"}
                            p={2}
                            rounded={"md"}
                            _hover={{ bg: useColorModeValue("primary.50", "gray.900") }}
                          >
                            <Stack direction={"row"} align={"center"}>
                              <Box>
                                <Text
                                  transition={"all .3s ease"}
                                  _groupHover={{ color: "primary.600" }}
                                  fontWeight={600}
                                  fontSize="sm"
                                >
                                  {child.label}
                                </Text>
                                <Text fontSize={"sm"}>{child.subLabel}</Text>
                              </Box>
                              <Flex
                                transition={"all .3s ease"}
                                transform={"translateX(-10px)"}
                                opacity={0}
                                _groupHover={{ opacity: "100%", transform: "translateX(0)" }}
                                justify={"flex-end"}
                                align={"center"}
                                flex={1}
                              >
                                <Icon color={"primary.500"} w={5} h={5} as={ChevronRightIcon} />
                              </Flex>
                            </Stack>
                          </Link>
                        ))}
                      </Stack>
                    </PopoverContent>
                  )}
                </Popover>
              </Box>
            ))}
          </Stack>

          {/* destop logo */}
          <Stack mx={12} align="center" justify="center" direction="row">
            <Link href="/">
              <Image boxSize="60px" src="/hermes-logo-1.png" alt="Hermes Logo" />
            </Link>
          </Stack>

          {/* second nav items */}
          <Stack flex={1} justify="flex-start" direction={"row"} spacing={4}>
            {NAV_ITEMS.slice(4, NAV_ITEMS.length).map((navItem: NavItem) => (
              <Box key={navItem.label}>
                <Popover trigger="hover" placement="bottom">
                  <PopoverTrigger>
                    <Link
                      p={2}
                      href={navItem.href ?? "#"}
                      color="gray.600"
                      isExternal={navItem.isExternal}
                      _hover={{
                        textDecoration: "none",
                        color: "gray.800",
                      }}
                      {...(navItem.decorate
                        ? {
                            color: "secondary.600",
                            fontWeight: "bold",
                          }
                        : {})}
                    >
                      {navItem.label}
                      {navItem.children && <ChevronDownIcon />}
                    </Link>
                  </PopoverTrigger>

                  {navItem.children && (
                    <PopoverContent
                      w="auto"
                      border={0}
                      boxShadow="xl"
                      bg="white"
                      p={4}
                      rounded="xl"
                    >
                      <Stack>
                        {navItem.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            role={"group"}
                            display={"block"}
                            p={2}
                            rounded={"md"}
                            _hover={{ bg: useColorModeValue("primary.50", "gray.900") }}
                          >
                            <Stack direction={"row"} align={"center"}>
                              <Box>
                                <Text
                                  transition={"all .3s ease"}
                                  _groupHover={{ color: "primary.600" }}
                                  fontWeight={600}
                                  fontSize="sm"
                                >
                                  {child.label}
                                </Text>
                                <Text fontSize={"sm"}>{child.subLabel}</Text>
                              </Box>
                              <Flex
                                transition={"all .3s ease"}
                                transform={"translateX(-10px)"}
                                opacity={0}
                                _groupHover={{ opacity: "100%", transform: "translateX(0)" }}
                                justify={"flex-end"}
                                align={"center"}
                                flex={1}
                              >
                                <Icon color={"primary.500"} w={5} h={5} as={ChevronRightIcon} />
                              </Flex>
                            </Stack>
                          </Link>
                        ))}
                      </Stack>
                    </PopoverContent>
                  )}
                </Popover>
              </Box>
            ))}
          </Stack>
        </Flex>

        {/* connect wallet */}
        <Stack ml={{ base: 4, md: 0 }} flex={1} justify={"flex-end"} direction={"row"} spacing={6}>
          <Wallet />
        </Stack>
      </Flex>

      <Modal
        motionPreset="slideInRight"
        trapFocus={false}
        size="full"
        isOpen={isOpen}
        onClose={onToggle}
      >
        <ModalOverlay />

        <ModalContent px={10} rounded="0" mb="0!important" mt="0!important">
          <ModalCloseButton />

          <Stack align="center" direction="column" spacing={5} pt={14} pb={5}>
            <Stack mx={12} align="center" justify="center" direction="row">
              <Link href="/">
                <Image boxSize="100px" src="/hermes-logo-1.png" alt="Hermes Logo" />
              </Link>
            </Stack>

            {/* token price */}
            <Badge colorScheme="secondary" fontSize="lg" size="lg" py={2} px={10} rounded="xl">
              {displayCurrency(irisPrice as string)}
            </Badge>

            <Stack
              w="full"
              bg={useColorModeValue("white", "gray.800")}
              p={4}
              display={{ md: "none" }}
            >
              {NAV_ITEMS.map((navItem) => (
                <MobileNavItem key={navItem.label} {...navItem} />
              ))}
            </Stack>
          </Stack>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const Footer = () => {
  return (
    <Slide direction="bottom" in style={{ zIndex: 10 }}>
      <Stack
        direction="row"
        align="flex-end"
        justify="flex-end"
        py={4}
        px={6}
        bg="transparent"
        shadow="md"
      >
        <Link href="https://paladinsec.co/projects/hermes-defi/">
          <Image
            w={24}
            src="https://paladinsec.co/pld/assets/audited-by-paladin-standard.svg"
            alt="Paladin Logo"
          />
        </Link>

        <Stack as={Link} href="https://rugdoc.io/project/hermes-defi/">
          <Image w={24} src="/rugdoc-kyc.png" alt="Rugdoc Logo" />
          <Image
            w={24}
            src="https://rugdoc.io/assets/2021/05/rugdoc-review-badge-for-light-bg.svg"
            alt="Rugdoc Logo"
          />
        </Stack>
      </Stack>
    </Slide>
  );
};

export const AppLayout: React.FC = ({ children }) => {
  return (
    <Box>
      <Global
        styles={{
          body: {
            background: "#F7FAFC",
          },
        }}
      />

      <Container maxW="container.xl">
        <Navigation />
        {children}
        <Box pt={14}>
          <Footer />
        </Box>
      </Container>
    </Box>
  );
};
