import { convexAuth } from "@convex-dev/auth/server";
import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { httpRouter } from "convex/server";

const http = httpRouter();

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    ConvexCredentials({
      applicationID: process.env.CONVEX_AUTH_APPLICATION_ID || "default",
    }),
  ],
});

auth.addHttpRoutes(http);

export default http;

