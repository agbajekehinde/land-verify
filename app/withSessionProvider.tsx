'use client';
import { SessionProvider } from "next-auth/react";
import React from "react";

const withSessionProvider = (Component: React.ComponentType) => {
  return function WrappedComponent(props: React.ComponentProps<typeof Component>) {
    return (
      <SessionProvider 
        refetchInterval={5 * 60}  // Refresh every 5 minutes
        refetchOnWindowFocus={true}
      >
        <Component {...props} />
      </SessionProvider>
    );
  };
};

export default withSessionProvider;