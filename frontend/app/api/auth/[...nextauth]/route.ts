
import NextAuth from "next-auth";

import authOptions, { type AuthOptions } from "@/lib/auth";
const handler = NextAuth(authOptions as AuthOptions);

export { handler as GET, handler as POST };


