"use-client";
import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
} from "@rainbow-me/rainbowkit";
import React, { ReactNode } from "react";
import { createMessage, getMessageBody, signOut, useOptions, useSession, verify } from "@randombits/use-siwe";

type RainbowKitUseSiweProviderProps = {
  children?: ReactNode,
  onSignIn?: () => void,
  onSignOut?: () => void,
};

export const RainbowKitUseSiweProvider = ({ children, onSignIn, onSignOut }: RainbowKitUseSiweProviderProps) => {
  const { authenticated, nonce, isLoading, refetch } = useSession();
  const options = useOptions();

  const adapter = createAuthenticationAdapter({
    createMessage,
    getMessageBody,
    getNonce: async () => nonce,
    signOut: async () => {
      await signOut(options);
      refetch();
      if (onSignOut) onSignOut();
    },
    verify: async (args) => {
      const result = await verify(args, options);
      if (result) refetch();
      if (result && onSignIn) onSignIn();
      return result;
    },
  });

  const status = isLoading
    ? "loading"
    : authenticated
    ? "authenticated"
    : "unauthenticated";

  return (
    <RainbowKitAuthenticationProvider adapter={adapter} status={status}>
      {children}
    </RainbowKitAuthenticationProvider>
  );
};

export default RainbowKitUseSiweProvider;
