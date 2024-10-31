import { useEffect, useState } from "react";
import { Container, Row, Col, Navbar, Nav, Button } from "react-bootstrap";
import Logo from "../../assets/img/logo.svg";
import { Link, useLocation } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import { socials } from "../../utils/socials";
import { ConnectEthWalletButton } from "./ConnectEthWalletButton";
import { ConnectBtcWallet } from "./ConnectBtcWallet";
const Header = () => {
  const [btn, setBtn] = useState(false);
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 100;
      setScrolled(isScrolled);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <header
        className={`heading start-0 top-0 w-100 z-3 ${
          scrolled ? "position-fixed pt-3" : "position-absolute"
        }`}
      >
        <Container>
          <Row>
            <Col>
              <Navbar expand='lg' bg='light' className='heading-inner'>
                <Link className='navbar-brand p-0' to='/'>
                  <img src={Logo} alt='site-logo' />
                </Link>
                <Navbar.Toggle aria-controls='basic-navbar-nav' />
                <Navbar.Collapse className='mt-3 mt-lg-0' id='navbarText'>
                  <Nav className='ms-auto social-link gap-3'>
                    {socials.map((item, index) => (
                      <Nav.Item key={index}>
                        <Nav.Link
                          className='nav-link text-white d-flex align-items-center justify-content-center rounded-pill'
                          href={item.link}
                          target='_blank'
                          dangerouslySetInnerHTML={{ __html: item.icon }}
                        ></Nav.Link>
                      </Nav.Item>
                    ))}
                  </Nav>
                  <div className='d-flex justify-content-center align-items-center flex-wrap gap-2 mt-3 mt-lg-0 ms-lg-4 '>
                    {location.pathname === "/dashboard" ? (
                      <>
                        <ConnectEthWalletButton />
                        <ConnectBtcWallet />
                      </>
                    ) : (
                      <Link
                        className='mt-3 mt-md-0 ms-lg-4 primary-btn bg-transparent text-center'
                        to={"/dashboard"}
                      >
                        Launch DApp
                      </Link>
                    )}
                  </div>
                </Navbar.Collapse>
              </Navbar>
            </Col>
          </Row>
        </Container>
      </header>
    </>
  );
};
export default Header;
