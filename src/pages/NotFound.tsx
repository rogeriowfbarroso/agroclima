import { useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-gray-600">
          Oops! Página não encontrada.
        </p>
        <p className="mb-4 text-red-500">
          Tentativa de acessar: <strong>{location.pathname}</strong>
        </p>
        <a href="/" className="text-blue-500 underline hover:text-blue-700">
          Retornar para Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
