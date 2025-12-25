/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { getServerSession, type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

/* ---------------------------------- */
/* Types */
/* ---------------------------------- */

type ApiUser = {
    id: string;
    email: string;
    isVerified: boolean;
    createdAt: string;
};

type LoginApiResponse = {
    success: boolean;
    data: {
        user: ApiUser;
        accessToken: string;
        refreshToken: string;
    };
};

type RefreshApiResponse = {
    success: boolean;
    data: {
        accessToken: string;
        refreshToken: string;
    };
};

type ExtendedToken = JWT & {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    user?: {
        id: string;
        email: string;
    };
    error?: "RefreshAccessTokenError";
};

type ExtendedSession = Session & {
    accessToken?: string;
    error?: string;
};

/* ---------------------------------- */
/* Config */
/* ---------------------------------- */

const API_BASE = process.env.API_URL!;
const ACCESS_TOKEN_LIFETIME = 14 * 60; // 14 minutes (controlled by NextAuth)

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

async function refreshAccessToken(token: ExtendedToken): Promise<ExtendedToken> {
    try {
        const { data } = await axios.post<RefreshApiResponse>(
            `${API_BASE}/api/auth/refresh`,
            { refreshToken: token.refreshToken },
            { withCredentials: true }
        );

        if (!data.success) throw new Error("Refresh failed");

        return {
            ...token,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            accessTokenExpires: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_LIFETIME,
            error: undefined,
        };
    } catch {
        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

/* ---------------------------------- */
/* NextAuth Options */
/* ---------------------------------- */

const authOptions: NextAuthOptions = {
    // Used to sign/encrypt JWT and session cookies
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 1 day
    },

    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const { data } = await axios.post<LoginApiResponse>(
                        `${API_BASE}/api/auth/login`,
                        {
                            email: credentials.email,
                            password: credentials.password,
                        },
                        { withCredentials: true }
                    );

                    if (!data?.success) return null;

                    return {
                        id: data.data.user.id,
                        email: data.data.user.email,
                        accessToken: data.data.accessToken,
                        refreshToken: data.data.refreshToken,
                    };
                } catch (error: any) {
                    // Log error for debugging
                    console.error('NextAuth authorize error:', {
                        message: error?.message,
                        code: error?.code,
                        url: `${API_BASE}/api/auth/login`,
                        response: error?.response?.data,
                    });
                    // Return null to show "Invalid email or password" to user
                    return null;
                }
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            const extendedToken = token as ExtendedToken;

            /* ---------- Initial login ---------- */
            if (user) {
                return {
                    accessToken: (user as any).accessToken,
                    refreshToken: (user as any).refreshToken,
                    accessTokenExpires:
                        Math.floor(Date.now() / 1000) + ACCESS_TOKEN_LIFETIME,
                    user: {
                        id: (user as any).id,
                        email: (user as any).email,
                    },
                };
            }

            /* ---------- Token still valid ---------- */
            if (
                extendedToken.accessTokenExpires &&
                Date.now() / 1000 < extendedToken.accessTokenExpires - 5 * 60
            ) {
                return extendedToken;
            }

            /* ---------- Token expired → refresh ---------- */
            return await refreshAccessToken(extendedToken);
        },

        async session({ session, token }) {
            const t = token as ExtendedToken;

            if (t.user) {
                session.user = {
                    ...session.user,
                    id: t.user.id,
                    email: t.user.email,
                };
            }

            (session as ExtendedSession).accessToken = t.accessToken;
            (session as ExtendedSession).error = t.error;

            return session;
        },
    },

    events: {
        async signOut({ token }) {
            try {
                await axios.post(
                    `${API_BASE}/api/auth/logout`,
                    { refreshToken: (token as ExtendedToken)?.refreshToken },
                    { withCredentials: true }
                );
            } catch {
                // ignore logout errors
            }
        },
    },

    pages: {
        signIn: "/login",
    },
};
export default authOptions;

export type AuthOptions = typeof authOptions;
/* ---------------------------------- */
/* Server helper */
/* ---------------------------------- */

export const getAuthSession = () => getServerSession(authOptions as NextAuthOptions);
