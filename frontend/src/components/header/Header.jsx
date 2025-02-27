import "./Header.css";

function Header() {
  return (
    <header>
      <h1>
        <div className="header-text header-text-basic align-left">Send</div>
        <div className="header-text header-text-fancy">AO3 fics to Kindle</div>
        <div className="header-text header-text-basic align-right">
          in seconds
        </div>
      </h1>
    </header>
  );
}

export default Header;
