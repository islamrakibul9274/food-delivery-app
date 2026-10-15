import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useApp } from "../lib/context";
import { Loading, Empty, ErrorState } from "./ui";
export default function Protected({ admin = false }) {
  const { user, authLoading, settings, catalogError, refreshCatalog } =
    useApp();
  const location = useLocation();
  if (authLoading) return <Loading />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (admin && user.role !== "admin")
    return (
      <Empty
        title="This table is reserved."
        to="/account"
        action="Your account"
      >
        Administrator access is required to open the restaurant desk.
      </Empty>
    );
  if (!settings)
    return catalogError ? (
      <ErrorState message={catalogError} retry={refreshCatalog} />
    ) : (
      <Loading />
    );
  return <Outlet />;
}
