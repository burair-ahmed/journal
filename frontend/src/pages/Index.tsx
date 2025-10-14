// frontend/src/pages/Index.tsx
import { AuthPage } from "@/components/auth/AuthPage";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { useAuthContext } from "@/contexts/AuthContext";

const Index = () => {
  const { user, loading } = useAuthContext();

  if (loading) return <div>Loading...</div>;

  return user ? <Dashboard /> : <AuthPage />;
};

export default Index;
