import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name: string;
      email: string;
      accessToken: string | undefined;
      image: string | undefined;
    };
  }

  interface User {
      name: string;
      email: string;
      accessToken: string | undefined;
      image: string | undefined;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
      name: string;
      email: string;
      accessToken: string | undefined;
      image: string | undefined;
  }
}

