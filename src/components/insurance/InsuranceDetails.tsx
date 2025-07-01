import React from 'react';
import { X, Building, Shield, User, FileText, Calendar, Phone, Mail, Globe, CheckCircle, XCircle, Clock, CreditCard, Download, Upload } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency } from '../../utils/currency';
import PrintableDocument from '../common/PrintableDocument';

interface InsuranceDetailsProps {
  type: 'providers' | 'policies' | 'patients' | 'claims';
  data: any;
  onClose: () => void;
}

const InsuranceDetails: React.FC<InsuranceDetailsProps> = ({ type, data, onClose }) => {
  const { state } = useApp();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'pending':
      case 'submitted':
      case 'in-review':
        return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'expired':
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'cancelled':
      case 'partially-approved':
        return <XCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
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

  const renderProviderDetails = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3">
            <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{data.name}</h2>
            <div className="flex items-center mt-1 space-x-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                data.isActive 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {data.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Coordonnées</h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center text-gray-900 dark:text-white">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  {data.phone}
                </div>
                <div className="flex items-center text-gray-900 dark:text-white">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <a href={`mailto:${data.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {data.email}
                  </a>
                </div>
                {data.website && (
                  <div className="flex items-center text-gray-900 dark:text-white">
                    <Globe className="h-4 w-4 text-gray-400 mr-2" />
                    <a 
                      href={data.website.startsWith('http') ? data.website : `https://${data.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {data.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Adresse</h3>
              <p className="mt-2 text-gray-900 dark:text-white">{data.address}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Personne de contact</h3>
              <p className="mt-2 text-gray-900 dark:text-white">{data.contactPerson}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Polices d'assurance</h3>
              <div className="mt-2 space-y-2">
                {state.insurancePolicies.filter(p => p.providerId === data.id).map(policy => (
                  <div key={policy.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{policy.name}</span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {policy.coveragePercentage}% • {policy.annualLimit ? formatCurrency(policy.annualLimit, 'XOF') : 'Illimité'}
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      policy.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {policy.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                ))}
                {state.insurancePolicies.filter(p => p.providerId === data.id).length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Aucune police d'assurance</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Patients assurés</h3>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            {state.patientInsurances.filter(pi => {
              const provider = state.insuranceProviders.find(p => p.id === pi.providerId);
              return provider?.id === data.id;
            }).slice(0, 6).map(insurance => {
              const patient = state.patients.find(p => p.id === insurance.patientId);
              return (
                <div key={insurance.id} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu'}
                  </span>
                </div>
              );
            })}
            {state.patientInsurances.filter(pi => {
              const provider = state.insuranceProviders.find(p => p.id === pi.providerId);
              return provider?.id === data.id;
            }).length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 md:col-span-2">Aucun patient assuré</p>
            )}
            {state.patientInsurances.filter(pi => {
              const provider = state.insuranceProviders.find(p => p.id === pi.providerId);
              return provider?.id === data.id;
            }).length > 6 && (
              <div className="md:col-span-2 text-center mt-2">
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  +{state.patientInsurances.filter(pi => {
                    const provider = state.insuranceProviders.find(p => p.id === pi.providerId);
                    return provider?.id === data.id;
                  }).length - 6} autres patients
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-500 dark:text-gray-400">
          <p>Créé le: {new Date(data.createdAt).toLocaleDateString('fr-FR')}</p>
          {data.updatedAt && <p>Dernière mise à jour: {new Date(data.updatedAt).toLocaleDateString('fr-FR')}</p>}
        </div>
      </div>
    );
  };

  const renderPolicyDetails = () => {
    const provider = state.insuranceProviders.find(p => p.id === data.providerId);
    const coveredServices = Object.entries(data.coverageDetails)
      .filter(([_, covered]) => covered)
      .map(([service]) => service);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-3">
            <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{data.name}</h2>
            <div className="flex items-center mt-1 space-x-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                data.isActive 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {data.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
          <p className="mt-2 text-gray-900 dark:text-white">{data.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Assureur</h3>
              <div className="mt-2 flex items-center">
                <Building className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-900 dark:text-white">{provider?.name || 'Inconnu'}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Couverture</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-900 dark:text-white">Pourcentage:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{data.coveragePercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 dark:text-white">Plafond annuel:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {data.annualLimit ? formatCurrency(data.annualLimit, 'XOF') : 'Illimité'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 dark:text-white">Délai d'attente:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {data.waitingPeriod} jours
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Services couverts</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {coveredServices.map((service, index) => (
                  <span key={index} className="inline-block bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs px-2 py-1 rounded">
                    {service.charAt(0).toUpperCase() + service.slice(1)}
                  </span>
                ))}
                {coveredServices.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Aucun service couvert</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Exclusions</h3>
              <div className="mt-2 space-y-1">
                {data.exclusions.map((exclusion: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <XCircle className="h-3 w-3 text-red-600 dark:text-red-400 mr-2" />
                    <span className="text-sm text-gray-900 dark:text-white">{exclusion}</span>
                  </div>
                ))}
                {data.exclusions.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Aucune exclusion</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Patients assurés</h3>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            {state.patientInsurances.filter(pi => pi.policyId === data.id).slice(0, 6).map(insurance => {
              const patient = state.patients.find(p => p.id === insurance.patientId);
              return (
                <div key={insurance.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(insurance.status)}
                    <span className={`ml-1 text-xs ${getStatusColor(insurance.status)}`}>
                      {getStatusText(insurance.status)}
                    </span>
                  </div>
                </div>
              );
            })}
            {state.patientInsurances.filter(pi => pi.policyId === data.id).length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 md:col-span-2">Aucun patient assuré</p>
            )}
            {state.patientInsurances.filter(pi => pi.policyId === data.id).length > 6 && (
              <div className="md:col-span-2 text-center mt-2">
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  +{state.patientInsurances.filter(pi => pi.policyId === data.id).length - 6} autres patients
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-500 dark:text-gray-400">
          <p>Créé le: {new Date(data.createdAt).toLocaleDateString('fr-FR')}</p>
          {data.updatedAt && <p>Dernière mise à jour: {new Date(data.updatedAt).toLocaleDateString('fr-FR')}</p>}
        </div>
      </div>
    );
  };

  const renderPatientInsuranceDetails = () => {
    const patient = state.patients.find(p => p.id === data.patientId);
    const provider = state.insuranceProviders.find(p => p.id === data.providerId);
    const policy = state.insurancePolicies.find(p => p.id === data.policyId);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-3">
            <User className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu'}
            </h2>
            <div className="flex items-center mt-1 space-x-2">
              {getStatusIcon(data.status)}
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(data.status)}`}>
                {getStatusText(data.status)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Informations d'assurance</h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <Building className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900 dark:text-white">{provider?.name || 'Inconnu'}</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900 dark:text-white">{policy?.name || 'Inconnue'}</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900 dark:text-white">N° Police: {data.policyNumber}</span>
                </div>
                {data.cardNumber && (
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900 dark:text-white">N° Carte: {data.cardNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Période de validité</h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900 dark:text-white">
                    Du {new Date(data.startDate).toLocaleDateString('fr-FR')} au {new Date(data.endDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Couverture</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-900 dark:text-white">Pourcentage:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{data.coveragePercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 dark:text-white">Plafond annuel:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {data.annualLimit ? formatCurrency(data.annualLimit, 'XOF') : 'Illimité'}
                  </span>
                </div>
                {data.usedAmount !== undefined && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-900 dark:text-white">Montant utilisé:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(data.usedAmount, 'XOF')}
                      </span>
                    </div>
                    {data.annualLimit > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-900 dark:text-white">Disponible:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(Math.max(0, data.annualLimit - (data.usedAmount || 0)), 'XOF')}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {data.dependents && data.dependents.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Personnes à charge</h3>
                <div className="mt-2 space-y-2">
                  {data.dependents.map((dependent: any, index: number) => (
                    <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{dependent.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {dependent.relationship} • Né(e) le {new Date(dependent.dateOfBirth).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {data.notes && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</h3>
            <p className="mt-2 text-gray-900 dark:text-white">{data.notes}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Demandes de remboursement</h3>
          <div className="mt-2 space-y-2">
            {state.insuranceClaims.filter(claim => claim.patientInsuranceId === data.id).map(claim => (
              <div key={claim.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{claim.claimNumber}</span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(claim.submissionDate).toLocaleDateString('fr-FR')} • {formatCurrency(claim.coveredAmount, 'XOF')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(claim.status)}
                  <span className={`ml-1 text-xs ${getStatusColor(claim.status)}`}>
                    {getStatusText(claim.status)}
                  </span>
                </div>
              </div>
            ))}
            {state.insuranceClaims.filter(claim => claim.patientInsuranceId === data.id).length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                Aucune demande de remboursement
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-500 dark:text-gray-400">
          <p>Créé le: {new Date(data.createdAt).toLocaleDateString('fr-FR')}</p>
          {data.updatedAt && <p>Dernière mise à jour: {new Date(data.updatedAt).toLocaleDateString('fr-FR')}</p>}
        </div>
      </div>
    );
  };

  const renderClaimDetails = () => {
    const patient = state.patients.find(p => p.id === data.patientId);
    const patientInsurance = state.patientInsurances.find(pi => pi.id === data.patientInsuranceId);
    const provider = patientInsurance ? state.insuranceProviders.find(p => p.id === patientInsurance.providerId) : null;
    const policy = patientInsurance ? state.insurancePolicies.find(p => p.id === patientInsurance.policyId) : null;
    const invoice = state.invoices.find(i => i.id === data.invoiceId);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="bg-orange-100 dark:bg-orange-900/20 rounded-lg p-3">
            <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Demande de remboursement {data.claimNumber}
            </h2>
            <div className="flex items-center mt-1 space-x-2">
              {getStatusIcon(data.status)}
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(data.status)}`}>
                {getStatusText(data.status)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Patient</h3>
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900 dark:text-white">
                    {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu'}
                  </span>
                </div>
                {patient && (
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {patient.phone} • {patient.email}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Assurance</h3>
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <Building className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900 dark:text-white">{provider?.name || 'Inconnu'}</span>
                </div>
                <div className="mt-1">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900 dark:text-white">{policy?.name || 'Inconnue'}</span>
                  </div>
                  {patientInsurance && (
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      N° Police: {patientInsurance.policyNumber} • {patientInsurance.coveragePercentage}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Facture</h3>
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900 dark:text-white">
                    {invoice ? `#${invoice.id.slice(-8)}` : 'Inconnue'}
                  </span>
                </div>
                {invoice && (
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Date: {new Date(invoice.date).toLocaleDateString('fr-FR')} • Total: {formatCurrency(invoice.total, 'XOF')}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Montants</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-900 dark:text-white">Total facturé:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(data.totalAmount, 'XOF')}
                  </span>
                </div>
                <div className="flex justify-between p-2 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <span className="text-green-800 dark:text-green-400">Montant couvert:</span>
                  <span className="font-medium text-green-800 dark:text-green-400">
                    {formatCurrency(data.coveredAmount, 'XOF')}
                  </span>
                </div>
                <div className="flex justify-between p-2 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                  <span className="text-orange-800 dark:text-orange-400">Reste à charge patient:</span>
                  <span className="font-medium text-orange-800 dark:text-orange-400">
                    {formatCurrency(data.patientResponsibility, 'XOF')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date de soumission</h3>
            <div className="mt-2 flex items-center">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-900 dark:text-white">
                {new Date(data.submissionDate).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>

          {data.approvalDate && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date d'approbation</h3>
              <div className="mt-2 flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-900 dark:text-white">
                  {new Date(data.approvalDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          )}

          {data.paymentDate && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date de paiement</h3>
              <div className="mt-2 flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-900 dark:text-white">
                  {new Date(data.paymentDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          )}
        </div>

        {data.rejectionReason && (
          <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Motif de rejet</h3>
            <p className="mt-1 text-red-700 dark:text-red-300">{data.rejectionReason}</p>
          </div>
        )}

        {data.documents && data.documents.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Documents justificatifs</h3>
            <div className="mt-2 space-y-2">
              {data.documents.map((document: string, index: number) => (
                <div key={index} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                  <span className="text-sm text-gray-900 dark:text-white">{document}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.notes && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</h3>
            <p className="mt-2 text-gray-900 dark:text-white">{data.notes}</p>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-500 dark:text-gray-400">
          <p>Créé le: {new Date(data.createdAt).toLocaleDateString('fr-FR')}</p>
          {data.updatedAt && <p>Dernière mise à jour: {new Date(data.updatedAt).toLocaleDateString('fr-FR')}</p>}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (type) {
      case 'providers':
        return renderProviderDetails();
      case 'policies':
        return renderPolicyDetails();
      case 'patients':
        return renderPatientInsuranceDetails();
      case 'claims':
        return renderClaimDetails();
      default:
        return <p>Aucune information disponible</p>;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'providers':
        return `Assureur: ${data.name}`;
      case 'policies':
        return `Police d'assurance: ${data.name}`;
      case 'patients':
        const patient = state.patients.find(p => p.id === data.patientId);
        return `Assurance: ${patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu'}`;
      case 'claims':
        return `Demande de remboursement: ${data.claimNumber}`;
      default:
        return 'Détails';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {getTitle()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          <PrintableDocument title={getTitle()}>
            {renderContent()}
          </PrintableDocument>
        </div>
      </div>
    </div>
  );
};

export default InsuranceDetails;