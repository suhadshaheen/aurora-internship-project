import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { sectionReducer } from './pages/dashboard/components/section/store/section.reducer';
import { categoryReducer } from './pages/dashboard/components/category/store/category.reducer';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          // darkModeSelector: false,
        },
      },
    }),
    MessageService,
    provideStore(),
    provideEffects(),
    provideStore({
      category: categoryReducer,
      section: sectionReducer,
    }),
    provideHttpClient(),
  ],
};
