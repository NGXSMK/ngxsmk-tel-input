import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { JsonPipe, CommonModule } from '@angular/common';
import { NgxsmkTelInputComponent, IntlTelI18n, CountryMap, CarrierInfo, FormatSuggestion } from 'ngxsmk-tel-input';
import { Subscription } from 'rxjs';
import { TokiForgeService } from '../tokens/tokiforge.service';
import { CheckoutComponent } from '../../../examples/e-commerce-checkout/checkout.component';
import { RegistrationComponent } from '../../../examples/user-registration/registration.component';
import { ProfileComponent } from '../../../examples/profile-management/profile.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, NgxsmkTelInputComponent, JsonPipe, CommonModule, CheckoutComponent, RegistrationComponent, ProfileComponent],
  styleUrls: ['./app.component.scss'],
  template: `


    <div class="flex min-h-screen w-full max-w-full overflow-x-hidden bg-tf-bg-secondary dark:bg-tf-dark-bg-primary transition-colors duration-300" [class.sidebar-open]="sidebarOpen">
      <button 
        class="lg:hidden fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-tf-bg-primary dark:bg-tf-dark-bg-secondary text-tf-text-primary dark:text-tf-dark-text-primary shadow-tf-md flex items-center justify-center hover:bg-tf-bg-tertiary dark:hover:bg-tf-dark-bg-tertiary transition-colors" 
        (click)="toggleSidebar()"
        [attr.aria-label]="sidebarOpen ? 'Close menu' : 'Open menu'"
        [attr.aria-expanded]="sidebarOpen">
        <span class="material-icons text-xl text-tf-text-primary dark:text-tf-dark-text-primary">{{ sidebarOpen ? 'close' : 'menu' }}</span>
      </button>

      <aside class="fixed top-0 left-0 h-screen w-full sm:w-80 lg:w-64 bg-tf-bg-primary dark:bg-tf-dark-bg-secondary border-r border-tf-border-primary dark:border-tf-dark-border-primary shadow-tf-lg z-40 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0" 
             [class.-translate-x-full]="!sidebarOpen"
             [class.translate-x-0]="sidebarOpen">
        <div class="p-4 border-b border-tf-border-primary dark:border-tf-dark-border-primary">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-tf-link to-purple-600 dark:from-tf-dark-link dark:to-purple-400 shadow-tf-md flex items-center justify-center">
                <span class="material-icons text-white text-2xl">phone_android</span>
              </div>
              <div class="flex flex-col">
                <span class="text-lg font-semibold text-tf-text-primary dark:text-tf-dark-text-primary">Ngxsmk Tel Input</span>
                <span class="text-xs text-tf-text-tertiary dark:text-tf-dark-text-tertiary">v1.8.3</span>
              </div>
            </div>
            <button 
              class="lg:hidden w-8 h-8 rounded-full bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary text-tf-text-primary dark:text-tf-dark-text-primary flex items-center justify-center hover:bg-tf-bg-tertiary dark:hover:bg-tf-dark-bg-primary transition-colors" 
              (click)="closeSidebar()"
              aria-label="Close menu">
              <span class="material-icons text-lg">close</span>
            </button>
          </div>
        </div>

        <nav class="flex-1 overflow-y-auto py-2" role="navigation" aria-label="Main navigation">
          <a 
            *ngFor="let item of navItems" 
            class="flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-lg text-tf-text-secondary dark:text-tf-dark-text-secondary hover:bg-tf-bg-tertiary dark:hover:bg-tf-dark-bg-tertiary hover:text-tf-text-primary dark:hover:text-tf-dark-text-primary transition-all duration-200 cursor-pointer" 
            [class.bg-tf-link]="activeSection === item.id"
            [class.text-white]="activeSection === item.id"
            [class.shadow-tf-sm]="activeSection === item.id"
            (click)="scrollToSection(item.id); closeSidebar()"
            [attr.aria-current]="activeSection === item.id ? 'page' : null">
            <span class="material-icons text-xl" [class.text-white]="activeSection === item.id" [class.text-tf-text-secondary]="activeSection !== item.id" [class.dark:text-tf-dark-text-secondary]="activeSection !== item.id">{{ getNavIcon(item.id) }}</span>
            <span class="flex-1 font-medium">{{ item.label }}</span>
          </a>
        </nav>

        <div class="p-4 border-t border-tf-border-primary dark:border-tf-dark-border-primary bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary">
          <div class="flex flex-col gap-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-tf-text-secondary dark:text-tf-dark-text-secondary">Theme</label>
            <div class="flex gap-2 bg-tf-bg-primary dark:bg-tf-dark-bg-secondary p-1 rounded-lg">
              <button 
                class="flex-1 w-10 h-10 rounded-lg flex items-center justify-center text-tf-text-secondary dark:text-tf-dark-text-secondary hover:bg-tf-bg-tertiary dark:hover:bg-tf-dark-bg-tertiary transition-colors" 
                [class.bg-tf-link]="currentTheme === 'light'"
                [class.text-white]="currentTheme === 'light'"
                (click)="setTheme('light')"
                aria-label="Light theme">
                <span class="material-icons text-xl text-tf-text-secondary dark:text-tf-dark-text-secondary">light_mode</span>
              </button>
              <button 
                class="flex-1 w-10 h-10 rounded-lg flex items-center justify-center text-tf-text-secondary dark:text-tf-dark-text-secondary hover:bg-tf-bg-tertiary dark:hover:bg-tf-dark-bg-tertiary transition-colors" 
                [class.bg-tf-link]="currentTheme === 'dark'"
                [class.text-white]="currentTheme === 'dark'"
                (click)="setTheme('dark')"
                aria-label="Dark theme">
                <span class="material-icons text-xl text-tf-text-secondary dark:text-tf-dark-text-secondary">dark_mode</span>
              </button>
              <button 
                class="flex-1 w-10 h-10 rounded-lg flex items-center justify-center text-tf-text-secondary dark:text-tf-dark-text-secondary hover:bg-tf-bg-tertiary dark:hover:bg-tf-dark-bg-tertiary transition-colors" 
                [class.bg-tf-link]="currentTheme === 'auto'"
                [class.text-white]="currentTheme === 'auto'"
                (click)="setTheme('auto')"
                aria-label="Auto theme">
                <span class="material-icons text-xl text-tf-text-secondary dark:text-tf-dark-text-secondary">brightness_auto</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main class="flex-1 w-full min-w-0 ml-0 lg:ml-64 bg-tf-bg-secondary dark:bg-tf-dark-bg-primary transition-colors duration-300 overflow-x-hidden">
        <header class="sticky top-0 z-10 bg-tf-bg-primary dark:bg-tf-dark-bg-secondary border-b border-tf-border-primary dark:border-tf-dark-border-primary shadow-tf-sm">
          <div class="p-4 sm:p-6">
            <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4 sm:mb-6">
              <div class="flex-1">
                <div class="inline-block px-2 py-0.5 sm:px-3 sm:py-1 mb-2 bg-tf-link/10 dark:bg-tf-dark-link/20 border border-tf-link/20 dark:border-tf-dark-link/30 rounded-full text-xs font-semibold uppercase tracking-wider text-tf-link dark:text-tf-dark-link">
                  Documentation
                </div>
                <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-tf-text-primary dark:text-tf-dark-text-primary mb-2">Ngxsmk Tel Input</h1>
                <p class="text-sm sm:text-base text-tf-text-secondary dark:text-tf-dark-text-secondary">NGXSMK Elite Signal-Based Phone Input — High-performance international telephone input component</p>
              </div>
              <div class="flex flex-wrap gap-2 sm:gap-3">
                <a 
                  href="https://github.com/NGXSMK/ngxsmk-tel-input" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-tf-border-primary dark:border-tf-dark-border-primary text-tf-link dark:text-tf-dark-link hover:bg-tf-bg-tertiary dark:hover:bg-tf-dark-bg-tertiary transition-colors font-medium text-sm sm:text-base min-w-[44px]">
                  <span class="material-icons text-base sm:text-lg text-tf-link dark:text-tf-dark-link">code</span>
                  <span class="hidden sm:inline">GitHub</span>
                </a>
                <a 
                  href="https://www.npmjs.com/package/ngxsmk-tel-input" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-tf-border-primary dark:border-tf-dark-border-primary text-tf-link dark:text-tf-dark-link hover:bg-tf-bg-tertiary dark:hover:bg-tf-dark-bg-tertiary transition-colors font-medium text-sm sm:text-base min-w-[44px]">
                  <span class="material-icons text-base sm:text-lg" style="color: inherit;">inventory_2</span>
                  <span class="hidden sm:inline">NPM</span>
                </a>
              </div>
            </div>

            <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-lg p-3 sm:p-4 shadow-tf-sm hover:shadow-tf-md transition-shadow flex items-center gap-2 sm:gap-4">
                <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-tf-link/10 dark:bg-tf-dark-link/20 flex items-center justify-center flex-shrink-0">
                  <span class="material-icons text-xl sm:text-2xl text-tf-link dark:text-tf-dark-link">phone</span>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="text-xl sm:text-2xl font-bold text-tf-text-primary dark:text-tf-dark-text-primary truncate">{{ phoneChangeCount }}</div>
                  <div class="text-xs text-tf-text-tertiary dark:text-tf-dark-text-tertiary uppercase tracking-wider truncate">Phone Changes</div>
                </div>
              </div>
              <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-lg p-3 sm:p-4 shadow-tf-sm hover:shadow-tf-md transition-shadow flex items-center gap-2 sm:gap-4">
                <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-tf-success/10 dark:bg-tf-success/20 flex items-center justify-center flex-shrink-0">
                  <span class="material-icons text-xl sm:text-2xl text-tf-success">check_circle</span>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="text-xl sm:text-2xl font-bold text-tf-text-primary dark:text-tf-dark-text-primary truncate">{{ validPhoneCount }}</div>
                  <div class="text-xs text-tf-text-tertiary dark:text-tf-dark-text-tertiary uppercase tracking-wider truncate">Valid Numbers</div>
                </div>
              </div>
              <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-lg p-3 sm:p-4 shadow-tf-sm hover:shadow-tf-md transition-shadow flex items-center gap-2 sm:gap-4">
                <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-tf-info/10 dark:bg-tf-info/20 flex items-center justify-center flex-shrink-0">
                  <span class="material-icons text-xl sm:text-2xl text-tf-info">public</span>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="text-xl sm:text-2xl font-bold text-tf-text-primary dark:text-tf-dark-text-primary truncate">{{ countryChangeCount }}</div>
                  <div class="text-xs text-tf-text-tertiary dark:text-tf-dark-text-tertiary uppercase tracking-wider truncate">Country Changes</div>
                </div>
              </div>
              <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-lg p-3 sm:p-4 shadow-tf-sm hover:shadow-tf-md transition-shadow flex items-center gap-2 sm:gap-4">
                <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-tf-warning/10 dark:bg-tf-warning/20 flex items-center justify-center flex-shrink-0">
                  <span class="material-icons text-xl sm:text-2xl text-tf-warning">info</span>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="text-xl sm:text-2xl font-bold text-tf-text-primary dark:text-tf-dark-text-primary truncate">v1.8.3</div>
                  <div class="text-xs text-tf-text-tertiary dark:text-tf-dark-text-tertiary uppercase tracking-wider truncate">Version</div>
                </div>
              </div>
            </div>
          </div>
        </header>
        <section id="overview" class="py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div class="mb-6 sm:mb-8">
            <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div class="w-1 h-6 sm:h-8 bg-gradient-to-b from-tf-link to-purple-600 dark:from-tf-dark-link dark:to-purple-400 rounded-full"></div>
              <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-tf-text-primary dark:text-tf-dark-text-primary">Overview</h2>
            </div>
            <p class="text-base sm:text-lg text-tf-text-secondary dark:text-tf-dark-text-secondary max-w-3xl">
              A high-performance, accessible, and feature-rich Angular component for international telephone number input. 
              Built with modern Angular best practices and optimized for production use.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-sm hover:shadow-tf-md transition-all duration-300 text-center border border-tf-border-primary dark:border-tf-dark-border-primary hover:border-tf-link dark:hover:border-tf-dark-link">
              <span class="material-icons text-4xl sm:text-5xl text-tf-link mb-3 sm:mb-4">speed</span>
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-2">Performance Optimized</h3>
              <p class="text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">OnPush change detection strategy reduces change detection cycles by 50%+</p>
            </div>
            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-sm hover:shadow-tf-md transition-all duration-300 text-center border border-tf-border-primary dark:border-tf-dark-border-primary hover:border-tf-link dark:hover:border-tf-dark-link">
              <span class="material-icons text-4xl sm:text-5xl text-tf-link mb-3 sm:mb-4">language</span>
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-2">International Support</h3>
              <p class="text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">Supports all countries with automatic country detection and validation</p>
            </div>
            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-sm hover:shadow-tf-md transition-all duration-300 text-center border border-tf-border-primary dark:border-tf-dark-border-primary hover:border-tf-link dark:hover:border-tf-dark-link">
              <span class="material-icons text-4xl sm:text-5xl text-tf-link mb-3 sm:mb-4">accessibility_new</span>
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-2">Accessible</h3>
              <p class="text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">Full ARIA support, keyboard navigation, and screen reader compatibility</p>
            </div>
            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-sm hover:shadow-tf-md transition-all duration-300 text-center border border-tf-border-primary dark:border-tf-dark-border-primary hover:border-tf-link dark:hover:border-tf-dark-link">
              <span class="material-icons text-4xl sm:text-5xl text-tf-link mb-3 sm:mb-4">palette</span>
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-2">Customizable</h3>
              <p class="text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">Multiple size variants, style options, and theme support</p>
            </div>
            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-sm hover:shadow-tf-md transition-all duration-300 text-center border border-tf-border-primary dark:border-tf-dark-border-primary hover:border-tf-link dark:hover:border-tf-dark-link">
              <span class="material-icons text-4xl sm:text-5xl text-tf-link mb-3 sm:mb-4">workspace_premium</span>
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-2">Lightweight</h3>
              <p class="text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">Optimized bundle size with tree-shaking support</p>
            </div>
            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-sm hover:shadow-tf-md transition-all duration-300 text-center border border-tf-border-primary dark:border-tf-dark-border-primary hover:border-tf-link dark:hover:border-tf-dark-link">
              <span class="material-icons text-4xl sm:text-5xl text-tf-link mb-3 sm:mb-4">sync_alt</span>
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-2">Framework Agnostic Core</h3>
              <p class="text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">Works with any Angular version, with or without Zone.js</p>
            </div>
            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-sm hover:shadow-tf-md transition-all duration-300 text-center border border-tf-border-primary dark:border-tf-dark-border-primary hover:border-tf-link dark:hover:border-tf-dark-link">
              <span class="material-icons text-4xl sm:text-5xl text-tf-link mb-3 sm:mb-4">integration_instructions</span>
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-2">Type Safe</h3>
              <p class="text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">Full TypeScript support with comprehensive type definitions</p>
            </div>
            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-sm hover:shadow-tf-md transition-all duration-300 text-center border border-tf-border-primary dark:border-tf-dark-border-primary hover:border-tf-link dark:hover:border-tf-dark-link">
              <span class="material-icons text-4xl sm:text-5xl text-tf-link mb-3 sm:mb-4">settings_cell</span>
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-2">Mobile Responsive</h3>
              <p class="text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">Optimized for mobile devices with touch-friendly interactions</p>
            </div>
          </div>
        </section>

        <section id="quick-start" class="py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div class="mb-6 sm:mb-8">
            <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div class="w-1 h-6 sm:h-8 bg-gradient-to-b from-tf-link to-purple-600 dark:from-tf-dark-link dark:to-purple-400 rounded-full"></div>
              <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-tf-text-primary dark:text-tf-dark-text-primary">Quick Start</h2>
            </div>
            <p class="text-base sm:text-lg text-tf-text-secondary dark:text-tf-dark-text-secondary max-w-3xl">
              Get started with ngxsmk-tel-input in minutes. Install the package and add it to your Angular application.
            </p>
          </div>

          <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 lg:p-8 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary">
            <h3 class="text-xl sm:text-2xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-4 sm:mb-6">Installation</h3>
            <div class="mb-6 sm:mb-8 rounded-lg overflow-hidden border border-tf-border-primary dark:border-tf-dark-border-primary bg-gray-900 dark:bg-gray-950">
              <div class="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 dark:bg-gray-900 border-b border-tf-border-primary dark:border-tf-dark-border-primary">
                <span class="text-xs font-semibold uppercase tracking-wider text-gray-400">bash</span>
                <button class="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium bg-tf-link/10 dark:bg-tf-dark-link/20 text-tf-link dark:text-tf-dark-link rounded hover:bg-tf-link/20 dark:hover:bg-tf-dark-link/30 transition-colors" (click)="copyCode('npm install ngxsmk-tel-input')" aria-label="Copy code">Copy</button>
              </div>
              <pre class="p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm text-gray-100 font-mono"><code>npm install ngxsmk-tel-input</code></pre>
            </div>

            <h3 class="text-xl sm:text-2xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-4 sm:mb-6">Basic Usage</h3>
            <div class="mb-6 sm:mb-8 rounded-lg overflow-hidden border border-tf-border-primary dark:border-tf-dark-border-primary bg-gray-900 dark:bg-gray-950">
              <div class="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 dark:bg-gray-900 border-b border-tf-border-primary dark:border-tf-dark-border-primary">
                <span class="text-xs font-semibold uppercase tracking-wider text-gray-400">typescript</span>
                <button class="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium bg-tf-link/10 dark:bg-tf-dark-link/20 text-tf-link dark:text-tf-dark-link rounded hover:bg-tf-link/20 dark:hover:bg-tf-dark-link/30 transition-colors" (click)="copyCode(basicUsageCode)" aria-label="Copy code">Copy</button>
              </div>
              <pre class="p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm text-gray-100 font-mono"><code>{{ basicUsageCode }}</code></pre>
            </div>

            <h3 class="text-xl sm:text-2xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-4 sm:mb-6">Live Example</h3>
            <form [formGroup]="basicForm" class="space-y-6">
              <ngxsmk-tel-input
                formControlName="phone"
                label="Phone Number"
                hint="Enter your international phone number"
                [initialCountry]="'US'"
                [preferredCountries]="['US', 'GB', 'AU', 'CA', 'DE', 'FR']"
                [separateDialCode]="true"
                [showClear]="true"
                [size]="'md'"
                [variant]="'outline'"
                [theme]="currentTheme"
                [i18n]="enLabels"
                [localizedCountries]="enCountries"
                (inputChange)="onPhoneChange($event)"
                (countryChange)="onCountryChange($event)">
              </ngxsmk-tel-input>
              
              <div class="bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded-lg p-4 border border-tf-border-primary dark:border-tf-dark-border-primary">
                <h4 class="text-lg font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-3">Form Data:</h4>
                <pre class="text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary font-mono overflow-x-auto">{{ basicForm.value | json }}</pre>
              </div>
            </form>
          </div>
        </section>

        <section id="variants" class="py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div class="mb-6 sm:mb-8">
            <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div class="w-1 h-6 sm:h-8 bg-gradient-to-b from-tf-link to-purple-600 dark:from-tf-dark-link dark:to-purple-400 rounded-full"></div>
              <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-tf-text-primary dark:text-tf-dark-text-primary">Size & Style Variants</h2>
            </div>
            <p class="text-base sm:text-lg text-tf-text-secondary dark:text-tf-dark-text-secondary max-w-3xl">
              Choose from multiple size and style variants to match your design system.
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary">
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-4 sm:mb-6">Sizes</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-tf-text-secondary dark:text-tf-dark-text-secondary mb-2">Small</label>
                  <ngxsmk-tel-input [size]="'sm'" [variant]="'outline'" [theme]="currentTheme" placeholder="Small input"></ngxsmk-tel-input>
                </div>
                <div>
                  <label class="block text-sm font-medium text-tf-text-secondary dark:text-tf-dark-text-secondary mb-2">Medium</label>
                  <ngxsmk-tel-input [size]="'md'" [variant]="'outline'" [theme]="currentTheme" placeholder="Medium input"></ngxsmk-tel-input>
                </div>
                <div>
                  <label class="block text-sm font-medium text-tf-text-secondary dark:text-tf-dark-text-secondary mb-2">Large</label>
                  <ngxsmk-tel-input [size]="'lg'" [variant]="'outline'" [theme]="currentTheme" placeholder="Large input"></ngxsmk-tel-input>
                </div>
              </div>
            </div>

            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary">
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-4 sm:mb-6">Styles</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-tf-text-secondary dark:text-tf-dark-text-secondary mb-2">Outline</label>
                  <ngxsmk-tel-input [variant]="'outline'" [theme]="currentTheme" placeholder="Outline style"></ngxsmk-tel-input>
                </div>
                <div>
                  <label class="block text-sm font-medium text-tf-text-secondary dark:text-tf-dark-text-secondary mb-2">Filled</label>
                  <ngxsmk-tel-input [variant]="'filled'" [theme]="currentTheme" placeholder="Filled style"></ngxsmk-tel-input>
                </div>
                <div>
                  <label class="block text-sm font-medium text-tf-text-secondary dark:text-tf-dark-text-secondary mb-2">Underline</label>
                  <ngxsmk-tel-input [variant]="'underline'" [theme]="currentTheme" placeholder="Underline style"></ngxsmk-tel-input>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" class="py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div class="mb-6 sm:mb-8">
            <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div class="w-1 h-6 sm:h-8 bg-gradient-to-b from-tf-link to-purple-600 dark:from-tf-dark-link dark:to-purple-400 rounded-full"></div>
              <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-tf-text-primary dark:text-tf-dark-text-primary">Features</h2>
            </div>
            <p class="text-base sm:text-lg text-tf-text-secondary dark:text-tf-dark-text-secondary max-w-3xl">
              Comprehensive feature set for international phone number input and validation.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary hover:shadow-tf-lg transition-all duration-300">
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-3 sm:mb-4">Performance</h3>
              <ul class="space-y-2 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>OnPush change detection</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>LRU cache for validation</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Debounced input handling</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Memory leak prevention</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Zoneless Angular support</span>
                </li>
              </ul>
            </div>

            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary hover:shadow-tf-lg transition-all duration-300">
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-3 sm:mb-4">International</h3>
              <ul class="space-y-2 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>All countries supported</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Automatic country detection</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Preferred countries list</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Localized country names</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>E.164 format output</span>
                </li>
              </ul>
            </div>

            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary hover:shadow-tf-lg transition-all duration-300">
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-3 sm:mb-4">Accessibility</h3>
              <ul class="space-y-2 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Full ARIA support</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Keyboard navigation</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Screen reader compatible</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Focus management</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Status announcements</span>
                </li>
              </ul>
            </div>

            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary hover:shadow-tf-lg transition-all duration-300">
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-3 sm:mb-4">Customization</h3>
              <ul class="space-y-2 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Multiple size variants</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Style options (outline, filled, underline)</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Theme support (light, dark, auto)</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Material & PrimeNG themes</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Custom CSS variables</span>
                </li>
              </ul>
            </div>

            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary hover:shadow-tf-lg transition-all duration-300">
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-3 sm:mb-4">Validation</h3>
              <ul class="space-y-2 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Built-in libphonenumber-js validation</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Invalid country code detection</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Reactive & template-driven forms</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Custom validators support</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Real-time validation feedback</span>
                </li>
              </ul>
            </div>

            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary hover:shadow-tf-lg transition-all duration-300">
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-3 sm:mb-4">Mobile</h3>
              <ul class="space-y-2 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Touch-optimized controls</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Prevents iOS zoom</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Responsive dropdown</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Safe area insets support</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Optimized touch interactions</span>
                </li>
              </ul>
            </div>

            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary hover:shadow-tf-lg transition-all duration-300">
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-3 sm:mb-4">Intelligence</h3>
              <ul class="space-y-2 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Carrier detection</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Number type detection</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Format suggestions</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Mobile/landline detection</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Toll-free & VoIP detection</span>
                </li>
              </ul>
            </div>

            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary hover:shadow-tf-lg transition-all duration-300">
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-3 sm:mb-4">Signals API</h3>
              <ul class="space-y-2 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Signal-based inputs</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Signal-based outputs</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Computed state signals</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Reactive state management</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Full backward compatibility</span>
                </li>
              </ul>
            </div>

            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary hover:shadow-tf-lg transition-all duration-300">
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-3 sm:mb-4">Integrations</h3>
              <ul class="space-y-2 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Twilio verification</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Vonage (Nexmo) support</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>AWS SNS integration</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Ionic & Capacitor optimized</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Custom verification services</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Extensible architecture</span>
                </li>
              </ul>
            </div>

            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary hover:shadow-tf-lg transition-all duration-300">
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-3 sm:mb-4">Developer Tools</h3>
              <ul class="space-y-2 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Chrome DevTools extension</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Testing utilities & mocks</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Angular CLI schematics</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>E2E testing helpers</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-tf-link dark:text-tf-dark-link mt-1">•</span>
                  <span>Enhanced TypeScript types</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="api" class="py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div class="mb-6 sm:mb-8">
            <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div class="w-1 h-6 sm:h-8 bg-gradient-to-b from-tf-link to-purple-600 dark:from-tf-dark-link dark:to-purple-400 rounded-full"></div>
              <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-tf-text-primary dark:text-tf-dark-text-primary">API Reference</h2>
            </div>
            <p class="text-base sm:text-lg text-tf-text-secondary dark:text-tf-dark-text-secondary max-w-3xl">
              Complete API documentation for all inputs, outputs, and methods.
            </p>
          </div>

          <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 lg:p-8 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary">
            <h3 class="text-xl sm:text-2xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-4 sm:mb-6">Inputs</h3>
            <div class="overflow-x-auto mb-6 sm:mb-8 -mx-4 sm:mx-0">
              <div class="inline-block min-w-full align-middle">
                <table class="min-w-full border-collapse">
                  <thead>
                    <tr class="border-b-2 border-tf-border-primary dark:border-tf-dark-border-primary">
                      <th class="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-xs sm:text-sm text-tf-text-primary dark:text-tf-dark-text-primary">Property</th>
                      <th class="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-xs sm:text-sm text-tf-text-primary dark:text-tf-dark-text-primary">Type</th>
                      <th class="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-xs sm:text-sm text-tf-text-primary dark:text-tf-dark-text-primary hidden md:table-cell">Default</th>
                      <th class="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-xs sm:text-sm text-tf-text-primary dark:text-tf-dark-text-primary">Description</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-tf-border-primary dark:divide-tf-dark-border-primary">
                    <tr class="hover:bg-tf-bg-secondary dark:hover:bg-tf-dark-bg-tertiary transition-colors">
                      <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">size</code></td>
                      <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">'sm' | 'md' | 'lg'</code></td>
                      <td class="py-2 sm:py-3 px-2 sm:px-4 hidden md:table-cell"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">'md'</code></td>
                      <td class="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">Size variant of the input</td>
                    </tr>
                    <tr class="hover:bg-tf-bg-secondary dark:hover:bg-tf-dark-bg-tertiary transition-colors">
                    <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">variant</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">'outline' | 'filled' | 'underline'</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4 hidden md:table-cell"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">'outline'</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">Style variant of the input</td>
                  </tr>
                  <tr class="hover:bg-tf-bg-secondary dark:hover:bg-tf-dark-bg-tertiary transition-colors">
                    <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">initialCountry</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">string</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4 hidden md:table-cell"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">undefined</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">Initial country code (ISO2)</td>
                  </tr>
                  <tr class="hover:bg-tf-bg-secondary dark:hover:bg-tf-dark-bg-tertiary transition-colors">
                    <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">preferredCountries</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">string[]</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4 hidden md:table-cell"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">[]</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">List of preferred country codes</td>
                  </tr>
                  <tr class="hover:bg-tf-bg-secondary dark:hover:bg-tf-dark-bg-tertiary transition-colors">
                    <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">separateDialCode</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">boolean</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4 hidden md:table-cell"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">false</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">Show dial code separately</td>
                  </tr>
                  <tr class="hover:bg-tf-bg-secondary dark:hover:bg-tf-dark-bg-tertiary transition-colors">
                    <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">showClear</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">boolean</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4 hidden md:table-cell"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">false</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">Show clear button</td>
                  </tr>
                  <tr class="hover:bg-tf-bg-secondary dark:hover:bg-tf-dark-bg-tertiary transition-colors">
                    <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">theme</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">'light' | 'dark' | 'auto'</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4 hidden md:table-cell"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">'auto'</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">Theme preference</td>
                  </tr>
                  <tr class="hover:bg-tf-bg-secondary dark:hover:bg-tf-dark-bg-tertiary transition-colors">
                    <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">enableIntelligence</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">boolean</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4 hidden md:table-cell"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">false</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">Enable carrier and number type detection</td>
                  </tr>
                  <tr class="hover:bg-tf-bg-secondary dark:hover:bg-tf-dark-bg-tertiary transition-colors">
                    <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">enableFormatSuggestions</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">boolean</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4 hidden md:table-cell"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">false</code></td>
                    <td class="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">Enable format correction suggestions</td>
                  </tr>
                </tbody>
              </table>
              </div>
            </div>

            <h3 class="text-xl sm:text-2xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-4 sm:mb-6">Outputs</h3>
            <div class="overflow-x-auto -mx-4 sm:mx-0">
              <div class="inline-block min-w-full align-middle">
                <table class="min-w-full border-collapse">
                  <thead>
                    <tr class="border-b-2 border-tf-border-primary dark:border-tf-dark-border-primary">
                      <th class="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-xs sm:text-sm text-tf-text-primary dark:text-tf-dark-text-primary">Event</th>
                      <th class="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-xs sm:text-sm text-tf-text-primary dark:text-tf-dark-text-primary">Type</th>
                      <th class="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-xs sm:text-sm text-tf-text-primary dark:text-tf-dark-text-primary">Description</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-tf-border-primary dark:divide-tf-dark-border-primary">
                    <tr class="hover:bg-tf-bg-secondary dark:hover:bg-tf-dark-bg-tertiary transition-colors">
                      <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">inputChange</code></td>
                      <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono break-all">{{ '{' }} raw: string; e164: string | null; iso2: string {{ '}' }}</code></td>
                      <td class="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">Emitted when input value changes</td>
                    </tr>
                    <tr class="hover:bg-tf-bg-secondary dark:hover:bg-tf-dark-bg-tertiary transition-colors">
                      <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">countryChange</code></td>
                      <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">{{ '{' }} iso2: string {{ '}' }}</code></td>
                      <td class="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">Emitted when country selection changes</td>
                    </tr>
                    <tr class="hover:bg-tf-bg-secondary dark:hover:bg-tf-dark-bg-tertiary transition-colors">
                      <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">validityChange</code></td>
                      <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">boolean</code></td>
                      <td class="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">Emitted when validation status changes</td>
                    </tr>
                    <tr class="hover:bg-tf-bg-secondary dark:hover:bg-tf-dark-bg-tertiary transition-colors">
                      <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">intelligenceChange</code></td>
                      <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">CarrierInfo | null</code></td>
                      <td class="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">Emitted when carrier information is detected (requires enableIntelligence)</td>
                    </tr>
                    <tr class="hover:bg-tf-bg-secondary dark:hover:bg-tf-dark-bg-tertiary transition-colors">
                      <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">formatSuggestion</code></td>
                      <td class="py-2 sm:py-3 px-2 sm:px-4"><code class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded text-xs sm:text-sm text-tf-link dark:text-tf-dark-link font-mono">FormatSuggestion | null</code></td>
                      <td class="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary">Emitted when format correction is suggested (requires enableFormatSuggestions)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section id="examples" class="py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div class="mb-6 sm:mb-8">
            <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div class="w-1 h-6 sm:h-8 bg-gradient-to-b from-tf-link to-purple-600 dark:from-tf-dark-link dark:to-purple-400 rounded-full"></div>
              <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-tf-text-primary dark:text-tf-dark-text-primary">Examples</h2>
            </div>
            <p class="text-base sm:text-lg text-tf-text-secondary dark:text-tf-dark-text-secondary max-w-3xl">
              Explore various use cases and implementation examples.
            </p>
          </div>

          <div class="space-y-6">
            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary">
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-4 sm:mb-6">Theme Variants</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-tf-text-secondary dark:text-tf-dark-text-secondary mb-2">Light Theme</label>
                  <ngxsmk-tel-input 
                    [theme]="resolvedTheme"
                    placeholder="Light theme input"
                    [size]="'md'"
                    [variant]="'outline'">
                  </ngxsmk-tel-input>
                </div>
                <div>
                  <label class="block text-sm font-medium text-tf-text-secondary dark:text-tf-dark-text-secondary mb-2">Dark Theme</label>
                  <ngxsmk-tel-input 
                    [theme]="resolvedTheme"
                    placeholder="Dark theme input"
                    [size]="'md'"
                    [variant]="'outline'">
                  </ngxsmk-tel-input>
                </div>
                <div>
                  <label class="block text-sm font-medium text-tf-text-secondary dark:text-tf-dark-text-secondary mb-2">Auto Theme</label>
                  <ngxsmk-tel-input 
                    [theme]="resolvedTheme"
                    placeholder="Auto theme input"
                    [size]="'md'"
                    [variant]="'outline'">
                  </ngxsmk-tel-input>
                </div>
              </div>
            </div>

            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary">
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-3 sm:mb-4">Preferred Countries</h3>
              <p class="text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary mb-3 sm:mb-4">
                Show specific countries at the top of the dropdown list for easier selection.
              </p>
              <form [formGroup]="preferredCountriesForm" class="space-y-4">
                <ngxsmk-tel-input
                  formControlName="phone"
                  label="Phone Number"
                  hint="Preferred countries: US, GB, AU, CA, DE, FR"
                  [initialCountry]="'US'"
                  [preferredCountries]="['US', 'GB', 'AU', 'CA', 'DE', 'FR']"
                  [size]="'md'"
                  [variant]="'outline'"
                  [theme]="resolvedTheme"
                  [i18n]="enLabels"
                  [localizedCountries]="enCountries">
                </ngxsmk-tel-input>
                <div class="bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded-lg p-3 border border-tf-border-primary dark:border-tf-dark-border-primary">
                  <p class="text-xs text-tf-text-tertiary dark:text-tf-dark-text-tertiary font-mono">{{ preferredCountriesForm.value | json }}</p>
                </div>
              </form>
            </div>

            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary">
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-3 sm:mb-4">Separate Dial Code</h3>
              <p class="text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary mb-3 sm:mb-4">
                Display the dial code separately from the phone number input for better clarity.
              </p>
              <form [formGroup]="separateDialCodeForm" class="space-y-4">
                <ngxsmk-tel-input
                  formControlName="phone"
                  label="Phone Number"
                  hint="Dial code is shown separately"
                  [initialCountry]="'US'"
                  [separateDialCode]="true"
                  [size]="'md'"
                  [variant]="'outline'"
                  [theme]="resolvedTheme"
                  [i18n]="enLabels"
                  [localizedCountries]="enCountries">
                </ngxsmk-tel-input>
                <div class="bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded-lg p-3 border border-tf-border-primary dark:border-tf-dark-border-primary">
                  <p class="text-xs text-tf-text-tertiary dark:text-tf-dark-text-tertiary font-mono">{{ separateDialCodeForm.value | json }}</p>
                </div>
              </form>
            </div>

            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary">
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-3 sm:mb-4">Clear Button</h3>
              <p class="text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary mb-3 sm:mb-4">
                Enable a clear button to quickly reset the input value.
              </p>
              <form [formGroup]="clearButtonForm" class="space-y-4">
                <ngxsmk-tel-input
                  formControlName="phone"
                  label="Phone Number"
                  hint="Click the X button to clear"
                  [initialCountry]="'US'"
                  [showClear]="true"
                  [size]="'md'"
                  [variant]="'outline'"
                  [theme]="resolvedTheme"
                  [i18n]="enLabels"
                  [localizedCountries]="enCountries">
                </ngxsmk-tel-input>
                <div class="bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded-lg p-3 border border-tf-border-primary dark:border-tf-dark-border-primary">
                  <p class="text-xs text-tf-text-tertiary dark:text-tf-dark-text-tertiary font-mono">{{ clearButtonForm.value | json }}</p>
                </div>
              </form>
            </div>

            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary">
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-3 sm:mb-4">Event Handling</h3>
              <p class="text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary mb-3 sm:mb-4">
                Listen to input and country change events for real-time updates.
              </p>
              <form [formGroup]="eventHandlingForm" class="space-y-4">
                <ngxsmk-tel-input
                  formControlName="phone"
                  label="Phone Number"
                  hint="Watch the events below as you type"
                  [initialCountry]="'US'"
                  [separateDialCode]="true"
                  [showClear]="true"
                  [size]="'md'"
                  [variant]="'outline'"
                  [theme]="resolvedTheme"
                  [i18n]="enLabels"
                  [localizedCountries]="enCountries"
                  (inputChange)="onEventInputChange($event)"
                  (countryChange)="onEventCountryChange($event)">
                </ngxsmk-tel-input>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded-lg p-4 border border-tf-border-primary dark:border-tf-dark-border-primary">
                    <h4 class="text-sm font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-2">Input Change Event:</h4>
                    <pre class="text-xs text-tf-text-secondary dark:text-tf-dark-text-secondary font-mono overflow-x-auto">{{ lastInputEvent | json }}</pre>
                  </div>
                  <div class="bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded-lg p-4 border border-tf-border-primary dark:border-tf-dark-border-primary">
                    <h4 class="text-sm font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-2">Country Change Event:</h4>
                    <pre class="text-xs text-tf-text-secondary dark:text-tf-dark-text-secondary font-mono overflow-x-auto">{{ lastCountryEvent | json }}</pre>
                  </div>
                </div>
              </form>
            </div>

            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary">
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-3 sm:mb-4">Validation Test</h3>
              <p class="text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary mb-3 sm:mb-4">
                This demonstrates invalid country code detection. Try entering numbers like "1123456789" or "99123456789".
              </p>
              <form [formGroup]="testForm" class="space-y-4">
                <ngxsmk-tel-input
                  formControlName="invalidCountryCode"
                  label="Test Invalid Country Code"
                  hint="Try entering '1123456789' or '99123456789'"
                  [initialCountry]="'US'"
                  [separateDialCode]="true"
                  [showClear]="true"
                  [size]="'md'"
                  [variant]="'outline'"
                  [theme]="resolvedTheme"
                  [i18n]="enLabels"
                  [localizedCountries]="enCountries"
                  (inputChange)="onTestPhoneChange($event)"
                  (countryChange)="onTestCountryChange($event)">
                </ngxsmk-tel-input>
                
                <div class="bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded-lg p-4 border border-tf-border-primary dark:border-tf-dark-border-primary">
                  <h4 class="text-sm font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-3">Form Validation:</h4>
                  <pre class="text-xs text-tf-text-secondary dark:text-tf-dark-text-secondary font-mono mb-3 overflow-x-auto">{{ testForm.get('invalidCountryCode')?.errors | json }}</pre>
                  <div class="flex gap-4">
                    <p class="text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary"><strong class="text-tf-text-primary dark:text-tf-dark-text-primary">Form Valid:</strong> {{ testForm.valid ? 'Yes' : 'No' }}</p>
                    <p class="text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary"><strong class="text-tf-text-primary dark:text-tf-dark-text-primary">Control Valid:</strong> {{ testForm.get('invalidCountryCode')?.valid ? 'Yes' : 'No' }}</p>
                  </div>
                </div>
              </form>
            </div>

            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary">
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-3 sm:mb-4">All Features Combined</h3>
              <p class="text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary mb-3 sm:mb-4">
                Example with all features enabled: preferred countries, separate dial code, clear button, and event handling.
              </p>
              <form [formGroup]="basicForm" class="space-y-4">
                <ngxsmk-tel-input
                  formControlName="phone"
                  label="Full Featured Example"
                  hint="All features enabled"
                  [initialCountry]="'US'"
                  [preferredCountries]="['US', 'GB', 'AU', 'CA', 'DE', 'FR']"
                  [separateDialCode]="true"
                  [showClear]="true"
                  [size]="'md'"
                  [variant]="'outline'"
                  [theme]="resolvedTheme"
                  [i18n]="enLabels"
                  [localizedCountries]="enCountries"
                  (inputChange)="onPhoneChange($event)"
                  (countryChange)="onCountryChange($event)">
                </ngxsmk-tel-input>
                <div class="bg-tf-bg-secondary dark:bg-tf-dark-bg-tertiary rounded-lg p-4 border border-tf-border-primary dark:border-tf-dark-border-primary">
                  <h4 class="text-sm font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-2">Form Data:</h4>
                  <pre class="text-xs text-tf-text-secondary dark:text-tf-dark-text-secondary font-mono overflow-x-auto">{{ basicForm.value | json }}</pre>
                </div>
              </form>
            </div>

            <!-- E-commerce Checkout Example -->
            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary">
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-3 sm:mb-4">E-commerce Checkout</h3>
              <p class="text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary mb-3 sm:mb-4">
                Real-world example of phone input in an e-commerce checkout form with shipping information.
              </p>
              <app-checkout [theme]="resolvedTheme"></app-checkout>
            </div>

            <!-- User Registration Example -->
            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary">
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-3 sm:mb-4">User Registration</h3>
              <p class="text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary mb-3 sm:mb-4">
                Registration form with phone intelligence features enabled (carrier detection and format suggestions).
              </p>
              <app-registration [theme]="resolvedTheme"></app-registration>
            </div>

            <!-- Profile Management Example -->
            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary">
              <h3 class="text-lg sm:text-xl font-semibold text-tf-text-primary dark:text-tf-dark-text-primary mb-3 sm:mb-4">Profile Management</h3>
              <p class="text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary mb-3 sm:mb-4">
                Profile settings form with phone intelligence to detect number type and carrier information.
              </p>
              <app-profile [theme]="resolvedTheme"></app-profile>
            </div>
          </div>
        </section>

        <section id="statistics" class="py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div class="mb-6 sm:mb-8">
            <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div class="w-1 h-6 sm:h-8 bg-gradient-to-b from-tf-link to-purple-600 dark:from-tf-dark-link dark:to-purple-400 rounded-full"></div>
              <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-tf-text-primary dark:text-tf-dark-text-primary">Live Statistics</h2>
            </div>
            <p class="text-base sm:text-lg text-tf-text-secondary dark:text-tf-dark-text-secondary max-w-3xl">
              Real-time statistics from the demo interactions.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary hover:shadow-tf-lg transition-all duration-300 flex items-center gap-3 sm:gap-4">
              <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-tf-link/10 dark:bg-tf-dark-link/20 flex items-center justify-center flex-shrink-0">
                <span class="material-icons text-2xl sm:text-3xl text-tf-link dark:text-tf-dark-link">phone</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-xl sm:text-2xl font-bold text-tf-text-primary dark:text-tf-dark-text-primary truncate">{{ phoneChangeCount }}</div>
                <div class="text-xs text-tf-text-tertiary dark:text-tf-dark-text-tertiary uppercase tracking-wider truncate">Phone Changes</div>
              </div>
            </div>
            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary hover:shadow-tf-lg transition-all duration-300 flex items-center gap-3 sm:gap-4">
              <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-tf-success/10 dark:bg-tf-success/20 flex items-center justify-center flex-shrink-0">
                <span class="material-icons text-2xl sm:text-3xl text-tf-success">check_circle</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-xl sm:text-2xl font-bold text-tf-text-primary dark:text-tf-dark-text-primary truncate">{{ validPhoneCount }}</div>
                <div class="text-xs text-tf-text-tertiary dark:text-tf-dark-text-tertiary uppercase tracking-wider truncate">Valid Numbers</div>
              </div>
            </div>
            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary hover:shadow-tf-lg transition-all duration-300 flex items-center gap-3 sm:gap-4">
              <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-tf-info/10 dark:bg-tf-info/20 flex items-center justify-center flex-shrink-0">
                <span class="material-icons text-2xl sm:text-3xl text-tf-info">public</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-xl sm:text-2xl font-bold text-tf-text-primary dark:text-tf-dark-text-primary truncate">{{ countryChangeCount }}</div>
                <div class="text-xs text-tf-text-tertiary dark:text-tf-dark-text-tertiary uppercase tracking-wider truncate">Country Changes</div>
              </div>
            </div>
            <div class="bg-tf-bg-primary dark:bg-tf-dark-bg-secondary rounded-xl p-4 sm:p-6 shadow-tf-md border border-tf-border-primary dark:border-tf-dark-border-primary hover:shadow-tf-lg transition-all duration-300 flex items-center gap-3 sm:gap-4">
              <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-tf-warning/10 dark:bg-tf-warning/20 flex items-center justify-center flex-shrink-0">
                <span class="material-icons text-2xl sm:text-3xl text-tf-warning">call</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-base sm:text-lg font-bold text-tf-text-primary dark:text-tf-dark-text-primary truncate">{{ lastPhoneNumber || 'None' }}</div>
                <div class="text-xs text-tf-text-tertiary dark:text-tf-dark-text-tertiary uppercase tracking-wider truncate">Last Number</div>
              </div>
            </div>
          </div>
        </section>

        <footer class="py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 bg-tf-bg-primary dark:bg-tf-dark-bg-secondary border-t border-tf-border-primary dark:border-tf-dark-border-primary" role="contentinfo">
          <div class="max-w-7xl mx-auto text-center">
            <p class="text-xs sm:text-sm text-tf-text-secondary dark:text-tf-dark-text-secondary mb-4 sm:mb-6 px-2">Built with modern Angular 17+ | High-Performance & Accessible | Optimized for performance and accessibility</p>
            <div class="flex flex-wrap justify-center gap-4 sm:gap-6 mb-4 sm:mb-6">
              <a href="https://github.com/NGXSMK/ngxsmk-tel-input" target="_blank" rel="noopener noreferrer" class="text-tf-link dark:text-tf-dark-link hover:text-tf-link-hover dark:hover:text-tf-dark-link-hover transition-colors font-medium text-sm sm:text-base">GitHub</a>
              <a href="https://www.npmjs.com/package/ngxsmk-tel-input" target="_blank" rel="noopener noreferrer" class="text-tf-link dark:text-tf-dark-link hover:text-tf-link-hover dark:hover:text-tf-dark-link-hover transition-colors font-medium text-sm sm:text-base">NPM</a>
            </div>
            <div class="pt-4 sm:pt-6 border-t border-tf-border-primary dark:border-tf-dark-border-primary">
              <p class="text-xs text-tf-text-tertiary dark:text-tf-dark-text-tertiary px-2">
                Powered by <a href="https://tokiforge.github.io/tokiforge/" target="_blank" rel="noopener noreferrer" class="text-tf-link dark:text-tf-dark-link hover:text-tf-link-hover dark:hover:text-tf-dark-link-hover font-semibold transition-colors">TokiForge → Design Token & Theme Engine</a>
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly tokiForgeService = inject(TokiForgeService);
  private themeSubscription?: Subscription;
  private currentThemeSubscription?: Subscription;

  sidebarOpen = false;
  activeSection = 'overview';

  basicForm = this.fb.group({
    phone: ['+12025458754', Validators.required]
  });

  testForm = this.fb.group({
    invalidCountryCode: ['', Validators.required]
  });

  preferredCountriesForm = this.fb.group({
    phone: ['', Validators.required]
  });

  separateDialCodeForm = this.fb.group({
    phone: ['', Validators.required]
  });

  clearButtonForm = this.fb.group({
    phone: ['', Validators.required]
  });

  customValidationForm = this.fb.group({
    phone: ['', [Validators.required]]
  });

  eventHandlingForm = this.fb.group({
    phone: ['', Validators.required]
  });

  intelligenceForm = this.fb.group({
    phone: ['', Validators.required]
  });

  lastInputEvent: any = null;
  lastCountryEvent: any = null;
  carrierInfo: CarrierInfo | null = null;
  formatSuggestion: FormatSuggestion | null = null;

  phoneChangeCount = 0;
  validPhoneCount = 0;
  countryChangeCount = 0;
  lastPhoneNumber: string | null = null;

  currentTheme: 'light' | 'dark' | 'auto' = 'auto';
  resolvedTheme: 'light' | 'dark' = 'dark';

  navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'quick-start', label: 'Quick Start' },
    { id: 'variants', label: 'Variants' },
    { id: 'features', label: 'Features' },
    { id: 'api', label: 'API Reference' },
    { id: 'examples', label: 'Examples' },
    { id: 'statistics', label: 'Statistics' }
  ];

  getNavIcon(sectionId: string): string {
    const icons: Record<string, string> = {
      'overview': 'dashboard',
      'quick-start': 'rocket_launch',
      'variants': 'palette',
      'features': 'star',
      'api': 'menu_book',
      'examples': 'lightbulb',
      'statistics': 'bar_chart'
    };
    return icons[sectionId] || 'description';
  }

  basicUsageCode = `import { NgxsmkTelInputComponent } from 'ngxsmk-tel-input';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [NgxsmkTelInputComponent],
  template: \`
    <ngxsmk-tel-input
      [(ngModel)]="phoneNumber"
      [initialCountry]="'US'"
      [separateDialCode]="true">
    </ngxsmk-tel-input>
  \`
})
export class ExampleComponent {
  phoneNumber = '';
}`;

  enLabels: IntlTelI18n = {
    selectedCountryAriaLabel: 'Selected country',
    countryListAriaLabel: 'Country list',
    searchPlaceholder: 'Search country',
    zeroSearchResults: 'No results',
    noCountrySelected: 'No country selected'
  };

  enCountries: CountryMap = {
    US: 'United States',
    GB: 'United Kingdom',
    AU: 'Australia',
    CA: 'Canada',
    DE: 'Germany',
    FR: 'France',
    JP: 'Japan',
    IN: 'India',
    BR: 'Brazil',
    MX: 'Mexico'
  };



  ngOnInit(): void {
    this.themeSubscription = this.tokiForgeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    this.currentThemeSubscription = this.tokiForgeService.currentTheme$.subscribe(resolved => {
      this.resolvedTheme = resolved;
    });

    this.currentTheme = this.tokiForgeService.getTheme();
    this.resolvedTheme = this.tokiForgeService.getCurrentTheme();
    this.handleResize();

    setTimeout(() => {
      this.updateActiveSection();
    }, 100);
  }

  ngOnDestroy(): void {
    this.themeSubscription?.unsubscribe();
    this.currentThemeSubscription?.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.handleResize();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    this.updateActiveSection();
  }

  private handleResize(): void {
    if (window.innerWidth > 768) {
      this.sidebarOpen = false;
      document.body.classList.remove('sidebar-open');
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    this.toggleBodyScroll();
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
    this.toggleBodyScroll();
  }

  private toggleBodyScroll(): void {
    if (this.sidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 220;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });

      setTimeout(() => {
        this.activeSection = sectionId;
        this.updateActiveSection();
      }, 100);
    }
  }

  private updateActiveSection(): void {
    const sections = this.navItems.map(item => document.getElementById(item.id));
    const headerOffset = 220;
    const scrollPosition = window.scrollY + headerOffset;

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section) {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top + window.pageYOffset;
        const sectionBottom = sectionTop + rect.height;

        if (sectionTop <= scrollPosition && sectionBottom >= scrollPosition - headerOffset) {
          this.activeSection = this.navItems[i].id;
          break;
        }
      }
    }
  }

  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.tokiForgeService.setTheme(theme);
  }

  copyCode(code: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        console.log('Code copied to clipboard');
      });
    }
  }

  onPhoneChange(event: { raw: string; e164: string | null; iso2: string }): void {
    this.phoneChangeCount++;
    this.lastPhoneNumber = event.e164 || event.raw;

    if (event.e164) {
      this.validPhoneCount++;
    }

  }

  onCountryChange(event: { iso2: string }): void {
    this.countryChangeCount++;
    console.log('Country changed to:', event.iso2);
  }

  onTestPhoneChange(event: { raw: string; e164: string | null; iso2: string }): void {
    console.log('Test phone change:', event);
  }

  onTestCountryChange(event: { iso2: string }): void {
    console.log('Test country changed to:', event.iso2);
  }

  onEventInputChange(event: { raw: string; e164: string | null; iso2: string }): void {
    this.lastInputEvent = event;
  }

  onEventCountryChange(event: { iso2: string }): void {
    this.lastCountryEvent = event;
  }

  onIntelligenceChange(info: CarrierInfo | null): void {
    this.carrierInfo = info;
    if (info) {
      console.log('Carrier information:', info);
    }
  }

  onFormatSuggestion(suggestion: FormatSuggestion | null): void {
    this.formatSuggestion = suggestion;
    if (suggestion) {
      console.log('Format suggestion:', suggestion);
    }
  }

}
