import React from "react";
import AppRoutes from "./routes/AppRoutes";
import "./App.scss";
import AppProviders from "./context/AppProviders";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

function App() {
  const userID = 3;

  return (
    <React.StrictMode>
      <AppProviders userID={userID}>
        <QueryClientProvider client={queryClient}>
          <AppRoutes />
          <ReactQueryDevtools initialIsOpen={false} /> {/*remove during deployment*/}
        </QueryClientProvider>
      </AppProviders>
    </React.StrictMode>
  );
}

export default App;
