import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { LogOverviewComponent } from './components/log-overview/log-overview.component';
import { LogDetailComponent } from './components/log-detail/log-detail.component';

const routes: Routes = [
  { path: '', redirectTo: 'main/true', pathMatch: 'full' },
  { path: 'main/:isAutoSelect', component: MainComponent },
  { path: 'log-overview', component: LogOverviewComponent },
  { path: 'log-detail', component: LogDetailComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
