import { map, first } from 'rxjs/operators';
import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { ModalService } from '@syndesis/ui/common';
import {
  ApiConnectorState,
  ApiConnectorStore,
  ApiConnectorActions,
  getApiConnectorState,
  CustomConnectorRequest,
  CustomApiConnectorAuthSettings
} from '@syndesis/ui/customizations/api-connector';

import { ApiEditorComponent, ApiDefinition } from 'apicurio-design-studio';
import { OtCommand } from 'oai-ts-commands';

enum WizardSteps {
  UploadSwagger = 1,
  ReviewApiConnector = 2,
  UpdateAuthSettings = 3,
  SubmitRequest = 4
}

@Component({
  selector: 'syndesis-api-connector-create',
  styleUrls: ['./api-connector-create.component.scss'],
  templateUrl: './api-connector-create.component.html'
})
export class ApiConnectorCreateComponent implements OnInit, OnDestroy {
  currentActiveStep = 1;
  apiConnectorState$: Observable<ApiConnectorState>;
<<<<<<< HEAD
  displayDefinitionEditor = false;
=======
>>>>>>> Add temporary API definition in constructor

  @ViewChild('_apiEditor') _apiEditor: ApiEditorComponent;
  apiDef: ApiDefinition;

  @ViewChild('cancelModalTemplate') cancelModalTemplate: TemplateRef<any>;

  private cancelModalId = 'create-cancellation-modal';

  constructor(
    private router: Router,
    private modalService: ModalService,
    private apiConnectorStore: Store<ApiConnectorStore>
<<<<<<< HEAD
  ) {}
=======
  ) {
    this.apiDef = new ApiDefinition();
    this.apiDef.createdBy = 'user1';
    this.apiDef.createdOn = new Date();
    this.apiDef.tags = [];
    this.apiDef.description = '';
    this.apiDef.id = 'api-1';
    this.apiDef.spec = {
      'openapi': '3.0.0',
      'info': {
        'title': 'Simple OAI 3.0.0 API',
        'description': 'A simple API using OpenAPI 3.0.0.',
        'contact': {
          'name': 'Example Org',
          'url': 'http://www.example.org',
          'email': 'contact@example.org'
        },
        'license': {
          'name': 'Apache 2.0',
          'url': 'https://www.apache.org/licenses/LICENSE-2.0'
        },
        'version': '2.0.11'
      },
      'paths': {
      },
      'components': {
        'schemas': {
          'Address': {
            'properties': {
              'name': {},
              'street': {},
              'city': {},
              'state': {},
              'zip': {}
            }
          },
          'User': {
            'properties': {
              'address': {
                '$ref': '#/components/schemas/Address'
              }
            }
          }
        },
        'securitySchemes': {
          'Basic': {
            'type': 'http',
            'description': 'Basic auth.',
            'scheme': 'Basic'
          }
        }
      },
      'tags': [
        {
          'name': 'foo',
          'description': 'The Foo tag.'
        },
        {
          'name': 'bar',
          'description': 'The bar tag.'
        },
        {
          'name': 'baz',
          'description': 'The baz tag.\n'
        }
      ]
    };
  }
>>>>>>> Add temporary API definition in constructor

<<<<<<< HEAD
=======

  public apiDefinition(): ApiDefinition {
    return this.apiDef;
  }

>>>>>>> Add fnx to ApiConnectorCreateComponent
  public onUserSelection(selection: string): void {
    console.log('User selection changed: ', selection);
  }

  public onUserChange(command: OtCommand): void {
    console.log('Something happened! ' + JSON.stringify(command));
  }

  public showDefinitionEditor(): boolean {
    return true;
  }

  ngOnInit() {
    this.modalService.registerModal(
      this.cancelModalId,
      this.cancelModalTemplate
    );
    this.apiConnectorState$ = this.apiConnectorStore.select(
      getApiConnectorState
    );

    // Once the request validation results are yielded for the 1st time, we move user to step 2
    this.apiConnectorState$.map(apiConnectorState => apiConnectorState.createRequest)
      .first(request => !!request && !!request.actionsSummary)
      .subscribe( apiConnectorState => {
        // TODO error handling!
        const reader = new FileReader();
        reader.onload = () => {
          this.apiDef = new ApiDefinition();
          this.apiDef.createdBy = 'user1';
          this.apiDef.createdOn = new Date();
          this.apiDef.tags = [];
          this.apiDef.description = '';
          this.apiDef.id = 'api-1';
          this.apiDef.spec = reader.result;
          this.currentActiveStep = WizardSteps.ReviewApiConnector;
        };
        reader.readAsText(apiConnectorState.specificationFile);
      });

    // Once the request object is flagged as 'isComplete', we redirect the user to the main listing
    this.apiConnectorState$
      .pipe(map(apiConnectorState => apiConnectorState.createRequest))
      .pipe(first(request => !!request && request.isComplete))
      .subscribe(() => this.redirectBack());
  }

  showCancelModal(): void {
    this.modalService.show(this.cancelModalId).then(modal => {
      if (modal.result) {
        this.redirectBack();
      }
    });
  }

  onCancel(doCancel: boolean): void {
    this.modalService.hide(this.cancelModalId, doCancel);
  }

  onValidationRequest(request: CustomConnectorRequest) {
    this.apiConnectorStore.dispatch(
      ApiConnectorActions.validateSwagger(request)
    );
  }

  onReviewComplete({event: event, displayEditor: displayEditor}): void {
    // Check if request is to show editor or not
    if (displayEditor === true) {
      this.displayDefinitionEditor = true;

    } else {
      this.displayDefinitionEditor = false;
      this.currentActiveStep = WizardSteps.UpdateAuthSettings;
    }
  }

  onAuthSetup(authSettings: CustomApiConnectorAuthSettings): void {
    this.apiConnectorStore.dispatch(
      ApiConnectorActions.updateAuthSettings(authSettings)
    );
    this.currentActiveStep = WizardSteps.SubmitRequest;
  }

  onCreateComplete(customConnectorRequest: CustomConnectorRequest): void {
    this.apiConnectorStore.dispatch(
      ApiConnectorActions.create(customConnectorRequest)
    );
  }

  ngOnDestroy() {
    this.modalService.unregisterModal(this.cancelModalId);
    this.apiConnectorStore.dispatch(ApiConnectorActions.createCancel());
  }

  private redirectBack(): void {
    this.router.navigate(['customizations', 'api-connector']);
  }
}
