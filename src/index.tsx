import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
} from "@rainbow-me/rainbowkit";
import React, { PropsWithChildren } from "react";
import { createMessage, getMessageBody, signOut, useOptions, useSession, verify } from "@randombits/use-siwe";

const RainbowKitUseSiweProvider = ({ children }: PropsWithChildren) => {
  const { authenticated, nonce, isLoading } = useSession();
  const options = useOptions();

  const adapter = createAuthenticationAdapter({
    createMessage,
    getMessageBody,
    getNonce: async () => nonce,
    signOut: () => signOut(options),
    verify: (args) => verify(args, options),
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
