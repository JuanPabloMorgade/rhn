'use client';

import { createContext, useContext } from 'react';

interface NombreContextProps {}

const NombreContext = createContext<NombreContextProps | undefined>(undefined);

export const NombreProvider = ({ children }: { children: React.ReactNode }) => {
  return <NombreContext.Provider value={{}}>{children}</NombreContext.Provider>;
};

export const useNombreContext = () => {
  const context = useContext(NombreContext);
  if (!context)
    throw new Error(
      'useNombreContext debe usarse dentro de NombreContextProvider'
    );
  return context;
};
