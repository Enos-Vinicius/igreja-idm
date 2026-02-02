import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Search,
  Eye,
  Trash2,
  Filter,
  Mail,
  MailOpen,
  Heart,
  Loader2,
  Phone,
  User,
  Calendar,
  MessageSquare,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { prayerRequestsService, PrayerRequest } from '@/services/prayerRequests';
import DashboardLayout from '@/components/DashboardLayout';
import MobileBackButton from '@/components/MobileBackButton';
import { useAuth } from '@/contexts/AuthContext';

const ITEMS_PER_PAGE = 10;

const AdminPrayerRequests = () => {
  const { isAdmin } = useAuth();
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const [selectedRequest, setSelectedRequest] = useState<PrayerRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [currentPage, statusFilter]);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const params: { read?: boolean; limit: number; offset: number } = {
        limit: ITEMS_PER_PAGE,
        offset: currentPage * ITEMS_PER_PAGE,
      };

      if (statusFilter === 'unread') {
        params.read = false;
      } else if (statusFilter === 'read') {
        params.read = true;
      }

      const response = await prayerRequestsService.getAll(params);
      setRequests(response.data);
      setTotal(response.total);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar pedidos de oração';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    if (!searchTerm) return requests;

    const searchLower = searchTerm.toLowerCase();
    return requests.filter((request) =>
      request.name.toLowerCase().includes(searchLower) ||
      request.content.toLowerCase().includes(searchLower) ||
      (request.phone && request.phone.includes(searchTerm))
    );
  }, [requests, searchTerm]);

  const readCount = total - unreadCount;

  const summaryCards = [
    {
      key: 'unread',
      label: 'Não Lidos',
      count: unreadCount,
      icon: Mail,
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
      hoverColor: 'hover:border-blue-400 dark:hover:border-blue-600',
    },
    {
      key: 'read',
      label: 'Lidos',
      count: readCount,
      icon: MailOpen,
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      iconColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800',
      hoverColor: 'hover:border-green-400 dark:hover:border-green-600',
    },
    {
      key: 'all',
      label: 'Total',
      count: total,
      icon: Heart,
      bgColor: 'bg-primary/5',
      iconColor: 'text-primary',
      borderColor: 'border-primary/20',
      hoverColor: 'hover:border-primary/50',
    },
  ];

  const handleCardClick = (statusKey: string) => {
    setStatusFilter(statusKey);
    setCurrentPage(0);
  };

  const handleViewDetails = async (request: PrayerRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);

    // Mark as read if not already
    if (!request.read) {
      try {
        await prayerRequestsService.markAsRead(request.id);
        setRequests((prev) =>
          prev.map((r) => (r.id === request.id ? { ...r, read: true } : r))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Silently fail - request is already being viewed
      }
    }
  };

  const handleToggleRead = async (request: PrayerRequest) => {
    try {
      if (request.read) {
        await prayerRequestsService.markAsUnread(request.id);
        setRequests((prev) =>
          prev.map((r) => (r.id === request.id ? { ...r, read: false } : r))
        );
        setUnreadCount((prev) => prev + 1);
        toast.success('Marcado como não lido');
      } else {
        await prayerRequestsService.markAsRead(request.id);
        setRequests((prev) =>
          prev.map((r) => (r.id === request.id ? { ...r, read: true } : r))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        toast.success('Marcado como lido');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar status';
      toast.error(message);
    }
  };

  const handleDeleteClick = (request: PrayerRequest) => {
    setSelectedRequest(request);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedRequest) return;

    setIsSubmitting(true);
    try {
      await prayerRequestsService.delete(selectedRequest.id);
      setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));
      setTotal((prev) => prev - 1);
      if (!selectedRequest.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      toast.success('Pedido de oração excluído com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir pedido';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
      setIsDeleteOpen(false);
      setSelectedRequest(null);
    }
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatDateShort = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return format(date, "dd/MM/yy", { locale: ptBR });
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <MobileBackButton />

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pedidos de Oração</h1>
          <p className="text-muted-foreground">
            Gerencie os pedidos de oração recebidos
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
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
                    placeholder="Buscar por nome, telefone ou conteúdo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(0); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="unread">Não Lidos</SelectItem>
                    <SelectItem value="read">Lidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredRequests.length} pedido(s) encontrado(s)
            {totalPages > 1 && ` • Página ${currentPage + 1} de ${totalPages}`}
          </p>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Status</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Pedido</TableHead>
                    <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                    <TableHead className="hidden sm:table-cell">Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Carregando...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Heart className="h-8 w-8" />
                          <p>Nenhum pedido de oração encontrado</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow
                        key={request.id}
                        className={!request.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}
                      >
                        <TableCell>
                          <button
                            onClick={() => handleToggleRead(request)}
                            className="p-1 rounded hover:bg-muted transition-colors"
                            title={request.read ? 'Marcar como não lido' : 'Marcar como lido'}
                          >
                            {request.read ? (
                              <MailOpen className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <Mail className="h-5 w-5 text-blue-600" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {!request.read && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                                Novo
                              </Badge>
                            )}
                            {request.name}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-xs">
                          <p className="truncate text-muted-foreground">
                            {request.content}
                          </p>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {request.phone || '-'}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {formatDateShort(request.createdAt)}
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
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(request)}
                                title="Excluir"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  disabled={currentPage === 0 || isLoading}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {currentPage + 1} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1 || isLoading}
                >
                  Próxima
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Modal */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] flex flex-col dialog-mobile-fullscreen">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Pedido de Oração
              </DialogTitle>
              <DialogDescription>
                Detalhes do pedido de oração
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {/* Sender Info */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selectedRequest.name}</span>
                  </div>
                  {selectedRequest.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedRequest.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {formatDateTime(selectedRequest.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Prayer Content */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Pedido
                    </span>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                      {selectedRequest.content}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={selectedRequest.read ? 'secondary' : 'default'}>
                    {selectedRequest.read ? 'Lido' : 'Não lido'}
                  </Badge>
                </div>
              </div>
            )}

            <DialogFooter className="flex-shrink-0 pt-4 border-t gap-3 max-md:flex-col">
              {selectedRequest && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleToggleRead(selectedRequest)}
                    className="flex items-center gap-2"
                  >
                    {selectedRequest.read ? (
                      <>
                        <Mail className="h-4 w-4" />
                        Marcar como não lido
                      </>
                    ) : (
                      <>
                        <MailOpen className="h-4 w-4" />
                        Marcar como lido
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                    Fechar
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Pedido de Oração</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o pedido de oração de{' '}
                <strong>{selectedRequest?.name}</strong>? Esta ação não pode ser desfeita.
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
                  'Excluir'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminPrayerRequests;
