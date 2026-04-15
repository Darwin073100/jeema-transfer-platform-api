/**
 * Tipo para las zonas horarias más comunes. 
 * Puedes añadir más según necesites.
 */
export type TimeZone = 
  | "America/Mexico_City" 
  | "America/Tijuana" 
  | "America/New_York" 
  | "America/Los_Angeles" 
  | "UTC";

export interface DateRange {
  start: Date;
  end: Date;
}

class TimeMaster {
  private readonly timezone: TimeZone;

  constructor(timezone: TimeZone = "America/Mexico_City") {
    this.timezone = timezone;
  }

  /**
   * Obtiene la instancia de Date nativa ajustada a la zona horaria configurada.
   */
  public getInstance(): Date {
    const now = new Date();
    const localString = now.toLocaleString("en-US", { timeZone: this.timezone });
    return new Date(localString);
  }

  /**
   * Retorna fecha en formato YYYY-MM-DD
   */
  public getISODate(date: Date = this.getInstance()): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Retorna hora en formato HH:MM:SS
   */
  public getTime(date: Date = this.getInstance()): string {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  /**
   * Genera el rango completo del mes actual (desde las 00:00:00 del día 1 
   * hasta las 23:59:59 del último día).
   */
  public getCurrentMonthRange(): DateRange {
    const now = this.getInstance();
    const year = now.getFullYear();
    const month = now.getMonth();

    return {
      start: new Date(year, month, 1, 0, 0, 0),
      end: new Date(year, month + 1, 0, 23, 59, 59)
    };
  }

  /**
   * Genera el rango completo del año actual.
   */
  public getCurrentYearRange(): DateRange {
    const year = this.getInstance().getFullYear();
    return {
      start: new Date(year, 0, 1, 0, 0, 0),
      end: new Date(year, 11, 31, 23, 59, 59)
    };
  }

  /**
   * Obtiene un rango específico por mes y año.
   * @param monthIndex 0 para Enero, 11 para Diciembre.
   * @param year Opcional, por defecto el año actual.
   */
  public getCustomMonthRange(monthIndex: number, year?: number): DateRange {
    const targetYear = year ?? this.getInstance().getFullYear();
    return {
      start: new Date(targetYear, monthIndex, 1, 0, 0, 0),
      end: new Date(targetYear, monthIndex + 1, 0, 23, 59, 59)
    };
  }
}

export default TimeMaster;