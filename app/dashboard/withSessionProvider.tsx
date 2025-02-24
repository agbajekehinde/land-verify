'use client';

import { SessionProvider } from "next-auth/react";
import React from "react";

const withSessionProvider = (Component: React.ComponentType) => {
  return function WrappedComponent(props: React.ComponentProps<typeof Component>) {
    return (
      <SessionProvider>
        <Component {...props} />
      </SessionProvider>
    );
  };
};

export default withSessionProvider;