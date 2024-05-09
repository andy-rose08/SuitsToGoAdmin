const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex justify-center items-center h-screen bg-cover bg-center bg-login">
      {children}
    </div>
  );
};

export default AuthLayout;
