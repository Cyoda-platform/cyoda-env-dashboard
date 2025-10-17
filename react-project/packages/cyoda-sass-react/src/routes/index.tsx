import { RouteObject } from 'react-router-dom';
import LoginView from '../pages/LoginView';
import TrinoIndex from '../pages/Trino/TrinoIndex';
import TrinoEdit from '../pages/Trino/TrinoEdit';

const routes: RouteObject[] = [
  {
    path: '/cyoda-sass/login',
    element: <LoginView />,
  },
  {
    path: '/cyoda-sass/trino',
    element: <TrinoIndex />,
  },
  {
    path: '/cyoda-sass/trino/schema',
    element: <TrinoEdit />,
  },
  {
    path: '/cyoda-sass/trino/schema/:id',
    element: <TrinoEdit />,
  },
];

export default routes;

