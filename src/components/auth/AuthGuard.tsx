import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  onAuthCheck?: () => Promise<void> | void; // Callback for protected actions (optional)
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  return <>{children}</>;
};

export default AuthGuard;