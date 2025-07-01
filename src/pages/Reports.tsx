import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, Download, Filter, TrendingUp, Users, DollarSign, Activity, FileText, AlertTriangle } from 'lucide-react';

const Reports: React.FC = () => {
  const { state } = useApp();
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('overview');

  // Données pour les graphiques
  const monthlyRevenue = [
    { month: 'Jan', revenue: 4200, consultations: 85, patients: 120 },
    { month: 'Fév', revenue: 4800, consultations: 92, patients: 135 },
    { month: 'Mar', revenue: 5200, consultations: 98, patients: 142 },
    { month: 'Avr', revenue: 4900, consultations: 89, patients: 128 },
    { month: 'Mai', revenue: 5800, consultations: 110, patients: 155 },
    { month: 'Jun', revenue: 6200, consultations: 118, patients: 168 }
  ];

  const appointmentsByType = [
    { name: 'Consultation', value: 45, color: '#3b82f6' },
    { name: 'Suivi', value: 30, color: '#10b981' },
    { name: 'Urgence', value: 15, color: '#f59e0b' },
    { name: 'Chirurgie', value: 10, color: '#ef4444' }
  ];

  const patientsByAge = [
    { age: '0-18', count: 25, percentage: 17 },
    { age: '19-35', count: 45, percentage: 30 },
    { age: '36-50', count: 35, percentage: 23 },
    { age: '51-65', count: 30, percentage: 20 },
    { age: '65+', count: 15, percentage: 10 }
  ];

  const medicationUsage = [
    { category: 'Antalgiques', prescribed: 120, stock: 500, alerts: 2 },
    { category: 'Antibiotiques', prescribed: 80, stock: 200, alerts: 1 },
    { category: 'Anti-inflammatoires', prescribed: 95, stock: 150, alerts: 0 },
    { category: 'Cardiovasculaires', prescribed: 60, stock: 180, alerts: 0 },
    { category: 'Respiratoires', prescribed: 40, stock: 120, alerts: 1 }
  ];

  const doctorPerformance = [
    { name: 'Dr. Legrand', consultations: 45, revenue: 2250, satisfaction: 4.8 },
    { name: 'Dr. Rousseau', consultations: 38, revenue: 3040, satisfaction: 4.9 },
    { name: 'Dr. Durand', consultations: 35, revenue: 2100, satisfaction: 4.7 }
  ];

  const diseaseStats = [
    { disease: 'Hypertension', cases: 28, trend: '+5%' },
    { disease: 'Diabète', cases: 22, trend: '+2%' },
    { disease: 'Grippe', cases: 35, trend: '-10%' },
    { disease: 'Allergie', cases: 18, trend: '+8%' },
    { disease: 'Migraine', cases: 15, trend: '+3%' }
  ];

  const renderCustomizedLabel = (entry: any) => {
    return `${entry.name}: ${entry.value}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Rapports et Statistiques</h1>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
          
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="overview">Vue d'ensemble</option>
            <option value="financial">Financier</option>
            <option value="patients">Patients</option>
            <option value="medical">Médical</option>
            <option value="pharmacy">Pharmacie</option>
          </select>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus du Mois</p>
              <p className="text-2xl font-bold text-gray-900">6,200€</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% vs mois dernier
              </p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Consultations</p>
              <p className="text-2xl font-bold text-gray-900">118</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8% vs mois dernier
              </p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nouveaux Patients</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15% vs mois dernier
              </p>
            </div>
            <div className="bg-purple-100 rounded-lg p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux Satisfaction</p>
              <p className="text-2xl font-bold text-gray-900">94%</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2% vs mois dernier
              </p>
            </div>
            <div className="bg-orange-100 rounded-lg p-3">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {reportType === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution des revenus */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Évolution des Revenus</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    className="text-sm text-gray-600"
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    className="text-sm text-gray-600"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#2563eb" 
                    strokeWidth={3}
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Types de rendez-vous */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Répartition des Rendez-vous</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appointmentsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {appointmentsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Patients par tranche d'âge */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Patients par Tranche d'Âge</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patientsByAge} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="age" 
                    axisLine={false}
                    tickLine={false}
                    className="text-sm text-gray-600"
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    className="text-sm text-gray-600"
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance des médecins */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance des Médecins</h3>
            <div className="space-y-4">
              {doctorPerformance.map((doctor, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{doctor.name}</p>
                    <p className="text-sm text-gray-600">{doctor.consultations} consultations</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{doctor.revenue}€</p>
                    <div className="flex items-center text-sm text-yellow-600">
                      <span>★ {doctor.satisfaction}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {reportType === 'financial' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenus et Consultations</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#2563eb" name="Revenus (€)" />
                  <Bar yAxisId="right" dataKey="consultations" fill="#10b981" name="Consultations" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Analyse Financière</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Revenus totaux</span>
                <span className="text-lg font-bold text-green-600">32,300€</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Revenus moyens/mois</span>
                <span className="text-lg font-bold text-blue-600">5,383€</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Croissance</span>
                <span className="text-lg font-bold text-orange-600">+12%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Revenus/consultation</span>
                <span className="text-lg font-bold text-purple-600">55€</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportType === 'medical' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Statistiques des Pathologies</h3>
            <div className="space-y-3">
              {diseaseStats.map((disease, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{disease.disease}</p>
                    <p className="text-sm text-gray-600">{disease.cases} cas ce mois</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${
                      disease.trend.includes('+') ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {disease.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Consultations par Spécialité</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Médecine Générale', value: 45, color: '#3b82f6' },
                      { name: 'Cardiologie', value: 25, color: '#ef4444' },
                      { name: 'Pédiatrie', value: 30, color: '#10b981' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {[
                      { name: 'Médecine Générale', value: 45, color: '#3b82f6' },
                      { name: 'Cardiologie', value: 25, color: '#ef4444' },
                      { name: 'Pédiatrie', value: 30, color: '#10b981' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {reportType === 'pharmacy' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Utilisation des Médicaments</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={medicationUsage}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="prescribed" fill="#3b82f6" name="Prescrits" />
                  <Bar dataKey="stock" fill="#10b981" name="Stock actuel" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Alertes Pharmacie</h3>
            <div className="space-y-3">
              {medicationUsage.filter(med => med.alerts > 0).map((medication, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-gray-900">{medication.category}</p>
                      <p className="text-sm text-gray-600">Stock: {medication.stock} unités</p>
                    </div>
                  </div>
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                    {medication.alerts} alerte{medication.alerts > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Résumé des actions recommandées */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Actions Recommandées</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Rapports mensuels</span>
            </div>
            <p className="text-sm text-blue-700">Préparer les rapports de fin de mois pour la direction.</p>
          </div>

          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-900">Stock faible</span>
            </div>
            <p className="text-sm text-orange-700">Réapprovisionner 4 médicaments en rupture de stock.</p>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Performance</span>
            </div>
            <p className="text-sm text-green-700">Excellent mois avec +12% de croissance du chiffre d'affaires.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;