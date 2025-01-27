import { NgModule } from '@angular/core';
import { Routes, RouterModule, RouteReuseStrategy } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { LogOverviewComponent } from './components/user-log-list/user-log-list.component';
import { LogDetailComponent } from './components/log-detail/log-detail.component';
import { CustomRouteReuseStrategy } from './custom-route-reuse-strategy.ts';

const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: 'main', component: MainComponent },
  { path: 'user-log-list', component: LogOverviewComponent },
  { path: 'log-detail', component: LogDetailComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true
  })],
  exports: [RouterModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy }
  ]
})
export class AppRoutingModule { }
