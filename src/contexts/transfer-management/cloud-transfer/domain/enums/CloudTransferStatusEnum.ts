export enum CloudTransferStatusEnum {
    /** 
     * El JSON fue recibido en la nube, pendiente de ser descargado por la sucursal destino.
     */
    PENDING = 'Pendiente',
    /**
     * La sucursal destino lo está procesando.
     */
    IN_TRANSIT = 'En_Transito',
    /**
     * Traspaso finalizado e integrado en la BD local destino.
     */
    APPROVED = 'Aprobada',
    /**
     * Cuando la mercancia ha sido aceptada en la sucursal destino.
     */
    RECEIVED = 'Recibida',
    /**
     * Cuando la sucural destino cancela el traspaso.
     */
    CANCELLED = 'Cancelada',
    /**
     * Hubo un problema al procesar el JSON en el destino.
     */
    ERROR = 'Error',
}