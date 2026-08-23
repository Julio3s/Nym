import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './hooks/useTheme';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ExpenseList from './pages/ExpenseList';
import ExpenseNew from './pages/ExpenseNew';
import ExpenseEdit from './pages/ExpenseEdit';
import ExpenseDetail from './pages/ExpenseDetail';
import BudgetPage from './pages/BudgetPage';
import Profile from './pages/Profile';
import RevenueNew from './pages/RevenueNew';
import RevenueList from './pages/RevenueList';
import RevenueSources from './pages/RevenueSources';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Layout><Home /></Layout></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
            <Route path="/expenses" element={<PrivateRoute><Layout><ExpenseList /></Layout></PrivateRoute>} />
            <Route path="/expenses/new" element={<PrivateRoute><Layout><ExpenseNew /></Layout></PrivateRoute>} />
            <Route path="/expenses/:id" element={<PrivateRoute><Layout><ExpenseDetail /></Layout></PrivateRoute>} />
            <Route path="/expenses/:id/edit" element={<PrivateRoute><Layout><ExpenseEdit /></Layout></PrivateRoute>} />
            <Route path="/budgets" element={<PrivateRoute><Layout><BudgetPage /></Layout></PrivateRoute>} />
            <Route path="/revenues" element={<PrivateRoute><Layout><RevenueList /></Layout></PrivateRoute>} />
            <Route path="/revenues/new" element={<PrivateRoute><Layout><RevenueNew /></Layout></PrivateRoute>} />
            <Route path="/revenue-sources" element={<PrivateRoute><Layout><RevenueSources /></Layout></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
