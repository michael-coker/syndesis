import {
  canActivate,
  canDeactivate,
  canEdit,
  getFinishIcon,
  getStartIcon,
  WithIntegrationHelpers,
} from '@syndesis/api';
import { IntegrationWithMonitoring } from '@syndesis/models';
import {
  ConfirmationButtonStyle,
  ConfirmationDialog,
  ConfirmationIconType,
  IIntegrationAction,
  IntegrationsList,
  IntegrationsListItem,
  IntegrationsListItemActions,
  IntegrationsListItemUnreadable,
  IntegrationsListSkeleton,
} from '@syndesis/ui';
import { WithLoader } from '@syndesis/utils';
import * as React from 'react';
import { Translation } from 'react-i18next';
import { AppContext } from '../../../app';
import resolvers from '../resolvers';

export interface IIntegrationsProps {
  error: boolean;
  loading: boolean;
  integrations: IntegrationWithMonitoring[];
}

export interface IIntegrationsState {
  showPromptDialog: boolean;
  promptDialogButtonText?: string;
  promptDialogIcon?: ConfirmationIconType;
  promptDialogText?: string;
  promptDialogTitle?: string;
  handleAction?: () => void;
}

interface IPromptActionOptions {
  promptDialogButtonStyle: ConfirmationButtonStyle;
  promptDialogButtonText: string;
  promptDialogIcon: ConfirmationIconType;
  promptDialogText: string;
  promptDialogTitle: string;
  handleAction: () => void;
}

export class Integrations extends React.Component<
  IIntegrationsProps,
  IIntegrationsState
> {
  public constructor(props: IIntegrationsProps) {
    super(props);
    this.state = {
      showPromptDialog: false,
    };
    this.handleAction = this.handleAction.bind(this);
    this.handleActionCancel = this.handleActionCancel.bind(this);
    this.promptForAction = this.promptForAction.bind(this);
  }
  public handleActionCancel() {
    this.setState({
      showPromptDialog: false,
    });
  }
  public handleAction() {
    const action = this.state.handleAction;
    this.setState({
      showPromptDialog: false,
    });
    if (typeof action === 'function') {
      action.apply(this);
    } else {
      throw Error('Undefined action set for confirmation dialog');
    }
  }
  public promptForAction(options: IPromptActionOptions) {
    this.setState({
      ...options,
      showPromptDialog: true,
    });
  }
  public render() {
    return (
      <Translation ns={['integrations', 'shared']}>
        {t => (
          <AppContext.Consumer>
            {({ config, getPodLogUrl }) => (
              <WithIntegrationHelpers>
                {({
                  deleteIntegration,
                  deployIntegration,
                  exportIntegration,
                  undeployIntegration,
                }) => (
                  <>
                    <ConfirmationDialog
                      buttonStyle={ConfirmationButtonStyle.NORMAL}
                      i18nCancelButtonText={t('shared:Cancel')}
                      i18nConfirmButtonText={this.state.promptDialogButtonText!}
                      i18nConfirmationMessage={this.state.promptDialogText!}
                      i18nTitle={this.state.promptDialogTitle!}
                      icon={this.state.promptDialogIcon!}
                      showDialog={this.state.showPromptDialog}
                      onCancel={this.handleActionCancel}
                      onConfirm={this.handleAction}
                    />
                    <IntegrationsList>
                      <WithLoader
                        error={this.props.error}
                        loading={this.props.loading}
                        loaderChildren={<IntegrationsListSkeleton />}
                        errorChildren={<div>TODO</div>}
                      >
                        {() =>
                          this.props.integrations.map(
                            (mi: IntegrationWithMonitoring) => {
                              try {
                                const editAction: IIntegrationAction = {
                                  href: resolvers.integration.edit.index({
                                    integration: mi.integration,
                                  }),
                                  label: 'Edit',
                                };
                                const startAction: IIntegrationAction = {
                                  label: 'Start',
                                  onClick: () =>
                                    this.promptForAction({
                                      handleAction: () =>
                                        deployIntegration(
                                          mi.integration.id!,
                                          mi.integration.version!,
                                          false
                                        ),
                                      promptDialogButtonStyle:
                                        ConfirmationButtonStyle.NORMAL,
                                      promptDialogButtonText: t('shared:Start'),
                                      promptDialogIcon:
                                        ConfirmationIconType.NONE,
                                      promptDialogText: t(
                                        'integrations:publishIntegrationModal',
                                        { name: mi.integration.name }
                                      ),
                                      promptDialogTitle: t(
                                        'integrations:publishIntegrationModalTitle'
                                      ),
                                    } as IPromptActionOptions),
                                };
                                const stopAction: IIntegrationAction = {
                                  label: 'Stop',
                                  onClick: () =>
                                    this.promptForAction({
                                      handleAction: () =>
                                        undeployIntegration(
                                          mi.integration.id!,
                                          mi.integration.version!
                                        ),
                                      promptDialogButtonStyle:
                                        ConfirmationButtonStyle.NORMAL,
                                      promptDialogButtonText: t('shared:Stop'),
                                      promptDialogIcon:
                                        ConfirmationIconType.NONE,
                                      promptDialogText: t(
                                        'integrations:unpublishIntegrationModal',
                                        { name: mi.integration.name }
                                      ),
                                      promptDialogTitle: t(
                                        'integrations:unpublishIntegrationModalTitle'
                                      ),
                                    } as IPromptActionOptions),
                                };
                                const deleteAction: IIntegrationAction = {
                                  label: 'Delete',
                                  onClick: () =>
                                    this.promptForAction({
                                      handleAction: () =>
                                        deleteIntegration(mi.integration.id!),
                                      promptDialogButtonStyle:
                                        ConfirmationButtonStyle.DANGER,
                                      promptDialogButtonText: t(
                                        'shared:Delete'
                                      ),
                                      promptDialogIcon:
                                        ConfirmationIconType.DANGER,
                                      promptDialogText: t(
                                        'integrations:deleteIntegrationModal',
                                        { name: mi.integration.name }
                                      ),
                                      promptDialogTitle: t(
                                        'integrations:deleteIntegrationModalTitle'
                                      ),
                                    } as IPromptActionOptions),
                                };
                                const exportAction: IIntegrationAction = {
                                  label: 'Export',
                                  onClick: () =>
                                    exportIntegration(
                                      mi.integration.id!,
                                      `${mi.integration.name}-export.zip`
                                    ),
                                };
                                const actions: IIntegrationAction[] = [];
                                if (canEdit(mi.integration)) {
                                  actions.push(editAction);
                                }
                                if (canActivate(mi.integration)) {
                                  actions.push(startAction);
                                }
                                if (canDeactivate(mi.integration)) {
                                  actions.push(stopAction);
                                }
                                actions.push(deleteAction);
                                actions.push(exportAction);
                                return (
                                  <IntegrationsListItem
                                    key={mi.integration.id}
                                    integrationName={mi.integration.name}
                                    currentState={mi.integration!.currentState!}
                                    targetState={mi.integration!.targetState!}
                                    isConfigurationRequired={
                                      !!(
                                        mi.integration!.board!.warnings ||
                                        mi.integration!.board!.errors ||
                                        mi.integration!.board!.notices
                                      )
                                    }
                                    monitoringValue={
                                      mi.monitoring &&
                                      t(
                                        'integrations:' +
                                          mi.monitoring.detailedState.value
                                      )
                                    }
                                    monitoringCurrentStep={
                                      mi.monitoring &&
                                      mi.monitoring.detailedState.currentStep
                                    }
                                    monitoringTotalSteps={
                                      mi.monitoring &&
                                      mi.monitoring.detailedState.totalSteps
                                    }
                                    monitoringLogUrl={getPodLogUrl(
                                      config,
                                      mi.monitoring
                                    )}
                                    startConnectionIcon={getStartIcon(
                                      config.apiEndpoint,
                                      mi.integration
                                    )}
                                    finishConnectionIcon={getFinishIcon(
                                      config.apiEndpoint,
                                      mi.integration
                                    )}
                                    actions={
                                      <IntegrationsListItemActions
                                        integrationId={mi.integration!.id!}
                                        actions={actions}
                                        detailsHref={resolvers.integration.details(
                                          { integration: mi.integration }
                                        )}
                                      />
                                    }
                                    i18nConfigurationRequired={t(
                                      'integrations:ConfigurationRequired'
                                    )}
                                    i18nError={t('shared:Error')}
                                    i18nPublished={t('shared:Published')}
                                    i18nUnpublished={t('shared:Unpublished')}
                                    i18nProgressPending={t('shared:Pending')}
                                    i18nProgressStarting={t(
                                      'integrations:progressStarting'
                                    )}
                                    i18nProgressStopping={t(
                                      'integrations:progressStopping'
                                    )}
                                    i18nLogUrlText={t('shared:viewLogs')}
                                  />
                                );
                              } catch (e) {
                                return (
                                  <IntegrationsListItemUnreadable
                                    key={mi.integration.id}
                                    integrationName={
                                      (mi &&
                                        mi.integration &&
                                        mi.integration.name) ||
                                      'An integration'
                                    }
                                    i18nDescription={
                                      "Sorry, we can't display more information about this integration right now."
                                    }
                                    rawObject={JSON.stringify(
                                      mi.integration,
                                      null,
                                      2
                                    )}
                                  />
                                );
                              }
                            }
                          )
                        }
                      </WithLoader>
                    </IntegrationsList>
                  </>
                )}
              </WithIntegrationHelpers>
            )}
          </AppContext.Consumer>
        )}
      </Translation>
    );
  }
}
