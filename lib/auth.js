import { cookies } from "next/headers";
import { Lucia } from "lucia";
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import db from "./db";

const adapter = new BetterSqlite3Adapter(db, {
  user: "users",
  session: "sessions",
});

const lucia = new Lucia(adapter, {
  sessionCookie: {
    // this sets cookies with super long expiration
    // since Next.js doesn't allow Lucia to extend cookie expiration when rendering pages
    expires: false,
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production",
    },
  },
});

export async function createAuthSession(userId) {
  try {
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    attachSession(sessionCookie);
  } catch (error) {
    console.log(error);
  }
}

export async function verifyAuth() {
  try {
    const sessionCookie = cookies().get(lucia.sessionCookieName);

    if (!sessionCookie) return { user: null, session: null };

    const sessionID = sessionCookie.value;

    if (!sessionID) return { user: null, session: null };

    const result = await lucia.validateSession(sessionID);

    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      attachSession(sessionCookie);
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      attachSession(sessionCookie);
      return { user: null, session: null };
    }
    return result;
  } catch (error) {
    console.error("Error during session validation:", error);
    return { user: null, session: null };
  }
}

export const destroySession = async () => {
  const { session } = await verifyAuth();
  if (!session) {
    return {
      error: "Unauthorized!",
    };
  }
  await lucia.invalidateSession(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  attachSession(sessionCookie);
};

//session helper creator
const attachSession = (sessionCookie) => {
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
};
