import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
  ChangeDetectionStrategy,
  computed,
  output,
  input,
  Signal,
  WritableSignal,
  effect,
  OnInit,
  HostBinding,
  Injector,
  DoCheck,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  NgControl
} from '@angular/forms';
import { AsYouType, CountryCode, validatePhoneNumberLength, getCountryCallingCode } from 'libphonenumber-js/min';
import { Subject } from 'rxjs';
import { MatFormFieldControl } from '@angular/material/form-field';
import { NgxsmkTelInputService } from './ngxsmk-tel-input.service';
import { CountryMap, IntlTelI18n } from './types';
import { createPhoneInputState, createFormattedValueSignal, createValidationStatusSignal, createPhoneMetadataSignal, PhoneInputState } from './signals';
import { PhoneIntelligenceService, CarrierInfo, FormatSuggestion } from './phone-intelligence.service';

/**
 * Interface for custom theme colors.
 */
export interface ColorPalette {
  background?: string;
  foreground?: string;
  border?: string;
  borderHover?: string;
  ring?: string;
  placeholder?: string;
}

/**
 * Type definition for intl-tel-input instance.
 * Matches the actual implementation of the Iti class.
 */
type IntlTelInstance = {
  destroy(): void;
  setNumber(aNumber: string): void;
  setCountry(countryCode: string): void;
  getSelectedCountryData(): { iso2?: string; dialCode?: string };
  promise?: Promise<unknown>;
};

/**
 * Type for intl-tel-input configuration options.
 */
interface IntlTelInputConfig {
  initialCountry: string;
  countryOrder: string[];
  onlyCountries?: string[];
  excludeCountries?: string[];
  nationalMode: boolean;
  allowDropdown: boolean;
  separateDialCode: boolean;
  geoIpLookup: (callback: (iso2: string) => void) => void;
  autoPlaceholder: 'off' | 'polite' | 'aggressive';
  utilsScript?: string;
  customPlaceholder?: (example: string, country: unknown) => string;
  i18n?: IntlTelI18n;
  localizedCountries?: Record<string, string>;
  dropdownContainer?: HTMLElement;
}

/**
 * Type for clipboard event with data property.
 */
interface ClipboardEventWithData extends ClipboardEvent {
  clipboardData: DataTransfer | null;
}

/**
 * Type for beforeinput event with data and inputType properties.
 */
interface BeforeInputEvent extends Event {
  data: string | null;
  inputType: string;
}

/**
 * Angular telephone input component with country dropdown, flags, and robust validation/formatting.
 * Wraps intl-tel-input for the UI and libphonenumber-js for parsing/validation.
 * Implements ControlValueAccessor for seamless integration with Angular Forms.
 * 
 * **Compatibility**: Works with Angular 17+ and supports both:
 * - Zone.js (traditional Angular change detection)
 * - Zoneless Angular (Angular 18+ without Zone.js)
 * - All data binding types (property, event, two-way)
 * - Reactive Forms and Template-driven Forms
 * - Signals (Angular 16+)
 * 
 * **Mobile Responsive**: Fully optimized for mobile devices with:
 * - Touch-friendly tap targets (44x44px minimum)
 * - Prevents iOS zoom (16px font size)
 * - Responsive dropdown that adapts to viewport
 * - Safe area insets support for notched devices
 * - Optimized touch interactions
 * 
 * @example
 * ```html
 * <ngxsmk-tel-input
 *   formControlName="phone"
 *   label="Phone Number"
 *   [initialCountry]="'US'"
 *   [preferredCountries]="['US','GB']">
 * </ngxsmk-tel-input>
 * ```
 */
@Component({
  selector: 'ngxsmk-tel-input',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
      <div class="ngxsmk-tel"
         [class.disabled]="(disabledSignal() ?? disabled) || isNativelyDisabled"
         [class.ngxsmk-tel--hide-flags]="!(showFlagsSignal() ?? showFlags)"
         [attr.data-size]="(sizeSignal() ?? size)"
         [attr.data-variant]="(variantSignal() ?? variant)"
         [attr.dir]="dir"
         [attr.aria-label]="label || 'Phone number input'">
      @if (label) {
        <label class="ngxsmk-tel__label" [for]="resolvedId">{{ label }}</label>
      }

      <div class="ngxsmk-tel__wrap" 
           [class.has-error]="showError()"
           [attr.aria-describedby]="getAriaDescribedBy()">
        <div class="ngxsmk-tel-input__wrapper">
          <input
            #telInput
            type="tel"
            [class]="'ngxsmk-tel-input__control ' + (cssClassSignal() ?? cssClass || '')"
            [id]="resolvedId"
            [attr.name]="name || null"
            [attr.placeholder]="placeholder || null"
            [attr.autocomplete]="autocomplete"
            [attr.inputmode]="digitsOnly ? 'numeric' : 'tel'"
            [disabled]="(disabledSignal() ?? disabled)"
            [attr.aria-invalid]="showError() ? 'true' : 'false'"
            [attr.aria-required]="isRequired ? 'true' : null"
            [attr.aria-describedby]="getAriaDescribedBy()"
            [attr.aria-errormessage]="showError() && resolvedErrorText() && (showErrorMsgSignal() ?? showErrorMsg) ? resolvedId + '-error' : null"
            (blur)="onBlur()"
            (focus)="onFocus()"
          />
        </div>

        @if (showClear && (rawValue() || currentRaw())) {
          <button type="button"
                  class="ngxsmk-tel__clear"
                  (click)="clearInput()"
                  [attr.aria-label]="clearAriaLabel"
                  [attr.aria-describedby]="resolvedId">
            <svg class="ngxsmk-tel__clear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        }
      </div>

      @if (hint && !showError()) {
        <div class="ngxsmk-tel__hint" [id]="resolvedId + '-hint'">{{ hint }}</div>
      }
      @if (showError() && resolvedErrorText() && (showErrorMsgSignal() ?? showErrorMsg)) {
        <div class="ngxsmk-tel__error" 
             [id]="resolvedId + '-error'"
             role="alert"
             [attr.aria-live]="'polite'">{{ resolvedErrorText() }}</div>
      }
      <div [id]="resolvedId + '-status'" 
           class="sr-only" 
           role="status" 
           [attr.aria-live]="'polite'"
           [attr.aria-atomic]="true">{{ getAriaStatusMessage() }}</div>
    </div>
  `,
  styleUrls: ['./ngxsmk-tel-input.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgxsmkTelInputComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => NgxsmkTelInputComponent), multi: true },
    { provide: MatFormFieldControl, useExisting: forwardRef(() => NgxsmkTelInputComponent) }
  ]
})
export class NgxsmkTelInputComponent implements OnInit, DoCheck, AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor, Validator, MatFormFieldControl<string | null> {
  @ViewChild('telInput', { static: true }) inputRef!: ElementRef<HTMLInputElement>;

  private readonly injector = inject(Injector);
  ngControl: NgControl | null = null;

  @HostBinding('class.ion-touched') get ionTouched() { return this.ngControl?.touched ?? false; }
  @HostBinding('class.ion-untouched') get ionUntouched() { return this.ngControl?.untouched ?? false; }
  @HostBinding('class.ion-valid') get ionValid() { return this.ngControl?.valid ?? false; }
  @HostBinding('class.ion-invalid') get ionInvalid() { return (this.ngControl?.invalid && (this.ngControl?.touched || this.ngControl?.dirty)) ?? false; }
  @HostBinding('class.ion-dirty') get ionDirty() { return this.ngControl?.dirty ?? false; }
  @HostBinding('class.ion-pristine') get ionPristine() { return this.ngControl?.pristine ?? false; }

  @HostBinding('class.ng-touched') get ngTouched() { return this.ngControl?.touched ?? false; }
  @HostBinding('class.ng-untouched') get ngUntouched() { return this.ngControl?.untouched ?? false; }
  @HostBinding('class.ng-valid') get ngValid() { return this.ngControl?.valid ?? false; }
  @HostBinding('class.ng-invalid') get ngInvalid() { return (this.ngControl?.invalid && (this.ngControl?.touched || this.ngControl?.dirty)) ?? false; }
  @HostBinding('class.ng-dirty') get ngDirty() { return this.ngControl?.dirty ?? false; }
  @HostBinding('class.ng-pristine') get ngPristine() { return this.ngControl?.pristine ?? false; }

  isNativelyDisabled = false;

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, null);
  }

  ngDoCheck(): void {
    if (this.inputRef && this.inputRef.nativeElement) {
      const isCurrentlyDisabled = this.inputRef.nativeElement.matches(':disabled');
      if (this.isNativelyDisabled !== isCurrentlyDisabled) {
        this.isNativelyDisabled = isCurrentlyDisabled;
        this.applyDisabledUi(isCurrentlyDisabled || (this.disabledSignal() ?? this.disabled));
        this.stateChanges.next();
        this.cdr.markForCheck();
      }
    }
  }

  // ========== Signal-based API (Angular 17+) ==========

  /** Signal-based input: Initial country to select. Use 'auto' for geo-location detection. */
  initialCountrySignal = input<CountryCode | 'auto' | undefined>(undefined);

  /** Signal-based input: Countries to show at the top of the dropdown list. */
  preferredCountriesSignal = input<CountryCode[] | undefined>(undefined);

  /** Signal-based input: Restrict selectable countries to this list. */
  onlyCountriesSignal = input<CountryCode[] | undefined>(undefined);

  /** Signal-based input: Exclude specific countries from the dropdown list. */
  excludeCountriesSignal = input<CountryCode[] | undefined>(undefined);

  /** Signal-based input: Custom placeholder for the search input field. */
  searchPlaceholderSignal = input<string | undefined>(undefined);

  /** Signal-based input: Whether to show flags in the input and dropdown. */
  showFlagsSignal = input<boolean | undefined>(undefined);

  /** Signal-based input: Whether to show flags in the search results. */
  searchCountryFlagSignal = input<boolean | undefined>(undefined);

  /** Signal-based input: When true, shows dial code outside the input field. */
  separateDialCodeSignal = input<boolean | undefined>(undefined);

  /** Signal-based input: Enable or disable the country dropdown. */
  allowDropdownSignal = input<boolean | undefined>(undefined);

  /** Signal-based input: Display format - 'formatted' => national with spaces; 'digits' => digits only */
  nationalDisplaySignal = input<'formatted' | 'digits' | undefined>(undefined);

  /** Signal-based input: Format timing - 'typing' (live), 'blur', or 'off' */
  formatWhenValidSignal = input<'off' | 'blur' | 'typing' | undefined>(undefined);

  /** Signal-based input: Size variant */
  sizeSignal = input<'sm' | 'md' | 'lg' | undefined>(undefined);

  /** Signal-based input: Style variant */
  variantSignal = input<'outline' | 'filled' | 'underline' | undefined>(undefined);

  /** Signal-based input: Theme preference */
  themeSignal = input<'light' | 'dark' | 'auto' | undefined>(undefined);

  /** Signal-based input: Disabled state */
  disabledSignal = input<boolean | undefined>(undefined);

  /** Signal-based input: Whether to show the internal error message text */
  showErrorMsgSignal = input<boolean | undefined>(undefined);

  /** Signal-based input: Custom CSS classes for the inner input element. */
  cssClassSignal = input<string | undefined>(undefined);

  /** Signal-based output: Emitted when country selection changes */
  countryChangeSignal = output<{ iso2: CountryCode }>();

  /** Signal-based output: Emitted when validity changes */
  validityChangeSignal = output<boolean>();

  /** Signal-based output: Emitted on every input change */
  inputChangeSignal = output<{ raw: string; e164: string | null; iso2: CountryCode }>();

  /** Internal state signal for reactive state management */
  private readonly stateSignal: WritableSignal<PhoneInputState> = createPhoneInputState();

  /** Computed signal: Current phone input state */
  readonly state = this.stateSignal.asReadonly();

  /** Internal computed fallback that keeps signal API optional. */
  readonly effectiveNationalDisplay = computed(() => this.nationalDisplaySignal() ?? this.nationalDisplay);

  /** Computed signal: Formatted display value */
  readonly formattedValue = createFormattedValueSignal(this.stateSignal, this.effectiveNationalDisplay);

  /** Computed signal: Validation status */
  readonly validationStatus = createValidationStatusSignal(this.stateSignal);

  /** Computed signal: Phone number metadata */
  readonly phoneMetadata = createPhoneMetadataSignal(this.stateSignal);

  /** Computed signal: Whether the input is valid */
  readonly isValid = computed(() => this.stateSignal().isValid);

  /** Computed signal: Whether the input has errors */
  readonly hasErrors = computed(() => {
    const errors = this.stateSignal().errors;
    return errors !== null && Object.keys(errors).length > 0;
  });

  /** Computed signal: Whether to show error message */
  readonly showError = computed(() => {
    if (this.isDestroyed) return false;
    const state = this.stateSignal();
    const formErrors = this.ngControl?.control?.errors;
    const hasErrors = (state.errors !== null && Object.keys(state.errors).length > 0) || (formErrors !== null && formErrors !== undefined);
    const isTouched = state.touched || (this.ngControl?.touched ?? false);
    return this.showErrorWhenTouched ? (isTouched && hasErrors) : hasErrors;
  });

  /** Computed signal: Resolved validation error message */
  readonly resolvedErrorText = computed(() => {
    if (this.errorText) return this.errorText;
    const errors = this.ngControl?.control?.errors || this.stateSignal().errors;
    if (!errors) return '';
    if (errors['required']) {
      return 'Phone number is required';
    }
    if (errors['phoneInvalidCountryCode']) {
      return 'Invalid country code';
    }
    if (errors['phoneInvalid']) {
      return 'Invalid phone number';
    }
    return 'Invalid phone number';
  });

  /** Computed signal: Current E.164 value */
  readonly e164Value = computed(() => this.stateSignal().e164);

  /** Computed signal: Current raw input value */
  readonly rawValue = computed(() => this.stateSignal().raw);

  /** Computed signal: Current country ISO2 code */
  readonly currentCountry = computed(() => this.stateSignal().iso2);

  // ========== Traditional @Input/@Output API (backward compatibility) ==========

  /** Initial country to select. Use 'auto' for geo-location detection (defaults to 'US'). */
  @Input() initialCountry: CountryCode | 'auto' = 'US';
  /** Countries to show at the top of the dropdown list. */
  @Input() preferredCountries: CountryCode[] = ['US', 'GB'];
  /** Restrict selectable countries to this list. If not provided, all countries are available. */
  @Input() onlyCountries?: CountryCode[];
  /** Exclude specific countries from the dropdown list. */
  @Input() excludeCountries: CountryCode[] = [];
  /** Custom placeholder for the search input field. */
  @Input() searchPlaceholder: string = '';
  /** Whether to show flags in the input and dropdown. */
  @Input() showFlags: boolean = true;
  /** Whether to show flags in the search results. */
  @Input() searchCountryFlag: boolean = true;
  /** When true, shows dial code outside the input field (after the flag). */
  @Input() separateDialCode: boolean = true;
  /** Enable or disable the country dropdown. */
  @Input() allowDropdown: boolean = true;

  /** 'formatted' => national with spaces; 'digits' => digits only */
  @Input() nationalDisplay: 'formatted' | 'digits' = 'formatted';
  /** 'typing' (live), 'blur', or 'off' */
  @Input() formatWhenValid: 'off' | 'blur' | 'typing' = 'typing';

  // placeholder is defined via getter/setter below
  @Input() autocomplete = 'tel';
  @Input() name?: string;
  @Input() inputId?: string;
  // disabled is defined via getter/setter below

  @Input() label?: string;
  @Input() hint?: string;
  @Input() errorText?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'outline' | 'filled' | 'underline' = 'outline';
  @Input() showClear = true;
  @Input() autoFocus = false;
  @Input() selectOnFocus = false;
  @Input() showErrorWhenTouched = true;
  /** Whether to show the component's internal validation error message text. */
  @Input() showErrorMsg = true;
  /** Custom CSS classes for the inner input element (e.g. for Tailwind CSS, Bootstrap, etc). */
  @Input() cssClass: string = '';

  @Input() dropdownAttachToBody = true;
  @Input() dropdownZIndex = 2000;

  @Input() i18n?: IntlTelI18n;
  @Input() localizedCountries?: CountryMap;

  @Input() clearAriaLabel = 'Clear phone number';
  @Input() dir: 'ltr' | 'rtl' = 'ltr';

  @Input() autoPlaceholder: 'off' | 'polite' | 'aggressive' = 'off';
  @Input() utilsScript?: string;
  @Input() customPlaceholder?: (example: string, country: unknown) => string;

  @Input() digitsOnly = true;
  @Input() lockWhenValid = true;

  @Input() theme: 'light' | 'dark' | 'auto' = 'auto';

  /**
   * Custom colors for fine-grained theme control.
   */
  @Input() customColors?: {
    light?: ColorPalette;
    dark?: ColorPalette;
  };

  /** Enable carrier and number type detection */
  @Input() enableIntelligence = false;

  /** Enable format suggestions */
  @Input() enableFormatSuggestions = false;

  @Output() countryChange = new EventEmitter<{ iso2: CountryCode }>();
  @Output() validityChange = new EventEmitter<boolean>();
  @Output() inputChange = new EventEmitter<{ raw: string; e164: string | null; iso2: CountryCode }>();
  @Output() intelligenceChange = new EventEmitter<CarrierInfo | null>();
  @Output() formatSuggestion = new EventEmitter<FormatSuggestion | null>();

  private iti: IntlTelInstance | null = null;
  private onChange: (val: string | null) => void = () => { };
  private onTouchedCb: () => void = () => { };
  private validatorChange?: () => void;
  private lastEmittedValid = false;
  private pendingWrite: string | null = null;
  private touched = false;
  private isDestroyed = false;
  private eventListeners: Array<{ element: HTMLElement; event: string; handler: (event: Event) => void }> = [];
  private searchInputCleanupFunctions: Array<() => void> = [];

  private allowDropdownWasTrue = false;
  private suppressEvents = false;
  private lastActiveCountry: CountryCode | null = null;
  private themeObserver: MutationObserver | null = null;
  private globalThemeObserver: MutationObserver | null = null;
  private signalConfigSnapshot: string | null = null;
  private reinitInProgress = false;
  private reinitQueued = false;
  private dropdownThemeTimeoutId: ReturnType<typeof setTimeout> | null = null;

  readonly resolvedId: string = this.inputId || ('tel-' + Math.random().toString(36).slice(2));
  private readonly platformId = inject(PLATFORM_ID);
  private currentTheme: 'light' | 'dark' = 'light';
  private lastThemeConfig: 'light' | 'dark' | 'auto' | null = null;

  isRequired = false;

  // ========== MatFormFieldControl Integration ==========
  stateChanges = new Subject<void>();
  focused = false;
  controlType = 'ngxsmk-tel-input';
  autofilled = false;
  userAriaDescribedBy = '';

  get id(): string {
    return this.resolvedId;
  }

  get empty(): boolean {
    return !this.currentRaw();
  }

  @HostBinding('class.ngxsmk-floating')
  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty || !!this.placeholder;
  }

  get errorState(): boolean {
    return (this.ngControl?.control?.invalid && (this.ngControl?.touched || this.ngControl?.dirty)) ?? false;
  }

  @Input()
  get value(): string | null {
    const raw = this.currentRaw();
    return this.stateSignal().e164 || (raw ? raw : null);
  }
  set value(val: string | null) {
    this.writeValue(val);
    this.stateChanges.next();
  }

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }
  set placeholder(plh: string) {
    this._placeholder = plh || '';
    this.stateChanges.next();
  }
  private _placeholder = '';

  @Input()
  get required(): boolean {
    return this.isRequired;
  }
  set required(req: boolean) {
    this.isRequired = req;
    this.stateChanges.next();
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(val: boolean) {
    this._disabled = val;
    if (this.inputRef) this.inputRef.nativeElement.disabled = val;
    this.applyDisabledUi(val);
    this.stateChanges.next();
  }
  private _disabled = false;

  setDescribedByIds(ids: string[]): void {
    this.userAriaDescribedBy = ids.join(' ');
  }

  onContainerClick(event: MouseEvent): void {
    this.focus();
  }

  private readonly intelligence: PhoneIntelligenceService | null = inject(PhoneIntelligenceService, { optional: true });

  private readonly hostElementRef = inject(ElementRef);

  constructor(
    @Optional() private readonly zone: NgZone | null,
    private readonly tel: NgxsmkTelInputService,
    private readonly cdr: ChangeDetectorRef
  ) {
    // Watch for theme signal changes
    effect(() => {
      if (!isPlatformBrowser(this.platformId) || this.isDestroyed) return;
      // Check both signal and traditional input
      const theme = this.themeSignal() ?? this.theme;
      if (theme !== undefined && theme !== this.lastThemeConfig) {
        this.lastThemeConfig = theme;
        // Apply theme immediately (works even before plugin is initialized)
        this.detectAndApplyTheme();
      }
    });

    // Watch signal-based config changes that require plugin reinitialization.
    effect(() => {
      if (!isPlatformBrowser(this.platformId) || this.isDestroyed) return;
      const snapshot = JSON.stringify({
        initialCountry: this.initialCountrySignal(),
        preferredCountries: this.preferredCountriesSignal(),
        onlyCountries: this.onlyCountriesSignal(),
        excludeCountries: this.excludeCountriesSignal(),
        allowDropdown: this.allowDropdownSignal(),
        separateDialCode: this.separateDialCodeSignal(),
        i18n: this.i18n,
        localizedCountries: this.localizedCountries,
        dir: this.dir,
        autoPlaceholder: this.autoPlaceholder,
        utilsScript: this.utilsScript,
        customPlaceholder: !!this.customPlaceholder
      });
      if (snapshot === this.signalConfigSnapshot) return;
      this.signalConfigSnapshot = snapshot;
      this.requestPluginReinit();
    });
  }

  /**
   * Helper method to run code inside Angular zone if available, otherwise just run it.
   * Works with both Zone.js and zoneless Angular.
   */
  private runInZone(fn: () => void): void {
    if (this.zone) {
      this.zone.run(fn);
    } else {
      fn();
      this.cdr.markForCheck();
    }
  }

  /**
   * Helper method to run code outside Angular zone if available, otherwise just run it.
   * Works with both Zone.js and zoneless Angular.
   */
  private runOutsideZone(fn: () => void): void {
    if (this.zone) {
      this.zone.runOutsideAngular(fn);
    } else {
      fn();
    }
  }

  /**
   * Helper method for requestAnimationFrame with fallback for older browsers.
   */
  private requestAnimationFrame(fn: () => void): void {
    if (globalThis.window === undefined) {
      fn();
      return;
    }

    const raf = globalThis.window.requestAnimationFrame ||
      (globalThis as any).webkitRequestAnimationFrame ||
      (globalThis as any).mozRequestAnimationFrame ||
      (globalThis as any).msRequestAnimationFrame ||
      ((callback: () => void) => setTimeout(callback, 16));
    raf(fn);
  }

  /**
   * Determines if dropdown should be attached to body.
   * On mobile screens (<=768px), returns false to show dropdown inline instead of as modal.
   */
  private shouldAttachToBody(): boolean {
    if (!this.dropdownAttachToBody) return false;
    if (globalThis.window === undefined) return false;
    // On mobile, don't attach to body to avoid modal popup behavior
    // Use fallback for older browsers
    const width = globalThis.window.innerWidth || (globalThis as any).clientWidth || 1024;
    return width > 768;
  }

  /**
   * Angular lifecycle hook called after the view is initialized.
   * Initializes the intl-tel-input plugin and sets up event listeners.
   */
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId) || this.isDestroyed) return;
    // Ensure theme is applied on initial render
    // Use setTimeout to ensure host element is fully available
    setTimeout(() => {
      if (!this.isDestroyed) {
        this.detectAndApplyTheme();
      }
    }, 0);
    this.setupDropdownThemeObserver();
    this.setupGlobalThemeObserver();
    void this.initAndWire();
  }

  private async initAndWire(): Promise<void> {
    if (this.isDestroyed) return;

    await this.initIntlTelInput();
    if (this.isDestroyed) return;

    this.bindDomListeners();

    if (this.pendingWrite !== null && !this.isDestroyed) {
      const v = this.pendingWrite;
      this.pendingWrite = null;
      this.writeValue(v);
    }

    if (this.autoFocus && !this.isDestroyed) {
      this.requestAnimationFrame(() => {
        if (!this.isDestroyed) this.focus();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!isPlatformBrowser(this.platformId) || this.isDestroyed) return;

    // Check for signal changes or traditional input changes
    const configChanged = [
      'initialCountry', 'preferredCountries', 'onlyCountries', 'excludeCountries',
      'separateDialCode', 'allowDropdown',
      'i18n', 'localizedCountries', 'dir',
      'autoPlaceholder', 'utilsScript', 'customPlaceholder'
    ].some(k => k in changes && !changes[k]?.firstChange);

    // Also check if any signal inputs have changed (signals trigger change detection automatically)
    if (configChanged && this.iti && !this.isDestroyed) {
      this.requestPluginReinit();
    }

    // Handle theme changes from traditional @Input
    if ('theme' in changes && !changes['theme'].firstChange) {
      const theme = this.theme;
      if (theme !== this.lastThemeConfig) {
        this.lastThemeConfig = theme;
        this.detectAndApplyTheme();
        // Mark for check to ensure view updates with OnPush
        this.cdr.markForCheck();
      }
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.stateChanges.next();
    this.stateChanges.complete();
    this.destroyPlugin();
    this.cleanupEventListeners();
    this.cleanupSearchInputListeners();
    if (this.themeObserver) {
      this.themeObserver.disconnect();
      this.themeObserver = null;
    }
    if (this.globalThemeObserver) {
      this.globalThemeObserver.disconnect();
      this.globalThemeObserver = null;
    }
    if (this.dropdownThemeTimeoutId) {
      clearTimeout(this.dropdownThemeTimeoutId);
      this.dropdownThemeTimeoutId = null;
    }
  }

  /**
   * Writes a new value to the form control.
   * Called by Angular Forms when the control value changes programmatically.
   * @param val - The new value (E.164 format string or null)
   */
  writeValue(val: string | null): void {
    if (!this.inputRef || this.isDestroyed) return;

    if (!this.iti) {
      this.pendingWrite = val ?? '';
      return;
    }

    // Get current state for comparison (will be checked after setNumber with correct country)
    const currentE164 = this.stateSignal().e164;

    this.suppressEvents = true;
    try {
      // Call setNumber() FIRST to let intl-tel-input detect and set the correct country
      // This is critical when the incoming value has a different country code
      this.iti.setNumber(val || '');

      // Now get the country code AFTER setNumber has potentially changed it
      const iso2 = this.currentIso2();

      // Parse with the correct country code
      const parsed = this.tel.parseWithInvalidDetection(val ?? '', iso2);
      const incomingE164 = parsed.e164;

      // Avoid unnecessary updates if E.164 value hasn't changed
      if (currentE164 === incomingE164) {
        // Even if E.164 is the same, update if the display value would be different
        // (e.g., user changed format settings or country changed)
        const currentRaw = this.stateSignal().raw;
        const currentIso2 = this.stateSignal().iso2;

        // If country did not change, check whether display value changed
        if (currentIso2 === iso2) {
          const nsn = incomingE164
            ? this.nsnFromE164(incomingE164, iso2)
            : this.stripLeadingZero(this.toNSN(parsed.national ?? (val ?? '')));
          const display = this.displayValue(nsn, iso2);
          if (currentRaw === display) {
            return; // Nothing to update
          }
        }
      }

      const nsn = incomingE164
        ? this.nsnFromE164(incomingE164, iso2)
        : this.stripLeadingZero(this.toNSN(parsed.national ?? (val ?? '')));

      const display = this.displayValue(nsn, iso2);
      this.setInputValue(display);

      // Update state signal without triggering Angular Forms onChange
      // (writeValue is called BY Angular Forms, so we shouldn't notify it back)
      const validationErrors = this.buildValidationErrors(parsed.isValid, parsed.isInvalidInternational);
      this.stateSignal.update(state => ({
        ...state,
        raw: display,
        e164: incomingE164,
        iso2,
        isValid: parsed.isValid && !parsed.isInvalidInternational,
        errors: validationErrors
      }));

      this.lastActiveCountry = iso2;
      this.stateChanges.next();
      // Emit inputChange for external listeners (but NOT onChange to avoid loop)
      this.runInZone(() => {
        if (this.isDestroyed) return;
        this.inputChange.emit({ raw: display, e164: incomingE164, iso2 });
        this.inputChangeSignal.emit({ raw: display, e164: incomingE164, iso2 });
      });
      // Mark for check to ensure view updates (works in both zone and zoneless)
      this.cdr.markForCheck();
    } finally {
      this.suppressEvents = false;
    }
  }

  /**
   * Registers a callback function that is called when the control's value changes.
   * @param fn - Callback function that receives the new value (string | null)
   */
  registerOnChange(fn: (val: string | null) => void): void { this.onChange = fn; }

  /**
   * Registers a callback function that is called when the control is touched.
   * @param fn - Callback function to be called on touch
   */
  registerOnTouched(fn: () => void): void { this.onTouchedCb = fn; }

  /**
   * Sets the disabled state of the control.
   * Called by Angular Forms when the control's disabled state changes.
   * @param isDisabled - Whether the control should be disabled
   */
  setDisabledState(isDisabled: boolean): void {
    if (this.isDestroyed) return;

    this.disabled = isDisabled;
  }

  /**
   * Validates the phone number input.
   * Returns validation errors if the number is invalid, null if valid.
   * @param _ - The form control (unused, but required by Validator interface)
   * @returns ValidationErrors object with error keys, or null if valid
   */
  validate(control: AbstractControl): ValidationErrors | null {
    if (this.isDestroyed) return null;

    // Update isRequired based on control validators
    // Check if control has required validator by testing with null value
    try {
      if (control.validator) {
        const testControl = { value: null } as AbstractControl;
        const errors = control.validator(testControl);
        this.isRequired = !!errors?.['required'];
      } else {
        this.isRequired = false;
      }
    } catch (error) {
      // Fallback to not required if validator check fails
      this.reportNonCriticalError('validate:required-check', error);
      this.isRequired = false;
    }

    const raw = this.currentRaw();
    if (!raw) return null;

    const parsed = this.tel.parseWithInvalidDetection(raw, this.currentIso2());
    const valid = parsed.isValid && !parsed.isInvalidInternational;

    if (valid !== this.lastEmittedValid) {
      this.lastEmittedValid = valid;

      // Update state signal
      const validationErrors = this.buildValidationErrors(parsed.isValid, parsed.isInvalidInternational);
      this.stateSignal.update(state => ({
        ...state,
        isValid: valid,
        errors: validationErrors
      }));

      // Emit both traditional and signal-based outputs
      this.validityChange.emit(valid);
      this.validityChangeSignal.emit(valid);

      // Mark for check when validity changes
      this.cdr.markForCheck();
    }

    if (!valid) {
      if (parsed.isInvalidInternational) {
        return { phoneInvalidCountryCode: true };
      }
      return { phoneInvalid: true };
    }

    return null;
  }

  /**
   * Registers a callback function that is called when validator inputs change.
   * @param fn - Callback function to be called when validation should be re-run
   */
  registerOnValidatorChange(fn: () => void): void { this.validatorChange = fn; }

  /**
   * Programmatically focuses the input field.
   * If selectOnFocus is enabled, also selects all text.
   */
  focus(): void {
    if (this.isDestroyed || !this.inputRef) return;

    this.inputRef.nativeElement.focus();
    if (this.selectOnFocus) {
      const el = this.inputRef.nativeElement;
      this.requestAnimationFrame(() => {
        if (!this.isDestroyed) {
          try {
            el.setSelectionRange(0, el.value.length);
          } catch (error) {
            // Fallback for browsers that don't support setSelectionRange
            this.reportNonCriticalError('focus:setSelectionRange', error);
            if (el.select) {
              el.select();
            }
          }
        }
      });
    }
  }

  /**
   * Programmatically selects a country.
   * @param iso2 - ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB')
   */
  selectCountry(iso2: CountryCode): void {
    if (this.iti && !this.isDestroyed) {
      this.iti.setCountry(iso2.toLowerCase());
      this.handleInput();
    }
  }

  /**
   * Clears the input field and refocuses it.
   */
  clearInput(): void {
    if (this.isDestroyed) return;

    this.setInputValue('');
    this.handleInput();
    this.inputRef.nativeElement.focus();
  }

  private async initIntlTelInput() {
    if (this.isDestroyed) return;

    const { default: intlTelInput } = await import('intl-tel-input');

    const toLowerKeys = (m?: CountryMap) => {
      if (!m) return undefined;
      const out: Record<string, string> = {};
      for (const k in m) if (Object.hasOwn(m, k)) {
        const v = (m as Record<string, string | undefined>)[k];
        if (v != null) out[k.toLowerCase()] = v;
      }
      return out;
    };

    // Use signal values if available, fallback to traditional inputs
    const initialCountry = this.initialCountrySignal() ?? this.initialCountry;
    const preferredCountries = this.preferredCountriesSignal() ?? this.preferredCountries;
    const onlyCountries = this.onlyCountriesSignal() ?? this.onlyCountries;
    const excludeCountries = this.excludeCountriesSignal() ?? this.excludeCountries;
    const allowDropdown = this.allowDropdownSignal() ?? this.allowDropdown;
    const separateDialCode = this.separateDialCodeSignal() ?? this.separateDialCode;

    const config: IntlTelInputConfig = {
      initialCountry: initialCountry === 'auto' ? 'auto' : (initialCountry?.toLowerCase() || 'us'),
      countryOrder: (preferredCountries ?? []).map(c => c.toLowerCase()),
      onlyCountries: (onlyCountries ?? []).map(c => c.toLowerCase()),
      excludeCountries: (excludeCountries ?? []).map(c => c.toLowerCase()),
      nationalMode: true,
      allowDropdown,
      separateDialCode,
      geoIpLookup: (cb: (iso2: string) => void) => cb('us'),

      autoPlaceholder: this.autoPlaceholder,
      utilsScript: this.utilsScript,
      customPlaceholder: this.customPlaceholder,

      i18n: this.i18n,
      localizedCountries: toLowerKeys(this.localizedCountries),
      // On mobile, don't attach to body to avoid modal behavior
      dropdownContainer: this.shouldAttachToBody() && typeof document !== 'undefined' ? document.body : undefined
    };

    this.runOutsideZone(() => {
      if (!this.isDestroyed) {
        this.iti = intlTelInput(this.inputRef.nativeElement, config as any);
      }
    });

    if (!this.isDestroyed) {
      (this.inputRef.nativeElement as HTMLElement).style.setProperty('--tel-dd-z', String(this.dropdownZIndex));
      this.applyDisabledUi(this.disabled);
      this.lastActiveCountry = this.currentIso2();
    }
  }

  private async reinitPlugin() {
    if (this.isDestroyed) return;

    const prevIso2 = (this.iti?.getSelectedCountryData?.().iso2 || this.initialCountry || 'US').toString().toLowerCase();
    const prevValue = this.currentRaw();

    this.destroyPlugin();
    await this.initIntlTelInput();
    this.bindDomListeners();

    if (!this.isDestroyed) {
      try {
        this.iti?.setCountry(prevIso2);
      } catch (error) {
        // Ignore errors when setting country (e.g., invalid country code)
        this.reportNonCriticalError('reinitPlugin:setCountry', error);
      }
      if (prevValue) {
        this.setInputValue(prevValue);
        this.handleInput();
      }
      this.applyDisabledUi(this.disabled);
      this.lastActiveCountry = this.currentIso2();
    }
  }

  private requestPluginReinit(): void {
    if (this.isDestroyed || !this.iti) return;
    if (this.reinitInProgress) {
      this.reinitQueued = true;
      return;
    }
    this.reinitInProgress = true;
    this.validatorChange?.();
    void this.reinitPlugin().finally(() => {
      this.reinitInProgress = false;
      if (this.reinitQueued && !this.isDestroyed) {
        this.reinitQueued = false;
        this.requestPluginReinit();
      }
    });
  }

  private destroyPlugin() {
    if (this.iti) {
      this.iti.destroy();
      this.iti = null;
    }
  }

  // ---------- Input listeners ----------
  private bindDomListeners() {
    if (this.isDestroyed || !this.inputRef) return;

    const el = this.inputRef.nativeElement;

    this.runOutsideZone(() => {
      const beforeInputHandler = (ev: Event) => {
        if (this.isDestroyed || !this.digitsOnly) return;
        const inputEvent = ev as BeforeInputEvent;
        const data = inputEvent.data;

        if (this.lockWhenValid && this.isCurrentlyValid()) {
          const selStart = el.selectionStart ?? 0;
          const selEnd = el.selectionEnd ?? 0;
          const selCollapsed = selStart === selEnd;
          const isDigit = !!data && inputEvent.inputType === 'insertText' && data >= '0' && data <= '9';
          if (selCollapsed && isDigit) { ev.preventDefault(); return; }
        }

        if (!data || inputEvent.inputType !== 'insertText') return;
        const isDigit = data >= '0' && data <= '9';
        if (!isDigit) { ev.preventDefault(); return; }

        const start = el.selectionStart ?? el.value.length;
        const end = el.selectionEnd ?? el.value.length;
        const prospective = el.value.slice(0, start) + data + el.value.slice(end);
        const nsn = this.stripLeadingZero(this.toNSN(prospective));
        const iso2 = this.currentIso2();

        if (this.wouldExceedMax(nsn, iso2)) {
          ev.preventDefault();
        }
      };

      const pasteHandler = (e: Event) => {
        if (this.isDestroyed) return;

        const clipboardEvent = e as ClipboardEventWithData;
        // Support both standard ClipboardEvent and IE11 fallback
        const clipboardData = clipboardEvent.clipboardData ||
          ((globalThis as unknown as { clipboardData?: DataTransfer }).clipboardData) ||
          null;
        let text = '';
        if (clipboardData) {
          try {
            text = clipboardData.getData('text') || '';
          } catch (error) {
            // Fallback for browsers without clipboardData support
            this.reportNonCriticalError('paste:getData', error);
            text = '';
          }
        }
        e.preventDefault();

        const iso2 = this.currentIso2();
        let digits = this.stripLeadingZero(this.toNSN(text));

        while (this.wouldExceedMax(digits, iso2)) {
          digits = digits.slice(0, -1);
          if (!digits) break;
        }

        const start = el.selectionStart ?? el.value.length;
        const end = el.selectionEnd ?? el.value.length;

        // Use setRangeText with fallback for older browsers
        if (el.setRangeText) {
          try {
            el.setRangeText(digits, start, end, 'end');
          } catch (error) {
            // Fallback for browsers without setRangeText support
            this.reportNonCriticalError('paste:setRangeText', error);
            el.value = el.value.substring(0, start) + digits + el.value.substring(end);
          }
        } else {
          el.value = el.value.substring(0, start) + digits + el.value.substring(end);
        }

        this.requestAnimationFrame(() => {
          if (!this.isDestroyed) this.handleInput();
        });
      };

      const inputHandler = () => {
        if (!this.isDestroyed) this.handleInput();
      };

      const countryChangeHandler = () => {
        if (this.isDestroyed || this.suppressEvents) return;

        const newIso2 = this.currentIso2();
        const oldIso2 = this.lastActiveCountry;

        if (oldIso2 && oldIso2 !== newIso2) {
          try {
            const oldDial = getCountryCallingCode(oldIso2);
            const newDial = getCountryCallingCode(newIso2);

            if (oldDial === newDial) {
              const rawValue = this.currentRaw();
              const digits = this.stripLeadingZero(this.toNSN(rawValue));
              // If the digits typed so far are less than 3, we cannot determine the area code.
              // We should prevent switching countries that share the same dialing code (like NANP +1 countries).
              if (digits.length < 3) {
                this.suppressEvents = true;
                this.iti?.setCountry(oldIso2.toLowerCase());
                this.suppressEvents = false;
                return;
              }
            }
          } catch (e) {
            // Ignore if getCountryCallingCode throws (e.g. for invalid country codes)
          }
        }

        this.lastActiveCountry = newIso2;

        // Update state signal
        this.stateSignal.update(state => ({
          ...state,
          iso2: newIso2
        }));

        this.runInZone(() => {
          if (this.isDestroyed) return;
          const changeEvent = { iso2: newIso2 };

          // Emit both traditional and signal-based outputs
          this.countryChange.emit(changeEvent);
          this.countryChangeSignal.emit(changeEvent);

          this.validatorChange?.();
        });
        this.handleInput();
      };

      const blurHandler = () => {
        if (!this.isDestroyed) this.onBlur();
      };

      // Store listeners for cleanup
      this.eventListeners = [
        { element: el, event: 'beforeinput', handler: beforeInputHandler },
        { element: el, event: 'paste', handler: pasteHandler },
        { element: el, event: 'input', handler: inputHandler },
        { element: el, event: 'countrychange', handler: countryChangeHandler },
        { element: el, event: 'blur', handler: blurHandler }
      ];

      this.eventListeners.forEach(({ element, event, handler }) => {
        element.addEventListener(event, handler);
      });
    });
  }

  onBlur() {
    this.focused = false;
    this.stateChanges.next();

    if (this.isDestroyed) return;

    this.touched = true;

    // Update state signal
    this.stateSignal.update(state => ({
      ...state,
      touched: true
    }));

    this.runInZone(() => {
      this.onTouchedCb();
      // Trigger validation on blur
      this.validatorChange?.();
    });
    // Mark for check to update view with OnPush (works in both zone and zoneless)
    this.cdr.markForCheck();

    const formatWhenValidBlur = this.formatWhenValidSignal() ?? this.formatWhenValid;
    if (formatWhenValidBlur === 'off') return;

    const iso2 = this.currentIso2();
    const digits = this.stripLeadingZero(this.toNSN(this.currentRaw()));

    const parsed = this.tel.parseWithInvalidDetection(digits, iso2);
    if (!parsed.e164 && !parsed.isValid) return;

    const nsn = parsed.e164 ? this.nsnFromE164(parsed.e164, iso2) : digits;
    if (formatWhenValidBlur !== 'typing') {
      this.setInputValue(this.displayValue(nsn, iso2));
    }
  }

  onFocus() {
    this.focused = true;
    this.stateChanges.next();

    if (this.isDestroyed || !this.selectOnFocus || !this.inputRef) return;

    const el = this.inputRef.nativeElement;
    this.requestAnimationFrame(() => {
      if (!this.isDestroyed) {
        try {
          if (el.setSelectionRange) {
            el.setSelectionRange(0, el.value.length);
          } else if (el.select) {
            // Fallback for browsers that don't support setSelectionRange
            el.select();
          }
        } catch (error) {
          // Ignore errors in older browsers
          this.reportNonCriticalError('onFocus:setSelectionRange', error);
        }
      }
    });
  }

  private handleInput() {
    if (this.suppressEvents || this.isDestroyed) return;

    // Cache currentRaw() to avoid multiple DOM reads
    const rawValue = this.currentRaw();
    const iso2 = this.currentIso2();
    const digits = this.stripLeadingZero(this.toNSN(rawValue));

    const parsed = this.tel.parseWithInvalidDetection(digits, iso2);
    const isValid = parsed.isValid && !parsed.isInvalidInternational;

    // Batch state signal update
    const validationErrors = this.buildValidationErrors(parsed.isValid, parsed.isInvalidInternational);
    this.stateSignal.update(state => ({
      ...state,
      raw: rawValue,
      e164: parsed.e164,
      iso2,
      isValid,
      errors: validationErrors
    }));

    // Intelligence features
    if (this.enableIntelligence && this.intelligence && parsed.e164) {
      const carrierInfo = this.intelligence.detectCarrierAndType(parsed.e164, iso2);
      if (carrierInfo && !this.isDestroyed) {
        this.intelligenceChange.emit(carrierInfo);
      }
    }

    // Format suggestions
    if (this.enableFormatSuggestions && this.intelligence && !parsed.isValid) {
      const suggestion = this.intelligence.suggestFormatCorrection(rawValue, iso2);
      if (suggestion && !this.isDestroyed) {
        this.formatSuggestion.emit(suggestion);
      }
    }

    // Batch zone operations and emissions
    this.runInZone(() => {
      if (this.isDestroyed) return;
      // Propagate raw value if invalid but not empty to prevent Angular's Validators.required from raising
      // a required error when the field is physically populated. Propagate null if completely empty.
      this.onChange(parsed.e164 || (rawValue ? rawValue : null));

      const changeEvent = { raw: rawValue, e164: parsed.e164, iso2 };

      // Emit both traditional and signal-based outputs
      this.inputChange.emit(changeEvent);
      this.inputChangeSignal.emit(changeEvent);

      // Trigger validation when input changes
      this.validatorChange?.();
    });
    // Mark for check to update view with OnPush (works in both zone and zoneless)
    this.cdr.markForCheck();

    const nsn = parsed.e164 ? this.nsnFromE164(parsed.e164, iso2) : digits;
    const formatWhenValid = this.formatWhenValidSignal() ?? this.formatWhenValid;
    const display = formatWhenValid === 'typing' ? this.displayValue(nsn, iso2) : nsn;

    if (display !== rawValue) this.setInputValue(display);
  }
  /** Convert any string to digits only (NSN basis). */
  private toNSN(v: string | null | undefined): string {
    return (v ?? '').replaceAll(/\D/g, '');
  }

  /** Strip exactly one leading trunk '0' from national input. */
  private stripLeadingZero(nsn: string): string {
    return nsn.replace(/^0/, '');
  }

  /** Current country calling code (e.g. "44", "94"). */
  private currentDialCode(): string {
    try {
      return (this.iti?.getSelectedCountryData?.()?.dialCode ?? '').toString();
    } catch (error) {
      // Return empty string if country data is unavailable
      this.reportNonCriticalError('currentDialCode', error);
      return '';
    }
  }

  /** Convert E.164 (+<cc><nsn>) to NSN (never includes trunk '0'). */
  private nsnFromE164(e164: string, iso2: CountryCode): string {
    const dial = this.currentDialCode();
    if (!e164 || !dial) return this.toNSN(e164);
    if (e164.startsWith('+' + dial)) return e164.slice(dial.length + 1);
    return this.toNSN(e164);
  }

  /** Format NSN for a region (adds spaces but NEVER a trunk '0'). */
  private formatNSN(nsn: string, iso2: CountryCode): string {
    try {
      const fmt = new AsYouType(iso2);
      return fmt.input(nsn);
    } catch (error) {
      // Return unformatted NSN if formatting fails
      this.reportNonCriticalError('formatNSN', error);
      return nsn;
    }
  }

  /** Compose visible value based on settings. */
  private displayValue(nsn: string, iso2: CountryCode): string {
    const nationalDisplay = this.nationalDisplaySignal() ?? this.nationalDisplay;
    return nationalDisplay === 'formatted' ? this.formatNSN(nsn, iso2) : nsn;
  }

  /**
   * Gets the current raw input value (as displayed, with formatting).
   * @returns The current input value as a string
   */
  currentRaw(): string {
    return this.isDestroyed ? '' : (this.inputRef?.nativeElement.value ?? '').trim();
  }

  /**
   * Gets the aria-describedby attribute value for accessibility.
   * @returns Space-separated list of element IDs that describe this input
   */
  getAriaDescribedBy(): string | null {
    const ids: string[] = [];
    const hasError = this.showError();
    if (this.hint && !hasError) {
      ids.push(this.resolvedId + '-hint');
    }
    if (hasError && this.errorText) {
      ids.push(this.resolvedId + '-error');
    }
    ids.push(this.resolvedId + '-status');
    return ids.length > 0 ? ids.join(' ') : null;
  }

  /**
   * Gets the ARIA status message for screen readers.
   * @returns Status message describing the current state
   */
  getAriaStatusMessage(): string {
    if (this.isDestroyed) return '';
    const raw = this.currentRaw();
    if (!raw) return '';

    const iso2 = this.currentIso2();
    const parsed = this.tel.parseWithInvalidDetection(raw, iso2);

    if (parsed.isValid && parsed.e164) {
      return `Valid phone number: ${parsed.e164}`;
    } else if (parsed.isInvalidInternational) {
      return 'Invalid country code';
    } else {
      return 'Invalid phone number';
    }
  }

  private currentIso2(): CountryCode {
    if (this.isDestroyed) return 'US';

    try {
      const iso2 = (this.iti?.getSelectedCountryData?.()?.iso2 ?? this.initialCountry ?? 'US')
        .toString().toUpperCase();
      return iso2 as CountryCode;
    } catch (error) {
      // Fallback to initial country or default if country data is unavailable
      this.reportNonCriticalError('currentIso2', error);
      return (this.initialCountry ?? 'US') as CountryCode;
    }
  }

  private setInputValue(v: string) {
    if (!this.isDestroyed && this.inputRef) {
      this.inputRef.nativeElement.value = v ?? '';
    }
  }


  private isCurrentlyValid(): boolean {
    return this.isDestroyed ? false : this.tel.isValid(this.currentRaw(), this.currentIso2());
  }

  /** Make flag/dropdown non-interactive when disabled */
  private applyDisabledUi(disabled: boolean) {
    if (this.isDestroyed) return;

    const input = this.inputRef?.nativeElement;
    if (!input) return;
    const flag = input.parentElement?.querySelector('.iti__selected-flag') as HTMLElement | null;
    if (flag) {
      flag.tabIndex = disabled ? -1 : 0;
      flag.setAttribute('aria-disabled', String(disabled));
    }
  }

  /** Returns true if nsn would be TOO_LONG for the current country. */
  private wouldExceedMax(nsn: string, iso2: CountryCode): boolean {
    if (this.isDestroyed) return false;

    try {
      const res = validatePhoneNumberLength(nsn, iso2);
      return res === 'TOO_LONG';
    } catch (error) {
      // Return false if validation fails (assume not too long)
      this.reportNonCriticalError('wouldExceedMax', error);
      return false;
    }
  }

  /** Clean up event listeners to prevent memory leaks */
  private cleanupEventListeners(): void {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }

  /** Detect and apply theme based on user preference and system settings */
  private detectAndApplyTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    let detectedTheme: 'light' | 'dark' = 'light';

    // Fix precedence: Check signal first, but if it's 'auto' (default), fallback to legacy input
    // This allows [theme]="'light'" to work even if signal defaults to 'auto'
    const theme = this.themeSignal() ?? this.theme;

    if (theme === 'auto') {
      // Check for matchMedia support (not available in older browsers)
      try {
        if (globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches) {
          detectedTheme = 'dark';
        }
      } catch (error) {
        // Fallback for browsers without matchMedia support
        this.reportNonCriticalError('detectAndApplyTheme:matchMedia', error);
      }

      // Check for dark class on document element
      if (document.documentElement?.classList?.contains('dark') || document.documentElement?.dataset?.['theme'] === 'dark') {
        detectedTheme = 'dark';
      }
    } else {
      detectedTheme = theme;
    }

    this.currentTheme = detectedTheme;
    this.applyTheme(detectedTheme);
  }

  /** Apply theme to the component */
  private applyTheme(theme: 'light' | 'dark'): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const hostElement = this.hostElementRef?.nativeElement as HTMLElement;
    if (hostElement) {
      // Set the theme attribute - this is the primary way CSS selects the theme
      hostElement.dataset['theme'] = theme;

      // Also add/remove dark class for additional CSS selector support
      if (theme === 'dark') {
        hostElement.classList.add('dark');
        hostElement.classList.remove('light');
      } else {
        hostElement.classList.add('light');
        hostElement.classList.remove('dark');
      }

      // Force style recalculation to ensure CSS is applied
      hostElement.getBoundingClientRect(); // Trigger reflow

      // Mark for check to update view with OnPush strategy
      this.cdr.markForCheck();
    } else {
      // Retry if host element not available yet
      this.requestAnimationFrame(() => {
        if (!this.isDestroyed) {
          this.applyTheme(theme);
        }
      });
      return;
    }

    this.applyCustomColors(theme);

    this.applyThemeToDropdown(theme);
  }

  private applyCustomColors(theme: 'light' | 'dark') {
    const p = this.customColors?.[theme];
    if (!p) return;
    // Use hostElementRef since we used it above
    const hostElement = this.hostElementRef?.nativeElement;
    if (!hostElement) return;

    const style = hostElement.style;
    const set = (k: string, v?: string) => { if (v) style.setProperty(k, v, 'important'); };

    set('--tel-bg', p.background);
    set('--tel-fg', p.foreground);
    set('--tel-border', p.border);
    set('--tel-border-hover', p.borderHover);
    set('--tel-ring', p.ring);
    set('--tel-placeholder', p.placeholder);
  }

  /** Apply theme to the dropdown if it exists */
  private applyThemeToDropdown(theme: 'light' | 'dark'): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof document === 'undefined' || !document.querySelector) return;

    try {
      const dropdown = this.getThemeDropdownElement();
      if (dropdown) {
        this.updateDropdownTheme(dropdown);
      }
    } catch (error) {
      // Fallback for browsers without querySelector support
      this.reportNonCriticalError('applyThemeToDropdown', error);
    }
  }

  /**
   * Gets the current resolved theme (light or dark).
   * @returns The current theme ('light' or 'dark')
   */
  getCurrentTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  /**
   * Sets the theme programmatically.
   * @param theme - Theme to apply ('light' or 'dark')
   */
  setTheme(theme: 'light' | 'dark'): void {
    this.theme = theme;
    this.detectAndApplyTheme();
  }

  /** Update dropdown theme when it's opened */
  private updateDropdownTheme(dropdownElement?: HTMLElement): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.dropdownThemeTimeoutId) {
      clearTimeout(this.dropdownThemeTimeoutId);
      this.dropdownThemeTimeoutId = null;
    }

    this.dropdownThemeTimeoutId = setTimeout(() => {
      if (this.isDestroyed) return;
      const dropdown = this.getThemeDropdownElement(dropdownElement);
      if (dropdown) {
        dropdown.dataset['theme'] = this.currentTheme;
        dropdown.dataset['size'] = this.sizeSignal() ?? this.size;
        dropdown.dataset['showFlags'] = String(this.showFlagsSignal() ?? this.showFlags);
        dropdown.dataset['searchCountryFlag'] = String(this.searchCountryFlagSignal() ?? this.searchCountryFlag);

        if (this.currentTheme === 'dark') {
          dropdown.classList.add('dark-theme');
        } else {
          dropdown.classList.remove('dark-theme');
        }

        const searchInput = dropdown.querySelector('.iti__search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.dataset['theme'] = this.currentTheme;
          if (this.currentTheme === 'dark') {
            searchInput.classList.add('dark-theme');
          } else {
            searchInput.classList.remove('dark-theme');
          }

          const placeholder = this.searchPlaceholderSignal() ?? this.searchPlaceholder;
          if (placeholder) {
            searchInput.placeholder = placeholder;
          }

          searchInput.style.pointerEvents = 'auto';
          searchInput.style.opacity = '1';
          searchInput.disabled = false;

          // Add clear button functionality
          this.setupSearchInputClearButton(searchInput);
        }
      }
    }, 10);
  }

  /** Setup clear button for search input */
  private setupSearchInputClearButton(searchInput: HTMLInputElement): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Clean up any existing listeners first
    this.cleanupSearchInputListeners();

    // Find the search container (could be parent or a wrapper)
    let searchContainer = searchInput.parentElement;
    if (!searchContainer) return;

    // Remove existing clear button if any
    const existingClear = searchContainer.querySelector('.iti__search-clear');
    if (existingClear) {
      existingClear.remove();
    }

    // Create clear button
    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'iti__search-clear';
    clearButton.setAttribute('aria-label', 'Clear search');
    clearButton.innerHTML = `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    clearButton.setAttribute('tabindex', '-1');

    // Make search input container relative if needed
    const containerStyle = globalThis.getComputedStyle(searchContainer);
    if (containerStyle.position === 'static') {
      searchContainer.style.position = 'relative';
    }

    // Append clear button to container
    searchContainer.appendChild(clearButton);

    // Show/hide clear button based on input value
    const updateClearButton = () => {
      if (searchInput.value.trim()) {
        clearButton.style.display = 'flex';
      } else {
        clearButton.style.display = 'none';
      }
    };

    // Clear input when button is clicked
    const handleClear = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      searchInput.value = '';
      // Trigger input event to update the country list
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.dispatchEvent(new Event('keyup', { bubbles: true }));
      searchInput.focus();
      updateClearButton();
    };

    const handleMousedown = (e: Event) => e.preventDefault();
    const handlePaste = () => {
      setTimeout(() => {
        sanitizeSearchInput();
        updateClearButton();
      }, 0);
    };

    // Sanitize search input by removing any "+" characters to allow dial code matching (e.g. "+91" becomes "91")
    const sanitizeSearchInput = () => {
      if (searchInput.value.includes('+')) {
        searchInput.value = searchInput.value.replace(/\+/g, '');
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        searchInput.dispatchEvent(new Event('keyup', { bubbles: true }));
      }
    };

    // Add event listeners and track cleanup functions
    clearButton.addEventListener('click', handleClear);
    this.searchInputCleanupFunctions.push(() => clearButton.removeEventListener('click', handleClear));

    clearButton.addEventListener('mousedown', handleMousedown);
    this.searchInputCleanupFunctions.push(() => clearButton.removeEventListener('mousedown', handleMousedown));

    // Update button visibility on input
    searchInput.addEventListener('input', updateClearButton);
    this.searchInputCleanupFunctions.push(() => searchInput.removeEventListener('input', updateClearButton));

    searchInput.addEventListener('input', sanitizeSearchInput);
    this.searchInputCleanupFunctions.push(() => searchInput.removeEventListener('input', sanitizeSearchInput));

    searchInput.addEventListener('keyup', updateClearButton);
    this.searchInputCleanupFunctions.push(() => searchInput.removeEventListener('keyup', updateClearButton));

    searchInput.addEventListener('keyup', sanitizeSearchInput);
    this.searchInputCleanupFunctions.push(() => searchInput.removeEventListener('keyup', sanitizeSearchInput));

    searchInput.addEventListener('focus', updateClearButton);
    this.searchInputCleanupFunctions.push(() => searchInput.removeEventListener('focus', updateClearButton));

    searchInput.addEventListener('paste', handlePaste);
    this.searchInputCleanupFunctions.push(() => searchInput.removeEventListener('paste', handlePaste));

    // Initial state
    updateClearButton();
  }

  /** Clean up search input event listeners to prevent memory leaks */
  private cleanupSearchInputListeners(): void {
    this.searchInputCleanupFunctions.forEach(cleanup => cleanup());
    this.searchInputCleanupFunctions = [];
  }

  /** Setup observer to watch for dropdown changes and apply theme */
  private setupDropdownThemeObserver(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (globalThis.window === undefined || !globalThis.MutationObserver) return;

    // Only create observer if it doesn't already exist
    if (this.themeObserver) return;

    try {
      this.themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === 1) {
                const element = node as HTMLElement;
                if (element.classList?.contains('iti__country-list')) {
                  this.updateDropdownTheme(element);
                } else if (element.classList?.contains('iti') || element.querySelector?.('.iti__country-list')) {
                  const countryList = element.querySelector('.iti__country-list') as HTMLElement | null;
                  if (countryList) {
                    this.updateDropdownTheme(countryList);
                  }
                }
              }
            });
          }
        });
      });

      if (this.themeObserver && document.body) {
        this.themeObserver.observe(document.body, {
          childList: true,
          subtree: false
        });
      }
    } catch (error) {
      // Fallback for browsers without MutationObserver support
      this.reportNonCriticalError('setupDropdownThemeObserver', error);
      this.themeObserver = null;
    }
  }

  /** Setup observer to watch for global theme changes on html/body */
  private setupGlobalThemeObserver(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Watch for class changes on document.documentElement (html tag)
    // This supports Tailwind and other class-based theming systems
    const target = document.documentElement;
    if (!target || !globalThis.MutationObserver) return;

    this.globalThemeObserver = new MutationObserver((mutations) => {
      // Only re-check if we are in auto mode
      const themeConfig = this.themeSignal() ?? this.theme;
      if (themeConfig === 'auto') {
        this.detectAndApplyTheme();
      }
    });

    this.globalThemeObserver.observe(target, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });
  }

  private getThemeDropdownElement(preferredDropdown?: HTMLElement): HTMLElement | null {
    if (typeof document === 'undefined') return null;
    if (preferredDropdown?.classList?.contains('iti__country-list')) return preferredDropdown;

    const hostItiContainer = this.inputRef?.nativeElement.closest('.iti');
    const localDropdown = hostItiContainer?.querySelector?.('.iti__country-list') as HTMLElement | null;
    if (localDropdown) return localDropdown;

    // Fallback to currently visible dropdown for body-attached mode.
    return document.querySelector('.iti__country-list:not(.iti__hide)') as HTMLElement | null;
  }

  private buildValidationErrors(isValid: boolean, isInvalidInternational: boolean): Record<string, boolean> | null {
    if (isValid && !isInvalidInternational) {
      return null;
    }
    if (isInvalidInternational) {
      return { phoneInvalidCountryCode: true, phoneInvalid: false };
    }
    return { phoneInvalid: true, phoneInvalidCountryCode: false };
  }

  private reportNonCriticalError(context: string, error: unknown): void {
    if (typeof console !== 'undefined' && console.debug) {
      console.debug(`[NgxsmkTelInput] ${context}`, error);
    }
  }
}
