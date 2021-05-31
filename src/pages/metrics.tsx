import { withSSRAuth } from "../utils/withSSRAuth";
import { setupApiClient } from "../services/api";


const metrics: React.FC = () => {


  return (
    <>
      <div>Métricas</div>
    </>

  )
}

export default metrics;

export const getServerSideProps = withSSRAuth(async (ctx) => {


  return {
    props: {}
  }
}, {
    permissions: ["metrics.list3"],
    roles: ["administrator"],
  })