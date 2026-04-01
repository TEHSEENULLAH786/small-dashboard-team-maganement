import { Component, signal, afterNextRender, ElementRef, viewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="logo">
          <div class="logo-icon">👥</div>
          TeamPulse
        </div>
        <div class="nav-label">Menu</div>
        @for (item of navItems(); track item.label) {
          <div class="nav-item" [class.active]="item.active" (click)="setActive(item.label)">
            <span class="nav-icon">{{ item.icon }}</span> {{ item.label }}
          </div>
        }
        <div class="nav-label">Insights</div>
        @for (item of navInsights(); track item.label) {
          <div class="nav-item" [class.active]="item.active" (click)="setActive(item.label)">
            <span class="nav-icon">{{ item.icon }}</span> {{ item.label }}
          </div>
        }
        <div class="avatar-row">
          <div class="avatar">JD</div>
          <div class="avatar-info">
            <div class="avatar-name">Jane Doe</div>
            <div class="avatar-role">Team Manager</div>
          </div>
        </div>
      </aside>

      <!-- Main -->
      <main class="main">
        <div class="page-header">
          <div>
            <div class="page-title">Team Overview</div>
            <div class="page-sub">Wednesday, 18 June 2025 · Q2 Sprint 3</div>
          </div>
          <button class="btn btn-primary">+ Add Member</button>
        </div>

        <!-- KPI Cards -->
        <div class="kpi-grid">
          @for (kpi of kpiCards(); track kpi.label) {
            <div class="kpi-card">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">{{ kpi.label }}</div>
                  <div class="kpi-value">{{ kpi.value }}</div>
                </div>
                <div class="kpi-icon" [style.background]="kpi.iconBg">{{ kpi.icon }}</div>
              </div>
              <div class="kpi-trend" [class.trend-up]="kpi.up" [class.trend-down]="!kpi.up">
                {{ kpi.up ? '▲' : '▼' }} {{ kpi.trend }}
              </div>
            </div>
          }
        </div>

        <!-- Mid Row -->
        <div class="mid-grid">
          <!-- Team Members Table -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">Team Members</div>
              <span class="badge badge-purple">24 Total</span>
            </div>
            <table class="table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Workload</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                @for (m of members(); track m.name) {
                  <tr>
                    <td>
                      <div class="member-cell">
                        <div class="member-avatar" [style.background]="m.avatarBg">{{ m.initials }}</div>
                        <div>
                          <div class="member-name">{{ m.name }}</div>
                          <div class="member-email">{{ m.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td><span class="badge" [class]="m.roleBadge">{{ m.role }}</span></td>
                    <td>
                      <span class="status-dot" [class]="m.statusDot"></span>{{ m.status }}
                    </td>
                    <td>
                      <div class="progress-bar">
                        <div class="progress-fill" [style.width]="m.workload + '%'" [style.background]="m.avatarBg"></div>
                      </div>
                    </td>
                    <td><strong>{{ m.score }}%</strong></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Charts Panel -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">Weekly Performance</div>
              <span class="badge badge-green">▲ 18%</span>
            </div>
            <canvas #perfChart></canvas>
            <div style="margin-top:16px">
              <div class="card-title" style="margin-bottom:10px">Department Split</div>
              <canvas #deptChart></canvas>
            </div>
          </div>
        </div>

        <!-- Bottom Row -->
        <div class="bottom-grid">
          <!-- Tasks -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">Current Sprint Tasks</div>
              <span class="badge badge-blue">8 Remaining</span>
            </div>
            @for (task of tasks(); track task.title) {
              <div class="task-item">
                <div class="task-check" [class.done]="task.done">{{ task.done ? '✓' : '' }}</div>
                <div class="task-info">
                  <div class="task-title" [class.done]="task.done">{{ task.title }}</div>
                  <div class="task-meta">{{ task.assignee }} · Due {{ task.due }}</div>
                </div>
                <span class="task-priority" [class]="task.priorityClass">{{ task.priority }}</span>
              </div>
            }
          </div>

          <!-- Workload Doughnut -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">Workload Status</div>
            </div>
            <canvas #workloadChart></canvas>
            <div class="workload-legend">
              <div class="wl-row"><span>🟣 Overloaded (&gt;85%)</span><strong>6</strong></div>
              <div class="wl-row"><span>🟡 Optimal (50–85%)</span><strong>12</strong></div>
              <div class="wl-row"><span>⚪ Underloaded (&lt;50%)</span><strong>6</strong></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :host { font-family: 'Inter', sans-serif; background: #f0f2f7; color: #1a1d2e; display: block; height: 100vh; }

    .layout { display: flex; height: 100vh; overflow: hidden; }

    /* Sidebar */
    .sidebar { width: 220px; background: #1a1d2e; color: #fff; display: flex; flex-direction: column; padding: 24px 0; flex-shrink: 0; }
    .logo { padding: 0 20px 28px; font-size: 18px; font-weight: 700; letter-spacing: .5px; display: flex; align-items: center; gap: 10px; }
    .logo-icon { width: 32px; height: 32px; background: linear-gradient(135deg, #6c63ff, #48b0f7); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
    .nav-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #5a5f7d; padding: 0 20px 8px; margin-top: 12px; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 20px; cursor: pointer; border-radius: 0 24px 24px 0; margin-right: 16px; font-size: 13.5px; color: #a0a5c0; transition: all .2s; }
    .nav-item:hover { background: rgba(108,99,255,.15); color: #fff; }
    .nav-item.active { background: linear-gradient(135deg, #6c63ff, #8b82ff); color: #fff; box-shadow: 0 4px 15px rgba(108,99,255,.4); }
    .nav-icon { font-size: 16px; }
    .avatar-row { margin-top: auto; padding: 16px 20px 0; display: flex; align-items: center; gap: 10px; border-top: 1px solid #2a2d40; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #6c63ff, #48b0f7); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #fff; flex-shrink: 0; }
    .avatar-info { font-size: 12px; }
    .avatar-name { font-weight: 600; color: #fff; }
    .avatar-role { color: #5a5f7d; font-size: 11px; }

    /* Main */
    .main { flex: 1; overflow-y: auto; padding: 24px; background: #f0f2f7; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-title { font-size: 22px; font-weight: 700; }
    .page-sub { font-size: 13px; color: #7a7f9a; margin-top: 2px; }
    .btn { padding: 9px 18px; border-radius: 10px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
    .btn-primary { background: linear-gradient(135deg, #6c63ff, #8b82ff); color: #fff; box-shadow: 0 4px 12px rgba(108,99,255,.35); transition: opacity .2s; }
    .btn-primary:hover { opacity: .88; }

    /* KPI */
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 22px; }
    .kpi-card { background: #fff; border-radius: 14px; padding: 18px 20px; box-shadow: 0 2px 12px rgba(0,0,0,.06); display: flex; flex-direction: column; gap: 8px; }
    .kpi-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .kpi-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .kpi-value { font-size: 26px; font-weight: 700; line-height: 1; }
    .kpi-label { font-size: 12px; color: #7a7f9a; font-weight: 500; margin-bottom: 4px; }
    .kpi-trend { font-size: 12px; font-weight: 600; }
    .trend-up { color: #22c55e; }
    .trend-down { color: #ef4444; }

    /* Grid layouts */
    .mid-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 22px; }
    .bottom-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }

    /* Card */
    .card { background: #fff; border-radius: 14px; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,.06); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .card-title { font-size: 14px; font-weight: 700; }

    /* Badges */
    .badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .badge-purple { background: #ede9ff; color: #6c63ff; }
    .badge-green { background: #dcfce7; color: #16a34a; }
    .badge-blue { background: #dbeafe; color: #2563eb; }
    .badge-orange { background: #ffedd5; color: #ea580c; }

    /* Table */
    .table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .table th { text-align: left; padding: 8px 10px; color: #7a7f9a; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid #f0f2f7; }
    .table td { padding: 10px 10px; border-bottom: 1px solid #f7f8fc; vertical-align: middle; }
    .table tr:last-child td { border-bottom: none; }
    .table tr:hover td { background: #fafbff; }
    .member-cell { display: flex; align-items: center; gap: 10px; }
    .member-avatar { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0; }
    .member-name { font-weight: 600; font-size: 13px; }
    .member-email { font-size: 11px; color: #7a7f9a; }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; margin-right: 5px; }
    .dot-active { background: #22c55e; }
    .dot-idle { background: #f59e0b; }
    .dot-offline { background: #d1d5db; }
    .progress-bar { height: 6px; background: #f0f2f7; border-radius: 10px; overflow: hidden; width: 80px; }
    .progress-fill { height: 100%; border-radius: 10px; }

    /* Tasks */
    .task-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f7f8fc; }
    .task-item:last-child { border-bottom: none; }
    .task-check { width: 18px; height: 18px; border-radius: 5px; border: 2px solid #d1d5db; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; font-size: 11px; }
    .task-check.done { background: #22c55e; border-color: #22c55e; color: #fff; }
    .task-info { flex: 1; }
    .task-title { font-size: 13px; font-weight: 500; }
    .task-title.done { text-decoration: line-through; color: #b0b5c8; }
    .task-meta { font-size: 11px; color: #7a7f9a; margin-top: 2px; }
    .task-priority { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; white-space: nowrap; }
    .p-high { background: #fee2e2; color: #dc2626; }
    .p-med { background: #fef9c3; color: #b45309; }
    .p-low { background: #dcfce7; color: #16a34a; }

    /* Workload legend */
    .workload-legend { margin-top: 14px; display: flex; flex-direction: column; gap: 8px; }
    .wl-row { display: flex; justify-content: space-between; font-size: 12px; }

    canvas { max-height: 180px; }
  `]
})
export class DashboardComponent {
  private perfChartRef = viewChild<ElementRef>('perfChart');
  private deptChartRef = viewChild<ElementRef>('deptChart');
  private workloadChartRef = viewChild<ElementRef>('workloadChart');

  navItems = signal([
    { icon: '🏠', label: 'Overview', active: true },
    { icon: '👤', label: 'Members', active: false },
    { icon: '📋', label: 'Projects', active: false },
    { icon: '✅', label: 'Tasks', active: false },
  ]);

  navInsights = signal([
    { icon: '📊', label: 'Analytics', active: false },
    { icon: '📅', label: 'Schedule', active: false },
    { icon: '⚙️', label: 'Settings', active: false },
  ]);

  kpiCards = signal([
    { label: 'Total Members', value: '24', icon: '👥', iconBg: '#ede9ff', trend: '2 this month', up: true },
    { label: 'Active Now', value: '17', icon: '🟢', iconBg: '#dcfce7', trend: '70.8% online rate', up: true },
    { label: 'Tasks Completed', value: '142', icon: '✅', iconBg: '#dbeafe', trend: '18% vs last sprint', up: true },
    { label: 'Avg. Performance', value: '87%', icon: '🚀', iconBg: '#ffedd5', trend: '2% vs last sprint', up: false },
  ]);

  members = signal([
    { initials: 'AS', name: 'Alex Smith', email: 'alex@company.com', role: 'Dev Lead', roleBadge: 'badge badge-purple', status: 'Active', statusDot: 'status-dot dot-active', workload: 85, score: 94, avatarBg: 'linear-gradient(135deg,#6c63ff,#8b82ff)' },
    { initials: 'MK', name: 'Maria Kim', email: 'maria@company.com', role: 'Designer', roleBadge: 'badge badge-blue', status: 'Active', statusDot: 'status-dot dot-active', workload: 70, score: 88, avatarBg: 'linear-gradient(135deg,#f59e0b,#fbbf24)' },
    { initials: 'TL', name: 'Tom Lee', email: 'tom@company.com', role: 'Backend', roleBadge: 'badge badge-green', status: 'Idle', statusDot: 'status-dot dot-idle', workload: 55, score: 82, avatarBg: 'linear-gradient(135deg,#22c55e,#4ade80)' },
    { initials: 'SR', name: 'Sara Ruiz', email: 'sara@company.com', role: 'QA', roleBadge: 'badge badge-orange', status: 'Active', statusDot: 'status-dot dot-active', workload: 90, score: 91, avatarBg: 'linear-gradient(135deg,#ef4444,#f87171)' },
    { initials: 'JP', name: 'Jake Park', email: 'jake@company.com', role: 'Frontend', roleBadge: 'badge badge-blue', status: 'Offline', statusDot: 'status-dot dot-offline', workload: 40, score: 79, avatarBg: 'linear-gradient(135deg,#06b6d4,#22d3ee)' },
  ]);

  tasks = signal([
    { title: 'Design new onboarding flow', assignee: 'Maria Kim', due: 'Jun 15', done: true, priority: 'High', priorityClass: 'task-priority p-high' },
    { title: 'Fix login authentication bug', assignee: 'Tom Lee', due: 'Jun 16', done: true, priority: 'High', priorityClass: 'task-priority p-high' },
    { title: 'API integration for dashboard', assignee: 'Alex Smith', due: 'Jun 20', done: false, priority: 'Medium', priorityClass: 'task-priority p-med' },
    { title: 'Write unit tests for payment module', assignee: 'Sara Ruiz', due: 'Jun 21', done: false, priority: 'High', priorityClass: 'task-priority p-high' },
    { title: 'Update component library docs', assignee: 'Jake Park', due: 'Jun 22', done: false, priority: 'Low', priorityClass: 'task-priority p-low' },
    { title: 'Performance audit & optimisation', assignee: 'Alex Smith', due: 'Jun 25', done: false, priority: 'Medium', priorityClass: 'task-priority p-med' },
  ]);

  setActive(label: string) {
    this.navItems.update(items => items.map(i => ({ ...i, active: i.label === label })));
    this.navInsights.update(items => items.map(i => ({ ...i, active: i.label === label })));
  }

  constructor() {
    afterNextRender(() => {
      const perfEl = this.perfChartRef()?.nativeElement;
      if (perfEl) {
        new Chart(perfEl, {
          type: 'bar',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            datasets: [{
              label: 'Tasks Done',
              data: [18, 25, 22, 30, 27, 20],
              backgroundColor: 'rgba(108,99,255,0.15)',
              borderColor: '#6c63ff',
              borderWidth: 2,
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false } },
              y: { grid: { color: '#f0f2f7' }, ticks: { font: { size: 10 } } }
            }
          }
        });
      }

      const deptEl = this.deptChartRef()?.nativeElement;
      if (deptEl) {
        new Chart(deptEl, {
          type: 'doughnut',
          data: {
            labels: ['Dev', 'Design', 'QA', 'Backend'],
            datasets: [{ data: [10, 5, 4, 5], backgroundColor: ['#6c63ff', '#f59e0b', '#ef4444', '#22c55e'], borderWidth: 0 }]
          },
          options: {
            responsive: true,
            cutout: '65%',
            plugins: { legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 12 } } }
          }
        });
      }

      const wlEl = this.workloadChartRef()?.nativeElement;
      if (wlEl) {
        new Chart(wlEl, {
          type: 'doughnut',
          data: {
            labels: ['Overloaded', 'Optimal', 'Underloaded'],
            datasets: [{ data: [6, 12, 6], backgroundColor: ['#6c63ff', '#22c55e', '#d1d5db'], borderWidth: 0 }]
          },
          options: {
            responsive: true,
            cutout: '70%',
            plugins: { legend: { display: false } }
          }
        });
      }
    });
  }
}