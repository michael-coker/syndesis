import { ListView } from 'patternfly-react';
import * as React from 'react';

export class IntegrationEditorActionsList extends React.Component<{}> {
  public render() {
    return <ListView>{this.props.children}</ListView>;
  }
}
