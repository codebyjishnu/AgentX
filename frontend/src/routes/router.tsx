import { createBrowserRouter } from 'react-router'
import { lazy } from 'react'

const Home = lazy(() => import('../pages/Home'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
])

export default router
