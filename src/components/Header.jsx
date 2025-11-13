import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.png";

function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const getNavClasses = (isActive) =>
    [
      "md:text-lg font-bold transition-colors",
      isActive
        ? "text-blue-600"
        : "text-slate-700 hover:text-blue-600",
    ].join(" ");

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between md:justify-evenly">
        {/* Logo / Marca */}
        <Link
          to="/"
          className="flex items-center gap-3"
          onClick={cerrarMenu}
        >
          <img
            src={logo}
            alt="Data Capital Analytics"
            className="h-10 w-10 object-cover"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-xl tracking-tight">
              Data Capital Analytics
            </span>
            <span className="text-[0.8rem] text-slate-500 uppercase tracking-[0.2em]">
              Facultad de Ingeniería - UNAM
            </span>
          </div>
        </Link>

        {/* Navegación desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) => getNavClasses(isActive)}
          >
            Inicio
          </NavLink>
          <NavLink
            to="/predicciones"
            className={({ isActive }) => getNavClasses(isActive)}
          >
            Predicciones
          </NavLink>
          <NavLink
            to="/metodologia"
            className={({ isActive }) => getNavClasses(isActive)}

          >
            Metodología
          </NavLink>
          <NavLink
            to="/equipo"
            className={({ isActive }) => getNavClasses(isActive)}
          >
            Equipo
          </NavLink>
        </nav>

        {/* Botón hamburguesa (solo móvil) */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          onClick={() => setMenuAbierto((prev) => !prev)}
          aria-label="Abrir menú de navegación"
        >
          {menuAbierto ? (
            // Icono "X"
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            // Icono hamburguesa
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Menú desplegable móvil */}
      {menuAbierto && (
        <nav className="md:hidden border-t border-slate-200 bg-white shadow-sm">
          <ul className="flex flex-col py-2 text-sm">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  getNavClasses(isActive) +
                  " block text-center px-4 py-2 text-xl"
                }
                onClick={cerrarMenu}
              >
                Inicio
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/predicciones"
                className={({ isActive }) =>
                  getNavClasses(isActive) +
                  " block text-center px-4 py-2 text-xl"
                }
                onClick={cerrarMenu}
              >
                Predicciones
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/metodologia"
                className={({ isActive }) =>
                  getNavClasses(isActive) +
                  " block text-center px-4 py-2 text-xl"
                }
                onClick={cerrarMenu}
              >
                Metodología
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/equipo"
                className={({ isActive }) =>
                  getNavClasses(isActive) +
                  " block text-center px-4 py-2 text-xl"
                }
                onClick={cerrarMenu}
              >
                Equipo
              </NavLink>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

export default Header;
