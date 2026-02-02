import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Search,
  Eye,
  Check,
  X,
  Trash2,
  User,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { memberRequestsService } from '@/services/memberRequests';
import {
  RegistrationRequest,
  RegistrationStatus,
  statusLabels,
  statusColors,
} from '@/types/registrationRequest';
import DashboardLayout from '@/components/DashboardLayout';
import MobileBackButton from '@/components/MobileBackButton';

const AdminRegistrationRequests = () => {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await memberRequestsService.getAll();
      setRequests(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar solicitações';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === '' ||
        request.name.toLowerCase().includes(searchLower) ||
        request.email.toLowerCase().includes(searchLower) ||
        request.primaryPhone.includes(searchTerm);

      return matchesStatus && matchesSearch;
    });
  }, [requests, statusFilter, searchTerm]);

  const statusCounts = useMemo(() => {
    return {
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
      total: requests.length,
    };
  }, [requests]);

  const summaryCards = [
    {
      key: 'pending',
      label: 'Pendentes',
      count: statusCounts.pending,
      icon: Clock,
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      hoverColor: 'hover:border-yellow-400 dark:hover:border-yellow-600',
    },
    {
      key: 'approved',
      label: 'Aprovados',
      count: statusCounts.approved,
      icon: CheckCircle,
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      iconColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800',
      hoverColor: 'hover:border-green-400 dark:hover:border-green-600',
    },
    {
      key: 'rejected',
      label: 'Rejeitados',
      count: statusCounts.rejected,
      icon: XCircle,
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      iconColor: 'text-red-600 dark:text-red-400',
      borderColor: 'border-red-200 dark:border-red-800',
      hoverColor: 'hover:border-red-400 dark:hover:border-red-600',
    },
    {
      key: 'all',
      label: 'Total',
      count: statusCounts.total,
      icon: Users,
      bgColor: 'bg-primary/5',
      iconColor: 'text-primary',
      borderColor: 'border-primary/20',
      hoverColor: 'hover:border-primary/50',
    },
  ];

  const handleCardClick = (statusKey: string) => {
    setStatusFilter(statusKey);
  };

  const handleViewDetails = (request: RegistrationRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const handleApproveClick = (request: RegistrationRequest) => {
    setSelectedRequest(request);
    setIsApproveOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setIsSubmitting(true);
    try {
      await memberRequestsService.approve(selectedRequest.id);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, status: 'approved' as RegistrationStatus, updatedAt: new Date().toISOString() }
            : r
        )
      );
      toast.success(`O membro ${selectedRequest.name} foi criado com sucesso.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao aprovar solicitação';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
      setIsApproveOpen(false);
      setSelectedRequest(null);
    }
  };

  const handleRejectClick = (request: RegistrationRequest) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setIsRejectOpen(true);
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error('O motivo da rejeição é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    try {
      await memberRequestsService.reject(selectedRequest.id, rejectionReason.trim());
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? {
                ...r,
                status: 'rejected' as RegistrationStatus,
                rejectionReason: rejectionReason.trim(),
                updatedAt: new Date().toISOString(),
              }
            : r
        )
      );
      toast.success(`A solicitação de ${selectedRequest.name} foi rejeitada.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao rejeitar solicitação';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
      setIsRejectOpen(false);
      setSelectedRequest(null);
      setRejectionReason('');
    }
  };

  const handleDeleteClick = (request: RegistrationRequest) => {
    setSelectedRequest(request);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedRequest) return;

    setIsSubmitting(true);
    try {
      await memberRequestsService.delete(selectedRequest.id);
      setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));
      toast.success(`A solicitação de ${selectedRequest.name} foi excluída permanentemente.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir solicitação';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
      setIsDeleteOpen(false);
      setSelectedRequest(null);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <MobileBackButton />
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Solicitações de Cadastro</h1>
          <p className="text-muted-foreground">
            Gerencie as solicitações de novos membros
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {summaryCards.map((card) => {
            const IconComponent = card.icon;
            const isSelected = statusFilter === card.key;
            return (
              <button
                key={card.key}
                onClick={() => handleCardClick(card.key)}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200 text-left
                  ${card.bgColor} ${card.borderColor} ${card.hoverColor}
                  ${isSelected ? 'ring-2 ring-offset-2 ring-primary scale-[1.02]' : ''}
                  hover:shadow-md cursor-pointer
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${card.bgColor}`}>
                    <IconComponent className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{card.count}</p>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, email ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredRequests.length} solicitação(ões) encontrada(s)
          </p>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Foto</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Carregando...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <User className="h-8 w-8" />
                          <p>Nenhuma solicitação encontrada</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={request.photoUrl} alt={request.name} />
                            <AvatarFallback>{getInitials(request.name)}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{request.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{request.email}</TableCell>
                        <TableCell className="hidden lg:table-cell">{request.primaryPhone}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[request.status]}>
                            {statusLabels[request.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {formatDate(request.requestedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(request)}
                              title="Visualizar detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleApproveClick(request)}
                                  title="Aprovar"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRejectClick(request)}
                                  title="Rejeitar"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(request)}
                              title="Excluir permanentemente"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Details Modal */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col dialog-mobile-fullscreen">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Detalhes da Solicitação</DialogTitle>
              <DialogDescription>
                Informações completas do solicitante
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {/* Photo and basic info */}
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedRequest.photoUrl} alt={selectedRequest.name} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(selectedRequest.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedRequest.name}</h3>
                    <p className="text-muted-foreground">{selectedRequest.email}</p>
                    <Badge className={`mt-2 ${statusColors[selectedRequest.status]}`}>
                      {statusLabels[selectedRequest.status]}
                    </Badge>
                  </div>
                </div>

                {/* Personal Info */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                    Informações Pessoais
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Data de Nascimento</Label>
                      <p>{formatDate(selectedRequest.birthDate)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Gênero</Label>
                      <p>{selectedRequest.gender}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Estado Civil</Label>
                      <p>{selectedRequest.maritalStatus}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Profissão</Label>
                      <p>{selectedRequest.occupation}</p>
                    </div>
                  </div>
                </div>

                {/* Contact and Address */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Contact */}
                  <div>
                    <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                      Contato
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <Label className="text-muted-foreground">Telefone Principal</Label>
                        <p>{selectedRequest.primaryPhone}</p>
                      </div>
                      {selectedRequest.secondaryPhone && (
                        <div>
                          <Label className="text-muted-foreground">Telefone Secundário</Label>
                          <p>{selectedRequest.secondaryPhone}</p>
                        </div>
                      )}
                      {selectedRequest.emergencyContact && (
                        <div>
                          <Label className="text-muted-foreground">Contato de Emergência</Label>
                          <p>{selectedRequest.emergencyContact}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  {(selectedRequest.street || selectedRequest.city) && (
                    <div>
                      <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                        Endereço
                      </h4>
                      <div className="text-sm space-y-1">
                        {selectedRequest.street && (
                          <p>
                            {selectedRequest.street}
                            {selectedRequest.number && `, ${selectedRequest.number}`}
                            {selectedRequest.complement && ` - ${selectedRequest.complement}`}
                          </p>
                        )}
                        {selectedRequest.neighborhood && <p>{selectedRequest.neighborhood}</p>}
                        {(selectedRequest.city || selectedRequest.state) && (
                          <p>
                            {selectedRequest.city}
                            {selectedRequest.state && ` - ${selectedRequest.state}`}
                          </p>
                        )}
                        {selectedRequest.zipCode && <p>CEP: {selectedRequest.zipCode}</p>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Consents */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                    Consentimentos
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={selectedRequest.imageConsentGiven ? 'default' : 'secondary'}>
                      {selectedRequest.imageConsentGiven ? '✓' : '✗'} Uso de Imagem
                    </Badge>
                    <Badge variant={selectedRequest.emailConsentGiven ? 'default' : 'secondary'}>
                      {selectedRequest.emailConsentGiven ? '✓' : '✗'} Email
                    </Badge>
                    <Badge variant={selectedRequest.whatsappConsentGiven ? 'default' : 'secondary'}>
                      {selectedRequest.whatsappConsentGiven ? '✓' : '✗'} WhatsApp
                    </Badge>
                  </div>
                </div>

                {/* Rejection Reason */}
                {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                  <div>
                    <h4 className="font-semibold mb-3 text-sm text-red-600 uppercase tracking-wide">
                      Motivo da Rejeição
                    </h4>
                    <p className="text-sm bg-red-50 text-red-800 p-3 rounded-md">
                      {selectedRequest.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div>
                      <Label className="text-muted-foreground">ID</Label>
                      <p>#{selectedRequest.id}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Solicitado em</Label>
                      <p>{formatDateTime(selectedRequest.requestedAt)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Atualizado em</Label>
                      <p>{formatDateTime(selectedRequest.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex-shrink-0 pt-4 border-t gap-3 max-md:flex-col">
              {selectedRequest?.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDetailsOpen(false);
                      handleRejectClick(selectedRequest);
                    }}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                  <Button
                    onClick={() => {
                      setIsDetailsOpen(false);
                      handleApproveClick(selectedRequest);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                </>
              )}
              {selectedRequest?.status !== 'pending' && (
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Fechar
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Modal */}
        <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeitar Solicitação</DialogTitle>
              <DialogDescription>
                Informe o motivo da rejeição da solicitação de {selectedRequest?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="rejectionReason">Motivo da Rejeição *</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Descreva o motivo da rejeição..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="mt-2"
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejeitando...
                  </>
                ) : (
                  'Confirmar Rejeição'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approve Confirmation */}
        <AlertDialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Aprovar Solicitação</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja aprovar a solicitação de {selectedRequest?.name}?
                Um novo membro será criado automaticamente com os dados informados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleApprove}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Aprovando...
                  </>
                ) : (
                  'Aprovar e Criar Membro'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Permanentemente</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir permanentemente a solicitação de{' '}
                {selectedRequest?.name}? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isSubmitting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  'Excluir Permanentemente'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminRegistrationRequests;
