import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Invoice } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { FileText, User, Calendar, CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';
import PrintableDocument from '../common/PrintableDocument';

interface InvoiceDetailsProps {
  invoice: Invoice;
  onClose: () => void;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ invoice, onClose }) => {
  const { state, dispatch } = useApp();
  
  const patient = state.patients.find(p => p.id === invoice.patientId);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'overdue':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
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

  const handleMarkAsPaid = () => {
    if (invoice.status === 'pending' || invoice.status === 'overdue') {
      const updatedInvoice = {
        ...invoice,
        status: 'paid' as const,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: invoice.paymentMethod || 'Espèces'
      };
      
      dispatch({ type: 'UPDATE_INVOICE', payload: updatedInvoice });
    }
  };

  return (
    <PrintableDocument title={`Facture #${invoice.id.slice(-8)}`}>
      <div className="space-y-6">
        {/* En-tête de la facture */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Facture #{invoice.id.slice(-8)}
              </h2>
              <div className="flex items-center mt-1 space-x-2">
                {getStatusIcon(invoice.status)}
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                  {getStatusText(invoice.status)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Date: {new Date(invoice.date).toLocaleDateString('fr-FR')}</span>
              </div>
              {invoice.paymentDate && (
                <div className="flex items-center space-x-2 mt-1">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span>Payée le: {new Date(invoice.paymentDate).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
            </div>
            
            {invoice.status === 'pending' || invoice.status === 'overdue' ? (
              <button
                onClick={handleMarkAsPaid}
                className="mt-2 bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors print:hidden"
              >
                Marquer comme payée
              </button>
            ) : null}
          </div>
        </div>
        
        {/* Informations du patient */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">Informations du patient</h3>
          </div>
          
          {patient ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nom complet:</p>
                <p className="font-medium text-gray-900 dark:text-white">{patient.firstName} {patient.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Contact:</p>
                <p className="font-medium text-gray-900 dark:text-white">{patient.phone}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{patient.email}</p>
              </div>
              {patient.insurance.provider && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Assurance:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {patient.insurance.provider} - {patient.insurance.number}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">Patient non trouvé</p>
          )}
        </div>
        
        {/* Éléments de la facture */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Détails des prestations</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Prix unitaire
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-normal">
                      <div className="text-sm text-gray-900 dark:text-white">{item.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900 dark:text-white">{item.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(item.unitPrice, 'XOF')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(item.total, 'XOF')}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Résumé financier */}
        <div className="flex justify-end">
          <div className="w-full md:w-1/2 space-y-2">
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Sous-total:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(invoice.subtotal, 'XOF')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">TVA (0%):</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(invoice.tax, 'XOF')}</span>
            </div>
            <div className="flex justify-between py-2 text-lg">
              <span className="font-bold text-gray-900 dark:text-white">Total:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(invoice.total, 'XOF')}</span>
            </div>
          </div>
        </div>
        
        {/* Informations de paiement */}
        {(invoice.paymentMethod || invoice.status === 'paid') && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
              Informations de paiement
            </h3>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Méthode de paiement:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{invoice.paymentMethod || 'Non spécifiée'}</p>
                </div>
                {invoice.paymentDate && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Date de paiement:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{new Date(invoice.paymentDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Notes et conditions */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 text-sm text-gray-600 dark:text-gray-400">
          <p>Merci de votre confiance. Pour toute question concernant cette facture, veuillez contacter notre service de facturation.</p>
          <p className="mt-2">Conditions de paiement: Paiement à réception de la facture.</p>
        </div>
        
        {/* Pied de page */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>MediCenter - Système de Gestion de Centre de Santé</p>
          <p>15 Avenue Léopold Sédar Senghor, Dakar, Sénégal</p>
          <p>Tel: +221 33 123 45 67 | Email: contact@medicenter.sn</p>
        </div>
      </div>
    </PrintableDocument>
  );
};

export default InvoiceDetails;