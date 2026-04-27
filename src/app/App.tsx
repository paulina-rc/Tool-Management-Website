import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { AppProvider } from './store/AppStore';
import { createAppRouter } from './routes';

/**
 * RouterWrapper lives INSIDE AppProvider so that when RouterProvider
 * renders matched route components (e.g. MainLayout), the AppContext
 * is already established — regardless of HMR module reload order.
 */
function RouterWrapper() {
  // useState with initializer ensures the router is created exactly once
  // per mount, not at module-evaluation time.
  const [router] = useState(createAppRouter);
  return <RouterProvider router={router} />;
}

function App() {
  return (
    <AppProvider>
      <RouterWrapper />
      <Toaster position="top-right" />
    </AppProvider>
  );
}

export default App;
