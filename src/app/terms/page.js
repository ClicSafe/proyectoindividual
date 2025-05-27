'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/ThemeToggle";

export default function TermsOfService() {
  const { darkMode } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Set mounted for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950 animate-pulse">
        <div className="h-16 bg-white/80 dark:bg-slate-900/80 shadow-sm mb-4"></div>
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="h-10 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto flex justify-between items-center p-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/next.svg"
              alt="Logo"
              width={40}
              height={40}
              className="dark:invert"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
              StoryRecs
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className={`rounded-xl p-8 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-md mb-8`}>
          <h1 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Términos de Servicio
          </h1>
          
          <div className={`space-y-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>
              Última actualización: {new Date().toLocaleDateString('es-ES', {day: 'numeric', month: 'long', year: 'numeric'})}
            </p>
            
            <section>
              <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>1. Aceptación de los Términos</h2>
              <p className="mb-3">
                Al acceder y utilizar StoryRecs, aceptas estar sujeto a estos Términos de Servicio. Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al servicio.
              </p>
            </section>
            
            <section>
              <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>2. Descripción del Servicio</h2>
              <p className="mb-3">
                StoryRecs es una plataforma que proporciona recomendaciones personalizadas de películas y libros basadas en tus preferencias. No vendemos ni distribuimos directamente ningún contenido protegido por derechos de autor.
              </p>
            </section>
            
            <section>
              <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>3. Cuenta de Usuario</h2>
              <p className="mb-3">
                Para utilizar ciertas funciones de StoryRecs, deberás crear una cuenta. Eres responsable de mantener la confidencialidad de tu cuenta y contraseña, así como de restringir el acceso a tu dispositivo. Aceptas asumir la responsabilidad de todas las actividades que ocurran bajo tu cuenta.
              </p>
            </section>
            
            <section>
              <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>4. Uso Aceptable</h2>
              <p className="mb-3">
                Te comprometes a utilizar StoryRecs solo para fines lícitos y de acuerdo con estos Términos de Servicio. No utilizarás el servicio:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>De manera que viole cualquier ley o regulación local, nacional o internacional.</li>
                <li>Para explotar, dañar o intentar explotar o dañar a menores de cualquier manera.</li>
                <li>Para transmitir o procurar el envío de material publicitario o promocional no solicitado o no autorizado.</li>
                <li>Para hacerte pasar por otra persona o entidad.</li>
                <li>Para interferir con o interrumpir el servicio o los servidores o redes conectadas al servicio.</li>
              </ul>
            </section>
            
            <section>
              <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>5. Propiedad Intelectual</h2>
              <p className="mb-3">
                El servicio y su contenido original, características y funcionalidad son propiedad de StoryRecs y están protegidos por derechos de autor, marca registrada, patente, secreto comercial y otras leyes de propiedad intelectual.
              </p>
              <p className="mb-3">
                Las recomendaciones de películas y libros podrían mostrar contenido protegido por derechos de autor perteneciente a terceros. Reconocemos todos los derechos de autor y no reclamamos propiedad sobre dicho contenido.
              </p>
            </section>
            
            <section>
              <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>6. Terminación</h2>
              <p className="mb-3">
                Podemos cancelar o suspender tu cuenta y el acceso al servicio inmediatamente, sin previo aviso ni responsabilidad, por cualquier motivo, incluyendo, sin limitación, si incumples los Términos de Servicio.
              </p>
            </section>
            
            <section>
              <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>7. Limitación de Responsabilidad</h2>
              <p className="mb-3">
                En ningún caso StoryRecs, ni sus directores, empleados, socios, agentes, proveedores o afiliados, serán responsables por cualquier daño indirecto, incidental, especial, consecuente o punitivo, incluidos, entre otros, la pérdida de ganancias, datos, uso, buena voluntad u otras pérdidas intangibles.
              </p>
            </section>
            
            <section>
              <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>8. Cambios en los Términos</h2>
              <p className="mb-3">
                Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, intentaremos proporcionar un aviso con al menos 30 días de anticipación antes de que los nuevos términos entren en vigor.
              </p>
            </section>
            
            <section>
              <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>9. Contacto</h2>
              <p>
                Si tienes alguna pregunta sobre estos Términos, contáctanos en: <a href="mailto:info@storyrecs.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">info@storyrecs.com</a>
              </p>
            </section>
          </div>
        </div>
        
        <div className="flex justify-center mb-8">
          <Link 
            href="/register"
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors"
          >
            Volver
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-6">
        <div className="container mx-auto px-4 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} StoryRecs. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
