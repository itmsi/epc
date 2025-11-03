import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { SidebarProvider } from '@/context/SidebarContext';

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
  authState?: {
    isAuthenticated?: boolean;
    user?: any;
    menu?: any[];
    isLoading?: boolean;
  };
}

const AllTheProviders = ({
  children,
  authState,
}: {
  children: React.ReactNode;
  authState?: CustomRenderOptions['authState'];
}) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders authState={options?.authState}>
        {children}
      </AllTheProviders>
    ),
    ...options,
  });
};

export * from '@testing-library/react';
export { customRender as render };

