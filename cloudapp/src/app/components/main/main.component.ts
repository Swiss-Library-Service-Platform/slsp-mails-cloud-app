import { Component, OnInit, OnDestroy } from '@angular/core';
import { CloudAppEventsService, EntityType } from '@exlibris/exl-cloudapp-angular-lib';
import { SlspMailsAPIService } from '../../services/mails.api.service';
import { LoaderService } from '../../services/loader.service';
import { StatusService } from '../../services/status.service';
import { TranslateService } from '@ngx-translate/core';
import { EntitiesService } from '../../services/entities.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  public isUserAllowed: boolean = false;
  public isUserCheckDone: boolean = false;
  public currentEntityTitle: String = '';

  constructor(
    private slspmailsService: SlspMailsAPIService,
    public loaderService: LoaderService,
    public statusService: StatusService,
    public entitiesService: EntitiesService,
    private translateService: TranslateService,
  ) { }

  async ngOnInit() {
    const statusText = await this.translateService.get('Main.Status.Initializing').toPromise();
    this.loaderService.show();
    this.statusService.set(statusText);
    this.entitiesService.getObservableCurrentEntityType().subscribe(
      async (res) => {
        if (res == EntityType.VENDOR) {
          this.currentEntityTitle = await this.translateService.get('Main.Title_Vendor').toPromise();
        }
      }
    );

    await this.slspmailsService.init();
    this.isUserAllowed = await this.slspmailsService.authenticateAndCheckIfUserAllowed();
    this.isUserCheckDone = true;

    this.currentEntityTitle = this.translateService.instant('Main.Title_User');
    
    this.loaderService.hide();

    if (!this.isUserAllowed) {
      return;
    }
  }

  ngOnDestroy() {
  }

}