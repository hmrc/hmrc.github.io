(function () {
  'use strict';

  function getFragmentFromUrl(url) {
    if (!url.includes('#')) {
      return undefined;
    }
    return url.split('#').pop();
  }
  function getBreakpoint(name) {
    const property = `--govuk-frontend-breakpoint-${name}`;
    const value = window.getComputedStyle(document.documentElement).getPropertyValue(property);
    return {
      property,
      value: value || undefined
    };
  }
  function setFocus($element, options = {}) {
    var _options$onBeforeFocu;
    const isFocusable = $element.getAttribute('tabindex');
    if (!isFocusable) {
      $element.setAttribute('tabindex', '-1');
    }
    function onFocus() {
      $element.addEventListener('blur', onBlur, {
        once: true
      });
    }
    function onBlur() {
      var _options$onBlur;
      (_options$onBlur = options.onBlur) == null || _options$onBlur.call($element);
      if (!isFocusable) {
        $element.removeAttribute('tabindex');
      }
    }
    $element.addEventListener('focus', onFocus, {
      once: true
    });
    (_options$onBeforeFocu = options.onBeforeFocus) == null || _options$onBeforeFocu.call($element);
    $element.focus();
  }
  function isInitialised($root, moduleName) {
    return $root instanceof HTMLElement && $root.hasAttribute(`data-${moduleName}-init`);
  }

  /**
   * Checks if GOV.UK Frontend is supported on this page
   *
   * Some browsers will load and run our JavaScript but GOV.UK Frontend
   * won't be supported.
   *
   * @param {HTMLElement | null} [$scope] - (internal) `<body>` HTML element checked for browser support
   * @returns {boolean} Whether GOV.UK Frontend is supported on this page
   */
  function isSupported($scope = document.body) {
    if (!$scope) {
      return false;
    }
    return $scope.classList.contains('govuk-frontend-supported');
  }
  function isArray(option) {
    return Array.isArray(option);
  }
  function isObject(option) {
    return !!option && typeof option === 'object' && !isArray(option);
  }
  function formatErrorMessage(Component, message) {
    return `${Component.moduleName}: ${message}`;
  }

  class GOVUKFrontendError extends Error {
    constructor(...args) {
      super(...args);
      this.name = 'GOVUKFrontendError';
    }
  }
  class SupportError extends GOVUKFrontendError {
    /**
     * Checks if GOV.UK Frontend is supported on this page
     *
     * @param {HTMLElement | null} [$scope] - HTML element `<body>` checked for browser support
     */
    constructor($scope = document.body) {
      const supportMessage = 'noModule' in HTMLScriptElement.prototype ? 'GOV.UK Frontend initialised without `<body class="govuk-frontend-supported">` from template `<script>` snippet' : 'GOV.UK Frontend is not supported in this browser';
      super($scope ? supportMessage : 'GOV.UK Frontend initialised without `<script type="module">`');
      this.name = 'SupportError';
    }
  }
  class ConfigError extends GOVUKFrontendError {
    constructor(...args) {
      super(...args);
      this.name = 'ConfigError';
    }
  }
  class ElementError extends GOVUKFrontendError {
    constructor(messageOrOptions) {
      let message = typeof messageOrOptions === 'string' ? messageOrOptions : '';
      if (typeof messageOrOptions === 'object') {
        const {
          component,
          identifier,
          element,
          expectedType
        } = messageOrOptions;
        message = identifier;
        message += element ? ` is not of type ${expectedType != null ? expectedType : 'HTMLElement'}` : ' not found';
        message = formatErrorMessage(component, message);
      }
      super(message);
      this.name = 'ElementError';
    }
  }
  class InitError extends GOVUKFrontendError {
    constructor(componentOrMessage) {
      const message = typeof componentOrMessage === 'string' ? componentOrMessage : formatErrorMessage(componentOrMessage, `Root element (\`$root\`) already initialised`);
      super(message);
      this.name = 'InitError';
    }
  }

  class Component {
    /**
     * Returns the root element of the component
     *
     * @protected
     * @returns {RootElementType} - the root element of component
     */
    get $root() {
      return this._$root;
    }
    constructor($root) {
      this._$root = void 0;
      const childConstructor = this.constructor;
      if (typeof childConstructor.moduleName !== 'string') {
        throw new InitError(`\`moduleName\` not defined in component`);
      }
      if (!($root instanceof childConstructor.elementType)) {
        throw new ElementError({
          element: $root,
          component: childConstructor,
          identifier: 'Root element (`$root`)',
          expectedType: childConstructor.elementType.name
        });
      } else {
        this._$root = $root;
      }
      childConstructor.checkSupport();
      this.checkInitialised();
      const moduleName = childConstructor.moduleName;
      this.$root.setAttribute(`data-${moduleName}-init`, '');
    }
    checkInitialised() {
      const constructor = this.constructor;
      const moduleName = constructor.moduleName;
      if (moduleName && isInitialised(this.$root, moduleName)) {
        throw new InitError(constructor);
      }
    }
    static checkSupport() {
      if (!isSupported()) {
        throw new SupportError();
      }
    }
  }

  /**
   * @typedef ChildClass
   * @property {string} moduleName - The module name that'll be looked for in the DOM when initialising the component
   */

  /**
   * @typedef {typeof Component & ChildClass} ChildClassConstructor
   */
  Component.elementType = HTMLElement;

  const configOverride = Symbol.for('configOverride');
  class ConfigurableComponent extends Component {
    [configOverride](param) {
      return {};
    }

    /**
     * Returns the root element of the component
     *
     * @protected
     * @returns {ConfigurationType} - the root element of component
     */
    get config() {
      return this._config;
    }
    constructor($root, config) {
      super($root);
      this._config = void 0;
      const childConstructor = this.constructor;
      if (!isObject(childConstructor.defaults)) {
        throw new ConfigError(formatErrorMessage(childConstructor, 'Config passed as parameter into constructor but no defaults defined'));
      }
      const datasetConfig = normaliseDataset(childConstructor, this._$root.dataset);
      this._config = mergeConfigs(childConstructor.defaults, config != null ? config : {}, this[configOverride](datasetConfig), datasetConfig);
    }
  }
  function normaliseString(value, property) {
    const trimmedValue = value ? value.trim() : '';
    let output;
    let outputType = property == null ? void 0 : property.type;
    if (!outputType) {
      if (['true', 'false'].includes(trimmedValue)) {
        outputType = 'boolean';
      }
      if (trimmedValue.length > 0 && isFinite(Number(trimmedValue))) {
        outputType = 'number';
      }
    }
    switch (outputType) {
      case 'boolean':
        output = trimmedValue === 'true';
        break;
      case 'number':
        output = Number(trimmedValue);
        break;
      default:
        output = value;
    }
    return output;
  }
  function normaliseDataset(Component, dataset) {
    if (!isObject(Component.schema)) {
      throw new ConfigError(formatErrorMessage(Component, 'Config passed as parameter into constructor but no schema defined'));
    }
    const out = {};
    const entries = Object.entries(Component.schema.properties);
    for (const entry of entries) {
      const [namespace, property] = entry;
      const field = namespace.toString();
      if (field in dataset) {
        out[field] = normaliseString(dataset[field], property);
      }
      if ((property == null ? void 0 : property.type) === 'object') {
        out[field] = extractConfigByNamespace(Component.schema, dataset, namespace);
      }
    }
    return out;
  }
  function mergeConfigs(...configObjects) {
    const formattedConfigObject = {};
    for (const configObject of configObjects) {
      for (const key of Object.keys(configObject)) {
        const option = formattedConfigObject[key];
        const override = configObject[key];
        if (isObject(option) && isObject(override)) {
          formattedConfigObject[key] = mergeConfigs(option, override);
        } else {
          formattedConfigObject[key] = override;
        }
      }
    }
    return formattedConfigObject;
  }
  function validateConfig(schema, config) {
    const validationErrors = [];
    for (const [name, conditions] of Object.entries(schema)) {
      const errors = [];
      if (Array.isArray(conditions)) {
        for (const {
          required,
          errorMessage
        } of conditions) {
          if (!required.every(key => !!config[key])) {
            errors.push(errorMessage);
          }
        }
        if (name === 'anyOf' && !(conditions.length - errors.length >= 1)) {
          validationErrors.push(...errors);
        }
      }
    }
    return validationErrors;
  }
  function extractConfigByNamespace(schema, dataset, namespace) {
    const property = schema.properties[namespace];
    if ((property == null ? void 0 : property.type) !== 'object') {
      return;
    }
    const newObject = {
      [namespace]: {}
    };
    for (const [key, value] of Object.entries(dataset)) {
      let current = newObject;
      const keyParts = key.split('.');
      for (const [index, name] of keyParts.entries()) {
        if (isObject(current)) {
          if (index < keyParts.length - 1) {
            if (!isObject(current[name])) {
              current[name] = {};
            }
            current = current[name];
          } else if (key !== namespace) {
            current[name] = normaliseString(value);
          }
        }
      }
    }
    return newObject[namespace];
  }

  class I18n {
    constructor(translations = {}, config = {}) {
      var _config$locale;
      this.translations = void 0;
      this.locale = void 0;
      this.translations = translations;
      this.locale = (_config$locale = config.locale) != null ? _config$locale : document.documentElement.lang || 'en';
    }
    t(lookupKey, options) {
      if (!lookupKey) {
        throw new Error('i18n: lookup key missing');
      }
      let translation = this.translations[lookupKey];
      if (typeof (options == null ? void 0 : options.count) === 'number' && typeof translation === 'object') {
        const translationPluralForm = translation[this.getPluralSuffix(lookupKey, options.count)];
        if (translationPluralForm) {
          translation = translationPluralForm;
        }
      }
      if (typeof translation === 'string') {
        if (translation.match(/%{(.\S+)}/)) {
          if (!options) {
            throw new Error('i18n: cannot replace placeholders in string if no option data provided');
          }
          return this.replacePlaceholders(translation, options);
        }
        return translation;
      }
      return lookupKey;
    }
    replacePlaceholders(translationString, options) {
      const formatter = Intl.NumberFormat.supportedLocalesOf(this.locale).length ? new Intl.NumberFormat(this.locale) : undefined;
      return translationString.replace(/%{(.\S+)}/g, function (placeholderWithBraces, placeholderKey) {
        if (Object.prototype.hasOwnProperty.call(options, placeholderKey)) {
          const placeholderValue = options[placeholderKey];
          if (placeholderValue === false || typeof placeholderValue !== 'number' && typeof placeholderValue !== 'string') {
            return '';
          }
          if (typeof placeholderValue === 'number') {
            return formatter ? formatter.format(placeholderValue) : `${placeholderValue}`;
          }
          return placeholderValue;
        }
        throw new Error(`i18n: no data found to replace ${placeholderWithBraces} placeholder in string`);
      });
    }
    hasIntlPluralRulesSupport() {
      return Boolean('PluralRules' in window.Intl && Intl.PluralRules.supportedLocalesOf(this.locale).length);
    }
    getPluralSuffix(lookupKey, count) {
      count = Number(count);
      if (!isFinite(count)) {
        return 'other';
      }
      const translation = this.translations[lookupKey];
      const preferredForm = this.hasIntlPluralRulesSupport() ? new Intl.PluralRules(this.locale).select(count) : this.selectPluralFormUsingFallbackRules(count);
      if (typeof translation === 'object') {
        if (preferredForm in translation) {
          return preferredForm;
        } else if ('other' in translation) {
          console.warn(`i18n: Missing plural form ".${preferredForm}" for "${this.locale}" locale. Falling back to ".other".`);
          return 'other';
        }
      }
      throw new Error(`i18n: Plural form ".other" is required for "${this.locale}" locale`);
    }
    selectPluralFormUsingFallbackRules(count) {
      count = Math.abs(Math.floor(count));
      const ruleset = this.getPluralRulesForLocale();
      if (ruleset) {
        return I18n.pluralRules[ruleset](count);
      }
      return 'other';
    }
    getPluralRulesForLocale() {
      const localeShort = this.locale.split('-')[0];
      for (const pluralRule in I18n.pluralRulesMap) {
        const languages = I18n.pluralRulesMap[pluralRule];
        if (languages.includes(this.locale) || languages.includes(localeShort)) {
          return pluralRule;
        }
      }
    }
  }
  I18n.pluralRulesMap = {
    arabic: ['ar'],
    chinese: ['my', 'zh', 'id', 'ja', 'jv', 'ko', 'ms', 'th', 'vi'],
    french: ['hy', 'bn', 'fr', 'gu', 'hi', 'fa', 'pa', 'zu'],
    german: ['af', 'sq', 'az', 'eu', 'bg', 'ca', 'da', 'nl', 'en', 'et', 'fi', 'ka', 'de', 'el', 'hu', 'lb', 'no', 'so', 'sw', 'sv', 'ta', 'te', 'tr', 'ur'],
    irish: ['ga'],
    russian: ['ru', 'uk'],
    scottish: ['gd'],
    spanish: ['pt-PT', 'it', 'es'],
    welsh: ['cy']
  };
  I18n.pluralRules = {
    arabic(n) {
      if (n === 0) {
        return 'zero';
      }
      if (n === 1) {
        return 'one';
      }
      if (n === 2) {
        return 'two';
      }
      if (n % 100 >= 3 && n % 100 <= 10) {
        return 'few';
      }
      if (n % 100 >= 11 && n % 100 <= 99) {
        return 'many';
      }
      return 'other';
    },
    chinese() {
      return 'other';
    },
    french(n) {
      return n === 0 || n === 1 ? 'one' : 'other';
    },
    german(n) {
      return n === 1 ? 'one' : 'other';
    },
    irish(n) {
      if (n === 1) {
        return 'one';
      }
      if (n === 2) {
        return 'two';
      }
      if (n >= 3 && n <= 6) {
        return 'few';
      }
      if (n >= 7 && n <= 10) {
        return 'many';
      }
      return 'other';
    },
    russian(n) {
      const lastTwo = n % 100;
      const last = lastTwo % 10;
      if (last === 1 && lastTwo !== 11) {
        return 'one';
      }
      if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) {
        return 'few';
      }
      if (last === 0 || last >= 5 && last <= 9 || lastTwo >= 11 && lastTwo <= 14) {
        return 'many';
      }
      return 'other';
    },
    scottish(n) {
      if (n === 1 || n === 11) {
        return 'one';
      }
      if (n === 2 || n === 12) {
        return 'two';
      }
      if (n >= 3 && n <= 10 || n >= 13 && n <= 19) {
        return 'few';
      }
      return 'other';
    },
    spanish(n) {
      if (n === 1) {
        return 'one';
      }
      if (n % 1000000 === 0 && n !== 0) {
        return 'many';
      }
      return 'other';
    },
    welsh(n) {
      if (n === 0) {
        return 'zero';
      }
      if (n === 1) {
        return 'one';
      }
      if (n === 2) {
        return 'two';
      }
      if (n === 3) {
        return 'few';
      }
      if (n === 6) {
        return 'many';
      }
      return 'other';
    }
  };

  /**
   * Accordion component
   *
   * This allows a collection of sections to be collapsed by default, showing only
   * their headers. Sections can be expanded or collapsed individually by clicking
   * their headers. A "Show all sections" button is also added to the top of the
   * accordion, which switches to "Hide all sections" when all the sections are
   * expanded.
   *
   * The state of each section is saved to the DOM via the `aria-expanded`
   * attribute, which also provides accessibility.
   *
   * @preserve
   * @augments ConfigurableComponent<AccordionConfig>
   */
  class Accordion extends ConfigurableComponent {
    /**
     * @param {Element | null} $root - HTML element to use for accordion
     * @param {AccordionConfig} [config] - Accordion config
     */
    constructor($root, config = {}) {
      super($root, config);
      this.i18n = void 0;
      this.controlsClass = 'govuk-accordion__controls';
      this.showAllClass = 'govuk-accordion__show-all';
      this.showAllTextClass = 'govuk-accordion__show-all-text';
      this.sectionClass = 'govuk-accordion__section';
      this.sectionExpandedClass = 'govuk-accordion__section--expanded';
      this.sectionButtonClass = 'govuk-accordion__section-button';
      this.sectionHeaderClass = 'govuk-accordion__section-header';
      this.sectionHeadingClass = 'govuk-accordion__section-heading';
      this.sectionHeadingDividerClass = 'govuk-accordion__section-heading-divider';
      this.sectionHeadingTextClass = 'govuk-accordion__section-heading-text';
      this.sectionHeadingTextFocusClass = 'govuk-accordion__section-heading-text-focus';
      this.sectionShowHideToggleClass = 'govuk-accordion__section-toggle';
      this.sectionShowHideToggleFocusClass = 'govuk-accordion__section-toggle-focus';
      this.sectionShowHideTextClass = 'govuk-accordion__section-toggle-text';
      this.upChevronIconClass = 'govuk-accordion-nav__chevron';
      this.downChevronIconClass = 'govuk-accordion-nav__chevron--down';
      this.sectionSummaryClass = 'govuk-accordion__section-summary';
      this.sectionSummaryFocusClass = 'govuk-accordion__section-summary-focus';
      this.sectionContentClass = 'govuk-accordion__section-content';
      this.$sections = void 0;
      this.$showAllButton = null;
      this.$showAllIcon = null;
      this.$showAllText = null;
      this.i18n = new I18n(this.config.i18n);
      const $sections = this.$root.querySelectorAll(`.${this.sectionClass}`);
      if (!$sections.length) {
        throw new ElementError({
          component: Accordion,
          identifier: `Sections (\`<div class="${this.sectionClass}">\`)`
        });
      }
      this.$sections = $sections;
      this.initControls();
      this.initSectionHeaders();
      this.updateShowAllButton(this.areAllSectionsOpen());
    }
    initControls() {
      this.$showAllButton = document.createElement('button');
      this.$showAllButton.setAttribute('type', 'button');
      this.$showAllButton.setAttribute('class', this.showAllClass);
      this.$showAllButton.setAttribute('aria-expanded', 'false');
      this.$showAllIcon = document.createElement('span');
      this.$showAllIcon.classList.add(this.upChevronIconClass);
      this.$showAllButton.appendChild(this.$showAllIcon);
      const $accordionControls = document.createElement('div');
      $accordionControls.setAttribute('class', this.controlsClass);
      $accordionControls.appendChild(this.$showAllButton);
      this.$root.insertBefore($accordionControls, this.$root.firstChild);
      this.$showAllText = document.createElement('span');
      this.$showAllText.classList.add(this.showAllTextClass);
      this.$showAllButton.appendChild(this.$showAllText);
      this.$showAllButton.addEventListener('click', () => this.onShowOrHideAllToggle());
      if ('onbeforematch' in document) {
        document.addEventListener('beforematch', event => this.onBeforeMatch(event));
      }
    }
    initSectionHeaders() {
      this.$sections.forEach(($section, i) => {
        const $header = $section.querySelector(`.${this.sectionHeaderClass}`);
        if (!$header) {
          throw new ElementError({
            component: Accordion,
            identifier: `Section headers (\`<div class="${this.sectionHeaderClass}">\`)`
          });
        }
        this.constructHeaderMarkup($header, i);
        this.setExpanded(this.isExpanded($section), $section);
        $header.addEventListener('click', () => this.onSectionToggle($section));
        this.setInitialState($section);
      });
    }
    constructHeaderMarkup($header, index) {
      const $span = $header.querySelector(`.${this.sectionButtonClass}`);
      const $heading = $header.querySelector(`.${this.sectionHeadingClass}`);
      const $summary = $header.querySelector(`.${this.sectionSummaryClass}`);
      if (!$heading) {
        throw new ElementError({
          component: Accordion,
          identifier: `Section heading (\`.${this.sectionHeadingClass}\`)`
        });
      }
      if (!$span) {
        throw new ElementError({
          component: Accordion,
          identifier: `Section button placeholder (\`<span class="${this.sectionButtonClass}">\`)`
        });
      }
      const $button = document.createElement('button');
      $button.setAttribute('type', 'button');
      $button.setAttribute('aria-controls', `${this.$root.id}-content-${index + 1}`);
      for (const attr of Array.from($span.attributes)) {
        if (attr.name !== 'id') {
          $button.setAttribute(attr.name, attr.value);
        }
      }
      const $headingText = document.createElement('span');
      $headingText.classList.add(this.sectionHeadingTextClass);
      $headingText.id = $span.id;
      const $headingTextFocus = document.createElement('span');
      $headingTextFocus.classList.add(this.sectionHeadingTextFocusClass);
      $headingText.appendChild($headingTextFocus);
      Array.from($span.childNodes).forEach($child => $headingTextFocus.appendChild($child));
      const $showHideToggle = document.createElement('span');
      $showHideToggle.classList.add(this.sectionShowHideToggleClass);
      $showHideToggle.setAttribute('data-nosnippet', '');
      const $showHideToggleFocus = document.createElement('span');
      $showHideToggleFocus.classList.add(this.sectionShowHideToggleFocusClass);
      $showHideToggle.appendChild($showHideToggleFocus);
      const $showHideText = document.createElement('span');
      const $showHideIcon = document.createElement('span');
      $showHideIcon.classList.add(this.upChevronIconClass);
      $showHideToggleFocus.appendChild($showHideIcon);
      $showHideText.classList.add(this.sectionShowHideTextClass);
      $showHideToggleFocus.appendChild($showHideText);
      $button.appendChild($headingText);
      $button.appendChild(this.getButtonPunctuationEl());
      if ($summary) {
        const $summarySpan = document.createElement('span');
        const $summarySpanFocus = document.createElement('span');
        $summarySpanFocus.classList.add(this.sectionSummaryFocusClass);
        $summarySpan.appendChild($summarySpanFocus);
        for (const attr of Array.from($summary.attributes)) {
          $summarySpan.setAttribute(attr.name, attr.value);
        }
        Array.from($summary.childNodes).forEach($child => $summarySpanFocus.appendChild($child));
        $summary.remove();
        $button.appendChild($summarySpan);
        $button.appendChild(this.getButtonPunctuationEl());
      }
      $button.appendChild($showHideToggle);
      $heading.removeChild($span);
      $heading.appendChild($button);
    }
    onBeforeMatch(event) {
      const $fragment = event.target;
      if (!($fragment instanceof Element)) {
        return;
      }
      const $section = $fragment.closest(`.${this.sectionClass}`);
      if ($section) {
        this.setExpanded(true, $section);
      }
    }
    onSectionToggle($section) {
      const nowExpanded = !this.isExpanded($section);
      this.setExpanded(nowExpanded, $section);
      this.storeState($section, nowExpanded);
    }
    onShowOrHideAllToggle() {
      const nowExpanded = !this.areAllSectionsOpen();
      this.$sections.forEach($section => {
        this.setExpanded(nowExpanded, $section);
        this.storeState($section, nowExpanded);
      });
      this.updateShowAllButton(nowExpanded);
    }
    setExpanded(expanded, $section) {
      const $showHideIcon = $section.querySelector(`.${this.upChevronIconClass}`);
      const $showHideText = $section.querySelector(`.${this.sectionShowHideTextClass}`);
      const $button = $section.querySelector(`.${this.sectionButtonClass}`);
      const $content = $section.querySelector(`.${this.sectionContentClass}`);
      if (!$content) {
        throw new ElementError({
          component: Accordion,
          identifier: `Section content (\`<div class="${this.sectionContentClass}">\`)`
        });
      }
      if (!$showHideIcon || !$showHideText || !$button) {
        return;
      }
      const newButtonText = expanded ? this.i18n.t('hideSection') : this.i18n.t('showSection');
      $showHideText.textContent = newButtonText;
      $button.setAttribute('aria-expanded', `${expanded}`);
      const ariaLabelParts = [];
      const $headingText = $section.querySelector(`.${this.sectionHeadingTextClass}`);
      if ($headingText) {
        ariaLabelParts.push(`${$headingText.textContent}`.trim());
      }
      const $summary = $section.querySelector(`.${this.sectionSummaryClass}`);
      if ($summary) {
        ariaLabelParts.push(`${$summary.textContent}`.trim());
      }
      const ariaLabelMessage = expanded ? this.i18n.t('hideSectionAriaLabel') : this.i18n.t('showSectionAriaLabel');
      ariaLabelParts.push(ariaLabelMessage);
      $button.setAttribute('aria-label', ariaLabelParts.join(' , '));
      if (expanded) {
        $content.removeAttribute('hidden');
        $section.classList.add(this.sectionExpandedClass);
        $showHideIcon.classList.remove(this.downChevronIconClass);
      } else {
        $content.setAttribute('hidden', 'until-found');
        $section.classList.remove(this.sectionExpandedClass);
        $showHideIcon.classList.add(this.downChevronIconClass);
      }
      this.updateShowAllButton(this.areAllSectionsOpen());
    }
    isExpanded($section) {
      return $section.classList.contains(this.sectionExpandedClass);
    }
    areAllSectionsOpen() {
      return Array.from(this.$sections).every($section => this.isExpanded($section));
    }
    updateShowAllButton(expanded) {
      if (!this.$showAllButton || !this.$showAllText || !this.$showAllIcon) {
        return;
      }
      this.$showAllButton.setAttribute('aria-expanded', expanded.toString());
      this.$showAllText.textContent = expanded ? this.i18n.t('hideAllSections') : this.i18n.t('showAllSections');
      this.$showAllIcon.classList.toggle(this.downChevronIconClass, !expanded);
    }

    /**
     * Get the identifier for a section
     *
     * We need a unique way of identifying each content in the Accordion.
     * Since an `#id` should be unique and an `id` is required for `aria-`
     * attributes `id` can be safely used.
     *
     * @param {Element} $section - Section element
     * @returns {string | undefined | null} Identifier for section
     */
    getIdentifier($section) {
      const $button = $section.querySelector(`.${this.sectionButtonClass}`);
      return $button == null ? void 0 : $button.getAttribute('aria-controls');
    }
    storeState($section, isExpanded) {
      if (!this.config.rememberExpanded) {
        return;
      }
      const id = this.getIdentifier($section);
      if (id) {
        try {
          window.sessionStorage.setItem(id, isExpanded.toString());
        } catch (exception) {}
      }
    }
    setInitialState($section) {
      if (!this.config.rememberExpanded) {
        return;
      }
      const id = this.getIdentifier($section);
      if (id) {
        try {
          const state = window.sessionStorage.getItem(id);
          if (state !== null) {
            this.setExpanded(state === 'true', $section);
          }
        } catch (exception) {}
      }
    }
    getButtonPunctuationEl() {
      const $punctuationEl = document.createElement('span');
      $punctuationEl.classList.add('govuk-visually-hidden', this.sectionHeadingDividerClass);
      $punctuationEl.textContent = ', ';
      return $punctuationEl;
    }
  }

  /**
   * Accordion config
   *
   * @see {@link Accordion.defaults}
   * @typedef {object} AccordionConfig
   * @property {AccordionTranslations} [i18n=Accordion.defaults.i18n] - Accordion translations
   * @property {boolean} [rememberExpanded] - Whether the expanded and collapsed
   *   state of each section is remembered and restored when navigating.
   */

  /**
   * Accordion translations
   *
   * @see {@link Accordion.defaults.i18n}
   * @typedef {object} AccordionTranslations
   *
   * Messages used by the component for the labels of its buttons. This includes
   * the visible text shown on screen, and text to help assistive technology users
   * for the buttons toggling each section.
   * @property {string} [hideAllSections] - The text content for the 'Hide all
   *   sections' button, used when at least one section is expanded.
   * @property {string} [hideSection] - The text content for the 'Hide'
   *   button, used when a section is expanded.
   * @property {string} [hideSectionAriaLabel] - The text content appended to the
   *   'Hide' button's accessible name when a section is expanded.
   * @property {string} [showAllSections] - The text content for the 'Show all
   *   sections' button, used when all sections are collapsed.
   * @property {string} [showSection] - The text content for the 'Show'
   *   button, used when a section is collapsed.
   * @property {string} [showSectionAriaLabel] - The text content appended to the
   *   'Show' button's accessible name when a section is expanded.
   */

  /**
   * @import { Schema } from '../../common/configuration.mjs'
   */
  Accordion.moduleName = 'govuk-accordion';
  Accordion.defaults = Object.freeze({
    i18n: {
      hideAllSections: 'Hide all sections',
      hideSection: 'Hide',
      hideSectionAriaLabel: 'Hide this section',
      showAllSections: 'Show all sections',
      showSection: 'Show',
      showSectionAriaLabel: 'Show this section'
    },
    rememberExpanded: true
  });
  Accordion.schema = Object.freeze({
    properties: {
      i18n: {
        type: 'object'
      },
      rememberExpanded: {
        type: 'boolean'
      }
    }
  });

  const DEBOUNCE_TIMEOUT_IN_SECONDS = 1;

  /**
   * JavaScript enhancements for the Button component
   *
   * @preserve
   * @augments ConfigurableComponent<ButtonConfig>
   */
  class Button extends ConfigurableComponent {
    /**
     * @param {Element | null} $root - HTML element to use for button
     * @param {ButtonConfig} [config] - Button config
     */
    constructor($root, config = {}) {
      super($root, config);
      this.debounceFormSubmitTimer = null;
      this.$root.addEventListener('keydown', event => this.handleKeyDown(event));
      this.$root.addEventListener('click', event => this.debounce(event));
    }
    handleKeyDown(event) {
      const $target = event.target;
      if (event.key !== ' ') {
        return;
      }
      if ($target instanceof HTMLElement && $target.getAttribute('role') === 'button') {
        event.preventDefault();
        $target.click();
      }
    }
    debounce(event) {
      if (!this.config.preventDoubleClick) {
        return;
      }
      if (this.debounceFormSubmitTimer) {
        event.preventDefault();
        return false;
      }
      this.debounceFormSubmitTimer = window.setTimeout(() => {
        this.debounceFormSubmitTimer = null;
      }, DEBOUNCE_TIMEOUT_IN_SECONDS * 1000);
    }
  }

  /**
   * Button config
   *
   * @typedef {object} ButtonConfig
   * @property {boolean} [preventDoubleClick=false] - Prevent accidental double
   *   clicks on submit buttons from submitting forms multiple times.
   */

  /**
   * @import { Schema } from '../../common/configuration.mjs'
   */
  Button.moduleName = 'govuk-button';
  Button.defaults = Object.freeze({
    preventDoubleClick: false
  });
  Button.schema = Object.freeze({
    properties: {
      preventDoubleClick: {
        type: 'boolean'
      }
    }
  });

  function closestAttributeValue($element, attributeName) {
    const $closestElementWithAttribute = $element.closest(`[${attributeName}]`);
    return $closestElementWithAttribute ? $closestElementWithAttribute.getAttribute(attributeName) : null;
  }

  /**
   * Character count component
   *
   * Tracks the number of characters or words in the `.govuk-js-character-count`
   * `<textarea>` inside the element. Displays a message with the remaining number
   * of characters/words available, or the number of characters/words in excess.
   *
   * You can configure the message to only appear after a certain percentage
   * of the available characters/words has been entered.
   *
   * @preserve
   * @augments ConfigurableComponent<CharacterCountConfig>
   */
  class CharacterCount extends ConfigurableComponent {
    [configOverride](datasetConfig) {
      let configOverrides = {};
      if ('maxwords' in datasetConfig || 'maxlength' in datasetConfig) {
        configOverrides = {
          maxlength: undefined,
          maxwords: undefined
        };
      }
      return configOverrides;
    }

    /**
     * @param {Element | null} $root - HTML element to use for character count
     * @param {CharacterCountConfig} [config] - Character count config
     */
    constructor($root, config = {}) {
      var _ref, _this$config$maxwords;
      super($root, config);
      this.$textarea = void 0;
      this.$visibleCountMessage = void 0;
      this.$screenReaderCountMessage = void 0;
      this.lastInputTimestamp = null;
      this.lastInputValue = '';
      this.valueChecker = null;
      this.i18n = void 0;
      this.maxLength = void 0;
      const $textarea = this.$root.querySelector('.govuk-js-character-count');
      if (!($textarea instanceof HTMLTextAreaElement || $textarea instanceof HTMLInputElement)) {
        throw new ElementError({
          component: CharacterCount,
          element: $textarea,
          expectedType: 'HTMLTextareaElement or HTMLInputElement',
          identifier: 'Form field (`.govuk-js-character-count`)'
        });
      }
      const errors = validateConfig(CharacterCount.schema, this.config);
      if (errors[0]) {
        throw new ConfigError(formatErrorMessage(CharacterCount, errors[0]));
      }
      this.i18n = new I18n(this.config.i18n, {
        locale: closestAttributeValue(this.$root, 'lang')
      });
      this.maxLength = (_ref = (_this$config$maxwords = this.config.maxwords) != null ? _this$config$maxwords : this.config.maxlength) != null ? _ref : Infinity;
      this.$textarea = $textarea;
      const textareaDescriptionId = `${this.$textarea.id}-info`;
      const $textareaDescription = document.getElementById(textareaDescriptionId);
      if (!$textareaDescription) {
        throw new ElementError({
          component: CharacterCount,
          element: $textareaDescription,
          identifier: `Count message (\`id="${textareaDescriptionId}"\`)`
        });
      }
      if (`${$textareaDescription.textContent}`.match(/^\s*$/)) {
        $textareaDescription.textContent = this.i18n.t('textareaDescription', {
          count: this.maxLength
        });
      }
      this.$textarea.insertAdjacentElement('afterend', $textareaDescription);
      const $screenReaderCountMessage = document.createElement('div');
      $screenReaderCountMessage.className = 'govuk-character-count__sr-status govuk-visually-hidden';
      $screenReaderCountMessage.setAttribute('aria-live', 'polite');
      this.$screenReaderCountMessage = $screenReaderCountMessage;
      $textareaDescription.insertAdjacentElement('afterend', $screenReaderCountMessage);
      const $visibleCountMessage = document.createElement('div');
      $visibleCountMessage.className = $textareaDescription.className;
      $visibleCountMessage.classList.add('govuk-character-count__status');
      $visibleCountMessage.setAttribute('aria-hidden', 'true');
      this.$visibleCountMessage = $visibleCountMessage;
      $textareaDescription.insertAdjacentElement('afterend', $visibleCountMessage);
      $textareaDescription.classList.add('govuk-visually-hidden');
      this.$textarea.removeAttribute('maxlength');
      this.bindChangeEvents();
      window.addEventListener('pageshow', () => this.updateCountMessage());
      this.updateCountMessage();
    }
    bindChangeEvents() {
      this.$textarea.addEventListener('keyup', () => this.handleKeyUp());
      this.$textarea.addEventListener('focus', () => this.handleFocus());
      this.$textarea.addEventListener('blur', () => this.handleBlur());
    }
    handleKeyUp() {
      this.updateVisibleCountMessage();
      this.lastInputTimestamp = Date.now();
    }
    handleFocus() {
      this.valueChecker = window.setInterval(() => {
        if (!this.lastInputTimestamp || Date.now() - 500 >= this.lastInputTimestamp) {
          this.updateIfValueChanged();
        }
      }, 1000);
    }
    handleBlur() {
      if (this.valueChecker) {
        window.clearInterval(this.valueChecker);
      }
    }
    updateIfValueChanged() {
      if (this.$textarea.value !== this.lastInputValue) {
        this.lastInputValue = this.$textarea.value;
        this.updateCountMessage();
      }
    }
    updateCountMessage() {
      this.updateVisibleCountMessage();
      this.updateScreenReaderCountMessage();
    }
    updateVisibleCountMessage() {
      const remainingNumber = this.maxLength - this.count(this.$textarea.value);
      const isError = remainingNumber < 0;
      this.$visibleCountMessage.classList.toggle('govuk-character-count__message--disabled', !this.isOverThreshold());
      this.$textarea.classList.toggle('govuk-textarea--error', isError);
      this.$visibleCountMessage.classList.toggle('govuk-error-message', isError);
      this.$visibleCountMessage.classList.toggle('govuk-hint', !isError);
      this.$visibleCountMessage.textContent = this.getCountMessage();
    }
    updateScreenReaderCountMessage() {
      if (this.isOverThreshold()) {
        this.$screenReaderCountMessage.removeAttribute('aria-hidden');
      } else {
        this.$screenReaderCountMessage.setAttribute('aria-hidden', 'true');
      }
      this.$screenReaderCountMessage.textContent = this.getCountMessage();
    }
    count(text) {
      if (this.config.maxwords) {
        var _text$match;
        const tokens = (_text$match = text.match(/\S+/g)) != null ? _text$match : [];
        return tokens.length;
      }
      return text.length;
    }
    getCountMessage() {
      const remainingNumber = this.maxLength - this.count(this.$textarea.value);
      const countType = this.config.maxwords ? 'words' : 'characters';
      return this.formatCountMessage(remainingNumber, countType);
    }
    formatCountMessage(remainingNumber, countType) {
      if (remainingNumber === 0) {
        return this.i18n.t(`${countType}AtLimit`);
      }
      const translationKeySuffix = remainingNumber < 0 ? 'OverLimit' : 'UnderLimit';
      return this.i18n.t(`${countType}${translationKeySuffix}`, {
        count: Math.abs(remainingNumber)
      });
    }
    isOverThreshold() {
      if (!this.config.threshold) {
        return true;
      }
      const currentLength = this.count(this.$textarea.value);
      const maxLength = this.maxLength;
      const thresholdValue = maxLength * this.config.threshold / 100;
      return thresholdValue <= currentLength;
    }
  }

  /**
   * Character count config
   *
   * @see {@link CharacterCount.defaults}
   * @typedef {object} CharacterCountConfig
   * @property {number} [maxlength] - The maximum number of characters.
   *   If maxwords is provided, the maxlength option will be ignored.
   * @property {number} [maxwords] - The maximum number of words. If maxwords is
   *   provided, the maxlength option will be ignored.
   * @property {number} [threshold=0] - The percentage value of the limit at
   *   which point the count message is displayed. If this attribute is set, the
   *   count message will be hidden by default.
   * @property {CharacterCountTranslations} [i18n=CharacterCount.defaults.i18n] - Character count translations
   */

  /**
   * Character count translations
   *
   * @see {@link CharacterCount.defaults.i18n}
   * @typedef {object} CharacterCountTranslations
   *
   * Messages shown to users as they type. It provides feedback on how many words
   * or characters they have remaining or if they are over the limit. This also
   * includes a message used as an accessible description for the textarea.
   * @property {TranslationPluralForms} [charactersUnderLimit] - Message displayed
   *   when the number of characters is under the configured maximum, `maxlength`.
   *   This message is displayed visually and through assistive technologies. The
   *   component will replace the `%{count}` placeholder with the number of
   *   remaining characters. This is a [pluralised list of
   *   messages](https://frontend.design-system.service.gov.uk/localise-govuk-frontend).
   * @property {string} [charactersAtLimit] - Message displayed when the number of
   *   characters reaches the configured maximum, `maxlength`. This message is
   *   displayed visually and through assistive technologies.
   * @property {TranslationPluralForms} [charactersOverLimit] - Message displayed
   *   when the number of characters is over the configured maximum, `maxlength`.
   *   This message is displayed visually and through assistive technologies. The
   *   component will replace the `%{count}` placeholder with the number of
   *   remaining characters. This is a [pluralised list of
   *   messages](https://frontend.design-system.service.gov.uk/localise-govuk-frontend).
   * @property {TranslationPluralForms} [wordsUnderLimit] - Message displayed when
   *   the number of words is under the configured maximum, `maxlength`. This
   *   message is displayed visually and through assistive technologies. The
   *   component will replace the `%{count}` placeholder with the number of
   *   remaining words. This is a [pluralised list of
   *   messages](https://frontend.design-system.service.gov.uk/localise-govuk-frontend).
   * @property {string} [wordsAtLimit] - Message displayed when the number of
   *   words reaches the configured maximum, `maxlength`. This message is
   *   displayed visually and through assistive technologies.
   * @property {TranslationPluralForms} [wordsOverLimit] - Message displayed when
   *   the number of words is over the configured maximum, `maxlength`. This
   *   message is displayed visually and through assistive technologies. The
   *   component will replace the `%{count}` placeholder with the number of
   *   remaining words. This is a [pluralised list of
   *   messages](https://frontend.design-system.service.gov.uk/localise-govuk-frontend).
   * @property {TranslationPluralForms} [textareaDescription] - Message made
   *   available to assistive technologies, if none is already present in the
   *   HTML, to describe that the component accepts only a limited amount of
   *   content. It is visible on the page when JavaScript is unavailable. The
   *   component will replace the `%{count}` placeholder with the value of the
   *   `maxlength` or `maxwords` parameter.
   */

  /**
   * @import { Schema } from '../../common/configuration.mjs'
   * @import { TranslationPluralForms } from '../../i18n.mjs'
   */
  CharacterCount.moduleName = 'govuk-character-count';
  CharacterCount.defaults = Object.freeze({
    threshold: 0,
    i18n: {
      charactersUnderLimit: {
        one: 'You have %{count} character remaining',
        other: 'You have %{count} characters remaining'
      },
      charactersAtLimit: 'You have 0 characters remaining',
      charactersOverLimit: {
        one: 'You have %{count} character too many',
        other: 'You have %{count} characters too many'
      },
      wordsUnderLimit: {
        one: 'You have %{count} word remaining',
        other: 'You have %{count} words remaining'
      },
      wordsAtLimit: 'You have 0 words remaining',
      wordsOverLimit: {
        one: 'You have %{count} word too many',
        other: 'You have %{count} words too many'
      },
      textareaDescription: {
        other: ''
      }
    }
  });
  CharacterCount.schema = Object.freeze({
    properties: {
      i18n: {
        type: 'object'
      },
      maxwords: {
        type: 'number'
      },
      maxlength: {
        type: 'number'
      },
      threshold: {
        type: 'number'
      }
    },
    anyOf: [{
      required: ['maxwords'],
      errorMessage: 'Either "maxlength" or "maxwords" must be provided'
    }, {
      required: ['maxlength'],
      errorMessage: 'Either "maxlength" or "maxwords" must be provided'
    }]
  });

  /**
   * Checkboxes component
   *
   * @preserve
   */
  class Checkboxes extends Component {
    /**
     * Checkboxes can be associated with a 'conditionally revealed' content block
     * – for example, a checkbox for 'Phone' could reveal an additional form field
     * for the user to enter their phone number.
     *
     * These associations are made using a `data-aria-controls` attribute, which
     * is promoted to an aria-controls attribute during initialisation.
     *
     * We also need to restore the state of any conditional reveals on the page
     * (for example if the user has navigated back), and set up event handlers to
     * keep the reveal in sync with the checkbox state.
     *
     * @param {Element | null} $root - HTML element to use for checkboxes
     */
    constructor($root) {
      super($root);
      this.$inputs = void 0;
      const $inputs = this.$root.querySelectorAll('input[type="checkbox"]');
      if (!$inputs.length) {
        throw new ElementError({
          component: Checkboxes,
          identifier: 'Form inputs (`<input type="checkbox">`)'
        });
      }
      this.$inputs = $inputs;
      this.$inputs.forEach($input => {
        const targetId = $input.getAttribute('data-aria-controls');
        if (!targetId) {
          return;
        }
        if (!document.getElementById(targetId)) {
          throw new ElementError({
            component: Checkboxes,
            identifier: `Conditional reveal (\`id="${targetId}"\`)`
          });
        }
        $input.setAttribute('aria-controls', targetId);
        $input.removeAttribute('data-aria-controls');
      });
      window.addEventListener('pageshow', () => this.syncAllConditionalReveals());
      this.syncAllConditionalReveals();
      this.$root.addEventListener('click', event => this.handleClick(event));
    }
    syncAllConditionalReveals() {
      this.$inputs.forEach($input => this.syncConditionalRevealWithInputState($input));
    }
    syncConditionalRevealWithInputState($input) {
      const targetId = $input.getAttribute('aria-controls');
      if (!targetId) {
        return;
      }
      const $target = document.getElementById(targetId);
      if ($target != null && $target.classList.contains('govuk-checkboxes__conditional')) {
        const inputIsChecked = $input.checked;
        $input.setAttribute('aria-expanded', inputIsChecked.toString());
        $target.classList.toggle('govuk-checkboxes__conditional--hidden', !inputIsChecked);
      }
    }
    unCheckAllInputsExcept($input) {
      const allInputsWithSameName = document.querySelectorAll(`input[type="checkbox"][name="${$input.name}"]`);
      allInputsWithSameName.forEach($inputWithSameName => {
        const hasSameFormOwner = $input.form === $inputWithSameName.form;
        if (hasSameFormOwner && $inputWithSameName !== $input) {
          $inputWithSameName.checked = false;
          this.syncConditionalRevealWithInputState($inputWithSameName);
        }
      });
    }
    unCheckExclusiveInputs($input) {
      const allInputsWithSameNameAndExclusiveBehaviour = document.querySelectorAll(`input[data-behaviour="exclusive"][type="checkbox"][name="${$input.name}"]`);
      allInputsWithSameNameAndExclusiveBehaviour.forEach($exclusiveInput => {
        const hasSameFormOwner = $input.form === $exclusiveInput.form;
        if (hasSameFormOwner) {
          $exclusiveInput.checked = false;
          this.syncConditionalRevealWithInputState($exclusiveInput);
        }
      });
    }
    handleClick(event) {
      const $clickedInput = event.target;
      if (!($clickedInput instanceof HTMLInputElement) || $clickedInput.type !== 'checkbox') {
        return;
      }
      const hasAriaControls = $clickedInput.getAttribute('aria-controls');
      if (hasAriaControls) {
        this.syncConditionalRevealWithInputState($clickedInput);
      }
      if (!$clickedInput.checked) {
        return;
      }
      const hasBehaviourExclusive = $clickedInput.getAttribute('data-behaviour') === 'exclusive';
      if (hasBehaviourExclusive) {
        this.unCheckAllInputsExcept($clickedInput);
      } else {
        this.unCheckExclusiveInputs($clickedInput);
      }
    }
  }
  Checkboxes.moduleName = 'govuk-checkboxes';

  /**
   * Error summary component
   *
   * Takes focus on initialisation for accessible announcement, unless disabled in
   * configuration.
   *
   * @preserve
   * @augments ConfigurableComponent<ErrorSummaryConfig>
   */
  class ErrorSummary extends ConfigurableComponent {
    /**
     * @param {Element | null} $root - HTML element to use for error summary
     * @param {ErrorSummaryConfig} [config] - Error summary config
     */
    constructor($root, config = {}) {
      super($root, config);
      if (!this.config.disableAutoFocus) {
        setFocus(this.$root);
      }
      this.$root.addEventListener('click', event => this.handleClick(event));
    }
    handleClick(event) {
      const $target = event.target;
      if ($target && this.focusTarget($target)) {
        event.preventDefault();
      }
    }
    focusTarget($target) {
      if (!($target instanceof HTMLAnchorElement)) {
        return false;
      }
      const inputId = getFragmentFromUrl($target.href);
      if (!inputId) {
        return false;
      }
      const $input = document.getElementById(inputId);
      if (!$input) {
        return false;
      }
      const $legendOrLabel = this.getAssociatedLegendOrLabel($input);
      if (!$legendOrLabel) {
        return false;
      }
      $legendOrLabel.scrollIntoView();
      $input.focus({
        preventScroll: true
      });
      return true;
    }
    getAssociatedLegendOrLabel($input) {
      var _document$querySelect;
      const $fieldset = $input.closest('fieldset');
      if ($fieldset) {
        const $legends = $fieldset.getElementsByTagName('legend');
        if ($legends.length) {
          const $candidateLegend = $legends[0];
          if ($input instanceof HTMLInputElement && ($input.type === 'checkbox' || $input.type === 'radio')) {
            return $candidateLegend;
          }
          const legendTop = $candidateLegend.getBoundingClientRect().top;
          const inputRect = $input.getBoundingClientRect();
          if (inputRect.height && window.innerHeight) {
            const inputBottom = inputRect.top + inputRect.height;
            if (inputBottom - legendTop < window.innerHeight / 2) {
              return $candidateLegend;
            }
          }
        }
      }
      return (_document$querySelect = document.querySelector(`label[for='${$input.getAttribute('id')}']`)) != null ? _document$querySelect : $input.closest('label');
    }
  }

  /**
   * Error summary config
   *
   * @typedef {object} ErrorSummaryConfig
   * @property {boolean} [disableAutoFocus=false] - If set to `true` the error
   *   summary will not be focussed when the page loads.
   */

  /**
   * @import { Schema } from '../../common/configuration.mjs'
   */
  ErrorSummary.moduleName = 'govuk-error-summary';
  ErrorSummary.defaults = Object.freeze({
    disableAutoFocus: false
  });
  ErrorSummary.schema = Object.freeze({
    properties: {
      disableAutoFocus: {
        type: 'boolean'
      }
    }
  });

  /**
   * Exit this page component
   *
   * @preserve
   * @augments ConfigurableComponent<ExitThisPageConfig>
   */
  class ExitThisPage extends ConfigurableComponent {
    /**
     * @param {Element | null} $root - HTML element that wraps the Exit This Page button
     * @param {ExitThisPageConfig} [config] - Exit This Page config
     */
    constructor($root, config = {}) {
      super($root, config);
      this.i18n = void 0;
      this.$button = void 0;
      this.$skiplinkButton = null;
      this.$updateSpan = null;
      this.$indicatorContainer = null;
      this.$overlay = null;
      this.keypressCounter = 0;
      this.lastKeyWasModified = false;
      this.timeoutTime = 5000;
      this.keypressTimeoutId = null;
      this.timeoutMessageId = null;
      const $button = this.$root.querySelector('.govuk-exit-this-page__button');
      if (!($button instanceof HTMLAnchorElement)) {
        throw new ElementError({
          component: ExitThisPage,
          element: $button,
          expectedType: 'HTMLAnchorElement',
          identifier: 'Button (`.govuk-exit-this-page__button`)'
        });
      }
      this.i18n = new I18n(this.config.i18n);
      this.$button = $button;
      const $skiplinkButton = document.querySelector('.govuk-js-exit-this-page-skiplink');
      if ($skiplinkButton instanceof HTMLAnchorElement) {
        this.$skiplinkButton = $skiplinkButton;
      }
      this.buildIndicator();
      this.initUpdateSpan();
      this.initButtonClickHandler();
      if (!('govukFrontendExitThisPageKeypress' in document.body.dataset)) {
        document.addEventListener('keyup', this.handleKeypress.bind(this), true);
        document.body.dataset.govukFrontendExitThisPageKeypress = 'true';
      }
      window.addEventListener('pageshow', this.resetPage.bind(this));
    }
    initUpdateSpan() {
      this.$updateSpan = document.createElement('span');
      this.$updateSpan.setAttribute('role', 'status');
      this.$updateSpan.className = 'govuk-visually-hidden';
      this.$root.appendChild(this.$updateSpan);
    }
    initButtonClickHandler() {
      this.$button.addEventListener('click', this.handleClick.bind(this));
      if (this.$skiplinkButton) {
        this.$skiplinkButton.addEventListener('click', this.handleClick.bind(this));
      }
    }
    buildIndicator() {
      this.$indicatorContainer = document.createElement('div');
      this.$indicatorContainer.className = 'govuk-exit-this-page__indicator';
      this.$indicatorContainer.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < 3; i++) {
        const $indicator = document.createElement('div');
        $indicator.className = 'govuk-exit-this-page__indicator-light';
        this.$indicatorContainer.appendChild($indicator);
      }
      this.$button.appendChild(this.$indicatorContainer);
    }
    updateIndicator() {
      if (!this.$indicatorContainer) {
        return;
      }
      this.$indicatorContainer.classList.toggle('govuk-exit-this-page__indicator--visible', this.keypressCounter > 0);
      const $indicators = this.$indicatorContainer.querySelectorAll('.govuk-exit-this-page__indicator-light');
      $indicators.forEach(($indicator, index) => {
        $indicator.classList.toggle('govuk-exit-this-page__indicator-light--on', index < this.keypressCounter);
      });
    }
    exitPage() {
      if (!this.$updateSpan) {
        return;
      }
      this.$updateSpan.textContent = '';
      document.body.classList.add('govuk-exit-this-page-hide-content');
      this.$overlay = document.createElement('div');
      this.$overlay.className = 'govuk-exit-this-page-overlay';
      this.$overlay.setAttribute('role', 'alert');
      document.body.appendChild(this.$overlay);
      this.$overlay.textContent = this.i18n.t('activated');
      window.location.href = this.$button.href;
    }
    handleClick(event) {
      event.preventDefault();
      this.exitPage();
    }
    handleKeypress(event) {
      if (!this.$updateSpan) {
        return;
      }
      if (event.key === 'Shift' && !this.lastKeyWasModified) {
        this.keypressCounter += 1;
        this.updateIndicator();
        if (this.timeoutMessageId) {
          window.clearTimeout(this.timeoutMessageId);
          this.timeoutMessageId = null;
        }
        if (this.keypressCounter >= 3) {
          this.keypressCounter = 0;
          if (this.keypressTimeoutId) {
            window.clearTimeout(this.keypressTimeoutId);
            this.keypressTimeoutId = null;
          }
          this.exitPage();
        } else {
          if (this.keypressCounter === 1) {
            this.$updateSpan.textContent = this.i18n.t('pressTwoMoreTimes');
          } else {
            this.$updateSpan.textContent = this.i18n.t('pressOneMoreTime');
          }
        }
        this.setKeypressTimer();
      } else if (this.keypressTimeoutId) {
        this.resetKeypressTimer();
      }
      this.lastKeyWasModified = event.shiftKey;
    }
    setKeypressTimer() {
      if (this.keypressTimeoutId) {
        window.clearTimeout(this.keypressTimeoutId);
      }
      this.keypressTimeoutId = window.setTimeout(this.resetKeypressTimer.bind(this), this.timeoutTime);
    }
    resetKeypressTimer() {
      if (!this.$updateSpan) {
        return;
      }
      if (this.keypressTimeoutId) {
        window.clearTimeout(this.keypressTimeoutId);
        this.keypressTimeoutId = null;
      }
      const $updateSpan = this.$updateSpan;
      this.keypressCounter = 0;
      $updateSpan.textContent = this.i18n.t('timedOut');
      this.timeoutMessageId = window.setTimeout(() => {
        $updateSpan.textContent = '';
      }, this.timeoutTime);
      this.updateIndicator();
    }
    resetPage() {
      document.body.classList.remove('govuk-exit-this-page-hide-content');
      if (this.$overlay) {
        this.$overlay.remove();
        this.$overlay = null;
      }
      if (this.$updateSpan) {
        this.$updateSpan.setAttribute('role', 'status');
        this.$updateSpan.textContent = '';
      }
      this.updateIndicator();
      if (this.keypressTimeoutId) {
        window.clearTimeout(this.keypressTimeoutId);
      }
      if (this.timeoutMessageId) {
        window.clearTimeout(this.timeoutMessageId);
      }
    }
  }

  /**
   * Exit this Page config
   *
   * @see {@link ExitThisPage.defaults}
   * @typedef {object} ExitThisPageConfig
   * @property {ExitThisPageTranslations} [i18n=ExitThisPage.defaults.i18n] - Exit this page translations
   */

  /**
   * Exit this Page translations
   *
   * @see {@link ExitThisPage.defaults.i18n}
   * @typedef {object} ExitThisPageTranslations
   *
   * Messages used by the component programatically inserted text, including
   * overlay text and screen reader announcements.
   * @property {string} [activated] - Screen reader announcement for when EtP
   *   keypress functionality has been successfully activated.
   * @property {string} [timedOut] - Screen reader announcement for when the EtP
   *   keypress functionality has timed out.
   * @property {string} [pressTwoMoreTimes] - Screen reader announcement informing
   *   the user they must press the activation key two more times.
   * @property {string} [pressOneMoreTime] - Screen reader announcement informing
   *   the user they must press the activation key one more time.
   */

  /**
   * @import { Schema } from '../../common/configuration.mjs'
   */
  ExitThisPage.moduleName = 'govuk-exit-this-page';
  ExitThisPage.defaults = Object.freeze({
    i18n: {
      activated: 'Loading.',
      timedOut: 'Exit this page expired.',
      pressTwoMoreTimes: 'Shift, press 2 more times to exit.',
      pressOneMoreTime: 'Shift, press 1 more time to exit.'
    }
  });
  ExitThisPage.schema = Object.freeze({
    properties: {
      i18n: {
        type: 'object'
      }
    }
  });

  /**
   * File upload component
   *
   * @preserve
   * @augments ConfigurableComponent<FileUploadConfig>
   */
  class FileUpload extends ConfigurableComponent {
    /**
     * @param {Element | null} $root - File input element
     * @param {FileUploadConfig} [config] - File Upload config
     */
    constructor($root, config = {}) {
      super($root, config);
      this.$input = void 0;
      this.$button = void 0;
      this.$status = void 0;
      this.i18n = void 0;
      this.id = void 0;
      const $input = this.$root.querySelector('input');
      if ($input === null) {
        throw new ElementError({
          component: FileUpload,
          identifier: 'File inputs (`<input type="file">`)'
        });
      }
      if ($input.type !== 'file') {
        throw new ElementError(formatErrorMessage(FileUpload, 'File input (`<input type="file">`) attribute (`type`) is not `file`'));
      }
      this.$input = $input;
      this.$input.setAttribute('hidden', 'true');
      if (!this.$input.id) {
        throw new ElementError({
          component: FileUpload,
          identifier: 'File input (`<input type="file">`) attribute (`id`)'
        });
      }
      this.id = this.$input.id;
      this.i18n = new I18n(this.config.i18n, {
        locale: closestAttributeValue(this.$root, 'lang')
      });
      const $label = this.findLabel();
      if (!$label.id) {
        $label.id = `${this.id}-label`;
      }
      this.$input.id = `${this.id}-input`;
      const $button = document.createElement('button');
      $button.classList.add('govuk-file-upload-button');
      $button.type = 'button';
      $button.id = this.id;
      $button.classList.add('govuk-file-upload-button--empty');
      const ariaDescribedBy = this.$input.getAttribute('aria-describedby');
      if (ariaDescribedBy) {
        $button.setAttribute('aria-describedby', ariaDescribedBy);
      }
      const $status = document.createElement('span');
      $status.className = 'govuk-body govuk-file-upload-button__status';
      $status.setAttribute('aria-live', 'polite');
      $status.innerText = this.i18n.t('noFileChosen');
      $button.appendChild($status);
      const commaSpan = document.createElement('span');
      commaSpan.className = 'govuk-visually-hidden';
      commaSpan.innerText = ', ';
      commaSpan.id = `${this.id}-comma`;
      $button.appendChild(commaSpan);
      const containerSpan = document.createElement('span');
      containerSpan.className = 'govuk-file-upload-button__pseudo-button-container';
      const buttonSpan = document.createElement('span');
      buttonSpan.className = 'govuk-button govuk-button--secondary govuk-file-upload-button__pseudo-button';
      buttonSpan.innerText = this.i18n.t('chooseFilesButton');
      containerSpan.appendChild(buttonSpan);
      containerSpan.insertAdjacentText('beforeend', ' ');
      const instructionSpan = document.createElement('span');
      instructionSpan.className = 'govuk-body govuk-file-upload-button__instruction';
      instructionSpan.innerText = this.i18n.t('dropInstruction');
      containerSpan.appendChild(instructionSpan);
      $button.appendChild(containerSpan);
      $button.setAttribute('aria-labelledby', `${$label.id} ${commaSpan.id} ${$button.id}`);
      $button.addEventListener('click', this.onClick.bind(this));
      $button.addEventListener('dragover', event => {
        event.preventDefault();
      });
      this.$root.insertAdjacentElement('afterbegin', $button);
      this.$input.setAttribute('tabindex', '-1');
      this.$input.setAttribute('aria-hidden', 'true');
      this.$button = $button;
      this.$status = $status;
      this.$input.addEventListener('change', this.onChange.bind(this));
      this.updateDisabledState();
      this.observeDisabledState();
      this.$announcements = document.createElement('span');
      this.$announcements.classList.add('govuk-file-upload-announcements');
      this.$announcements.classList.add('govuk-visually-hidden');
      this.$announcements.setAttribute('aria-live', 'assertive');
      this.$root.insertAdjacentElement('afterend', this.$announcements);
      this.$button.addEventListener('drop', this.onDrop.bind(this));
      document.addEventListener('dragenter', this.updateDropzoneVisibility.bind(this));
      document.addEventListener('dragenter', () => {
        this.enteredAnotherElement = true;
      });
      document.addEventListener('dragleave', () => {
        if (!this.enteredAnotherElement && !this.$button.disabled) {
          this.hideDraggingState();
          this.$announcements.innerText = this.i18n.t('leftDropZone');
        }
        this.enteredAnotherElement = false;
      });
    }

    /**
     * Updates the visibility of the dropzone as users enters the various elements on the page
     *
     * @param {DragEvent} event - The `dragenter` event
     */
    updateDropzoneVisibility(event) {
      if (this.$button.disabled) return;
      if (event.target instanceof Node) {
        if (this.$root.contains(event.target)) {
          if (event.dataTransfer && isContainingFiles(event.dataTransfer)) {
            if (!this.$button.classList.contains('govuk-file-upload-button--dragging')) {
              this.showDraggingState();
              this.$announcements.innerText = this.i18n.t('enteredDropZone');
            }
          }
        } else {
          if (this.$button.classList.contains('govuk-file-upload-button--dragging')) {
            this.hideDraggingState();
            this.$announcements.innerText = this.i18n.t('leftDropZone');
          }
        }
      }
    }
    showDraggingState() {
      this.$button.classList.add('govuk-file-upload-button--dragging');
    }
    hideDraggingState() {
      this.$button.classList.remove('govuk-file-upload-button--dragging');
    }

    /**
     * Handles user dropping on the component
     *
     * @param {DragEvent} event - The `dragenter` event
     */
    onDrop(event) {
      event.preventDefault();
      if (event.dataTransfer && isContainingFiles(event.dataTransfer)) {
        this.$input.files = event.dataTransfer.files;
        this.$input.dispatchEvent(new CustomEvent('change'));
        this.hideDraggingState();
      }
    }
    onChange() {
      const fileCount = this.$input.files.length;
      if (fileCount === 0) {
        this.$status.innerText = this.i18n.t('noFileChosen');
        this.$button.classList.add('govuk-file-upload-button--empty');
      } else {
        if (fileCount === 1) {
          this.$status.innerText = this.$input.files[0].name;
        } else {
          this.$status.innerText = this.i18n.t('multipleFilesChosen', {
            count: fileCount
          });
        }
        this.$button.classList.remove('govuk-file-upload-button--empty');
      }
    }
    findLabel() {
      const $label = document.querySelector(`label[for="${this.$input.id}"]`);
      if (!$label) {
        throw new ElementError({
          component: FileUpload,
          identifier: `Field label (\`<label for=${this.$input.id}>\`)`
        });
      }
      return $label;
    }
    onClick() {
      this.$input.click();
    }
    observeDisabledState() {
      const observer = new MutationObserver(mutationList => {
        for (const mutation of mutationList) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'disabled') {
            this.updateDisabledState();
          }
        }
      });
      observer.observe(this.$input, {
        attributes: true
      });
    }
    updateDisabledState() {
      this.$button.disabled = this.$input.disabled;
      this.$root.classList.toggle('govuk-drop-zone--disabled', this.$button.disabled);
    }
  }
  FileUpload.moduleName = 'govuk-file-upload';
  FileUpload.defaults = Object.freeze({
    i18n: {
      chooseFilesButton: 'Choose file',
      dropInstruction: 'or drop file',
      noFileChosen: 'No file chosen',
      multipleFilesChosen: {
        one: '%{count} file chosen',
        other: '%{count} files chosen'
      },
      enteredDropZone: 'Entered drop zone',
      leftDropZone: 'Left drop zone'
    }
  });
  FileUpload.schema = Object.freeze({
    properties: {
      i18n: {
        type: 'object'
      }
    }
  });
  function isContainingFiles(dataTransfer) {
    const hasNoTypesInfo = dataTransfer.types.length === 0;
    const isDraggingFiles = dataTransfer.types.some(type => type === 'Files');
    return hasNoTypesInfo || isDraggingFiles;
  }

  /**
   * Header component
   *
   * @preserve
   */
  class Header extends Component {
    /**
     * Apply a matchMedia for desktop which will trigger a state sync if the
     * browser viewport moves between states.
     *
     * @param {Element | null} $root - HTML element to use for header
     */
    constructor($root) {
      super($root);
      this.$menuButton = void 0;
      this.$menu = void 0;
      this.menuIsOpen = false;
      this.mql = null;
      const $menuButton = this.$root.querySelector('.govuk-js-header-toggle');
      if (!$menuButton) {
        return this;
      }
      const menuId = $menuButton.getAttribute('aria-controls');
      if (!menuId) {
        throw new ElementError({
          component: Header,
          identifier: 'Navigation button (`<button class="govuk-js-header-toggle">`) attribute (`aria-controls`)'
        });
      }
      const $menu = document.getElementById(menuId);
      if (!$menu) {
        throw new ElementError({
          component: Header,
          element: $menu,
          identifier: `Navigation (\`<ul id="${menuId}">\`)`
        });
      }
      this.$menu = $menu;
      this.$menuButton = $menuButton;
      this.setupResponsiveChecks();
      this.$menuButton.addEventListener('click', () => this.handleMenuButtonClick());
    }
    setupResponsiveChecks() {
      const breakpoint = getBreakpoint('desktop');
      if (!breakpoint.value) {
        throw new ElementError({
          component: Header,
          identifier: `CSS custom property (\`${breakpoint.property}\`) on pseudo-class \`:root\``
        });
      }
      this.mql = window.matchMedia(`(min-width: ${breakpoint.value})`);
      if ('addEventListener' in this.mql) {
        this.mql.addEventListener('change', () => this.checkMode());
      } else {
        this.mql.addListener(() => this.checkMode());
      }
      this.checkMode();
    }
    checkMode() {
      if (!this.mql || !this.$menu || !this.$menuButton) {
        return;
      }
      if (this.mql.matches) {
        this.$menu.removeAttribute('hidden');
        this.$menuButton.setAttribute('hidden', '');
      } else {
        this.$menuButton.removeAttribute('hidden');
        this.$menuButton.setAttribute('aria-expanded', this.menuIsOpen.toString());
        if (this.menuIsOpen) {
          this.$menu.removeAttribute('hidden');
        } else {
          this.$menu.setAttribute('hidden', '');
        }
      }
    }
    handleMenuButtonClick() {
      this.menuIsOpen = !this.menuIsOpen;
      this.checkMode();
    }
  }
  Header.moduleName = 'govuk-header';

  /**
   * Notification Banner component
   *
   * @preserve
   * @augments ConfigurableComponent<NotificationBannerConfig>
   */
  class NotificationBanner extends ConfigurableComponent {
    /**
     * @param {Element | null} $root - HTML element to use for notification banner
     * @param {NotificationBannerConfig} [config] - Notification banner config
     */
    constructor($root, config = {}) {
      super($root, config);
      if (this.$root.getAttribute('role') === 'alert' && !this.config.disableAutoFocus) {
        setFocus(this.$root);
      }
    }
  }

  /**
   * Notification banner config
   *
   * @typedef {object} NotificationBannerConfig
   * @property {boolean} [disableAutoFocus=false] - If set to `true` the
   *   notification banner will not be focussed when the page loads. This only
   *   applies if the component has a `role` of `alert` – in other cases the
   *   component will not be focused on page load, regardless of this option.
   */

  /**
   * @import { Schema } from '../../common/configuration.mjs'
   */
  NotificationBanner.moduleName = 'govuk-notification-banner';
  NotificationBanner.defaults = Object.freeze({
    disableAutoFocus: false
  });
  NotificationBanner.schema = Object.freeze({
    properties: {
      disableAutoFocus: {
        type: 'boolean'
      }
    }
  });

  /**
   * Password input component
   *
   * @preserve
   * @augments ConfigurableComponent<PasswordInputConfig>
   */
  class PasswordInput extends ConfigurableComponent {
    /**
     * @param {Element | null} $root - HTML element to use for password input
     * @param {PasswordInputConfig} [config] - Password input config
     */
    constructor($root, config = {}) {
      super($root, config);
      this.i18n = void 0;
      this.$input = void 0;
      this.$showHideButton = void 0;
      this.$screenReaderStatusMessage = void 0;
      const $input = this.$root.querySelector('.govuk-js-password-input-input');
      if (!($input instanceof HTMLInputElement)) {
        throw new ElementError({
          component: PasswordInput,
          element: $input,
          expectedType: 'HTMLInputElement',
          identifier: 'Form field (`.govuk-js-password-input-input`)'
        });
      }
      if ($input.type !== 'password') {
        throw new ElementError('Password input: Form field (`.govuk-js-password-input-input`) must be of type `password`.');
      }
      const $showHideButton = this.$root.querySelector('.govuk-js-password-input-toggle');
      if (!($showHideButton instanceof HTMLButtonElement)) {
        throw new ElementError({
          component: PasswordInput,
          element: $showHideButton,
          expectedType: 'HTMLButtonElement',
          identifier: 'Button (`.govuk-js-password-input-toggle`)'
        });
      }
      if ($showHideButton.type !== 'button') {
        throw new ElementError('Password input: Button (`.govuk-js-password-input-toggle`) must be of type `button`.');
      }
      this.$input = $input;
      this.$showHideButton = $showHideButton;
      this.i18n = new I18n(this.config.i18n, {
        locale: closestAttributeValue(this.$root, 'lang')
      });
      this.$showHideButton.removeAttribute('hidden');
      const $screenReaderStatusMessage = document.createElement('div');
      $screenReaderStatusMessage.className = 'govuk-password-input__sr-status govuk-visually-hidden';
      $screenReaderStatusMessage.setAttribute('aria-live', 'polite');
      this.$screenReaderStatusMessage = $screenReaderStatusMessage;
      this.$input.insertAdjacentElement('afterend', $screenReaderStatusMessage);
      this.$showHideButton.addEventListener('click', this.toggle.bind(this));
      if (this.$input.form) {
        this.$input.form.addEventListener('submit', () => this.hide());
      }
      window.addEventListener('pageshow', event => {
        if (event.persisted && this.$input.type !== 'password') {
          this.hide();
        }
      });
      this.hide();
    }
    toggle(event) {
      event.preventDefault();
      if (this.$input.type === 'password') {
        this.show();
        return;
      }
      this.hide();
    }
    show() {
      this.setType('text');
    }
    hide() {
      this.setType('password');
    }
    setType(type) {
      if (type === this.$input.type) {
        return;
      }
      this.$input.setAttribute('type', type);
      const isHidden = type === 'password';
      const prefixButton = isHidden ? 'show' : 'hide';
      const prefixStatus = isHidden ? 'passwordHidden' : 'passwordShown';
      this.$showHideButton.innerText = this.i18n.t(`${prefixButton}Password`);
      this.$showHideButton.setAttribute('aria-label', this.i18n.t(`${prefixButton}PasswordAriaLabel`));
      this.$screenReaderStatusMessage.innerText = this.i18n.t(`${prefixStatus}Announcement`);
    }
  }

  /**
   * Password input config
   *
   * @typedef {object} PasswordInputConfig
   * @property {PasswordInputTranslations} [i18n=PasswordInput.defaults.i18n] - Password input translations
   */

  /**
   * Password input translations
   *
   * @see {@link PasswordInput.defaults.i18n}
   * @typedef {object} PasswordInputTranslations
   *
   * Messages displayed to the user indicating the state of the show/hide toggle.
   * @property {string} [showPassword] - Visible text of the button when the
   *   password is currently hidden. Plain text only.
   * @property {string} [hidePassword] - Visible text of the button when the
   *   password is currently visible. Plain text only.
   * @property {string} [showPasswordAriaLabel] - aria-label of the button when
   *   the password is currently hidden. Plain text only.
   * @property {string} [hidePasswordAriaLabel] - aria-label of the button when
   *   the password is currently visible. Plain text only.
   * @property {string} [passwordShownAnnouncement] - Screen reader
   *   announcement to make when the password has just become visible.
   *   Plain text only.
   * @property {string} [passwordHiddenAnnouncement] - Screen reader
   *   announcement to make when the password has just been hidden.
   *   Plain text only.
   */

  /**
   * @import { Schema } from '../../common/configuration.mjs'
   */
  PasswordInput.moduleName = 'govuk-password-input';
  PasswordInput.defaults = Object.freeze({
    i18n: {
      showPassword: 'Show',
      hidePassword: 'Hide',
      showPasswordAriaLabel: 'Show password',
      hidePasswordAriaLabel: 'Hide password',
      passwordShownAnnouncement: 'Your password is visible',
      passwordHiddenAnnouncement: 'Your password is hidden'
    }
  });
  PasswordInput.schema = Object.freeze({
    properties: {
      i18n: {
        type: 'object'
      }
    }
  });

  /**
   * Radios component
   *
   * @preserve
   */
  class Radios extends Component {
    /**
     * Radios can be associated with a 'conditionally revealed' content block –
     * for example, a radio for 'Phone' could reveal an additional form field for
     * the user to enter their phone number.
     *
     * These associations are made using a `data-aria-controls` attribute, which
     * is promoted to an aria-controls attribute during initialisation.
     *
     * We also need to restore the state of any conditional reveals on the page
     * (for example if the user has navigated back), and set up event handlers to
     * keep the reveal in sync with the radio state.
     *
     * @param {Element | null} $root - HTML element to use for radios
     */
    constructor($root) {
      super($root);
      this.$inputs = void 0;
      const $inputs = this.$root.querySelectorAll('input[type="radio"]');
      if (!$inputs.length) {
        throw new ElementError({
          component: Radios,
          identifier: 'Form inputs (`<input type="radio">`)'
        });
      }
      this.$inputs = $inputs;
      this.$inputs.forEach($input => {
        const targetId = $input.getAttribute('data-aria-controls');
        if (!targetId) {
          return;
        }
        if (!document.getElementById(targetId)) {
          throw new ElementError({
            component: Radios,
            identifier: `Conditional reveal (\`id="${targetId}"\`)`
          });
        }
        $input.setAttribute('aria-controls', targetId);
        $input.removeAttribute('data-aria-controls');
      });
      window.addEventListener('pageshow', () => this.syncAllConditionalReveals());
      this.syncAllConditionalReveals();
      this.$root.addEventListener('click', event => this.handleClick(event));
    }
    syncAllConditionalReveals() {
      this.$inputs.forEach($input => this.syncConditionalRevealWithInputState($input));
    }
    syncConditionalRevealWithInputState($input) {
      const targetId = $input.getAttribute('aria-controls');
      if (!targetId) {
        return;
      }
      const $target = document.getElementById(targetId);
      if ($target != null && $target.classList.contains('govuk-radios__conditional')) {
        const inputIsChecked = $input.checked;
        $input.setAttribute('aria-expanded', inputIsChecked.toString());
        $target.classList.toggle('govuk-radios__conditional--hidden', !inputIsChecked);
      }
    }
    handleClick(event) {
      const $clickedInput = event.target;
      if (!($clickedInput instanceof HTMLInputElement) || $clickedInput.type !== 'radio') {
        return;
      }
      const $allInputs = document.querySelectorAll('input[type="radio"][aria-controls]');
      const $clickedInputForm = $clickedInput.form;
      const $clickedInputName = $clickedInput.name;
      $allInputs.forEach($input => {
        const hasSameFormOwner = $input.form === $clickedInputForm;
        const hasSameName = $input.name === $clickedInputName;
        if (hasSameName && hasSameFormOwner) {
          this.syncConditionalRevealWithInputState($input);
        }
      });
    }
  }
  Radios.moduleName = 'govuk-radios';

  /**
   * Service Navigation component
   *
   * @preserve
   */
  class ServiceNavigation extends Component {
    /**
     * @param {Element | null} $root - HTML element to use for header
     */
    constructor($root) {
      super($root);
      this.$menuButton = void 0;
      this.$menu = void 0;
      this.menuIsOpen = false;
      this.mql = null;
      const $menuButton = this.$root.querySelector('.govuk-js-service-navigation-toggle');
      if (!$menuButton) {
        return this;
      }
      const menuId = $menuButton.getAttribute('aria-controls');
      if (!menuId) {
        throw new ElementError({
          component: ServiceNavigation,
          identifier: 'Navigation button (`<button class="govuk-js-service-navigation-toggle">`) attribute (`aria-controls`)'
        });
      }
      const $menu = document.getElementById(menuId);
      if (!$menu) {
        throw new ElementError({
          component: ServiceNavigation,
          element: $menu,
          identifier: `Navigation (\`<ul id="${menuId}">\`)`
        });
      }
      this.$menu = $menu;
      this.$menuButton = $menuButton;
      this.setupResponsiveChecks();
      this.$menuButton.addEventListener('click', () => this.handleMenuButtonClick());
    }
    setupResponsiveChecks() {
      const breakpoint = getBreakpoint('tablet');
      if (!breakpoint.value) {
        throw new ElementError({
          component: ServiceNavigation,
          identifier: `CSS custom property (\`${breakpoint.property}\`) on pseudo-class \`:root\``
        });
      }
      this.mql = window.matchMedia(`(min-width: ${breakpoint.value})`);
      if ('addEventListener' in this.mql) {
        this.mql.addEventListener('change', () => this.checkMode());
      } else {
        this.mql.addListener(() => this.checkMode());
      }
      this.checkMode();
    }
    checkMode() {
      if (!this.mql || !this.$menu || !this.$menuButton) {
        return;
      }
      if (this.mql.matches) {
        this.$menu.removeAttribute('hidden');
        this.$menuButton.setAttribute('hidden', '');
      } else {
        this.$menuButton.removeAttribute('hidden');
        this.$menuButton.setAttribute('aria-expanded', this.menuIsOpen.toString());
        if (this.menuIsOpen) {
          this.$menu.removeAttribute('hidden');
        } else {
          this.$menu.setAttribute('hidden', '');
        }
      }
    }
    handleMenuButtonClick() {
      this.menuIsOpen = !this.menuIsOpen;
      this.checkMode();
    }
  }
  ServiceNavigation.moduleName = 'govuk-service-navigation';

  /**
   * Skip link component
   *
   * @preserve
   * @augments Component<HTMLAnchorElement>
   */
  class SkipLink extends Component {
    /**
     * @param {Element | null} $root - HTML element to use for skip link
     * @throws {ElementError} when $root is not set or the wrong type
     * @throws {ElementError} when $root.hash does not contain a hash
     * @throws {ElementError} when the linked element is missing or the wrong type
     */
    constructor($root) {
      var _this$$root$getAttrib;
      super($root);
      const hash = this.$root.hash;
      const href = (_this$$root$getAttrib = this.$root.getAttribute('href')) != null ? _this$$root$getAttrib : '';
      let url;
      try {
        url = new window.URL(this.$root.href);
      } catch (error) {
        throw new ElementError(`Skip link: Target link (\`href="${href}"\`) is invalid`);
      }
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) {
        return;
      }
      const linkedElementId = getFragmentFromUrl(hash);
      if (!linkedElementId) {
        throw new ElementError(`Skip link: Target link (\`href="${href}"\`) has no hash fragment`);
      }
      const $linkedElement = document.getElementById(linkedElementId);
      if (!$linkedElement) {
        throw new ElementError({
          component: SkipLink,
          element: $linkedElement,
          identifier: `Target content (\`id="${linkedElementId}"\`)`
        });
      }
      this.$root.addEventListener('click', () => setFocus($linkedElement, {
        onBeforeFocus() {
          $linkedElement.classList.add('govuk-skip-link-focused-element');
        },
        onBlur() {
          $linkedElement.classList.remove('govuk-skip-link-focused-element');
        }
      }));
    }
  }
  SkipLink.elementType = HTMLAnchorElement;
  SkipLink.moduleName = 'govuk-skip-link';

  /**
   * Tabs component
   *
   * @preserve
   */
  class Tabs extends Component {
    /**
     * @param {Element | null} $root - HTML element to use for tabs
     */
    constructor($root) {
      super($root);
      this.$tabs = void 0;
      this.$tabList = void 0;
      this.$tabListItems = void 0;
      this.jsHiddenClass = 'govuk-tabs__panel--hidden';
      this.changingHash = false;
      this.boundTabClick = void 0;
      this.boundTabKeydown = void 0;
      this.boundOnHashChange = void 0;
      this.mql = null;
      const $tabs = this.$root.querySelectorAll('a.govuk-tabs__tab');
      if (!$tabs.length) {
        throw new ElementError({
          component: Tabs,
          identifier: 'Links (`<a class="govuk-tabs__tab">`)'
        });
      }
      this.$tabs = $tabs;
      this.boundTabClick = this.onTabClick.bind(this);
      this.boundTabKeydown = this.onTabKeydown.bind(this);
      this.boundOnHashChange = this.onHashChange.bind(this);
      const $tabList = this.$root.querySelector('.govuk-tabs__list');
      const $tabListItems = this.$root.querySelectorAll('li.govuk-tabs__list-item');
      if (!$tabList) {
        throw new ElementError({
          component: Tabs,
          identifier: 'List (`<ul class="govuk-tabs__list">`)'
        });
      }
      if (!$tabListItems.length) {
        throw new ElementError({
          component: Tabs,
          identifier: 'List items (`<li class="govuk-tabs__list-item">`)'
        });
      }
      this.$tabList = $tabList;
      this.$tabListItems = $tabListItems;
      this.setupResponsiveChecks();
    }
    setupResponsiveChecks() {
      const breakpoint = getBreakpoint('tablet');
      if (!breakpoint.value) {
        throw new ElementError({
          component: Tabs,
          identifier: `CSS custom property (\`${breakpoint.property}\`) on pseudo-class \`:root\``
        });
      }
      this.mql = window.matchMedia(`(min-width: ${breakpoint.value})`);
      if ('addEventListener' in this.mql) {
        this.mql.addEventListener('change', () => this.checkMode());
      } else {
        this.mql.addListener(() => this.checkMode());
      }
      this.checkMode();
    }
    checkMode() {
      var _this$mql;
      if ((_this$mql = this.mql) != null && _this$mql.matches) {
        this.setup();
      } else {
        this.teardown();
      }
    }
    setup() {
      var _this$getTab;
      this.$tabList.setAttribute('role', 'tablist');
      this.$tabListItems.forEach($item => {
        $item.setAttribute('role', 'presentation');
      });
      this.$tabs.forEach($tab => {
        this.setAttributes($tab);
        $tab.addEventListener('click', this.boundTabClick, true);
        $tab.addEventListener('keydown', this.boundTabKeydown, true);
        this.hideTab($tab);
      });
      const $activeTab = (_this$getTab = this.getTab(window.location.hash)) != null ? _this$getTab : this.$tabs[0];
      this.showTab($activeTab);
      window.addEventListener('hashchange', this.boundOnHashChange, true);
    }
    teardown() {
      this.$tabList.removeAttribute('role');
      this.$tabListItems.forEach($item => {
        $item.removeAttribute('role');
      });
      this.$tabs.forEach($tab => {
        $tab.removeEventListener('click', this.boundTabClick, true);
        $tab.removeEventListener('keydown', this.boundTabKeydown, true);
        this.unsetAttributes($tab);
      });
      window.removeEventListener('hashchange', this.boundOnHashChange, true);
    }
    onHashChange() {
      const hash = window.location.hash;
      const $tabWithHash = this.getTab(hash);
      if (!$tabWithHash) {
        return;
      }
      if (this.changingHash) {
        this.changingHash = false;
        return;
      }
      const $previousTab = this.getCurrentTab();
      if (!$previousTab) {
        return;
      }
      this.hideTab($previousTab);
      this.showTab($tabWithHash);
      $tabWithHash.focus();
    }
    hideTab($tab) {
      this.unhighlightTab($tab);
      this.hidePanel($tab);
    }
    showTab($tab) {
      this.highlightTab($tab);
      this.showPanel($tab);
    }
    getTab(hash) {
      return this.$root.querySelector(`a.govuk-tabs__tab[href="${hash}"]`);
    }
    setAttributes($tab) {
      const panelId = getFragmentFromUrl($tab.href);
      if (!panelId) {
        return;
      }
      $tab.setAttribute('id', `tab_${panelId}`);
      $tab.setAttribute('role', 'tab');
      $tab.setAttribute('aria-controls', panelId);
      $tab.setAttribute('aria-selected', 'false');
      $tab.setAttribute('tabindex', '-1');
      const $panel = this.getPanel($tab);
      if (!$panel) {
        return;
      }
      $panel.setAttribute('role', 'tabpanel');
      $panel.setAttribute('aria-labelledby', $tab.id);
      $panel.classList.add(this.jsHiddenClass);
    }
    unsetAttributes($tab) {
      $tab.removeAttribute('id');
      $tab.removeAttribute('role');
      $tab.removeAttribute('aria-controls');
      $tab.removeAttribute('aria-selected');
      $tab.removeAttribute('tabindex');
      const $panel = this.getPanel($tab);
      if (!$panel) {
        return;
      }
      $panel.removeAttribute('role');
      $panel.removeAttribute('aria-labelledby');
      $panel.classList.remove(this.jsHiddenClass);
    }
    onTabClick(event) {
      const $currentTab = this.getCurrentTab();
      const $nextTab = event.currentTarget;
      if (!$currentTab || !($nextTab instanceof HTMLAnchorElement)) {
        return;
      }
      event.preventDefault();
      this.hideTab($currentTab);
      this.showTab($nextTab);
      this.createHistoryEntry($nextTab);
    }
    createHistoryEntry($tab) {
      const $panel = this.getPanel($tab);
      if (!$panel) {
        return;
      }
      const panelId = $panel.id;
      $panel.id = '';
      this.changingHash = true;
      window.location.hash = panelId;
      $panel.id = panelId;
    }
    onTabKeydown(event) {
      switch (event.key) {
        case 'ArrowLeft':
        case 'Left':
          this.activatePreviousTab();
          event.preventDefault();
          break;
        case 'ArrowRight':
        case 'Right':
          this.activateNextTab();
          event.preventDefault();
          break;
      }
    }
    activateNextTab() {
      const $currentTab = this.getCurrentTab();
      if (!($currentTab != null && $currentTab.parentElement)) {
        return;
      }
      const $nextTabListItem = $currentTab.parentElement.nextElementSibling;
      if (!$nextTabListItem) {
        return;
      }
      const $nextTab = $nextTabListItem.querySelector('a.govuk-tabs__tab');
      if (!$nextTab) {
        return;
      }
      this.hideTab($currentTab);
      this.showTab($nextTab);
      $nextTab.focus();
      this.createHistoryEntry($nextTab);
    }
    activatePreviousTab() {
      const $currentTab = this.getCurrentTab();
      if (!($currentTab != null && $currentTab.parentElement)) {
        return;
      }
      const $previousTabListItem = $currentTab.parentElement.previousElementSibling;
      if (!$previousTabListItem) {
        return;
      }
      const $previousTab = $previousTabListItem.querySelector('a.govuk-tabs__tab');
      if (!$previousTab) {
        return;
      }
      this.hideTab($currentTab);
      this.showTab($previousTab);
      $previousTab.focus();
      this.createHistoryEntry($previousTab);
    }
    getPanel($tab) {
      const panelId = getFragmentFromUrl($tab.href);
      if (!panelId) {
        return null;
      }
      return this.$root.querySelector(`#${panelId}`);
    }
    showPanel($tab) {
      const $panel = this.getPanel($tab);
      if (!$panel) {
        return;
      }
      $panel.classList.remove(this.jsHiddenClass);
    }
    hidePanel($tab) {
      const $panel = this.getPanel($tab);
      if (!$panel) {
        return;
      }
      $panel.classList.add(this.jsHiddenClass);
    }
    unhighlightTab($tab) {
      if (!$tab.parentElement) {
        return;
      }
      $tab.setAttribute('aria-selected', 'false');
      $tab.parentElement.classList.remove('govuk-tabs__list-item--selected');
      $tab.setAttribute('tabindex', '-1');
    }
    highlightTab($tab) {
      if (!$tab.parentElement) {
        return;
      }
      $tab.setAttribute('aria-selected', 'true');
      $tab.parentElement.classList.add('govuk-tabs__list-item--selected');
      $tab.setAttribute('tabindex', '0');
    }
    getCurrentTab() {
      return this.$root.querySelector('.govuk-tabs__list-item--selected a.govuk-tabs__tab');
    }
  }
  Tabs.moduleName = 'govuk-tabs';

  /**
   * Initialise all components
   *
   * Use the `data-module` attributes to find, instantiate and init all of the
   * components provided as part of GOV.UK Frontend.
   *
   * @param {Config & { scope?: Element, onError?: OnErrorCallback<CompatibleClass> }} [config] - Config for all components (with optional scope)
   */
  function initAll(config) {
    var _config$scope;
    config = typeof config !== 'undefined' ? config : {};
    if (!isSupported()) {
      if (config.onError) {
        config.onError(new SupportError(), {
          config
        });
      } else {
        console.log(new SupportError());
      }
      return;
    }
    const components = [[Accordion, config.accordion], [Button, config.button], [CharacterCount, config.characterCount], [Checkboxes], [ErrorSummary, config.errorSummary], [ExitThisPage, config.exitThisPage], [FileUpload, config.fileUpload], [Header], [NotificationBanner, config.notificationBanner], [PasswordInput, config.passwordInput], [Radios], [ServiceNavigation], [SkipLink], [Tabs]];
    const options = {
      scope: (_config$scope = config.scope) != null ? _config$scope : document,
      onError: config.onError
    };
    components.forEach(([Component, config]) => {
      createAll(Component, config, options);
    });
  }

  /**
   * Create all instances of a specific component on the page
   *
   * Uses the `data-module` attribute to find all elements matching the specified
   * component on the page, creating instances of the component object for each
   * of them.
   *
   * Any component errors will be caught and logged to the console.
   *
   * @template {CompatibleClass} ComponentClass
   * @param {ComponentClass} Component - class of the component to create
   * @param {ComponentConfig<ComponentClass>} [config] - Config supplied to component
   * @param {OnErrorCallback<ComponentClass> | Element | Document | CreateAllOptions<ComponentClass> } [createAllOptions] - options for createAll including scope of the document to search within and callback function if error throw by component on init
   * @returns {Array<InstanceType<ComponentClass>>} - array of instantiated components
   */
  function createAll(Component, config, createAllOptions) {
    let $scope = document;
    let onError;
    if (typeof createAllOptions === 'object') {
      var _createAllOptions$sco;
      createAllOptions = createAllOptions;
      $scope = (_createAllOptions$sco = createAllOptions.scope) != null ? _createAllOptions$sco : $scope;
      onError = createAllOptions.onError;
    }
    if (typeof createAllOptions === 'function') {
      onError = createAllOptions;
    }
    if (createAllOptions instanceof HTMLElement) {
      $scope = createAllOptions;
    }
    const $elements = $scope.querySelectorAll(`[data-module="${Component.moduleName}"]`);
    if (!isSupported()) {
      if (onError) {
        onError(new SupportError(), {
          component: Component,
          config
        });
      } else {
        console.log(new SupportError());
      }
      return [];
    }
    return Array.from($elements).map($element => {
      try {
        return typeof config !== 'undefined' ? new Component($element, config) : new Component($element);
      } catch (error) {
        if (onError) {
          onError(error, {
            element: $element,
            component: Component,
            config
          });
        } else {
          console.log(error);
        }
        return null;
      }
    }).filter(Boolean);
  }

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  var accessibleAutocomplete_min = {exports: {}};

  var hasRequiredAccessibleAutocomplete_min;

  function requireAccessibleAutocomplete_min () {
  	if (hasRequiredAccessibleAutocomplete_min) return accessibleAutocomplete_min.exports;
  	hasRequiredAccessibleAutocomplete_min = 1;
  	(function (module, exports) {
  		!function(t,e){module.exports=e();}(self,(function(){return function(){var t={8952:function(t,e,n){var r=n(4328),o=n(36),i=TypeError;t.exports=function(t){if(r(t))return t;throw new i(o(t)+" is not a function")};},2096:function(t,e,n){var r=n(2424),o=String,i=TypeError;t.exports=function(t){if(r(t))return t;throw new i("Can't set "+o(t)+" as a prototype")};},4764:function(t,e,n){var r=n(9764).charAt;t.exports=function(t,e,n){return e+(n?r(t,e).length:1)};},6100:function(t,e,n){var r=n(7e3),o=TypeError;t.exports=function(t,e){if(r(e,t))return t;throw new o("Incorrect invocation")};},3951:function(t,e,n){var r=n(1632),o=String,i=TypeError;t.exports=function(t){if(r(t))return t;throw new i(o(t)+" is not an object")};},2504:function(t,e,n){var r=n(4096),o=n(2495),i=n(3556),u=function(t){return function(e,n,u){var a=r(e),c=i(a);if(0===c)return !t&&-1;var s,l=o(u,c);if(t&&n!=n){for(;c>l;)if((s=a[l++])!=s)return  true}else for(;c>l;l++)if((t||l in a)&&a[l]===n)return t||l||0;return !t&&-1}};t.exports={includes:u(true),indexOf:u(false)};},3364:function(t,e,n){var r=n(8992),o=n(1664),i=n(5712),u=n(4356),a=n(3556),c=n(2568),s=o([].push),l=function(t){var e=1===t,n=2===t,o=3===t,l=4===t,f=6===t,p=7===t,d=5===t||f;return function(h,v,m,y){for(var g,b,x=u(h),w=i(x),O=a(w),_=r(v,m),S=0,C=y||c,E=e?C(h,O):n||p?C(h,0):void 0;O>S;S++)if((d||S in w)&&(b=_(g=w[S],S,x),t))if(e)E[S]=b;else if(b)switch(t){case 3:return  true;case 5:return g;case 6:return S;case 2:s(E,g);}else switch(t){case 4:return  false;case 7:s(E,g);}return f?-1:o||l?l:E}};t.exports={forEach:l(0),map:l(1),filter:l(2),some:l(3),every:l(4),find:l(5),findIndex:l(6),filterReject:l(7)};},953:function(t,e,n){var r=n(9957),o=n(9972),i=n(8504),u=o("species");t.exports=function(t){return i>=51||!r((function(){var e=[];return (e.constructor={})[u]=function(){return {foo:1}},1!==e[t](Boolean).foo}))};},1496:function(t,e,n){var r=n(9957);t.exports=function(t,e){var n=[][t];return !!n&&r((function(){n.call(null,e||function(){return 1},1);}))};},6728:function(t,e,n){var r=n(3476),o=n(1432),i=TypeError,u=Object.getOwnPropertyDescriptor,a=r&&!function(){if(void 0!==this)return  true;try{Object.defineProperty([],"length",{writable:!1}).length=1;}catch(t){return t instanceof TypeError}}();t.exports=a?function(t,e){if(o(t)&&!u(t,"length").writable)throw new i("Cannot set read only .length");return t.length=e}:function(t,e){return t.length=e};},6736:function(t,e,n){var r=n(1432),o=n(6072),i=n(1632),u=n(9972)("species"),a=Array;t.exports=function(t){var e;return r(t)&&(e=t.constructor,(o(e)&&(e===a||r(e.prototype))||i(e)&&null===(e=e[u]))&&(e=void 0)),void 0===e?a:e};},2568:function(t,e,n){var r=n(6736);t.exports=function(t,e){return new(r(t))(0===e?0:e)};},8696:function(t,e,n){var r=n(3951),o=n(3112);t.exports=function(t,e,n,i){try{return i?e(r(n)[0],n[1]):e(n)}catch(u){o(t,"throw",u);}};},1888:function(t,e,n){var r=n(1664),o=r({}.toString),i=r("".slice);t.exports=function(t){return i(o(t),8,-1)};},4427:function(t,e,n){var r=n(16),o=n(4328),i=n(1888),u=n(9972)("toStringTag"),a=Object,c="Arguments"===i(function(){return arguments}());t.exports=r?i:function(t){var e,n,r;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(n=function(t,e){try{return t[e]}catch(n){}}(e=a(t),u))?n:c?i(e):"Object"===(r=i(e))&&o(e.callee)?"Arguments":r};},9968:function(t,e,n){var r=n(5152),o=n(9252),i=n(9444),u=n(8352);t.exports=function(t,e,n){for(var a=o(e),c=u.f,s=i.f,l=0;l<a.length;l++){var f=a[l];r(t,f)||n&&r(n,f)||c(t,f,s(e,f));}};},2272:function(t,e,n){var r=n(9957);t.exports=!r((function(){function t(){}return t.prototype.constructor=null,Object.getPrototypeOf(new t)!==t.prototype}));},3336:function(t){t.exports=function(t,e){return {value:t,done:e}};},3440:function(t,e,n){var r=n(3476),o=n(8352),i=n(9728);t.exports=r?function(t,e,n){return o.f(t,e,i(1,n))}:function(t,e,n){return t[e]=n,t};},9728:function(t){t.exports=function(t,e){return {enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}};},92:function(t,e,n){var r=n(3476),o=n(8352),i=n(9728);t.exports=function(t,e,n){r?o.f(t,e,i(0,n)):t[e]=n;};},2544:function(t,e,n){var r=n(5312),o=n(8352);t.exports=function(t,e,n){return n.get&&r(n.get,e,{getter:true}),n.set&&r(n.set,e,{setter:true}),o.f(t,e,n)};},6076:function(t,e,n){var r=n(4328),o=n(8352),i=n(5312),u=n(4636);t.exports=function(t,e,n,a){a||(a={});var c=a.enumerable,s=void 0!==a.name?a.name:e;if(r(n)&&i(n,s,a),a.global)c?t[e]=n:u(e,n);else {try{a.unsafe?t[e]&&(c=!0):delete t[e];}catch(l){}c?t[e]=n:o.f(t,e,{value:n,enumerable:false,configurable:!a.nonConfigurable,writable:!a.nonWritable});}return t};},4036:function(t,e,n){var r=n(6076);t.exports=function(t,e,n){for(var o in e)r(t,o,e[o],n);return t};},4636:function(t,e,n){var r=n(6420),o=Object.defineProperty;t.exports=function(t,e){try{o(r,t,{value:e,configurable:!0,writable:!0});}catch(n){r[t]=e;}return e};},3476:function(t,e,n){var r=n(9957);t.exports=!r((function(){return 7!==Object.defineProperty({},1,{get:function(){return 7}})[1]}));},8168:function(t,e,n){var r=n(6420),o=n(1632),i=r.document,u=o(i)&&o(i.createElement);t.exports=function(t){return u?i.createElement(t):{}};},4316:function(t){var e=TypeError;t.exports=function(t){if(t>9007199254740991)throw e("Maximum allowed index exceeded");return t};},6064:function(t){t.exports="undefined"!=typeof navigator&&String(navigator.userAgent)||"";},8504:function(t,e,n){var r,o,i=n(6420),u=n(6064),a=i.process,c=i.Deno,s=a&&a.versions||c&&c.version,l=s&&s.v8;l&&(o=(r=l.split("."))[0]>0&&r[0]<4?1:+(r[0]+r[1])),!o&&u&&(!(r=u.match(/Edge\/(\d+)/))||r[1]>=74)&&(r=u.match(/Chrome\/(\d+)/))&&(o=+r[1]),t.exports=o;},8256:function(t){t.exports=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"];},6520:function(t,e,n){var r=n(1664),o=Error,i=r("".replace),u=String(new o("zxcasd").stack),a=/\n\s*at [^:]*:[^\n]*/,c=a.test(u);t.exports=function(t,e){if(c&&"string"==typeof t&&!o.prepareStackTrace)for(;e--;)t=i(t,a,"");return t};},3696:function(t,e,n){var r=n(3440),o=n(6520),i=n(9184),u=Error.captureStackTrace;t.exports=function(t,e,n,a){i&&(u?u(t,e):r(t,"stack",o(n,a)));};},9184:function(t,e,n){var r=n(9957),o=n(9728);t.exports=!r((function(){var t=new Error("a");return !("stack"in t)||(Object.defineProperty(t,"stack",o(1,7)),7!==t.stack)}));},9160:function(t,e,n){var r=n(6420),o=n(9444).f,i=n(3440),u=n(6076),a=n(4636),c=n(9968),s=n(6704);t.exports=function(t,e){var n,l,f,p,d,h=t.target,v=t.global,m=t.stat;if(n=v?r:m?r[h]||a(h,{}):r[h]&&r[h].prototype)for(l in e){if(p=e[l],f=t.dontCallGetSet?(d=o(n,l))&&d.value:n[l],!s(v?l:h+(m?".":"#")+l,t.forced)&&void 0!==f){if(typeof p==typeof f)continue;c(p,f);}(t.sham||f&&f.sham)&&i(p,"sham",true),u(n,l,p,t);}};},9957:function(t){t.exports=function(t){try{return !!t()}catch(e){return  true}};},7176:function(t,e,n){n(880);var r=n(8448),o=n(6076),i=n(7680),u=n(9957),a=n(9972),c=n(3440),s=a("species"),l=RegExp.prototype;t.exports=function(t,e,n,f){var p=a(t),d=!u((function(){var e={};return e[p]=function(){return 7},7!==""[t](e)})),h=d&&!u((function(){var e=false,n=/a/;return "split"===t&&((n={}).constructor={},n.constructor[s]=function(){return n},n.flags="",n[p]=/./[p]),n.exec=function(){return e=true,null},n[p](""),!e}));if(!d||!h||n){var v=/./[p],m=e(p,""[t],(function(t,e,n,o,u){var a=e.exec;return a===i||a===l.exec?d&&!u?{done:true,value:r(v,e,n,o)}:{done:true,value:r(t,n,e,o)}:{done:false}}));o(String.prototype,t,m[0]),o(l,p,m[1]);}f&&c(l[p],"sham",true);};},908:function(t,e,n){var r=n(7332),o=Function.prototype,i=o.apply,u=o.call;t.exports="object"==typeof Reflect&&Reflect.apply||(r?u.bind(i):function(){return u.apply(i,arguments)});},8992:function(t,e,n){var r=n(3180),o=n(8952),i=n(7332),u=r(r.bind);t.exports=function(t,e){return o(t),void 0===e?t:i?u(t,e):function(){return t.apply(e,arguments)}};},7332:function(t,e,n){var r=n(9957);t.exports=!r((function(){var t=function(){}.bind();return "function"!=typeof t||t.hasOwnProperty("prototype")}));},8448:function(t,e,n){var r=n(7332),o=Function.prototype.call;t.exports=r?o.bind(o):function(){return o.apply(o,arguments)};},6208:function(t,e,n){var r=n(3476),o=n(5152),i=Function.prototype,u=r&&Object.getOwnPropertyDescriptor,a=o(i,"name"),c=a&&"something"===function(){}.name,s=a&&(!r||r&&u(i,"name").configurable);t.exports={EXISTS:a,PROPER:c,CONFIGURABLE:s};},5288:function(t,e,n){var r=n(1664),o=n(8952);t.exports=function(t,e,n){try{return r(o(Object.getOwnPropertyDescriptor(t,e)[n]))}catch(i){}};},3180:function(t,e,n){var r=n(1888),o=n(1664);t.exports=function(t){if("Function"===r(t))return o(t)};},1664:function(t,e,n){var r=n(7332),o=Function.prototype,i=o.call,u=r&&o.bind.bind(i,i);t.exports=r?u:function(t){return function(){return i.apply(t,arguments)}};},5232:function(t,e,n){var r=n(6420),o=n(4328);t.exports=function(t,e){return arguments.length<2?(n=r[t],o(n)?n:void 0):r[t]&&r[t][e];var n;};},6752:function(t){t.exports=function(t){return {iterator:t,next:t.next,done:false}};},4504:function(t,e,n){var r=n(8952),o=n(9760);t.exports=function(t,e){var n=t[e];return o(n)?void 0:r(n)};},6420:function(t,e,n){var r=function(t){return t&&t.Math===Math&&t};t.exports=r("object"==typeof globalThis&&globalThis)||r("object"==typeof window&&window)||r("object"==typeof self&&self)||r("object"==typeof n.g&&n.g)||r("object"==typeof this&&this)||function(){return this}()||Function("return this")();},5152:function(t,e,n){var r=n(1664),o=n(4356),i=r({}.hasOwnProperty);t.exports=Object.hasOwn||function(t,e){return i(o(t),e)};},2560:function(t){t.exports={};},4168:function(t,e,n){var r=n(5232);t.exports=r("document","documentElement");},9888:function(t,e,n){var r=n(3476),o=n(9957),i=n(8168);t.exports=!r&&!o((function(){return 7!==Object.defineProperty(i("div"),"a",{get:function(){return 7}}).a}));},5712:function(t,e,n){var r=n(1664),o=n(9957),i=n(1888),u=Object,a=r("".split);t.exports=o((function(){return !u("z").propertyIsEnumerable(0)}))?function(t){return "String"===i(t)?a(t,""):u(t)}:u;},7512:function(t,e,n){var r=n(4328),o=n(1632),i=n(4024);t.exports=function(t,e,n){var u,a;return i&&r(u=e.constructor)&&u!==n&&o(a=u.prototype)&&a!==n.prototype&&i(t,a),t};},9112:function(t,e,n){var r=n(1664),o=n(4328),i=n(3976),u=r(Function.toString);o(i.inspectSource)||(i.inspectSource=function(t){return u(t)}),t.exports=i.inspectSource;},3480:function(t,e,n){var r=n(1632),o=n(3440);t.exports=function(t,e){r(e)&&"cause"in e&&o(t,"cause",e.cause);};},9104:function(t,e,n){var r,o,i,u=n(4288),a=n(6420),c=n(1632),s=n(3440),l=n(5152),f=n(3976),p=n(6504),d=n(2560),h="Object already initialized",v=a.TypeError,m=a.WeakMap;if(u||f.state){var y=f.state||(f.state=new m);y.get=y.get,y.has=y.has,y.set=y.set,r=function(t,e){if(y.has(t))throw new v(h);return e.facade=t,y.set(t,e),e},o=function(t){return y.get(t)||{}},i=function(t){return y.has(t)};}else {var g=p("state");d[g]=true,r=function(t,e){if(l(t,g))throw new v(h);return e.facade=t,s(t,g,e),e},o=function(t){return l(t,g)?t[g]:{}},i=function(t){return l(t,g)};}t.exports={set:r,get:o,has:i,enforce:function(t){return i(t)?o(t):r(t,{})},getterFor:function(t){return function(e){var n;if(!c(e)||(n=o(e)).type!==t)throw new v("Incompatible receiver, "+t+" required");return n}}};},1432:function(t,e,n){var r=n(1888);t.exports=Array.isArray||function(t){return "Array"===r(t)};},4328:function(t){var e="object"==typeof document&&document.all;t.exports=void 0===e&&void 0!==e?function(t){return "function"==typeof t||t===e}:function(t){return "function"==typeof t};},6072:function(t,e,n){var r=n(1664),o=n(9957),i=n(4328),u=n(4427),a=n(5232),c=n(9112),s=function(){},l=a("Reflect","construct"),f=/^\s*(?:class|function)\b/,p=r(f.exec),d=!f.test(s),h=function(t){if(!i(t))return  false;try{return l(s,[],t),!0}catch(e){return  false}},v=function(t){if(!i(t))return  false;switch(u(t)){case "AsyncFunction":case "GeneratorFunction":case "AsyncGeneratorFunction":return  false}try{return d||!!p(f,c(t))}catch(e){return  true}};v.sham=true,t.exports=!l||o((function(){var t;return h(h.call)||!h(Object)||!h((function(){t=true;}))||t}))?v:h;},6704:function(t,e,n){var r=n(9957),o=n(4328),i=/#|\.prototype\./,u=function(t,e){var n=c[a(t)];return n===l||n!==s&&(o(e)?r(e):!!e)},a=u.normalize=function(t){return String(t).replace(i,".").toLowerCase()},c=u.data={},s=u.NATIVE="N",l=u.POLYFILL="P";t.exports=u;},9760:function(t){t.exports=function(t){return null==t};},1632:function(t,e,n){var r=n(4328);t.exports=function(t){return "object"==typeof t?null!==t:r(t)};},2424:function(t,e,n){var r=n(1632);t.exports=function(t){return r(t)||null===t};},7048:function(t){t.exports=false;},7728:function(t,e,n){var r=n(5232),o=n(4328),i=n(7e3),u=n(6536),a=Object;t.exports=u?function(t){return "symbol"==typeof t}:function(t){var e=r("Symbol");return o(e)&&i(e.prototype,a(t))};},3112:function(t,e,n){var r=n(8448),o=n(3951),i=n(4504);t.exports=function(t,e,n){var u,a;o(t);try{if(!(u=i(t,"return"))){if("throw"===e)throw n;return n}u=r(u,t);}catch(c){a=true,u=c;}if("throw"===e)throw n;if(a)throw u;return o(u),n};},9724:function(t,e,n){var r=n(8448),o=n(9368),i=n(3440),u=n(4036),a=n(9972),c=n(9104),s=n(4504),l=n(336).IteratorPrototype,f=n(3336),p=n(3112),d=a("toStringTag"),h="IteratorHelper",v="WrapForValidIterator",m=c.set,y=function(t){var e=c.getterFor(t?v:h);return u(o(l),{next:function(){var n=e(this);if(t)return n.nextHandler();try{var r=n.done?void 0:n.nextHandler();return f(r,n.done)}catch(o){throw n.done=true,o}},return:function(){var n=e(this),o=n.iterator;if(n.done=true,t){var i=s(o,"return");return i?r(i,o):f(void 0,true)}if(n.inner)try{p(n.inner.iterator,"normal");}catch(u){return p(o,"throw",u)}return p(o,"normal"),f(void 0,true)}})},g=y(true),b=y(false);i(b,d,"Iterator Helper"),t.exports=function(t,e){var n=function(n,r){r?(r.iterator=n.iterator,r.next=n.next):r=n,r.type=e?v:h,r.nextHandler=t,r.counter=0,r.done=false,m(this,r);};return n.prototype=e?g:b,n};},5792:function(t,e,n){var r=n(8448),o=n(8952),i=n(3951),u=n(6752),a=n(9724),c=n(8696),s=a((function(){var t=this.iterator,e=i(r(this.next,t));if(!(this.done=!!e.done))return c(t,this.mapper,[e.value,this.counter++],true)}));t.exports=function(t){return i(this),o(t),new s(u(this),{mapper:t})};},336:function(t,e,n){var r,o,i,u=n(9957),a=n(4328),c=n(1632),s=n(9368),l=n(7796),f=n(6076),p=n(9972),d=n(7048),h=p("iterator"),v=false;[].keys&&("next"in(i=[].keys())?(o=l(l(i)))!==Object.prototype&&(r=o):v=true),!c(r)||u((function(){var t={};return r[h].call(t)!==t}))?r={}:d&&(r=s(r)),a(r[h])||f(r,h,(function(){return this})),t.exports={IteratorPrototype:r,BUGGY_SAFARI_ITERATORS:v};},3556:function(t,e,n){var r=n(7584);t.exports=function(t){return r(t.length)};},5312:function(t,e,n){var r=n(1664),o=n(9957),i=n(4328),u=n(5152),a=n(3476),c=n(6208).CONFIGURABLE,s=n(9112),l=n(9104),f=l.enforce,p=l.get,d=String,h=Object.defineProperty,v=r("".slice),m=r("".replace),y=r([].join),g=a&&!o((function(){return 8!==h((function(){}),"length",{value:8}).length})),b=String(String).split("String"),x=t.exports=function(t,e,n){"Symbol("===v(d(e),0,7)&&(e="["+m(d(e),/^Symbol\(([^)]*)\).*$/,"$1")+"]"),n&&n.getter&&(e="get "+e),n&&n.setter&&(e="set "+e),(!u(t,"name")||c&&t.name!==e)&&(a?h(t,"name",{value:e,configurable:true}):t.name=e),g&&n&&u(n,"arity")&&t.length!==n.arity&&h(t,"length",{value:n.arity});try{n&&u(n,"constructor")&&n.constructor?a&&h(t,"prototype",{writable:!1}):t.prototype&&(t.prototype=void 0);}catch(o){}var r=f(t);return u(r,"source")||(r.source=y(b,"string"==typeof e?e:"")),t};Function.prototype.toString=x((function(){return i(this)&&p(this).source||s(this)}),"toString");},1748:function(t){var e=Math.ceil,n=Math.floor;t.exports=Math.trunc||function(t){var r=+t;return (r>0?n:e)(r)};},8948:function(t,e,n){var r=n(5016);t.exports=function(t,e){return void 0===t?arguments.length<2?"":e:r(t)};},9292:function(t,e,n){var r=n(3476),o=n(1664),i=n(8448),u=n(9957),a=n(1531),c=n(9392),s=n(8912),l=n(4356),f=n(5712),p=Object.assign,d=Object.defineProperty,h=o([].concat);t.exports=!p||u((function(){if(r&&1!==p({b:1},p(d({},"a",{enumerable:true,get:function(){d(this,"b",{value:3,enumerable:false});}}),{b:2})).b)return  true;var t={},e={},n=Symbol("assign detection"),o="abcdefghijklmnopqrst";return t[n]=7,o.split("").forEach((function(t){e[t]=t;})),7!==p({},t)[n]||a(p({},e)).join("")!==o}))?function(t,e){for(var n=l(t),o=arguments.length,u=1,p=c.f,d=s.f;o>u;)for(var v,m=f(arguments[u++]),y=p?h(a(m),p(m)):a(m),g=y.length,b=0;g>b;)v=y[b++],r&&!i(d,m,v)||(n[v]=m[v]);return n}:p;},9368:function(t,e,n){var r,o=n(3951),i=n(2056),u=n(8256),a=n(2560),c=n(4168),s=n(8168),l=n(6504),f="prototype",p="script",d=l("IE_PROTO"),h=function(){},v=function(t){return "<"+p+">"+t+"</"+p+">"},m=function(t){t.write(v("")),t.close();var e=t.parentWindow.Object;return t=null,e},y=function(){try{r=new ActiveXObject("htmlfile");}catch(i){}var t,e,n;y="undefined"!=typeof document?document.domain&&r?m(r):(e=s("iframe"),n="java"+p+":",e.style.display="none",c.appendChild(e),e.src=String(n),(t=e.contentWindow.document).open(),t.write(v("document.F=Object")),t.close(),t.F):m(r);for(var o=u.length;o--;)delete y[f][u[o]];return y()};a[d]=true,t.exports=Object.create||function(t,e){var n;return null!==t?(h[f]=o(t),n=new h,h[f]=null,n[d]=t):n=y(),void 0===e?n:i.f(n,e)};},2056:function(t,e,n){var r=n(3476),o=n(1576),i=n(8352),u=n(3951),a=n(4096),c=n(1531);e.f=r&&!o?Object.defineProperties:function(t,e){u(t);for(var n,r=a(e),o=c(e),s=o.length,l=0;s>l;)i.f(t,n=o[l++],r[n]);return t};},8352:function(t,e,n){var r=n(3476),o=n(9888),i=n(1576),u=n(3951),a=n(88),c=TypeError,s=Object.defineProperty,l=Object.getOwnPropertyDescriptor,f="enumerable",p="configurable",d="writable";e.f=r?i?function(t,e,n){if(u(t),e=a(e),u(n),"function"==typeof t&&"prototype"===e&&"value"in n&&d in n&&!n[d]){var r=l(t,e);r&&r[d]&&(t[e]=n.value,n={configurable:p in n?n[p]:r[p],enumerable:f in n?n[f]:r[f],writable:false});}return s(t,e,n)}:s:function(t,e,n){if(u(t),e=a(e),u(n),o)try{return s(t,e,n)}catch(r){}if("get"in n||"set"in n)throw new c("Accessors not supported");return "value"in n&&(t[e]=n.value),t};},9444:function(t,e,n){var r=n(3476),o=n(8448),i=n(8912),u=n(9728),a=n(4096),c=n(88),s=n(5152),l=n(9888),f=Object.getOwnPropertyDescriptor;e.f=r?f:function(t,e){if(t=a(t),e=c(e),l)try{return f(t,e)}catch(n){}if(s(t,e))return u(!o(i.f,t,e),t[e])};},5048:function(t,e,n){var r=n(9008),o=n(8256).concat("length","prototype");e.f=Object.getOwnPropertyNames||function(t){return r(t,o)};},9392:function(t,e){e.f=Object.getOwnPropertySymbols;},7796:function(t,e,n){var r=n(5152),o=n(4328),i=n(4356),u=n(6504),a=n(2272),c=u("IE_PROTO"),s=Object,l=s.prototype;t.exports=a?s.getPrototypeOf:function(t){var e=i(t);if(r(e,c))return e[c];var n=e.constructor;return o(n)&&e instanceof n?n.prototype:e instanceof s?l:null};},7e3:function(t,e,n){var r=n(1664);t.exports=r({}.isPrototypeOf);},9008:function(t,e,n){var r=n(1664),o=n(5152),i=n(4096),u=n(2504).indexOf,a=n(2560),c=r([].push);t.exports=function(t,e){var n,r=i(t),s=0,l=[];for(n in r)!o(a,n)&&o(r,n)&&c(l,n);for(;e.length>s;)o(r,n=e[s++])&&(~u(l,n)||c(l,n));return l};},1531:function(t,e,n){var r=n(9008),o=n(8256);t.exports=Object.keys||function(t){return r(t,o)};},8912:function(t,e){var n={}.propertyIsEnumerable,r=Object.getOwnPropertyDescriptor,o=r&&!n.call({1:2},1);e.f=o?function(t){var e=r(this,t);return !!e&&e.enumerable}:n;},4024:function(t,e,n){var r=n(5288),o=n(3951),i=n(2096);t.exports=Object.setPrototypeOf||("__proto__"in{}?function(){var t,e=false,n={};try{(t=r(Object.prototype,"__proto__","set"))(n,[]),e=n instanceof Array;}catch(u){}return function(n,r){return o(n),i(r),e?t(n,r):n.__proto__=r,n}}():void 0);},7032:function(t,e,n){var r=n(16),o=n(4427);t.exports=r?{}.toString:function(){return "[object "+o(this)+"]"};},2104:function(t,e,n){var r=n(8448),o=n(4328),i=n(1632),u=TypeError;t.exports=function(t,e){var n,a;if("string"===e&&o(n=t.toString)&&!i(a=r(n,t)))return a;if(o(n=t.valueOf)&&!i(a=r(n,t)))return a;if("string"!==e&&o(n=t.toString)&&!i(a=r(n,t)))return a;throw new u("Can't convert object to primitive value")};},9252:function(t,e,n){var r=n(5232),o=n(1664),i=n(5048),u=n(9392),a=n(3951),c=o([].concat);t.exports=r("Reflect","ownKeys")||function(t){var e=i.f(a(t)),n=u.f;return n?c(e,n(t)):e};},584:function(t,e,n){var r=n(8352).f;t.exports=function(t,e,n){n in t||r(t,n,{configurable:true,get:function(){return e[n]},set:function(t){e[n]=t;}});};},9092:function(t,e,n){var r=n(8448),o=n(3951),i=n(4328),u=n(1888),a=n(7680),c=TypeError;t.exports=function(t,e){var n=t.exec;if(i(n)){var s=r(n,t,e);return null!==s&&o(s),s}if("RegExp"===u(t))return r(a,t,e);throw new c("RegExp#exec called on incompatible receiver")};},7680:function(t,e,n){var r,o,i=n(8448),u=n(1664),a=n(5016),c=n(8872),s=n(3548),l=n(4696),f=n(9368),p=n(9104).get,d=n(8e3),h=n(9124),v=l("native-string-replace",String.prototype.replace),m=RegExp.prototype.exec,y=m,g=u("".charAt),b=u("".indexOf),x=u("".replace),w=u("".slice),O=(o=/b*/g,i(m,r=/a/,"a"),i(m,o,"a"),0!==r.lastIndex||0!==o.lastIndex),_=s.BROKEN_CARET,S=void 0!==/()??/.exec("")[1];(O||S||_||d||h)&&(y=function(t){var e,n,r,o,u,s,l,d=this,h=p(d),C=a(t),E=h.raw;if(E)return E.lastIndex=d.lastIndex,e=i(y,E,C),d.lastIndex=E.lastIndex,e;var I=h.groups,j=_&&d.sticky,A=i(c,d),P=d.source,N=0,k=C;if(j&&(A=x(A,"y",""),-1===b(A,"g")&&(A+="g"),k=w(C,d.lastIndex),d.lastIndex>0&&(!d.multiline||d.multiline&&"\n"!==g(C,d.lastIndex-1))&&(P="(?: "+P+")",k=" "+k,N++),n=new RegExp("^(?:"+P+")",A)),S&&(n=new RegExp("^"+P+"$(?!\\s)",A)),O&&(r=d.lastIndex),o=i(m,j?n:d,k),j?o?(o.input=w(o.input,N),o[0]=w(o[0],N),o.index=d.lastIndex,d.lastIndex+=o[0].length):d.lastIndex=0:O&&o&&(d.lastIndex=d.global?o.index+o[0].length:r),S&&o&&o.length>1&&i(v,o[0],n,(function(){for(u=1;u<arguments.length-2;u++) void 0===arguments[u]&&(o[u]=void 0);})),o&&I)for(o.groups=s=f(null),u=0;u<I.length;u++)s[(l=I[u])[0]]=o[l[1]];return o}),t.exports=y;},8872:function(t,e,n){var r=n(3951);t.exports=function(){var t=r(this),e="";return t.hasIndices&&(e+="d"),t.global&&(e+="g"),t.ignoreCase&&(e+="i"),t.multiline&&(e+="m"),t.dotAll&&(e+="s"),t.unicode&&(e+="u"),t.unicodeSets&&(e+="v"),t.sticky&&(e+="y"),e};},3548:function(t,e,n){var r=n(9957),o=n(6420).RegExp,i=r((function(){var t=o("a","y");return t.lastIndex=2,null!==t.exec("abcd")})),u=i||r((function(){return !o("a","y").sticky})),a=i||r((function(){var t=o("^r","gy");return t.lastIndex=2,null!==t.exec("str")}));t.exports={BROKEN_CARET:a,MISSED_STICKY:u,UNSUPPORTED_Y:i};},8e3:function(t,e,n){var r=n(9957),o=n(6420).RegExp;t.exports=r((function(){var t=o(".","s");return !(t.dotAll&&t.test("\n")&&"s"===t.flags)}));},9124:function(t,e,n){var r=n(9957),o=n(6420).RegExp;t.exports=r((function(){var t=o("(?<a>b)","g");return "b"!==t.exec("b").groups.a||"bc"!=="b".replace(t,"$<a>c")}));},5436:function(t,e,n){var r=n(9760),o=TypeError;t.exports=function(t){if(r(t))throw new o("Can't call method on "+t);return t};},6504:function(t,e,n){var r=n(4696),o=n(7776),i=r("keys");t.exports=function(t){return i[t]||(i[t]=o(t))};},3976:function(t,e,n){var r=n(7048),o=n(6420),i=n(4636),u="__core-js_shared__",a=t.exports=o[u]||i(u,{});(a.versions||(a.versions=[])).push({version:"3.36.0",mode:r?"pure":"global",copyright:"© 2014-2024 Denis Pushkarev (zloirock.ru)",license:"https://github.com/zloirock/core-js/blob/v3.36.0/LICENSE",source:"https://github.com/zloirock/core-js"});},4696:function(t,e,n){var r=n(3976);t.exports=function(t,e){return r[t]||(r[t]=e||{})};},9764:function(t,e,n){var r=n(1664),o=n(6180),i=n(5016),u=n(5436),a=r("".charAt),c=r("".charCodeAt),s=r("".slice),l=function(t){return function(e,n){var r,l,f=i(u(e)),p=o(n),d=f.length;return p<0||p>=d?t?"":void 0:(r=c(f,p))<55296||r>56319||p+1===d||(l=c(f,p+1))<56320||l>57343?t?a(f,p):r:t?s(f,p,p+2):l-56320+(r-55296<<10)+65536}};t.exports={codeAt:l(false),charAt:l(true)};},772:function(t,e,n){var r=n(8504),o=n(9957),i=n(6420).String;t.exports=!!Object.getOwnPropertySymbols&&!o((function(){var t=Symbol("symbol detection");return !i(t)||!(Object(t)instanceof Symbol)||!Symbol.sham&&r&&r<41}));},2495:function(t,e,n){var r=n(6180),o=Math.max,i=Math.min;t.exports=function(t,e){var n=r(t);return n<0?o(n+e,0):i(n,e)};},4096:function(t,e,n){var r=n(5712),o=n(5436);t.exports=function(t){return r(o(t))};},6180:function(t,e,n){var r=n(1748);t.exports=function(t){var e=+t;return e!=e||0===e?0:r(e)};},7584:function(t,e,n){var r=n(6180),o=Math.min;t.exports=function(t){var e=r(t);return e>0?o(e,9007199254740991):0};},4356:function(t,e,n){var r=n(5436),o=Object;t.exports=function(t){return o(r(t))};},7024:function(t,e,n){var r=n(8448),o=n(1632),i=n(7728),u=n(4504),a=n(2104),c=n(9972),s=TypeError,l=c("toPrimitive");t.exports=function(t,e){if(!o(t)||i(t))return t;var n,c=u(t,l);if(c){if(void 0===e&&(e="default"),n=r(c,t,e),!o(n)||i(n))return n;throw new s("Can't convert object to primitive value")}return void 0===e&&(e="number"),a(t,e)};},88:function(t,e,n){var r=n(7024),o=n(7728);t.exports=function(t){var e=r(t,"string");return o(e)?e:e+""};},16:function(t,e,n){var r={};r[n(9972)("toStringTag")]="z",t.exports="[object z]"===String(r);},5016:function(t,e,n){var r=n(4427),o=String;t.exports=function(t){if("Symbol"===r(t))throw new TypeError("Cannot convert a Symbol value to a string");return o(t)};},36:function(t){var e=String;t.exports=function(t){try{return e(t)}catch(n){return "Object"}};},7776:function(t,e,n){var r=n(1664),o=0,i=Math.random(),u=r(1..toString);t.exports=function(t){return "Symbol("+(void 0===t?"":t)+")_"+u(++o+i,36)};},6536:function(t,e,n){var r=n(772);t.exports=r&&!Symbol.sham&&"symbol"==typeof Symbol.iterator;},1576:function(t,e,n){var r=n(3476),o=n(9957);t.exports=r&&o((function(){return 42!==Object.defineProperty((function(){}),"prototype",{value:42,writable:false}).prototype}));},4288:function(t,e,n){var r=n(6420),o=n(4328),i=r.WeakMap;t.exports=o(i)&&/native code/.test(String(i));},9972:function(t,e,n){var r=n(6420),o=n(4696),i=n(5152),u=n(7776),a=n(772),c=n(6536),s=r.Symbol,l=o("wks"),f=c?s.for||s:s&&s.withoutSetter||u;t.exports=function(t){return i(l,t)||(l[t]=a&&i(s,t)?s[t]:f("Symbol."+t)),l[t]};},6488:function(t,e,n){var r=n(5232),o=n(5152),i=n(3440),u=n(7e3),a=n(4024),c=n(9968),s=n(584),l=n(7512),f=n(8948),p=n(3480),d=n(3696),h=n(3476),v=n(7048);t.exports=function(t,e,n,m){var y="stackTraceLimit",g=m?2:1,b=t.split("."),x=b[b.length-1],w=r.apply(null,b);if(w){var O=w.prototype;if(!v&&o(O,"cause")&&delete O.cause,!n)return w;var _=r("Error"),S=e((function(t,e){var n=f(m?e:t,void 0),r=m?new w(t):new w;return void 0!==n&&i(r,"message",n),d(r,S,r.stack,2),this&&u(O,this)&&l(r,this,S),arguments.length>g&&p(r,arguments[g]),r}));if(S.prototype=O,"Error"!==x?a?a(S,_):c(S,_,{name:true}):h&&y in w&&(s(S,w,y),s(S,w,"prepareStackTrace")),c(S,w),!v)try{O.name!==x&&i(O,"name",x),O.constructor=S;}catch(C){}return S}};},7476:function(t,e,n){var r=n(9160),o=n(9957),i=n(1432),u=n(1632),a=n(4356),c=n(3556),s=n(4316),l=n(92),f=n(2568),p=n(953),d=n(9972),h=n(8504),v=d("isConcatSpreadable"),m=h>=51||!o((function(){var t=[];return t[v]=false,t.concat()[0]!==t})),y=function(t){if(!u(t))return  false;var e=t[v];return void 0!==e?!!e:i(t)};r({target:"Array",proto:true,arity:1,forced:!m||!p("concat")},{concat:function(t){var e,n,r,o,i,u=a(this),p=f(u,0),d=0;for(e=-1,r=arguments.length;e<r;e++)if(y(i=-1===e?u:arguments[e]))for(o=c(i),s(d+o),n=0;n<o;n++,d++)n in i&&l(p,d,i[n]);else s(d+1),l(p,d++,i);return p.length=d,p}});},6932:function(t,e,n){var r=n(9160),o=n(3364).filter;r({target:"Array",proto:true,forced:!n(953)("filter")},{filter:function(t){return o(this,t,arguments.length>1?arguments[1]:void 0)}});},700:function(t,e,n){var r=n(9160),o=n(1664),i=n(5712),u=n(4096),a=n(1496),c=o([].join);r({target:"Array",proto:true,forced:i!==Object||!a("join",",")},{join:function(t){return c(u(this),void 0===t?",":t)}});},4456:function(t,e,n){var r=n(9160),o=n(3364).map;r({target:"Array",proto:true,forced:!n(953)("map")},{map:function(t){return o(this,t,arguments.length>1?arguments[1]:void 0)}});},4728:function(t,e,n){var r=n(9160),o=n(4356),i=n(3556),u=n(6728),a=n(4316);r({target:"Array",proto:true,arity:1,forced:n(9957)((function(){return 4294967297!==[].push.call({length:4294967296},1)}))||!function(){try{Object.defineProperty([],"length",{writable:!1}).push();}catch(t){return t instanceof TypeError}}()},{push:function(t){var e=o(this),n=i(e),r=arguments.length;a(n+r);for(var c=0;c<r;c++)e[n]=arguments[c],n++;return u(e,n),n}});},8752:function(t,e,n){var r=n(9160),o=n(6420),i=n(908),u=n(6488),a="WebAssembly",c=o[a],s=7!==new Error("e",{cause:7}).cause,l=function(t,e){var n={};n[t]=u(t,e,s),r({global:true,constructor:true,arity:1,forced:s},n);},f=function(t,e){if(c&&c[t]){var n={};n[t]=u(a+"."+t,e,s),r({target:a,stat:true,constructor:true,arity:1,forced:s},n);}};l("Error",(function(t){return function(e){return i(t,this,arguments)}})),l("EvalError",(function(t){return function(e){return i(t,this,arguments)}})),l("RangeError",(function(t){return function(e){return i(t,this,arguments)}})),l("ReferenceError",(function(t){return function(e){return i(t,this,arguments)}})),l("SyntaxError",(function(t){return function(e){return i(t,this,arguments)}})),l("TypeError",(function(t){return function(e){return i(t,this,arguments)}})),l("URIError",(function(t){return function(e){return i(t,this,arguments)}})),f("CompileError",(function(t){return function(e){return i(t,this,arguments)}})),f("LinkError",(function(t){return function(e){return i(t,this,arguments)}})),f("RuntimeError",(function(t){return function(e){return i(t,this,arguments)}}));},508:function(t,e,n){var r=n(3476),o=n(6208).EXISTS,i=n(1664),u=n(2544),a=Function.prototype,c=i(a.toString),s=/function\b(?:\s|\/\*[\S\s]*?\*\/|\/\/[^\n\r]*[\n\r]+)*([^\s(/]*)/,l=i(s.exec);r&&!o&&u(a,"name",{configurable:true,get:function(){try{return l(s,c(this))[1]}catch(t){return ""}}});},232:function(t,e,n){var r=n(9160),o=n(9292);r({target:"Object",stat:true,arity:2,forced:Object.assign!==o},{assign:o});},5443:function(t,e,n){var r=n(16),o=n(6076),i=n(7032);r||o(Object.prototype,"toString",i,{unsafe:true});},880:function(t,e,n){var r=n(9160),o=n(7680);r({target:"RegExp",proto:true,forced:/./.exec!==o},{exec:o});},9836:function(t,e,n){var r=n(8448),o=n(7176),i=n(3951),u=n(9760),a=n(7584),c=n(5016),s=n(5436),l=n(4504),f=n(4764),p=n(9092);o("match",(function(t,e,n){return [function(e){var n=s(this),o=u(e)?void 0:l(e,t);return o?r(o,e,n):new RegExp(e)[t](c(n))},function(t){var r=i(this),o=c(t),u=n(e,r,o);if(u.done)return u.value;if(!r.global)return p(r,o);var s=r.unicode;r.lastIndex=0;for(var l,d=[],h=0;null!==(l=p(r,o));){var v=c(l[0]);d[h]=v,""===v&&(r.lastIndex=f(o,a(r.lastIndex),s)),h++;}return 0===h?null:d}]}));},3536:function(t,e,n){var r=n(9160),o=n(6420),i=n(6100),u=n(3951),a=n(4328),c=n(7796),s=n(2544),l=n(92),f=n(9957),p=n(5152),d=n(9972),h=n(336).IteratorPrototype,v=n(3476),m=n(7048),y="constructor",g="Iterator",b=d("toStringTag"),x=TypeError,w=o[g],O=m||!a(w)||w.prototype!==h||!f((function(){w({});})),_=function(){if(i(this,h),c(this)===h)throw new x("Abstract class Iterator not directly constructable")},S=function(t,e){v?s(h,t,{configurable:true,get:function(){return e},set:function(e){if(u(this),this===h)throw new x("You can't redefine this property");p(this,t)?this[t]=e:l(this,t,e);}}):h[t]=e;};p(h,b)||S(b,g),!O&&p(h,y)&&h[y]!==Object||S(y,_),_.prototype=h,r({global:true,constructor:true,forced:O},{Iterator:_});},2144:function(t,e,n){var r=n(9160),o=n(8448),i=n(8952),u=n(3951),a=n(6752),c=n(9724),s=n(8696),l=n(7048),f=c((function(){for(var t,e,n=this.iterator,r=this.predicate,i=this.next;;){if(t=u(o(i,n)),this.done=!!t.done)return;if(e=t.value,s(n,r,[e,this.counter++],true))return e}}));r({target:"Iterator",proto:true,real:true,forced:l},{filter:function(t){return u(this),i(t),new f(a(this),{predicate:t})}});},9080:function(t,e,n){var r=n(9160),o=n(5792);r({target:"Iterator",proto:true,real:true,forced:n(7048)},{map:o});}},e={};function n(r){var o=e[r];if(void 0!==o)return o.exports;var i=e[r]={exports:{}};return t[r].call(i.exports,i,i.exports,n),i.exports}n.d=function(t,e){for(var r in e)n.o(e,r)&&!n.o(t,r)&&Object.defineProperty(t,r,{enumerable:true,get:e[r]});},n.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}(),n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)};var r={};return function(){n.d(r,{default:function(){return Q}});n(8752),n(6932),n(4456),n(508),n(232),n(5443),n(3536),n(2144),n(9080);var t=function(){},e={},o=[],i=[];function u(n,r){var u,a,c,s,l=i;for(s=arguments.length;s-- >2;)o.push(arguments[s]);for(r&&null!=r.children&&(o.length||o.push(r.children),delete r.children);o.length;)if((a=o.pop())&&void 0!==a.pop)for(s=a.length;s--;)o.push(a[s]);else "boolean"==typeof a&&(a=null),(c="function"!=typeof n)&&(null==a?a="":"number"==typeof a?a=String(a):"string"!=typeof a&&(c=false)),c&&u?l[l.length-1]+=a:l===i?l=[a]:l.push(a),u=c;var f=new t;return f.nodeName=n,f.children=l,f.attributes=null==r?void 0:r,f.key=null==r?void 0:r.key,void 0!==e.vnode&&e.vnode(f),f}function a(t,e){for(var n in e)t[n]=e[n];return t}function c(t,e){t&&("function"==typeof t?t(e):t.current=e);}var s="function"==typeof Promise?Promise.resolve().then.bind(Promise.resolve()):setTimeout;var l=/acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i,f=[];function p(t){!t._dirty&&(t._dirty=true)&&1==f.push(t)&&(e.debounceRendering||s)(d);}function d(){for(var t;t=f.pop();)t._dirty&&T(t);}function h(t,e,n){return "string"==typeof e||"number"==typeof e?void 0!==t.splitText:"string"==typeof e.nodeName?!t._componentConstructor&&v(t,e.nodeName):n||t._componentConstructor===e.nodeName}function v(t,e){return t.normalizedNodeName===e||t.nodeName.toLowerCase()===e.toLowerCase()}function m(t){var e=a({},t.attributes);e.children=t.children;var n=t.nodeName.defaultProps;if(void 0!==n)for(var r in n) void 0===e[r]&&(e[r]=n[r]);return e}function y(t){var e=t.parentNode;e&&e.removeChild(t);}function g(t,e,n,r,o){if("className"===e&&(e="class"),"key"===e);else if("ref"===e)c(n,null),c(r,t);else if("class"!==e||o)if("style"===e){if(r&&"string"!=typeof r&&"string"!=typeof n||(t.style.cssText=r||""),r&&"object"==typeof r){if("string"!=typeof n)for(var i in n)i in r||(t.style[i]="");for(var i in r)t.style[i]="number"==typeof r[i]&&false===l.test(i)?r[i]+"px":r[i];}}else if("dangerouslySetInnerHTML"===e)r&&(t.innerHTML=r.__html||"");else if("o"==e[0]&&"n"==e[1]){var u=e!==(e=e.replace(/Capture$/,""));e=e.toLowerCase().substring(2),r?n||t.addEventListener(e,b,u):t.removeEventListener(e,b,u),(t._listeners||(t._listeners={}))[e]=r;}else if("list"!==e&&"type"!==e&&!o&&e in t){try{t[e]=null==r?"":r;}catch(s){}null!=r&&false!==r||"spellcheck"==e||t.removeAttribute(e);}else {var a=o&&e!==(e=e.replace(/^xlink:?/,""));null==r||false===r?a?t.removeAttributeNS("http://www.w3.org/1999/xlink",e.toLowerCase()):t.removeAttribute(e):"function"!=typeof r&&(a?t.setAttributeNS("http://www.w3.org/1999/xlink",e.toLowerCase(),r):t.setAttribute(e,r));}else t.className=r||"";}function b(t){return this._listeners[t.type](e.event&&e.event(t)||t)}var x=[],w=0,O=false,_=false;function S(){for(var t;t=x.shift();)e.afterMount&&e.afterMount(t),t.componentDidMount&&t.componentDidMount();}function C(t,e,n,r,o,i){w++||(O=null!=o&&void 0!==o.ownerSVGElement,_=null!=t&&!("__preactattr_"in t));var u=E(t,e,n,r,i);return o&&u.parentNode!==o&&o.appendChild(u),--w||(_=false,i||S()),u}function E(t,e,n,r,o){var i=t,u=O;if(null!=e&&"boolean"!=typeof e||(e=""),"string"==typeof e||"number"==typeof e)return t&&void 0!==t.splitText&&t.parentNode&&(!t._component||o)?t.nodeValue!=e&&(t.nodeValue=e):(i=document.createTextNode(e),t&&(t.parentNode&&t.parentNode.replaceChild(i,t),I(t,true))),i.__preactattr_=true,i;var a,c,s=e.nodeName;if("function"==typeof s)return function(t,e,n,r){var o=t&&t._component,i=o,u=t,a=o&&t._componentConstructor===e.nodeName,c=a,s=m(e);for(;o&&!c&&(o=o._parentComponent);)c=o.constructor===e.nodeName;o&&c&&(!r||o._component)?(k(o,s,3,n,r),t=o.base):(i&&!a&&(R(i),t=u=null),o=P(e.nodeName,s,n),t&&!o.nextBase&&(o.nextBase=t,u=null),k(o,s,1,n,r),t=o.base,u&&t!==u&&(u._component=null,I(u,false)));return t}(t,e,n,r);if(O="svg"===s||"foreignObject"!==s&&O,s=String(s),(!t||!v(t,s))&&(a=s,(c=O?document.createElementNS("http://www.w3.org/2000/svg",a):document.createElement(a)).normalizedNodeName=a,i=c,t)){for(;t.firstChild;)i.appendChild(t.firstChild);t.parentNode&&t.parentNode.replaceChild(i,t),I(t,true);}var l=i.firstChild,f=i.__preactattr_,p=e.children;if(null==f){f=i.__preactattr_={};for(var d=i.attributes,b=d.length;b--;)f[d[b].name]=d[b].value;}return !_&&p&&1===p.length&&"string"==typeof p[0]&&null!=l&&void 0!==l.splitText&&null==l.nextSibling?l.nodeValue!=p[0]&&(l.nodeValue=p[0]):(p&&p.length||null!=l)&&function(t,e,n,r,o){var i,u,a,c,s,l=t.childNodes,f=[],p={},d=0,v=0,m=l.length,g=0,b=e?e.length:0;if(0!==m)for(var x=0;x<m;x++){var w=l[x],O=w.__preactattr_;null!=(_=b&&O?w._component?w._component.__key:O.key:null)?(d++,p[_]=w):(O||(void 0!==w.splitText?!o||w.nodeValue.trim():o))&&(f[g++]=w);}if(0!==b)for(x=0;x<b;x++){var _;if(s=null,null!=(_=(c=e[x]).key))d&&void 0!==p[_]&&(s=p[_],p[_]=void 0,d--);else if(v<g)for(i=v;i<g;i++)if(void 0!==f[i]&&h(u=f[i],c,o)){s=u,f[i]=void 0,i===g-1&&g--,i===v&&v++;break}s=E(s,c,n,r),a=l[x],s&&s!==t&&s!==a&&(null==a?t.appendChild(s):s===a.nextSibling?y(a):t.insertBefore(s,a));}if(d)for(var x in p) void 0!==p[x]&&I(p[x],false);for(;v<=g;) void 0!==(s=f[g--])&&I(s,false);}(i,p,n,r,_||null!=f.dangerouslySetInnerHTML),function(t,e,n){var r;for(r in n)e&&null!=e[r]||null==n[r]||g(t,r,n[r],n[r]=void 0,O);for(r in e)"children"===r||"innerHTML"===r||r in n&&e[r]===("value"===r||"checked"===r?t[r]:n[r])||g(t,r,n[r],n[r]=e[r],O);}(i,e.attributes,f),O=u,i}function I(t,e){var n=t._component;n?R(n):(null!=t.__preactattr_&&c(t.__preactattr_.ref,null),false!==e&&null!=t.__preactattr_||y(t),j(t));}function j(t){for(t=t.lastChild;t;){var e=t.previousSibling;I(t,true),t=e;}}var A=[];function P(t,e,n){var r,o=A.length;for(t.prototype&&t.prototype.render?(r=new t(e,n),M.call(r,e,n)):((r=new M(e,n)).constructor=t,r.render=N);o--;)if(A[o].constructor===t)return r.nextBase=A[o].nextBase,A.splice(o,1),r;return r}function N(t,e,n){return this.constructor(t,n)}function k(t,n,r,o,i){t._disable||(t._disable=true,t.__ref=n.ref,t.__key=n.key,delete n.ref,delete n.key,void 0===t.constructor.getDerivedStateFromProps&&(!t.base||i?t.componentWillMount&&t.componentWillMount():t.componentWillReceiveProps&&t.componentWillReceiveProps(n,o)),o&&o!==t.context&&(t.prevContext||(t.prevContext=t.context),t.context=o),t.prevProps||(t.prevProps=t.props),t.props=n,t._disable=false,0!==r&&(1!==r&&false===e.syncComponentUpdates&&t.base?p(t):T(t,1,i)),c(t.__ref,t));}function T(t,n,r,o){if(!t._disable){var i,u,c,s=t.props,l=t.state,f=t.context,p=t.prevProps||s,d=t.prevState||l,h=t.prevContext||f,v=t.base,y=t.nextBase,g=v||y,b=t._component,O=false,_=h;if(t.constructor.getDerivedStateFromProps&&(l=a(a({},l),t.constructor.getDerivedStateFromProps(s,l)),t.state=l),v&&(t.props=p,t.state=d,t.context=h,2!==n&&t.shouldComponentUpdate&&false===t.shouldComponentUpdate(s,l,f)?O=true:t.componentWillUpdate&&t.componentWillUpdate(s,l,f),t.props=s,t.state=l,t.context=f),t.prevProps=t.prevState=t.prevContext=t.nextBase=null,t._dirty=false,!O){i=t.render(s,l,f),t.getChildContext&&(f=a(a({},f),t.getChildContext())),v&&t.getSnapshotBeforeUpdate&&(_=t.getSnapshotBeforeUpdate(p,d));var E,j,A=i&&i.nodeName;if("function"==typeof A){var N=m(i);(u=b)&&u.constructor===A&&N.key==u.__key?k(u,N,1,f,false):(E=u,t._component=u=P(A,N,f),u.nextBase=u.nextBase||y,u._parentComponent=t,k(u,N,0,f,false),T(u,1,r,true)),j=u.base;}else c=g,(E=b)&&(c=t._component=null),(g||1===n)&&(c&&(c._component=null),j=C(c,i,f,r||!v,g&&g.parentNode,true));if(g&&j!==g&&u!==b){var M=g.parentNode;M&&j!==M&&(M.replaceChild(j,g),E||(g._component=null,I(g,false)));}if(E&&R(E),t.base=j,j&&!o){for(var L=t,D=t;D=D._parentComponent;)(L=D).base=j;j._component=L,j._componentConstructor=L.constructor;}}for(!v||r?x.push(t):O||(t.componentDidUpdate&&t.componentDidUpdate(p,d,_),e.afterUpdate&&e.afterUpdate(t));t._renderCallbacks.length;)t._renderCallbacks.pop().call(t);w||o||S();}}function R(t){e.beforeUnmount&&e.beforeUnmount(t);var n=t.base;t._disable=true,t.componentWillUnmount&&t.componentWillUnmount(),t.base=null;var r=t._component;r?R(r):n&&(null!=n.__preactattr_&&c(n.__preactattr_.ref,null),t.nextBase=n,y(n),A.push(t),j(n)),c(t.__ref,null);}function M(t,e){this._dirty=true,this.context=e,this.props=t,this.state=this.state||{},this._renderCallbacks=[];}function L(t,e,n){return C(n,t,{},false,e,false)}a(M.prototype,{setState:function(t,e){this.prevState||(this.prevState=this.state),this.state=a(a({},this.state),"function"==typeof t?t(this.state,this.props):t),e&&this._renderCallbacks.push(e),p(this);},forceUpdate:function(t){t&&this._renderCallbacks.push(t),T(this,2);},render:function(){}});n(700),n(4728),n(880),n(9836),n(7476);function D(t,e){return D=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t},D(t,e)}var B=function(t){var e,n;function r(){for(var e,n=arguments.length,r=new Array(n),o=0;o<n;o++)r[o]=arguments[o];return (e=t.call.apply(t,[this].concat(r))||this).state={bump:false,debounced:false},e}n=t,(e=r).prototype=Object.create(n.prototype),e.prototype.constructor=e,D(e,n);var o=r.prototype;return o.componentWillMount=function(){var t,e,r,o=this;this.debounceStatusUpdate=(t=function(){if(!o.state.debounced){var t=!o.props.isInFocus||o.props.validChoiceMade;o.setState((function(e){return {bump:!e.bump,debounced:true,silenced:t}}));}},e=1400,function(){var o=this,i=arguments;clearTimeout(r),r=setTimeout((function(){r=null,t.apply(o,i);}),e);});},o.componentWillReceiveProps=function(t){t.queryLength;this.setState({debounced:false});},o.render=function(){var t=this.props,e=t.id,n=t.length,r=t.queryLength,o=t.minQueryLength,i=t.selectedOption,a=t.selectedOptionIndex,c=t.tQueryTooShort,s=t.tNoResults,l=t.tSelectedOption,f=t.tResults,p=t.className,d=this.state,h=d.bump,v=d.debounced,m=d.silenced,y=r<o,g=0===n,b=i?l(i,n,a):"",x=null;return x=y?c(o):g?s():f(n,b),this.debounceStatusUpdate(),u("div",{className:p,style:{border:"0",clip:"rect(0 0 0 0)",height:"1px",marginBottom:"-1px",marginRight:"-1px",overflow:"hidden",padding:"0",position:"absolute",whiteSpace:"nowrap",width:"1px"}},u("div",{id:e+"__status--A",role:"status","aria-atomic":"true","aria-live":"polite"},!m&&v&&h?x:""),u("div",{id:e+"__status--B",role:"status","aria-atomic":"true","aria-live":"polite"},m||!v||h?"":x))},r}(M);B.defaultProps={tQueryTooShort:function(t){return "Type in "+t+" or more characters for results"},tNoResults:function(){return "No search results"},tSelectedOption:function(t,e,n){return t+" "+(n+1)+" of "+e+" is highlighted"},tResults:function(t,e){return t+" "+(1===t?"result":"results")+" "+(1===t?"is":"are")+" available. "+e}};var F=function(t){return u("svg",{version:"1.1",xmlns:"http://www.w3.org/2000/svg",className:t.className,focusable:"false"},u("g",{stroke:"none",fill:"none","fill-rule":"evenodd"},u("polygon",{fill:"#000000",points:"0 0 22 0 11 17"})))};function U(){return U=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r]);}return t},U.apply(this,arguments)}function V(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function q(t,e){return q=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t},q(t,e)}var W={13:"enter",27:"escape",32:"space",38:"up",40:"down"};function H(){return "undefined"!=typeof navigator&&!(!navigator.userAgent.match(/(iPod|iPhone|iPad)/g)||!navigator.userAgent.match(/AppleWebKit/g))}var K=function(t){var e,n;function r(e){var n;return (n=t.call(this,e)||this).elementReferences={},n.state={focused:null,hovered:null,menuOpen:false,options:e.defaultValue?[e.defaultValue]:[],query:e.defaultValue,validChoiceMade:false,selected:null,ariaHint:true},n.handleComponentBlur=n.handleComponentBlur.bind(V(n)),n.handleKeyDown=n.handleKeyDown.bind(V(n)),n.handleUpArrow=n.handleUpArrow.bind(V(n)),n.handleDownArrow=n.handleDownArrow.bind(V(n)),n.handleEnter=n.handleEnter.bind(V(n)),n.handlePrintableKey=n.handlePrintableKey.bind(V(n)),n.handleListMouseLeave=n.handleListMouseLeave.bind(V(n)),n.handleOptionBlur=n.handleOptionBlur.bind(V(n)),n.handleOptionClick=n.handleOptionClick.bind(V(n)),n.handleOptionFocus=n.handleOptionFocus.bind(V(n)),n.handleOptionMouseDown=n.handleOptionMouseDown.bind(V(n)),n.handleOptionMouseEnter=n.handleOptionMouseEnter.bind(V(n)),n.handleInputBlur=n.handleInputBlur.bind(V(n)),n.handleInputChange=n.handleInputChange.bind(V(n)),n.handleInputClick=n.handleInputClick.bind(V(n)),n.handleInputFocus=n.handleInputFocus.bind(V(n)),n.pollInputElement=n.pollInputElement.bind(V(n)),n.getDirectInputChanges=n.getDirectInputChanges.bind(V(n)),n}n=t,(e=r).prototype=Object.create(n.prototype),e.prototype.constructor=e,q(e,n);var o=r.prototype;return o.isQueryAnOption=function(t,e){var n=this;return  -1!==e.map((function(t){return n.templateInputValue(t).toLowerCase()})).indexOf(t.toLowerCase())},o.componentDidMount=function(){this.pollInputElement();},o.componentWillUnmount=function(){clearTimeout(this.$pollInput);},o.pollInputElement=function(){var t=this;this.getDirectInputChanges(),this.$pollInput=setTimeout((function(){t.pollInputElement();}),100);},o.getDirectInputChanges=function(){var t=this.elementReferences[-1];t&&t.value!==this.state.query&&this.handleInputChange({target:{value:t.value}});},o.componentDidUpdate=function(t,e){var n=this.state.focused,r=null===n,o=e.focused!==n;o&&!r&&this.elementReferences[n].focus();var i=-1===n,u=o&&null===e.focused;if(i&&u){var a=this.elementReferences[n];a.setSelectionRange(0,a.value.length);}},o.hasAutoselect=function(){return !H()&&this.props.autoselect},o.templateInputValue=function(t){var e=this.props.templates&&this.props.templates.inputValue;return e?e(t):t},o.templateSuggestion=function(t){var e=this.props.templates&&this.props.templates.suggestion;return e?e(t):t},o.handleComponentBlur=function(t){var e,n=this.state,r=n.options,o=n.query,i=n.selected;this.props.confirmOnBlur?(e=t.query||o,this.props.onConfirm(r[i])):e=o,this.setState({focused:null,menuOpen:t.menuOpen||false,query:e,selected:null,validChoiceMade:this.isQueryAnOption(e,r)});},o.handleListMouseLeave=function(t){this.setState({hovered:null});},o.handleOptionBlur=function(t,e){var n=this.state,r=n.focused,o=n.menuOpen,i=n.options,u=n.selected,a=null===t.relatedTarget,c=t.relatedTarget===this.elementReferences[-1],s=r!==e&&-1!==r;if(!s&&a||!(s||c)){var l=o&&H();this.handleComponentBlur({menuOpen:l,query:this.templateInputValue(i[u])});}},o.handleInputBlur=function(t){var e=this.state,n=e.focused,r=e.menuOpen,o=e.options,i=e.query,u=e.selected;if(!(-1!==n)){var a=r&&H(),c=H()?i:this.templateInputValue(o[u]);this.handleComponentBlur({menuOpen:a,query:c});}},o.handleInputChange=function(t){var e=this,n=this.props,r=n.minLength,o=n.source,i=n.showAllValues,u=this.hasAutoselect(),a=t.target.value,c=0===a.length,s=this.state.query!==a,l=a.length>=r;this.setState({query:a,ariaHint:c}),i||!c&&s&&l?o(a,(function(t){var n=t.length>0;e.setState({menuOpen:n,options:t,selected:u&&n?0:-1,validChoiceMade:false});})):!c&&l||this.setState({menuOpen:false,options:[]});},o.handleInputClick=function(t){this.handleInputChange(t);},o.handleInputFocus=function(t){var e=this.state,n=e.query,r=e.validChoiceMade,o=e.options,i=this.props.minLength,u=!r&&n.length>=i&&o.length>0;u?this.setState((function(t){var e=t.menuOpen;return {focused:-1,menuOpen:u||e,selected:-1}})):this.setState({focused:-1});},o.handleOptionFocus=function(t){this.setState({focused:t,hovered:null,selected:t});},o.handleOptionMouseEnter=function(t,e){H()||this.setState({hovered:e});},o.handleOptionClick=function(t,e){var n=this.state.options[e],r=this.templateInputValue(n);this.props.onConfirm(n),this.setState({focused:-1,hovered:null,menuOpen:false,query:r,selected:-1,validChoiceMade:true}),this.forceUpdate();},o.handleOptionMouseDown=function(t){t.preventDefault();},o.handleUpArrow=function(t){t.preventDefault();var e=this.state,n=e.menuOpen,r=e.selected;-1!==r&&n&&this.handleOptionFocus(r-1);},o.handleDownArrow=function(t){var e=this;if(t.preventDefault(),this.props.showAllValues&&false===this.state.menuOpen)t.preventDefault(),this.props.source("",(function(t){e.setState({menuOpen:true,options:t,selected:0,focused:0,hovered:null});}));else if(true===this.state.menuOpen){var n=this.state,r=n.menuOpen,o=n.options,i=n.selected;i!==o.length-1&&r&&this.handleOptionFocus(i+1);}},o.handleSpace=function(t){var e=this;this.props.showAllValues&&false===this.state.menuOpen&&""===this.state.query&&(t.preventDefault(),this.props.source("",(function(t){e.setState({menuOpen:true,options:t});}))),-1!==this.state.focused&&(t.preventDefault(),this.handleOptionClick(t,this.state.focused));},o.handleEnter=function(t){this.state.menuOpen&&(t.preventDefault(),this.state.selected>=0&&this.handleOptionClick(t,this.state.selected));},o.handlePrintableKey=function(t){var e=this.elementReferences[-1];t.target===e||e.focus();},o.handleKeyDown=function(t){switch(W[t.keyCode]){case "up":this.handleUpArrow(t);break;case "down":this.handleDownArrow(t);break;case "space":this.handleSpace(t);break;case "enter":this.handleEnter(t);break;case "escape":this.handleComponentBlur({query:this.state.query});break;default:((e=t.keyCode)>47&&e<58||32===e||8===e||e>64&&e<91||e>95&&e<112||e>185&&e<193||e>218&&e<223)&&this.handlePrintableKey(t);}var e;},o.render=function(){var t,e=this,n=this.props,r=n.cssNamespace,o=n.displayMenu,i=n.id,a=n.minLength,c=n.name,s=n.placeholder,l=n.required,f=n.showAllValues,p=n.tNoResults,d=n.tStatusQueryTooShort,h=n.tStatusNoResults,v=n.tStatusSelectedOption,m=n.tStatusResults,y=n.tAssistiveHint,g=n.dropdownArrow,b=n.menuAttributes,x=n.inputClasses,w=n.hintClasses,O=n.menuClasses,_=this.state,S=_.focused,C=_.hovered,E=_.menuOpen,I=_.options,j=_.query,A=_.selected,P=_.ariaHint,N=_.validChoiceMade,k=this.hasAutoselect(),T=-1===S,R=0===I.length,M=0!==j.length,L=j.length>=a,D=this.props.showNoOptionsFound&&T&&R&&M&&L,F=r+"__wrapper",V=r+"__status",q=r+"__dropdown-arrow-down",W=-1!==S&&null!==S,K=r+"__option",z=r+"__hint",G=this.templateInputValue(I[A]),Q=G&&0===G.toLowerCase().indexOf(j.toLowerCase())&&k?j+G.substr(j.length):"",$=i+"__assistiveHint",Y={"aria-describedby":P?$:null,"aria-expanded":E?"true":"false","aria-activedescendant":W?i+"__option--"+S:null,"aria-controls":i+"__listbox","aria-autocomplete":this.hasAutoselect()?"both":"list"};f&&"string"==typeof(t=g({className:q}))&&(t=u("div",{className:r+"__dropdown-arrow-down-wrapper",dangerouslySetInnerHTML:{__html:t}}));var X=r+"__input",J=[X,this.props.showAllValues?X+"--show-all-values":X+"--default"];null!==S&&J.push(X+"--focused"),x&&J.push(x);var Z=r+"__menu",tt=[Z,Z+"--"+o,Z+"--"+(E||D?"visible":"hidden")];O&&tt.push(O),(null!=b&&b.class||null!=b&&b.className)&&tt.push((null==b?void 0:b.class)||(null==b?void 0:b.className));var et=Object.assign({"aria-labelledby":i},b,{id:i+"__listbox",role:"listbox",className:tt.join(" "),onMouseLeave:this.handleListMouseLeave});return delete et.class,u("div",{className:F,onKeyDown:this.handleKeyDown},u(B,{id:i,length:I.length,queryLength:j.length,minQueryLength:a,selectedOption:this.templateInputValue(I[A]),selectedOptionIndex:A,validChoiceMade:N,isInFocus:null!==this.state.focused,tQueryTooShort:d,tNoResults:h,tSelectedOption:v,tResults:m,className:V}),Q&&u("span",null,u("input",{className:[z,null===w?x:w].filter(Boolean).join(" "),readonly:true,tabIndex:"-1",value:Q})),u("input",U({},Y,{autoComplete:"off",className:J.join(" "),id:i,onClick:this.handleInputClick,onBlur:this.handleInputBlur},{onInput:this.handleInputChange},{onFocus:this.handleInputFocus,name:c,placeholder:s,ref:function(t){e.elementReferences[-1]=t;},type:"text",role:"combobox",required:l,value:j})),t,u("ul",et,I.map((function(t,n){var r=(-1===S?A===n:S===n)&&null===C?" "+K+"--focused":"",o=n%2?" "+K+"--odd":"",a=H()?"<span id="+i+"__option-suffix--"+n+' style="border:0;clip:rect(0 0 0 0);height:1px;marginBottom:-1px;marginRight:-1px;overflow:hidden;padding:0;position:absolute;whiteSpace:nowrap;width:1px"> '+(n+1)+" of "+I.length+"</span>":"";return u("li",{"aria-selected":S===n?"true":"false",className:""+K+r+o,dangerouslySetInnerHTML:{__html:e.templateSuggestion(t)+a},id:i+"__option--"+n,key:n,onBlur:function(t){return e.handleOptionBlur(t,n)},onClick:function(t){return e.handleOptionClick(t,n)},onMouseDown:e.handleOptionMouseDown,onMouseEnter:function(t){return e.handleOptionMouseEnter(t,n)},ref:function(t){e.elementReferences[n]=t;},role:"option",tabIndex:"-1","aria-posinset":n+1,"aria-setsize":I.length})})),D&&u("li",{className:K+" "+K+"--no-results",role:"option","aria-disabled":"true"},p())),u("span",{id:$,style:{display:"none"}},y()))},r}(M);function z(t){if(!t.element)throw new Error("element is not defined");if(!t.id)throw new Error("id is not defined");if(!t.source)throw new Error("source is not defined");Array.isArray(t.source)&&(t.source=G(t.source)),L(u(K,t),t.element);}K.defaultProps={autoselect:false,cssNamespace:"autocomplete",defaultValue:"",displayMenu:"inline",minLength:0,name:"input-autocomplete",placeholder:"",onConfirm:function(){},confirmOnBlur:true,showNoOptionsFound:true,showAllValues:false,required:false,tNoResults:function(){return "No results found"},tAssistiveHint:function(){return "When autocomplete results are available use up and down arrows to review and enter to select.  Touch device users, explore by touch or with swipe gestures."},dropdownArrow:F,menuAttributes:{},inputClasses:null,hintClasses:null,menuClasses:null};var G=function(t){return function(e,n){n(t.filter((function(t){return  -1!==t.toLowerCase().indexOf(e.toLowerCase())})));}};z.enhanceSelectElement=function(t){if(!t.selectElement)throw new Error("selectElement is not defined");if(!t.source){var e=[].filter.call(t.selectElement.options,(function(e){return e.value||t.preserveNullOptions}));t.source=e.map((function(t){return t.textContent||t.innerText}));}if(t.onConfirm=t.onConfirm||function(e){var n=[].filter.call(t.selectElement.options,(function(t){return (t.textContent||t.innerText)===e}))[0];n&&(n.selected=true);},t.selectElement.value||void 0===t.defaultValue){var n=t.selectElement.options[t.selectElement.options.selectedIndex];t.defaultValue=n.textContent||n.innerText;} void 0===t.name&&(t.name=""),void 0===t.id&&(void 0===t.selectElement.id?t.id="":t.id=t.selectElement.id),void 0===t.autoselect&&(t.autoselect=true);var r=document.createElement("div");t.selectElement.parentNode.insertBefore(r,t.selectElement),z(Object.assign({},t,{element:r})),t.selectElement.style.display="none",t.selectElement.id=t.selectElement.id+"-select";};var Q=z;}(),r=r.default}()}));
  		
  	} (accessibleAutocomplete_min));
  	return accessibleAutocomplete_min.exports;
  }

  var accessibleAutocomplete_minExports = requireAccessibleAutocomplete_min();
  var accessibleAutocomplete = /*@__PURE__*/getDefaultExportFromCjs(accessibleAutocomplete_minExports);

  class SiteSearchElement extends HTMLElement {
    constructor() {
      super();

      this.statusMessage = null;
      this.searchInputId = 'app-site-search__input';
      this.searchIndex = null;
      this.searchIndexUrl = this.getAttribute('index');
      this.searchLabel = this.getAttribute('label');
      this.searchResults = [];
      this.searchTimeout = 10;
      this.sitemapLink = this.querySelector('.app-site-search__link');
    }

    async fetchSearchIndex(indexUrl) {
      this.statusMessage = 'Loading search index';

      try {
        const response = await fetch(indexUrl, {
          signal: AbortSignal.timeout(this.searchTimeout * 1000)
        });

        if (!response.ok) {
          throw Error('Search index not found')
        }

        const json = await response.json();
        this.statusMessage = 'No results found';
        this.searchIndex = json;
      } catch (error) {
        this.statusMessage = 'Failed to load search index';
        console.error(this.statusMessage, error.message);
      }
    }

    findResults(searchQuery, searchIndex) {
      return searchIndex.filter((item) => {
        const regex = new RegExp(searchQuery, 'gi');
        return item.title.match(regex) || item.templateContent.match(regex)
      })
    }

    renderResults(query, populateResults) {
      if (!this.searchIndex) {
        return populateResults(this.searchResults)
      }

      this.searchResults = this.findResults(query, this.searchIndex).reverse();

      populateResults(this.searchResults);
    }

    handleOnConfirm(result) {
      const path = result.url;
      if (!path) {
        return
      }

      window.location.href = path;
    }

    handleNoResults() {
      return this.statusMessage
    }

    inputValueTemplate(result) {
      if (result) {
        return result.title
      }
    }

    searchTemplate() {
      const labelElement = document.createElement('label');
      labelElement.classList.add('govuk-visually-hidden');
      labelElement.htmlFor = this.searchInputId;
      labelElement.textContent = this.searchLabel;

      const searchElement = document.createElement('search');
      searchElement.append(labelElement);

      return searchElement
    }

    resultTemplate(result) {
      if (result) {
        const element = document.createElement('span');
        element.textContent = result.title;

        if (result.hasFrontmatterDate || result.section) {
          const section = document.createElement('span');
          section.className = 'app-site-search--section';

          section.innerHTML =
            result.hasFrontmatterDate && result.section
              ? `${result.section}<br>${result.date}`
              : result.section || result.date;

          element.appendChild(section);
        }

        return element.innerHTML
      }
    }

    async connectedCallback() {
      await this.fetchSearchIndex(this.searchIndexUrl);

      // Remove fallback link to sitemap
      if (this.sitemapLink) {
        this.sitemapLink.remove();
      }

      // Add `search` element with `label`
      const search = this.searchTemplate();
      this.append(search);

      accessibleAutocomplete({
        element: search,
        id: this.searchInputId,
        cssNamespace: 'app-site-search',
        displayMenu: 'overlay',
        minLength: 2,
        placeholder: this.searchLabel,
        confirmOnBlur: false,
        autoselect: true,
        source: this.renderResults.bind(this),
        onConfirm: this.handleOnConfirm,
        templates: {
          inputValue: this.inputValueTemplate,
          suggestion: this.resultTemplate
        },
        tNoResults: this.handleNoResults.bind(this)
      });
    }
  }

  // Initiate custom elements
  customElements.define('site-search', SiteSearchElement);

  // Initiate scripts on page load
  document.addEventListener('DOMContentLoaded', () => {
    initAll();
  });

})();
