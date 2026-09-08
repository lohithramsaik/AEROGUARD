import React from 'react';
import { EngineProvider } from './context/EngineContext';
import { DemoProvider } from './context/DemoContext';
import { MainLayout } from './components/layout/MainLayout';

export const App: React.FC = () => {
  return (
    <EngineProvider>
      <DemoProvider>
        <MainLayout />
      </DemoProvider>
    </EngineProvider>
  );
};

export default App;
