import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService, User, CreateUserRequest, UpdateUserRequest } from '../../services/users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  loading = false;
  errorMessage = '';

  // Modal
  showModal = false;
  modalMode: 'create' | 'edit' | 'password' = 'create';
  selectedUser: Partial<User> = {};
  userForm = {
    email: '',
    password: '',
    role: 'member'
  };
  newPassword = '';
  showPassword = false;
  showNewPassword = false;

  roleOptions = [
    { value: 'member', label: 'Membro' },
    { value: 'admin', label: 'Administrador' }
  ];

  constructor(
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.errorMessage = '';

    this.usersService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.errorMessage = 'Erro ao carregar usuários. Verifique se você tem permissão de administrador.';
        this.loading = false;
      }
    });
  }

  searchUsers() {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = this.users;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.email.toLowerCase().includes(term) ||
      user.member?.name?.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  }

  openCreateModal() {
    this.modalMode = 'create';
    this.userForm = {
      email: '',
      password: '',
      role: 'member'
    };
    this.errorMessage = '';
    this.showModal = true;
  }

  openEditModal(user: User) {
    this.modalMode = 'edit';
    this.selectedUser = user;
    this.userForm = {
      email: user.email,
      password: '',
      role: user.role
    };
    this.errorMessage = '';
    this.showModal = true;
  }

  openPasswordModal(user: User) {
    this.modalMode = 'password';
    this.selectedUser = user;
    this.newPassword = '';
    this.errorMessage = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedUser = {};
    this.userForm = {
      email: '',
      password: '',
      role: 'member'
    };
    this.newPassword = '';
    this.errorMessage = '';
    this.showPassword = false;
    this.showNewPassword = false;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  saveUser() {
    this.errorMessage = '';

    if (this.modalMode === 'create') {
      if (!this.userForm.email || !this.userForm.password) {
        this.errorMessage = 'Email e senha são obrigatórios';
        return;
      }

      if (this.userForm.password.length < 6) {
        this.errorMessage = 'A senha deve ter no mínimo 6 caracteres';
        return;
      }

      this.loading = true;
      const createData: CreateUserRequest = {
        email: this.userForm.email,
        password: this.userForm.password,
        role: this.userForm.role
      };

      this.usersService.createUser(createData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
        },
        error: (error) => {
          console.error('Erro ao criar usuário:', error);
          this.errorMessage = error.error?.message || 'Erro ao criar usuário. Email pode já estar em uso.';
          this.loading = false;
        }
      });
    } else if (this.modalMode === 'edit') {
      if (!this.userForm.email) {
        this.errorMessage = 'Email é obrigatório';
        return;
      }

      this.loading = true;
      const updateData: UpdateUserRequest = {
        email: this.userForm.email,
        role: this.userForm.role
      };

      this.usersService.updateUser(this.selectedUser.id!, updateData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
        },
        error: (error) => {
          console.error('Erro ao atualizar usuário:', error);
          this.errorMessage = error.error?.message || 'Erro ao atualizar usuário';
          this.loading = false;
        }
      });
    }
  }

  changePassword() {
    if (!this.newPassword) {
      this.errorMessage = 'A nova senha é obrigatória';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'A senha deve ter no mínimo 6 caracteres';
      return;
    }

    this.loading = true;
    this.usersService.changePassword(this.selectedUser.id!, { password: this.newPassword }).subscribe({
      next: () => {
        alert('Senha alterada com sucesso!');
        this.closeModal();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao alterar senha:', error);
        this.errorMessage = 'Erro ao alterar senha';
        this.loading = false;
      }
    });
  }

  deleteUser(user: User) {
    if (!confirm(`Tem certeza que deseja deletar o usuário ${user.email}?`)) {
      return;
    }

    this.loading = true;
    this.usersService.deleteUser(user.id).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (error) => {
        console.error('Erro ao deletar usuário:', error);
        alert('Erro ao deletar usuário');
        this.loading = false;
      }
    });
  }

  getRoleName(role: string): string {
    return role === 'admin' ? 'Administrador' : 'Membro';
  }

  getRoleBadgeClass(role: string): string {
    return role === 'admin' ? 'role-admin' : 'role-member';
  }
}
