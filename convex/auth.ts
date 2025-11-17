import { convexAuth } from "@convex-dev/auth/server";
import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { httpRouter } from "convex/server";
import { createAccount, retrieveAccount } from "@convex-dev/auth/server";

const http = httpRouter();

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    ConvexCredentials({
      id: "credentials",
      authorize: async (credentials, ctx) => {
        const email = credentials.email as string | undefined;
        const password = credentials.password as string | undefined;

        if (!email) {
          throw new Error("Email is required");
        }

        if (!password) {
          throw new Error("Password is required");
        }

        // Try to retrieve existing account
        try {
          const account = await retrieveAccount(ctx, {
            provider: "credentials",
            account: {
              id: email,
              secret: password,
            },
          });

          // If account exists and password is valid, return userId
          return { userId: account.user._id };
        } catch (error: any) {
          // If account doesn't exist (InvalidAccountId), create a new one
          if (error.message === "InvalidAccountId") {
            const result = await createAccount(ctx, {
              provider: "credentials",
              account: {
                id: email,
                secret: password, // In production, hash this!
              },
              profile: {
                email,
              },
            });

            if (result) {
              return { userId: result.user._id };
            }
          }

          // Handle other error cases
          if (error.message === "InvalidSecret") {
            throw new Error("Invalid password");
          }
          if (error.message === "TooManyFailedAttempts") {
            throw new Error("Too many failed attempts. Please try again later.");
          }

          // Re-throw the error if it's not InvalidAccountId
          throw error;
        }
      },
    }),
  ],
});

auth.addHttpRoutes(http);

export default http;

