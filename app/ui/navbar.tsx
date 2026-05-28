/* eslint-disable @next/next/no-img-element */
export function Navbar() {
  const links = [
    { href: "/",           label: "Home" },
    { href: "https://www.aikicenter.it/chi-siamo.php",  label: "Chi Siamo" },
    { href: "/",      label: "Corsi" },
    { href: "https://www.aikicenter.it/istruttori.php", label: "Istruttori" }
  ];

  return (
    <nav> 
      <input id="nav-toggle" type="checkbox" />

      <a href="/login" className="login-button" aria-label="Login">
        <div className="user-icon">
          <div className="user-head"></div>
          <div className="user-body"></div>
        </div>
      </a>
      <div className="logo">
        <img src="/images/testo_logo_bianco.png" alt="logo testuale aikicenter" />
      </div>

      <ul className="links">
        {links.map(({ href, label }) => (
          <li key={href}>
            <a href={href}>{label}</a>
          </li>
        ))}
      </ul>

      <label htmlFor="nav-toggle" className="icon-burger">
        <div className="line" />
        <div className="line" />
        <div className="line" />
      </label>
    </nav>
  );
}