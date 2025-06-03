import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppRouter />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;