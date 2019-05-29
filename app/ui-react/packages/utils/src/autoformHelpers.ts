import {
  IFormDefinition,
  IFormDefinitionProperty,
  IFormErrors,
} from '@syndesis/auto-form';
import {
  IConfigurationProperties,
  IConfigurationProperty,
} from '@syndesis/models';

/**
 * Maps an API map of ConfigurationProperty objects to
 * an autoform IFormDefinition object.  Use on properties
 * objects from backend responses to ensure they're mapped
 * properly
 *
 * @param properties
 */
export function toFormDefinition(properties: IConfigurationProperties) {
  if (!properties) {
    throw new Error('Undefined value passed to form definition converter');
  }
  const answer: IFormDefinition = {};
  Object.keys(properties).forEach(key => {
    answer[key] = toFormDefinitionProperty(properties[key]);
  });
  return answer;
}

/**
 * Maps an API ConfigurationProperty object to an autoform IFormDefinitionPropertyObject
 * @param property
 */
export function toFormDefinitionProperty(property: IConfigurationProperty) {
  const {
    cols,
    max,
    min,
    multiple,
    rows,
    controlHint,
    controlTooltip,
    labelHint,
    labelTooltip,
    ...formDefinitionProperty
  } = property as any; // needed, ConfigurationProperty is a lie
  return {
    ...formDefinitionProperty,
    controlHint: controlHint || controlTooltip,
    fieldAttributes: {
      cols,
      max,
      min,
      multiple,
      rows,
    },
    labelHint: labelHint || labelTooltip,
  } as IFormDefinitionProperty;
}

/**
 * Returns a new configuredProperties object with any default values set from
 * the given definition if they aren't set already
 * @param properties
 * @param initial
 */
export function applyInitialValues<T>(
  properties: IConfigurationProperties,
  initial?: T
): T {
  const configuredProperties =
    typeof initial !== 'undefined' ? { ...initial } : {};
  Object.keys(properties).forEach(key => {
    const property = properties[key];
    // `property.value` being set is deprecated, defaultValue takes precedence
    if (
      typeof property.value !== 'undefined' &&
      typeof configuredProperties[key] === 'undefined'
    ) {
      configuredProperties[key] = property.value;
    }
    if (
      typeof property.defaultValue !== 'undefined' &&
      typeof configuredProperties[key] === 'undefined'
    ) {
      configuredProperties[key] = property.defaultValue;
    }
  });
  return configuredProperties as T;
}

export function anyFieldsRequired(properties: IConfigurationProperties) {
  return (
    Object.keys(properties)
      .filter(key => requiredTypeMask(properties[key]))
      .filter(key => properties[key].required).length > 0
  );
}

function requiredTypeMask(property: IConfigurationProperty) {
  switch (property.type) {
    case 'boolean':
    case 'checkbox':
    case 'hidden':
      return false;
    default:
      return true;
  }
}

export function allFieldsRequired(properties: IConfigurationProperties) {
  const keys = Object.keys(properties).filter(key =>
    requiredTypeMask(properties[key])
  );
  const allRequired = keys.filter(key => properties[key].required);
  if (allRequired.length === 0) {
    return false;
  }
  return keys.length === allRequired.length;
}

export function getRequiredStatusText(
  properties: IConfigurationProperties,
  allRequired: string,
  someRequired: string,
  noneRequired: string
) {
  if (allFieldsRequired(properties)) {
    return allRequired;
  }
  if (anyFieldsRequired(properties)) {
    return someRequired;
  }
  return noneRequired;
}

/**
 * Evaluates the values according to the given property definition and returns
 * a boolean if the supplied values are valid or not.
 * @param properties
 * @param values
 */
export function validateConfiguredProperties(
  properties: IConfigurationProperties,
  values?: { [name: string]: any }
) {
  if (typeof values === 'undefined') {
    return false;
  }
  const allRequired = Object.keys(properties).filter(
    key => properties[key].required
  );
  if (allRequired.length === 0) {
    return true;
  }
  const allRequiredSet = allRequired
    .map(key => validateRequired(values[key]))
    .reduce((prev, curr) => curr, false);
  return allRequiredSet;
}

/**
 * Examine the given property and determine if it's set or not,
 * for string values this includes evaluating against ''
 * @param value
 */
export function validateRequired(value?: any) {
  if (typeof value === 'undefined') {
    return false;
  }
  if (typeof value === 'string') {
    return (value as string) !== '';
  }
  return true;
}

/**
 * Evaluates the given values against the supplied property definition
 * object and returns an IFormErrors map that can be returned to auto-form
 * @param properties
 * @param getErrorString
 * @param values
 */
export function validateRequiredProperties<T>(
  properties: IConfigurationProperties | IFormDefinition,
  getErrorString: (name: string) => string,
  values?: T
): IFormErrors<T> {
  const allRequired = Object.keys(properties).filter(
    key => properties[key].required
  );
  if (allRequired.length === 0) {
    return {} as IFormErrors<T>;
  }
  const sanitizedValues = values || ({} as T);
  return allRequired
    .map(key => ({ key, defined: validateRequired(sanitizedValues[key]) }))
    .reduce(
      (acc, current) => {
        if (!current.defined) {
          acc[current.key] = getErrorString(
            properties[current.key].displayName || current.key
          );
        }
        return acc;
      },
      {} as IFormErrors<T>
    );
}