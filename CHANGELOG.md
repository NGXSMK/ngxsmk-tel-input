# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.8.1] - 2026-06-06

### Added
- **Parent Fieldset Disabled Detection**: Natively intercepts and reacts to parent `<fieldset>` disabled state changes using the `DoCheck` hook to keep the phone input visual styling, accessibility tags (`tabindex="-1"`, `aria-disabled`), and interactivity disabled even when not bound directly.

### Fixed
- **Input Styling Specificity in Disabled State**: Fixed SCSS theme selectors forcing active backgrounds (e.g. white/dark) on disabled inputs, allowing default browser and custom `.form-control:disabled` backgrounds to apply correctly.

## [1.8.0] - 2026-06-06

### Added
- **MatFormFieldControl Integration**: Full native compatibility inside Angular Material `<mat-form-field>` wrappers.
- **Custom CSS Override Support (`cssClass` & `cssClassSignal`)**: Allows passing classes directly to the inner input element for Tailwind CSS and 3rd-party framework styling.
- **showErrorMsg / showErrorMsgSignal**: Toggle visibility of internal validation error elements.
- **excludeCountries / excludeCountriesSignal**: Exclude specific country ISO codes from appearing in the dropdown list.
- **searchPlaceholder / searchPlaceholderSignal**: Customizable placeholder text for the country search input.
- **showFlags / showFlagsSignal**: Hides flags completely from the selected input and country dropdown.
- **searchCountryFlag / searchCountryFlagSignal**: Hides flag icons only within the dropdown list items while maintaining the selected flag display.

### Fixed
- **Validation Error Duplication**: Prevented simultaneous 'phoneInvalid' and 'required' validation errors when input is non-empty.
- **Intermediate Country Switching**: Corrected flag jumping for shared dial codes (e.g. Dominican Republic `+1` switching to `US`) during typing.
- **Search Input Prefixing**: Stripped leading `+` in country search inputs to match dial codes natively.

---


## [1.7.0] - 2026-06-06

### Changed
- **Example Components**: All example components (E-commerce Checkout, User Registration, Profile Management) now default to dark mode theme
- **Demo App**: Default theme changed to dark mode for better visibility and consistency
- **Navigation UI**: Fixed icon and text colors in dark mode navigation menu for better contrast and readability

### Fixed
- **Invalid Country Code False Positive**: Fixed `isInvalidInternationalNumber()` incorrectly flagging valid international numbers whose country code starts with a single-digit prefix that is itself not a country code (e.g. Greece `+30`, France `+33`, Germany `+49`, Australia `+61`, India `+91`). The loop now continues through all 1–3 digit prefix candidates and only flags a number as invalid if none of them produce a valid parse, rather than short-circuiting on the first failure. Non-`+` prefixed (national-format) inputs are also no longer passed through the loop at all.

## [1.6.9] - 2025-01-21

### Added
- **Mobile Responsiveness**: Comprehensive mobile optimization with touch-friendly targets, iOS zoom prevention, and responsive dropdown
- **Accessibility Enhancements**: Full ARIA support, screen reader compatibility, dynamic status messages, keyboard navigation
- **Documentation Dashboard**: Redesigned demo application as a comprehensive documentation dashboard with sidebar navigation
- **Type Safety Improvements**: Replaced all `any` types with specific TypeScript interfaces
- **JSDoc Documentation**: Comprehensive JSDoc comments for all public APIs, methods, and properties
- **SEO Optimization**: Added comprehensive meta tags, Open Graph, Twitter Cards, structured data (JSON-LD), robots.txt, and sitemap.xml
- **Dark/Light Theme Support**: Full theme switching functionality in demo application

### Enhanced
- **Code Quality**: Removed unnecessary comments, improved code organization
- **Component Structure**: Better separation of concerns, improved error handling
- **Performance**: OnPush change detection strategy, optimized event handling, intelligent caching
- **Mobile UX**: Touch-optimized interactions, proper viewport handling, safe area support
- **Accessibility**: Enhanced ARIA attributes, screen reader messages, focus management
- **Documentation**: Updated all markdown files, consolidated documentation, improved README structure

### Fixed
- **Type Safety**: Fixed TypeScript type issues with event handlers and utility functions
- **Mobile Issues**: Fixed iOS zoom on input focus, improved touch target sizes
- **Accessibility**: Fixed ARIA attribute management, improved screen reader support
- **Build Errors**: Fixed template syntax errors with escaped curly braces in code blocks
- **Theme Switching**: Fixed dark/light mode functionality in demo application
- **Public API**: Made accessibility methods public to fix template binding errors

### Technical Improvements
- **Testing**: Comprehensive unit tests for component and service
- **Documentation**: Updated README with theme support, accessibility, and mobile features
- **Code Cleanup**: Removed redundant comments and documentation files
- **Build Configuration**: Updated budget limits for component styles

## [1.6.8] - 2025-10-21

### Added
- **Enhanced Validation**: New invalid country code detection for numbers starting with invalid codes like "11", "99"
- **phoneInvalidCountryCode Error**: New validation error type for invalid country codes
- **parseWithInvalidDetection Method**: Enhanced service method that detects invalid international numbers
- **Invalid Country Code Detection**: Automatic detection when users enter numbers with non-existent country codes
- **Enhanced Error Handling**: Better error states and user feedback for invalid phone number scenarios

### Enhanced
- **Validation Logic**: Improved validation to distinguish between invalid country codes and invalid number formats
- **User Experience**: Better visual feedback for different types of validation errors
- **Error Messages**: More specific error messages for different validation scenarios
- **Demo Application**: Added test section for invalid country code detection

### Fixed
- **Country Code "11" Issue**: Fixed issue where country codes starting with "11" didn't show invalid/valid status
- **Invalid Country Code Handling**: Proper handling of non-existent country codes
- **Validation States**: Improved validation state management for edge cases

### Technical Improvements
- **Service Enhancement**: Added `isInvalidInternationalNumber()` method for better detection
- **Component Updates**: Enhanced component validation logic with new error types
- **Type Safety**: Improved TypeScript types for enhanced validation features
- **Performance**: Optimized validation caching for better performance

### Breaking Changes
- None

### Migration Guide
- No migration required - all changes are backward compatible
- New validation features work automatically with existing implementations
- Enhanced error handling provides better user experience without breaking changes

## [1.6.6] - 2025-10-18

### Added
- **Dark & Light Theme Support**: Comprehensive theme system with automatic detection
- **ThemeService**: Global theme management service with reactive observables
- **Theme Input**: Component-level theme control with `[theme]="'light'|'dark'|'auto'"`
- **System Preference Detection**: Automatic theme detection based on user system settings
- **Persistent Theme Storage**: Saves user theme preference to localStorage
- **CSS Custom Properties**: Enhanced theming with CSS variables for both light and dark modes
- **Theme Documentation**: Comprehensive documentation for theme implementation

### Enhanced
- **Dropdown Styling**: Improved dark mode dropdown appearance and functionality
- **Search Input**: Enhanced search input visibility and functionality in dark mode
- **Text Visibility**: Fixed text visibility issues in both light and dark themes
- **Title Styling**: Improved section title visibility and typography
- **Performance**: Removed hover animations for better performance
- **Accessibility**: Enhanced contrast ratios and focus indicators

### Fixed
- **Dark Mode Dropdown**: Fixed dropdown panel not working properly in dark mode
- **Search Input**: Fixed search input not being visible when typing in dark mode
- **Title Visibility**: Fixed section titles not showing properly
- **Text Contrast**: Improved text contrast for better readability
- **Theme Consistency**: Ensured consistent theming across all components

### Technical Improvements
- **CSS Optimization**: Enhanced CSS with better selectors and performance
- **TypeScript**: Fixed type issues with timeout handling
- **Component Integration**: Improved theme detection and application
- **Global Styling**: Added comprehensive global CSS rules for theme support
- **Observer Pattern**: Implemented MutationObserver for dynamic theme application

### Breaking Changes
- None

### Migration Guide
- No migration required - all changes are backward compatible
- New theme features are optional and work with existing implementations
- Default behavior remains unchanged

## [1.6.5] - Previous Version
- Previous features and improvements
