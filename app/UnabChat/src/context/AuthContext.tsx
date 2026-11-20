import { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

export type Student = {
  id_estudiante: string;
  nombre: string | null;
  apellido: string | null;
  programa: string | null;
  semestre_actual: number | string | null;
  estado_matricula: string | null;
};

type AuthContextValue = {
  student: Student | null;
  setStudent: (student: Student | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [student, setStudent] = useState<Student | null>(null);
  const value = useMemo(() => ({ student, setStudent }), [student]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }
  return context;
}
