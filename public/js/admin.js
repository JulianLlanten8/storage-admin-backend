class AdminDashboard {
    constructor() {
        this.currentTab = 'users';
        this.init();
    }

    async init() {
        if (!await Auth.checkAuth()) {
            return;
        }
        
        const user = JSON.parse(localStorage.getItem('user_data'));
        
        if (!Auth.isAdmin()) {
            window.location.href = '/user';
            return;
        }

        document.getElementById('adminEmail').textContent = user.email;
        this.showTab('users');
    }


    showTab(tabName, event) {
        this.currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('bg-blue-100', 'text-blue-700');
            btn.classList.add('text-gray-500', 'hover:text-gray-700');
        });
        
        if (event && event.target) {
            event.target.classList.add('bg-blue-100', 'text-blue-700');
            event.target.classList.remove('text-gray-500', 'hover:text-gray-700');
        }

        // Load tab content
        this.loadTabContent(tabName);
    }

    async loadTabContent(tabName) {
        const container = document.getElementById('tabContent');
        container.innerHTML = '<div class="text-center py-8">Cargando...</div>';

        try {
            switch(tabName) {
                case 'users':
                    await this.loadUsersTab();
                    break;
                case 'groups':
                    await this.loadGroupsTab();
                    break;
                case 'extensions':
                    await this.loadExtensionsTab();
                    break;
                case 'quotas':
                    await this.loadQuotasTab();
                    break;
            }
        } catch (error) {
            container.innerHTML = '<div class="text-center py-8 text-red-500">Error al cargar contenido</div>';
        }
    }

    async loadUsersTab() {
        const result = await ApiService.getUsers();
        const container = document.getElementById('tabContent');
        
        if (result.success) {
            const users = result.data;
            console.log(users)
            container.innerHTML = `
                <div class="bg-white shadow-md rounded-lg p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-semibold">Gestión de Usuarios</h2>
                        <button onclick="adminDashboard.openCreateUserModal()" 
                                class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                            Nuevo Usuario
                        </button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr class="bg-gray-50">
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Almacenamiento</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${users.map(user => `
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap">${user.email}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">${user.group?.name || 'Sin grupo'}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">${Utils.formatFileSize(user.storage_used || 0)} / ${Utils.formatFileSize(user.quota || 0)}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onclick="adminDashboard.editUser(${user.id})" class="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                                            <button onclick="adminDashboard.deleteUser(${user.id})" class="text-red-600 hover:text-red-900">Eliminar</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = '<div class="text-center py-8 text-red-500">Error al cargar usuarios</div>';
        }
    }

    async loadGroupsTab() {
        const result = await ApiService.getGroups();
        const container = document.getElementById('tabContent');
        
        if (result.success) {
            const groups = result.data;
            container.innerHTML = `
                <div class="bg-white shadow-md rounded-lg p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-semibold">Gestión de Grupos</h2>
                        <button onclick="adminDashboard.openCreateGroupModal()" 
                                class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                            Nuevo Grupo
                        </button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr class="bg-gray-50">
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuota</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuarios</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${groups.map(group => `
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap">${group.name}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">${Utils.formatFileSize(group.quota || 0)}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">${group.users_count || 0}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onclick="adminDashboard.editGroup(${group.id})" class="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                                            <button onclick="adminDashboard.deleteGroup(${group.id})" class="text-red-600 hover:text-red-900">Eliminar</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = '<div class="text-center py-8 text-red-500">Error al cargar grupos</div>';
        }
    }

    async openCreateUserModal() {
        const groups = await ApiService.getGroups();
        
        // Crear el modal HTML
        const modalHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div class="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 class="text-lg font-semibold mb-4">Crear Nuevo Usuario</h3>
                    <form id="createUserForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Nombre</label>
                            <input type="text" name="name" required
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" required
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Contraseña</label>
                            <input type="password" name="password" required minlength="6"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Grupo</label>
                            <select name="group" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                <option value="">Sin grupo</option>
                                ${groups.data.map(group => `
                                    <option value="${group.id}">${group.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Cuota de Almacenamiento (MB)</label>
                            <input type="number" name="quota" min="1" value="10"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        </div>
                        <div class="flex justify-end space-x-3 mt-6">
                            <button type="button" onclick="adminDashboard.closeModal()" 
                                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                                Cancelar
                            </button>
                            <button type="submit"
                                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                                Crear Usuario
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Agregar el modal al DOM
        const modalContainer = document.createElement('div');
        modalContainer.id = 'modal';
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);

        // Configurar el formulario
        const form = document.getElementById('createUserForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const userData = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password'),
                group_id: formData.get('group') || null,
                quota_mb: parseInt(formData.get('quota')) // Ya no multiplicamos por 1024*1024 porque el backend espera MB
            };

            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Creando...';

            try {
                const result = await ApiService.createUser(userData);
                if (result.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Usuario creado exitosamente',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                    this.closeModal();
                    this.loadUsersTab(); // Recargar la lista de usuarios
                } else {
                    let errorMessage = 'Error al crear usuario';
                    if (result.error && typeof result.error === 'object') {
                        // Si hay errores de validación específicos
                        errorMessage = Object.values(result.error).flat().join('\n');
                    } else if (result.message) {
                        errorMessage = result.message;
                    }
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: errorMessage,
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 4000
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de conexión',
                    text: 'No se pudo conectar con el servidor',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 4000
                });
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }

    closeModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.remove();
        }
    }

    async editUser(userId) {
        const [user, groups] = await Promise.all([
            ApiService.getUsers().then(result => result.data.find(u => u.id === userId)),
            ApiService.getGroups()
        ]);

        if (!user) {
            this.showError('No se encontró el usuario');
            return;
        }

        const modalHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div class="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 class="text-lg font-semibold mb-4">Editar Usuario</h3>
                    <form id="editUserForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Nombre</label>
                            <input type="text" name="name" required value="${user.name}"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" required value="${user.email}"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Contraseña</label>
                            <input type="password" name="password" minlength="6"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Dejar en blanco para mantener la actual">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Grupo</label>
                            <select name="group" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                <option value="">Sin grupo</option>
                                ${groups.data.map(group => `
                                    <option value="${group.id}" ${user.group_id === group.id ? 'selected' : ''}>
                                        ${group.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Cuota de Almacenamiento (MB)</label>
                            <input type="number" name="quota" min="1" value="${Math.floor(user.quota / (1024 * 1024))}"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        </div>
                        <div class="flex justify-end space-x-3 mt-6">
                            <button type="button" onclick="adminDashboard.closeModal()" 
                                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                                Cancelar
                            </button>
                            <button type="submit"
                                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const modalContainer = document.createElement('div');
        modalContainer.id = 'modal';
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);

        const form = document.getElementById('editUserForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const userData = {
                name: formData.get('name'),
                email: formData.get('email'),
                group_id: formData.get('group') || null,
                quota_mb: parseInt(formData.get('quota'))
            };

            // Solo incluir la contraseña si se ha proporcionado una nueva
            const password = formData.get('password');
            if (password) {
                userData.password = password;
            }

            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Guardando...';

            try {
                const result = await ApiService.updateUser(userId, userData);
                if (result.success) {
                    this.showSuccess('Usuario actualizado exitosamente');
                    this.closeModal();
                    this.loadUsersTab();
                } else {
                    let errorMessage = 'Error al actualizar usuario';
                    if (result.error && typeof result.error === 'object') {
                        errorMessage = Object.values(result.error).flat().join('\n');
                    } else if (result.message) {
                        errorMessage = result.message;
                    }
                    this.showError(errorMessage);
                }
            } catch (error) {
                this.showError('Error de conexión');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }

    async deleteUser(userId) {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const response = await ApiService.deleteUser(userId);
                if (response.success) {
                    this.showSuccess('Usuario eliminado exitosamente');
                    this.loadUsersTab();
                } else {
                    this.showError(response.message || 'Error al eliminar el usuario');
                }
            } catch (error) {
                this.showError('Error de conexión');
            }
        }
    }

    async openCreateGroupModal() {
        const modalHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div class="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 class="text-lg font-semibold mb-4">Crear Nuevo Grupo</h3>
                    <form id="createGroupForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Nombre</label>
                            <input type="text" name="name" required
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Cuota de Almacenamiento (MB)</label>
                            <input type="number" name="quota" min="1" value="100"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        </div>
                        <div class="flex justify-end space-x-3 mt-6">
                            <button type="button" onclick="adminDashboard.closeModal()" 
                                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                                Cancelar
                            </button>
                            <button type="submit"
                                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                                Crear Grupo
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const modalContainer = document.createElement('div');
        modalContainer.id = 'modal';
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);

        const form = document.getElementById('createGroupForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const groupData = {
                name: formData.get('name'),
                quota_mb: parseInt(formData.get('quota'))
            };

            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Creando...';

            try {
                const result = await ApiService.createGroup(groupData);
                if (result.success) {
                    this.showSuccess('Grupo creado exitosamente');
                    this.closeModal();
                    this.loadGroupsTab();
                } else {
                    let errorMessage = 'Error al crear grupo';
                    if (result.error && typeof result.error === 'object') {
                        errorMessage = Object.values(result.error).flat().join('\n');
                    } else if (result.message) {
                        errorMessage = result.message;
                    }
                    this.showError(errorMessage);
                }
            } catch (error) {
                this.showError('Error de conexión');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }

    async editGroup(groupId) {
        const group = (await ApiService.getGroups()).data.find(g => g.id === groupId);
        if (!group) {
            this.showError('No se encontró el grupo');
            return;
        }

        const modalHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div class="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 class="text-lg font-semibold mb-4">Editar Grupo</h3>
                    <form id="editGroupForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Nombre</label>
                            <input type="text" name="name" required value="${group.name}"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Cuota de Almacenamiento (MB)</label>
                            <input type="number" name="quota" min="1" value="${Math.floor(group.quota / (1024 * 1024))}"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        </div>
                        <div class="flex justify-end space-x-3 mt-6">
                            <button type="button" onclick="adminDashboard.closeModal()" 
                                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                                Cancelar
                            </button>
                            <button type="submit"
                                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const modalContainer = document.createElement('div');
        modalContainer.id = 'modal';
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);

        const form = document.getElementById('editGroupForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const groupData = {
                name: formData.get('name'),
                quota_mb: parseInt(formData.get('quota'))
            };

            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Guardando...';

            try {
                const result = await ApiService.updateGroup(groupId, groupData);
                if (result.success) {
                    this.showSuccess('Grupo actualizado exitosamente');
                    this.closeModal();
                    this.loadGroupsTab();
                } else {
                    let errorMessage = 'Error al actualizar grupo';
                    if (result.error && typeof result.error === 'object') {
                        errorMessage = Object.values(result.error).flat().join('\n');
                    } else if (result.message) {
                        errorMessage = result.message;
                    }
                    this.showError(errorMessage);
                }
            } catch (error) {
                this.showError('Error de conexión');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }

    async deleteGroup(groupId) {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const response = await ApiService.deleteGroup(groupId);
                if (response.success) {
                    this.showSuccess('Grupo eliminado exitosamente');
                    this.loadGroupsTab();
                } else {
                    this.showError(response.message || 'Error al eliminar el grupo');
                }
            } catch (error) {
                this.showError('Error de conexión');
            }
        }
    }

    async loadExtensionsTab() {
        const result = await ApiService.getForbiddenExtensions();
        const container = document.getElementById('tabContent');
        
        if (result.success) {
            const extensions = result.data;
            console.log(result.data)
            container.innerHTML = `
                <div class="bg-white shadow-md rounded-lg p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-semibold">Gestión de Extensiones Prohibidas</h2>
                        <button onclick="adminDashboard.openCreateExtensionModal()" 
                                class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                            Nueva Extensión
                        </button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr class="bg-gray-50">
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extensión</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${extensions.map(ext => `
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap">.${ext}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onclick="adminDashboard.deleteExtension('${ext}')" 
                                                    class="text-red-600 hover:text-red-900">Eliminar</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = '<div class="text-center py-8 text-red-500">Error al cargar extensiones prohibidas</div>';
        }
    }

    async openCreateExtensionModal() {
        const modalHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div class="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 class="text-lg font-semibold mb-4">Agregar Nueva Extensión Prohibida</h3>
                    <form id="createExtensionForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Extensión</label>
                            <div class="mt-1 relative rounded-md shadow-sm">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span class="text-gray-500 sm:text-sm">.</span>
                                </div>
                                <input type="text" name="extension" required
                                    class="pl-6 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="exe">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Descripción</label>
                            <textarea name="description" rows="3"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Opcional: Razón por la que se prohíbe esta extensión"></textarea>
                        </div>
                        <div class="flex justify-end space-x-3 mt-6">
                            <button type="button" onclick="adminDashboard.closeModal()" 
                                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                                Cancelar
                            </button>
                            <button type="submit"
                                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                                Agregar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const modalContainer = document.createElement('div');
        modalContainer.id = 'modal';
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);

        const form = document.getElementById('createExtensionForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const extensionData = {
                extension: formData.get('extension').toLowerCase(),
                description: formData.get('description')
            };

            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Agregando...';

            try {
                const result = await ApiService.createForbiddenExtension(extensionData);
                if (result.success) {
                    this.showSuccess('Extensión prohibida agregada exitosamente');
                    this.closeModal();
                    this.loadExtensionsTab();
                } else {
                    let errorMessage = 'Error al agregar extensión';
                    if (result.error && typeof result.error === 'object') {
                        errorMessage = Object.values(result.error).flat().join('\n');
                    } else if (result.message) {
                        errorMessage = result.message;
                    }
                    this.showError(errorMessage);
                }
            } catch (error) {
                this.showError('Error de conexión');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }

    async deleteExtension(extension) {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const response = await ApiService.deleteForbiddenExtension(extension);
                if (response.success) {
                    this.showSuccess('Extensión eliminada exitosamente');
                    this.loadExtensionsTab();
                } else {
                    this.showError(response.message || 'Error al eliminar la extensión');
                }
            } catch (error) {
                this.showError('Error de conexión');
            }
        }
    }

    async loadQuotasTab() {
        try {
            const [globalQuota, groups] = await Promise.all([
                ApiService.getGlobalQuota(),
                ApiService.getGroups()
            ]);
            
            const container = document.getElementById('tabContent');
            container.innerHTML = `
                <div class="bg-white shadow-md rounded-lg p-6">
                    <div class="mb-8">
                        <h2 class="text-xl font-semibold mb-4">Cuota Global</h2>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-600">Almacenamiento Total Disponible</p>
                                    <p class="text-2xl font-bold">${Utils.formatFileSize(globalQuota.data.global_quota || 0)}</p>
                                </div>
                                <button onclick="adminDashboard.editGlobalQuota(${globalQuota.data.global_quota})"
                                        class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                                    Editar Cuota Global
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 class="text-xl font-semibold mb-4">Cuotas por Grupo</h2>
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr class="bg-gray-50">
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuota Asignada</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Espacio Usado</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    ${groups.data.map(group => `
                                        <tr>
                                            <td class="px-6 py-4 whitespace-nowrap">${group.name}</td>
                                            <td class="px-6 py-4 whitespace-nowrap">${Utils.formatFileSize(group.quota || 0)}</td>
                                            <td class="px-6 py-4 whitespace-nowrap">${Utils.formatFileSize(group.storage_used || 0)}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button onclick="adminDashboard.editGroupQuota(${group.id}, ${group.quota})" 
                                                        class="text-blue-600 hover:text-blue-900">
                                                    Editar Cuota
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            container.innerHTML = '<div class="text-center py-8 text-red-500">Error al cargar información de cuotas</div>';
        }
    }

    async editGlobalQuota(currentQuota) {
        const { value: quota_mb } = await Swal.fire({
            title: 'Editar Cuota Global',
            input: 'number',
            inputLabel: 'Cuota en MB',
            inputValue: Math.floor(currentQuota / (1024 * 1024)),
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value || value <= 0) {
                    return 'Por favor ingrese un valor válido mayor a 0';
                }
            }
        });

        if (quota_mb) {
            try {
                const response = await ApiService.setGlobalQuota(parseInt(quota_mb));
                if (response.success) {
                    this.showSuccess('Cuota global actualizada exitosamente');
                    this.loadQuotasTab();
                } else {
                    this.showError(response.message || 'Error al actualizar la cuota global');
                }
            } catch (error) {
                this.showError('Error de conexión');
            }
        }
    }

    async editGroupQuota(groupId, currentQuota) {
        const { value: quota_mb } = await Swal.fire({
            title: 'Editar Cuota de Grupo',
            input: 'number',
            inputLabel: 'Cuota en MB',
            inputValue: Math.floor(currentQuota / (1024 * 1024)),
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value || value <= 0) {
                    return 'Por favor ingrese un valor válido mayor a 0';
                }
            }
        });

        if (quota_mb) {
            try {
                const response = await ApiService.setGroupQuota(groupId, parseInt(quota_mb));
                if (response.success) {
                    this.showSuccess('Cuota de grupo actualizada exitosamente');
                    this.loadQuotasTab();
                } else {
                    this.showError(response.message || 'Error al actualizar la cuota del grupo');
                }
            } catch (error) {
                this.showError('Error de conexión');
            }
        }
    }

    showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    }

    showError(message) {
        Swal.fire({
            icon: 'error',
            title: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true
        });
    }

    showInfo(message) {
        Swal.fire({
            icon: 'info',
            title: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    }

}

const adminDashboard = new AdminDashboard();