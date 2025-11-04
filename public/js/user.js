// user.js
class UserDashboard {
    constructor() {
        this.init();
    }
    
    showError(message) {
        Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: message,
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 4000
                    });

    }

    async init() {
        if (!await Auth.checkAuth()) return;
        if (Auth.isAdmin()) {
            window.location.href = 'admin.html';
            return;
        }
        
        this.loadUserInfo();
        this.loadFiles();
        this.loadQuotaInfo();
        this.setupUpload();
    }

    loadUserInfo() {
        const user = JSON.parse(localStorage.getItem('user_data'));
        document.getElementById('userEmail').textContent = user.email;
    }

    async loadFiles() {
        try {
            const result = await ApiService.getFiles();
            
            if (result.success) {
                // Asegurar que result.data es un array
                const files = Array.isArray(result.data) ? result.data : [];
                this.renderFiles(files);
            } else {
                this.showError(result.message || 'Error al cargar archivos');
            }
        } catch (error) {
            console.error('Error al cargar archivos:', error);
            this.showError('Error al cargar los archivos');
        }
    }

    renderFiles(files) {
        const container = document.getElementById('filesList');
        
        if (!files || files.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No hay archivos subidos.</p>';
            return;
        }

        container.innerHTML = files.map(file => {
            // Validar que el archivo tenga las propiedades necesarias
            console.log(file)
            const fileName = file.original_name || 'Sin nombre';
            const fileSize = file.size != null ? Utils.formatFileSize(file.size) : 'Tamaño desconocido';
            const createdAt = file.created_at ? Utils.formatDate(file.created_at) : 'Fecha desconocida';
            const fileId = file.id || 0;

            return `
            <div class="flex justify-between items-center p-3 border border-gray-200 rounded-md">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <span class="text-blue-600 text-sm">📄</span>
                    </div>
                    <div>
                        <span class="font-medium">${Utils.escapeHtml(fileName)}</span>
                        <div class="text-xs text-gray-500">
                            ${fileSize} • ${createdAt}
                        </div>
                    </div>
                </div>
                <div class="space-x-2">
                    ${fileId ? `
                        <button onclick="userDashboard.downloadFile(${fileId})" 
                                class="text-blue-500 hover:text-blue-700 px-2 py-1 rounded">
                            Descargar
                        </button>
                        <button onclick="userDashboard.deleteFile(${fileId})" 
                                class="text-red-500 hover:text-red-700 px-2 py-1 rounded">
                            Eliminar
                        </button>
                    ` : '<span class="text-gray-400">No disponible</span>'}
                </div>
            </div>
            `;
        }).join('');
    }

    async loadQuotaInfo() {
        const result = await ApiService.getUser();
        
        if (result.success && result.data) {
            const userData = result.data;
            const quotaInfo = document.getElementById('quotaInfo');
            
            // Obtener cuota en bytes (convertir de MB)
            const quota = (userData.quota_mb || 10) * 1024 * 1024; // Convertir MB a bytes
            const used = userData.storage_used_bytes || 0;
            const percentage = Math.min((used / quota) * 100, 100);

            quotaInfo.innerHTML = `
                <div class="bg-gray-50 p-4 rounded-md">
                    <div class="flex justify-between text-sm mb-2">
                        <span class="font-medium">Espacio usado:</span>
                        <span>${Utils.formatFileSize(used)} / ${Utils.formatFileSize(quota)}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                             style="width: ${percentage}%"></div>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                        ${percentage.toFixed(1)}% utilizado
                    </div>
                </div>
            `;
        }
    }

    setupUpload() {
        const form = document.getElementById('uploadForm');
        const fileInput = document.getElementById('fileInput');
        
        form.addEventListener('submit', (e) => this.handleUpload(e));
        
        // Mostrar nombre del archivo seleccionado
        fileInput.addEventListener('change', (e) => {
            const fileName = e.target.files[0]?.name;
            if (fileName) {
                // Puedes mostrar el nombre del archivo cerca del input
                console.log('Archivo seleccionado:', fileName);
            }
        });
    }

    async handleUpload(e) {
        e.preventDefault();
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];

        if (!file) {
            Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Por favor selecciona un archivo',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 4000
                    });
            return;
        }

        const button = e.target.querySelector('button[type="submit"]');
        Utils.showLoading(button);
        button.textContent = 'Subiendo...';

        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await ApiService.uploadFile(formData);

            if (result.success) {
                Swal.fire({
                        icon: 'success',
                        title: 'Usuario creado exitosamente',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                fileInput.value = '';
                await this.loadFiles();
                await this.loadQuotaInfo();
            } else {
                let errorMessage = 'Error al subir archivo';
                if (result.error) {
                    if (typeof result.error === 'object') {
                        // Si es un objeto de errores de validación
                        errorMessage = Object.values(result.error).flat().join('\n');
                    } else {
                        errorMessage = result.error;
                    }
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
            console.error('Error al subir archivo:', error);
            Swal.fire({
                icon: 'success',
                title: 'Usuario creado exitosamente',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } finally {
            Utils.hideLoading(button);
            button.textContent = 'Subir Archivo';
        }
    }

    async downloadFile(fileId) {
        try {
            // Mostrar indicador de carga
            Swal.fire({
            title: 'Descargando...',
            text: 'Preparando archivo para descargar',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
            });

            const response = await ApiService.downloadFile(fileId);

            if (!response.ok) {
            // Si la respuesta no es 2xx, intenta extraer el mensaje de error
            let errorMessage = `Error ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (_) {}
            throw new Error(errorMessage);
            }

            const contentType = response.headers.get('content-type') || '';

            // Si el servidor responde JSON, probablemente sea un error
            if (contentType.includes('application/json')) {
            const errorData = await response.json().catch(() => ({}));
            const msg = errorData.message || 'Error inesperado al descargar el archivo';
            throw new Error(msg);
            }

            // Procesar el archivo binario
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            // Extraer el nombre del archivo desde el header Content-Disposition
            const disposition = response.headers.get('Content-Disposition') || '';
            const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
            const filename = match ? match[1].replace(/['"]/g, '') : 'archivo.descargado';

            // Crear un enlace temporal para la descarga
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();

            // Limpieza
            setTimeout(() => {
            URL.revokeObjectURL(url);
            link.remove();
            }, 100);

            // Mostrar notificación de éxito
            Swal.fire({
            icon: 'success',
            title: 'Descarga iniciada',
            text: `El archivo "${filename}" se está descargando.`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            });
        } catch (error) {
            console.error('Error al descargar archivo:', error);

            Swal.fire({
            icon: 'error',
            title: 'Error de descarga',
            text: error.message || 'Error al intentar descargar el archivo',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
            });
        }
    }


    async deleteFile(fileId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) return;

        const result = await ApiService.deleteFile(fileId);
        
        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Archivo eliminado',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            await this.loadFiles();
            await this.loadQuotaInfo();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.data?.message ?? 'Error al eliminar archivo',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 4000
            });
        }
    }
}

// Inicializar el dashboard cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.userDashboard = new UserDashboard();
});