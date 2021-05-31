import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

import { withSSRAuth } from "../../utils/withSSRAuth";
import { setupApiClient } from "../../services/api";

const dashboard: React.FC = () => {
  const { user, signOut } = useContext(AuthContext);


  return (
    <>
      <div>Dash - {user ?.email}</div>
      <button onClick={() => signOut()}>SAIR</button>
    </>

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