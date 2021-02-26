import { useQuery } from 'react-query';
import Layout from '../components/Layout';
import { OrderTable } from '../components/OrderTable';

export default function OrdersPage() {
  const { isLoading, data: orders } = useQuery('orders', () =>
    fetch('/api/orders?limit=200&status=Shipped').then((res) => res.json())
  );

  return (
    <Layout title="Orders">
      {/* <Scanner/> */}
      <header>
        <h1>Processed Orders {orders?.length}</h1>
        <p>
          Viewing a listing of orders that need to be packed. They are not in a
          batch.
        </p>
      </header>
      {isLoading && <p>Loading...</p>}

      <OrderTable orders={orders} />
    </Layout>
  );
}
