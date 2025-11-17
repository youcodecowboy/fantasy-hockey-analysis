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

        // Try to retrieve existing account
        const account = await retrieveAccount(ctx, {
          provider: "credentials",
          account: {
            id: email,
            secret: password,
          },
        });

        if (account) {
          return { userId: account.user._id };
        }

        // Create new account if password is provided
        if (password) {
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

        throw new Error("Invalid credentials");
      },
    }),
  ],
});

auth.addHttpRoutes(http);

export default http;

