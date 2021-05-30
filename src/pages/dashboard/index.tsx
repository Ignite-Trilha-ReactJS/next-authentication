import { useContext, useEffect } from "react";
import { AuthContext } from "../../contexts/AuthContext";


import React from 'react';
import { api } from "../../services/api";

// import { Container } from './styles';

const dashboard: React.FC = () => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    api.get("/me").then(response => console.log(response))
  }, [])
  return (
    <div>Dash - {user ?.email}</div>
  )
}

export default dashboard;