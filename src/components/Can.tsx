import { ReactNode } from "react";
import { useCan } from "../hook/useCan";

interface ICan {
  children: ReactNode;
  permissions?: string[];
  roles?: string[];
}


export function Can({ children, roles, permissions }: ICan) {
  const useCanSeeComponent = useCan({ permissions, roles });

  if (!useCanSeeComponent)
    return null;

  return (
    <>
      {children}
    </>
  )
}