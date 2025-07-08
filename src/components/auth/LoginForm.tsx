import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const { signIn, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: 'admin@medicenter.sn',
    password: 'admin123'
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(formData.email, formData.password);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 z-[-1]" 
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.5)'
        }}
      ></div>
      
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-primary-600 dark:bg-primary-700 rounded-lg p-3">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">BRAIN HOSPITAL</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gestion Santé</p>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Connexion</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Accédez à votre espace de gestion</p>
          </div>

          {/* Informations de connexion par défaut */}
          <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
            <h3 className="text-sm font-medium text-primary-900 dark:text-primary-400 mb-2">Compte Administrateur</h3>
            <div className="text-sm text-primary-700 dark:text-primary-500 space-y-1">
              <p><strong>Email:</strong> admin@medicenter.sn</p>
              <p><strong>Mot de passe:</strong> admin123</p>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 dark:bg-primary-700 text-white py-2 px-4 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Informations supplémentaires */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              <Link to="/" className="text-primary-600 dark:text-primary-400 hover:underline">
                Retour à l'accueil
              </Link>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Système de gestion de centre de santé
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Version 1.0 - Développé par BRAIN en Côte d'Ivoire
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;