import { useContext, useEffect } from "react";
import { AuthContext } from "../../contexts/AuthContext";


import { api } from "../../services/apiClient";
import { withSSRAuth } from "../../utils/withSSRAuth";
import { setupApiClient } from "../../services/api";
import { destroyCookie } from "nookies";

// import { Container } from './styles';

const dashboard: React.FC = () => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    api.get("/me")
      .then(response => console.log(response))
      .catch((error) => console.log(error))
  }, [])
  return (
    <div>Dash - {user ?.email}</div>
  )
}

export default dashboard;

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupApiClient(ctx);
  const response = await apiClient.get('/me');

  return {
    props: {}
  }
})