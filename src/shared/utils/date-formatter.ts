/**
 * Formatea una fecha a string legible
 * Ej: 18 de septiembre de 2025, 19:14
 */
export function formatDate(date: Date | string | null | undefined): string {
    if (!date) return 'N/A';
    
    try {
        // Si es string, parseamos directamente la fecha
        if (typeof date === 'string') {
            // Extraemos la fecha y hora
            const [datePart, timePart] = date.split('T');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hour, minute] = timePart ? timePart.split(':').map(Number) : [0, 0];
            
            // Creamos la fecha usando la zona horaria local
            return new Date(year, month - 1, day, hour, minute).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // Si es objeto Date, usamos directamente los getters
        const dateObj = date;
        return new Date(
            dateObj.getFullYear(),
            dateObj.getMonth(),
            dateObj.getDate(),
            dateObj.getHours(),
            dateObj.getMinutes()
        ).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Fecha inválida';
    }
}

export const formatTime = (time: string | null | undefined) => {
    if (!time) return 'N/A';
    try {
        const dateObj = new Date(`1970-01-01T${time}`);
        return dateObj.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Hora inválida';
    }
}; // Simple HH:MM
export const formatTimeByDate = (time: Date | null | undefined) => {
    if (!time) return 'N/A';
    try {
        const dateObj = new Date(time);
        return dateObj.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (error) {
        return 'Hora inválida';
    }
}; // Simple HH:MM

export function formatDateWithOutTime(date: Date | string | null | undefined): string {
    if (!date) return 'N/A';
    
    try {
        // Si es string, parseamos directamente la fecha sin crear objeto Date
        if (typeof date === 'string') {
            // Extraemos solo la parte de la fecha (YYYY-MM-DD)
            const datePart = date.split('T')[0];
            const [year, month, day] = datePart.split('-').map(Number);
            
            // Creamos la fecha usando la zona horaria local
            return new Date(year, month - 1, day).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        // Si es objeto Date, usamos directamente los getters
        const dateObj = date;
        return new Date(
            dateObj.getFullYear(),
            dateObj.getMonth(),
            dateObj.getDate()
        ).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return 'Fecha inválida';
    }
}

/**
 * Formatea una fecha a string corto
 * Ej: 18/9/2025 
 */
export function formatDateShort(date: Date | string | null | undefined): string {
    if (!date) return 'N/A';
    
    try {
        // Si es string, parseamos directamente la fecha sin crear objeto Date
        if (typeof date === 'string') {
            // Extraemos solo la parte de la fecha (YYYY-MM-DD)
            const datePart = date.split('T')[0];
            const [year, month, day] = datePart.split('-').map(Number);
            
            // Creamos la fecha usando la zona horaria local
            return new Date(year, month - 1, day).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            });
        }

        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return new Date(
            dateObj.getFullYear(), 
            dateObj.getMonth(), 
            dateObj.getDate()
        ).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });
    } catch (error) {
        return 'Fecha inválida';
    }
}

/**
 *  Función auxiliar para formatear fechas para inputs tipo date
 */
export const formatDateForInput = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    
    try {
        // Si es string, extraemos directamente la fecha
        if (typeof date === 'string') {
            // Extraemos solo la parte de la fecha (YYYY-MM-DD)
            return date.split('T')[0];
        }
        
        // Si es objeto Date, formateamos manualmente
        const dateObj = date;
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch {
        return '';
    }
};
