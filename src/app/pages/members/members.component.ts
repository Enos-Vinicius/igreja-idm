import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MembersService, Member } from '../../services/members.service';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss'
})
export class MembersComponent implements OnInit {
  members: Member[] = [];
  filteredMembers: Member[] = [];
  searchTerm = '';
  loading = false;
  errorMessage = '';

  constructor(
    private membersService: MembersService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.loading = true;
    this.errorMessage = '';

    this.membersService.getAllMembers().subscribe({
      next: (members) => {
        this.members = members;
        this.filteredMembers = members;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar membros:', error);
        this.errorMessage = 'Erro ao carregar membros';
        this.loading = false;
      }
    });
  }

  searchMembers() {
    if (!this.searchTerm.trim()) {
      this.filteredMembers = this.members;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredMembers = this.members.filter(member =>
      member.name.toLowerCase().includes(term) ||
      member.email?.toLowerCase().includes(term) ||
      member.primaryPhone?.includes(term)
    );
  }

  createMember() {
    this.router.navigate(['/members/new']);
  }

  editMember(member: Member) {
    this.router.navigate(['/members/edit', member.id]);
  }

  deleteMember(member: Member) {
    if (!confirm(`Tem certeza que deseja deletar ${member.name}?`)) {
      return;
    }

    this.loading = true;

    this.membersService.deleteMember(member.id!).subscribe({
      next: () => {
        this.loadMembers();
      },
      error: (error) => {
        console.error('Erro ao deletar membro:', error);
        alert('Erro ao deletar membro');
        this.loading = false;
      }
    });
  }
}
