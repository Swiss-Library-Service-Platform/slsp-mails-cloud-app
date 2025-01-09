import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CloudAppEventsService, Entity } from '@exlibris/exl-cloudapp-angular-lib';
import { EntityType } from '@exlibris/exl-cloudapp-angular-lib';
import { MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';

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

  private readonly _entitiesObject = new BehaviorSubject<Entity[]>([]);
  private readonly _selectedEntityObject = new BehaviorSubject<Entity>(null);
  private readonly _currentEntityType = new BehaviorSubject<EntityType>(null);

  /**
   * TODO:
   * Cleanup this mess.
   * The entities service and entity-selection component work together, 
   * but seperation of concerns is not clear.
   */

  constructor(
    private eventsService: CloudAppEventsService,
    private router: Router,
  ) {
    this.eventsService.entities$.subscribe(entities => {
      if (this.router.url.includes('user-log-list')) {
        // we are in the user-log-list component, so we first want to navigate back to the main component
        // then because we set selectedEntity down below, the entity-selection component will navigate back into user log list
        this.router.navigate(['main']);
      }
      const filteredEntities = entities.filter(e => {
        return e.type == EntityType.USER || e.type == EntityType.VENDOR;
      });
      this._currentEntityType.next(filteredEntities[0]?.type);
      this._entitiesObject.next(filteredEntities);

      if (filteredEntities.length == 1 && !this.router.url.includes('log-detail')) {
        // If there is only one entity selecatble
        // and we are not in the log-detail component (where we probably want to stay)
        this._selectedEntityObject.next(filteredEntities[0]);
      }
    });
  }

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
   * Get the current entity type as observable
   */
  getObservableCurrentEntityType(): Observable<EntityType> {
    return this._currentEntityType.asObservable();
  }

  /**
   * Set the user
   * @param event 
   */
  async selectEntity(event: MatRadioChange) {
    const value = event.value as Entity;
    this._selectedEntityObject.next(value);
  }

  /*
  * Reset the selected entity
  */
  resetSelectedEntity() {
    this._selectedEntityObject.next(null);
  }

}
