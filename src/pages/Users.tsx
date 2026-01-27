import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, KeyRound, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import { User } from "@/types/user";
import { mockUsers } from "@/data/mockUsers";

type ModalType = "create" | "edit" | "password" | null;

const Users = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setRole("member");
    setSelectedUser(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalType("create");
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEmail(user.email);
    setRole(user.role);
    setModalType("edit");
  };

  const openPasswordModal = (user: User) => {
    setSelectedUser(user);
    setPassword("");
    setModalType("password");
  };

  const closeModal = () => {
    setModalType(null);
    resetForm();
  };

  const handleCreate = () => {
    if (!email || !password || password.length < 6) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos corretamente. A senha deve ter no mínimo 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    const newUser: User = {
      id: Math.max(...users.map((u) => u.id)) + 1,
      email,
      role,
      createdAt: new Date(),
    };

    setUsers([...users, newUser]);
    toast({
      title: "Sucesso",
      description: "Usuário criado com sucesso!",
    });
    closeModal();
  };

  const handleEdit = () => {
    if (!email || !selectedUser) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos corretamente.",
        variant: "destructive",
      });
      return;
    }

    setUsers(
      users.map((u) =>
        u.id === selectedUser.id ? { ...u, email, role } : u
      )
    );
    toast({
      title: "Sucesso",
      description: "Usuário atualizado com sucesso!",
    });
    closeModal();
  };

  const handlePasswordChange = () => {
    if (!password || password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter no mínimo 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Senha alterada com sucesso!",
    });
    closeModal();
  };

  const handleDelete = (user: User) => {
    setUsers(users.filter((u) => u.id !== user.id));
    toast({
      title: "Sucesso",
      description: "Usuário excluído com sucesso!",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              Gestão de Usuários
            </h1>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        {/* Table Card */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">ID</TableHead>
                  <TableHead>Membro</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-muted-foreground">
                      {user.id}
                    </TableCell>
                    <TableCell>
                      {user.member ? (
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.member.photoUrl} />
                            <AvatarFallback>
                              {getInitials(user.member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.member.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "admin" ? "default" : "secondary"}
                      >
                        {user.role === "admin" ? "Administrador" : "Membro"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(user.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(user)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openPasswordModal(user)}
                          title="Alterar senha"
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user)}
                          title="Excluir"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create User Modal */}
      <Dialog open={modalType === "create"} onOpenChange={() => closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Função *</Label>
              <Select value={role} onValueChange={(v: "admin" | "member") => setRole(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Membro</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={modalType === "edit"} onOpenChange={() => closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="usuario@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Função *</Label>
              <Select value={role} onValueChange={(v: "admin" | "member") => setRole(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Membro</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button onClick={handleEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={modalType === "password"} onOpenChange={() => closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Alterando senha do usuário: <strong>{selectedUser?.email}</strong>
            </p>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha *</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button onClick={handlePasswordChange}>Alterar Senha</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
