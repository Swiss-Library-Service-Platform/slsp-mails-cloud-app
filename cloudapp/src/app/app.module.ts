import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule, CloudAppTranslateModule, AlertModule, LazyTranslateLoader } from '@exlibris/exl-cloudapp-angular-lib';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MainComponent } from './components/main/main.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NavigationheaderComponent } from './components/navigationheader/navigationheader.component';
import { MomentFormatPipe } from './pipes/moment.pipe';
import { LogOverviewComponent } from './components/user-log-list/user-log-list.component';
import { TruncatePipe } from './pipes/truncate.pip';
import { LogDetailComponent } from './components/log-detail/log-detail.component';
import { MailStatusChipComponent } from './components/mail-status-chip/mail-status-chip.component';
import { EntitySelectionComponent } from './components/entity-selection/entity-selection.component';
import { UndeliverableOverviewComponent } from './components/undeliverable-overview/undeliverable-overview.component';
import { LogRowComponent } from './components/log-row/log-row.component';
import { TranslateLoader, TranslateModule, TranslateParser } from '@ngx-translate/core';
import { TranslateICUParser } from 'ngx-translate-parser-plural-select';

export function getTranslateModuleWithICU() {
  return TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useClass: (LazyTranslateLoader)
    },
    parser: {
      provide: TranslateParser,
      useClass: TranslateICUParser
    }
  });
}
@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    LogOverviewComponent,
    LogDetailComponent,
    NavigationheaderComponent,
    MomentFormatPipe,
    TruncatePipe,
    MailStatusChipComponent,
    EntitySelectionComponent,
    UndeliverableOverviewComponent,
    LogRowComponent
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
    getTranslateModuleWithICU()
  ],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'standard' } },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
