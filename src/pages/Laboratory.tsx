import React, { useState, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { Search, Plus, FlaskConical, User, Calendar, FileText, AlertCircle, CheckCircle, Edit, Trash2, Printer, Download, Filter, Beaker, Microscope, Goal as Vial, Clock, Eye } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import LabTestModal from '../components/laboratory/LabTestModal';
import LabResultModal from '../components/laboratory/LabResultModal';
import LabResultDetails from '../components/laboratory/LabResultDetails';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Laboratory: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'results' | 'tests'>('results');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showTestModal, setShowTestModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [editingTest, setEditingTest] = useState<any>(null);
  const [editingResult, setEditingResult] = useState<any>(null);
  const [viewingResult, setViewingResult] = useState<any>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Filtrer les résultats selon les critères
  const filteredResults = state.labResults.filter(result => {
    const patient = state.patients.find(p => p.id === result.patientId);
    
    const matchesSearch = patient && (
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.testType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.technician.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesStatus = filterStatus === 'all' || result.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Filtrer les tests selon les critères
  const filteredTests = state.labTests.filter(test => {
    const matchesSearch = 
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || test.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getResultStatus = (results: any) => {
    const values = Object.values(results);
    const hasAbnormal = values.some((result: any) => result.status === 'abnormal' || result.status === 'critical');
    const hasCritical = values.some((result: any) => result.status === 'critical');
    
    if (hasCritical) return { status: 'critical', color: 'text-red-600 dark:text-red-400', icon: AlertCircle };
    if (hasAbnormal) return { status: 'abnormal', color: 'text-orange-600 dark:text-orange-400', icon: AlertCircle };
    return { status: 'normal', color: 'text-green-600 dark:text-green-400', icon: CheckCircle };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in-progress': return 'En cours';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const handleEdit = (item: any) => {
    if (viewMode === 'results') {
      setEditingResult(item);
      setShowResultModal(true);
    } else {
      setEditingTest(item);
      setShowTestModal(true);
    }
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
    
    if (viewMode === 'results') {
      dispatch({ type: 'DELETE_LAB_RESULT', payload: id });
    } else {
      dispatch({ type: 'DELETE_LAB_TEST', payload: id });
    }
  };

  const handleView = (result: any) => {
    setViewingResult(result);
  };

  const exportToExcel = () => {
    let data: any[] = [];
    let filename = '';
    
    if (viewMode === 'results') {
      data = filteredResults.map(result => {
        const patient = state.patients.find(p => p.id === result.patientId);
        const resultStatus = getResultStatus(result.results);
        
        return {
          'Patient': patient ? `${patient.firstName} ${patient.lastName}` : 'Inconnu',
          'Type de test': result.testType,
          'Date du test': new Date(result.testDate).toLocaleDateString('fr-FR'),
          'Statut': getStatusText(result.status),
          'Résultat': resultStatus.status,
          'Technicien': result.technician
        };
      });
      filename = 'Resultats_Laboratoire';
    } else {
      data = filteredTests.map(test => ({
        'Nom du test': test.name,
        'Catégorie': test.category,
        'Prix': formatCurrency(test.price, 'XOF'),
        'Type d\'échantillon': test.sampleType,
        'Délai': test.processingTime,
        'Statut': test.isActive ? 'Actif' : 'Inactif'
      }));
      filename = 'Tests_Laboratoire';
    }
    
    // Créer un workbook et ajouter une feuille avec les données
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Ajouter la feuille au workbook
    XLSX.utils.book_append_sheet(wb, ws, viewMode === 'results' ? 'Résultats' : 'Tests');
    
    // Générer le fichier Excel et le télécharger
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    // Créer un nouveau document PDF
    const doc = new jsPDF();
    
    // Ajouter un titre
    doc.setFontSize(18);
    const title = viewMode === 'results' ? 'Résultats de Laboratoire' : 'Tests de Laboratoire';
    doc.text(title, 14, 22);
    
    // Ajouter la date d'export
    doc.setFontSize(11);
    doc.text(`Exporté le: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
    
    // Préparer les données pour le tableau
    let tableData: any[] = [];
    let headers: string[] = [];
    
    if (viewMode === 'results') {
      headers = ['Patient', 'Test', 'Date', 'Statut', 'Résultat', 'Technicien'];
      tableData = filteredResults.map(result => {
        const patient = state.patients.find(p => p.id === result.patientId);
        const resultStatus = getResultStatus(result.results);
        
        return [
          patient ? `${patient.firstName} ${patient.lastName}` : 'Inconnu',
          result.testType,
          new Date(result.testDate).toLocaleDateString('fr-FR'),
          getStatusText(result.status),
          resultStatus.status,
          result.technician
        ];
      });
    } else {
      headers = ['Nom du test', 'Catégorie', 'Prix', 'Type d\'échantillon', 'Délai', 'Statut'];
      tableData = filteredTests.map(test => [
        test.name,
        test.category,
        formatCurrency(test.price, 'XOF'),
        test.sampleType,
        test.processingTime,
        test.isActive ? 'Actif' : 'Inactif'
      ]);
    }
    
    // Ajouter le tableau au document
    (doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    
    // Ajouter un pied de page
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} sur ${pageCount} - MediCenter - Système de Gestion de Centre de Santé`,
        doc.internal.pageSize.width / 2, 
        doc.internal.pageSize.height - 10, 
        { align: 'center' }
      );
    }
    
    // Télécharger le PDF
    doc.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const closeModals = () => {
    setShowTestModal(false);
    setShowResultModal(false);
    setEditingTest(null);
    setEditingResult(null);
  };

  // Statistiques
  const totalResults = state.labResults.length;
  const completedResults = state.labResults.filter(r => r.status === 'completed').length;
  const pendingResults = state.labResults.filter(r => r.status === 'pending').length;
  const inProgressResults = state.labResults.filter(r => r.status === 'in-progress').length;
  
  const normalResults = state.labResults.filter(r => {
    const status = getResultStatus(r.results);
    return status.status === 'normal';
  }).length;
  
  const abnormalResults = state.labResults.filter(r => {
    const status = getResultStatus(r.results);
    return status.status === 'abnormal';
  }).length;
  
  const criticalResults = state.labResults.filter(r => {
    const status = getResultStatus(r.results);
    return status.status === 'critical';
  }).length;

  const categories = [...new Set(state.labTests.map(test => test.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion du Laboratoire</h1>
        <div className="flex space-x-2">
          <button 
            onClick={exportToExcel}
            className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 hover:bg-green-700 transition-colors text-sm"
            title="Exporter en Excel"
          >
            <Download className="h-4 w-4" />
            <span>Excel</span>
          </button>
          <button 
            onClick={exportToPDF}
            className="bg-red-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 hover:bg-red-700 transition-colors text-sm"
            title="Exporter en PDF"
          >
            <Download className="h-4 w-4" />
            <span>PDF</span>
          </button>
          <button 
            onClick={() => {
              if (viewMode === 'results') {
                setShowResultModal(true);
              } else {
                setShowTestModal(true);
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{viewMode === 'results' ? 'Nouveau Résultat' : 'Nouveau Test'}</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Analyses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalResults}</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{completedResults} terminées</span>
              </div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3">
              <FlaskConical className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Résultats Normaux</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{normalResults}</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round((normalResults / totalResults) * 100) || 0}% du total</span>
              </div>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Résultats Anormaux</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{abnormalResults}</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round((abnormalResults / totalResults) * 100) || 0}% du total</span>
              </div>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/20 rounded-lg p-3">
              <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Résultats Critiques</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalResults}</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round((criticalResults / totalResults) * 100) || 0}% du total</span>
              </div>
            </div>
            <div className="bg-red-100 dark:bg-red-900/20 rounded-lg p-3">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('results')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'results' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Résultats
              </button>
              <button
                onClick={() => setViewMode('tests')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'tests' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Catalogue Tests
              </button>
            </div>
          </div>

          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={viewMode === 'results' ? "Rechercher par patient, type de test ou technicien..." : "Rechercher un test..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {viewMode === 'results' && (
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="in-progress">En cours</option>
                  <option value="completed">Terminés</option>
                  <option value="cancelled">Annulés</option>
                </select>
              </div>
            )}

            {viewMode === 'tests' && (
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Toutes catégories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Affichage des résultats de laboratoire */}
        {viewMode === 'results' && (
          <div className="overflow-x-auto">
            <table ref={tableRef} className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Test
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Échantillon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Résultat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Technicien
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredResults.map((result) => {
                  const patient = state.patients.find(p => p.id === result.patientId);
                  const resultStatus = getResultStatus(result.results);
                  const StatusIcon = resultStatus.icon;
                  
                  return (
                    <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {patient?.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{result.testType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(result.testDate).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Collecté: {new Date(result.sampleCollectionDate).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{result.sampleType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}>
                          {getStatusText(result.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center space-x-2 ${resultStatus.color}`}>
                          <StatusIcon className="h-5 w-5" />
                          <span className="font-medium capitalize">{resultStatus.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{result.technician}</div>
                        {result.validatedBy && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Validé par: {result.validatedBy}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleView(result)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            title="Voir"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(result)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(result.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Affichage du catalogue de tests */}
        {viewMode === 'tests' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <div key={test.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-2">
                      {test.category === 'Hématologie' && <Vial className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                      {test.category === 'Biochimie' && <Beaker className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                      {test.category === 'Parasitologie' && <Microscope className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                      {test.category === 'Immunologie' && <FlaskConical className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                      {!['Hématologie', 'Biochimie', 'Parasitologie', 'Immunologie'].includes(test.category) && 
                        <FlaskConical className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      }
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{test.name}</h3>
                      <span className="inline-block bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 text-xs px-2 py-1 rounded-full">
                        {test.category}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    test.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {test.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{test.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Prix:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(test.price, 'XOF')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Échantillon:</span>
                    <span className="text-gray-900 dark:text-white">{test.sampleType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Délai:</span>
                    <span className="text-gray-900 dark:text-white">{test.processingTime}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paramètres ({test.parameters.length})</h4>
                  <div className="space-y-1">
                    {test.parameters.slice(0, 3).map((param) => (
                      <div key={param.id} className="text-xs text-gray-600 dark:text-gray-400">
                        {param.name} {param.unit && `(${param.unit})`}
                        {param.referenceRangeText && `: ${param.referenceRangeText}`}
                        {param.referenceRangeMin !== undefined && param.referenceRangeMax !== undefined && 
                          `: ${param.referenceRangeMin}-${param.referenceRangeMax} ${param.unit}`
                        }
                      </div>
                    ))}
                    {test.parameters.length > 3 && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        +{test.parameters.length - 3} autres paramètres
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button 
                    onClick={() => handleEdit(test)}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 text-sm font-medium"
                  >
                    Modifier
                  </button>
                  <button 
                    onClick={() => handleDelete(test.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {((viewMode === 'results' && filteredResults.length === 0) || 
          (viewMode === 'tests' && filteredTests.length === 0)) && (
          <div className="text-center py-12">
            <FlaskConical className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucun {viewMode === 'results' ? 'résultat' : 'test'} trouvé
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showTestModal && (
        <LabTestModal
          test={editingTest}
          onClose={closeModals}
        />
      )}

      {showResultModal && (
        <LabResultModal
          result={editingResult}
          onClose={closeModals}
        />
      )}

      {viewingResult && (
        <LabResultDetails
          result={viewingResult}
          onClose={() => setViewingResult(null)}
        />
      )}
    </div>
  );
};

export default Laboratory;