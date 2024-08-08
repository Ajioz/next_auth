"use server";

import { createUser, getUserByEmail } from "@/lib/user";
import { hashUserPassword, verifyPassword } from "@/lib/hash";
import { redirect } from "next/navigation";
import { createAuthSession, destroySession } from "@/lib/auth";

async function signup(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  let errors = {};

  if (!email.includes("@")) errors.email = "PLease enter a valid email";
  if (password.trim().length < 8)
    errors.password = "Min of 8 character required";
  if (Object.keys(errors).length > 0) return { errors };

  const hashPassword = hashUserPassword(password);

  try {
    const id = createUser(email, hashPassword);
    await createAuthSession(id);
    redirect("/training");
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return { errors: { email: "This email already exist" } };
    }
    throw error;
  }
}

const login = async (prevState, formData) => {
  const email = formData.get("email");
  const password = formData.get("password");

  const existingUser = getUserByEmail(email);

  if (!existingUser) return { errors: { email: "This email doesn't exist" } };

  const isValidPassword = verifyPassword(existingUser.password, password);

  if (isValidPassword) return { errors: { password: "Wrong password!" } };

  try {
    await createAuthSession(existingUser.id);
    redirect("/training");
  } catch (error) {
    throw error;
  }
};


export const logout = async() => {
  await destroySession();
  redirect('/')
}


//helper server action
export const auth = async (mode, prevState, formData) => {
  if (mode === "login") return login(prevState, formData);
  return signup(prevState, formData);
};
