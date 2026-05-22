import LoginComponent from './modules/authentication/login/login.component';

import { PerfilModalComponent } from './modules/perfil-modal/perfil-modal.component';
import { PersonalComponent } from './modules/almacen/personal/personal.component';
import { PersonalFormComponent } from './modules/almacen/personal/personal-form/personal-form.component';
import { MaterialComponent } from './modules/almacen/parametrizacion/material/material.component';
import { MaterialFormComponent } from './modules/almacen/parametrizacion/material/material-form/material-form.component';

export const AppAlmacenConfig = [
    LoginComponent,
    PerfilModalComponent,
    //nuevos components
    PersonalComponent,
    PersonalFormComponent,
    MaterialComponent,
    MaterialFormComponent,
]
