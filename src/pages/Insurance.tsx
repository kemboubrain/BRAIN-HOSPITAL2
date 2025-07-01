import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Search, Plus, Filter, Shield, Building, FileText, User, Calendar, CheckCircle, XCircle, Clock, Edit, Trash2, Eye, Download, CreditCard } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import InsuranceProviderModal from '../components/insurance/InsuranceProviderModal';
import InsurancePolicyModal from '../components/insurance/InsurancePolicyModal';
import PatientInsuranceModal from '../components/insurance/PatientInsuranceModal';
import InsuranceClaimModal from '../components/insurance/InsuranceClaimModal';
import InsuranceDetails from '../components/insurance/InsuranceDetails';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Insurance: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'providers' | 'policies' | 'patients' | 'claims'>('providers');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProvider, setFilterProvider] = useState('all');
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showPatientInsuranceModal, setShowPatientInsuranceModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [editingPolicy, setEditingPolicy] = useState<any>(null);
  const [editingPatientInsurance, setEditingPatientInsurance] = useState<any>(null);
  const [editingClaim, setEditingClaim] = useState<any>(null);
  const [viewingDetails, setViewingDetails] = useState<any>(null);

  // Filtrer les données selon le mode d'affichage et les critères
  const getFilteredData = () => {
    switch (viewMode) {
      case 'providers':
        return state.insuranceProviders.filter(provider => 
          provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          provider.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      case 'policies':
        return state.insurancePolicies.filter(policy => {
          const provider = state.insuranceProviders.find(p => p.id === policy.providerId);
          const matchesSearch = 
            policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            policy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (provider && provider.name.toLowerCase().includes(searchTerm.toLowerCase()));
          
          const matchesProvider = filterProvider === 'all' || policy.providerId === filterProvider;
          const matchesStatus = filterStatus === 'all' || 
            (filterStatus === 'active' && policy.isActive) || 
            (filterStatus === 'inactive' && !policy.isActive);
          
          return matchesSearch && matchesProvider && matchesStatus;
        });
      
      case 'patients':
        return state.patientInsurances.filter(insurance => {
          const patient = state.patients.find(p => p.id === insurance.patientId);
          const provider = state.insuranceProviders.find(p => p.id === insurance.providerId);
          const policy = state.insurancePolicies.find(p => p.id === insurance.policyId);
          
          const matchesSearch = 
            (patient && (
              patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              patient.lastName.toLowerCase().includes(searchTerm.toLowerCase())
            )) ||
            insurance.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (provider && provider.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (policy && policy.name.toLowerCase().includes(searchTerm.toLowerCase()));
          
          const matchesProvider = filterProvider === 'all' || insurance.providerId === filterProvider;
          const matchesStatus = filterStatus === 'all' || insurance.status === filterStatus;
          
          return matchesSearch && matchesProvider && matchesStatus;
        });
      
      case 'claims':
        return state.insuranceClaims.filter(claim => {
          const patient = state.patients.find(p => p.id === claim.patientId);
          const patientInsurance = state.patientInsurances.find(pi => pi.id === claim.patientInsuranceId);
          const provider = patientInsurance ? state.insuranceProviders.find(p => p.id === patientInsurance.providerId) : null;
          
          const matchesSearch = 
            claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (patient && (
              patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              patient.lastName.toLowerCase().includes(searchTerm.toLowerCase())
            )) ||
            (provider && provider.name.toLowerCase().includes(searchTerm.toLowerCase()));
          
          const matchesProvider = filterProvider === 'all' || 
            (patientInsurance && patientInsurance.providerId === filterProvider);
          
          const matchesStatus = filterStatus === 'all' || claim.status === filterStatus;
          
          return matchesSearch && matchesProvider && matchesStatus;
        });
      
      default:
        return [];
    }
  };

  const filteredData = getFilteredData();

  // Statistiques
  const totalProviders = state.insuranceProviders.length;
  const activeProviders = state.insuranceProviders.filter(p => p.isActive).length;
  
  const totalPolicies = state.insurancePolicies.length;
  const activePolicies = state.insurancePolicies.filter(p => p.isActive).length;
  
  const totalPatientInsurances = state.patientInsurances.length;
  const activePatientInsurances = state.patientInsurances.filter(pi => pi.status === 'active').length;
  
  const totalClaims = state.insuranceClaims.length;
  const approvedClaims = state.insuranceClaims.filter(c => c.status === 'approved' || c.status === 'paid').length;
  const pendingClaims = state.insuranceClaims.filter(c => c.status === 'submitted' || c.status === 'in-review').length;
  
  const totalCoveredAmount = state.insuranceClaims
    .filter(c => c.status === 'approved' || c.status === 'paid' || c.status === 'partially-approved')
    .reduce((sum, claim) => sum + claim.coveredAmount, 0);

  // Fonctions de gestion
  const handleEdit = (item: any) => {
    switch (viewMode) {
      case 'providers':
        setEditingProvider(item);
        setShowProviderModal(true);
        break;
      case 'policies':
        setEditingPolicy(item);
        setShowPolicyModal(true);
        break;
      case 'patients':
        setEditingPatientInsurance(item);
        setShowPatientInsuranceModal(true);
        break;
      case 'claims':
        setEditingClaim(item);
        setShowClaimModal(true);
        break;
    }
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
    
    switch (viewMode) {
      case 'providers':
        dispatch({ type: 'DELETE_INSURANCE_PROVIDER', payload: id });
        break;
      case 'policies':
        dispatch({ type: 'DELETE_INSURANCE_POLICY', payload: id });
        break;
      case 'patients':
        dispatch({ type: 'DELETE_PATIENT_INSURANCE', payload: id });
        break;
      case 'claims':
        dispatch({ type: 'DELETE_INSURANCE_CLAIM', payload: id });
        break;
    }
  };

  const handleView = (item: any) => {
    setViewingDetails({
      type: viewMode,
      data: item
    });
  };

  const exportToExcel = () => {
    let data: any[] = [];
    let filename = '';
    
    switch (viewMode) {
      case 'providers':
        data = filteredData.map(provider => ({
          'Nom': provider.name,
          'Contact': provider.contactPerson,
          'Téléphone': provider.phone,
          'Email': provider.email,
          'Adresse': provider.address,
          'Statut': provider.isActive ? 'Actif' : 'Inactif'
        }));
        filename = 'Assureurs';
        break;
      
      case 'policies':
        data = filteredData.map(policy => {
          const provider = state.insuranceProviders.find(p => p.id === policy.providerId);
          return {
            'Police': policy.name,
            'Assureur': provider?.name || 'Inconnu',
            'Couverture (%)': policy.coveragePercentage,
            'Plafond annuel': policy.annualLimit ? formatCurrency(policy.annualLimit, 'XOF') : 'Illimité',
            'Statut': policy.isActive ? 'Actif' : 'Inactif'
          };
        });
        filename = 'Polices_Assurance';
        break;
      
      case 'patients':
        data = filteredData.map(insurance => {
          const patient = state.patients.find(p => p.id === insurance.patientId);
          const provider = state.insuranceProviders.find(p => p.id === insurance.providerId);
          const policy = state.insurancePolicies.find(p => p.id === insurance.policyId);
          return {
            'Patient': patient ? `${patient.firstName} ${patient.lastName}` : 'Inconnu',
            'Assureur': provider?.name || 'Inconnu',
            'Police': policy?.name || 'Inconnue',
            'N° Police': insurance.policyNumber,
            'Couverture (%)': insurance.coveragePercentage,
            'Début': new Date(insurance.startDate).toLocaleDateString('fr-FR'),
            'Fin': new Date(insurance.endDate).toLocaleDateString('fr-FR'),
            'Statut': insurance.status
          };
        });
        filename = 'Patients_Assurances';
        break;
      
      case 'claims':
        data = filteredData.map(claim => {
          const patient = state.patients.find(p => p.id === claim.patientId);
          return {
            'N° Demande': claim.claimNumber,
            'Patient': patient ? `${patient.firstName} ${patient.lastName}` : 'Inconnu',
            'Date soumission': new Date(claim.submissionDate).toLocaleDateString('fr-FR'),
            'Montant total': formatCurrency(claim.totalAmount, 'XOF'),
            'Montant couvert': formatCurrency(claim.coveredAmount, 'XOF'),
            'Reste à charge': formatCurrency(claim.patientResponsibility, 'XOF'),
            'Statut': claim.status
          };
        });
        filename = 'Demandes_Remboursement';
        break;
    }
    
    // Créer un workbook et ajouter une feuille avec les données
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Ajouter la feuille au workbook
    XLSX.utils.book_append_sheet(wb, ws, filename);
    
    // Générer le fichier Excel et le télécharger
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    // Créer un nouveau document PDF
    const doc = new jsPDF();
    
    // Ajouter un titre
    doc.setFontSize(18);
    let title = '';
    switch (viewMode) {
      case 'providers': title = 'Liste des Assureurs'; break;
      case 'policies': title = 'Liste des Polices d\'Assurance'; break;
      case 'patients': title = 'Liste des Patients Assurés'; break;
      case 'claims': title = 'Liste des Demandes de Remboursement'; break;
    }
    doc.text(title, 14, 22);
    
    // Ajouter la date d'export
    doc.setFontSize(11);
    doc.text(`Exporté le: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
    
    // Préparer les données pour le tableau
    let tableData: any[] = [];
    let headers: string[] = [];
    
    switch (viewMode) {
      case 'providers':
        headers = ['Nom', 'Contact', 'Téléphone', 'Email', 'Statut'];
        tableData = filteredData.map(provider => [
          provider.name,
          provider.contactPerson,
          provider.phone,
          provider.email,
          provider.isActive ? 'Actif' : 'Inactif'
        ]);
        break;
      
      case 'policies':
        headers = ['Police', 'Assureur', 'Couverture (%)', 'Plafond', 'Statut'];
        tableData = filteredData.map(policy => {
          const provider = state.insuranceProviders.find(p => p.id === policy.providerId);
          return [
            policy.name,
            provider?.name || 'Inconnu',
            `${policy.coveragePercentage}%`,
            policy.annualLimit ? formatCurrency(policy.annualLimit, 'XOF') : 'Illimité',
            policy.isActive ? 'Actif' : 'Inactif'
          ];
        });
        break;
      
      case 'patients':
        headers = ['Patient', 'Assureur', 'Police', 'N° Police', 'Statut'];
        tableData = filteredData.map(insurance => {
          const patient = state.patients.find(p => p.id === insurance.patientId);
          const provider = state.insuranceProviders.find(p => p.id === insurance.providerId);
          const policy = state.insurancePolicies.find(p => p.id === insurance.policyId);
          return [
            patient ? `${patient.firstName} ${patient.lastName}` : 'Inconnu',
            provider?.name || 'Inconnu',
            policy?.name || 'Inconnue',
            insurance.policyNumber,
            insurance.status
          ];
        });
        break;
      
      case 'claims':
        headers = ['N° Demande', 'Patient', 'Date', 'Montant total', 'Montant couvert', 'Statut'];
        tableData = filteredData.map(claim => {
          const patient = state.patients.find(p => p.id === claim.patientId);
          return [
            claim.claimNumber,
            patient ? `${patient.firstName} ${patient.lastName}` : 'Inconnu',
            new Date(claim.submissionDate).toLocaleDateString('fr-FR'),
            formatCurrency(claim.totalAmount, 'XOF'),
            formatCurrency(claim.coveredAmount, 'XOF'),
            claim.status
          ];
        });
        break;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
      case 'submitted':
      case 'in-review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'expired':
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'cancelled':
      case 'partially-approved':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'expired': return 'Expiré';
      case 'cancelled': return 'Annulé';
      case 'pending': return 'En attente';
      case 'submitted': return 'Soumise';
      case 'in-review': return 'En révision';
      case 'approved': return 'Approuvée';
      case 'partially-approved': return 'Partiellement approuvée';
      case 'rejected': return 'Rejetée';
      case 'paid': return 'Payée';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'pending':
      case 'submitted':
      case 'in-review':
        return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case 'expired':
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'cancelled':
      case 'partially-approved':
        return <XCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const closeModals = () => {
    setShowProviderModal(false);
    setShowPolicyModal(false);
    setShowPatientInsuranceModal(false);
    setShowClaimModal(false);
    setEditingProvider(null);
    setEditingPolicy(null);
    setEditingPatientInsurance(null);
    setEditingClaim(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Assurances</h1>
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
              switch (viewMode) {
                case 'providers': setShowProviderModal(true); break;
                case 'policies': setShowPolicyModal(true); break;
                case 'patients': setShowPatientInsuranceModal(true); break;
                case 'claims': setShowClaimModal(true); break;
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>
              {viewMode === 'providers' ? 'Nouvel Assureur' : 
               viewMode === 'policies' ? 'Nouvelle Police' : 
               viewMode === 'patients' ? 'Nouvelle Assurance' : 
               'Nouvelle Demande'}
            </span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assureurs</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeProviders}/{totalProviders}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Assureurs actifs</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3">
              <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Polices</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{activePolicies}/{totalPolicies}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Polices actives</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-3">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Patients Assurés</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activePatientInsurances}/{totalPatientInsurances}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Assurances actives</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-3">
              <User className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Remboursements</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(totalCoveredAmount, 'XOF')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{approvedClaims} approuvés, {pendingClaims} en attente</p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/20 rounded-lg p-3">
              <CreditCard className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('providers')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'providers' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Assureurs
              </button>
              <button
                onClick={() => setViewMode('policies')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'policies' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Polices
              </button>
              <button
                onClick={() => setViewMode('patients')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'patients' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Patients
              </button>
              <button
                onClick={() => setViewMode('claims')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'claims' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Remboursements
              </button>
            </div>
          </div>

          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Rechercher ${
                  viewMode === 'providers' ? 'un assureur' : 
                  viewMode === 'policies' ? 'une police' : 
                  viewMode === 'patients' ? 'un patient assuré' : 
                  'une demande de remboursement'
                }...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {(viewMode === 'policies' || viewMode === 'patients' || viewMode === 'claims') && (
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-gray-400" />
                <select
                  value={filterProvider}
                  onChange={(e) => setFilterProvider(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Tous les assureurs</option>
                  {state.insuranceProviders.map(provider => (
                    <option key={provider.id} value={provider.id}>{provider.name}</option>
                  ))}
                </select>
              </div>
            )}

            {(viewMode === 'policies' || viewMode === 'patients' || viewMode === 'claims') && (
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Tous les statuts</option>
                  {viewMode === 'policies' && (
                    <>
                      <option value="active">Actives</option>
                      <option value="inactive">Inactives</option>
                    </>
                  )}
                  {viewMode === 'patients' && (
                    <>
                      <option value="active">Actives</option>
                      <option value="expired">Expirées</option>
                      <option value="cancelled">Annulées</option>
                      <option value="pending">En attente</option>
                    </>
                  )}
                  {viewMode === 'claims' && (
                    <>
                      <option value="submitted">Soumises</option>
                      <option value="in-review">En révision</option>
                      <option value="approved">Approuvées</option>
                      <option value="partially-approved">Partiellement approuvées</option>
                      <option value="rejected">Rejetées</option>
                      <option value="paid">Payées</option>
                    </>
                  )}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Affichage des assureurs */}
        {viewMode === 'providers' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Assureur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Coordonnées
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Polices
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Patients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredData.map((provider) => {
                  const policiesCount = state.insurancePolicies.filter(p => p.providerId === provider.id).length;
                  const patientsCount = state.patientInsurances.filter(pi => pi.providerId === provider.id).length;
                  
                  return (
                    <tr key={provider.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                              <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {provider.name}
                            </div>
                            {provider.website && (
                              <div className="text-sm text-blue-600 dark:text-blue-400">
                                <a href={provider.website.startsWith('http') ? provider.website : `https://${provider.website}`} target="_blank" rel="noopener noreferrer">
                                  {provider.website}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {provider.contactPerson}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {provider.phone}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {provider.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {policiesCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {patientsCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          provider.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {provider.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleView(provider)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            title="Voir"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(provider)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(provider.id)}
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

        {/* Affichage des polices d'assurance */}
        {viewMode === 'policies' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Police
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Assureur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Couverture
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Plafond annuel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Services couverts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredData.map((policy) => {
                  const provider = state.insuranceProviders.find(p => p.id === policy.providerId);
                  const coveredServices = Object.entries(policy.coverageDetails)
                    .filter(([_, covered]) => covered)
                    .map(([service]) => service);
                  
                  return (
                    <tr key={policy.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {policy.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {policy.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {provider?.name || 'Inconnu'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {policy.coveragePercentage}%
                        </div>
                        {policy.waitingPeriod && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Délai d'attente: {policy.waitingPeriod} jours
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {policy.annualLimit ? formatCurrency(policy.annualLimit, 'XOF') : 'Illimité'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {coveredServices.map((service, index) => (
                            <span key={index} className="inline-block bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs px-2 py-1 rounded">
                              {service.charAt(0).toUpperCase() + service.slice(1)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          policy.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {policy.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleView(policy)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            title="Voir"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(policy)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(policy.id)}
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

        {/* Affichage des patients assurés */}
        {viewMode === 'patients' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Assurance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Numéro de police
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Couverture
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Validité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredData.map((insurance) => {
                  const patient = state.patients.find(p => p.id === insurance.patientId);
                  const provider = state.insuranceProviders.find(p => p.id === insurance.providerId);
                  const policy = state.insurancePolicies.find(p => p.id === insurance.policyId);
                  
                  return (
                    <tr key={insurance.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                              <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {patient?.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {provider?.name || 'Inconnu'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {policy?.name || 'Police inconnue'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {insurance.policyNumber}
                        {insurance.cardNumber && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Carte: {insurance.cardNumber}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {insurance.coveragePercentage}%
                        </div>
                        {insurance.annualLimit && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Plafond: {formatCurrency(insurance.annualLimit, 'XOF')}
                          </div>
                        )}
                        {insurance.usedAmount && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Utilisé: {formatCurrency(insurance.usedAmount, 'XOF')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div>Du: {new Date(insurance.startDate).toLocaleDateString('fr-FR')}</div>
                        <div>Au: {new Date(insurance.endDate).toLocaleDateString('fr-FR')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(insurance.status)}
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(insurance.status)}`}>
                            {getStatusText(insurance.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleView(insurance)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            title="Voir"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(insurance)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(insurance.id)}
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

        {/* Affichage des demandes de remboursement */}
        {viewMode === 'claims' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Demande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Assurance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Facture
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Montants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredData.map((claim) => {
                  const patient = state.patients.find(p => p.id === claim.patientId);
                  const patientInsurance = state.patientInsurances.find(pi => pi.id === claim.patientInsuranceId);
                  const provider = patientInsurance ? state.insuranceProviders.find(p => p.id === patientInsurance.providerId) : null;
                  const invoice = state.invoices.find(i => i.id === claim.invoiceId);
                  
                  return (
                    <tr key={claim.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {claim.claimNumber}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(claim.submissionDate).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {provider?.name || 'Inconnu'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {invoice ? `#${invoice.id.slice(-8)}` : 'Inconnue'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          Total: {formatCurrency(claim.totalAmount, 'XOF')}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Couvert: {formatCurrency(claim.coveredAmount, 'XOF')}
                        </div>
                        <div className="text-sm text-orange-600 dark:text-orange-400">
                          Patient: {formatCurrency(claim.patientResponsibility, 'XOF')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(claim.status)}
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(claim.status)}`}>
                            {getStatusText(claim.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleView(claim)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            title="Voir"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(claim)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(claim.id)}
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

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              {viewMode === 'providers' && <Building className="h-8 w-8 text-gray-400" />}
              {viewMode === 'policies' && <Shield className="h-8 w-8 text-gray-400" />}
              {viewMode === 'patients' && <User className="h-8 w-8 text-gray-400" />}
              {viewMode === 'claims' && <FileText className="h-8 w-8 text-gray-400" />}
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Aucun {
                viewMode === 'providers' ? 'assureur' : 
                viewMode === 'policies' ? 'police d\'assurance' : 
                viewMode === 'patients' ? 'patient assuré' : 
                'demande de remboursement'
              } trouvé
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showProviderModal && (
        <InsuranceProviderModal
          provider={editingProvider}
          onClose={closeModals}
        />
      )}

      {showPolicyModal && (
        <InsurancePolicyModal
          policy={editingPolicy}
          onClose={closeModals}
        />
      )}

      {showPatientInsuranceModal && (
        <PatientInsuranceModal
          patientInsurance={editingPatientInsurance}
          onClose={closeModals}
        />
      )}

      {showClaimModal && (
        <InsuranceClaimModal
          claim={editingClaim}
          onClose={closeModals}
        />
      )}

      {viewingDetails && (
        <InsuranceDetails
          type={viewingDetails.type}
          data={viewingDetails.data}
          onClose={() => setViewingDetails(null)}
        />
      )}
    </div>
  );
};

export default Insurance;