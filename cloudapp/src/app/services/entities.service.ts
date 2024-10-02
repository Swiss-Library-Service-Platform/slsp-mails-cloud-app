import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CloudAppEventsService, Entity } from '@exlibris/exl-cloudapp-angular-lib';
import { EntityType } from '@exlibris/exl-cloudapp-angular-lib';
import { MatRadioChange } from '@angular/material/radio';
import { ActivatedRoute } from '@angular/router';

/**
 * Service which is responsible for API calls to the SLSPmails API
 *
 * @export
 * @class SlspMailsAPIService
 */
@Injectable({
  providedIn: 'root'
})
export class EntitiesService {

  private entities: Entity[] = [];
  private readonly _entitiesObject = new BehaviorSubject<Entity[]>([]);

  private selectedEntity: Entity;
  private readonly _selectedEntityObject = new BehaviorSubject<Entity>(null);

  constructor(
    private eventsService: CloudAppEventsService,
  ) {
    this.eventsService.entities$.subscribe(entities => {
      const filteredEntities = entities.filter(e => {
        return e.type == EntityType.USER || e.type == EntityType.VENDOR;
      });
      this._entitiesObject.next(filteredEntities);
      this.entities = filteredEntities;

      // Auto select the entity if there is only one
      if (filteredEntities.length == 1) {
        this.selectedEntity = filteredEntities[0];
        this._selectedEntityObject.next(filteredEntities[0]);
      }
      
    });
  }

  entities$: Observable<Entity[]> = this.eventsService.entities$;

  /**
   * Get the entities object as observable
   */
  getObservableEntitiesObject(): Observable<Entity[]> {
    return this._entitiesObject.asObservable();
  }

  /**
   * Get the selected entity object as observable
   */
  getObservableSelectedEntityObject(): Observable<Entity> {
    return this._selectedEntityObject.asObservable();
  }

  /**
   * Set the user
   * @param event 
   */
  async selectEntity(event: MatRadioChange) {
    const value = event.value as Entity;
    this.selectedEntity = value;
    this._selectedEntityObject.next(value);
  }

  /*
  * Reset the selected entity
  */
  resetSelectedEntity() {
    this.selectedEntity = null;
    this._selectedEntityObject.next(null);
  }

}
