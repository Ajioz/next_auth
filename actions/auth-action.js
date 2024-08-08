"use server";

import { createUser } from "@/lib/user";
import { hashUserPassword } from "@/lib/hash";
import { redirect } from "next/navigation";

export async function signup(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  let errors = {};

  if (!email.includes("@")) errors.email = "PLease enter a valid email";
  if (password.trim().length < 8)
    errors.password = "Min of 8 character required";
  if (Object.keys(errors).length > 0) return { errors };

  const hashPassword = hashUserPassword(password);

  try {
    createUser(email, hashPassword);
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return { errors: { email: "This email already exist" } };
    }
    throw error;
    }
    
    redirect('/training')
}
