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
import {  commentReducer } from './pages/dashboard/components/comment/store/comment.reducer';
import { CommentEffects } from './pages/dashboard/components/comment/store/comment.effects';
import { AuthEffects } from './pages/login-page.component/store/auth.effects';
import {  authReducer } from './pages/login-page.component/store/auth.reducer';
import { CategoryEffects } from './pages/dashboard/components/category/store/category.effects';
import { SectionEffects } from './pages/dashboard/components/section/store/section.effects';
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
    provideStore({
      category: categoryReducer,
      section: sectionReducer,
      comment: commentReducer,
      auth: authReducer,
    }),
    provideEffects(
       AuthEffects,
       CommentEffects,
       CategoryEffects,
       SectionEffects,
    ),
    provideHttpClient(),
  ],
};
