'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../../components/ThemeToggle";

export default function Contact() {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set mounted for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Si el usuario está autenticado, prellenar con sus datos
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || "",
        email: user.email || ""
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulación de envío de formulario
    setTimeout(() => {
      setFormStatus({
        submitted: true,
        success: true,
        message: "¡Gracias por contactarnos! Responderemos a tu mensaje tan pronto como sea posible."
      });
      setIsSubmitting(false);
      
      // Limpiar el formulario si no hay usuario autenticado
      if (!user) {
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: ""
        });
      } else {
        setFormData(prev => ({
          ...prev,
          subject: "",
          message: ""
        }));
      }
    }, 1500);
  };

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
          {/* Solo mostrar el ThemeToggle si el usuario está autenticado */}
          {user && <ThemeToggle />}
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className={`rounded-xl shadow-md ${darkMode ? 'bg-slate-800' : 'bg-white'} overflow-hidden mb-10`}>
          <div className="h-48 md:h-64 w-full relative bg-gradient-to-r from-purple-600 to-indigo-600">
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white">Contáctanos</h1>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Estamos aquí para ayudarte
                </h2>
                <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  ¿Tienes preguntas, comentarios o sugerencias? Nos encantaría escucharlos. Completa el formulario y te responderemos lo antes posible.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className={`h-10 w-10 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-indigo-100'} flex items-center justify-center mr-3`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Email</p>
                      <a href="mailto:info@storyrecs.com" className={`text-sm ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}>info@storyrecs.com</a>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className={`h-10 w-10 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-indigo-100'} flex items-center justify-center mr-3`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Soporte</p>
                      <a href="mailto:support@storyrecs.com" className={`text-sm ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}>support@storyrecs.com</a>
                    </div>
                  </div>
               

                  <div className="flex items-center">
                    <div className={`h-10 w-10 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-indigo-100'} flex items-center justify-center mr-3`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Oficina</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Av. Juan de Dios Bátiz, 123<br />CDMX, México</p>
                    </div>
                  </div>
                </div>
                
           
              </div>

              <div>
                {formStatus.submitted ? (
                  <div className={`rounded-lg p-6 ${darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'}`}>
                    <h3 className="text-xl font-bold mb-2">¡Mensaje enviado!</h3>
                    <p>{formStatus.message}</p>
                    <button
                      onClick={() => setFormStatus({ submitted: false, success: false, message: "" })}
                      className={`mt-4 px-4 py-2 rounded-lg ${darkMode ? 'bg-green-800/50 hover:bg-green-800/70 text-white' : 'bg-green-600 hover:bg-green-700 text-white'} transition-colors`}
                    >
                      Enviar otro mensaje
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label 
                          htmlFor="name" 
                          className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          Nombre
                        </label>
                        <input 
                          type="text" 
                          id="name" 
                          name="name" 
                          value={formData.name} 
                          onChange={handleChange}
                          required
                          className={`w-full px-3 py-2 rounded-lg border transition-colors
                            ${darkMode 
                              ? 'border-gray-600 bg-slate-700 text-white focus:border-indigo-400' 
                              : 'border-gray-300 bg-white text-gray-900 focus:border-indigo-500'} 
                            focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                        />
                      </div>
                      <div>
                        <label 
                          htmlFor="email" 
                          className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          Email
                        </label>
                        <input 
                          type="email" 
                          id="email" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleChange}
                          required
                          className={`w-full px-3 py-2 rounded-lg border transition-colors
                            ${darkMode 
                              ? 'border-gray-600 bg-slate-700 text-white focus:border-indigo-400' 
                              : 'border-gray-300 bg-white text-gray-900 focus:border-indigo-500'} 
                            focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label 
                        htmlFor="subject" 
                        className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Asunto
                      </label>
                      <input 
                        type="text" 
                        id="subject" 
                        name="subject" 
                        value={formData.subject} 
                        onChange={handleChange}
                        required
                        className={`w-full px-3 py-2 rounded-lg border transition-colors
                          ${darkMode 
                            ? 'border-gray-600 bg-slate-700 text-white focus:border-indigo-400' 
                            : 'border-gray-300 bg-white text-gray-900 focus:border-indigo-500'} 
                          focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                      />
                    </div>
                    
                    <div>
                      <label 
                        htmlFor="message" 
                        className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Mensaje
                      </label>
                      <textarea 
                        id="message" 
                        name="message" 
                        value={formData.message} 
                        onChange={handleChange}
                        required
                        rows={5}
                        className={`w-full px-3 py-2 rounded-lg border transition-colors
                          ${darkMode 
                            ? 'border-gray-600 bg-slate-700 text-white focus:border-indigo-400' 
                            : 'border-gray-300 bg-white text-gray-900 focus:border-indigo-500'} 
                          focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                      ></textarea>
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-colors
                        ${isSubmitting 
                          ? 'bg-indigo-400 text-white cursor-not-allowed' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    >
                      {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
                    </button>
                  </form>
                )}
              </div>
            </div>
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
            <Link href="/about" className="text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
              Sobre Nosotros
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
