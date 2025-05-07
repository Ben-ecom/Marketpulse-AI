import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Component voor het beveiligen van routes die alleen toegankelijk zijn voor ingelogde gebruikers
 * Redirects naar de login pagina als de gebruiker niet is ingelogd
 * 
 * TIJDELIJK UITGESCHAKELD VOOR DEMONSTRATIE DOELEINDEN
 */
const ProtectedRoute = ({ user }) => {
  // Tijdelijk uitgeschakeld voor demonstratie doeleinden
  // if (!user) {
  //   return <Navigate to="/login" replace />;
  // }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  user: PropTypes.object
};

export default ProtectedRoute;
