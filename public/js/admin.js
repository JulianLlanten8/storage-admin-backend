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