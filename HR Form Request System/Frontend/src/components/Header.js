import { Container, Navbar } from 'react-bootstrap';
import './Header.scss';
import NavItems from './NavItems';
import { Link } from 'react-router-dom';

// Assets
import companyIcon from '../assets/TechFactorsIcon.png' 



function Header({ navVisible = true }) {

  return (
    <Navbar expand="lg" className="top-header py-2 px-3 bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <Container fluid className="justify-content-between align-items-center">
        <Link to="/" className="d-flex align-items-center">
          <img src={companyIcon} alt="TechFactors Logo" height="50" className="me-2" />
        </Link>

        {navVisible && <NavItems/>}
      </Container>
    </Navbar>
  );
}


export default Header;

