/**
 * Auth domain module.
 * Registration, credentials verification, and server actions.
 */

export {
  AuthServiceError,
  authenticateUser,
  registerUser,
  type AuthUser,
} from "@/modules/auth/service";
export {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@/modules/auth/schemas";
export {
  loginAction,
  logoutAction,
  registerAction,
  type AuthFormState,
} from "@/modules/auth/actions";
