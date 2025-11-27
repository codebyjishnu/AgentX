import { createBrowserRouter } from 'react-router'
import { lazy } from 'react'

const Home = lazy(() => import('../pages/Home'))
const Project = lazy(() => import('../pages/Project'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/project/:id',
    element: <Project />,
  },
])

export default router
