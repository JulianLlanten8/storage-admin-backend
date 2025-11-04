class ApiService {
    static baseURL = '/api';

    static async request(endpoint, options = {}) {
        const token = localStorage.getItem('auth_token');
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        };

        const config = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            
            if (response.status === 401 || response.status === 403) {
                return {
                    success: false,
                    status: response.status,
                    message: 'No autorizado'
                };
            }

            const result = await response.json();
            
            // siempre retorna { data, message, error }
            return {
                success: response.ok,
                data: result.data,      
                message: result.message,
                error: result.error,    
                status: response.status
            };
        } catch (error) {
            console.error('🌐 Error de conexión:', error);
            return { 
                success: false, 
                error: error.message,
                status: 0 
            };
        }
    }

    // Auth endpoints
    static async login(credentials) {
        const result = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        // Para login, el token y user vienen en data
        if (result.success) {
            result.data = {
                token: result.data?.token || result.data?.access_token,
                user: result.data?.user || result.data
            };
        }
        return result;
    }

    static async logout() {
        return await this.request('/auth/logout', {
            method: 'POST'
        });
    }

    static async getUser() {
        return await this.request('/user');
    }

    // File endpoints
    static async getFiles() {
        return await this.request('/files');
    }

    static async uploadFile(formData) {
        const token = localStorage.getItem('auth_token');
        try {
            const response = await fetch(`${this.baseURL}/files/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: formData
            });
            
            const result = await response.json();
            
            return {
                success: response.ok,
                data: result.data,
                message: result.message,
                error: result.error,
                status: response.status
            };
        } catch (error) {
            console.error('Error de conexión:', error);
            return { 
                success: false, 
                error: error.message 
            };
        }
    }

    static async deleteFile(fileId) {
        return await this.request(`/files/${fileId}`, {
            method: 'DELETE'
        });
    }

    static async downloadFile(fileId) {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${this.baseURL}/files/${fileId}/download`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return response;
    }

    // Admin endpoints
    static async getUsers() {
        return await this.request('/admin/users');
    }

    static async createUser(userData) {
        return await this.request('/admin/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    static async updateUser(userId, userData) {
        return await this.request(`/admin/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    static async deleteUser(userId) {
        return await this.request(`/admin/users/${userId}`, {
            method: 'DELETE'
        });
    }

    static async assignUserGroup(userId, groupId) {
        return await this.request(`/admin/users/${userId}/group`, {
            method: 'PUT',
            body: JSON.stringify({ group_id: groupId })
        });
    }

    static async getGroups() {
        return await this.request('/admin/groups');
    }

    static async createGroup(groupData) {
        return await this.request('/admin/groups', {
            method: 'POST',
            body: JSON.stringify(groupData)
        });
    }

    static async updateGroup(groupId, groupData) {
        return await this.request(`/admin/groups/${groupId}`, {
            method: 'PUT',
            body: JSON.stringify(groupData)
        });
    }

    static async deleteGroup(groupId) {
        return await this.request(`/admin/groups/${groupId}`, {
            method: 'DELETE'
        });
    }

    static async getForbiddenExtensions() {
        return await this.request('/admin/forbidden-extensions');
    }

    static async createForbiddenExtension(extensionData) {
        return await this.request('/admin/forbidden-extensions', {
            method: 'POST',
            body: JSON.stringify(extensionData)
        });
    }

    static async deleteForbiddenExtension(extension) {
        return await this.request(`/admin/forbidden-extensions/${extension}`, {
            method: 'DELETE'
        });
    }

    static async getGlobalQuota() {
        return await this.request('/admin/quota/global');
    }

    static async setGlobalQuota(quota_mb) {
        return await this.request('/admin/quota/global', {
            method: 'PUT',
            body: JSON.stringify({ quota_mb })
        });
    }

    static async setGroupQuota(groupId, quota_mb) {
        return await this.request(`/admin/quota/group/${groupId}`, {
            method: 'PUT',
            body: JSON.stringify({ quota_mb })
        });
    }

    static async setUserQuota(userId, quota_mb) {
        return await this.request(`/admin/quota/user/${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ quota_mb })
        });
    }
}