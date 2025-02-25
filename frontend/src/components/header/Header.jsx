import './Header.css';

function Header() {
    return (
        <header>
        <h1 className='header-text header-text-basic align-left'>Send</h1>
        <h1 className='header-text header-text-fancy'>AO3 fics to Kindle</h1>
        <h1 className='header-text header-text-basic align-right'>in seconds</h1>
        </header>
    );
}

export default Header;