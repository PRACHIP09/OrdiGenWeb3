import { QueryClient, QueryClientProvider } from 'react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/home.jsx';
import Dashboard from './pages/dashboard.jsx';
import ErrorElement from './pages/ErrorElement.jsx';
import { GeneralDataProvider } from './contexts/GeneralDataProvider.jsx';
import Staking from './pages/Staking.jsx';
import Nftmarket from './pages/Nftmarket.jsx';
import Collectiondetail from './pages/Collectiondetail.jsx';
import Nftdetail from './pages/Nftdetail.jsx';


const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <ErrorElement />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
    errorElement: <ErrorElement />,
  },
  {
    path: '/staking',
    element: <Staking />,
    errorElement: <ErrorElement />,
  },
  {
    path: '/collections',
    element: <Nftmarket />,
    errorElement: <ErrorElement />,
  },
  {
    path: '/detail',
    element: <Collectiondetail />,
    errorElement: <ErrorElement />,
  },
  {
    path: '/nftdetail',
    element: <Nftdetail />,
    errorElement: <ErrorElement />,
  }

]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <GeneralDataProvider>
          <RouterProvider router={router} />
        </GeneralDataProvider>
      </QueryClientProvider>
      <ToastContainer position='bottom-right' theme='dark' />
    </div>
  );
}

export default App;
