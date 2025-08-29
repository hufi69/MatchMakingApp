import React, {createContext, useContext, useState, useMemo} from 'react';

const RoleContext = createContext({
  role: null,
  setRole: () => {},
});

export const RoleProvider = ({children, initialRole = null}) => {
  const [role, setRole] = useState(initialRole);

  const value = useMemo(() => ({role, setRole}), [role]);

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);

export default RoleContext;


