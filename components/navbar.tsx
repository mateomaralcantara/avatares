type NavbarProps = {
    name: string;
    showAdmin?: boolean;
    showAuth?: boolean;
  };
  
  export function Navbar({ name, showAdmin, showAuth }: NavbarProps) {
    return (
      <nav className="nav">
        <a href="/" className="brand">{name}</a>
        <div className="nav-links">
          <a href="/dashboard">Dashboard</a>
          {showAdmin ? <a href="/admin">Admin</a> : null}
          {showAuth ? <a href="/login">Login</a> : null}
        </div>
      </nav>
    );
  }
  