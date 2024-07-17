import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule, CloudAppTranslateModule, AlertModule } from '@exlibris/exl-cloudapp-angular-lib';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MainComponent } from './components/main/main.component';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { NavigationheaderComponent } from './components/navigationheader/navigationheader.component';
import { MomentFormatPipe } from './pipes/moment.pipe';
import { LogOverviewComponent } from './components/log-overview/log-overview.component';
import { TruncatePipe } from './pipes/truncate.pip';
import { LogDetailComponent } from './components/log-detail/log-detail.component';
import { MailStatusChipComponent } from './components/mail-status-chip/mail-status-chip.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    LogOverviewComponent,
    LogDetailComponent,
    NavigationheaderComponent,
    MomentFormatPipe,
    TruncatePipe,
    MailStatusChipComponent
  ],
  imports: [
    MaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    AlertModule,
    FormsModule,
    ReactiveFormsModule,     
    CloudAppTranslateModule.forRoot(),
  ],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'standard' } },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
