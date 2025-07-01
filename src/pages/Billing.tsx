import React, { useState, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { Search, Plus, DollarSign, Clock, CheckCircle, XCircle, CreditCard, FileText, Filter, Eye, Edit, Trash2, Printer, Download, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import InvoiceModal from '../components/billing/InvoiceModal';
import InvoiceDetails from '../components/billing/InvoiceDetails';
import InvoiceStats from '../components/billing/InvoiceStats';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Billing: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Filtrer les factures selon les critères
  const filteredInvoices = state.invoices.filter(invoice => {
    const patient = state.patients.find(p => p.id === invoice.patientId);
    
    // Filtre par recherche
    const matchesSearch = patient && (
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Filtre par statut
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    
    // Filtre par méthode de paiement
    const matchesPaymentMethod = filterPaymentMethod === 'all' || invoice.paymentMethod === filterPaymentMethod;
    
    // Filtre par date
    let matchesDateRange = true;
    const invoiceDate = new Date(invoice.date);
    const today = new Date();
    
    if (filterDateRange === 'today') {
      matchesDateRange = invoiceDate.toDateString() === today.toDateString();
    } else if (filterDateRange === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      matchesDateRange = invoiceDate >= weekStart;
    } else if (filterDateRange === 'month') {
      matchesDateRange = 
        invoiceDate.getMonth() === today.getMonth() && 
        invoiceDate.getFullYear() === today.getFullYear();
    } else if (filterDateRange === 'year') {
      matchesDateRange = invoiceDate.getFullYear() === today.getFullYear();
    }
    
    return matchesSearch && matchesStatus && matchesPaymentMethod && matchesDateRange;
  });

  // Statistiques
  const totalRevenue = state.invoices.filter(i => i.status === 'paid').reduce((sum, invoice) => sum + invoice.total, 0);
  const pendingAmount = state.invoices.filter(i => i.status === 'pending').reduce((sum, invoice) => sum + invoice.total, 0);
  const overdueAmount = state.invoices.filter(i => i.status === 'overdue').reduce((sum, invoice) => sum + invoice.total, 0);
  const monthlyRevenue = state.invoices.filter(i => {
    const invoiceDate = new Date(i.date);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return i.status === 'paid' && invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear;
  }).reduce((sum, invoice) => sum + invoice.total, 0);

  const paidCount = state.invoices.filter(i => i.status === 'paid').length;
  const pendingCount = state.invoices.filter(i => i.status === 'pending').length;
  const overdueCount = state.invoices.filter(i => i.status === 'overdue').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payée';
      case 'pending':
        return 'En attente';
      case 'overdue':
        return 'En retard';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleEdit = (invoice: any) => {
    setEditingInvoice(invoice);
    setShowModal(true);
  };

  const handleView = (invoice: any) => {
    setViewingInvoice(invoice);
  };

  const handleDelete = (invoiceId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      dispatch({ type: 'DELETE_INVOICE', payload: invoiceId });
    }
  };

  const handlePrint = (invoice: any) => {
    const patient = state.patients.find(p => p.id === invoice.patientId);
    
    const printContent = `
      <html>
        <head>
          <title>Facture ${invoice.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 25px; }
            .header h1 { color: #2563eb; margin: 0; }
            .invoice-info { margin-bottom: 25px; background: #f8f9fa; padding: 15px; border-radius: 8px; }
            .items { margin-bottom: 25px; }
            .item { border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 5px; }
            .item-header { font-weight: bold; color: #2563eb; margin-bottom: 8px; }
            .item-details { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total { font-weight: bold; font-size: 18px; text-align: right; background: #e3f2fd; padding: 15px; border-radius: 8px; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .status.paid { background: #d4edda; color: #155724; }
            .status.pending { background: #fff3cd; color: #856404; }
            .status.overdue { background: #f8d7da; color: #721c24; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .text-right { text-align: right; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏥 MediCenter - Facture</h1>
            <p><strong>Facture N°:</strong> ${invoice.id}</p>
            <p><strong>Date d'impression:</strong> ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          </div>
          
          <div class="invoice-info">
            <h2>📋 Informations Facture</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <p><strong>Patient:</strong> ${patient?.firstName} ${patient?.lastName}</p>
                <p><strong>Date facture:</strong> ${new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p><strong>Statut:</strong> <span class="status ${invoice.status}">${getStatusText(invoice.status)}</span></p>
                <p><strong>Méthode paiement:</strong> ${invoice.paymentMethod || 'Non spécifiée'}</p>
                ${invoice.paymentDate ? `<p><strong>Date paiement:</strong> ${new Date(invoice.paymentDate).toLocaleDateString('fr-FR')}</p>` : ''}
              </div>
            </div>
          </div>
          
          <div class="items">
            <h2>🩺 Services et Prestations</h2>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="text-right">Quantité</th>
                  <th class="text-right">Prix unitaire</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map((item: any) => `
                  <tr>
                    <td>${item.description}</td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">${formatCurrency(item.unitPrice, 'XOF')}</td>
                    <td class="text-right">${formatCurrency(item.total, 'XOF')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="total">
            <div style="margin-bottom: 10px;">
              <span>Sous-total: ${formatCurrency(invoice.subtotal, 'XOF')}</span>
            </div>
            <div style="margin-bottom: 10px;">
              <span>TVA: ${formatCurrency(invoice.tax, 'XOF')}</span>
            </div>
            <h3>💰 Total à payer: ${formatCurrency(invoice.total, 'XOF')}</h3>
          </div>

          <div class="footer">
            <p>Document généré automatiquement par MediCenter</p>
            <p>© ${new Date().getFullYear()} - Système de Gestion de Centre de Santé</p>
            <p>15 Avenue Léopold Sédar Senghor, Dakar, Sénégal</p>
            <p>Tel: +221 33 123 45 67 | Email: contact@medicenter.sn</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const exportToExcel = () => {
    // Préparer les données pour l'export
    const data = filteredInvoices.map(invoice => {
      const patient = state.patients.find(p => p.id === invoice.patientId);
      return {
        'N° Facture': invoice.id,
        'Patient': patient ? `${patient.firstName} ${patient.lastName}` : 'Inconnu',
        'Date': new Date(invoice.date).toLocaleDateString('fr-FR'),
        'Montant': invoice.total,
        'Statut': getStatusText(invoice.status),
        'Méthode de paiement': invoice.paymentMethod || 'Non spécifiée',
        'Date de paiement': invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString('fr-FR') : '-'
      };
    });

    // Créer un workbook et ajouter une feuille avec les données
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Ajouter la feuille au workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Factures');
    
    // Générer le fichier Excel et le télécharger
    XLSX.writeFile(wb, `Factures_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    // Créer un nouveau document PDF
    const doc = new jsPDF();
    
    // Ajouter un titre
    doc.setFontSize(18);
    doc.text('Liste des Factures', 14, 22);
    
    // Ajouter la date d'export
    doc.setFontSize(11);
    doc.text(`Exporté le: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
    
    // Préparer les données pour le tableau
    const tableData = filteredInvoices.map(invoice => {
      const patient = state.patients.find(p => p.id === invoice.patientId);
      return [
        invoice.id,
        patient ? `${patient.firstName} ${patient.lastName}` : 'Inconnu',
        new Date(invoice.date).toLocaleDateString('fr-FR'),
        formatCurrency(invoice.total, 'XOF'),
        getStatusText(invoice.status),
        invoice.paymentMethod || 'Non spécifiée'
      ];
    });
    
    // Définir les en-têtes du tableau
    const headers = [
      'N° Facture', 
      'Patient', 
      'Date', 
      'Montant', 
      'Statut', 
      'Méthode de paiement'
    ];
    
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
    doc.save(`Factures_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingInvoice(null);
  };

  const paymentMethods = [...new Set(state.invoices.map(i => i.paymentMethod).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Facturation Intégrée</h1>
        <div className="flex space-x-2">
          <button 
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
            title="Exporter en Excel"
          >
            <Download className="h-4 w-4" />
            <span>Excel</span>
          </button>
          <button 
            onClick={exportToPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700 transition-colors"
            title="Exporter en PDF"
          >
            <Download className="h-4 w-4" />
            <span>PDF</span>
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle Facture</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <InvoiceStats 
        totalRevenue={totalRevenue}
        monthlyRevenue={monthlyRevenue}
        pendingAmount={pendingAmount}
        overdueAmount={overdueAmount}
        invoiceCount={state.invoices.length}
        paidCount={paidCount}
        pendingCount={pendingCount}
        overdueCount={overdueCount}
      />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par patient ou numéro de facture..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="paid">Payées</option>
                <option value="pending">En attente</option>
                <option value="overdue">En retard</option>
                <option value="cancelled">Annulées</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <select
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Toutes méthodes</option>
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Toutes dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table ref={tableRef} className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Facture
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Services
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Paiement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInvoices.map((invoice) => {
                const patient = state.patients.find(p => p.id === invoice.patientId);
                
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            #{invoice.id.slice(-8)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {invoice.items.length} élément(s)
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {patient?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(invoice.date).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {invoice.items.slice(0, 2).map((item, index) => (
                          <div key={index} className="truncate">
                            {item.description}
                          </div>
                        ))}
                        {invoice.items.length > 2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            +{invoice.items.length - 2} autres
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(invoice.total, 'XOF')}
                      </div>
                      {invoice.tax > 0 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          dont {formatCurrency(invoice.tax, 'XOF')} de TVA
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(invoice.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                          {getStatusText(invoice.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                        {invoice.paymentMethod || 'Non spécifié'}
                      </div>
                      {invoice.paymentDate && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(invoice.paymentDate).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleView(invoice)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          title="Voir"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(invoice)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handlePrint(invoice)}
                          className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                          title="Imprimer"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(invoice.id)}
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

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Aucune facture trouvée</p>
          </div>
        )}
      </div>

      {showModal && (
        <InvoiceModal
          invoice={editingInvoice}
          onClose={closeModal}
        />
      )}

      {viewingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Détails de la Facture
              </h2>
              <button
                onClick={() => setViewingInvoice(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <InvoiceDetails invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;