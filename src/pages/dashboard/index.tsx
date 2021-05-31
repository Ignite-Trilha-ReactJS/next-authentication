import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

import { withSSRAuth } from "../../utils/withSSRAuth";
import { setupApiClient } from "../../services/api";
import { Can } from "../../components/Can";

const dashboard: React.FC = () => {
  const { user } = useContext(AuthContext);


  return (
    <>
      <div>Dash - {user ?.email}</div>
      <Can permissions={["metrics.list"]}>
        <div>Métricas</div>
      </Can>
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