import { RouterProvider } from "react-router-dom"
import router from "./routes/router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Create QueryClient outside the component to avoid recreation on every render
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

export default App
