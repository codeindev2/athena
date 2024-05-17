import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      sub: string;
      name: string;
      email: string;
      accessToken: string | undefined;
      image: string | undefined;
    };
  }

  interface User {
      sub: string;
      name: string;
      email: string;
      accessToken: string | undefined;
      image: string | undefined;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
      sub: string;
      name: string;
      email: string;
      accessToken: string | undefined;
      image: string | undefined;
  }
}

