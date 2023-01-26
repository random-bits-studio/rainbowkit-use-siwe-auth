# UseSIWE + RainbowKit = ❤️

This package is a [RainbowKit](https://www.rainbowkit.com) authentication
adapter for [UseSIWE](https://github.com/random-bits-studio/use-siwe).

This is by far the easiest way to add Sign-In with Ethereum support to your
application!

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
  - [Setup RainbowKit](#setup-rainbowkit)
  - [Setup UseSIWE](#setup-usesiwe)
  - [Add the UseSIWE authentication adapter](#add-the-usesiwe-authentication-adapter)
  - [Check to see if a user is authenticated](#check-to-see-if-a-user-is-authenticated)

## Installation

To install `rainbowkit-use-siwe-auth` and it's dependencies run the following
command:

```
npm install @randombits/rainbowkit-use-siwe-auth @randombits/use-siwe @rainbow-me/rainbowkit wagmi ethers iron-session
```

## Getting Started

### Setup RainbowKit

Follow the instructions on the [RainbowKit Docs](https://www.rainbowkit.com/docs/installation)
to setup Rainbowkit in your app. In the end you should have an `_app.tsx` (if
using [Next.js](https://nextjs.org)) that looks something like this:

```
import '@/styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import type { AppProps } from 'next/app'
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const { chains, provider } = configureChains(
  [mainnet, polygon, optimism, arbitrum],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
```

If you are using `Next.js` version `13` with `app` directory, updated `layout.jsx` will look like this:

```
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import './globals.css'

const { chains, provider } = configureChains(
  [mainnet, polygon, optimism, arbitrum],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        <WagmiConfig client={wagmiClient}>
          <RainbowKitProvider chains={chains}>
            {children}
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  )
}
```

...and you should have added a `<ConnectButton />` somewhere in your application.

### Setup UseSIWE

Follow the **Getting Started** instructions in the
[UseSIWE Docs](https://github.com/random-bits-studio/use-siwe#getting-started)
for configuring Iron Session, Setting up the API routes, and wrapping your app
with `<SiweProvider>`.

Once completed, your application tree should now contain the following:

```
my-project
├── lib
│   └── ironOptions.ts <----
├── package.json
├── pages
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── api
│   │   ├── auth
│   │   │   └── [[...route]].ts <----
│   │   └── hello.ts
│   └── index.tsx
├── public
└── styles
```

...and the providers wrapping your application should look like this:

```
export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <SiweProvider>
        <RainbowKitProvider chains={chains}>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </SiweProvider>
    </WagmiConfig>
  );
}
```

### Add the UseSIWE authentication adapter

One more provider and this pyramid is complete! Add the
`RainbowKitUseSiweProvider` inside of the `SiweProvider` so that it contains
the `RainbowKitProvider`. Example below:

```
import RainbowKitUseSiweProvider from '@randombits/rainbowkit-use-siwe-auth';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <SiweProvider>
        <RainbowKitUseSiweProvider>
          <RainbowKitProvider chains={chains}>
            <Component {...pageProps} />
          </RainbowKitProvider>
        </RainbowKitUseSiweProvider>
      </SiweProvider>
    </WagmiConfig>
  );
}
```

**Technically thats it!** Now when you run your app and click on the
`ConnectButton` and connect a wallet, a second modal will pop up asking you to
sign a message to complete the SIWE flow.

To learn how to check if a user is authenticated, read on!

### Check to see if a user is authenticated

#### Client-side

Check to see is a user is authenticated with the `useSession` hook from
[UseSiwe](https://github.com/random-bits-studio/use-siwe) like in the example
below:

```
import { useSession } from "@randombits/use-siwe";

export const AuthCheck = () => {
  const { isLoading, authenticated, address } = useSession();

  if (isLoading) return <p>Loading...</p>;
  if (!authenticated) return <p>Not authenticated</p>;
  return <p>{address} is Authenticated</p>;
};
```

#### Server-side

For API routes, wrap your API handler with `withIronSessionApiRoute` and check
to see if `req.session.address` is set. If a user is authenticated,
`req.session.address` will be set to their address, otherwise it will be
`undefined`.

```
import ironOptions from '@/lib/ironOptions'
import { withIronSessionApiRoute } from 'iron-session/next/dist'
import type { NextApiHandler } from 'next'

const handler: NextApiHandler = (req, res) => {
  if (!req.session.address) return res.status(401).send("Unauthorized");
  res.status(200).send(`Hello, ${req.session.address}!`);
}

export default withIronSessionApiRoute(handler, ironOptions);
```

### Taking action on Sign-In and Sign-Out

The `RainbowKitUseSiweProvider` component takes two optional props; `onSignIn`
and `onSignOut`. You may pass a function that will be called after a successful
sign-in or sign-out; for instance to redirect a user to a different page.

```
import RainbowKitUseSiweProvider from '@randombits/rainbowkit-use-siwe-auth';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const onSignIn = () => router.push('/dashboard');
  const onSignOut = () => router.push('/');

  return (
    <WagmiConfig client={wagmiClient}>
      <SiweProvider>
        <RainbowKitUseSiweProvider onSignIn={onSignIn} onSignOut={onSignOut}>
          <RainbowKitProvider chains={chains}>
            <Component {...pageProps} />
          </RainbowKitProvider>
        </RainbowKitUseSiweProvider>
      </SiweProvider>
    </WagmiConfig>
  );
}
```
