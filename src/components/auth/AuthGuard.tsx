import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  onAuthCheck?: () => Promise<void> | void; (optional)
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  return <>{children}</>;
};

export default AuthGuard;