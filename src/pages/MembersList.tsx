import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { membersService } from '@/services/members';
import {
  Member,
  churchRoleLabels,
  membershipStatusLabels,
  MembershipStatus,
  ChurchRole,
} from '@/types/member';
import DashboardLayout from '@/components/DashboardLayout';

const MembersList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Só recarrega se for a primeira vez OU se vier com flag de refresh
    const shouldRefresh = location.state?.refresh === true;
    const hasData = members.length > 0;

    // Recarrega apenas se:
    // 1. Vem com flag de refresh (salvou no form)
    // 2. OU não tem dados ainda E nunca carregou antes
    if (shouldRefresh || (!hasData && !hasLoadedRef.current)) {
      loadMembers();
      hasLoadedRef.current = true;

      // Limpa o state após usar para evitar reloads indesejados
      if (shouldRefresh) {
        navigate(location.pathname, { replace: true, state: {} });
      }
    } else {
      // Se já tem dados, não mostra loading
      setIsLoading(false);
    }
  }, [location.state, members.length]);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const data = await membersService.getAll();
      setMembers(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar membros';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (member.primaryPhone?.includes(searchTerm) ?? false);

      const matchesStatus =
        statusFilter === 'all' || member.membershipStatus === statusFilter;

      const matchesRole =
        roleFilter === 'all' || member.churchRole === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [members, searchTerm, statusFilter, roleFilter]);

  const handleDelete = (member: Member) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;

    setIsDeleting(true);
    try {
      await membersService.delete(memberToDelete.id);
      setMembers(members.filter((m) => m.id !== memberToDelete.id));
      toast.success('Membro excluído com sucesso!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir membro';
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setMemberToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const getStatusBadgeVariant = (status?: MembershipStatus) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'visitor':
        return 'outline';
      case 'congregant':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Cadastro de Membros
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os membros da igreja
            </p>
          </div>
          <Button onClick={() => navigate('/members/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Membro
          </Button>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, email ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    {Object.entries(membershipStatusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Funções</SelectItem>
                    {Object.entries(churchRoleLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-4">
            {filteredMembers.length} membro(s) encontrado(s)
          </p>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                      <TableHead className="hidden lg:table-cell">Função</TableHead>
                      <TableHead>Status</TableHead>
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
                    ) : filteredMembers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Nenhum membro encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            {member.name}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {member.email || '-'}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {member.primaryPhone || '-'}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {member.churchRole
                              ? churchRoleLabels[member.churchRole as ChurchRole]
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {member.membershipStatus ? (
                              <Badge variant={getStatusBadgeVariant(member.membershipStatus as MembershipStatus)}>
                                {membershipStatusLabels[member.membershipStatus as MembershipStatus]}
                              </Badge>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/members/edit/${member.id}`)}
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(member)}
                                className="text-destructive hover:text-destructive"
                                title="Excluir"
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o membro{' '}
                <strong>{memberToDelete?.name}</strong>? Esta ação não pode ser
                desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
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

export default MembersList;
