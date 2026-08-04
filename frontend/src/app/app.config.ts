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
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { commentReducer } from './pages/dashboard/components/comment/store/comment.reducer';
import { CommentEffects } from './pages/dashboard/components/comment/store/comment.effects';
import { AuthEffects } from './pages/login-page/store/auth.effects';
import { authReducer } from './pages/login-page/store/auth.reducer';
import { CategoryEffects } from './pages/dashboard/components/category/store/category.effects';
import { SectionEffects } from './pages/dashboard/components/section/store/section.effects';
import { authInterceptor } from './shared/components/Interceptors/auth.interceptor';
import { UserEffects } from './shared/userStore/user.effects';
import { userReducer } from './shared/userStore/user.reducer';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
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
      users: userReducer,
    }),
    provideEffects(UserEffects, AuthEffects, CommentEffects, CategoryEffects, SectionEffects),
  ],
};
