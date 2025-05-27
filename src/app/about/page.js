'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../../components/ThemeToggle";

export default function AboutUs() {
  const { darkMode } = useTheme();
  const { user } = useAuth();
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
         
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
              StoryRecs
            </span>
          </Link>
          {/* Solo mostrar el ThemeToggle si el usuario está autenticado */}
          {user && <ThemeToggle />}
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className={`rounded-xl overflow-hidden shadow-md mb-10 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="h-48 md:h-64 w-full relative bg-gradient-to-r from-indigo-500 to-purple-600">
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white">Sobre Nosotros</h1>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <section className={`mb-10 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Nuestra Misión
              </h2>
              <p className="mb-4">
                En StoryRecs, nuestra misión es conectar a las personas con las mejores historias del mundo, ya sea en forma de películas o libros. Creemos que una buena historia tiene el poder de transformar vidas, inspirar mentes y fomentar la empatía.
              </p>
              <p className="mb-4">
                Utilizamos algoritmos avanzados y aprendizaje automático para ofrecer recomendaciones personalizadas que se adaptan a los gustos únicos de cada usuario. Nuestro objetivo es que nunca te quedes sin una gran historia que disfrutar.
              </p>
            </section>

            <section className={`mb-10 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Nuestra Historia
              </h2>
              <p className="mb-4">
                StoryRecs nació de la pasión por las historias y la tecnología. Todo comenzó cuando nuestros fundadores, ávidos lectores y amantes del cine, se enfrentaron al desafío de encontrar nuevas historias que realmente les interesaran.
              </p>
              <p className="mb-4">
                Después de años trabajando en tecnología y análisis de datos, decidieron combinar su experiencia para crear una plataforma que resolviera ese problema: una herramienta que entendiera realmente los gustos individuales y pudiera sugerir el contenido perfecto para cada persona.
              </p>
              <p>
                Lanzada en 2025, StoryRecs ha crecido rápidamente, ayudando a miles de usuarios a descubrir sus próximas historias favoritas.
              </p>
            </section>

            

            <section className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Nuestros Valores
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-bold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Innovación</h3>
                  <p>Nos esforzamos constantemente por mejorar nuestros algoritmos y ofrecer la experiencia más personalizada posible.</p>
                </div>
                
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-bold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Privacidad</h3>
                  <p>Respetamos y protegemos tus datos. Tu privacidad es nuestra prioridad.</p>
                </div>
                
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-bold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Diversidad</h3>
                  <p>Promovemos historias de todas las culturas y perspectivas, ampliando horizontes.</p>
                </div>
                
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-bold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Comunidad</h3>
                  <p>Creemos en el poder de compartir y descubrir historias juntos como comunidad.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
        
        <div className="flex justify-center mb-8">
          <Link 
            href="/"
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-6">
        <div className="container mx-auto px-4 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} StoryRecs. Todos los derechos reservados.
          </div>
          <div className="mt-2 flex justify-center gap-4">
            <Link href="/privacy" className="text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
              Privacidad
            </Link>
            <Link href="/terms" className="text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
              Términos
            </Link>
            <Link href="/contact" className="text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
              Contacto
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
