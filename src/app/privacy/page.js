'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/ThemeToggle";

export default function PrivacyPolicy() {
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
            Política de Privacidad
          </h1>
          
          <div className={`space-y-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>
              Última actualización: {new Date().toLocaleDateString('es-ES', {day: 'numeric', month: 'long', year: 'numeric'})}
            </p>
            
            <section>
              <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>1. Introducción</h2>
              <p className="mb-3">
                En StoryRecs, valoramos tu privacidad y nos comprometemos a proteger tus datos personales. Esta Política de Privacidad explica cómo recopilamos, utilizamos, divulgamos y protegemos tu información cuando utilizas nuestra plataforma de recomendación de películas y libros.
              </p>
            </section>
            
            <section>
              <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>2. Información que Recopilamos</h2>
              <p className="mb-3">
                Podemos recopilar los siguientes tipos de información:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li><strong>Información de registro:</strong> Cuando creas una cuenta, recopilamos tu nombre, dirección de correo electrónico y contraseña.</li>
                <li><strong>Información de perfil:</strong> Puedes proporcionar información adicional como preferencias de géneros de películas y libros.</li>
                <li><strong>Datos de uso:</strong> Recopilamos información sobre cómo interactúas con nuestra plataforma, como las búsquedas que realizas, las películas y libros que añades a tu lista de deseos, y tus valoraciones.</li>
                <li><strong>Información del dispositivo:</strong> Podemos recopilar información sobre el dispositivo que utilizas para acceder a nuestro servicio.</li>
              </ul>
            </section>
            
            <section>
              <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>3. Cómo Utilizamos tu Información</h2>
              <p className="mb-3">
                Utilizamos la información que recopilamos para:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>Proporcionar, mantener y mejorar nuestro servicio.</li>
                <li>Personalizar tu experiencia y ofrecerte recomendaciones basadas en tus preferencias y comportamiento.</li>
                <li>Comunicarnos contigo, incluyendo enviar notificaciones relacionadas con el servicio.</li>
                <li>Monitorear y analizar tendencias, uso y actividades en relación con nuestro servicio.</li>
                <li>Detectar, investigar y prevenir actividades fraudulentas y no autorizadas.</li>
              </ul>
            </section>
            
            <section>
              <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>4. Compartir tu Información</h2>
              <p className="mb-3">
                No vendemos tu información personal a terceros. Podemos compartir tu información en las siguientes circunstancias:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li><strong>Con proveedores de servicios:</strong> Trabajamos con terceros que nos ayudan a proporcionar nuestros servicios.</li>
                <li><strong>Por motivos legales:</strong> Si es razonablemente necesario para cumplir con la ley, procesos legales o solicitudes gubernamentales.</li>
                <li><strong>Con tu consentimiento:</strong> Podemos compartir tu información con terceros cuando nos hayas dado tu consentimiento para hacerlo.</li>
              </ul>
            </section>
            
            <section>
              <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>5. Seguridad de Datos</h2>
              <p className="mb-3">
                Nos esforzamos por proteger tu información personal mediante la implementación de medidas de seguridad técnicas y organizativas apropiadas. Sin embargo, ningún sistema es completamente seguro, y no podemos garantizar la seguridad absoluta de tu información.
              </p>
            </section>
            
            <section>
              <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>6. Tus Derechos</h2>
              <p className="mb-3">
                Según la legislación aplicable, puedes tener derecho a:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>Acceder a los datos personales que tenemos sobre ti.</li>
                <li>Solicitar la corrección de datos inexactos.</li>
                <li>Solicitar la eliminación de tus datos personales.</li>
                <li>Oponerte al procesamiento de tus datos personales.</li>
                <li>Solicitar la restricción del procesamiento de tus datos personales.</li>
                <li>Solicitar la portabilidad de tus datos.</li>
              </ul>
            </section>
            
            <section>
              <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>7. Cookies y Tecnologías Similares</h2>
              <p className="mb-3">
                Utilizamos cookies y tecnologías de seguimiento similares para rastrear la actividad en nuestro servicio y mantener cierta información. Puedes configurar tu navegador para rechazar todas las cookies o para indicar cuándo se está enviando una cookie. Sin embargo, si no aceptas cookies, es posible que no puedas utilizar algunas partes de nuestro servicio.
              </p>
            </section>
            
            <section>
              <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>8. Cambios a esta Política</h2>
              <p className="mb-3">
                Podemos actualizar nuestra Política de Privacidad de vez en cuando. Te notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página y actualizando la fecha de "última actualización".
              </p>
            </section>
            
            <section>
              <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>9. Contacto</h2>
              <p>
                Si tienes preguntas o inquietudes sobre esta Política de Privacidad, por favor contáctanos en: <a href="mailto:privacy@storyrecs.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">privacy@storyrecs.com</a>
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
