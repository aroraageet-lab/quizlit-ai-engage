import { Link } from "react-router-dom";

const NavLink = ({ to, children, className }) => {
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
};

export default NavLink;
