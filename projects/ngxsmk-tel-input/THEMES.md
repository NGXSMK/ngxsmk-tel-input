# Theme Variants Documentation

The `ngxsmk-tel-input` component supports multiple theme variants for popular Angular UI libraries.

## Angular Material Theme & MatFormField Integration

The component implements `MatFormFieldControl`, allowing it to be used natively inside Angular Material `<mat-form-field>` components.

### Usage in `<mat-form-field>`

To use the telephone input inside a `<mat-form-field>` wrapper:

1. Import `MatFormFieldModule` and `MatInputModule` (or animations module) in your component or module.
2. Place `<ngxsmk-tel-input>` directly inside `<mat-form-field>`.
3. Wrap it with `<mat-label>` and `<mat-error>` as standard Angular Material fields.

```html
<mat-form-field appearance="outline" style="width: 100%;">
  <mat-label>Phone Number</mat-label>
  <ngxsmk-tel-input
    [formControl]="phoneControl"
    placeholder="Enter phone number">
  </ngxsmk-tel-input>
  <mat-error>Please enter a valid phone number</mat-error>
</mat-form-field>
```

### Standalone Installation (Non-Wrapper)

If you are not wrapping the component in a `<mat-form-field>` but want the traditional standalone Material look:

1. Import the Material theme styles:

```scss
// In your styles.scss or component styles
@import 'ngxsmk-tel-input/themes/material';
```

2. Apply the theme class to your component:

```html
<ngxsmk-tel-input class="ngxsmk-tel-input-material" />
```

### Configuration

Configure the Material theme using dependency injection:

```typescript
import { provideMaterialTheme } from 'ngxsmk-tel-input';

@Component({
  providers: [
    provideMaterialTheme({
      primaryColor: '#3f51b5',
      accentColor: '#ff4081',
      warnColor: '#f44336',
      density: 'comfortable'
    })
  ]
})
export class MyComponent {}
```

### Variants

- **Outline** (default): Material outlined input style
- **Filled**: Material filled input style
- **Sizes**: `sm`, `md` (default), `lg`

### Example

```html
<ngxsmk-tel-input
  class="ngxsmk-tel-input-material"
  [variant]="'outline'"
  [size]="'md'"
  formControlName="phone"
/>
```

## PrimeNG Theme

### Installation

1. Import the PrimeNG theme styles:

```scss
// In your styles.scss or component styles
@import 'ngxsmk-tel-input/themes/primeng';
```

2. Apply the theme class to your component:

```html
<ngxsmk-tel-input class="ngxsmk-tel-input-primeng" />
```

### Configuration

Configure the PrimeNG theme using dependency injection:

```typescript
import { providePrimeNGTheme } from 'ngxsmk-tel-input';

@Component({
  providers: [
    providePrimeNGTheme({
      theme: 'lara-light',
      ripple: true,
      inputStyle: 'outlined'
    })
  ]
})
export class MyComponent {}
```

### Variants

- **Outline** (default): PrimeNG outlined input style
- **Filled**: PrimeNG filled input style
- **Underline**: PrimeNG underline input style
- **Sizes**: `sm`, `md` (default), `lg`

### Theme Colors

Apply PrimeNG theme colors:

```html
<ngxsmk-tel-input
  class="ngxsmk-tel-input-primeng p-primary"
  formControlName="phone"
/>
```

Available color classes:
- `p-primary`
- `p-secondary`
- `p-success`
- `p-info`
- `p-warning`
- `p-danger`

### Dark Theme

```html
<div class="p-dark">
  <ngxsmk-tel-input
    class="ngxsmk-tel-input-primeng"
    formControlName="phone"
  />
</div>
```

### Example

```html
<ngxsmk-tel-input
  class="ngxsmk-tel-input-primeng p-primary"
  [variant]="'outline'"
  [size]="'md'"
  formControlName="phone"
/>
```

## Custom Themes

You can create custom themes by overriding CSS variables:

```scss
.my-custom-theme {
  --tel-bg: #ffffff;
  --tel-fg: #333333;
  --tel-border: #cccccc;
  --tel-ring: #007bff;
  --tel-error: #dc3545;
  --tel-radius: 8px;
  // ... more variables
}
```

## Combining Themes

You can combine multiple theme classes:

```html
<ngxsmk-tel-input
  class="ngxsmk-tel-input-material ngxsmk-tel-input-primeng"
  formControlName="phone"
/>
```

The last class in the list will take precedence.

