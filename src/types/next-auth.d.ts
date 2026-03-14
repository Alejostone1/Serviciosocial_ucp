import { DefaultSession, DefaultUser } from "next-auth";
import { Rol } from "@prisma/client";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            role: Rol;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        role: Rol;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: Rol;
    }
}
